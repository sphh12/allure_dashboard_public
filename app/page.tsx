import { prisma } from "@/lib/prisma";
import { Suspense } from "react";
import RunsTable from "@/components/RunsTable";
import Filters from "@/components/Filters";
import StatsBar from "@/components/StatsBar";
import OverviewCharts from "@/components/OverviewCharts";
import ThemeToggle from "@/components/ThemeToggle";

interface Props {
  searchParams: Promise<{
    platform?: string;
    status?: string;
    q?: string;
    from?: string;
    to?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: Props) {
  const sp = await searchParams;

  // 전체 runs 조회 (StatsBar용 - 필터 무관)
  const allRuns = await prisma.run.findMany({
    orderBy: { timestamp: "desc" },
    select: {
      id: true,
      timestamp: true,
      status: true,
      platform: true,
      deviceName: true,
      platformVersion: true,
      gitBranch: true,
      gitCommit: true,
      total: true,
      passed: true,
      failed: true,
      broken: true,
      skipped: true,
      durationText: true,
      remark: true,
      createdAt: true,
    },
  });

  // Run 단위로 카운트 (status 기준)
  const aggregated = allRuns.reduce(
    (acc, r) => ({
      total: acc.total + 1,
      passed: acc.passed + (r.status === "pass" ? 1 : 0),
      failed: acc.failed + (r.status === "fail" ? 1 : 0),
      broken: acc.broken + (r.status === "broken" ? 1 : 0),
      skipped: acc.skipped + (r.status === "skip" ? 1 : 0),
    }),
    { total: 0, passed: 0, failed: 0, broken: 0, skipped: 0 }
  );

  // 필터링된 runs 조회 (테이블용)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (sp.platform) {
    const platforms = sp.platform.split(",").filter(Boolean);
    where.platform = platforms.length === 1 ? platforms[0] : { in: platforms };
  }
  if (sp.status) {
    const statuses = sp.status.split(",").filter(Boolean);
    if (statuses.length === 1) {
      where.status = statuses[0];
    } else if (statuses.length > 1) {
      where.status = { in: statuses };
    }
  }
  if (sp.from || sp.to) {
    where.timestamp = {};
    // yyyy-mm-dd → yyyymmdd 변환 (DB timestamp 형식: 20260220_143000)
    if (sp.from) where.timestamp.gte = sp.from.replace(/-/g, "");
    if (sp.to) where.timestamp.lte = sp.to.replace(/-/g, "") + "_999999";
  }
  if (sp.q) {
    where.OR = [
      { timestamp: { contains: sp.q, mode: "insensitive" } },
      { gitBranch: { contains: sp.q, mode: "insensitive" } },
      { gitCommit: { contains: sp.q, mode: "insensitive" } },
      { deviceName: { contains: sp.q, mode: "insensitive" } },
      { gitMessage: { contains: sp.q, mode: "insensitive" } },
      { remark: { contains: sp.q, mode: "insensitive" } },
    ];
  }

  const hasFilter = !!(sp.platform || sp.status || sp.from || sp.to || sp.q);
  const runs = hasFilter
    ? await prisma.run.findMany({
        where,
        orderBy: { timestamp: "desc" },
        select: {
          id: true,
          timestamp: true,
          status: true,
          platform: true,
          deviceName: true,
          platformVersion: true,
          gitBranch: true,
          gitCommit: true,
          total: true,
          passed: true,
          failed: true,
          broken: true,
          skipped: true,
          durationText: true,
          remark: true,
          createdAt: true,
        },
      })
    : allRuns;

  return (
    <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-in">
      {/* 헤더 — 클릭 시 초기 화면으로 + 테마 토글 */}
      <div className="flex items-start justify-between mb-6">
        <a href="/" className="inline-block cursor-pointer px-2 py-1 -mx-2 -my-1 rounded-lg hover:bg-white/5 transition-all">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: "var(--white)" }}>
            Allure Dashboard
          </h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--muted)" }}>
            QA Test Run Monitoring
          </p>
        </a>
        <Suspense>
          <ThemeToggle />
        </Suspense>
      </div>

      {/* 통계 */}
      <div className="glass rounded-2xl p-5 sm:p-6 mb-5">
        <Suspense>
          <StatsBar stats={aggregated} />
        </Suspense>
      </div>

      {/* 차트 Overview */}
      <Suspense>
        <OverviewCharts allRuns={allRuns} allStats={aggregated} runs={runs} />
      </Suspense>

      {/* 필터 */}
      <div className="mb-5">
        <Suspense>
          <Filters />
        </Suspense>
      </div>

      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold" style={{ color: "var(--white)" }}>
          Test Runs
          <span className="ml-2 text-xs font-normal" style={{ color: "var(--muted)" }}>
            {hasFilter ? `${runs.length} of ${allRuns.length}` : `${runs.length}`}
          </span>
        </h2>
      </div>

      {/* 테이블 */}
      <RunsTable runs={runs} />
    </main>
  );
}

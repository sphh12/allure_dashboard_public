import { prisma } from "@/lib/prisma";
import { Suspense } from "react";
import RunsTable from "@/components/RunsTable";
import Filters from "@/components/Filters";
import StatsBar from "@/components/StatsBar";

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (sp.platform) where.platform = sp.platform;
  if (sp.status) where.status = sp.status;
  if (sp.from || sp.to) {
    where.timestamp = {};
    if (sp.from) where.timestamp.gte = sp.from;
    if (sp.to) where.timestamp.lte = sp.to;
  }
  if (sp.q) {
    where.OR = [
      { timestamp: { contains: sp.q, mode: "insensitive" } },
      { gitBranch: { contains: sp.q, mode: "insensitive" } },
      { gitCommit: { contains: sp.q, mode: "insensitive" } },
      { deviceName: { contains: sp.q, mode: "insensitive" } },
      { gitMessage: { contains: sp.q, mode: "insensitive" } },
    ];
  }

  const runs = await prisma.run.findMany({
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
      createdAt: true,
    },
  });

  const aggregated = runs.reduce(
    (acc, r) => ({
      total: acc.total + r.total,
      passed: acc.passed + r.passed,
      failed: acc.failed + r.failed,
      broken: acc.broken + r.broken,
      skipped: acc.skipped + r.skipped,
    }),
    { total: 0, passed: 0, failed: 0, broken: 0, skipped: 0 }
  );

  return (
    <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-in">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Allure Dashboard
          </h1>
          <p className="text-xs sm:text-sm mt-1.5" style={{ color: "var(--muted)" }}>
            QA 테스트 실행 결과 모니터링
          </p>
        </div>
        <div
          className="px-4 py-2 rounded-full text-xs font-semibold text-white self-start sm:self-auto"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
        >
          {runs.length} runs
        </div>
      </div>

      {/* 통계 */}
      <div className="glass rounded-2xl p-6 mb-6">
        <Suspense>
          <StatsBar stats={aggregated} />
        </Suspense>
      </div>

      {/* 필터 */}
      <div className="mb-6">
        <Suspense>
          <Filters />
        </Suspense>
      </div>

      {/* 테이블 */}
      <RunsTable runs={runs} />
    </main>
  );
}

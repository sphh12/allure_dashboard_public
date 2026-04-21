import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEMO_MODE, isPublicMode, maskRuns } from "@/lib/masking";

const NO_STORE_HEADERS = DEMO_MODE ? { "Cache-Control": "no-store" } : undefined;

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const platform = sp.get("platform");
  const status = sp.get("status");
  const from = sp.get("from");
  const to = sp.get("to");
  const q = sp.get("q");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (platform) {
    const platforms = platform.split(",").filter(Boolean);
    where.platform = platforms.length === 1 ? platforms[0] : { in: platforms };
  }
  if (status) {
    const statuses = status.split(",").filter(Boolean);
    where.status = statuses.length === 1 ? statuses[0] : { in: statuses };
  }
  if (from || to) {
    where.timestamp = {};
    if (from) where.timestamp.gte = from;
    if (to) where.timestamp.lte = to;
  }
  if (q) {
    where.OR = [
      { timestamp: { contains: q, mode: "insensitive" } },
      { gitBranch: { contains: q, mode: "insensitive" } },
      { gitCommit: { contains: q, mode: "insensitive" } },
      { deviceName: { contains: q, mode: "insensitive" } },
      { gitMessage: { contains: q, mode: "insensitive" } },
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

  return NextResponse.json(maskRuns(runs), { headers: NO_STORE_HEADERS });
}

export async function POST(req: NextRequest) {
  if (isPublicMode()) {
    return NextResponse.json({ error: "Read-only in public mode" }, { status: 403 });
  }
  const body = await req.json();

  const env = body.environment ?? {};
  const stats = body.stats ?? {};
  const time = body.time ?? {};
  const executor = body.executor ?? {};

  const status =
    stats.failed > 0
      ? "fail"
      : stats.broken > 0
        ? "broken"
        : stats.passed === stats.total
          ? "pass"
          : "skip";

  const runData = {
    status,
    platform: env.platform ?? null,
    deviceName: env.deviceName ?? null,
    platformVersion: env.platformVersion ?? null,
    app: env.app ?? null,
    gitBranch: env.gitBranch ?? null,
    gitCommit: env.gitCommit ?? null,
    gitMessage: env.gitMessage ?? null,
    total: stats.total ?? 0,
    passed: stats.passed ?? 0,
    failed: stats.failed ?? 0,
    broken: stats.broken ?? 0,
    skipped: stats.skipped ?? 0,
    durationMs: time.duration ?? 0,
    durationText: body.durationText ?? null,
    buildName: executor.buildName ?? null,
    suites: body.suites ?? null,
    behaviors: body.behaviors ?? null,
    packages: body.packages ?? null,
    environment: env,
  };

  const run = await prisma.run.upsert({
    where: { timestamp: body.timestamp },
    update: runData,
    create: { timestamp: body.timestamp, ...runData },
  });

  // testCases 배열이 있으면 저장
  const testCases: Array<{
    uid?: string;
    name: string;
    fullName?: string;
    status: string;
    statusMessage?: string;
    statusTrace?: string;
    description?: string;
    suite?: string;
    severity?: string;
    durationMs?: number;
    steps?: unknown;
  }> = body.testCases ?? [];

  if (testCases.length > 0) {
    // 기존 테스트 케이스 삭제 후 재생성 (upsert 대신 replace 전략)
    await prisma.testCase.deleteMany({ where: { runId: run.id } });

    await Promise.all(
      testCases.map((tc) =>
        prisma.testCase.create({
          data: {
            runId: run.id,
            uid: tc.uid ?? "",
            name: tc.name,
            fullName: tc.fullName ?? "",
            status: tc.status,
            statusMessage: tc.statusMessage ?? null,
            statusTrace: tc.statusTrace ?? null,
            description: tc.description ?? null,
            suite: tc.suite ?? null,
            severity: tc.severity ?? null,
            durationMs: tc.durationMs ?? 0,
            steps: tc.steps ?? undefined,
          },
        })
      )
    );
  }

  return NextResponse.json(run, { status: 201 });
}

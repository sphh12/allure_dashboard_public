import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const platform = sp.get("platform");
  const status = sp.get("status");
  const from = sp.get("from");
  const to = sp.get("to");
  const q = sp.get("q");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (platform) where.platform = platform;
  if (status) where.status = status;
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

  return NextResponse.json(runs);
}

export async function POST(req: NextRequest) {
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

  const run = await prisma.run.upsert({
    where: { timestamp: body.timestamp },
    update: {
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
    },
    create: {
      timestamp: body.timestamp,
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
    },
  });

  return NextResponse.json(run, { status: 201 });
}

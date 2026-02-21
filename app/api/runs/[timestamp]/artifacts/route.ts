import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ timestamp: string }> }
) {
  const { timestamp } = await params;

  const run = await prisma.run.findUnique({
    where: { timestamp },
    select: { id: true },
  });

  if (!run) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }

  const artifacts = await prisma.artifact.findMany({
    where: { runId: run.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(artifacts);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ timestamp: string }> }
) {
  const { timestamp } = await params;
  const body = await req.json();

  const run = await prisma.run.findUnique({
    where: { timestamp },
    select: { id: true },
  });

  if (!run) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }

  const items: Array<{
    type: string;
    name: string;
    source: string;
    url: string;
    contentType?: string;
    sizeBytes?: number;
  }> = Array.isArray(body) ? body : body.artifacts ?? [];

  if (items.length === 0) {
    return NextResponse.json({ error: "No artifacts provided" }, { status: 400 });
  }

  // upsert: source 기준 중복 방지
  const results = await Promise.all(
    items.map((item) =>
      prisma.artifact.upsert({
        where: {
          runId_source: {
            runId: run.id,
            source: item.source,
          },
        },
        update: {
          type: item.type,
          name: item.name,
          url: item.url,
          contentType: item.contentType ?? null,
          sizeBytes: item.sizeBytes ?? null,
        },
        create: {
          runId: run.id,
          type: item.type,
          name: item.name,
          source: item.source,
          url: item.url,
          contentType: item.contentType ?? null,
          sizeBytes: item.sizeBytes ?? null,
        },
      })
    )
  );

  return NextResponse.json({ saved: results.length }, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ timestamp: string }> }
) {
  const { timestamp } = await params;

  const run = await prisma.run.findUnique({
    where: { timestamp },
    include: { artifacts: true, testCases: { include: { artifacts: true } } },
  });

  if (!run) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(run);
}

export async function PATCH(
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
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // 허용된 필드만 업데이트
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = {};
  const allowed = ["gitMessage", "gitBranch", "gitCommit", "deviceName", "platform", "platformVersion", "remark"];
  for (const key of allowed) {
    if (key in body) {
      // remark는 빈 문자열이면 null로 저장 (삭제 처리)
      if (key === "remark") {
        data[key] = body[key]?.trim() || null;
      } else {
        data[key] = body[key];
      }
    }
  }

  const updated = await prisma.run.update({
    where: { id: run.id },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ timestamp: string }> }
) {
  const { timestamp } = await params;

  const run = await prisma.run.findUnique({
    where: { timestamp },
    select: { id: true },
  });

  if (!run) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.run.delete({ where: { id: run.id } });

  return NextResponse.json({ deleted: timestamp });
}

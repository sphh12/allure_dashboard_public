import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ timestamp: string }> }
) {
  const { timestamp } = await params;

  const run = await prisma.run.findUnique({
    where: { timestamp },
    include: { artifacts: true },
  });

  if (!run) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(run);
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

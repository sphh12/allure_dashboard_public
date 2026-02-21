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

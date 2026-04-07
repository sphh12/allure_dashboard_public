import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/trigger?status=pending
 * 대기 중인 트리거 목록 조회 (로컬 폴링용)
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const status = sp.get("status") || "pending";

  const triggers = await prisma.triggerRequest.findMany({
    where: { status },
    orderBy: { createdAt: "asc" }, // 오래된 것부터
    take: 10,
  });

  return NextResponse.json({ triggers });
}

/**
 * POST /api/trigger
 * 새로운 테스트 트리거 생성
 *
 * Body:
 *   {
 *     "platform": "android" | "ios",    (선택, 기본: "android")
 *     "testTarget": "local_transfer",   (선택, 기본: null → 전체)
 *     "marker": "smoke",               (선택)
 *     "requestedBy": "홍길동"           (선택)
 *   }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const trigger = await prisma.triggerRequest.create({
      data: {
        platform: body.platform || "android",
        testTarget: body.testTarget || null,
        marker: body.marker || null,
        requestedBy: body.requestedBy || null,
      },
    });

    return NextResponse.json(
      { message: "트리거 생성 완료", trigger },
      { status: 201 }
    );
  } catch (error) {
    console.error("[trigger] POST error:", error);
    return NextResponse.json(
      { error: "트리거 생성 실패" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/trigger
 * 트리거 상태 업데이트
 *
 * Body:
 *   {
 *     "id": "trigger_id",
 *     "status": "running" | "complete" | "failed",
 *     "result": { ... },   (선택, 실행 결과)
 *     "runId": "..."       (선택, 대시보드 Run ID)
 *   }
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, result, runId } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "id와 status는 필수입니다" },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = { status };
    if (result !== undefined) data.result = result;
    if (runId !== undefined) data.runId = runId;

    const trigger = await prisma.triggerRequest.update({
      where: { id },
      data,
    });

    return NextResponse.json({ message: "상태 업데이트 완료", trigger });
  } catch (error) {
    console.error("[trigger] PATCH error:", error);
    return NextResponse.json(
      { error: "상태 업데이트 실패" },
      { status: 500 }
    );
  }
}

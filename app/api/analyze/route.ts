import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

function getClient(): Anthropic {
  // AI Gateway 우선, 없으면 직접 API 키 사용
  const gatewayKey = process.env.AI_GATEWAY_API_KEY;
  const directKey = process.env.ANTHROPIC_API_KEY;

  if (gatewayKey) {
    return new Anthropic({
      apiKey: gatewayKey,
      baseURL: "https://ai-gateway.vercel.sh",
    });
  }
  if (directKey) {
    return new Anthropic({ apiKey: directKey });
  }
  throw new Error("AI_GATEWAY_API_KEY 또는 ANTHROPIC_API_KEY 미설정");
}

// AI Gateway 사용 시 모델명에 provider prefix 필요
function getModel(): string {
  if (process.env.AI_GATEWAY_API_KEY) {
    return "anthropic/claude-sonnet-4-6";
  }
  return "claude-sonnet-4-6";
}

export async function POST(req: NextRequest) {
  let client: Anthropic;
  try {
    client = getClient();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }

  const body = await req.json();
  const {
    testName,
    errorMessage,
    statusTrace,
    screenshotUrl,
    pageSourceSnippet,
  } = body;

  // 메시지 구성
  const contentBlocks: Anthropic.Messages.ContentBlockParam[] = [];

  // 텍스트 프롬프트
  let prompt = `당신은 모바일 앱 QA 자동화 테스트 분석 전문가입니다.
아래 실패한 테스트 케이스를 분석하고, **이슈 발생 사유**와 **수정 방향**을 간결하게 한국어로 설명해주세요.

## 테스트 정보
- **테스트명**: ${testName || "N/A"}
- **에러 메시지**: ${errorMessage || "N/A"}
`;

  if (statusTrace) {
    const traceSnippet = statusTrace.slice(0, 1500);
    prompt += `\n## 스택 트레이스 (앞부분)\n\`\`\`\n${traceSnippet}\n\`\`\`\n`;
  }

  if (pageSourceSnippet) {
    prompt += `\n## Page Source (일부)\n\`\`\`xml\n${pageSourceSnippet.slice(0, 1000)}\n\`\`\`\n`;
  }

  prompt += `\n## 요청사항
1. **이슈 발생 사유**: 왜 이 테스트가 실패했는지 (1~2문장)
2. **수정 방향**: 어떻게 수정하면 되는지 (구체적 액션, 1~3줄)

간결하게 답변해주세요.`;

  contentBlocks.push({ type: "text", text: prompt });

  // 스크린샷이 있으면 이미지 분석 추가
  if (screenshotUrl) {
    try {
      const imgRes = await fetch(screenshotUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        const contentType = imgRes.headers.get("content-type") || "image/png";
        contentBlocks.push({
          type: "image",
          source: {
            type: "base64",
            media_type: contentType as "image/png" | "image/jpeg" | "image/gif" | "image/webp",
            data: base64,
          },
        });
        contentBlocks.push({
          type: "text",
          text: "위 스크린샷은 테스트 실패 시점의 앱 화면입니다. 화면 상태도 참고하여 분석해주세요.",
        });
      }
    } catch {
      // 스크린샷 로드 실패 시 무시
    }
  }

  try {
    const message = await client.messages.create({
      model: getModel(),
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: contentBlocks,
        },
      ],
    });

    const text =
      message.content
        .filter((b): b is Anthropic.Messages.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n") || "분석 결과 없음";

    return NextResponse.json({ analysis: text });
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e);
    console.error("[analyze] Claude API 오류:", errMsg);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

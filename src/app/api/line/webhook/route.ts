import { NextRequest, NextResponse } from "next/server";
import { verifyLineWebhook, sendTextMessage } from "@/lib/line-messaging";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-line-signature");

    if (!signature) {
      console.error("LINE 시그니처가 없습니다.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 웹훅 검증
    if (!verifyLineWebhook(body, signature)) {
      console.error("LINE 웹훅 검증 실패");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const events = JSON.parse(body).events;

    for (const event of events) {
      if (event.type === "message" && event.message.type === "text") {
        const userId = event.source.userId;
        const messageText = event.message.text;

        console.log(`LINE 메시지 수신: ${userId} - ${messageText}`);

        // 메시지 처리 로직
        await handleLineMessage(userId, messageText);
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("LINE 웹훅 처리 오류:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

async function handleLineMessage(userId: string, message: string) {
  try {
    let response = "";

    // 간단한 챗봇 응답
    if (message.includes("안녕") || message.includes("hello")) {
      response = "안녕하세요! MalMoi 한국어 학습 플랫폼입니다. 😊";
    } else if (message.includes("수업") || message.includes("class")) {
      response = "수업 관련 문의는 관리자에게 연락해주세요. 📚";
    } else if (message.includes("출석") || message.includes("attendance")) {
      response = "출석 확인은 수업 시간에 태깅 시스템을 이용해주세요. ✅";
    } else if (message.includes("도움") || message.includes("help")) {
      response = `도움말:
📚 수업 문의
✅ 출석 확인
📞 관리자 연락
🌐 웹사이트: https://hanguru.school`;
    } else {
      response =
        "메시지를 받았습니다. 더 자세한 정보는 웹사이트를 확인해주세요: https://hanguru.school";
    }

    await sendTextMessage(userId, response);
  } catch (error) {
    console.error("LINE 메시지 처리 오류:", error);
  }
}

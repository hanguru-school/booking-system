import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Line Messaging API 설정
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;

// Line Messaging API 클라이언트
class LineMessagingClient {
  private accessToken: string;
  private channelSecret: string;

  constructor() {
    this.accessToken = LINE_CHANNEL_ACCESS_TOKEN || "";
    this.channelSecret = LINE_CHANNEL_SECRET || "";
  }

  // 메시지 전송
  async sendMessage(userId: string, message: string): Promise<boolean> {
    try {
      const response = await fetch("https://api.line.me/v2/bot/message/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          to: userId,
          messages: [
            {
              type: "text",
              text: message,
            },
          ],
        }),
      });

      return response.ok;
    } catch (error) {
      console.error("Line 메시지 전송 오류:", error);
      return false;
    }
  }

  // 멀티캐스트 메시지 전송
  async sendMulticast(userIds: string[], message: string): Promise<boolean> {
    try {
      const response = await fetch("https://api.line.me/v2/bot/message/multicast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          to: userIds,
          messages: [
            {
              type: "text",
              text: message,
            },
          ],
        }),
      });

      return response.ok;
    } catch (error) {
      console.error("Line 멀티캐스트 메시지 전송 오류:", error);
      return false;
    }
  }

  // 템플릿 메시지 전송
  async sendTemplateMessage(userId: string, template: any): Promise<boolean> {
    try {
      const response = await fetch("https://api.line.me/v2/bot/message/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          to: userId,
          messages: [template],
        }),
      });

      return response.ok;
    } catch (error) {
      console.error("Line 템플릿 메시지 전송 오류:", error);
      return false;
    }
  }

  // 웹훅 검증
  verifyWebhook(body: string, signature: string): boolean {
    const hash = crypto
      .createHmac("SHA256", this.channelSecret)
      .update(body)
      .digest("base64");

    return hash === signature;
  }

  // 웹훅 이벤트 처리
  async handleWebhook(body: any): Promise<void> {
    try {
      for (const event of body.events) {
        await this.processEvent(event);
      }
    } catch (error) {
      console.error("Line 웹훅 처리 오류:", error);
    }
  }

  // 이벤트 처리
  private async processEvent(event: any): Promise<void> {
    switch (event.type) {
      case "message":
        await this.handleMessageEvent(event);
        break;
      case "follow":
        await this.handleFollowEvent(event);
        break;
      case "unfollow":
        await this.handleUnfollowEvent(event);
        break;
      case "join":
        await this.handleJoinEvent(event);
        break;
      case "leave":
        await this.handleLeaveEvent(event);
        break;
      default:
        console.log("처리되지 않은 이벤트 타입:", event.type);
    }
  }

  // 메시지 이벤트 처리
  private async handleMessageEvent(event: any): Promise<void> {
    const { message, replyToken } = event;
    
    if (message.type === "text") {
      // 텍스트 메시지 처리
      const response = await this.generateResponse(message.text);
      await this.replyMessage(replyToken, response);
    }
  }

  // 팔로우 이벤트 처리
  private async handleFollowEvent(event: any): Promise<void> {
    const welcomeMessage = "안녕하세요! 환영합니다. 🎉";
    await this.replyMessage(event.replyToken, welcomeMessage);
  }

  // 언팔로우 이벤트 처리
  private async handleUnfollowEvent(event: any): Promise<void> {
    console.log("사용자가 언팔로우했습니다:", event.source.userId);
  }

  // 그룹 참여 이벤트 처리
  private async handleJoinEvent(event: any): Promise<void> {
    const welcomeMessage = "그룹에 참여해주셔서 감사합니다! 👋";
    await this.replyMessage(event.replyToken, welcomeMessage);
  }

  // 그룹 나가기 이벤트 처리
  private async handleLeaveEvent(event: any): Promise<void> {
    console.log("그룹에서 나갔습니다:", event.source.groupId);
  }

  // 응답 메시지 전송
  private async replyMessage(replyToken: string, message: string): Promise<void> {
    try {
      await fetch("https://api.line.me/v2/bot/message/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          replyToken,
          messages: [
            {
              type: "text",
              text: message,
            },
          ],
        }),
      });
    } catch (error) {
      console.error("Line 응답 메시지 전송 오류:", error);
    }
  }

  // 응답 생성
  private async generateResponse(userMessage: string): Promise<string> {
    // 간단한 응답 로직 (실제로는 AI나 데이터베이스에서 응답을 생성)
    const responses = [
      "안녕하세요! 무엇을 도와드릴까요?",
      "질문이 있으시면 언제든 말씀해주세요.",
      "도움이 필요하시면 연락주세요.",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }
}

// Line Messaging 클라이언트 인스턴스
const lineClient = new LineMessagingClient();

// 웹훅 검증 함수 (별도 export)
export function verifyLineWebhook(body: string, signature: string): boolean {
  return lineClient.verifyWebhook(body, signature);
}

// 텍스트 메시지 전송 함수 (별도 export)
export async function sendTextMessage(userId: string, message: string): Promise<boolean> {
  return await lineClient.sendMessage(userId, message);
}

// API 라우트 핸들러
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-line-signature");

    if (!signature) {
      return NextResponse.json({ error: "서명이 없습니다." }, { status: 400 });
    }

    // 웹훅 검증
    if (!lineClient.verifyWebhook(body, signature)) {
      return NextResponse.json({ error: "서명이 유효하지 않습니다." }, { status: 401 });
    }

    // 웹훅 이벤트 처리
    const events = JSON.parse(body);
    await lineClient.handleWebhook(events);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Line 웹훅 처리 오류:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

// 메시지 전송 API
export async function sendLineMessage(userId: string, message: string): Promise<boolean> {
  return await lineClient.sendMessage(userId, message);
}

// 멀티캐스트 메시지 전송 API
export async function sendLineMulticast(userIds: string[], message: string): Promise<boolean> {
  return await lineClient.sendMulticast(userIds, message);
}

export default lineClient;

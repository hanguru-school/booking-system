import { NextRequest, NextResponse } from "next/server";
import UIDTaggingSystem from "@/lib/uid-tagging-system";

const taggingSystem = UIDTaggingSystem.getInstance();

export async function POST(request: NextRequest) {
  try {
    const { uid, userId, userType } = await request.json();

    if (!uid || !userId || !userType) {
      return NextResponse.json(
        { error: "UID, 사용자 ID, 사용자 타입이 필요합니다." },
        { status: 400 },
      );
    }

    // UID와 사용자 연결
    const success = await taggingSystem.linkUIDToUser(uid, userId, userType);

    if (success) {
      return NextResponse.json({
        success: true,
        message: "UID가 성공적으로 연결되었습니다.",
      });
    } else {
      return NextResponse.json(
        { error: "UID 연결에 실패했습니다." },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("UID registration API error:", error);
    return NextResponse.json(
      { error: "UID 등록 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

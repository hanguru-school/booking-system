import { NextRequest, NextResponse } from "next/server";
import UIDTaggingSystem from "@/lib/uid-tagging-system";

const taggingSystem = UIDTaggingSystem.getInstance();

export async function POST(request: NextRequest) {
  try {
    const { uid, deviceType, location } = await request.json();

    if (!uid || !deviceType || !location) {
      return NextResponse.json(
        { error: "UID, 디바이스 타입, 위치 정보가 필요합니다." },
        { status: 400 },
      );
    }

    // 태깅 처리
    const result = await taggingSystem.processTagging(
      uid,
      deviceType,
      location,
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Tagging API error:", error);
    return NextResponse.json(
      { error: "태깅 처리 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

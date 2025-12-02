import { NextRequest, NextResponse } from "next/server";
import UIDTaggingSystem from "@/lib/uid-tagging-system";

const taggingSystem = UIDTaggingSystem.getInstance();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const userType = searchParams.get("userType");
    const action = searchParams.get("action");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "시작일과 종료일이 필요합니다." },
        { status: 400 },
      );
    }

    // 태깅 통계 조회
    const stats = await taggingSystem.getTaggingStats(
      new Date(startDate),
      new Date(endDate),
      userType as "student" | "staff" | "teacher" | undefined,
      action || undefined,
    );

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Tagging stats API error:", error);
    return NextResponse.json(
      { error: "통계 조회 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

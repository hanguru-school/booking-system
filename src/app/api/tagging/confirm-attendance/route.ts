import { NextRequest, NextResponse } from "next/server";
import UIDTaggingSystem from "@/lib/uid-tagging-system";

const taggingSystem = UIDTaggingSystem.getInstance();

export async function POST(request: NextRequest) {
  try {
    const { uid, reservationId, points } = await request.json();

    if (!uid) {
      return NextResponse.json({ error: "UID가 필요합니다." }, { status: 400 });
    }

    // 출석 확인 처리
    const result = await taggingSystem.confirmAttendance(
      uid,
      reservationId,
      points || 10,
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Attendance confirmation API error:", error);
    return NextResponse.json(
      { error: "출석 확인 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromCookies(request);
    
    // 관리자만 조회 가능
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "권한이 없습니다." },
        { status: 403 }
      );
    }

    const [
      students,
      teachers,
      reservations,
      inquiries,
      trialLessons,
      payments,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.reservation.count(),
      prisma.contactInquiry.count(),
      prisma.trialLessonRequest.count(),
      prisma.payment.count(),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        students,
        teachers,
        reservations,
        inquiries,
        trialLessons,
        payments,
      },
    });
  } catch (error) {
    console.error("통계 조회 오류:", error);
    return NextResponse.json(
      { error: "통계 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}




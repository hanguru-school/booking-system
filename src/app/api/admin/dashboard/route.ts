import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth-utils";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const session = await getSessionFromCookies(request);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    // 관리자 권한 확인
    if (session.user.role !== "ADMIN" && session.user.role !== "MASTER") {
      return NextResponse.json(
        { success: false, message: "관리자 권한이 필요합니다." },
        { status: 403 }
      );
    }

    // 대시보드 통계 데이터 수집
    const [
      totalStudents,
      totalTeachers,
      totalReservations,
      totalRevenue
    ] = await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.reservation.count(),
      prisma.payment.aggregate({
        _sum: {
          amount: true
        }
      })
    ]);

    // 최근 활동 데이터 (최근 5개)
    const recentActivities = await prisma.reservation.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        student: {
          include: {
            user: true
          }
        },
        teacher: {
          include: {
            user: true
          }
        }
      }
    });

    // 활동 데이터 포맷팅
    const formattedActivities = recentActivities.map(activity => ({
      id: activity.id,
      type: "reservation",
      title: "예약 생성",
      description: `${activity.student?.user?.name || '학생'}님이 ${activity.teacher?.user?.name || '선생님'}과의 수업을 예약했습니다.`,
      timestamp: formatTimeAgo(activity.createdAt),
      status: "success",
      icon: "Calendar"
    }));

    const stats = {
      totalStudents,
      totalTeachers,
      totalRevenue: totalRevenue._sum.amount || 0,
      activeLessons: totalReservations,
      pendingReviews: 0, // 리뷰 테이블이 있다면 실제 카운트
      systemHealth: "good" as const,
      monthlyGrowth: 0, // 월별 성장률 계산 로직 필요
      attendanceRate: 0, // 출석률 계산 로직 필요
    };

    return NextResponse.json({
      success: true,
      stats,
      recentActivities: formattedActivities
    });

  } catch (error) {
    console.error("대시보드 데이터 로딩 실패:", error);
    return NextResponse.json(
      { success: false, message: "데이터를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds}초 전`;
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}분 전`;
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  } else {
    return `${Math.floor(diffInSeconds / 86400)}일 전`;
  }
}

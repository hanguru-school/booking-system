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

    // 통계 데이터 수집
    const [
      totalStudents,
      totalTeachers,
      totalReservations,
      totalRevenue,
      students,
      teachers,
      reservations
    ] = await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.reservation.count(),
      prisma.payment.aggregate({
        _sum: {
          amount: true
        }
      }),
      prisma.student.findMany({
        include: {
          user: true
        }
      }),
      prisma.teacher.findMany({
        include: {
          user: true
        }
      }),
      prisma.reservation.findMany({
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
      })
    ]);

    // 기본 통계 데이터
    const statistics = {
      overview: {
        totalStudents,
        totalTeachers,
        totalRevenue: totalRevenue._sum.amount || 0,
        activeLessons: totalReservations,
        monthlyGrowth: 0, // 월별 성장률 계산 로직 필요
        attendanceRate: 0, // 출석률 계산 로직 필요
      },
      trends: {
        studentGrowth: [], // 월별 학생 증가 추이
        revenueGrowth: [], // 월별 수익 증가 추이
        lessonCompletion: [], // 월별 수업 완료율
      },
      demographics: {
        ageGroups: [], // 연령대별 분포
        levels: [], // 레벨별 분포
        subjects: [], // 과목별 분포
      },
      performance: {
        teacherRatings: [], // 강사별 평점
        topStudents: [], // 상위 학생들
        popularCourses: [], // 인기 코스
      },
    };

    return NextResponse.json({
      success: true,
      statistics
    });

  } catch (error) {
    console.error("통계 데이터 로딩 실패:", error);
    return NextResponse.json(
      { success: false, message: "데이터를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

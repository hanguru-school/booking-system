import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    // 인증 확인 (선택적)
    const session = getSessionFromCookies(request);
    let userRole = null;
    let userId = null;

    if (session) {
      userId = session.user.id;
      userRole = session.user.role;
    }

    // 날짜 범위 필터 (선택적) - 최근 3개월로 제한하여 성능 개선
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    
    const whereClause: any = {};
    
    // 날짜 범위가 지정되지 않은 경우, 최근 3개월로 제한
    if (!startDate || !endDate) {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      whereClause.date = {
        gte: threeMonthsAgo,
      };
    } else {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // 사용자 역할에 따른 예약 조회
    let reservations;

    if (!session || userRole === "ADMIN") {
      // 관리자이거나 세션이 없는 경우 모든 예약 조회 (관리자 대시보드용)
      reservations = await prisma.reservation.findMany({
        where: whereClause,
        include: {
          student: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
          teacher: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          date: "desc",
        },
        take: 1000, // 최대 1000개로 제한
      });
    } else if (userRole === "STUDENT") {
      // 학생은 자신의 예약만 조회
      const student = await prisma.student.findUnique({
        where: { userId: userId },
      });

      if (!student) {
        return NextResponse.json(
          { error: "Student not found" },
          { status: 404 },
        );
      }

      reservations = await prisma.reservation.findMany({
        where: {
          studentId: student.id,
          ...whereClause,
        },
        include: {
          teacher: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          date: "desc",
        },
        take: 1000,
      });
    } else if (userRole === "TEACHER") {
      // 선생님은 자신의 예약만 조회
      const teacher = await prisma.teacher.findUnique({
        where: { userId: userId },
      });

      if (!teacher) {
        return NextResponse.json(
          { error: "Teacher not found" },
          { status: 404 },
        );
      }

      reservations = await prisma.reservation.findMany({
        where: {
          teacherId: teacher.id,
          ...whereClause,
        },
        include: {
          student: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          date: "desc",
        },
        take: 1000,
      });
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      reservations: reservations.map((reservation) => {
        // 날짜를 로컬 시간대로 변환 (시간대 변환 없이 DB에 저장된 날짜 그대로 사용)
        // DB의 DateTime은 UTC로 저장되지만, 실제로는 로컬 시간대로 저장되어야 함
        const date = new Date(reservation.date);
        // getFullYear(), getMonth(), getDate()는 로컬 시간대 기준
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // getMonth()는 0부터 시작
        const day = date.getDate();
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        // 시간을 로컬 시간대로 변환 (getHours(), getMinutes()는 로컬 시간대 기준)
        const startTime = new Date(reservation.startTime);
        const startHours = startTime.getHours();
        const startMinutes = startTime.getMinutes();
        const startTimeStr = `${String(startHours).padStart(2, '0')}:${String(startMinutes).padStart(2, '0')}`;
        
        const endTime = new Date(reservation.endTime);
        const endHours = endTime.getHours();
        const endMinutes = endTime.getMinutes();
        const endTimeStr = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
        
        console.log('예약 데이터 변환:', {
          원본_date: reservation.date,
          원본_startTime: reservation.startTime,
          변환된_date: dateStr,
          변환된_startTime: startTimeStr,
          변환된_endTime: endTimeStr,
          로컬시간_date: `${year}-${month}-${day}`,
          로컬시간_startTime: `${startHours}:${startMinutes}`
        });
        
        return {
          id: reservation.id,
          date: dateStr,
          startTime: startTimeStr,
          endTime: endTimeStr,
          studentName: reservation.student?.user?.name || reservation.student?.name || "알 수 없음",
          serviceName: reservation.lessonType || "수업",
          teacherName: reservation.teacher?.user?.name || reservation.teacher?.name || "미배정",
          status: reservation.status.toLowerCase(),
          isCompleted: reservation.status === "COMPLETED",
          isTagged: false,
          duration: reservation.duration,
          location: reservation.location,
          notes: reservation.notes,
          createdAt: reservation.createdAt.toISOString(),
        };
      }),
    });
  } catch (error) {
    console.error("예약 목록 조회 오류:", error);
    return NextResponse.json(
      { error: "Failed to fetch reservations" },
      { status: 500 },
    );
  }
}

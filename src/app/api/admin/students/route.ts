import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromCookies(request);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    // 학생 목록 조회 (모든 상태 포함)
    const students = await prisma.student.findMany({
      include: {
        user: {
          select: {
            email: true,
          }
        },
        reservations: {
          include: {
            teacher: {
              select: {
                name: true,
                kanjiName: true,
              }
            }
          },
          orderBy: {
            date: 'desc',
          },
          take: 1, // 최근 예약 1개만
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 출석률 계산을 위한 예약 데이터
    const allReservations = await prisma.reservation.findMany({
      where: {
        studentId: { in: students.map(s => s.id) }
      },
      select: {
        studentId: true,
        status: true,
        date: true,
      }
    });

    // 학생별 출석률 계산
    const attendanceMap = new Map<string, { total: number; attended: number; lastDate: Date | null }>();
    allReservations.forEach(reservation => {
      const existing = attendanceMap.get(reservation.studentId) || { total: 0, attended: 0, lastDate: null };
      existing.total++;
      if (reservation.status === 'COMPLETED') {
        existing.attended++;
      }
      if (!existing.lastDate || reservation.date > existing.lastDate) {
        existing.lastDate = reservation.date;
      }
      attendanceMap.set(reservation.studentId, existing);
    });

    // 응답 데이터 형식 변환
    const formattedStudents = students.map((student) => {
      const attendance = attendanceMap.get(student.id) || { total: 0, attended: 0, lastDate: null };
      const attendanceRate = attendance.total > 0 
        ? Math.round((attendance.attended / attendance.total) * 100) 
        : 0;
      
      // 최근 예약에서 코스와 강사 정보 가져오기
      const recentReservation = student.reservations[0];
      const course = recentReservation?.lessonType || '';
      const teacher = recentReservation?.teacher 
        ? (recentReservation.teacher.kanjiName || recentReservation.teacher.name)
        : '';

      // 남은 시간 계산 (예약에서 계산하거나 기본값 0)
      const remainingHours = 0; // TODO: 실제 남은 시간 계산 로직 필요

      return {
        id: student.id,
        name: student.kanjiName || student.name,
        kanjiName: student.kanjiName,
        yomigana: student.yomigana,
        koreanName: student.koreanName,
        email: student.email || student.user?.email || "",
        phone: student.phone || "",
        level: student.level || "초급 A",
        course: course,
        teacher: teacher,
        status: student.status?.toLowerCase() === 'active' ? 'active' 
          : student.status?.toLowerCase() === 'inactive' ? 'inactive'
          : student.status?.toLowerCase() === 'graduated' ? 'graduated'
          : student.status?.toLowerCase() === 'suspended' ? 'suspended'
          : 'active',
        attendanceRate: attendanceRate,
        remainingHours: remainingHours,
        lastAttendance: attendance.lastDate ? attendance.lastDate.toISOString() : null,
        enrollmentDate: student.registrationDate?.toISOString() || student.joinDate?.toISOString() || null,
        // 긴급연락처/보호자 정보
        isMinor: student.isMinor || false,
        emergencyContactNameKanji: student.emergencyContactNameKanji,
        emergencyContactNameYomigana: student.emergencyContactNameYomigana,
        emergencyContactPhone: student.emergencyContactPhone,
        emergencyContactRelation: student.emergencyContactRelation,
        emergencyContactEmail: student.emergencyContactEmail,
        parentNameKanji: student.parentNameKanji,
        parentNameYomigana: student.parentNameYomigana,
        parentPhone: student.parentPhone,
        parentRelation: student.parentRelation,
      };
    });

    return NextResponse.json({
      success: true,
      students: formattedStudents,
    });
  } catch (error) {
    console.error("학생 목록 조회 오류:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 
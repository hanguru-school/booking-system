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

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    const where: any = {};
    if (studentId) {
      where.studentId = studentId;
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        student: {
          include: {
            user: true,
          },
        },
        teacher: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    const formattedLessons = reservations.map((reservation: any) => ({
      id: reservation.id,
      studentId: reservation.studentId,
      studentName: reservation.student?.user?.name || reservation.student?.name || '알 수 없음',
      date: reservation.date ? new Date(reservation.date).toISOString().split('T')[0] : '',
      startTime: reservation.startTime ? new Date(reservation.startTime).toTimeString().split(' ')[0].substring(0, 5) : '',
      endTime: reservation.endTime ? new Date(reservation.endTime).toTimeString().split(' ')[0].substring(0, 5) : '',
      teacherName: reservation.teacher?.user?.name || reservation.teacher?.name || '미배정',
      courseName: reservation.lessonType || '미정',
      status: reservation.status || 'PENDING',
      notes: reservation.notes || '',
    }));

    return NextResponse.json({
      success: true,
      lessons: formattedLessons,
    });
  } catch (error) {
    console.error("학생 수업 정보 조회 오류:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}


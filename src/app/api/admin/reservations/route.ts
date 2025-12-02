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

    // 예약 목록 조회
    const reservations = await prisma.reservation.findMany({
      include: {
        student: {
          select: {
            name: true,
            id: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    console.log("실제 예약 데이터:", reservations);

    // 응답 데이터 형식 변환 (로컬 시간대 기준으로 올바르게 포맷팅)
    const formattedReservations = reservations.map((reservation: any) => {
      // 날짜를 로컬 시간대 기준으로 포맷팅 (UTC 변환 방지)
      let dateStr = "";
      if (reservation.date) {
        const date = new Date(reservation.date);
        // 로컬 시간대의 연, 월, 일을 직접 사용
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        dateStr = `${year}-${month}-${day}`;
      }

      // 시간을 로컬 시간대 기준으로 포맷팅
      let timeStr = "";
      if (reservation.startTime) {
        const time = new Date(reservation.startTime);
        // 로컬 시간대의 시, 분을 직접 사용
        const hours = String(time.getHours()).padStart(2, '0');
        const minutes = String(time.getMinutes()).padStart(2, '0');
        timeStr = `${hours}:${minutes}`;
      }

      return {
        id: reservation.id,
        studentName: reservation.student?.name || "알 수 없음",
        studentId: reservation.student?.id || "알 수 없음",
        courseName: reservation.lessonType || "미정",
        teacherName: "미배정",
        date: dateStr,
        startTime: reservation.startTime ? new Date(reservation.startTime).toISOString() : "",
        endTime: reservation.endTime ? new Date(reservation.endTime).toISOString() : "",
        time: timeStr,
        duration: reservation.duration || 60,
        status: reservation.status || "PENDING",
        price: reservation.price || 0,
        paymentStatus: "UNPAID",
        notes: reservation.notes || "",
        createdAt: reservation.createdAt ? new Date(reservation.createdAt).toISOString().split('T')[0] : "",
      };
    });

    return NextResponse.json({
      success: true,
      reservations: formattedReservations,
    });
  } catch (error) {
    console.error("예약 목록 조회 오류:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromCookies(request);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      studentId,
      courseName,
      teacherName,
      date,
      time,
      duration,
      price,
      notes,
    } = body;

    // 날짜와 시간을 로컬 시간대로 명시적으로 파싱
    // date 형식: "YYYY-MM-DD", time 형식: "HH:mm"
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    
    // 로컬 시간대로 Date 객체 생성 (시간대 변환 없이 입력값 그대로 사용)
    // new Date(year, month-1, day, hours, minutes)는 로컬 시간대로 생성됨
    const startTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
    const endTime = new Date(startTime.getTime() + (duration || 60) * 60 * 1000);
    
    console.log("예약 시간 파싱:", {
      입력: { date, time, duration },
      파싱된_날짜: { year, month, day, hours, minutes },
      startTime_ISO: startTime.toISOString(),
      startTime_로컬: `${startTime.getFullYear()}-${String(startTime.getMonth() + 1).padStart(2, '0')}-${String(startTime.getDate()).padStart(2, '0')} ${String(startTime.getHours()).padStart(2, '0')}:${String(startTime.getMinutes()).padStart(2, '0')}`,
      endTime_ISO: endTime.toISOString(),
    });

    // 예약 생성
    const reservation = await prisma.reservation.create({
      data: {
        studentId,
        lessonType: courseName,
        date: startTime,
        startTime: startTime,
        endTime: endTime,
        duration,
        price,
        notes,
        status: "PENDING",
        location: "ONLINE",
      },
      include: {
        student: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });

    // 응답 데이터를 로컬 시간대 기준으로 포맷팅
    const resDate = new Date(reservation.date);
    const resStartTime = new Date(reservation.startTime);
    const resCreatedAt = new Date(reservation.createdAt);
    
    const formattedReservation = {
      id: reservation.id,
      studentName: reservation.student.name,
      studentId: reservation.student.id,
      courseName: reservation.lessonType,
      teacherName: teacherName || "미배정",
      date: `${resDate.getFullYear()}-${String(resDate.getMonth() + 1).padStart(2, '0')}-${String(resDate.getDate()).padStart(2, '0')}`,
      time: `${String(resStartTime.getHours()).padStart(2, '0')}:${String(resStartTime.getMinutes()).padStart(2, '0')}`,
      duration: reservation.duration,
      status: reservation.status,
      price: reservation.price,
      paymentStatus: "UNPAID",
      notes: reservation.notes,
      createdAt: `${resCreatedAt.getFullYear()}-${String(resCreatedAt.getMonth() + 1).padStart(2, '0')}-${String(resCreatedAt.getDate()).padStart(2, '0')}`,
    };

    // 관리자 알림 생성
    try {
      await prisma.adminNotification.create({
        data: {
          type: 'NEW_RESERVATION',
          title: '새로운 수업 예약',
          message: `${reservation.student.name}님이 ${courseName} 수업을 예약했습니다.`,
          status: 'UNREAD',
          data: {
            priority: 'medium',
            reservationId: reservation.id,
            studentId: reservation.student.id,
            studentName: reservation.student.name,
            courseName,
            date: `${resDate.getFullYear()}-${String(resDate.getMonth() + 1).padStart(2, '0')}-${String(resDate.getDate()).padStart(2, '0')}`,
            time: `${String(resStartTime.getHours()).padStart(2, '0')}:${String(resStartTime.getMinutes()).padStart(2, '0')}`,
          },
        },
      });
    } catch (notificationError) {
      console.error('예약 알림 생성 오류:', notificationError);
    }

    return NextResponse.json({
      success: true,
      reservation: formattedReservation,
    });
  } catch (error) {
    console.error("예약 생성 오류:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

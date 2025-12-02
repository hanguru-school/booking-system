import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    console.log("수업 예약 API 시작");
    
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user");
    
    if (!userCookie) {
      return NextResponse.json(
        { 
          success: false,
          message: "로그인이 필요합니다.",
          error: "UNAUTHORIZED"
        },
        { status: 401 }
      );
    }

    const userData = JSON.parse(userCookie.value);
    const { 
      lessonType,
      preferredDate,
      preferredTime,
      duration = 60,
      notes,
      studentId 
    } = await request.json();

    // 필수 필드 검증
    if (!lessonType || !preferredDate || !preferredTime) {
      return NextResponse.json(
        { 
          success: false,
          message: "수업 유형, 희망 날짜, 희망 시간을 모두 입력해주세요.",
          error: "MISSING_REQUIRED_FIELDS"
        },
        { status: 400 }
      );
    }

    // 학생 정보 확인
    let student;
    if (userData.role === "STUDENT") {
      student = await prisma.student.findUnique({
        where: { userId: userData.id },
        include: { user: true }
      });
    } else if (userData.role === "PARENT" && studentId) {
      student = await prisma.student.findUnique({
        where: { id: studentId },
        include: { user: true }
      });
    } else {
      return NextResponse.json(
        { 
          success: false,
          message: "학생 정보를 찾을 수 없습니다.",
          error: "STUDENT_NOT_FOUND"
        },
        { status: 404 }
      );
    }

    if (!student) {
      return NextResponse.json(
        { 
          success: false,
          message: "학생 정보를 찾을 수 없습니다.",
          error: "STUDENT_NOT_FOUND"
        },
        { status: 404 }
      );
    }

    // 예약 시간 파싱 (일본 시간대 기준)
    // preferredDate 형식: "YYYY-MM-DD", preferredTime 형식: "HH:mm"
    const [year, month, day] = preferredDate.split('-').map(Number);
    const [hours, minutes] = preferredTime.split(':').map(Number);
    
    // 일본 시간대(Asia/Tokyo) 기준으로 Date 객체 생성
    // 로컬 시간대에서 올바른 시간이 저장되도록 명시적으로 설정
    const reservationDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
    
    console.log("예약 시간 파싱:", {
      입력: { preferredDate, preferredTime },
      파싱된_날짜: { year, month, day, hours, minutes },
      reservationDateTime: reservationDateTime.toISOString(),
      로컬시간: reservationDateTime.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
    });

    // 현재 시간과 비교
    if (reservationDateTime <= new Date()) {
      return NextResponse.json(
        { 
          success: false,
          message: "과거 시간으로는 예약할 수 없습니다.",
          error: "INVALID_DATETIME"
        },
        { status: 400 }
      );
    }

    // 중복 예약 확인
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        studentId: student.id,
        startTime: {
          gte: new Date(reservationDateTime.getTime() - 24 * 60 * 60 * 1000), // 24시간 전
          lte: new Date(reservationDateTime.getTime() + 24 * 60 * 60 * 1000), // 24시간 후
        },
        status: {
          in: ["PENDING", "CONFIRMED"]
        }
      }
    });

    if (existingReservation) {
      return NextResponse.json(
        { 
          success: false,
          message: "해당 시간대에 이미 예약이 있습니다.",
          error: "DUPLICATE_RESERVATION"
        },
        { status: 409 }
      );
    }

    // 예약 생성
    const reservation = await prisma.reservation.create({
      data: {
        studentId: student.id,
        lessonType,
        date: reservationDateTime,
        startTime: reservationDateTime,
        endTime: new Date(reservationDateTime.getTime() + duration * 60 * 1000),
        duration,
        status: "PENDING",
        notes: notes || null,
        teacherId: null, // 관리자가 선생님 지정
        price: calculatePrice(lessonType, duration),
        location: "ONLINE",
      },
      include: {
        student: {
          include: {
            user: true
          }
        }
      }
    });

    console.log("수업 예약 생성 완료:", {
      reservationId: reservation.id,
      studentName: student.user.name,
      lessonType,
      startTime: reservationDateTime,
      status: "PENDING"
    });

    // 관리자에게 예약 알림 생성
    await prisma.adminNotification.create({
      data: {
        type: "NEW_RESERVATION",
        title: "새로운 수업 예약",
        message: `${student.user.name}님이 ${lessonType} 수업을 예약했습니다.`,
        status: "UNREAD",
        data: {
          reservationId: reservation.id,
          studentId: student.id,
          studentName: student.user.name,
          lessonType,
          startTime: reservationDateTime,
        },
      },
    });

    // 학생에게 예약 확인 이메일 발송 (실제 구현에서는 이메일 서비스 사용)
    console.log(`예약 확인 이메일 발송: ${student.user.email}`);

    return NextResponse.json({
      success: true,
      message: "수업 예약이 완료되었습니다. 관리자 승인 후 확정됩니다.",
      reservation: {
        id: reservation.id,
        lessonType: reservation.lessonType,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
        status: reservation.status,
        price: reservation.price,
      }
    });

  } catch (error) {
    console.error("수업 예약 오류:", error);
    return NextResponse.json(
      { 
        success: false,
        message: "수업 예약 중 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : "UNKNOWN_ERROR"
      },
      { status: 500 }
    );
  }
}

// 수업 유형과 시간에 따른 가격 계산
function calculatePrice(lessonType: string, duration: number): number {
  const basePrice = {
    "초급 회화": 15000,
    "중급 회화": 20000,
    "고급 회화": 25000,
    "문법 수업": 18000,
    "작문 수업": 20000,
    "듣기 수업": 17000,
    "읽기 수업": 16000,
    "시험 준비": 25000,
  };

  const basePricePerHour = basePrice[lessonType as keyof typeof basePrice] || 20000;
  return Math.round((basePricePerHour * duration) / 60);
}

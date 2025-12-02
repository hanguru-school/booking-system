import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("선생님 지정 API 시작");
    
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
    
    // 관리자 권한 확인
    if (userData.role !== "ADMIN") {
      return NextResponse.json(
        { 
          success: false,
          message: "관리자 권한이 필요합니다.",
          error: "FORBIDDEN"
        },
        { status: 403 }
      );
    }

    const { teacherId } = await request.json();

    if (!teacherId) {
      return NextResponse.json(
        { 
          success: false,
          message: "선생님 ID가 필요합니다.",
          error: "MISSING_TEACHER_ID"
        },
        { status: 400 }
      );
    }

    // 예약 확인
    const reservation = await prisma.reservation.findUnique({
      where: { id: params.id },
      include: {
        student: {
          include: { user: true }
        },
        teacher: {
          include: { user: true }
        }
      }
    });

    if (!reservation) {
      return NextResponse.json(
        { 
          success: false,
          message: "예약을 찾을 수 없습니다.",
          error: "RESERVATION_NOT_FOUND"
        },
        { status: 404 }
      );
    }

    // 선생님 확인
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: { user: true }
    });

    if (!teacher) {
      return NextResponse.json(
        { 
          success: false,
          message: "선생님을 찾을 수 없습니다.",
          error: "TEACHER_NOT_FOUND"
        },
        { status: 404 }
      );
    }

    // 선생님 상태 확인
    if (teacher.status !== "ACTIVE") {
      return NextResponse.json(
        { 
          success: false,
          message: "활성화되지 않은 선생님입니다.",
          error: "TEACHER_NOT_ACTIVE"
        },
        { status: 400 }
      );
    }

    // 선생님 시간 충돌 확인
    const conflictingReservation = await prisma.reservation.findFirst({
      where: {
        teacherId: teacherId,
        startTime: {
          gte: reservation.startTime,
          lt: reservation.endTime,
        },
        status: {
          in: ["PENDING", "CONFIRMED"]
        },
        id: {
          not: reservation.id
        }
      }
    });

    if (conflictingReservation) {
      return NextResponse.json(
        { 
          success: false,
          message: "해당 시간에 선생님의 다른 수업이 있습니다.",
          error: "TEACHER_SCHEDULE_CONFLICT"
        },
        { status: 409 }
      );
    }

    // 예약 업데이트
    const updatedReservation = await prisma.reservation.update({
      where: { id: params.id },
      data: {
        teacherId: teacherId,
        status: "CONFIRMED",
        updatedAt: new Date(),
      },
      include: {
        student: {
          include: { user: true }
        },
        teacher: {
          include: { user: true }
        }
      }
    });

    console.log("선생님 지정 완료:", {
      reservationId: updatedReservation.id,
      studentName: updatedReservation.student.user.name,
      teacherName: updatedReservation.teacher?.user.name,
      status: updatedReservation.status
    });

    // 학생에게 알림 생성
    await prisma.adminNotification.create({
      data: {
        type: "RESERVATION_CONFIRMED",
        title: "수업 예약 확정",
        message: `${updatedReservation.student.user.name}님의 수업이 ${updatedReservation.teacher?.user.name} 선생님으로 확정되었습니다.`,
        status: "UNREAD",
        data: {
          reservationId: updatedReservation.id,
          studentId: updatedReservation.student.id,
          studentName: updatedReservation.student.user.name,
          teacherId: updatedReservation.teacher?.id,
          teacherName: updatedReservation.teacher?.user.name,
          startTime: updatedReservation.startTime,
        },
      },
    });

    // 선생님에게 알림 생성
    await prisma.adminNotification.create({
      data: {
        type: "NEW_ASSIGNMENT",
        title: "새로운 수업 배정",
        message: `${updatedReservation.teacher?.user.name} 선생님께 ${updatedReservation.student.user.name}님의 수업이 배정되었습니다.`,
        status: "UNREAD",
        data: {
          reservationId: updatedReservation.id,
          studentId: updatedReservation.student.id,
          studentName: updatedReservation.student.user.name,
          teacherId: updatedReservation.teacher?.id,
          teacherName: updatedReservation.teacher?.user.name,
          startTime: updatedReservation.startTime,
        },
      },
    });

    // 이메일 알림 발송 (실제 구현에서는 이메일 서비스 사용)
    console.log(`학생에게 확정 이메일 발송: ${updatedReservation.student.user.email}`);
    console.log(`선생님에게 배정 이메일 발송: ${updatedReservation.teacher?.user.email}`);

    return NextResponse.json({
      success: true,
      message: "선생님이 성공적으로 지정되었습니다.",
      reservation: {
        id: updatedReservation.id,
        studentName: updatedReservation.student.user.name,
        teacherName: updatedReservation.teacher?.user.name,
        startTime: updatedReservation.startTime,
        status: updatedReservation.status,
      }
    });

  } catch (error) {
    console.error("선생님 지정 오류:", error);
    return NextResponse.json(
      { 
        success: false,
        message: "선생님 지정 중 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : "UNKNOWN_ERROR"
      },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("수업 완료 API 시작");
    
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
    
    // 선생님 권한 확인
    if (userData.role !== "TEACHER") {
      return NextResponse.json(
        { 
          success: false,
          message: "선생님 권한이 필요합니다.",
          error: "FORBIDDEN"
        },
        { status: 403 }
      );
    }

    const { 
      lessonNotes,
      studentProgress,
      homework,
      nextLessonPlan 
    } = await request.json();

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
    if (reservation.teacherId !== userData.id) {
      return NextResponse.json(
        { 
          success: false,
          message: "본인의 수업만 완료할 수 있습니다.",
          error: "FORBIDDEN"
        },
        { status: 403 }
      );
    }

    // 수업 상태 확인
    if (reservation.status !== "CONFIRMED") {
      return NextResponse.json(
        { 
          success: false,
          message: "확정된 수업만 완료할 수 있습니다.",
          error: "INVALID_STATUS"
        },
        { status: 400 }
      );
    }

    // 수업 시간 확인
    const now = new Date();
    if (now < reservation.startTime) {
      return NextResponse.json(
        { 
          success: false,
          message: "아직 수업 시간이 되지 않았습니다.",
          error: "INVALID_TIME"
        },
        { status: 400 }
      );
    }

    // 수업 완료 처리
    const updatedReservation = await prisma.reservation.update({
      where: { id: params.id },
      data: {
        status: "COMPLETED",
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

    // 레슨 노트 생성
    if (lessonNotes) {
      await prisma.lessonNote.create({
        data: {
          teacherId: reservation.teacherId!,
          studentId: reservation.studentId,
          reservationId: reservation.id,
          title: `수업 노트 - ${reservation.lessonType}`,
          content: lessonNotes.content || "",
          audioUrl: lessonNotes.audioUrl || null,
          attachments: lessonNotes.attachments || [],
        },
      });
    }

    // 학생 진도 업데이트
    if (studentProgress) {
      await prisma.student.update({
        where: { id: reservation.studentId },
        data: {
          level: studentProgress.level || reservation.student.level,
          points: {
            increment: studentProgress.pointsEarned || 10
          }
        }
      });
    }

    // 숙제 생성
    if (homework) {
      await prisma.homework.create({
        data: {
          studentId: reservation.studentId,
          title: homework.title,
          content: homework.content,
          dueDate: homework.dueDate ? new Date(homework.dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 기본 7일 후
          status: "ASSIGNED",
          difficulty: homework.difficulty || "MEDIUM",
        },
      });
    }

    // 급여 계산 및 기록
    const teacher = await prisma.teacher.findUnique({
      where: { id: reservation.teacherId! }
    });

    if (teacher) {
      const hourlyRate = teacher.hourlyRate;
      const durationHours = reservation.duration / 60;
      const salary = Math.round(hourlyRate * durationHours);

      await prisma.payroll.create({
        data: {
          teacherId: reservation.teacherId!,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          hoursWorked: durationHours,
          hourlyRate: hourlyRate,
          totalAmount: salary,
          status: "PENDING",
          notes: `${reservation.student.user.name}님 수업`,
        },
      });
    }

    console.log("수업 완료 처리 완료:", {
      reservationId: updatedReservation.id,
      studentName: updatedReservation.student.user.name,
      teacherName: updatedReservation.teacher?.user.name,
      duration: updatedReservation.duration,
      salary: teacher ? Math.round(teacher.hourlyRate * (updatedReservation.duration / 60)) : 0
    });

    // 학생에게 수업 완료 알림 생성
    await prisma.adminNotification.create({
      data: {
        type: "LESSON_COMPLETED",
        title: "수업 완료",
        message: `${updatedReservation.student.user.name}님의 수업이 완료되었습니다.`,
        status: "UNREAD",
        data: {
          reservationId: updatedReservation.id,
          studentId: updatedReservation.student.id,
          studentName: updatedReservation.student.user.name,
          teacherId: updatedReservation.teacher?.id,
          teacherName: updatedReservation.teacher?.user.name,
          lessonType: updatedReservation.lessonType,
          duration: updatedReservation.duration,
        },
      },
    });

    // 리뷰 요청 알림 생성
    await prisma.adminNotification.create({
      data: {
        type: "REVIEW_REQUEST",
        title: "수업 리뷰 요청",
        message: `${updatedReservation.student.user.name}님께 수업 리뷰를 요청해주세요.`,
        status: "UNREAD",
        data: {
          reservationId: updatedReservation.id,
          studentId: updatedReservation.student.id,
          studentName: updatedReservation.student.user.name,
          teacherId: updatedReservation.teacher?.id,
          teacherName: updatedReservation.teacher?.user.name,
        },
      },
    });

    // 이메일 알림 발송 (실제 구현에서는 이메일 서비스 사용)
    console.log(`학생에게 수업 완료 이메일 발송: ${updatedReservation.student.user.email}`);
    console.log(`관리자에게 수업 완료 보고 이메일 발송`);

    return NextResponse.json({
      success: true,
      message: "수업이 성공적으로 완료되었습니다.",
      reservation: {
        id: updatedReservation.id,
        studentName: updatedReservation.student.user.name,
        teacherName: updatedReservation.teacher?.user.name,
        lessonType: updatedReservation.lessonType,
        duration: updatedReservation.duration,
        status: updatedReservation.status,
        salary: teacher ? Math.round(teacher.hourlyRate * (updatedReservation.duration / 60)) : 0
      }
    });

  } catch (error) {
    console.error("수업 완료 오류:", error);
    return NextResponse.json(
      { 
        success: false,
        message: "수업 완료 처리 중 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : "UNKNOWN_ERROR"
      },
      { status: 500 }
    );
  }
} 
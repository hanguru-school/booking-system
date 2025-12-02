import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth-utils";
import { ReservationStatus } from "@prisma/client";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    console.log("=== 예약 취소 API 시작 ===");
    console.log("예약 ID:", params.id);

    // 1. 세션 확인
    const session = await getSessionFromCookies(request);
    if (!session?.user?.id) {
      console.log("세션 없음 - 401 반환");
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    // 2. 예약 조회
    const reservation = await prisma.reservation.findUnique({
      where: { id: params.id },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!reservation) {
      console.log("예약을 찾을 수 없음 - 404 반환");
      return NextResponse.json(
        { error: "예약을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 3. 권한 확인 (본인의 예약만 취소 가능)
    if (reservation.student.userId !== session.user.id) {
      console.log("권한 없음 - 403 반환");
      return NextResponse.json(
        { error: "이 예약에 대한 접근 권한이 없습니다." },
        { status: 403 },
      );
    }

    // 4. 취소 가능 여부 확인
    if (reservation.status === ReservationStatus.CANCELLED) {
      console.log("이미 취소된 예약 - 400 반환");
      return NextResponse.json(
        { error: "이미 취소된 예약입니다." },
        { status: 400 },
      );
    }

    if (reservation.status === ReservationStatus.ATTENDED) {
      console.log("이미 완료된 예약 - 400 반환");
      return NextResponse.json(
        { error: "이미 완료된 예약은 취소할 수 없습니다." },
        { status: 400 },
      );
    }

    // 5. 예약 취소
    const updatedReservation = await prisma.reservation.update({
      where: { id: params.id },
      data: {
        status: ReservationStatus.CANCELLED,
        updatedAt: new Date(),
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        teacher: true,
      },
    });

    console.log("예약 취소 성공:", updatedReservation.id);

    // 6. 취소 알림 전송 (실제 구현에서는 이메일/LINE 알림)
    console.log("📧 예약 취소 알림 전송:", {
      to: updatedReservation.student.user.email,
      reservationId: updatedReservation.id,
      date: updatedReservation.date,
      time: updatedReservation.startTime,
    });

    // 7. 응답 반환
    return NextResponse.json({
      success: true,
      message: "예약이 성공적으로 취소되었습니다.",
      reservation: {
        id: updatedReservation.id,
        date: updatedReservation.date,
        startTime: updatedReservation.startTime,
        endTime: updatedReservation.endTime,
        location: updatedReservation.location,
        status: updatedReservation.status,
        notes: updatedReservation.notes,
        updatedAt: updatedReservation.updatedAt,
        teacher: updatedReservation.teacher,
      },
    });
  } catch (error) {
    console.error("=== 예약 취소 API 오류 ===");
    console.error(
      "오류 타입:",
      error instanceof Error ? error.constructor.name : typeof error,
    );
    console.error(
      "오류 메시지:",
      error instanceof Error ? error.message : String(error),
    );
    console.error(
      "오류 스택:",
      error instanceof Error ? error.stack : "No stack trace",
    );

    return NextResponse.json(
      { error: "예약 취소 중 오류가 발생했습니다." },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

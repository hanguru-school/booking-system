import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    console.log("=== 예약 조회 API 시작 ===");
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
        teacher: true,
      },
    });

    if (!reservation) {
      console.log("예약을 찾을 수 없음 - 404 반환");
      return NextResponse.json(
        { error: "예약을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 3. 권한 확인 (본인의 예약만 조회 가능)
    if (reservation.student.userId !== session.user.id) {
      console.log("권한 없음 - 403 반환");
      return NextResponse.json(
        { error: "이 예약에 대한 접근 권한이 없습니다." },
        { status: 403 },
      );
    }

    console.log("예약 조회 성공:", reservation.id);

    // 4. 응답 반환
    return NextResponse.json({
      reservation: {
        id: reservation.id,
        date: reservation.date,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
        location: reservation.location,
        status: reservation.status,
        notes: reservation.notes,
        createdAt: reservation.createdAt,
        teacher: reservation.teacher,
      },
    });
  } catch (error) {
    console.error("=== 예약 조회 API 오류 ===");
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
      { error: "예약 조회 중 오류가 발생했습니다." },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

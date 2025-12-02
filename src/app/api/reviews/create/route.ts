import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth-utils";

export async function POST(request: NextRequest) {
  console.log("=== 리뷰 작성 API 시작 ===");

  try {
    // 1. 인증 확인
    console.log("1. 인증 확인");
    const session = getSessionFromCookies(request);
    if (!session) {
      console.log("세션 없음 - 401 반환");
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const userId = session.user.id;
    const userRole = session.user.role;
    console.log("사용자 정보:", { userId, userRole });

    // 2. 요청 데이터 파싱
    console.log("2. 요청 데이터 파싱");
    const body = await request.json();
    console.log("리뷰 요청 데이터:", {
      reservationId: body.reservationId,
      rating: body.rating,
      content: body.content?.substring(0, 50) + "...",
    });

    const { reservationId, rating, content } = body;

    // 3. 입력 데이터 검증
    console.log("3. 입력 데이터 검증");
    if (!reservationId || !rating || !content) {
      console.log("필수 필드 누락");
      return NextResponse.json(
        { error: "예약 ID, 평점, 내용은 필수입니다." },
        { status: 400 },
      );
    }

    if (rating < 1 || rating > 5) {
      console.log("평점 범위 오류");
      return NextResponse.json(
        { error: "평점은 1-5 사이의 값이어야 합니다." },
        { status: 400 },
      );
    }

    if (content.length < 10) {
      console.log("리뷰 내용 길이 부족");
      return NextResponse.json(
        { error: "리뷰 내용은 최소 10자 이상이어야 합니다." },
        { status: 400 },
      );
    }

    if (content.length > 1000) {
      console.log("리뷰 내용 길이 초과");
      return NextResponse.json(
        { error: "리뷰 내용은 최대 1000자까지 입력 가능합니다." },
        { status: 400 },
      );
    }

    // 4. 예약 정보 확인
    console.log("4. 예약 정보 확인");
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        student: true,
        teacher: true,
      },
    });

    if (!reservation) {
      console.log("예약 정보 없음");
      return NextResponse.json(
        { error: "해당 예약을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    console.log("예약 정보:", {
      reservationId: reservation.id,
      studentId: reservation.studentId,
      teacherId: reservation.teacherId,
      status: reservation.status,
    });

    // 5. 권한 확인 (학생만 자신의 예약에 리뷰 작성 가능)
    if (userRole === "STUDENT") {
      const student = await prisma.student.findUnique({
        where: { userId: userId },
      });

      if (!student || student.id !== reservation.studentId) {
        console.log("권한 없음 - 다른 학생의 예약");
        return NextResponse.json(
          { error: "자신의 예약에만 리뷰를 작성할 수 있습니다." },
          { status: 403 },
        );
      }
    }

    // 6. 기존 리뷰 확인
    console.log("6. 기존 리뷰 확인");
    const existingReview = await prisma.review.findFirst({
      where: {
        reservationId: reservationId,
        studentId: reservation.studentId,
      },
    });

    if (existingReview) {
      console.log("이미 리뷰 작성됨");
      return NextResponse.json(
        { error: "이미 해당 예약에 대한 리뷰를 작성했습니다." },
        { status: 409 },
      );
    }

    // 7. 리뷰 생성
    console.log("7. 리뷰 생성");
    const review = await prisma.review.create({
      data: {
        reservationId: reservationId,
        studentId: reservation.studentId,
        teacherId: reservation.teacherId,
        rating: rating,
        content: content,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log("리뷰 생성 성공:", review.id);

    // 8. 선생님 평점 업데이트 (필요시 나중에 추가)
    console.log("8. 리뷰 생성 완료");

    return NextResponse.json(
      {
        success: true,
        message: "리뷰가 성공적으로 작성되었습니다.",
        review: {
          id: review.id,
          rating: review.rating,
          content: review.content,
          createdAt: review.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("=== 리뷰 작성 API 오류 ===");
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

    let errorMessage = "리뷰 작성에 실패했습니다.";
    if (error instanceof Error) {
      if (error.message.includes("prisma")) {
        errorMessage =
          "데이터베이스 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      } else if (error.message.includes("validation")) {
        errorMessage = "입력 정보가 올바르지 않습니다. 다시 확인해주세요.";
      } else if (error.message.includes("session")) {
        errorMessage = "로그인이 필요합니다. 다시 로그인해주세요.";
      } else {
        errorMessage = `리뷰 작성 실패: ${error.message}`;
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

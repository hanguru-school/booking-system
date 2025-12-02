import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    console.log("=== 학생 리뷰 조회 API 시작 ===");

    // 1. 세션 확인
    const session = await getSessionFromCookies(request);
    if (!session?.user?.id) {
      console.log("세션 없음 - 401 반환");
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    // 2. 학생 정보 조회
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });

    if (!student) {
      console.log("학생 정보 없음 - 404 반환");
      return NextResponse.json(
        { error: "학생 정보를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 3. 리뷰 조회 (실제로는 Review 모델에서 조회)
    // 현재는 임시 데이터로 대체
    const reviews = [
      {
        id: "review_1",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5일 전
        courseName: "기초 일본어",
        content:
          "오늘은 기초 문법을 배웠습니다. は와 が의 차이점을 이해하기 어려웠지만 선생님이 쉽게 설명해주셔서 도움이 되었습니다.",
        rating: 5,
        teacherResponse:
          "열심히 공부하는 모습이 보기 좋습니다. 다음 수업에서도 궁금한 점이 있으면 언제든 질문해주세요!",
        studentResponse: undefined,
      },
      {
        id: "review_2",
        date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12일 전
        courseName: "일본어 회화",
        content:
          "회화 연습을 많이 했습니다. 실제 상황에서 사용할 수 있는 표현들을 배워서 실용적이었습니다.",
        rating: 4,
        teacherResponse:
          "회화 실력이 많이 늘었습니다. 더 자연스러운 일본어를 구사할 수 있게 되었네요.",
        studentResponse: "감사합니다! 더 열심히 연습하겠습니다.",
      },
      {
        id: "review_3",
        date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20일 전
        courseName: "고급 일본어",
        content:
          "한자 학습이 어려웠지만 체계적으로 배울 수 있어서 좋았습니다. 복습이 중요하다는 것을 깨달았습니다.",
        rating: 4,
        teacherResponse:
          "한자 학습은 꾸준함이 중요합니다. 매일 조금씩이라도 복습하는 습관을 들이세요.",
        studentResponse: undefined,
      },
    ];

    console.log("리뷰 조회 성공:", reviews.length, "개 리뷰");

    // 4. 응답 반환
    return NextResponse.json({
      success: true,
      reviews: reviews,
    });
  } catch (error) {
    console.error("=== 학생 리뷰 조회 API 오류 ===");
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
      { error: "리뷰 조회 중 오류가 발생했습니다." },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

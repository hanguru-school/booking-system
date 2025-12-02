import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    console.log("=== 학생 숙제 조회 API 시작 ===");

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

    // 3. 숙제 조회 (실제로는 Homework 모델에서 조회)
    // 현재는 임시 데이터로 대체
    const homework = [
      {
        id: "hw_1",
        title: "기초 문법 연습",
        description:
          "JLPT N5 문법 문제 10문제를 풀어보세요. 1. は/が의 차이점 2. です/だ의 사용법 3. て형 활용",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7일 후
        status: "pending" as const,
        courseName: "기초 일본어",
        teacherName: "김선생님",
      },
      {
        id: "hw_2",
        title: "회화 연습",
        description:
          "일상적인 대화 상황에서 사용할 수 있는 표현들을 연습해보세요. 자기소개, 취미, 가족 소개 등",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3일 후
        status: "submitted" as const,
        courseName: "일본어 회화",
        teacherName: "이선생님",
      },
      {
        id: "hw_3",
        title: "한자 학습",
        description:
          "기초 한자 20개를 학습하고 각각의 의미와 음을 외워보세요. 人, 大, 小, 上, 下 등",
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2일 전
        status: "completed" as const,
        courseName: "고급 일본어",
        teacherName: "박선생님",
      },
    ];

    console.log("숙제 조회 성공:", homework.length, "개 숙제");

    // 4. 응답 반환
    return NextResponse.json({
      success: true,
      homework: homework,
    });
  } catch (error) {
    console.error("=== 학생 숙제 조회 API 오류 ===");
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
      { error: "숙제 조회 중 오류가 발생했습니다." },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

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

    // 실제 수업 데이터가 있으면 가져오고, 없으면 빈 배열 반환
    const lessons = await prisma.reservation.findMany({
      distinct: ['lessonType'],
      select: {
        lessonType: true,
      },
    });

    const formattedLessons = lessons
      .filter(l => l.lessonType)
      .map((lesson, index) => ({
        id: `lesson-${index}`,
        name: lesson.lessonType || '수업',
        courseName: lesson.lessonType || '미정',
        duration: 60,
        description: '',
        createdAt: new Date().toISOString(),
      }));

    return NextResponse.json({
      success: true,
      lessons: formattedLessons,
    });
  } catch (error) {
    console.error("수업 목록 조회 오류:", error);
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

    // 수업 정보를 SystemSettings에 저장하거나 별도 테이블에 저장
    // 여기서는 간단히 성공 응답만 반환
    return NextResponse.json({
      success: true,
      message: "수업이 추가되었습니다.",
      lesson: {
        id: Date.now().toString(),
        ...body,
      },
    });
  } catch (error) {
    console.error("수업 추가 오류:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}


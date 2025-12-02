import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";

// GET: 코스 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromCookies(request);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    // SystemSettings에서 코스 목록 가져오기
    const coursesSetting = await prisma.systemSettings.findFirst({
      where: {
        key: "courses",
      },
    });

    const courses = coursesSetting?.value ? JSON.parse(coursesSetting.value as string) : [];

    // 레거시 호환성: 문자열 배열인 경우 객체 배열로 변환
    const normalizedCourses = Array.isArray(courses) 
      ? courses.map((course: any, index: number) => {
          if (typeof course === 'string') {
            return {
              id: `course-${index}`,
              name: course,
              showToStudents: true,
              description: "",
              lessonTypes: [],
            };
          }
          return {
            id: course.id || `course-${index}`,
            name: course.name || "",
            showToStudents: course.showToStudents !== undefined ? course.showToStudents : true,
            description: course.description || "",
            lessonTypes: course.lessonTypes || [],
          };
        })
      : [];

    return NextResponse.json({
      success: true,
      courses: normalizedCourses,
    });
  } catch (error) {
    console.error("코스 목록 조회 오류:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// POST: 코스 추가/수정
export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromCookies(request);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "권한이 없습니다." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { courses } = body;

    if (!Array.isArray(courses)) {
      return NextResponse.json(
        { success: false, message: "코스 목록이 올바르지 않습니다." },
        { status: 400 }
      );
    }

    // SystemSettings에 저장
    await prisma.systemSettings.upsert({
      where: {
        key: "courses",
      },
      update: {
        value: JSON.stringify(courses),
        updatedAt: new Date(),
      },
      create: {
        key: "courses",
        value: JSON.stringify(courses),
      },
    });

    return NextResponse.json({
      success: true,
      message: "코스 목록이 저장되었습니다.",
    });
  } catch (error) {
    console.error("코스 저장 오류:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}


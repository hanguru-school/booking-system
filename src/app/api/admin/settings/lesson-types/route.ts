import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";

// GET: 수업형태 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromCookies(request);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    // SystemSettings에서 수업형태 목록 가져오기
    const lessonTypesSetting = await prisma.systemSettings.findFirst({
      where: {
        key: "lesson_types",
      },
    });

    const lessonTypes = lessonTypesSetting?.value ? JSON.parse(lessonTypesSetting.value as string) : [];

    return NextResponse.json({
      success: true,
      lessonTypes: Array.isArray(lessonTypes) ? lessonTypes : [],
    });
  } catch (error) {
    console.error("수업형태 목록 조회 오류:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// POST: 수업형태 추가/수정
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
    const { lessonTypes } = body;

    if (!Array.isArray(lessonTypes)) {
      return NextResponse.json(
        { success: false, message: "수업형태 목록이 올바르지 않습니다." },
        { status: 400 }
      );
    }

    // SystemSettings에 저장
    await prisma.systemSettings.upsert({
      where: {
        key: "lesson_types",
      },
      update: {
        value: JSON.stringify(lessonTypes),
        updatedAt: new Date(),
      },
      create: {
        key: "lesson_types",
        value: JSON.stringify(lessonTypes),
      },
    });

    return NextResponse.json({
      success: true,
      message: "수업형태 목록이 저장되었습니다.",
    });
  } catch (error) {
    console.error("수업형태 저장 오류:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}




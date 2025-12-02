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

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    // 학생 레벨 정보를 SystemSettings에서 가져오기
    const levelSetting = await prisma.systemSettings.findFirst({
      where: { key: studentId ? `student_level_${studentId}` : "student_levels" },
    });

    const levels = levelSetting?.value
      ? JSON.parse(levelSetting.value as string)
      : [];

    return NextResponse.json({
      success: true,
      levels: Array.isArray(levels) ? levels : [],
    });
  } catch (error) {
    console.error("학생 레벨 정보 조회 오류:", error);
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
    const { studentId, ...levelData } = body;

    if (!studentId) {
      return NextResponse.json(
        { success: false, message: "학생 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // 기존 레벨 정보 가져오기
    const levelSetting = await prisma.systemSettings.findFirst({
      where: { key: `student_level_${studentId}` },
    });

    const existingLevels = levelSetting?.value
      ? JSON.parse(levelSetting.value as string)
      : [];

    const newLevel = {
      id: Date.now().toString(),
      studentId,
      ...levelData,
      lastUpdated: new Date().toISOString(),
    };

    const updatedLevels = [...existingLevels, newLevel];

    await prisma.systemSettings.upsert({
      where: { key: `student_level_${studentId}` },
      update: {
        value: JSON.stringify(updatedLevels),
        updatedAt: new Date(),
      },
      create: {
        key: `student_level_${studentId}`,
        value: JSON.stringify(updatedLevels),
        category: "student",
      },
    });

    return NextResponse.json({
      success: true,
      message: "레벨 정보가 추가되었습니다.",
      level: newLevel,
    });
  } catch (error) {
    console.error("학생 레벨 정보 저장 오류:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}


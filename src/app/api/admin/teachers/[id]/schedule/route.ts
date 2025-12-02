import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromCookies(request);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const teacher = await prisma.teacher.findUnique({
      where: { id: params.id },
      include: { user: true },
    });

    if (!teacher) {
      return NextResponse.json(
        { success: false, message: "선생님을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 스케줄 정보를 SystemSettings에서 가져오기
    const scheduleSetting = await prisma.systemSettings.findFirst({
      where: { key: `teacher_schedule_${params.id}` },
    });

    const defaultSchedule = {
      teacherId: params.id,
      teacherName: teacher.user?.name || teacher.name || '',
      weeklySchedule: [],
      specificDates: [],
    };

    if (scheduleSetting?.value) {
      const parsed = JSON.parse(scheduleSetting.value as string);
      return NextResponse.json({
        success: true,
        schedule: { ...defaultSchedule, ...parsed },
      });
    }

    return NextResponse.json({
      success: true,
      schedule: defaultSchedule,
    });
  } catch (error) {
    console.error("선생님 스케줄 조회 오류:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromCookies(request);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const body = await request.json();

    await prisma.systemSettings.upsert({
      where: { key: `teacher_schedule_${params.id}` },
      update: {
        value: JSON.stringify(body),
        updatedAt: new Date(),
      },
      create: {
        key: `teacher_schedule_${params.id}`,
        value: JSON.stringify(body),
        category: "teacher_schedule",
      },
    });

    return NextResponse.json({
      success: true,
      message: "업무시간이 저장되었습니다.",
    });
  } catch (error) {
    console.error("선생님 스케줄 저장 오류:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}


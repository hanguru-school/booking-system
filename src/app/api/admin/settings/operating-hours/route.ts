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

    const settings = await prisma.systemSettings.findFirst({
      where: { key: "operating_hours" },
    });

    const defaultHours = [
      { dayOfWeek: 0, isOpen: false, startTime: '09:00', endTime: '18:00' },
      { dayOfWeek: 1, isOpen: true, startTime: '09:00', endTime: '18:00' },
      { dayOfWeek: 2, isOpen: true, startTime: '09:00', endTime: '18:00' },
      { dayOfWeek: 3, isOpen: true, startTime: '09:00', endTime: '18:00' },
      { dayOfWeek: 4, isOpen: true, startTime: '09:00', endTime: '18:00' },
      { dayOfWeek: 5, isOpen: true, startTime: '09:00', endTime: '18:00' },
      { dayOfWeek: 6, isOpen: false, startTime: '09:00', endTime: '18:00' },
    ];

    if (settings?.value) {
      const parsed = JSON.parse(settings.value as string);
      return NextResponse.json({
        success: true,
        hours: parsed.hours || defaultHours,
      });
    }

    return NextResponse.json({
      success: true,
      hours: defaultHours,
    });
  } catch (error) {
    console.error("운영시간 조회 오류:", error);
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

    await prisma.systemSettings.upsert({
      where: { key: "operating_hours" },
      update: {
        value: JSON.stringify(body),
        updatedAt: new Date(),
      },
      create: {
        key: "operating_hours",
        value: JSON.stringify(body),
        category: "settings",
      },
    });

    return NextResponse.json({
      success: true,
      message: "운영시간이 저장되었습니다.",
    });
  } catch (error) {
    console.error("운영시간 저장 오류:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}


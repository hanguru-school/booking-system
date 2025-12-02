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
      where: { key: "reservation_settings" },
    });

    const defaultSettings = {
      bufferTime: 15,
      maxAdvanceDays: 90,
      minAdvanceHours: 2,
      cancellationDeadline: 24,
      autoConfirm: false,
      requireApproval: true,
    };

    if (settings?.value) {
      const parsed = JSON.parse(settings.value as string);
      return NextResponse.json({
        success: true,
        settings: { ...defaultSettings, ...parsed },
      });
    }

    return NextResponse.json({
      success: true,
      settings: defaultSettings,
    });
  } catch (error) {
    console.error("예약 설정 조회 오류:", error);
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
      where: { key: "reservation_settings" },
      update: {
        value: JSON.stringify(body),
        updatedAt: new Date(),
      },
      create: {
        key: "reservation_settings",
        value: JSON.stringify(body),
        category: "reservation",
      },
    });

    return NextResponse.json({
      success: true,
      message: "설정이 저장되었습니다.",
    });
  } catch (error) {
    console.error("예약 설정 저장 오류:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}


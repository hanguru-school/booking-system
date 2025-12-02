import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromCookies(request);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    let preferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id },
    });

    // 설정이 없으면 기본값으로 생성
    if (!preferences) {
      preferences = await prisma.userPreferences.create({
        data: {
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      preferences,
    });
  } catch (error) {
    console.error("사용자 설정 조회 오류:", error);
    return NextResponse.json(
      { error: "사용자 설정 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = getSessionFromCookies(request);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { language, timezone, theme, notifications, preferences } = body;

    const updatedPreferences = await prisma.userPreferences.upsert({
      where: { userId: session.user.id },
      update: {
        language: language || undefined,
        timezone: timezone || undefined,
        theme: theme || undefined,
        notifications: notifications ? JSON.parse(JSON.stringify(notifications)) : undefined,
        preferences: preferences ? JSON.parse(JSON.stringify(preferences)) : undefined,
      },
      create: {
        userId: session.user.id,
        language: language || "ko",
        timezone: timezone || "Asia/Tokyo",
        theme: theme || "light",
        notifications: notifications ? JSON.parse(JSON.stringify(notifications)) : {},
        preferences: preferences ? JSON.parse(JSON.stringify(preferences)) : {},
      },
    });

    return NextResponse.json({
      success: true,
      preferences: updatedPreferences,
    });
  } catch (error) {
    console.error("사용자 설정 업데이트 오류:", error);
    return NextResponse.json(
      { error: "사용자 설정 업데이트 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}




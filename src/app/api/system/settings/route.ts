import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const isPublic = searchParams.get("public");

    const where: any = {};
    if (category) {
      where.category = category;
    }
    if (isPublic === "true") {
      where.isPublic = true;
    }

    const settings = await prisma.systemSettings.findMany({
      where,
      orderBy: { category: "asc" },
    });

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("시스템 설정 조회 오류:", error);
    return NextResponse.json(
      { error: "시스템 설정 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromCookies(request);
    
    // 관리자만 설정 변경 가능
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "권한이 없습니다." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { key, value, description, category, isPublic } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: "키와 값은 필수 항목입니다." },
        { status: 400 }
      );
    }

    // 설정 생성 또는 업데이트
    const setting = await prisma.systemSettings.upsert({
      where: { key },
      update: {
        value,
        description: description || undefined,
        category: category || "GENERAL",
        isPublic: isPublic !== undefined ? isPublic : false,
        updatedBy: session.user.id,
      },
      create: {
        key,
        value,
        description: description || null,
        category: category || "GENERAL",
        isPublic: isPublic !== undefined ? isPublic : false,
        updatedBy: session.user.id,
      },
    });

    // 활동 로그 기록
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        userRole: session.user.role,
        action: "UPDATE",
        entityType: "SystemSettings",
        entityId: setting.id,
        description: `시스템 설정 변경: ${key}`,
        metadata: {
          key,
          value,
          category,
        },
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || null,
        userAgent: request.headers.get("user-agent") || null,
      },
    });

    return NextResponse.json({
      success: true,
      setting,
    });
  } catch (error) {
    console.error("시스템 설정 저장 오류:", error);
    return NextResponse.json(
      { error: "시스템 설정 저장 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}




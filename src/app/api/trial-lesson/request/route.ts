import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth-utils";

export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromCookies(request);
    const body = await request.json();

    const {
      name,
      nameKanji,
      nameYomigana,
      email,
      phone,
      preferredDate,
      preferredTime,
      lessonType,
      message,
    } = body;

    // 필수 필드 검증
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: "이름, 이메일, 전화번호는 필수 항목입니다." },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "올바른 이메일 형식이 아닙니다." },
        { status: 400 }
      );
    }

    // 체험레슨 신청 생성
    const trialLesson = await prisma.trialLessonRequest.create({
      data: {
        name,
        nameKanji: nameKanji || null,
        nameYomigana: nameYomigana || null,
        email,
        phone,
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        preferredTime: preferredTime || null,
        lessonType: lessonType || null,
        message: message || null,
        userId: session?.user?.id || null,
        status: "PENDING",
      },
    });

    // 활동 로그 기록
    await prisma.activityLog.create({
      data: {
        userId: session?.user?.id || null,
        userRole: session?.user?.role || "GUEST",
        action: "CREATE",
        entityType: "TrialLessonRequest",
        entityId: trialLesson.id,
        description: `체험레슨 신청: ${name} (${email})`,
        metadata: {
          email,
          phone,
          preferredDate,
          preferredTime,
        },
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || null,
        userAgent: request.headers.get("user-agent") || null,
      },
    });

    // 관리자 알림 생성
    try {
      await prisma.adminNotification.create({
        data: {
          type: 'NEW_TRIAL_LESSON',
          title: '새로운 체험레슨 신청',
          message: `${name}님이 체험레슨을 신청했습니다.`,
          status: 'UNREAD',
          data: {
            priority: 'high',
            trialId: trialLesson.id,
            name,
            email,
            phone,
            preferredDate,
            preferredTime,
            lessonType,
          },
        },
      });
    } catch (notificationError) {
      console.error('체험레슨 알림 생성 오류:', notificationError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "체험레슨 신청이 완료되었습니다.",
        trialLesson,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("체험레슨 신청 오류:", error);
    return NextResponse.json(
      { error: "체험레슨 신청 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromCookies(request);
    
    // 관리자만 조회 가능
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "권한이 없습니다." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [trialLessons, total] = await Promise.all([
      prisma.trialLessonRequest.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.trialLessonRequest.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      trialLessons,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("체험레슨 목록 조회 오류:", error);
    return NextResponse.json(
      { error: "체험레슨 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}


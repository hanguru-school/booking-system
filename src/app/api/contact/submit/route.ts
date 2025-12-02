import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    // 인증 확인 (선택사항 - 비로그인 사용자도 문의 가능)
    const session = getSessionFromCookies(request);

    const formData: ContactFormData = await request.json();

    // 필수 필드 검증
    if (
      !formData.name ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      return NextResponse.json(
        { error: "필수 필드가 누락되었습니다." },
        { status: 400 },
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return NextResponse.json(
        { error: "올바른 이메일 형식이 아닙니다." },
        { status: 400 },
      );
    }

    // 문의 내용 데이터베이스에 저장
    const inquiry = await prisma.contactInquiry.create({
      data: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        subject: formData.subject,
        message: formData.message,
        userId: session?.user?.id || null,
        userRole: session?.user?.role || "GUEST",
        status: "PENDING",
      },
    });

    // 활동 로그 기록
    await prisma.activityLog.create({
      data: {
        userId: session?.user?.id || null,
        userRole: session?.user?.role || "GUEST",
        action: "CREATE",
        entityType: "ContactInquiry",
        entityId: inquiry.id,
        description: `문의사항 제출: ${formData.subject}`,
        metadata: {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
        },
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || null,
        userAgent: request.headers.get("user-agent") || null,
      },
    });

    // 관리자 알림 생성
    try {
      await prisma.adminNotification.create({
        data: {
          type: 'NEW_INQUIRY',
          title: '새로운 문의사항',
          message: `${formData.name}님이 "${formData.subject}" 문의를 제출했습니다.`,
          status: 'UNREAD',
          data: {
            priority: 'medium',
            inquiryId: inquiry.id,
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
          },
        },
      });
    } catch (notificationError) {
      console.error('문의 알림 생성 오류:', notificationError);
    }

    // 성공 응답
    return NextResponse.json({
      success: true,
      message: "문의가 성공적으로 제출되었습니다.",
      contactId: inquiry.id,
    });
  } catch (error) {
    console.error("문의 제출 오류:", error);
    return NextResponse.json(
      { error: "문의 제출 중 오류가 발생했습니다." },
      { status: 500 },
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

    const [inquiries, total] = await Promise.all([
      prisma.contactInquiry.findMany({
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
      prisma.contactInquiry.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      inquiries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("문의사항 목록 조회 오류:", error);
    return NextResponse.json(
      { error: "문의사항 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 정기권 타입 정의
interface Passport {
  id: string;
  userId: string;
  type: "time" | "count";
  totalAmount: number;
  usedAmount: number;
  remainingAmount: number;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 쿠폰 타입 정의
interface Coupon {
  id: string;
  userId: string;
  code: string;
  type: "discount" | "free" | "bonus";
  value: number;
  isUsed: boolean;
  expiresAt: Date;
  createdAt: Date;
  usedAt?: Date;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "사용자 ID가 필요합니다." },
        { status: 400 },
      );
    }

    // 사용자의 정기권 및 쿠폰 정보 조회
    const passports = await prisma.$queryRaw`
      SELECT 
        'passport' as type,
        id,
        user_id as userId,
        type as passport_type,
        total_amount as totalAmount,
        used_amount as usedAmount,
        (total_amount - used_amount) as remainingAmount,
        expires_at as expiresAt,
        is_active as isActive,
        created_at as createdAt
      FROM passports 
      WHERE user_id = ${userId} AND is_active = true
    `;

    const coupons = await prisma.$queryRaw`
      SELECT 
        'coupon' as type,
        id,
        user_id as userId,
        code,
        type as coupon_type,
        value,
        is_used as isUsed,
        expires_at as expiresAt,
        created_at as createdAt,
        used_at as usedAt
      FROM coupons 
      WHERE user_id = ${userId} AND is_used = false AND expires_at > NOW()
    `;

    return NextResponse.json({
      success: true,
      data: {
        passports: passports || [],
        coupons: coupons || [],
      },
    });
  } catch (error) {
    console.error("Passport API error:", error);
    return NextResponse.json(
      { error: "정기권 정보 조회 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, type, totalAmount, expiresAt } = await request.json();

    if (!userId || !type || !totalAmount || !expiresAt) {
      return NextResponse.json(
        { error: "필수 정보가 누락되었습니다." },
        { status: 400 },
      );
    }

    // 정기권 생성 (실제로는 데이터베이스에 저장)
    const passport: Passport = {
      id: `passport_${Date.now()}`,
      userId,
      type: type as "time" | "count",
      totalAmount,
      usedAmount: 0,
      remainingAmount: totalAmount,
      expiresAt: new Date(expiresAt),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json({
      success: true,
      data: passport,
    });
  } catch (error) {
    console.error("Passport creation error:", error);
    return NextResponse.json(
      { error: "정기권 생성 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { passportId, usedAmount } = await request.json();

    if (!passportId || usedAmount === undefined) {
      return NextResponse.json(
        { error: "정기권 ID와 사용량이 필요합니다." },
        { status: 400 },
      );
    }

    // 정기권 사용량 업데이트 (실제로는 데이터베이스 업데이트)
    const updatedPassport = {
      id: passportId,
      usedAmount,
      remainingAmount: 0, // 실제로는 계산 필요
      updatedAt: new Date(),
    };

    return NextResponse.json({
      success: true,
      data: updatedPassport,
    });
  } catch (error) {
    console.error("Passport update error:", error);
    return NextResponse.json(
      { error: "정기권 업데이트 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

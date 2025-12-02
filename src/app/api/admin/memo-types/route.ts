import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");

    const where: any = {};
    if (isActive !== null) {
      where.isActive = isActive === "true";
    }

    const memoTypes = await prisma.memoType.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(memoTypes);
  } catch (error) {
    console.error("메모 유형 조회 실패:", error);
    return NextResponse.json(
      { error: "메모 유형 조회에 실패했습니다." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, color, isActive = true } = body;

    const memoType = await prisma.memoType.create({
      data: {
        name,
        color,
        isActive,
      },
    });

    return NextResponse.json(memoType);
  } catch (error) {
    console.error("메모 유형 생성 실패:", error);
    return NextResponse.json(
      { error: "메모 유형 생성에 실패했습니다." },
      { status: 500 },
    );
  }
}

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

    const services = await prisma.service.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("서비스 조회 실패:", error);
    return NextResponse.json(
      { error: "서비스 조회에 실패했습니다." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      duration,
      bufferTime,
      isActive = true,
      imageUrl,
    } = body;

    const service = await prisma.service.create({
      data: {
        name,
        description,
        duration,
        bufferTime,
        isActive,
        imageUrl,
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error("서비스 생성 실패:", error);
    return NextResponse.json(
      { error: "서비스 생성에 실패했습니다." },
      { status: 500 },
    );
  }
}

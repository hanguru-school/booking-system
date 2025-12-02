import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const uidStatus = searchParams.get("uidStatus");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "25");

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { phone: { contains: search } },
      ];
    }

    if (status && status !== "all") {
      // 상태 필터링은 User 모델의 role을 기반으로 할 수 있습니다
      where.user = { role: status.toUpperCase() };
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        user: true,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.student.count({ where });

    return NextResponse.json({
      students,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("고객 조회 실패:", error);
    return NextResponse.json(
      { error: "고객 조회에 실패했습니다." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      kanjiName,
      yomigana,
      koreanName,
      level = "초급 A",
      password = "temp_password", // 실제로는 해시된 비밀번호를 생성해야 함
    } = body;

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        email,
        name,
        phone,
        role: "STUDENT",
        password,
      },
    });

    // 학생 생성
    const student = await prisma.student.create({
      data: {
        userId: user.id,
        name,
        kanjiName,
        yomigana,
        koreanName,
        phone,
        level,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error("고객 생성 실패:", error);
    return NextResponse.json(
      { error: "고객 생성에 실패했습니다." },
      { status: 500 },
    );
  }
}

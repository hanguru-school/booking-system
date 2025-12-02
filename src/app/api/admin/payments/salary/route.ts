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

    // 급여 기록을 SystemSettings에서 가져오기
    const salarySetting = await prisma.systemSettings.findFirst({
      where: { key: "salary_records" },
    });

    const salaries = salarySetting?.value
      ? JSON.parse(salarySetting.value as string)
      : [];

    return NextResponse.json({
      success: true,
      salaries,
    });
  } catch (error) {
    console.error("급여 목록 조회 오류:", error);
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

    // 기존 급여 기록 가져오기
    const salarySetting = await prisma.systemSettings.findFirst({
      where: { key: "salary_records" },
    });

    const existingSalaries = salarySetting?.value
      ? JSON.parse(salarySetting.value as string)
      : [];

    const newSalary = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString(),
    };

    const updatedSalaries = [...existingSalaries, newSalary];

    await prisma.systemSettings.upsert({
      where: { key: "salary_records" },
      update: {
        value: JSON.stringify(updatedSalaries),
        updatedAt: new Date(),
      },
      create: {
        key: "salary_records",
        value: JSON.stringify(updatedSalaries),
        category: "payment",
      },
    });

    return NextResponse.json({
      success: true,
      message: "급여가 추가되었습니다.",
      salary: newSalary,
    });
  } catch (error) {
    console.error("급여 추가 오류:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}


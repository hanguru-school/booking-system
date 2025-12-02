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

    // 지출입 기록을 SystemSettings에서 가져오기
    const expensesSetting = await prisma.systemSettings.findFirst({
      where: { key: "expense_records" },
    });

    const records = expensesSetting?.value
      ? JSON.parse(expensesSetting.value as string)
      : [];

    return NextResponse.json({
      success: true,
      records,
    });
  } catch (error) {
    console.error("지출입 목록 조회 오류:", error);
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

    // 기존 지출입 기록 가져오기
    const expensesSetting = await prisma.systemSettings.findFirst({
      where: { key: "expense_records" },
    });

    const existingRecords = expensesSetting?.value
      ? JSON.parse(expensesSetting.value as string)
      : [];

    const newRecord = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString(),
    };

    const updatedRecords = [...existingRecords, newRecord];

    await prisma.systemSettings.upsert({
      where: { key: "expense_records" },
      update: {
        value: JSON.stringify(updatedRecords),
        updatedAt: new Date(),
      },
      create: {
        key: "expense_records",
        value: JSON.stringify(updatedRecords),
        category: "payment",
      },
    });

    return NextResponse.json({
      success: true,
      message: "지출입 내역이 추가되었습니다.",
      record: newRecord,
    });
  } catch (error) {
    console.error("지출입 추가 오류:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone } = body;

    // 현재 로그인한 관리자 ID를 가져와야 합니다 (실제로는 세션에서 가져옴)
    // 여기서는 임시로 첫 번째 관리자를 사용
    const admin = await prisma.admin.findFirst({
      include: {
        user: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "관리자를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 사용자 정보 업데이트
    await prisma.user.update({
      where: { id: admin.userId },
      data: {
        name,
        email,
        phone,
      },
    });

    // 관리자 정보 업데이트
    const updatedAdmin = await prisma.admin.update({
      where: { id: admin.id },
      data: {
        name,
        phone,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json(updatedAdmin);
  } catch (error) {
    console.error("프로필 수정 실패:", error);
    return NextResponse.json(
      { error: "프로필 수정에 실패했습니다." },
      { status: 500 },
    );
  }
}

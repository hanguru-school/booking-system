import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, currentPassword, newPassword } = await request.json();

    // 현재 사용자 확인 (세션에서 가져와야 하지만, 여기서는 간단히 처리)
    const currentUser = await prisma.user.findFirst({
      where: {
        role: "ADMIN",
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "마스터 계정을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 현재 비밀번호 확인
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      currentUser.password
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { success: false, error: "현재 비밀번호가 올바르지 않습니다." },
        { status: 400 }
      );
    }

    // 업데이트할 데이터 준비
    const updateData: any = {};

    // 이메일 변경
    if (email && email !== currentUser.email) {
      // 이메일 중복 확인
      const existingUser = await prisma.user.findFirst({
        where: {
          email: email,
          id: { not: currentUser.id },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: "이미 사용 중인 이메일입니다." },
          { status: 400 }
        );
      }

      updateData.email = email;
    }

    // 비밀번호 변경
    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: "비밀번호는 최소 6자 이상이어야 합니다." },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      updateData.password = hashedPassword;
    }

    // 사용자 정보 업데이트
    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: currentUser.id },
        data: updateData,
      });
    }

    return NextResponse.json({
      success: true,
      message: "계정 설정이 성공적으로 업데이트되었습니다.",
    });
  } catch (error) {
    console.error("계정 설정 업데이트 오류:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // 현재 마스터 계정 정보 조회
    const masterUser = await prisma.user.findFirst({
      where: {
        role: "ADMIN",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!masterUser) {
      return NextResponse.json(
        { success: false, error: "마스터 계정을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: masterUser,
    });
  } catch (error) {
    console.error("마스터 계정 정보 조회 오류:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 
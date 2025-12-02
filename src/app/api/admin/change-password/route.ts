import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "현재 비밀번호와 새로운 비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "새로운 비밀번호는 8자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    // 쿠키에서 사용자 정보 추출
    const cookieStore = request.cookies;
    const userCookie = cookieStore.get("user");

    if (!userCookie) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const userData = JSON.parse(userCookie.value);
    const userId = userData.id;
    
    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { admin: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      );
    }

    // 현재 비밀번호 확인
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "현재 비밀번호가 올바르지 않습니다." },
        { status: 400 }
      );
    }

    // 새 비밀번호 해시화
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 사용자 비밀번호 업데이트
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword,
      }
    });

    return NextResponse.json({
      success: true,
      message: "비밀번호가 성공적으로 변경되었습니다."
    });

  } catch (error) {
    console.error("관리자 비밀번호 변경 오류:", error);
    return NextResponse.json(
      { error: "비밀번호 변경 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

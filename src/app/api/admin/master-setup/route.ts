import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentPassword, newPassword, newEmail } = body;

    // 쿠키에서 사용자 정보 추출
    const cookieStore = request.cookies;
    const userCookie = cookieStore.get("user");

    if (!userCookie) {
      return NextResponse.json(
        { error: "認証が必要です。" },
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
        { error: "管理者権限が必要です。" },
        { status: 403 }
      );
    }

    // 마스터 관리자 권한 확인 (Admin 정보가 없어도 초기 설정으로 간주)
    if (user.admin && !user.admin.permissions?.isMaster) {
      return NextResponse.json(
        { error: "マスター管理者権限が必要です。" },
        { status: 403 }
      );
    }

    // 현재 비밀번호 확인
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "現在のパスワードが正しくありません。" },
        { status: 400 }
      );
    }

    // 새 비밀번호 해시화
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 사용자 정보 업데이트
    const updateData: any = {
      password: hashedNewPassword,
    };

    // 이메일 변경이 요청된 경우
    if (newEmail && newEmail !== user.email) {
      // 이메일 중복 확인
      const existingUser = await prisma.user.findUnique({
        where: { email: newEmail.toLowerCase() }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "このメールアドレスは既に使用されています。" },
          { status: 400 }
        );
      }

      updateData.email = newEmail.toLowerCase();
    }

    // 사용자 정보 업데이트
    await prisma.user.update({
      where: { id: user.id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: "マスター管理者の設定が完了しました。"
    });

  } catch (error) {
    console.error("マスター管理者設定エラー:", error);
    return NextResponse.json(
      { error: "設定中にエラーが発生しました。" },
      { status: 500 }
    );
  }
}

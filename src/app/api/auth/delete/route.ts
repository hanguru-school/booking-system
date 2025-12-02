import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // 세션 쿠키에서 사용자 정보 추출
    const session = request.cookies.get("user-session");
    if (!session) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 },
      );
    }
    let user;
    try {
      user = JSON.parse(session.value);
    } catch {
      return NextResponse.json(
        { error: "세션 정보가 올바르지 않습니다." },
        { status: 400 },
      );
    }
    if (!user?.id) {
      return NextResponse.json(
        { error: "세션 정보가 올바르지 않습니다." },
        { status: 400 },
      );
    }

    // 실제 DB에서 사용자 존재 확인
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
      return NextResponse.json(
        { error: "사용자 정보를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 연관 데이터(학생/학부모/교사/직원/관리자) 자동 cascade 삭제
    await prisma.user.delete({ where: { id: user.id } });

    // 세션 쿠키 만료
    const response = NextResponse.json({
      message: "회원 탈퇴가 완료되었습니다.",
    });
    response.cookies.set("user-session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
    });
    return response;
  } catch (error) {
    console.error("회원 탈퇴 오류:", error);
    return NextResponse.json(
      { error: "회원 탈퇴 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

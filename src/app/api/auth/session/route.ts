import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    console.log("=== 세션 확인 API 시작 ===");

    // user 쿠키에서 사용자 정보 추출 (로그인 API에서 설정한 쿠키)
    const userCookie = request.cookies.get("user");
    const sessionCookie = request.cookies.get("session");
    
    console.log("쿠키 존재:", { user: !!userCookie, session: !!sessionCookie });

    if (!userCookie || !sessionCookie) {
      console.log("쿠키 없음");
      return NextResponse.json({ user: null, isFirstLogin: false });
    }

    let userData;
    try {
      userData = JSON.parse(userCookie.value);
      console.log("사용자 데이터 파싱 성공:", {
        userId: userData?.id,
        userRole: userData?.role,
        userEmail: userData?.email,
      });
    } catch (parseError) {
      console.error("쿠키 파싱 실패:", parseError);
      return NextResponse.json({ user: null, isFirstLogin: false });
    }

    if (!userData?.id) {
      console.log("유효하지 않은 사용자 데이터");
      return NextResponse.json({ user: null, isFirstLogin: false });
    }

    // DB에서 최신 사용자 정보 가져오기
    console.log("사용자 정보 조회 중:", userData.id);
    const dbUser = await prisma.user.findUnique({
      where: { id: userData.id },
      include: {
        student: true,
        teacher: true,
        staff: true,
        admin: true,
      },
    });

    if (!dbUser) {
      console.log("사용자 정보 없음");
      return NextResponse.json({ user: null });
    }

    console.log("사용자 정보 조회 성공:", {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      name: dbUser.name,
    });

    // 비밀번호 제거
    const { password: _, ...userWithoutPassword } = dbUser;

    return NextResponse.json({ 
      user: userWithoutPassword,
      mustChangePassword: dbUser.isFirstLogin === true,
      isFirstLogin: dbUser.isFirstLogin === true, // 명시적으로 boolean으로 반환
    });
  } catch (error) {
    console.error("=== 세션 확인 API 오류 ===");
    console.error(
      "오류 타입:",
      error instanceof Error ? error.constructor.name : typeof error,
    );
    console.error(
      "오류 메시지:",
      error instanceof Error ? error.message : String(error),
    );
    console.error(
      "오류 스택:",
      error instanceof Error ? error.stack : "No stack trace",
    );

    return NextResponse.json({ user: null });
  }
}

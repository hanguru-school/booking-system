import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    console.log("인증 확인 API 시작");
    
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session");
    const userCookie = cookieStore.get("user");

    console.log("쿠키 확인:", {
      hasSession: !!sessionToken,
      hasUser: !!userCookie
    });

    if (!sessionToken || !userCookie) {
      console.log("세션 또는 사용자 쿠키가 없음");
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    try {
      const userData = JSON.parse(userCookie.value);
      console.log("사용자 데이터 확인:", {
        id: userData.id,
        email: userData.email,
        role: userData.role
      });

      return NextResponse.json({
        success: true,
        user: userData,
        authenticated: true
      });
    } catch (parseError) {
      console.error("사용자 데이터 파싱 오류:", parseError);
      return NextResponse.json(
        { error: "사용자 데이터 형식이 올바르지 않습니다." },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("인증 확인 오류:", error);
    return NextResponse.json(
      { error: "인증 확인 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

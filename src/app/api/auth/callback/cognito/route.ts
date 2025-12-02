import { NextRequest, NextResponse } from "next/server";
import { handleCognitoCallback, createAuthSuccessResponse } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code) {
      return NextResponse.json(
        { success: false, message: "인증 코드가 없습니다." },
        { status: 400 }
      );
    }

    // Cognito 콜백 처리
    const result = await handleCognitoCallback(code, state || "");
    
    if (!result.success || !result.user) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    console.log("Authentication successful for user:", result.user.email);

    // 성공 응답 생성
    const response = createAuthSuccessResponse(result.user, result.token || "");

    // 리다이렉트 URL 생성
    const redirectUrl = new URL("/auth/success", request.url);
    redirectUrl.searchParams.set("user", result.user.email);
    redirectUrl.searchParams.set("token", result.token || "");

    // 리다이렉트 헤더 설정
    response.headers.set("Location", redirectUrl.toString());
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");

    return response;
  } catch (error) {
    console.error("Cognito callback error:", error);
    return NextResponse.json(
      { success: false, message: "인증 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

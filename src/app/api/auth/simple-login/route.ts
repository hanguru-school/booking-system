import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("=== SIMPLE LOGIN API CALLED ===");

    const body = await request.json();
    console.log("Request body:", body);

    const { email, password } = body;

    if (!email || !password) {
      console.log("Missing email or password");
      return NextResponse.json(
        { error: "이메일과 비밀번호를 입력해주세요." },
        { status: 400 },
      );
    }

    console.log("Login attempt:", { email, password });

    // 하드코딩된 인증 (테스트용)
    if (email === "hanguru.school@gmail.com" && password === "Alfl1204!") {
      const user = {
        id: "1",
        email: "hanguru.school@gmail.com",
        name: "관리자",
        role: "admin",
        cognitoUserId: "simple_admin_001",
      };

      const token = "mock-token-" + Date.now();

      console.log("Login successful:", user);

      return NextResponse.json({
        success: true,
        user,
        token,
        message: "로그인에 성공했습니다.",
      });
    } else {
      console.log("Login failed: Invalid credentials");
      return NextResponse.json(
        { error: "이메일 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 },
      );
    }
  } catch (error) {
    console.error("Simple login error:", error);
    return NextResponse.json(
      { error: "로그인 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

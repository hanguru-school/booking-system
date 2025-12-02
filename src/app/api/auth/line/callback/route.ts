import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // 입회/로그인 모드 구분
  const isRegisterMode = state?.startsWith("register_");

  if (error) {
    console.error("LINE login error:", error);
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=line_login_failed&message=${encodeURIComponent("LINE 로그인에 실패했습니다.")}`,
        request.url,
      ),
    );
  }

  if (!code) {
    console.error("No authorization code received");
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=no_authorization_code&message=${encodeURIComponent("인증 코드를 받지 못했습니다.")}`,
        request.url,
      ),
    );
  }

  try {
    // LINE Access Token 교환
    const tokenResponse = await fetch("https://api.line.me/oauth2/v2.1/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.NEXT_PUBLIC_LINE_REDIRECT_URI!,
        client_id: process.env.NEXT_PUBLIC_LINE_CLIENT_ID!,
        client_secret: process.env.LINE_CHANNEL_SECRET!,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("LINE token exchange failed:", tokenData);
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=token_exchange_failed&message=${encodeURIComponent("토큰 교환에 실패했습니다.")}`,
          request.url,
        ),
      );
    }

    // LINE 프로필 정보 가져오기
    const profileResponse = await fetch("https://api.line.me/v2/profile", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const profileData = await profileResponse.json();

    if (!profileResponse.ok) {
      console.error("LINE profile fetch failed:", profileData);
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=profile_fetch_failed&message=${encodeURIComponent("프로필 정보를 가져오는데 실패했습니다.")}`,
          request.url,
        ),
      );
    }

    console.log("LINE profile data:", profileData);

    // 사용자 정보 처리 및 로그인/입회
    const lineUserId = profileData.userId;
    const displayName = profileData.displayName;
    const pictureUrl = profileData.pictureUrl;

    // 기존 사용자 확인
    let user = await prisma.user.findFirst({
      where: {
        email: `${lineUserId}@line.user`,
      },
    });

    if (!user) {
      // 새 사용자 생성
      user = await prisma.user.create({
        data: {
          email: `${lineUserId}@line.user`,
          name: displayName,
          password: "", // LINE 로그인은 비밀번호 없음
          role: "STUDENT", // 기본 역할
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } else {
      // 기존 사용자 정보 업데이트
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: displayName,
          updatedAt: new Date(),
        },
      });
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" },
    );

    // 세션 쿠키 설정
    const response = NextResponse.redirect(
      new URL(
        isRegisterMode
          ? `/auth/line-register?success=line_register&message=${encodeURIComponent("LINE 입회가 성공했습니다!")}`
          : `/auth/login?success=line_login&message=${encodeURIComponent("LINE 로그인이 성공했습니다!")}`,
        request.url,
      ),
    );

    // JWT 토큰을 쿠키에 설정
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7일
    });

    return response;
  } catch (error) {
    console.error("LINE login callback error:", error);
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=callback_error&message=${encodeURIComponent("로그인 처리 중 오류가 발생했습니다.")}`,
        request.url,
      ),
    );
  }
}

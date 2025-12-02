import { NextRequest, NextResponse } from "next/server";
import { signIn, getUserAttributes } from "@/lib/cognito";

export async function POST(request: NextRequest) {
  try {
    console.log("=== Cognito 로그인 API 호출됨 ===");

    const { email, password } = await request.json();
    console.log("로그인 요청:", {
      email,
      password: password ? "***" : "undefined",
    });

    if (!email || !password) {
      console.log("이메일 또는 비밀번호 누락");
      return NextResponse.json(
        {
          success: false,
          message: "이메일과 비밀번호를 입력해주세요.",
        },
        { status: 400 },
      );
    }

    try {
      // Cognito 로그인
      const result = await signIn(email, password);
      console.log("Cognito 로그인 성공:", result);

      // 사용자 속성 가져오기
      let userAttributes;
      try {
        userAttributes = await getUserAttributes();
        console.log("사용자 속성:", userAttributes);
      } catch (attrError) {
        console.log("사용자 속성 가져오기 실패:", attrError);
        userAttributes = {};
      }

      // 로그인 성공 시 응답
      const response = NextResponse.json({
        success: true,
        message: "로그인에 성공했습니다.",
        user: {
          email: email,
          name: userAttributes.name || email,
          role: userAttributes["custom:role"] || "STUDENT",
          attributes: userAttributes,
        },
        tokens: {
          accessToken: result.accessToken,
          idToken: result.idToken,
          refreshToken: result.refreshToken,
        },
      });

      // 토큰을 쿠키에 저장
      response.cookies.set("cognito-access-token", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60, // 1시간
      });

      response.cookies.set("cognito-id-token", result.idToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60, // 1시간
      });

      console.log("Cognito 로그인 API 응답 완료");
      return response;
    } catch (cognitoError: any) {
      console.error("Cognito 로그인 실패:", cognitoError);

      // Cognito 에러 메시지 처리
      let errorMessage = "로그인에 실패했습니다.";

      if (cognitoError.message) {
        if (cognitoError.message.includes("NotAuthorizedException")) {
          errorMessage = "이메일 또는 비밀번호가 올바르지 않습니다.";
        } else if (cognitoError.message.includes("UserNotConfirmedException")) {
          errorMessage = "계정이 아직 확인되지 않았습니다.";
        } else if (cognitoError.message.includes("UserNotFoundException")) {
          errorMessage = "존재하지 않는 계정입니다.";
        } else {
          errorMessage = cognitoError.message;
        }
      }

      return NextResponse.json(
        {
          success: false,
          message: errorMessage,
        },
        { status: 401 },
      );
    }
  } catch (error) {
    console.error("로그인 API 오류:", error);
    return NextResponse.json(
      {
        success: false,
        message: "로그인 중 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}

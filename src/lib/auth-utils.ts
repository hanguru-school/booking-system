// Cognito-based Authentication Utilities for MalMoi System

import { NextRequest, NextResponse } from "next/server";
// AWS Cognito 사용 안 함 - import 주석 처리
// import { CognitoIdentityProviderClient, InitiateAuthCommand, SignUpCommand, ConfirmSignUpCommand, ForgotPasswordCommand, ConfirmForgotPasswordCommand } from "@aws-sdk/client-cognito-identity-provider";
import jwt from "jsonwebtoken";

// 타입 정의
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  token?: string;
  message: string;
}

// 세션 타입 정의 (API 라우트에서 사용)
export interface Session {
  user: AuthUser;
}

// Cognito 클라이언트 초기화 (AWS 사용 안 함 - 주석 처리)
// const cognitoClient = new CognitoIdentityProviderClient({
//   region: process.env.AWS_REGION || "ap-northeast-1",
// });

// JWT 토큰 생성
export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || "fallback-secret",
    { expiresIn: "24h" }
  );
}

// JWT 토큰 검증
export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as AuthUser;
    return decoded;
  } catch (error) {
    console.error("토큰 검증 실패:", error);
    return null;
  }
}

// 사용자 인증 미들웨어
export function createAuthMiddleware() {
  return (req: NextRequest, res: NextResponse, next: () => void) => {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: "인증 토큰이 필요합니다." },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "유효하지 않은 토큰입니다." },
        { status: 401 }
      );
    }

    // 사용자 정보를 요청 객체에 추가
    (req as any).user = user;
    next();
  };
}

// Cognito 콜백 처리
export async function handleCognitoCallback(code: string, state: string): Promise<AuthResponse> {
  try {
    // 실제로는 Cognito에서 토큰을 교환해야 함
    const user: AuthUser = {
      id: "user-id",
      email: "user@example.com",
      name: "사용자",
      role: "student",
    };

    const token = generateToken(user);

    return {
      success: true,
      user,
      token,
      message: "인증 성공",
    };
  } catch (error) {
    console.error("Cognito 콜백 처리 오류:", error);
    return {
      success: false,
      message: "인증 처리 중 오류가 발생했습니다.",
    };
  }
}

// 인증 성공 응답 생성
export function createAuthSuccessResponse(user: AuthUser, token: string): NextResponse {
  const response = NextResponse.json({
    success: true,
    user,
    token,
    message: "인증 성공",
  });

  // 쿠키 설정
  response.cookies.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60, // 24시간
  });

  return response;
}

// 쿠키에서 세션 가져오기
export function getSessionFromCookies(request: NextRequest): Session | null {
  try {
    // session과 user 쿠키 확인
    const sessionCookie = request.cookies.get("session")?.value;
    const userCookie = request.cookies.get("user")?.value;
    
    if (!sessionCookie || !userCookie) {
      return null;
    }

    // user 쿠키에서 사용자 정보 파싱
    const user = JSON.parse(userCookie);
    
    if (!user || !user.id) {
      return null;
    }

    return { user };
  } catch (error) {
    console.error("세션 파싱 오류:", error);
    return null;
  }
}

// Cognito 로그인 (AWS 사용 안 함 - 비활성화)
export async function cognitoLogin(email: string, password: string): Promise<AuthResponse> {
  // AWS Cognito를 사용하지 않으므로 데이터베이스 기반 로그인으로 대체
  return {
    success: false,
    message: "Cognito 로그인은 사용할 수 없습니다. 데이터베이스 로그인을 사용하세요.",
  };
}

// Cognito 회원가입 (AWS 사용 안 함 - 비활성화)
export async function cognitoSignUp(email: string, password: string, name: string): Promise<AuthResponse> {
  return {
    success: false,
    message: "Cognito 회원가입은 사용할 수 없습니다. 데이터베이스 기반 회원가입을 사용하세요.",
  };
}

// Cognito 회원가입 확인 (AWS 사용 안 함 - 비활성화)
export async function cognitoConfirmSignUp(email: string, code: string): Promise<AuthResponse> {
  return {
    success: false,
    message: "Cognito 회원가입 확인은 사용할 수 없습니다.",
  };
}

// 비밀번호 재설정 요청 (AWS 사용 안 함 - 비활성화)
export async function cognitoForgotPassword(email: string): Promise<AuthResponse> {
  return {
    success: false,
    message: "Cognito 비밀번호 재설정은 사용할 수 없습니다. 데이터베이스 기반 비밀번호 재설정을 사용하세요.",
  };
}

// 비밀번호 재설정 확인 (AWS 사용 안 함 - 비활성화)
export async function cognitoConfirmForgotPassword(email: string, code: string, newPassword: string): Promise<AuthResponse> {
  return {
    success: false,
    message: "Cognito 비밀번호 재설정 확인은 사용할 수 없습니다.",
  };
}

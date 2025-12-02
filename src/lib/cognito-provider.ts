// AWS Cognito OAuth Provider for MalMoi System
// Region: ap-northeast-1 (Tokyo)
// User Pool: malmoi-system-pool
// App Client: malmoi-system

import { validateEnvironment } from "./env-validator";

// 기본 설정값들
const DEFAULT_CONFIG = {
  region: "ap-northeast-1",
  userPoolId: "ap-northeast-1_5R7g8tN40",
  clientId: "4bdn0n9r92huqpcs21e0th1nve",
  clientSecret: "9ko7sn73f63en08gqh8uhhmvaagmt2o1vn9gnffjcgoecjskf8e",
  domain: "https://malmoi-system-pool.auth.ap-northeast-1.amazoncognito.com",
  redirectUri: process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/api/auth/callback/cognito` : "http://192.168.1.41:3000/api/auth/callback/cognito",
  scopes: ["openid", "email", "profile", "phone"],
  responseType: "code",
};

// 환경 변수에서 설정 가져오기 (기본값 사용)
export const cognitoConfig = {
  region: process.env.COGNITO_REGION || DEFAULT_CONFIG.region,
  userPoolId: process.env.COGNITO_USER_POOL_ID || DEFAULT_CONFIG.userPoolId,
  clientId: process.env.COGNITO_CLIENT_ID || DEFAULT_CONFIG.clientId,
  clientSecret:
    process.env.COGNITO_CLIENT_SECRET || DEFAULT_CONFIG.clientSecret,
  domain: process.env.COGNITO_DOMAIN || DEFAULT_CONFIG.domain,
  redirectUri:
    process.env.NEXT_PUBLIC_COGNITO_CALLBACK_URL || DEFAULT_CONFIG.redirectUri,
  scopes:
    process.env.NEXT_PUBLIC_COGNITO_OAUTH_SCOPES?.split(" ") ||
    DEFAULT_CONFIG.scopes,
  responseType:
    process.env.COGNITO_RESPONSE_TYPE || DEFAULT_CONFIG.responseType,
};

console.log("Cognito Config:", {
  region: cognitoConfig.region,
  userPoolId: cognitoConfig.userPoolId,
  clientId: cognitoConfig.clientId,
  domain: cognitoConfig.domain,
  redirectUri: cognitoConfig.redirectUri,
  scopes: cognitoConfig.scopes,
});

/**
 * OAuth Authorization URL 생성
 * @param state - CSRF 보호를 위한 상태값
 * @returns Cognito OAuth URL
 */
export function createOAuthUrl(state?: string): string {
  const url = new URL(`${cognitoConfig.domain}/oauth2/authorize`);

  // 필수 OAuth 파라미터
  url.searchParams.set("response_type", cognitoConfig.responseType);
  url.searchParams.set("client_id", cognitoConfig.clientId);
  url.searchParams.set("redirect_uri", cognitoConfig.redirectUri);
  url.searchParams.set("scope", cognitoConfig.scopes.join(" "));

  // 상태 파라미터 (CSRF 보호)
  const stateValue =
    state || `malmoi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  url.searchParams.set("state", stateValue);

  // 추가 파라미터
  url.searchParams.set("identity_provider", "COGNITO");

  console.log("Generated OAuth URL:", url.toString());
  return url.toString();
}

/**
 * Authorization Code를 Access Token으로 교환
 * @param code - Cognito에서 받은 authorization code
 * @param state - 원래 요청의 state 값
 * @returns 토큰 정보
 */
export async function exchangeCodeForToken(
  code: string,
  state?: string,
): Promise<{
  success: boolean;
  accessToken?: string;
  idToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  error?: string;
}> {
  try {
    const tokenUrl = `${cognitoConfig.domain}/oauth2/token`;

    // 토큰 교환 요청 파라미터
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("client_id", cognitoConfig.clientId);
    params.append("code", code);
    params.append("redirect_uri", cognitoConfig.redirectUri);

    // Client Secret이 있는 경우 추가
    if (cognitoConfig.clientSecret) {
      params.append("client_secret", cognitoConfig.clientSecret);
    }

    console.log("Token exchange request:", {
      url: tokenUrl,
      clientId: cognitoConfig.clientId,
      redirectUri: cognitoConfig.redirectUri,
      hasClientSecret: !!cognitoConfig.clientSecret,
      codeLength: code.length,
    });

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    console.log("Token exchange response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Token exchange error response:", errorText);
      throw new Error(
        `Token exchange failed: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    const tokenData = await response.json();

    console.log("Token exchange success:", {
      hasAccessToken: !!tokenData.access_token,
      hasIdToken: !!tokenData.id_token,
      hasRefreshToken: !!tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      tokenType: tokenData.token_type,
    });

    return {
      success: true,
      accessToken: tokenData.access_token,
      idToken: tokenData.id_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
    };
  } catch (error: any) {
    console.error("Token exchange error:", error);
    return {
      success: false,
      error: error.message || "토큰 교환에 실패했습니다.",
    };
  }
}

/**
 * ID Token에서 사용자 정보 추출
 * @param idToken - Cognito ID Token
 * @returns 사용자 정보
 */
export function parseIdToken(idToken: string): {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  role?: string;
  aud: string;
  iss: string;
  exp: number;
  iat: number;
} {
  try {
    const payload = JSON.parse(
      Buffer.from(idToken.split(".")[1], "base64").toString(),
    );
    console.log("Parsed ID Token payload:", {
      sub: payload.sub,
      email: payload.email,
      email_verified: payload.email_verified,
      custom_role: payload["custom:role"],
      aud: payload.aud,
      iss: payload.iss,
      exp: payload.exp,
      iat: payload.iat,
    });

    return {
      sub: payload.sub,
      email: payload.email,
      email_verified: payload.email_verified,
      name: payload.name,
      role: payload["custom:role"],
      aud: payload.aud,
      iss: payload.iss,
      exp: payload.exp,
      iat: payload.iat,
    };
  } catch (error) {
    console.error("Failed to parse ID token:", error);
    throw new Error("ID Token 파싱에 실패했습니다.");
  }
}

/**
 * 사용자 역할에 따른 리디렉트 URL 결정
 * @param role - 사용자 역할
 * @returns 리디렉트 URL
 */
export function getRedirectUrlByRole(role?: string): string {
  switch (role) {
    case "STUDENT":
      return "/student/home";
    case "PARENT":
      return "/parent/home";
    case "TEACHER":
      return "/teacher/home";
    case "STAFF":
      return "/staff/home";
    case "ADMIN":
      return "/admin/dashboard";
    default:
      return "/student/home";
  }
}

/**
 * Cognito 로그아웃 URL 생성
 * @param redirectUri - 로그아웃 후 리디렉트할 URL
 * @returns 로그아웃 URL
 */
export function createLogoutUrl(redirectUri?: string): string {
  const logoutUrl = new URL(`${cognitoConfig.domain}/logout`);
  logoutUrl.searchParams.set("client_id", cognitoConfig.clientId);

  if (redirectUri) {
    logoutUrl.searchParams.set("logout_uri", redirectUri);
  }

  return logoutUrl.toString();
}

/**
 * Cognito 설정 검증
 * @returns 설정이 유효한지 여부
 */
export function validateCognitoConfig(): boolean {
  // 환경 변수 검증
  const envValidation = validateEnvironment();
  if (!envValidation.isValid) {
    console.error("Environment validation failed:", envValidation);
    return false;
  }

  const requiredFields = [
    "region",
    "userPoolId",
    "clientId",
    "domain",
    "redirectUri",
  ];

  for (const field of requiredFields) {
    if (!cognitoConfig[field as keyof typeof cognitoConfig]) {
      console.error(`Missing required Cognito config: ${field}`);
      return false;
    }
  }

  console.log("Cognito config validation passed");
  return true;
}

// 설정 검증 실행
validateCognitoConfig();

import { NextResponse } from "next/server";
import { checkPrismaConnection } from "@/lib/prisma";

// 표준화된 API 응답 인터페이스
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

// 간단한 에러 핸들러 (User provided, adapted to ApiResponse interface)
export function handleApiError(
  error: unknown,
  statusCode: string | number = "500",
) {
  console.error("[API ERROR]", error);
  const status = typeof statusCode === 'string' ? parseInt(statusCode, 10) : statusCode;
  return NextResponse.json(
    {
      success: false,
      message: error instanceof Error ? error.message : "서버 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
      timestamp: new Date().toISOString(),
    },
    { status },
  );
}

// 성공 응답 함수
export function createSuccessResponse<T>(
  data: T,
  message: string = "Success",
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
  return NextResponse.json(response, { status: 200 });
}

// 환경변수 검증 함수
export function validateEnvironmentVariables() {
  const missingVars: string[] = [];

  const requiredVars = {
    DATABASE_URL: process.env.DATABASE_URL,
    OBJECT_STORAGE_BUCKET: process.env.OBJECT_STORAGE_BUCKET,
    OBJECT_STORAGE_ACCESS_KEY: process.env.OBJECT_STORAGE_ACCESS_KEY,
    OBJECT_STORAGE_SECRET_KEY: process.env.OBJECT_STORAGE_SECRET_KEY,
    OBJECT_STORAGE_ENDPOINT: process.env.OBJECT_STORAGE_ENDPOINT,
    JWT_SECRET: process.env.JWT_SECRET,
  };

  Object.entries(requiredVars).forEach(([key, value]) => {
    if (!value) {
      missingVars.push(key);
    }
  });

  return {
    isValid: missingVars.length === 0,
    missingVars,
    details: requiredVars,
  };
}

// API 래퍼 함수 (에러 핸들링 포함)
export async function withErrorHandling<T>(
  handler: () => Promise<T>,
  successMessage: string = "Operation completed successfully",
  context: string = "API",
): Promise<NextResponse<ApiResponse<T>>> {
  try {
    const result = await handler();
    return createSuccessResponse(result, successMessage);
  } catch (error) {
    return handleApiError(error, context);
  }
}

// 데이터베이스 연결 확인 함수
export async function checkDatabaseConnection() {
  return await checkPrismaConnection();
}

// AWS Cognito 연결 확인 함수 (AWS 사용 안 함 - 비활성화)
export async function checkCognitoConnection() {
  return {
    success: false,
    message: "AWS Cognito는 사용하지 않습니다. 데이터베이스 기반 인증을 사용합니다.",
    error: "COGNITO_NOT_USED",
  };
}

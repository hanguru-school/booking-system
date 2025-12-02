import { NextRequest, NextResponse } from "next/server";
import { validateEnvironment, getEnvironmentConfig } from "@/lib/env-validator";

export async function GET(request: NextRequest) {
  try {
    console.log("=== Environment Status API 호출됨 ===");

    const validation = validateEnvironment();
    const config = getEnvironmentConfig();

    // 민감한 정보는 마스킹
    const maskedConfig = {
      ...config,
      COGNITO_CLIENT_SECRET: config.COGNITO_CLIENT_SECRET ? "***" : undefined,
      // AWS RDS 사용 안 함
      JWT_SECRET: config.JWT_SECRET ? "***" : undefined,
      SESSION_SECRET: config.SESSION_SECRET ? "***" : undefined,
      CSRF_SECRET: config.CSRF_SECRET ? "***" : undefined,
    };

    // 환경 변수 그룹별로 분류
    const groupedConfig = {
      database: {
        DATABASE_URL: maskedConfig.DATABASE_URL,
        // AWS RDS 사용 안 함
        DATABASE_URL: maskedConfig.DATABASE_URL ? "***" : undefined,
      },
      object_storage: {
        OBJECT_STORAGE_BUCKET: maskedConfig.OBJECT_STORAGE_BUCKET,
        OBJECT_STORAGE_ENDPOINT: maskedConfig.OBJECT_STORAGE_ENDPOINT,
        OBJECT_STORAGE_FORCE_PATH_STYLE: maskedConfig.OBJECT_STORAGE_FORCE_PATH_STYLE,
      },
      cognito_server: {
        COGNITO_REGION: maskedConfig.COGNITO_REGION,
        COGNITO_USER_POOL_ID: maskedConfig.COGNITO_USER_POOL_ID,
        COGNITO_CLIENT_ID: maskedConfig.COGNITO_CLIENT_ID,
        COGNITO_CLIENT_SECRET: maskedConfig.COGNITO_CLIENT_SECRET,
        COGNITO_DOMAIN: maskedConfig.COGNITO_DOMAIN,
        COGNITO_RESPONSE_TYPE: maskedConfig.COGNITO_RESPONSE_TYPE,
      },
      cognito_client: {
        NEXT_PUBLIC_COGNITO_REGION: maskedConfig.NEXT_PUBLIC_COGNITO_REGION,
        NEXT_PUBLIC_COGNITO_USER_POOL_ID:
          maskedConfig.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
        NEXT_PUBLIC_COGNITO_CLIENT_ID:
          maskedConfig.NEXT_PUBLIC_COGNITO_CLIENT_ID,
        NEXT_PUBLIC_COGNITO_DOMAIN: maskedConfig.NEXT_PUBLIC_COGNITO_DOMAIN,
        NEXT_PUBLIC_COGNITO_CALLBACK_URL:
          maskedConfig.NEXT_PUBLIC_COGNITO_CALLBACK_URL,
        NEXT_PUBLIC_COGNITO_SIGNOUT_URL:
          maskedConfig.NEXT_PUBLIC_COGNITO_SIGNOUT_URL,
        NEXT_PUBLIC_COGNITO_OAUTH_SCOPES:
          maskedConfig.NEXT_PUBLIC_COGNITO_OAUTH_SCOPES,
        NEXT_PUBLIC_COGNITO_RESPONSE_TYPE:
          maskedConfig.NEXT_PUBLIC_COGNITO_RESPONSE_TYPE,
      },
      authentication: {
        JWT_SECRET: maskedConfig.JWT_SECRET,
        SESSION_SECRET: maskedConfig.SESSION_SECRET,
        AUTH_BASE_URL: maskedConfig.AUTH_BASE_URL,
      },
      security: {
        CORS_ORIGIN: maskedConfig.CORS_ORIGIN,
        CSRF_SECRET: maskedConfig.CSRF_SECRET,
      },
      environment: {
        NODE_ENV: maskedConfig.NODE_ENV,
        NEXT_PUBLIC_NODE_ENV: maskedConfig.NEXT_PUBLIC_NODE_ENV,
      },
    };

    const response = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      validation: {
        isValid: validation.isValid,
        missingVars: validation.missingVars,
        invalidVars: validation.invalidVars,
        warnings: validation.warnings,
      },
      config: groupedConfig,
      summary: {
        totalVars: Object.keys(config).length,
        missingVars: validation.missingVars.length,
        invalidVars: validation.invalidVars.length,
        warnings: validation.warnings.length,
        status: validation.isValid ? "healthy" : "unhealthy",
      },
      system_info: {
        node_version: process.version,
        platform: process.platform,
        memory_usage: process.memoryUsage(),
        uptime: process.uptime(),
      },
    };

    console.log("Environment Status:", {
      isValid: validation.isValid,
      missingCount: validation.missingVars.length,
      invalidCount: validation.invalidVars.length,
      warningCount: validation.warnings.length,
    });

    return NextResponse.json(response, {
      status: validation.isValid ? 200 : 500,
    });
  } catch (error: any) {
    console.error("Environment Status API 오류:", error);
    return NextResponse.json(
      {
        error: "환경 변수 상태 확인 중 오류가 발생했습니다.",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

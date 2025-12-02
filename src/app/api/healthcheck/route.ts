import {
  handleApiError,
  createSuccessResponse,
  checkDatabaseConnection,
  validateEnvironmentVariables,
} from "@/lib/api-utils";

export const runtime = "nodejs";

export async function GET() {
  try {
    console.log("Healthcheck API called");

    // 환경변수 검증
    const envValidation = validateEnvironmentVariables();

    // 데이터베이스 연결 테스트
    const dbCheck = await checkDatabaseConnection();

    // AWS Cognito는 사용하지 않음 (데이터베이스 기반 인증 사용)

    const healthData = {
      timestamp: new Date().toISOString(),
      system: {
        name: "Hanguru School Booking System",
        version: "1.0.0",
        environment: process.env.NODE_ENV || "development",
      },
      infrastructure: {
        platform: "Ubuntu 24.04 LTS",
        domain: process.env.NEXTAUTH_URL || "http://192.168.1.41:3000",
        database: "PostgreSQL (local)",
        authentication: "Database-based",
        storage: process.env.OBJECT_STORAGE_ENDPOINT ? "Object Storage (MinIO)" : "not_configured",
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        isValid: envValidation.isValid,
        missingVars: envValidation.missingVars,
        totalVars: Object.keys(envValidation.details).length,
      },
      database: {
        status: dbCheck.success ? "connected" : "failed",
        message: dbCheck.message,
        error: dbCheck.error || null,
        host:
          process.env.DB_HOST ||
          "localhost",
      },
      storage: {
        status: process.env.OBJECT_STORAGE_ENDPOINT ? "configured" : "missing",
        endpoint: process.env.OBJECT_STORAGE_ENDPOINT || "not_configured",
        bucket: process.env.OBJECT_STORAGE_BUCKET || "not_configured",
      },
      overall: {
        status:
          dbCheck.success && envValidation.isValid
            ? "healthy"
            : "unhealthy",
        message: "시스템 상태 확인 완료",
        checks: {
          environment: envValidation.isValid,
          database: dbCheck.success,
          storage: !!process.env.OBJECT_STORAGE_ENDPOINT,
        },
      },
    };

    console.log("Healthcheck completed successfully");
    return createSuccessResponse(
      healthData,
      "시스템 상태 확인이 완료되었습니다.",
    );
  } catch (error) {
    console.error("Healthcheck API error:", error);
    return handleApiError(error, "GET /api/healthcheck");
  }
}

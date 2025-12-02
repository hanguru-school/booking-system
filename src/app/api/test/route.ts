import {
  handleApiError,
  createSuccessResponse,
  checkDatabaseConnection,
  validateEnvironmentVariables,
} from "@/lib/api-utils";

export const runtime = "nodejs";

export async function GET() {
  try {
    console.log("Test API called");

    const report: any = {
      timestamp: new Date().toISOString(),
      environment: null,
      database: null,
      cognito: null,
      jwt: null,
    };

    // 1) 환경변수 검증
    const envValidation = validateEnvironmentVariables();
    report.environment = envValidation.isValid
      ? `✅ 환경변수 설정 완료`
      : `❌ 환경변수 누락: ${envValidation.missingVars.join(", ")}`;

    // 2) DB 연결 테스트
    const dbCheck = await checkDatabaseConnection();
    report.database = dbCheck.success
      ? `✅ DB 연결 성공`
      : `❌ DB 연결 실패: ${dbCheck.error}`;

    // 3) AWS Cognito 연결 테스트 (사용 안 함)
    report.cognito = `⚠️ AWS Cognito는 사용하지 않습니다. 데이터베이스 기반 인증 사용`;

    // 4) JWT 테스트
    try {
      const jwt = await import("jsonwebtoken");
      const testPayload = { test: "ok", timestamp: Date.now() };
      const token = jwt.sign(
        testPayload,
        process.env.JWT_SECRET || "fallback",
        { expiresIn: "1m" },
      );
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback");
      report.jwt = `✅ JWT 생성/검증 성공 (${JSON.stringify(decoded)})`;
    } catch (err: any) {
      report.jwt = `❌ JWT 실패: ${err.message}`;
    }

    console.log("Test API completed successfully");
    return createSuccessResponse(report, "시스템 테스트가 완료되었습니다.");
  } catch (error) {
    console.error("Test API error:", error);
    return handleApiError(error, "GET /api/test");
  }
}

export async function POST(request: Request) {
  try {
    console.log("Test API POST called");

    const body = await request.json().catch(() => ({}));

    return createSuccessResponse(
      {
        received: body,
        timestamp: new Date().toISOString(),
        message: "POST 요청이 성공적으로 처리되었습니다.",
      },
      "테스트 POST 요청이 성공했습니다.",
    );
  } catch (error) {
    console.error("Test API POST error:", error);
    return handleApiError(error, "POST /api/test");
  }
}

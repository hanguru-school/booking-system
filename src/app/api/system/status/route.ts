import { NextRequest, NextResponse } from "next/server";
import { validateEnvironment } from "@/lib/env-validator";

export async function GET(request: NextRequest) {
  try {
    console.log("=== System Status API 호출됨 ===");

    const validation = validateEnvironment();

    // 시스템 상태 체크
    const systemStatus = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,

      // 환경 변수 상태
      environment_variables: {
        status: validation.isValid ? "healthy" : "unhealthy",
        total_variables: Object.keys(process.env).length,
        missing_variables: validation.missingVars.length,
        invalid_variables: validation.invalidVars.length,
        warnings: validation.warnings.length,
      },

      // 시스템 정보
      system_info: {
        node_version: process.version,
        platform: process.platform,
        architecture: process.arch,
        memory_usage: {
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + " MB",
          heapTotal:
            Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + " MB",
          heapUsed:
            Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + " MB",
          external:
            Math.round(process.memoryUsage().external / 1024 / 1024) + " MB",
        },
        uptime: Math.round(process.uptime()) + " seconds",
        cpu_usage: process.cpuUsage(),
      },

      // 애플리케이션 상태
      application: {
        status: "running",
        version: "1.0.0",
        build_time: process.env.BUILD_TIME || "unknown",
        deployment_environment: process.env.NODE_ENV || "unknown",
      },

      // 서비스 상태
      services: {
        database: {
          status: "unknown", // 실제 DB 연결 테스트 필요
          connection_string: process.env.DATABASE_URL
            ? "configured"
            : "missing",
        },
        authentication: {
          status: "database-based",
          type: "local_database",
          note: "AWS Cognito는 사용하지 않습니다",
        },
        storage: {
          status: process.env.OBJECT_STORAGE_BUCKET ? "configured" : "missing",
          bucket: process.env.OBJECT_STORAGE_BUCKET || "missing",
          endpoint: process.env.OBJECT_STORAGE_ENDPOINT || "missing",
        },
      },

      // 보안 상태
      security: {
        jwt_secret: process.env.JWT_SECRET ? "configured" : "missing",
        session_secret: process.env.SESSION_SECRET ? "configured" : "missing",
        csrf_secret: process.env.CSRF_SECRET ? "configured" : "missing",
        cors_origin: process.env.CORS_ORIGIN || "missing",
      },

      // 전체 상태
      overall_status: validation.isValid ? "healthy" : "unhealthy",

      // 권장사항
      recommendations: [] as string[],
    };

    // 권장사항 생성
    if (validation.missingVars.length > 0) {
      systemStatus.recommendations.push(
        `Missing ${validation.missingVars.length} environment variables`,
      );
    }

    if (validation.invalidVars.length > 0) {
      systemStatus.recommendations.push(
        `Invalid ${validation.invalidVars.length} environment variables`,
      );
    }

    if (validation.warnings.length > 0) {
      systemStatus.recommendations.push(
        `${validation.warnings.length} configuration warnings`,
      );
    }

    if (systemStatus.recommendations.length === 0) {
      systemStatus.recommendations.push("System is properly configured");
    }

    console.log("System Status:", {
      overallStatus: systemStatus.overall_status,
      envStatus: systemStatus.environment_variables.status,
      recommendations: systemStatus.recommendations.length,
    });

    return NextResponse.json(systemStatus, {
      status: systemStatus.overall_status === "healthy" ? 200 : 500,
    });
  } catch (error: any) {
    console.error("System Status API 오류:", error);
    return NextResponse.json(
      {
        error: "시스템 상태 확인 중 오류가 발생했습니다.",
        details: error.message,
        timestamp: new Date().toISOString(),
        status: "error",
      },
      { status: 500 },
    );
  }
}

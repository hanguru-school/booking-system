import { NextRequest, NextResponse } from "next/server";
import { handleApiError, validateEnvironmentVariables } from "@/lib/api-utils";
import jwt from "jsonwebtoken";

// Node.js 런타임 명시
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // 환경변수 검증
    const envCheck = validateEnvironmentVariables();
    if (!envCheck.isValid) {
      console.error("환경변수 누락:", envCheck.missingVars);
      return handleApiError(
        new Error(
          `Configuration error: Missing ${envCheck.missingVars.join(", ")}`,
        ),
        500,
      );
    }

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return handleApiError(new Error("Token is required"), 400);
    }

    // JWT 토큰 검증
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret",
    );

    // 타입 안전성을 위한 체크
    if (typeof decoded === 'string' || !decoded || typeof decoded !== 'object') {
      return handleApiError(new Error("Invalid token format"), 401);
    }

    const typedDecoded = decoded as { userId: string; email: string; role: string };
    
    if (!typedDecoded.userId) {
      return handleApiError(new Error("Token missing userId"), 401);
    }

    // 사용자 정보 가져오기
    const { getUserById } = await import("@/lib/database");
    const user = await getUserById(typedDecoded.userId);

    if (!user) {
      return handleApiError(new Error("User not found"), 404);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token: decoded,
      message: "Token verification successful",
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "JsonWebTokenError") {
        return handleApiError(new Error("Invalid token"), 401);
      }
      if (error.name === "TokenExpiredError") {
        return handleApiError(new Error("Token expired"), 401);
      }
    }

    return handleApiError(error, 500);
  }
}

export async function GET(_request: NextRequest) {
  try {
    // 환경변수 검증
    const envCheck = validateEnvironmentVariables();
    if (!envCheck.isValid) {
      return handleApiError(
        new Error(
          `Configuration error: Missing ${envCheck.missingVars.join(", ")}`,
        ),
        500,
      );
    }

    return NextResponse.json({
      message: "Token verification endpoint is available",
      method: "POST",
      requiredFields: ["token"],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error, 500);
  }
}

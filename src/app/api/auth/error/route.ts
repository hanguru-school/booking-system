import { NextResponse } from "next/server";
import { handleApiError, createSuccessResponse } from "@/lib/api-utils";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (!error) {
      return createSuccessResponse(
        {
          error: "NO_ERROR",
          message: "에러가 발생하지 않았습니다.",
          timestamp: new Date().toISOString(),
        },
        "정상 상태입니다.",
      );
    }

    // 표준화된 에러 응답
    const errorResponse = {
      error,
      errorDescription: errorDescription || "알 수 없는 오류가 발생했습니다.",
      timestamp: new Date().toISOString(),
      requestId: Math.random().toString(36).substring(7),
    };

    return NextResponse.json(
      {
        success: false,
        message: "인증 오류가 발생했습니다.",
        data: errorResponse,
      },
      { status: 400 },
    );
  } catch (error) {
    return handleApiError(error, "에러 처리 중 오류가 발생했습니다.");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const errorResponse = {
      error: body.error || "UNKNOWN_ERROR",
      errorDescription:
        body.errorDescription || "알 수 없는 오류가 발생했습니다.",
      timestamp: new Date().toISOString(),
      requestId: Math.random().toString(36).substring(7),
      details: body.details || null,
    };

    return NextResponse.json(
      {
        success: false,
        message: "인증 오류가 발생했습니다.",
        data: errorResponse,
      },
      { status: 400 },
    );
  } catch (error) {
    return handleApiError(error, "에러 처리 중 오류가 발생했습니다.");
  }
}

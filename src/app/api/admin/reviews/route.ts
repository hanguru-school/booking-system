import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const user = await getSessionFromCookies(request);
    if (!user || (user.role !== "ADMIN" && user.role !== "MASTER")) {
      return NextResponse.json(
        { success: false, message: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    // 현재는 빈 데이터 반환 (실제 구현 시 데이터베이스에서 리뷰 데이터 조회)
    return NextResponse.json({
      success: true,
      reviews: [],
      message: "리뷰 데이터가 없습니다."
    });

  } catch (error) {
    console.error("리뷰 데이터 조회 오류:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const user = await getSessionFromCookies(request);
    if (!user || (user.role !== "ADMIN" && user.role !== "MASTER")) {
      return NextResponse.json(
        { success: false, message: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // 리뷰 답글 등록 로직 (실제 구현 시 데이터베이스에 저장)
    return NextResponse.json({
      success: true,
      message: "리뷰 답글이 등록되었습니다."
    });

  } catch (error) {
    console.error("리뷰 답글 등록 오류:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

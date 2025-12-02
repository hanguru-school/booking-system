import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    console.log("데이터베이스 연결 테스트 시작");
    
    // 간단한 쿼리로 연결 테스트
    const userCount = await prisma.user.count();
    console.log("총 사용자 수:", userCount);
    
    // 마스터 계정 확인
    const masterUser = await prisma.user.findUnique({
      where: { email: "hanguru.school@gmail.com" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
    
    console.log("마스터 계정 확인:", masterUser ? "존재함" : "존재하지 않음");
    
    return NextResponse.json({
      success: true,
      message: "데이터베이스 연결 성공",
      timestamp: new Date().toISOString(),
      data: {
        userCount,
        masterUser: masterUser ? {
          id: masterUser.id,
          email: masterUser.email,
          name: masterUser.name,
          role: masterUser.role,
        } : null,
      },
    });
  } catch (error) {
    console.error("데이터베이스 연결 테스트 오류:", error);
    return NextResponse.json({
      success: false,
      error: "데이터베이스 연결 실패",
      details: error instanceof Error ? error.message : "알 수 없는 오류",
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

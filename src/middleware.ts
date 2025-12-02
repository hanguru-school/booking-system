import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 최소한의 middleware - 모든 요청을 통과시킴 (인증은 각 페이지에서 처리)
export function middleware(request: NextRequest) {
  // 모든 요청을 통과시킴
  return NextResponse.next();
}

export const config = {
  matcher: [],
};

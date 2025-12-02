import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API 경로는 미들웨어에서 제외
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // 정적 파일들은 제외
  if (pathname.startsWith('/_next/') || pathname.startsWith('/favicon.ico')) {
    return NextResponse.next();
  }

  // 공개 페이지들은 인증 없이 접근 가능
  const publicPaths = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/line-register',
    '/enrollment',
    '/rules',
    '/enrollment-agreement',
    '/terms'
  ];

  if (publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'))) {
    return NextResponse.next();
  }

  // 나머지는 일단 통과 (인증은 각 페이지에서 처리)
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};



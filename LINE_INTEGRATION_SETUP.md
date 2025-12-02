# LINE 연동 설정 가이드

## 1. LINE 개발자 콘솔 설정

### 1.1 LINE 개발자 계정 생성

1. [LINE Developers Console](https://developers.line.biz/)에 접속
2. LINE 계정으로 로그인
3. 새 Provider 생성 (또는 기존 Provider 선택)

### 1.2 Channel 생성

1. **Messaging API** 채널 생성
   - 채널 이름: `MalMoi School`
   - 채널 설명: `한국어 학습 플랫폼`
   - 카테고리: `Education`
   - 서브카테고리: `Language Learning`

2. **LINE Login** 채널 생성
   - 채널 이름: `MalMoi School Login`
   - 채널 설명: `한국어 학습 플랫폼 로그인`
   - 카테고리: `Education`

### 1.3 LINE Login 채널 설정

1. **Basic settings** 탭에서:
   - Channel ID 복사 (예: `1234567890`)
   - Channel Secret 복사

2. **LINE Login** 탭에서:
   - **Callback URL** 설정:
     ```
     https://hanguru.school/auth/line/callback
     ```
   - **Scope** 설정:
     - ✅ `profile` (프로필 정보)
     - ✅ `openid` (OpenID Connect)

3. **App features** 탭에서:
   - **LINE Login** 활성화

## 2. 환경변수 설정

### 2.1 로컬 개발 환경

프로젝트 루트에 `.env.local` 파일 생성:

```env
# LINE Login Configuration
NEXT_PUBLIC_LINE_CLIENT_ID=your_line_channel_id_here
NEXT_PUBLIC_LINE_REDIRECT_URI=https://hanguru.school/auth/line/callback

# LINE Messaging API (Optional)
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token_here
LINE_CHANNEL_SECRET=your_line_channel_secret_here

# Database Configuration
DATABASE_URL=your_database_url_here

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://hanguru.school
```

### 2.2 Vercel 배포 환경

Vercel 대시보드에서 환경변수 설정:

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. `malmoi-system` 프로젝트 선택
3. **Settings** → **Environment Variables** 탭
4. 다음 변수들 추가:
   - `NEXT_PUBLIC_LINE_CLIENT_ID`
   - `NEXT_PUBLIC_LINE_REDIRECT_URI`
   - `LINE_CHANNEL_ACCESS_TOKEN`
   - `LINE_CHANNEL_SECRET`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`

## 3. LINE 로그인 콜백 핸들러 생성

### 3.1 콜백 API 라우트 생성

`src/app/api/auth/line/callback/route.ts` 파일 생성:

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/auth/login?error=line_login_failed`, request.url),
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL(`/auth/login?error=no_authorization_code`, request.url),
    );
  }

  try {
    // LINE Access Token 교환
    const tokenResponse = await fetch("https://api.line.me/oauth2/v2.1/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.NEXT_PUBLIC_LINE_REDIRECT_URI!,
        client_id: process.env.NEXT_PUBLIC_LINE_CLIENT_ID!,
        client_secret: process.env.LINE_CHANNEL_SECRET!,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("LINE token exchange failed:", tokenData);
      return NextResponse.redirect(
        new URL(`/auth/login?error=token_exchange_failed`, request.url),
      );
    }

    // LINE 프로필 정보 가져오기
    const profileResponse = await fetch("https://api.line.me/v2/profile", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const profileData = await profileResponse.json();

    if (!profileResponse.ok) {
      console.error("LINE profile fetch failed:", profileData);
      return NextResponse.redirect(
        new URL(`/auth/login?error=profile_fetch_failed`, request.url),
      );
    }

    // 사용자 정보 처리 및 로그인
    // 여기서 데이터베이스에 사용자 정보 저장/업데이트
    // JWT 토큰 생성 등

    // 성공 시 리다이렉션
    return NextResponse.redirect(
      new URL(`/student/home?login=success`, request.url),
    );
  } catch (error) {
    console.error("LINE login callback error:", error);
    return NextResponse.redirect(
      new URL(`/auth/login?error=callback_error`, request.url),
    );
  }
}
```

## 4. 데이터베이스 스키마 업데이트

### 4.1 사용자 테이블에 LINE 관련 필드 추가

```sql
ALTER TABLE users ADD COLUMN line_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN line_display_name VARCHAR(255);
ALTER TABLE users ADD COLUMN line_picture_url TEXT;
ALTER TABLE users ADD COLUMN login_method ENUM('email', 'line') DEFAULT 'email';
```

## 5. 테스트 및 검증

### 5.1 로컬 테스트

1. 환경변수 설정 후 개발 서버 재시작
2. `/auth/login` 페이지에서 LINE 로그인 버튼 클릭
3. LINE 로그인 플로우 확인

### 5.2 배포 테스트

1. Vercel에 환경변수 설정
2. 프로덕션 배포
3. 실제 도메인에서 LINE 로그인 테스트

## 6. 보안 고려사항

### 6.1 환경변수 보안

- `.env.local` 파일을 `.gitignore`에 포함
- 프로덕션 환경변수는 Vercel 대시보드에서만 설정
- Channel Secret은 절대 클라이언트에 노출하지 않음

### 6.2 CSRF 보호

- `state` 파라미터를 사용한 CSRF 토큰 검증
- 세션 기반 상태 관리

### 6.3 에러 처리

- 모든 에러 상황에 대한 적절한 사용자 피드백
- 로그 기록 및 모니터링

## 7. 추가 기능 (선택사항)

### 7.1 LINE 메시징 API 연동

- 수업 알림 발송
- 출석 확인 메시지
- 학습 진도 안내

### 7.2 LINE Notify 연동

- 관리자 알림
- 시스템 상태 모니터링

## 8. 문제 해결

### 8.1 일반적인 오류

- **400 Bad Request**: Callback URL 불일치
- **401 Unauthorized**: Client ID/Secret 오류
- **403 Forbidden**: Scope 권한 부족

### 8.2 디버깅

- 브라우저 개발자 도구에서 네트워크 요청 확인
- 서버 로그에서 에러 메시지 확인
- LINE 개발자 콘솔에서 로그 확인

## 9. 지원 및 문의

문제가 발생하면 다음을 확인하세요:

1. 환경변수 설정 상태
2. LINE 개발자 콘솔 설정
3. 네트워크 연결 상태
4. 브라우저 콘솔 에러 메시지

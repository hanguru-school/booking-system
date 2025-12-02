# 🚀 운영 환경 전용 배포 가이드

## 📋 개요

이 프로젝트는 **운영 환경 전용** 시스템으로 구성되어 있습니다.

- **운영 서버**: `https://app.hanguru.school`
- **테스트/개발 환경**: 접근 금지 및 자동 리다이렉트

## 🔒 보안 설정

### 1. Vercel 설정

```json
{
  "git": {
    "deploymentEnabled": {
      "main": true,
      "preview": false,
      "dev": false
    }
  }
}
```

### 2. GitHub 브랜치 보호

- `main` 브랜치 Force push 금지
- 병합 전 PR 리뷰 필수
- CI/CD 체크 통과 후에만 병합 허용
- 특정 관리자 계정 외 push 금지

### 3. 팀 권한 설정

- **Developer**: 배포 불가, 코드 읽기만 가능
- **Owner/Admin**: 실제 배포 가능

## 🛠️ 개발 및 배포 흐름

### 로컬 개발

```bash
# 로컬에서 개발 (테스트용)
npm run dev

# 빌드 테스트
npm run build
npm run type-check
npm run lint
```

### 운영 배포

```bash
# main 브랜치에 푸시 시 자동 배포
git add .
git commit -m "기능 추가"
git push origin main
```

## ⚠️ 환경 경고 시스템

### 비운영 환경 접속 시

- **경고 메시지**: "現在の環境はテスト用のため、正式な動作を保証していません。必ず https://app.hanguru.school を使用してください。"
- **자동 리다이렉트**: 5초 후 운영 서버로 이동
- **수동 이동**: 버튼 클릭으로 즉시 이동

### 지원 환경

- ✅ `https://app.hanguru.school` - 정상 작동
- ❌ `localhost:3000` - 경고 후 리다이렉트
- ❌ `localhost:3006` - 경고 후 리다이렉트
- ❌ `*.vercel.app` - 경고 후 리다이렉트
- ❌ `*.netlify.app` - 경고 후 리다이렉트

## 🔧 환경 변수 설정

### 필수 환경 변수

```bash
# 운영 환경
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://app.hanguru.school
DATABASE_URL=your-production-database-url
NEXTAUTH_SECRET=your-production-secret
```

### Vercel Secrets 설정

1. Vercel 대시보드 → Project Settings → Environment Variables
2. 다음 변수들을 Production 환경에만 설정:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `AWS_ACCESS_KEY_ID` (필요시)
   - `AWS_SECRET_ACCESS_KEY` (필요시)

## 📊 모니터링

### 배포 상태 확인

- Vercel 대시보드에서 배포 상태 모니터링
- GitHub Actions에서 CI/CD 상태 확인
- 운영 서버 접속 테스트

### 로그 확인

```bash
# Vercel 로그 확인
vercel logs --prod

# 실시간 로그 모니터링
vercel logs --follow --prod
```

## 🚨 긴급 상황 대응

### 롤백 방법

1. Vercel 대시보드 → Deployments
2. 이전 배포 버전 선택
3. "Redeploy" 클릭

### 문제 해결

1. 로그 확인: `vercel logs --prod`
2. 환경 변수 확인: Vercel 대시보드
3. 데이터베이스 연결 확인
4. 운영 서버 접속 테스트

## 📞 연락처

운영 환경 관련 문의:

- **기술 지원**: 개발팀
- **긴급 상황**: 관리자 계정으로 직접 접근

---

**⚠️ 주의사항**: 이 시스템은 운영 환경에서만 사용되어야 하며, 테스트 환경에서의 사용은 금지됩니다.

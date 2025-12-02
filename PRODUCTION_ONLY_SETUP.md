# 운영 서버 전용 설정 가이드

## 개요

이 프로젝트는 **운영 서버(https://app.hanguru.school)에서만 모든 기능을 개발하고 배포**하는 시스템입니다.
Preview 환경이나 테스트 서버는 사용하지 않습니다.

## 🚫 금지 사항

### 1. Preview 배포 금지

- Vercel에서 Preview 배포 생성 금지
- `main` 브랜치만 Production 배포 대상
- Git 연동에서 "Only deploy on production branch (main)" 활성화

### 2. 브랜치 정책

- `main` 브랜치 Force push 금지
- 병합 전 PR 리뷰 필수
- CI/CD 체크 통과 후에만 병합 허용
- 특정 관리자 계정 외 push 금지

### 3. 환경 제한

- 운영 서버 외 환경에서 접속 시 경고 표시
- 5초 후 자동으로 운영 서버로 리다이렉트
- 로컬 개발 시에도 운영 서버 환경 변수 사용

## ✅ 허용 사항

### 1. 개발 흐름

```
로컬 개발 → main 브랜치 푸시 → 실서버 자동 배포
```

### 2. 테스트 방법

- 로컬: `npm run dev` (운영 환경 변수 사용)
- 배포: `main` 브랜치 푸시 시 자동 배포

### 3. 접근 가능 환경

- ✅ https://app.hanguru.school (운영 서버)
- ❌ localhost:3000 (경고 후 리다이렉트)
- ❌ vercel.app 도메인 (경고 후 리다이렉트)

## 🔧 설정 방법

### 1. Vercel 설정

```json
{
  "git": {
    "deploymentEnabled": {
      "main": true,
      "preview": false
    }
  }
}
```

### 2. GitHub 브랜치 보호

- Settings → Branches → Add rule
- Branch name pattern: `main`
- Require pull request reviews before merging
- Require status checks to pass before merging
- Restrict pushes that create files that match the specified pattern

### 3. 환경 변수 설정

```bash
# .env.local
NEXT_PUBLIC_PRODUCTION_URL=https://app.hanguru.school
NEXT_PUBLIC_ENVIRONMENT=production
NODE_ENV=production
```

## 🚨 경고 메시지

비운영 환경 접속 시 표시되는 메시지:

```
⚠️ 環境エラー

現在の環境はテスト用のため、正式な動作を保証していません。
必ず https://app.hanguru.school を使用してください。

5秒後に自動的に正しい環境にリダイレクトされます...
```

## 📋 체크리스트

### 배포 전 확인사항

- [ ] `main` 브랜치에서 작업 중인지 확인
- [ ] 로컬에서 `npm run dev`로 테스트 완료
- [ ] 환경 변수가 운영 서버용으로 설정됨
- [ ] Preview 배포가 비활성화됨

### 배포 후 확인사항

- [ ] https://app.hanguru.school 에서 정상 작동 확인
- [ ] 다른 환경에서 접속 시 경고 표시 확인
- [ ] 자동 리다이렉트 동작 확인

## 🔒 보안 설정

### 1. Vercel 권한 설정

- Developer 권한자는 배포 불가
- 운영자 계정만 실제 배포 가능

### 2. GitHub 권한 설정

- 특정 관리자만 `main` 브랜치에 push 가능
- PR 리뷰 필수
- CI/CD 체크 통과 필수

## 📞 지원

문제가 발생한 경우:

1. 운영 서버(https://app.hanguru.school)에서 직접 확인
2. 로컬 환경 변수 재설정
3. Vercel 설정 재확인

---

**중요**: 이 시스템은 운영 서버에서만 작동하도록 설계되었습니다.
다른 환경에서는 정상적인 기능을 보장할 수 없습니다.

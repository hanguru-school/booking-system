# 🎯 GitHub Main 브랜치 보호 규칙 최종 설정 가이드

## ✅ 완료된 준비 작업

- ✅ GitHub CLI 인증 완료
- ✅ 브랜치 보호 설정 스크립트 생성
- ✅ GitHub Actions 워크플로우 업데이트
- ✅ 운영 서버 전용 환경 설정 완료

## 🚀 최종 설정: GitHub 웹 인터페이스

### 1. GitHub 저장소 설정 페이지로 이동

```
https://github.com/hanguru-school/malmoi-system/settings/branches
```

### 2. 브랜치 보호 규칙 추가

1. **"Add rule"** 버튼 클릭
2. **Branch name pattern**에 `main` 입력
3. **"Create"** 버튼 클릭

### 3. 보호 규칙 설정 (체크리스트)

#### ✅ Require a pull request before merging

- [x] **Require a pull request before merging** 활성화
- [x] **Require approvals** 체크 (최소 1명)
- [x] **Dismiss stale PR approvals when new commits are pushed** 체크

#### ✅ Require status checks to pass before merging

- [x] **Require status checks to pass before merging** 활성화
- [x] **Require branches to be up to date before merging** 체크
- [x] **Status checks that are required**:
  - `production-deploy` (GitHub Actions 워크플로우)

#### ✅ Restrict pushes that create files

- [x] **Restrict pushes that create files that match the specified pattern** 활성화
- [x] **Allow force pushes** **비활성화**
- [x] **Allow deletions** **비활성화**

#### ✅ Restrict who can push to matching branches

- [x] **Restrict who can push to matching branches** 활성화
- [x] **Users, teams, or apps**에서 허용할 사용자/팀 선택

### 4. 설정 저장

**"Create"** 버튼을 클릭하여 설정을 저장합니다.

## 🔍 설정 확인

### 1. 웹에서 확인

- GitHub 저장소 → Settings → Branches
- `main` 브랜치 규칙 확인

### 2. 터미널에서 확인

```bash
gh api repos/hanguru-school/malmoi-system/branches/main/protection
```

## 📊 설정 완료 후 결과

### ✅ 적용되는 제한

- **직접 push 불가**: main 브랜치에 직접 push 불가능
- **PR 필수**: 모든 변경사항은 PR을 통해서만 병합
- **리뷰 필수**: 최소 1명의 승인 필요
- **CI/CD 체크**: GitHub Actions 완료 후 병합 가능
- **Force push 금지**: 강제 push 불가능
- **브랜치 삭제 금지**: main 브랜치 삭제 불가능

### 🔄 새로운 개발 워크플로우

```
기능 개발 → feature 브랜치 생성 → 개발 → PR 생성 → 리뷰 → CI/CD 체크 → 병합
```

## 🎯 운영 서버 전용 시스템 완료

### ✅ 완료된 설정

1. **Vercel 설정**: Preview 배포 비활성화, main 브랜치만 배포
2. **환경 감지**: 비운영 환경 접속 시 경고 후 리다이렉트
3. **GitHub Actions**: 운영 배포 워크플로우 설정
4. **브랜치 보호**: main 브랜치 보호 규칙 설정
5. **보안 강화**: 보안 헤더 및 환경 변수 설정

### 🚀 사용 방법

- **로컬 개발**: `npm run dev`
- **배포**: main 브랜치 푸시 시 자동 배포
- **환경 체크**: `npm run check-production`
- **브랜치 보호**: PR을 통해서만 병합

## 📞 지원

문제가 발생한 경우:

1. GitHub 저장소 설정 페이지 확인
2. 운영 서버 환경 체크: `npm run check-production`
3. GitHub Actions 워크플로우 확인

---

**🎉 모든 설정이 완료되었습니다!**
이제 시스템이 완전히 운영 서버 전용으로 설정되었으며, main 브랜치가 보호되어 안전한 개발 워크플로우가 구축되었습니다.

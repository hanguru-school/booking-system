# 🚀 즉시 실행: GitHub 브랜치 보호 규칙 설정

## 📋 현재 상황

- ✅ GitHub CLI 인증 완료
- ✅ 모든 설정 파일 준비 완료
- ⏳ GitHub 웹 인터페이스에서 최종 설정 필요

## 🎯 즉시 실행 방법

### 1. GitHub 저장소 설정 페이지로 이동

```
https://github.com/hanguru-school/malmoi-system/settings/branches
```

### 2. 브랜치 보호 규칙 추가 (5분 완료)

#### Step 1: 규칙 추가

1. **"Add rule"** 버튼 클릭
2. **Branch name pattern**에 `main` 입력
3. **"Create"** 버튼 클릭

#### Step 2: 보호 규칙 설정

다음 설정들을 **모두 체크**하세요:

**✅ Require a pull request before merging**

- [x] **Require a pull request before merging** 활성화
- [x] **Require approvals** 체크 (최소 1명)
- [x] **Dismiss stale PR approvals when new commits are pushed** 체크

**✅ Require status checks to pass before merging**

- [x] **Require status checks to pass before merging** 활성화
- [x] **Require branches to be up to date before merging** 체크
- [x] **Status checks that are required**:
  - `production-deploy` (GitHub Actions 워크플로우)

**✅ Restrict pushes that create files**

- [x] **Restrict pushes that create files that match the specified pattern** 활성화
- [x] **Allow force pushes** **비활성화**
- [x] **Allow deletions** **비활성화**

**✅ Restrict who can push to matching branches**

- [x] **Restrict who can push to matching branches** 활성화
- [x] **Users, teams, or apps**에서 허용할 사용자/팀 선택

#### Step 3: 설정 저장

**"Create"** 버튼을 클릭하여 설정을 저장합니다.

## 🔍 설정 확인

### 1. 웹에서 확인

- GitHub 저장소 → Settings → Branches
- `main` 브랜치 규칙 확인

### 2. 터미널에서 확인

```bash
gh api repos/hanguru-school/malmoi-system/branches/main/protection
```

## ✅ 설정 완료 후 결과

### 🚫 적용되는 제한

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

## 🎉 완료 후 확인사항

### 1. 운영 서버 환경 체크

```bash
npm run check-production
```

### 2. 로컬 개발 테스트

```bash
npm run dev
```

### 3. GitHub Actions 확인

- GitHub 저장소 → Actions 탭
- `production-deploy` 워크플로우 확인

## 📞 문제 해결

### 권한 오류가 발생하는 경우

1. GitHub 저장소 관리자 권한 확인
2. 조직 관리자에게 문의
3. 저장소 설정 권한 확인

### 설정이 적용되지 않는 경우

1. 브라우저 캐시 삭제
2. GitHub 페이지 새로고침
3. 설정 다시 확인

---

**⏰ 예상 소요 시간: 5-10분**
**🎯 목표: 안전한 main 브랜치 보호 및 운영 서버 전용 시스템 구축**

# GitHub Main 브랜치 보호 규칙 설정 가이드

## 개요

이 가이드는 GitHub 저장소의 `main` 브랜치에 대한 보호 규칙을 설정하는 방법을 설명합니다.

## 🎯 설정 목표

- ✅ Force push 금지
- ✅ Require pull request reviews before merging (병합 전 PR 검토 1명 이상 필수)
- ✅ Require status checks to pass before merging (CI/CD 완료 후 병합 가능)
- ✅ Allow only specific users to push to main (예: 운영자 또는 관리자 계정만)

## 🔧 자동 설정 방법

### 1. GitHub CLI 인증

```bash
gh auth login
```

### 2. 자동 설정 스크립트 실행

```bash
./scripts/setup-branch-protection.sh
```

## 📋 수동 설정 방법

### 1. GitHub 저장소 페이지로 이동

```
https://github.com/[OWNER]/[REPO]/settings/branches
```

### 2. 브랜치 보호 규칙 추가

1. **"Add rule"** 버튼 클릭
2. **Branch name pattern**에 `main` 입력
3. **"Create"** 버튼 클릭

### 3. 보호 규칙 설정

#### ✅ Require a pull request before merging

- [x] **Require a pull request before merging** 활성화
- [x] **Require approvals** 체크 (최소 1명)
- [x] **Dismiss stale PR approvals when new commits are pushed** 체크
- [x] **Require review from code owners** (선택사항)

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

### 1. 보호 규칙 확인

```bash
gh api repos/[OWNER]/[REPO]/branches/main/protection
```

### 2. 웹에서 확인

- GitHub 저장소 → Settings → Branches
- `main` 브랜치 규칙 확인

## 📊 설정 결과

설정 완료 후 다음과 같은 제한이 적용됩니다:

### ✅ 적용되는 제한

- **직접 push 불가**: main 브랜치에 직접 push 불가능
- **PR 필수**: 모든 변경사항은 PR을 통해서만 병합
- **리뷰 필수**: 최소 1명의 승인 필요
- **CI/CD 체크**: GitHub Actions 완료 후 병합 가능
- **Force push 금지**: 강제 push 불가능
- **브랜치 삭제 금지**: main 브랜치 삭제 불가능

### 🔄 개발 워크플로우

```
기능 개발 → feature 브랜치 생성 → 개발 → PR 생성 → 리뷰 → CI/CD 체크 → 병합
```

## 🚨 주의사항

### 1. 관리자 권한 필요

- 저장소 관리자 권한이 필요합니다
- 조직 저장소의 경우 조직 관리자 권한이 필요할 수 있습니다

### 2. 기존 설정 확인

- 이미 보호 규칙이 설정되어 있는 경우 기존 설정을 확인하세요
- 기존 설정을 덮어쓸지 여부를 결정하세요

### 3. 팀 협업

- 팀원들에게 새로운 워크플로우를 안내하세요
- PR 리뷰 프로세스를 문서화하세요

## 🔧 문제 해결

### 1. 권한 오류

```
Error: Resource not accessible by integration
```

**해결방법**: GitHub CLI에 적절한 권한이 있는지 확인

### 2. 브랜치 이름 오류

```
Error: Branch 'main' not found
```

**해결방법**: 기본 브랜치가 'main'인지 확인

### 3. 워크플로우 오류

```
Error: Status check 'production-deploy' not found
```

**해결방법**: GitHub Actions 워크플로우가 올바르게 설정되었는지 확인

## 📞 지원

문제가 발생한 경우:

1. GitHub 저장소 설정 페이지 확인
2. GitHub CLI 권한 확인
3. 조직 관리자에게 문의

---

**중요**: 이 설정은 main 브랜치의 안전성을 보장하지만, 팀의 개발 워크플로우에 영향을 줄 수 있습니다. 팀원들과 충분히 논의한 후 적용하세요.

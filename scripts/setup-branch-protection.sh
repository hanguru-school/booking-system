#!/bin/bash

# GitHub Main 브랜치 보호 규칙 설정 스크립트
# 이 스크립트는 main 브랜치에 대한 보호 규칙을 설정합니다.

set -e

echo "🔒 GitHub Main 브랜치 보호 규칙 설정을 시작합니다..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 함수 정의
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# GitHub CLI 인증 확인
check_gh_auth() {
    if ! gh auth status >/dev/null 2>&1; then
        print_error "GitHub CLI 인증이 필요합니다."
        echo "다음 명령어로 인증하세요:"
        echo "  gh auth login"
        echo ""
        echo "또는 수동으로 설정하세요:"
        echo "  1. GitHub 저장소 페이지로 이동"
        echo "  2. Settings → Branches → Add rule"
        echo "  3. Branch name pattern: main"
        echo "  4. 아래 설정들을 활성화:"
        echo "     - Require a pull request before merging"
        echo "     - Require approvals (1 이상)"
        echo "     - Require status checks to pass before merging"
        echo "     - Require branches to be up to date before merging"
        echo "     - Restrict pushes that create files"
        echo "     - Allow force pushes (비활성화)"
        echo "     - Allow deletions (비활성화)"
        echo "     - Restrict who can push to matching branches"
        exit 1
    fi
    print_success "GitHub CLI 인증 확인됨"
}

# 저장소 정보 가져오기
get_repo_info() {
    print_info "저장소 정보를 가져오는 중..."
    
    REPO_INFO=$(gh repo view --json name,owner,defaultBranchRef)
    REPO_NAME=$(echo $REPO_INFO | jq -r '.name')
    REPO_OWNER=$(echo $REPO_INFO | jq -r '.owner.login')
    DEFAULT_BRANCH=$(echo $REPO_INFO | jq -r '.defaultBranchRef.name')
    
    print_success "저장소: $REPO_OWNER/$REPO_NAME"
    print_success "기본 브랜치: $DEFAULT_BRANCH"
    
    if [ "$DEFAULT_BRANCH" != "main" ]; then
        print_warning "기본 브랜치가 'main'이 아닙니다: $DEFAULT_BRANCH"
        read -p "계속 진행하시겠습니까? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# 브랜치 보호 규칙 설정
setup_branch_protection() {
    print_info "Main 브랜치 보호 규칙을 설정하는 중..."
    
    # 현재 보호 규칙 확인
    print_info "현재 보호 규칙 확인 중..."
    CURRENT_PROTECTION=$(gh api repos/$REPO_OWNER/$REPO_NAME/branches/main/protection 2>/dev/null || echo "{}")
    
    if [ "$CURRENT_PROTECTION" != "{}" ]; then
        print_warning "이미 보호 규칙이 설정되어 있습니다."
        echo "현재 설정:"
        echo "$CURRENT_PROTECTION" | jq '.'
        echo ""
        read -p "기존 설정을 덮어쓰시겠습니까? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # 보호 규칙 설정
    print_info "새로운 보호 규칙을 적용하는 중..."
    
    PROTECTION_CONFIG=$(cat <<EOF
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["production-deploy"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "require_last_push_approval": true
  },
  "restrictions": {
    "users": [],
    "teams": []
  },
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": true,
  "required_conversation_resolution": true
}
EOF
)
    
    # API 호출로 보호 규칙 설정
    RESPONSE=$(gh api --method PUT repos/$REPO_OWNER/$REPO_NAME/branches/main/protection \
        --input - <<< "$PROTECTION_CONFIG" 2>&1)
    
    if [ $? -eq 0 ]; then
        print_success "Main 브랜치 보호 규칙이 성공적으로 설정되었습니다!"
    else
        print_error "보호 규칙 설정에 실패했습니다:"
        echo "$RESPONSE"
        exit 1
    fi
}

# 설정 확인
verify_protection() {
    print_info "설정을 확인하는 중..."
    
    PROTECTION_INFO=$(gh api repos/$REPO_OWNER/$REPO_NAME/branches/main/protection)
    
    echo ""
    print_success "=== Main 브랜치 보호 규칙 설정 완료 ==="
    echo ""
    echo "✅ Force push 금지: $(echo $PROTECTION_INFO | jq -r '.allow_force_pushes // true')"
    echo "✅ PR 리뷰 필수: $(echo $PROTECTION_INFO | jq -r '.required_pull_request_reviews.required_approving_review_count')명"
    echo "✅ 상태 체크 필수: $(echo $PROTECTION_INFO | jq -r '.required_status_checks.contexts[]?' | tr '\n' ', ')"
    echo "✅ 브랜치 삭제 금지: $(echo $PROTECTION_INFO | jq -r '.allow_deletions // true')"
    echo "✅ 파일 생성 제한: $(echo $PROTECTION_INFO | jq -r '.block_creations // false')"
    echo "✅ 대화 해결 필수: $(echo $PROTECTION_INFO | jq -r '.required_conversation_resolution // false')"
    echo ""
    print_info "이제 main 브랜치에 직접 push가 불가능하며, PR을 통해서만 병합할 수 있습니다."
}

# 메인 실행
main() {
    echo "🚀 GitHub Main 브랜치 보호 규칙 설정"
    echo "=================================="
    echo ""
    
    check_gh_auth
    get_repo_info
    setup_branch_protection
    verify_protection
    
    echo ""
    print_success "설정이 완료되었습니다!"
    echo ""
    echo "📋 다음 사항을 확인하세요:"
    echo "   - main 브랜치에 직접 push 불가"
    echo "   - PR 생성 후 리뷰 필수"
    echo "   - CI/CD 체크 통과 후 병합 가능"
    echo "   - Force push 금지"
    echo ""
    echo "🔗 GitHub 저장소: https://github.com/$REPO_OWNER/$REPO_NAME"
    echo "🔗 브랜치 설정: https://github.com/$REPO_OWNER/$REPO_NAME/settings/branches"
}

# 스크립트 실행
main "$@" 
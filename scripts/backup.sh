#!/usr/bin/env bash

# 백업 스크립트
# 사용법: ./scripts/backup.sh <version>
# 예시: ./scripts/backup.sh v1.0.0

set -e

# 환경 변수 설정
BASE_PATH="${BACKUP_BASE_PATH:-./backups}"
VERSION="$1"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 버전 검증
if [ -z "$VERSION" ]; then
    log_error "버전이 지정되지 않았습니다."
    echo "사용법: $0 <version>"
    echo "예시: $0 v1.0.0"
    exit 1
fi

# 버전 형식 검증 (v1.0.0 형식)
if [[ ! $VERSION =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    log_error "올바른 버전 형식이 아닙니다: $VERSION"
    echo "올바른 형식: v1.0.0"
    exit 1
fi

# Git 저장소 확인
if [ ! -d ".git" ]; then
    log_error "Git 저장소가 아닙니다."
    exit 1
fi

# 디렉토리 구조 생성
log_info "백업 디렉토리 구조 생성 중..."
mkdir -p "${BASE_PATH}/history"
mkdir -p "${BASE_PATH}/rolling"
mkdir -p "${BASE_PATH}/protected"

# 보호 목록 파일 확인
PROTECTED_LIST_FILE="${BASE_PATH}/protected_backups.json"
if [ ! -f "$PROTECTED_LIST_FILE" ]; then
    log_info "보호 목록 파일 생성 중..."
    echo '[]' > "$PROTECTED_LIST_FILE"
fi

# 보호 목록에서 버전 확인
is_protected=false
if command -v jq &> /dev/null; then
    if jq -e ".[] | select(. == \"$VERSION\")" "$PROTECTED_LIST_FILE" > /dev/null 2>&1; then
        is_protected=true
    fi
else
    # jq가 없는 경우 grep으로 확인
    if grep -qx "$VERSION" "$PROTECTED_LIST_FILE" 2>/dev/null; then
        is_protected=true
    fi
fi

# History 백업 (무제한 보존)
log_info "History 백업 생성 중: $VERSION"
HISTORY_PATH="${BASE_PATH}/history/${VERSION}"
if [ ! -d "$HISTORY_PATH" ]; then
    mkdir -p "$HISTORY_PATH"
    git archive --format=tar HEAD | tar -x -C "$HISTORY_PATH"
    log_success "History 백업 완료: $HISTORY_PATH"
else
    log_warning "History 백업이 이미 존재합니다: $HISTORY_PATH"
fi

# Rolling 백업 (최신 10개만)
log_info "Rolling 백업 생성 중: $VERSION"
ROLLING_PATH="${BASE_PATH}/rolling/${VERSION}"
if [ ! -d "$ROLLING_PATH" ]; then
    mkdir -p "$ROLLING_PATH"
    git archive --format=tar HEAD | tar -x -C "$ROLLING_PATH"
    log_success "Rolling 백업 완료: $ROLLING_PATH"
else
    log_warning "Rolling 백업이 이미 존재합니다: $ROLLING_PATH"
fi

# Protected 백업 (보호 목록에 있는 경우)
if [ "$is_protected" = true ]; then
    log_info "Protected 백업 생성 중: $VERSION"
    PROTECTED_PATH="${BASE_PATH}/protected/${VERSION}"
    if [ ! -d "$PROTECTED_PATH" ]; then
        mkdir -p "$PROTECTED_PATH"
        git archive --format=tar HEAD | tar -x -C "$PROTECTED_PATH"
        log_success "Protected 백업 완료: $PROTECTED_PATH"
    else
        log_warning "Protected 백업이 이미 존재합니다: $PROTECTED_PATH"
    fi
fi

# Rolling 백업 정리 (최신 10개만 유지)
log_info "Rolling 백업 정리 중..."
ROLLING_BACKUPS=$(ls -1 "${BASE_PATH}/rolling" 2>/dev/null | sort -V || true)
ROLLING_COUNT=$(echo "$ROLLING_BACKUPS" | wc -l)

if [ "$ROLLING_COUNT" -gt 10 ]; then
    TO_DELETE=$(echo "$ROLLING_BACKUPS" | head -n $((ROLLING_COUNT - 10)))
    for version in $TO_DELETE; do
        log_info "오래된 Rolling 백업 삭제: $version"
        rm -rf "${BASE_PATH}/rolling/$version"
    done
    log_success "Rolling 백업 정리 완료"
else
    log_info "Rolling 백업 정리 불필요 (현재 $ROLLING_COUNT개)"
fi

# 백업 통계 출력
log_info "백업 통계:"
echo "  History 백업: $(ls -1 "${BASE_PATH}/history" 2>/dev/null | wc -l)개"
echo "  Rolling 백업: $(ls -1 "${BASE_PATH}/rolling" 2>/dev/null | wc -l)개"
echo "  Protected 백업: $(ls -1 "${BASE_PATH}/protected" 2>/dev/null | wc -l)개"

if [ "$is_protected" = true ]; then
    log_success "버전 $VERSION이 보호 목록에 포함되어 있습니다"
else
    log_info "버전 $VERSION을 보호 목록에 추가하려면:"
    echo "  curl -X POST http://localhost:3000/api/backups/protected \\"
    echo "    -H 'Content-Type: application/json' \\"
    echo "    -d '{\"version\": \"$VERSION\"}'"
fi

log_success "백업 완료: $VERSION" 
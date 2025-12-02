#!/bin/bash
set -euo pipefail

REMOTE_USER="malmoi"
REMOTE_HOST="100.80.210.105"
REMOTE_DIR="~/booking-system"

echo "👀 파일 변경 감지 및 자동 배포 시작..."
echo "Ctrl+C로 종료할 수 있습니다."
echo ""

# fswatch가 설치되어 있는지 확인
if ! command -v fswatch &> /dev/null; then
    echo "📦 fswatch 설치 중..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install fswatch
    else
        echo "fswatch를 설치해주세요: https://github.com/emcrisostomo/fswatch"
        exit 1
    fi
fi

# 무시할 파일/디렉토리 패턴
EXCLUDE_PATTERNS=(
    "node_modules"
    ".next"
    ".git"
    "backups"
    "logs"
    "*.log"
    ".env*"
    "*.tsbuildinfo"
    ".DS_Store"
    "data"
)

# rsync exclude 옵션 생성
RSYNC_EXCLUDE=""
for pattern in "${EXCLUDE_PATTERNS[@]}"; do
    RSYNC_EXCLUDE="$RSYNC_EXCLUDE --exclude '$pattern'"
done

# 파일 변경 감지 및 자동 업로드
fswatch -o . | while read f; do
    echo ""
    echo "📝 파일 변경 감지됨: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "📤 변경사항 업로드 중..."
    
    # rsync로 변경된 파일만 업로드
    eval "rsync -avz --progress $RSYNC_EXCLUDE ./ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/"
    
    if [ $? -eq 0 ]; then
        echo "✅ 업로드 완료!"
        echo "🔄 서버에서 자동으로 변경사항이 반영됩니다 (Fast Refresh)"
    else
        echo "❌ 업로드 실패"
    fi
done




#!/bin/bash
set -euo pipefail

REMOTE_USER="malmoi"
REMOTE_HOST="100.80.210.105"
REMOTE_DIR="~/booking-system"

# fswatch 설치 확인
if ! command -v fswatch &> /dev/null; then
    echo "📦 fswatch 설치 중..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew &> /dev/null; then
            brew install fswatch
        else
            echo "❌ Homebrew가 필요합니다. 설치: https://brew.sh"
            exit 1
        fi
    else
        echo "❌ fswatch를 설치해주세요"
        exit 1
    fi
fi

# 이미 실행 중인지 확인
if pgrep -f "fswatch.*booking-system" > /dev/null; then
    echo "⚠️  자동 배포가 이미 실행 중입니다."
    echo "종료하려면: pkill -f 'fswatch.*booking-system'"
    exit 1
fi

echo "🚀 자동 배포 시작..."
echo "파일을 저장하면 자동으로 서버에 업로드됩니다."
echo "종료하려면: pkill -f 'fswatch.*booking-system'"
echo ""

# 백그라운드에서 실행
nohup bash -c "
    fswatch -o . | while read f; do
        sleep 1
        echo \"\$(date '+%H:%M:%S') - 파일 변경 감지, 업로드 중...\"
        rsync -avz --progress \
          --exclude 'node_modules' \
          --exclude '.next' \
          --exclude 'backups' \
          --exclude 'logs' \
          --exclude '.env*' \
          --exclude '*.log' \
          --exclude '.git' \
          --exclude '*.tsbuildinfo' \
          --exclude '.DS_Store' \
          --exclude 'data' \
          ./ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/ > /tmp/auto-deploy.log 2>&1
        echo \"\$(date '+%H:%M:%S') - 업로드 완료\"
    done
" > /tmp/auto-deploy-output.log 2>&1 &

WATCH_PID=$!
echo "✅ 자동 배포가 시작되었습니다 (PID: $WATCH_PID)"
echo "로그 확인: tail -f /tmp/auto-deploy-output.log"
echo ""
echo "종료하려면: kill $WATCH_PID"
echo "또는: ./stop-auto-deploy.sh"




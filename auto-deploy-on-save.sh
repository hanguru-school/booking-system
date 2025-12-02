#!/bin/bash
set -euo pipefail

REMOTE_USER="malmoi"
REMOTE_HOST="100.80.210.105"
REMOTE_DIR="~/booking-system"

echo "🚀 자동 배포 설정"
echo ""
echo "이 스크립트는 파일 저장 시 자동으로 원격 서버에 업로드합니다."
echo ""

# fswatch 설치 확인 및 설치
if ! command -v fswatch &> /dev/null; then
    echo "📦 fswatch 설치 중..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew &> /dev/null; then
            brew install fswatch
        else
            echo "❌ Homebrew가 설치되어 있지 않습니다."
            echo "Homebrew 설치: https://brew.sh"
            exit 1
        fi
    else
        echo "❌ fswatch를 수동으로 설치해주세요: https://github.com/emcrisostomo/fswatch"
        exit 1
    fi
fi

echo "✅ fswatch 설치 확인됨"
echo ""
echo "👀 파일 변경 감지 시작..."
echo "파일을 저장하면 자동으로 서버에 업로드됩니다."
echo "Ctrl+C로 종료할 수 있습니다."
echo ""

# 백그라운드에서 실행
(
    fswatch -o . | while read f; do
        # 변경된 파일만 확인 (너무 빠른 연속 변경 방지)
        sleep 1
        
        echo ""
        echo "📝 파일 변경 감지: $(date '+%H:%M:%S')"
        
        # rsync로 업로드
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
          ./ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/ > /dev/null 2>&1
        
        if [ $? -eq 0 ]; then
            echo "✅ 업로드 완료 ($(date '+%H:%M:%S'))"
        fi
    done
) &

WATCH_PID=$!
echo "감시 프로세스 PID: $WATCH_PID"
echo "종료하려면: kill $WATCH_PID"
echo ""

# 종료 시 정리
trap "kill $WATCH_PID 2>/dev/null; exit" INT TERM

# 대기
wait $WATCH_PID




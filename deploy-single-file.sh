#!/bin/bash

# 단일 파일 배포 스크립트 (SSH 연결 문제 해결)
# 사용법: ./deploy-single-file.sh <파일경로>

REMOTE_USER="malmoi"
REMOTE_HOST="hanguru-system-server"
REMOTE_DIR="~/booking-system"

# SSH 연결 설정 최적화
SSH_OPTS="-o ConnectTimeout=15 -o ServerAliveInterval=5 -o ServerAliveCountMax=3 -o StrictHostKeyChecking=no"

# 파일 경로 확인
FILE_PATH="$1"
if [ -z "$FILE_PATH" ]; then
  echo "❌ 사용법: $0 <파일경로>"
  echo "예: $0 src/app/admin/reservations/page.tsx"
  exit 1
fi

if [ ! -f "$FILE_PATH" ]; then
  echo "❌ 파일을 찾을 수 없습니다: $FILE_PATH"
  exit 1
fi

echo "🔍 SSH 연결 테스트 중..."
# SSH 연결 테스트
if ! ssh $SSH_OPTS ${REMOTE_USER}@${REMOTE_HOST} "echo '연결 성공'" > /dev/null 2>&1; then
  echo "❌ SSH 연결 실패. 다음을 확인하세요:"
  echo "   1. Tailscale 연결 상태"
  echo "   2. 서버 주소: ${REMOTE_HOST}"
  echo "   3. 사용자명: ${REMOTE_USER}"
  exit 1
fi

echo "✅ SSH 연결 확인됨"
echo ""
echo "📤 배포 중: $FILE_PATH"

# rsync 사용 (더 안정적)
MAX_RETRIES=3
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if rsync -avz --timeout=20 $SSH_OPTS "$FILE_PATH" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/$FILE_PATH" 2>&1; then
    echo "✅ 배포 완료!"
    exit 0
  fi
  
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
    echo "⚠️  재시도 중... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
  fi
done

# rsync 실패 시 scp로 재시도
echo "⚠️  rsync 실패, scp로 재시도 중..."
if scp $SSH_OPTS "$FILE_PATH" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/$FILE_PATH" 2>&1; then
  echo "✅ 배포 완료! (scp 사용)"
  exit 0
fi

echo "❌ 배포 실패. 수동으로 배포하세요:"
echo "   scp $FILE_PATH ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/$FILE_PATH"
exit 1



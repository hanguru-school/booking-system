#!/bin/bash

# 안전한 배포 스크립트 (SSH 연결 문제 해결)
# 사용법: ./deploy-safe.sh [파일경로]

REMOTE_USER="malmoi"
REMOTE_HOST="100.80.210.105"
REMOTE_DIR="/home/malmoi/booking-system"

# SSH 옵션 (비대화식, 키 인증만, 호스트키 자동 수락)
SSH_OPTS="-o BatchMode=yes -o PreferredAuthentications=publickey -o StrictHostKeyChecking=accept-new -o ConnectTimeout=15 -o ServerAliveInterval=5"

# 파일 경로 확인
if [ -z "$1" ]; then
  echo "❌ 사용법: $0 <파일경로>"
  echo "예: $0 src/app/admin/reservations/page.tsx"
  exit 1
fi

FILE_PATH="$1"

# 경로에 대괄호가 있으면 이스케이프
ESCAPED_PATH=$(echo "$FILE_PATH" | sed 's/\[/\\[/g; s/\]/\\]/g')

if [ ! -f "$FILE_PATH" ]; then
  echo "❌ 파일을 찾을 수 없습니다: $FILE_PATH"
  exit 1
fi

echo "🔍 SSH 연결 테스트 중..."
if ! ssh $SSH_OPTS ${REMOTE_USER}@${REMOTE_HOST} 'echo OK' 2>&1; then
  echo "❌ SSH 연결 실패"
  echo ""
  echo "다음을 확인하세요:"
  echo "  1. Tailscale 연결 상태"
  echo "  2. SSH 키 등록: ssh-copy-id ${REMOTE_USER}@${REMOTE_HOST}"
  echo "  3. 서버 접속 테스트: ssh ${REMOTE_USER}@${REMOTE_HOST}"
  exit 1
fi

echo "✅ SSH 연결 확인됨"
echo ""
echo "📤 배포 중: $FILE_PATH"

# rsync 사용 (경로 이스케이프 자동 처리)
if rsync -azP --timeout=20 \
  -e "ssh $SSH_OPTS" \
  "$FILE_PATH" \
  "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/$FILE_PATH" 2>&1; then
  echo "✅ 배포 완료!"
  echo ""
  echo "💡 페이지를 새로고침하면 변경사항이 적용됩니다."
  exit 0
fi

echo "❌ rsync 실패, scp로 재시도 중..."
if scp $SSH_OPTS "$FILE_PATH" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/$FILE_PATH" 2>&1; then
  echo "✅ 배포 완료! (scp 사용)"
  exit 0
fi

echo "❌ 배포 실패"
exit 1



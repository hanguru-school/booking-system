#!/bin/bash

# 예약 페이지 배포 스크립트 (SSH 연결 문제 해결)

REMOTE_USER="malmoi"
REMOTE_HOST="100.80.210.105"
REMOTE_DIR="/home/malmoi/booking-system"

# SSH 연결 설정 최적화 (비대화식, 키 인증만)
SSH_OPTS="-o BatchMode=yes -o PreferredAuthentications=publickey -o StrictHostKeyChecking=accept-new -o ConnectTimeout=15 -o ServerAliveInterval=5"

FILE_PATH="src/app/admin/reservations/page.tsx"

if [ ! -f "$FILE_PATH" ]; then
  echo "❌ 파일을 찾을 수 없습니다: $FILE_PATH"
  exit 1
fi

echo "🔍 SSH 연결 테스트 중..."
if ! ssh $SSH_OPTS ${REMOTE_USER}@${REMOTE_HOST} "echo '연결 성공'" > /dev/null 2>&1; then
  echo "❌ SSH 연결 실패"
  echo ""
  echo "수동 배포 방법:"
  echo "  scp $FILE_PATH ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/$FILE_PATH"
  exit 1
fi

echo "✅ SSH 연결 확인됨"
echo ""
echo "📤 배포 중: $FILE_PATH"

# rsync 사용 (더 안정적)
if rsync -avz --timeout=20 $SSH_OPTS "$FILE_PATH" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/$FILE_PATH" 2>&1; then
  echo "✅ 배포 완료!"
  echo ""
  echo "💡 페이지를 새로고침하면 변경사항이 적용됩니다."
  exit 0
fi

# rsync 실패 시 scp로 재시도
echo "⚠️  rsync 실패, scp로 재시도 중..."
if scp $SSH_OPTS "$FILE_PATH" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/$FILE_PATH" 2>&1; then
  echo "✅ 배포 완료! (scp 사용)"
  echo ""
  echo "💡 페이지를 새로고침하면 변경사항이 적용됩니다."
  exit 0
fi

echo "❌ 배포 실패"
echo ""
echo "수동 배포 명령어:"
echo "  scp $FILE_PATH ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/$FILE_PATH"
exit 1


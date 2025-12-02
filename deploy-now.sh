#!/bin/bash

# 즉시 배포 스크립트 (현재 수정된 reservations/page.tsx)
# 모든 SSH 문제 해결 옵션 포함

REMOTE_USER="malmoi"
REMOTE_HOST="100.80.210.105"
REMOTE_DIR="/home/malmoi/booking-system"
FILE_PATH="src/app/admin/reservations/page.tsx"

# SSH 옵션 (모든 문제 해결)
SSH_OPTS="-o BatchMode=yes -o PreferredAuthentications=publickey -o StrictHostKeyChecking=accept-new -o ConnectTimeout=15 -o ServerAliveInterval=5"

echo "🚀 예약 페이지 배포 시작..."
echo ""

# 파일 존재 확인
if [ ! -f "$FILE_PATH" ]; then
  echo "❌ 파일을 찾을 수 없습니다: $FILE_PATH"
  exit 1
fi

echo "📤 파일: $FILE_PATH"
echo "🎯 대상: ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/$FILE_PATH"
echo ""

# rsync로 배포 (가장 안전)
echo "배포 중..."
rsync -azP --timeout=20 \
  -e "ssh $SSH_OPTS" \
  "$FILE_PATH" \
  "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/$FILE_PATH"

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ 배포 완료!"
  echo ""
  echo "💡 브라우저에서 페이지를 새로고침하세요."
  echo "   모든 예약 항목이 표시됩니다."
else
  echo ""
  echo "❌ 배포 실패"
  echo ""
  echo "수동 배포 명령어:"
  echo "  rsync -azP -e \"ssh $SSH_OPTS\" $FILE_PATH ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/$FILE_PATH"
  exit 1
fi



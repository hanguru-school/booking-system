#!/bin/bash

# 안전한 rsync 전체 배포 스크립트
# 불필요한 파일 제외 + 진행률 표시

REMOTE_USER="malmoi"
REMOTE_HOST="100.80.210.105"
REMOTE_DIR="/home/malmoi/booking-system"

# SSH 옵션 (비대화식, 키 인증만)
SSH_OPTS="-o BatchMode=yes -o PreferredAuthentications=publickey -o StrictHostKeyChecking=accept-new -o ConnectTimeout=15 -o ServerAliveInterval=5"

echo "🔍 SSH 연결 테스트 중..."
if ! ssh $SSH_OPTS ${REMOTE_USER}@${REMOTE_HOST} 'echo OK' 2>&1; then
  echo "❌ SSH 연결 실패"
  exit 1
fi

echo "✅ SSH 연결 확인됨"
echo ""
echo "📤 rsync로 전체 배포 시작..."
echo "   대상: ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}"
echo ""

# rsync 실행 (불필요물 제외 + 진행률 표시)
rsync -azP \
  --delete \
  --exclude '.git' \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.turbo' \
  --exclude '.env*' \
  --exclude 'backups' \
  --exclude 'logs' \
  --exclude '*.log' \
  --exclude '.DS_Store' \
  -e "ssh $SSH_OPTS" \
  ./ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ 파일 동기화 완료!"
  echo ""
  echo "💡 서버에서 서비스를 재시작하세요:"
  echo "   ssh ${REMOTE_USER}@${REMOTE_HOST}"
  echo "   cd ${REMOTE_DIR}"
  echo "   pkill -f 'next dev' && sleep 2 && npm run start:nas > dev.log 2>&1 &"
else
  echo ""
  echo "❌ 배포 실패"
  echo "   상세 로그를 보려면: rsync -azPvvv ..."
  exit 1
fi



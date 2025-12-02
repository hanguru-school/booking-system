#!/bin/bash

# rsync를 사용한 원격 서버 배포 스크립트

REMOTE_USER="malmoi"
REMOTE_HOST="hanguru-system-server"
REMOTE_DIR="~/booking-system"

echo "🚀 rsync로 원격 서버에 배포 시작..."
echo "   대상: ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}"

# rsync 실행
rsync -avzP --delete \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude '*.log' \
  --exclude '.env*' \
  --exclude 'backups' \
  --exclude 'logs' \
  ./ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/

echo ""
echo "✅ 파일 동기화 완료!"

# 원격 서버에서 서비스 재시작
echo "🔄 원격 서버에서 서비스 재시작 중..."
ssh ${REMOTE_USER}@${REMOTE_HOST} << 'ENDSSH'
cd ~/booking-system

# 기존 프로세스 종료
pkill -f "next dev" 2>/dev/null
pkill -f "npm run dev" 2>/dev/null
pkill -f "next start" 2>/dev/null
sleep 2

# 서버 재시작
echo "🚀 서버 재시작 중..."
NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 nohup npm run dev > dev.log 2>&1 &
SERVER_PID=$!
echo "✅ 서버 시작됨 (PID: $SERVER_PID)"
echo $SERVER_PID > .dev.pid

sleep 5

# 서버 상태 확인
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "🎉 서버가 정상적으로 시작되었습니다!"
    echo "   접속: http://$(hostname -I | awk '{print $1}'):3000"
else
    echo "⚠️  서버 시작 확인 중..."
    tail -10 dev.log
fi
ENDSSH

echo "✅ 배포 완료!"


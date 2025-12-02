#!/bin/bash
# 원격 서버에서 실행할 배포 스크립트
# 사용법: ssh malmoi@hanguru-system-server 'bash -s' < quick-deploy-remote.sh

cd ~/booking-system

echo "🔄 서버 재시작 중..."

# 기존 프로세스 종료
pkill -f "next dev" 2>/dev/null
pkill -f "npm run dev" 2>/dev/null
sleep 2

# 서버 재시작
NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 nohup npm run dev > dev.log 2>&1 &
SERVER_PID=$!
echo $SERVER_PID > .dev.pid

echo "✅ 서버 시작됨 (PID: $SERVER_PID)"

sleep 5

# 서버 상태 확인
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "🎉 서버 정상 작동: http://100.80.210.105:3000"
else
    echo "⚠️  서버 확인 중..."
    tail -10 dev.log
fi



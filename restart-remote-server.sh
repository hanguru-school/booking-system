#!/bin/bash

# 원격 서버 재시작 스크립트

ssh malmoi@hanguru-system-server << 'ENDSSH'
cd ~/booking-system

echo "🛑 기존 서버 종료 중..."
pkill -f "next dev" 2>/dev/null
pkill -f "next-server" 2>/dev/null
sleep 3

echo "🧹 캐시 삭제 중..."
rm -rf .next

echo "🚀 서버 시작 중..."
nohup npm run dev > dev.log 2>&1 &
SERVER_PID=$!
echo "✅ 서버 시작됨 (PID: $SERVER_PID)"
echo $SERVER_PID > .dev.pid

echo "⏳ 서버 초기화 대기 중..."
sleep 10

echo "📊 서버 상태 확인..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ 서버 정상 작동!"
    echo "   접속: http://100.80.210.105:3000"
    echo "   IPv6: http://[fd7a:115c:a1e0::1001:d26d]:3000"
else
    echo "⚠️  서버 시작 확인 중..."
    tail -30 dev.log
fi
ENDSSH

echo "✅ 완료!"



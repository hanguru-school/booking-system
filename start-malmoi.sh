#!/bin/bash

# MalMoi 시스템 자동 실행 스크립트

echo "🚀 MalMoi 시스템 시작 중..."

# 프로젝트 디렉토리로 이동
cd /Users/jinasmacbook/booking-system

# 기존 프로세스 종료
echo "📋 기존 프로세스 정리 중..."
pkill -f "npm run dev" 2>/dev/null
pkill -f "ngrok" 2>/dev/null
sleep 2

# 개발 서버 시작
echo "🔧 개발 서버 시작 중..."
nohup npm run dev > dev.log 2>&1 &
DEV_PID=$!
echo "✅ 개발 서버 시작됨 (PID: $DEV_PID)"

# 잠시 대기 (서버 시작 시간)
sleep 5

# ngrok 시작
echo "🌐 ngrok 터널 시작 중..."
nohup ngrok http 3004 > ngrok.log 2>&1 &
NGROK_PID=$!
echo "✅ ngrok 터널 시작됨 (PID: $NGROK_PID)"

# 잠시 대기 (ngrok 시작 시간)
sleep 3

# ngrok URL 추출
echo "🔍 ngrok URL 확인 중..."
sleep 2

# ngrok API를 통해 URL 가져오기
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*' | grep -o 'https://[^"]*' | head -1)

if [ -n "$NGROK_URL" ]; then
    echo ""
    echo "🎉 시스템이 성공적으로 시작되었습니다!"
    echo ""
    echo "📱 로컬 접속: http://localhost:3004"
    echo "🌐 외부 접속: $NGROK_URL"
    echo ""
    echo "📊 모니터링:"
    echo "   - 개발 서버 로그: tail -f dev.log"
    echo "   - ngrok 로그: tail -f ngrok.log"
    echo "   - ngrok 웹 UI: http://localhost:4040"
    echo ""
    echo "🛑 종료하려면: ./stop-malmoi.sh"
    echo ""
else
    echo "⚠️  ngrok URL을 가져올 수 없습니다. 수동으로 확인하세요:"
    echo "   http://localhost:4040"
fi

# PID 저장 (종료용)
echo $DEV_PID > .dev.pid
echo $NGROK_PID > .ngrok.pid

echo "✅ 완료! 시스템이 백그라운드에서 실행 중입니다."






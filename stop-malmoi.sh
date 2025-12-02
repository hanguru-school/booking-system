#!/bin/bash

# MalMoi 시스템 종료 스크립트

echo "🛑 MalMoi 시스템 종료 중..."

# PID 파일에서 프로세스 ID 읽기
if [ -f ".dev.pid" ]; then
    DEV_PID=$(cat .dev.pid)
    echo "📋 개발 서버 종료 중 (PID: $DEV_PID)..."
    kill $DEV_PID 2>/dev/null
    rm .dev.pid
fi

if [ -f ".ngrok.pid" ]; then
    NGROK_PID=$(cat .ngrok.pid)
    echo "📋 ngrok 터널 종료 중 (PID: $NGROK_PID)..."
    kill $NGROK_PID 2>/dev/null
    rm .ngrok.pid
fi

# 추가로 실행 중인 프로세스들 정리
pkill -f "npm run dev" 2>/dev/null
pkill -f "ngrok" 2>/dev/null

echo "✅ 시스템이 종료되었습니다."






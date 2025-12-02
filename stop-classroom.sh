#!/bin/bash

# 교실 서버 (프로덕션) 종료 스크립트

echo "🛑 교실 서버 종료 중..."

# 프로젝트 디렉토리로 이동
cd /Users/jinasmacbook/booking-system

# PID 파일에서 프로세스 ID 읽기
if [ -f ".classroom.pid" ]; then
    SERVER_PID=$(cat .classroom.pid)
    echo "📋 프로덕션 서버 종료 중 (PID: $SERVER_PID)..."
    kill $SERVER_PID 2>/dev/null
    rm .classroom.pid
fi

# 추가로 실행 중인 프로세스들 정리
pkill -f "npm run start:nas" 2>/dev/null
pkill -f "next start" 2>/dev/null

echo "✅ 교실 서버가 종료되었습니다."



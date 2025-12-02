#!/bin/bash

echo "📊 자동 배포 상태 확인"
echo ""

if pgrep -f "fswatch.*booking-system" > /dev/null; then
    PID=$(pgrep -f "fswatch.*booking-system" | head -1)
    echo "✅ 자동 배포 실행 중 (PID: $PID)"
    echo ""
    echo "최근 로그:"
    tail -5 /tmp/auto-deploy-output.log 2>/dev/null || echo "로그 없음"
else
    echo "❌ 자동 배포가 실행되고 있지 않습니다."
    echo ""
    echo "시작하려면: ./start-auto-deploy.sh"
fi




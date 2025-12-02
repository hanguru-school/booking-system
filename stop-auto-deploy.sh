#!/bin/bash

echo "🛑 자동 배포 중지 중..."

# fswatch 프로세스 종료
pkill -f "fswatch.*booking-system" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ 자동 배포가 중지되었습니다."
else
    echo "⚠️  실행 중인 자동 배포 프로세스를 찾을 수 없습니다."
fi




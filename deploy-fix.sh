#!/bin/bash

# 빠른 수정 파일 배포 스크립트

REMOTE_USER="malmoi"
REMOTE_HOST="hanguru-system-server"
REMOTE_DIR="~/booking-system"

echo "🚀 예약 날짜/시간 수정 파일 배포..."

# 수정된 파일 배포
scp -o ConnectTimeout=10 src/app/api/reservations/list/route.ts ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/src/app/api/reservations/list/route.ts

scp -o ConnectTimeout=10 src/app/admin/reservations/page.tsx ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/src/app/admin/reservations/page.tsx

echo "✅ 파일 배포 완료!"
echo ""
echo "서버 재시작은 수동으로 진행하세요:"
echo "ssh ${REMOTE_USER}@${REMOTE_HOST}"
echo "cd ~/booking-system && pkill -f 'next dev' && sleep 2 && npm run dev > dev.log 2>&1 &"



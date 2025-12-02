#!/bin/bash

# 빠른 배포 스크립트 (타임아웃 설정)

REMOTE="malmoi@hanguru-system-server:~/booking-system"

echo "🚀 빠른 배포 시작..."

# 수정된 파일만 배포 (타임아웃 15초)
timeout 15 scp -o ConnectTimeout=5 src/app/admin/reservations/new/page.tsx ${REMOTE}/src/app/admin/reservations/new/page.tsx 2>&1 | tail -3
timeout 15 scp -o ConnectTimeout=5 "src/app/admin/reservations/[id]/edit/page.tsx" ${REMOTE}/src/app/admin/reservations/\[id\]/edit/page.tsx 2>&1 | tail -3

echo "✅ 배포 완료!"
echo "서버 재시작: ssh malmoi@hanguru-system-server 'cd ~/booking-system && pkill -f \"next dev\" && sleep 2 && npm run dev > dev.log 2>&1 &'"

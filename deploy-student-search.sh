#!/bin/bash

# 학생 검색 기능 개선 파일 배포 스크립트

REMOTE_USER="malmoi"
REMOTE_HOST="hanguru-system-server"
REMOTE_DIR="~/booking-system"

# 프로젝트 디렉토리로 이동
cd "$(dirname "$0")" || exit 1

echo "🚀 학생 검색 기능 개선 파일 배포 시작..."
echo "현재 디렉토리: $(pwd)"

# 파일 배포
echo "📤 새 예약 페이지 배포 중..."
scp -o ConnectTimeout=10 src/app/admin/reservations/new/page.tsx ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/src/app/admin/reservations/new/page.tsx

echo "📤 예약 수정 페이지 배포 중..."
scp -o ConnectTimeout=10 "src/app/admin/reservations/[id]/edit/page.tsx" ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/src/app/admin/reservations/\[id\]/edit/page.tsx

echo ""
echo "✅ 파일 배포 완료!"
echo ""
echo "서버 재시작 (필요시):"
echo "ssh ${REMOTE_USER}@${REMOTE_HOST} 'cd ~/booking-system && pkill -f \"next dev\" && sleep 2 && npm run dev > dev.log 2>&1 &'"



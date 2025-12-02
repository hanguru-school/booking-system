#!/bin/bash

# 빠른 파일 배포 스크립트 (타임아웃 설정)

REMOTE_USER="malmoi"
REMOTE_HOST="hanguru-system-server"
REMOTE_DIR="~/booking-system"

# 타임아웃 설정 (30초)
TIMEOUT=30

echo "🚀 빠른 파일 배포 시작..."

# 수정된 파일만 배포
FILES=(
  "src/app/api/reservations/list/route.ts"
  "src/app/admin/reservations/page.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "📤 배포 중: $file"
    timeout $TIMEOUT scp -o ConnectTimeout=10 "$file" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/$file" 2>&1
    if [ $? -eq 0 ]; then
      echo "✅ $file 배포 완료"
    else
      echo "❌ $file 배포 실패"
    fi
  else
    echo "⚠️  파일 없음: $file"
  fi
done

echo ""
echo "✅ 파일 배포 완료!"
echo ""
echo "원격 서버에서 수동으로 재시작하세요:"
echo "ssh ${REMOTE_USER}@${REMOTE_HOST}"
echo "cd ~/booking-system"
echo "pkill -f 'next dev' && sleep 2 && npm run dev > dev.log 2>&1 &"



#!/bin/bash

# 원격 서버에 최신 코드 배포 스크립트

REMOTE_USER="malmoi"
REMOTE_HOST="hanguru-system-server"
REMOTE_DIR="~/booking-system"

echo "🚀 원격 서버에 배포 시작..."

# 변경된 주요 파일들 복사
echo "📁 파일 복사 중..."

# 1. 로그인 관련 파일
scp src/app/api/auth/login/route.ts ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/src/app/api/auth/login/route.ts
scp src/app/auth/login/page.tsx ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/src/app/auth/login/page.tsx

# 2. 레이아웃 파일
scp src/app/layout.tsx ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/src/app/layout.tsx
scp src/app/admin/layout.tsx ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/src/app/admin/layout.tsx

# 3. CSS 파일
scp src/app/globals.css ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/src/app/globals.css

# 4. 예약 페이지
scp src/app/admin/reservations/page.tsx ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/src/app/admin/reservations/page.tsx

# 5. Prisma 파일
scp src/lib/prisma.ts ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/src/lib/prisma.ts

# 6. Student Identifiers 페이지 (useAuth 에러 수정)
scp src/app/admin/student-identifiers/page.tsx ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/src/app/admin/student-identifiers/page.tsx

# 7. Students 관련 페이지들 (Suspense 수정)
scp src/app/admin/students/lessons/page.tsx ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/src/app/admin/students/lessons/page.tsx
scp src/app/admin/students/payments/page.tsx ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/src/app/admin/students/payments/page.tsx
scp src/app/admin/students/levels/page.tsx ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/src/app/admin/students/levels/page.tsx

echo "✅ 파일 복사 완료"

# 원격 서버에서 서비스 재시작
echo "🔄 원격 서버에서 서비스 재시작 중..."
ssh ${REMOTE_USER}@${REMOTE_HOST} << 'ENDSSH'
cd ~/booking-system

# 기존 프로세스 종료
pkill -f "next dev" 2>/dev/null
pkill -f "npm run dev" 2>/dev/null
sleep 2

# 서버 재시작
echo "🚀 서버 재시작 중..."
NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 nohup npm run dev > dev.log 2>&1 &
SERVER_PID=$!
echo "✅ 서버 시작됨 (PID: $SERVER_PID)"
echo $SERVER_PID > .dev.pid

sleep 5

# 서버 상태 확인
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "🎉 서버가 정상적으로 시작되었습니다!"
    echo "   접속: http://100.80.210.105:3000"
else
    echo "⚠️  서버 시작 확인 중..."
    tail -10 dev.log
fi
ENDSSH

echo "✅ 배포 완료!"


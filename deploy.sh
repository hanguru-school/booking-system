#!/bin/bash
set -euo pipefail

# 원격 서버 정보
REMOTE_USER="malmoi"
REMOTE_HOST="100.80.210.105"
REMOTE_DIR="~/booking-system"

echo "🚀 자동 배포 시작..."

# 1. 코드 업로드
echo "📤 코드 업로드 중..."
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude 'backups' \
  --exclude 'logs' \
  --exclude '.env*' \
  --exclude '*.log' \
  --exclude '.git' \
  --exclude '*.tsbuildinfo' \
  --exclude '.DS_Store' \
  --exclude 'data' \
  ./ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/

# 2. 원격 서버에서 업데이트 실행
echo "🔧 원격 서버 업데이트 중..."
ssh ${REMOTE_USER}@${REMOTE_HOST} <<'ENDSSH'
set -euo pipefail

cd ~/booking-system

# Node.js 설정
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 의존성 업데이트
echo "📦 의존성 업데이트 중..."
npm install

# Prisma 클라이언트 재생성
echo "🔄 Prisma 클라이언트 재생성 중..."
npx prisma generate

# 마이그레이션 실행 (새로운 마이그레이션이 있으면)
echo "🗄️  데이터베이스 마이그레이션 확인 중..."
npx prisma migrate deploy

# 빌드
echo "🏗️  프로덕션 빌드 중..."
npm run build

echo "✅ 배포 완료!"
echo ""
echo "서버를 재시작하려면:"
echo "  npm start"
echo "  또는"
echo "  pm2 restart booking-system"
echo "  또는"
echo "  sudo systemctl restart malmoi"
ENDSSH

echo "✨ 자동 배포 완료!"




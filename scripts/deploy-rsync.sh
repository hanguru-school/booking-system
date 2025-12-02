#!/bin/bash
# Rsync 기반 배포 스크립트
# 사용법: ./scripts/deploy-rsync.sh

set -euo pipefail

# 서버 정보
SERVER_USER="malmoi"
SERVER_HOST="100.80.210.105"
SERVER_PATH="/home/malmoi/booking-system"
SSH_OPTS="-o BatchMode=yes -o PreferredAuthentications=publickey -o StrictHostKeyChecking=accept-new"

# 로컬 프로젝트 디렉터리
LOCAL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "=== Rsync 배포 시작 ==="
echo "로컬: $LOCAL_DIR"
echo "원격: $SERVER_USER@$SERVER_HOST:$SERVER_PATH"

# Rsync 실행 (제외 디렉터리: .git, node_modules, .next, .turbo)
echo "📤 파일 동기화 중..."
rsync -azP --delete \
  --exclude '.git' \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.turbo' \
  --exclude '.DS_Store' \
  --exclude '*.log' \
  --exclude '.env.local' \
  -e "ssh $SSH_OPTS" \
  "$LOCAL_DIR/" "$SERVER_USER@$SERVER_HOST:$SERVER_PATH/"

if [ $? -ne 0 ]; then
    echo "❌ Rsync 실패"
    exit 1
fi

echo "✅ 파일 동기화 완료"

# 서버에서 빌드 및 재시작
echo "🔨 서버에서 빌드 및 재시작 중..."
ssh $SSH_OPTS "$SERVER_USER@$SERVER_HOST" bash << 'ENDSSH'
set -euo pipefail

# 환경 변수 설정
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
export PATH="$HOME/.local/bin:$PATH"

cd ~/booking-system

echo "의존성 설치 중..."
if command -v pnpm &> /dev/null; then
    pnpm install --frozen-lockfile || pnpm install
else
    npm ci || npm install
fi

echo "Prisma 생성 중..."
if [ -f "prisma/schema.prisma" ]; then
    if command -v pnpm &> /dev/null; then
        pnpm exec prisma generate || npx prisma generate
    else
        npx prisma generate
    fi
fi

echo "빌드 중..."
if command -v pnpm &> /dev/null; then
    pnpm run build || npm run build
else
    npm run build
fi

echo "PM2 재시작 중..."
if pm2 list | grep -q "booking"; then
    pm2 restart booking
else
    pm2 start "npm run start" --name booking --time
fi

pm2 save || true

echo "✅ 배포 완료"
ENDSSH

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 배포 성공!"
    echo "서비스 확인: ssh $SSH_OPTS $SERVER_USER@$SERVER_HOST 'pm2 list'"
    echo "로그 확인: ssh $SSH_OPTS $SERVER_USER@$SERVER_HOST 'pm2 logs booking --lines 50'"
else
    echo "❌ 배포 실패"
    exit 1
fi


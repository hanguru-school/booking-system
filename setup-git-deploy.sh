#!/bin/bash

# Git 기반 배포 설정 (서버에서 한 번만 실행)
# 이 스크립트는 서버에서 실행하세요

REMOTE_USER="malmoi"
REMOTE_HOST="100.80.210.105"
TARGET_DIR="/home/malmoi/booking-system"
REPO_DIR="/home/malmoi/repos/booking-system.git"

echo "🔧 Git 기반 배포 설정 시작..."
echo ""
echo "⚠️  이 스크립트는 서버(${REMOTE_HOST})에서 실행해야 합니다."
echo ""
echo "서버에 SSH 접속 후 다음 명령을 실행하세요:"
echo ""
echo "  ssh ${REMOTE_USER}@${REMOTE_HOST}"
echo ""
echo "그리고 다음 명령들을 실행:"
echo ""
cat << 'EOF'
# 1. 베어 저장소 생성
mkdir -p ~/repos/booking-system.git
cd ~/repos/booking-system.git
git init --bare

# 2. post-receive 훅 생성
cat > hooks/post-receive <<'SH'
#!/usr/bin/env bash
set -euo pipefail
TARGET=/home/malmoi/booking-system
if [ ! -d "$TARGET" ]; then
  git clone --depth=1 "$PWD" "$TARGET"
else
  cd "$TARGET"
  git fetch --depth=1 origin
  git reset --hard origin/feature/production-system-setup || git reset --hard origin/main
fi
cd "$TARGET"
# 의존성 설치
npm ci --production=false
# Prisma 생성
npx prisma generate
# 빌드
npm run build
# 서비스 재시작 (pm2 사용 시)
# pm2 restart booking || pm2 start "npm run start:nas" --name booking
# 또는 직접 실행
pkill -f "next dev" 2>/dev/null || true
pkill -f "npm run start:nas" 2>/dev/null || true
sleep 2
NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 nohup npm run start:nas > dev.log 2>&1 &
echo $! > .dev.pid
SH
chmod +x hooks/post-receive

echo "✅ Git 저장소 설정 완료!"
EOF

echo ""
echo "로컬에서 Git remote 추가:"
echo "  git remote add server ssh://${REMOTE_USER}@${REMOTE_HOST}${REPO_DIR}"
echo ""
echo "배포:"
echo "  git push server feature/production-system-setup"



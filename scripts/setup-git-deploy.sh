#!/bin/bash
# Git 푸시 배포 파이프라인 설정 스크립트
# 멱등성 보장: 이미 설정되어 있어도 재실행 가능

set -euo pipefail

echo "=== Git 푸시 배포 파이프라인 설정 ==="

# 1. 베어 저장소 생성
echo "📦 베어 저장소 생성 중..."
REPO_DIR="$HOME/repos/booking-system.git"
APP_DIR="$HOME/booking-system"

if [ ! -d "$REPO_DIR" ]; then
    mkdir -p "$REPO_DIR"
    cd "$REPO_DIR"
    git init --bare
    echo "✅ 베어 저장소 생성됨"
else
    echo "✅ 베어 저장소 이미 존재"
fi

# 2. post-receive 훅 생성
echo "🪝 post-receive 훅 생성 중..."
cat > "$REPO_DIR/hooks/post-receive" <<'HOOK'
#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$HOME/booking-system"
REPO_DIR="$HOME/repos/booking-system.git"
BRANCH="main"

# 로그 파일
LOG_FILE="$HOME/.pm2/logs/deploy.log"
mkdir -p "$(dirname "$LOG_FILE")"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

log "=== 배포 시작 ==="

# 환경변수 주입
set -a
[ -f /etc/malmoi/booking.env ] && source /etc/malmoi/booking.env
set +a

# 프로젝트 디렉터리 체크아웃/업데이트
if [ ! -d "$APP_DIR/.git" ]; then
    log "첫 배포: 프로젝트 클론 중..."
    rm -rf "$APP_DIR"
    git clone --depth=1 "$REPO_DIR" "$APP_DIR"
    cd "$APP_DIR"
else
    log "기존 프로젝트 업데이트 중..."
    cd "$APP_DIR"
    git fetch origin "$BRANCH" || git fetch origin main
    git reset --hard "origin/$BRANCH" || git reset --hard origin/main
fi

# Node 준비
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"

if command -v corepack &> /dev/null; then
    corepack enable || true
fi

if ! command -v pnpm &> /dev/null; then
    log "pnpm 설치 중..."
    npm i -g pnpm || true
fi

# 의존성 설치
log "의존성 설치 중..."
pnpm install --frozen-lockfile || npm ci || npm install

# Prisma 마이그레이션
if [ -f prisma/schema.prisma ]; then
    log "Prisma 마이그레이션 실행 중..."
    pnpm prisma migrate deploy || npx prisma migrate deploy || true
    pnpm prisma generate || npx prisma generate || true
fi

# 빌드
log "빌드 중..."
pnpm build || npm run build

# PM2 시작/재시작
log "PM2 서비스 관리 중..."
cd "$APP_DIR"
if pm2 list | grep -q "booking"; then
    pm2 restart booking || pm2 delete booking
fi

if ! pm2 list | grep -q "booking"; then
    # 환경변수 로드 후 PM2 시작
    set -a
    [ -f /etc/malmoi/booking.env ] && source /etc/malmoi/booking.env
    set +a
    pm2 start "pnpm start" --name booking --time --update-env
fi

pm2 save || true

log "=== 배포 완료 ==="
log "서비스 상태: pm2 list"
log "로그 확인: pm2 logs booking --lines 50"
HOOK

chmod +x "$REPO_DIR/hooks/post-receive"
echo "✅ post-receive 훅 생성 완료"

# 3. 기본 브랜치 설정
cd "$REPO_DIR"
git config init.defaultBranch main || true

echo "✅ Git 배포 파이프라인 설정 완료"


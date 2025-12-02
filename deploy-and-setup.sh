#!/bin/bash
set -euo pipefail

REMOTE_USER="malmoi"
REMOTE_HOST="100.80.210.105"
REMOTE_DIR="~/booking-system"

echo "🚀 자동 배포 및 설정 시작..."

# 1. 코드 업로드 (이미 완료되었지만 확인)
echo "📤 코드 업로드 확인 중..."
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
  ./ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/

# 2. 원격 서버에서 설정 스크립트 실행
echo "🔧 원격 서버 설정 실행 중..."
ssh ${REMOTE_USER}@${REMOTE_HOST} <<'ENDSSH'
set -euo pipefail

cd ~/booking-system

# PostgreSQL 설치 확인 및 설치
if ! command -v psql &> /dev/null; then
    echo "📦 PostgreSQL 설치 중..."
    sudo apt update
    sudo apt install -y postgresql postgresql-contrib
fi

# PostgreSQL 시작
echo "▶️  PostgreSQL 시작 중..."
sudo systemctl start postgresql 2>/dev/null || true
sudo systemctl enable postgresql 2>/dev/null || true

# 데이터베이스가 이미 존재하는지 확인
DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='malmoi_system'" 2>/dev/null || echo "0")

if [ "$DB_EXISTS" != "1" ]; then
    echo "🗄️  데이터베이스 생성 중..."
    sudo -u postgres psql <<EOF
CREATE DATABASE malmoi_system;
CREATE USER malmoi WITH PASSWORD 'malmoi2020';
GRANT ALL PRIVILEGES ON DATABASE malmoi_system TO malmoi;
ALTER USER malmoi CREATEDB;
\q
EOF
else
    echo "✅ 데이터베이스가 이미 존재합니다."
fi

# .env 파일 업데이트
echo "⚙️  .env 파일 설정 중..."
if grep -q "DATABASE_URL=" .env; then
    sed -i 's|DATABASE_URL=.*|DATABASE_URL="postgresql://malmoi:malmoi2020@localhost:5432/malmoi_system?schema=public"|g' .env
else
    echo "" >> .env
    echo "# Local PostgreSQL Database" >> .env
    echo 'DATABASE_URL="postgresql://malmoi:malmoi2020@localhost:5432/malmoi_system?schema=public"' >> .env
fi

# Node.js 설정
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 의존성 설치 확인
if [ ! -d "node_modules" ]; then
    echo "📦 의존성 설치 중..."
    npm install
fi

# 마이그레이션 실행
echo "🔄 마이그레이션 실행 중..."
npx prisma migrate deploy

echo "✅ 설정 완료!"
ENDSSH

echo "✨ 자동 배포 및 설정 완료!"




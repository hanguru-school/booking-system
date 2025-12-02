#!/bin/bash
set -euo pipefail

echo "🚀 완전 자동 설정 시작..."

cd ~/booking-system

# PostgreSQL 시작 확인
echo "▶️  PostgreSQL 상태 확인..."
sudo systemctl start postgresql 2>/dev/null || true
sudo systemctl enable postgresql 2>/dev/null || true

# 데이터베이스 존재 확인 및 생성
echo "🗄️  데이터베이스 확인 중..."
DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='malmoi_system'" 2>/dev/null || echo "0")

if [ "$DB_EXISTS" != "1" ]; then
    echo "📦 데이터베이스 생성 중..."
    sudo -u postgres psql <<EOF
CREATE DATABASE malmoi_system;
CREATE USER malmoi WITH PASSWORD 'malmoi2020';
GRANT ALL PRIVILEGES ON DATABASE malmoi_system TO malmoi;
ALTER USER malmoi CREATEDB;
\q
EOF
    echo "✅ 데이터베이스 생성 완료!"
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
echo "✅ .env 파일 설정 완료!"

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

echo "✨ 설정 완료!"
echo ""
echo "다음 단계:"
echo "1. 서버 빌드: npm run build"
echo "2. 서버 시작: npm start"
echo "   또는 개발 모드: npm run dev"




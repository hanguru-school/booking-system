#!/bin/bash
set -euo pipefail

cd ~/booking-system

# PostgreSQL 시작
sudo systemctl start postgresql 2>/dev/null || true
sudo systemctl enable postgresql 2>/dev/null || true

# 데이터베이스 존재 확인 및 생성
DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='malmoi_system'" 2>/dev/null || echo "0")

if [ "$DB_EXISTS" != "1" ]; then
    echo "📦 데이터베이스 생성 중..."
    sudo -u postgres psql <<EOF
CREATE DATABASE malmoi_system;
CREATE USER malmoi WITH PASSWORD 'malmoi2020';
GRANT ALL PRIVILEGES ON DATABASE malmoi_system TO malmoi;
ALTER USER malmoi CREATEDB;
ALTER DATABASE malmoi_system OWNER TO malmoi;
\q
EOF
    # public 스키마 권한 부여
    sudo -u postgres psql -d malmoi_system <<EOF
GRANT ALL ON SCHEMA public TO malmoi;
ALTER SCHEMA public OWNER TO malmoi;
\q
EOF
else
    echo "✅ 데이터베이스가 이미 존재합니다."
    # 기존 데이터베이스에도 권한 부여
    sudo -u postgres psql -d malmoi_system <<EOF
GRANT ALL ON SCHEMA public TO malmoi;
ALTER SCHEMA public OWNER TO malmoi;
\q
EOF
fi

# .env 파일 업데이트
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

# 의존성 업데이트
echo "📦 의존성 업데이트 중..."
npm install

# Prisma 클라이언트 재생성
echo "🔄 Prisma 클라이언트 재생성 중..."
npx prisma generate

# 마이그레이션 실행
echo "🗄️  데이터베이스 마이그레이션 실행 중..."
npx prisma migrate deploy

# 빌드
echo "🏗️  프로덕션 빌드 중..."
npm run build

echo "✅ 배포 완료!"


#!/bin/bash
# 데이터베이스 연결 문제 해결 스크립트 (sudo 권한 필요)
# 멱등성 보장: 이미 설정되어 있어도 재실행 가능

set -euo pipefail

echo "=== 데이터베이스 연결 문제 해결 ==="

# 1. PostgreSQL 서비스 시작
echo "📦 PostgreSQL 서비스 시작 중..."
sudo systemctl enable postgresql
sudo systemctl start postgresql

if sudo systemctl is-active --quiet postgresql; then
    echo "✅ PostgreSQL 서비스 실행 중"
else
    echo "❌ PostgreSQL 서비스 시작 실패"
    exit 1
fi

# 2. PostgreSQL 사용자 및 데이터베이스 생성
echo "🗄️ 데이터베이스 및 사용자 생성 중..."

# DB_PASS 생성 또는 가져오기
ENV_FILE="/etc/malmoi/booking.env"
if [ -f "$ENV_FILE" ] && grep -q '^DB_PASS=' "$ENV_FILE" 2>/dev/null; then
    DB_PASS=$(grep '^DB_PASS=' "$ENV_FILE" | cut -d= -f2)
    echo "✅ 기존 DB_PASS 사용"
else
    DB_PASS=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-24)
    echo "✅ 새 DB_PASS 생성됨"
fi

# 사용자 생성
if ! sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='malmoi_admin'" | grep -q 1; then
    sudo -u postgres psql -c "CREATE ROLE malmoi_admin LOGIN PASSWORD '$DB_PASS';"
    echo "✅ malmoi_admin 사용자 생성됨"
else
    sudo -u postgres psql -c "ALTER ROLE malmoi_admin WITH PASSWORD '$DB_PASS';" || true
    echo "✅ malmoi_admin 사용자 비밀번호 업데이트됨"
fi

# 데이터베이스 생성
if ! sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='malmoi_system'" | grep -q 1; then
    sudo -u postgres createdb -O malmoi_admin malmoi_system
    echo "✅ malmoi_system 데이터베이스 생성됨"
else
    echo "✅ malmoi_system 데이터베이스 이미 존재함"
fi

# 3. 환경변수 파일 생성
echo "📝 환경변수 파일 생성 중..."
sudo mkdir -p /etc/malmoi
sudo chmod 750 /etc/malmoi

# MinIO 자격 증명 가져오기 또는 생성
if [ -f "$ENV_FILE" ] && grep -q '^MINIO_ROOT_USER=' "$ENV_FILE" 2>/dev/null; then
    MINIO_ROOT_USER=$(grep '^MINIO_ROOT_USER=' "$ENV_FILE" | cut -d= -f2)
    MINIO_ROOT_PASSWORD=$(grep '^MINIO_ROOT_PASSWORD=' "$ENV_FILE" | cut -d= -f2)
    echo "✅ 기존 MinIO 자격 증명 사용"
else
    MINIO_ROOT_USER=$(openssl rand -hex 16)
    MINIO_ROOT_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    echo "✅ 새 MinIO 자격 증명 생성됨"
fi

# 환경변수 파일 생성
sudo tee "$ENV_FILE" >/dev/null <<EOF
# 데이터베이스 (로컬 PostgreSQL)
DATABASE_URL=postgresql://malmoi_admin:${DB_PASS}@localhost:5432/malmoi_system?sslmode=disable
DB_PASS=${DB_PASS}

# 파일 스토리지 (Object Storage - MinIO 호환)
OBJECT_STORAGE_BUCKET=malmoi-system-files
OBJECT_STORAGE_ENDPOINT=http://127.0.0.1:9000
OBJECT_STORAGE_FORCE_PATH_STYLE=true
OBJECT_STORAGE_ACCESS_KEY=${MINIO_ROOT_USER}
OBJECT_STORAGE_SECRET_KEY=${MINIO_ROOT_PASSWORD}
OBJECT_STORAGE_REGION=local
MINIO_ROOT_USER=${MINIO_ROOT_USER}
MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD}

# 애플리케이션
NODE_ENV=production
PORT=3000
NEXTAUTH_URL=http://192.168.1.41:3000
NEXT_PUBLIC_APP_URL=http://192.168.1.41:3000

# 이메일
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=office@hanguru.school
SMTP_PASS=
EMAIL_FROM=office@hanguru.school
EOF

# 권한 설정
sudo chmod 644 "$ENV_FILE"
sudo chown root:root "$ENV_FILE"

echo "✅ 환경변수 파일 생성 완료: $ENV_FILE"

# 4. PM2 환경변수 주입 및 재시작
echo "🔄 PM2 환경변수 적용 중..."
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
export PATH="$HOME/.local/bin:$PATH"

# 환경변수 로드
set -a
source "$ENV_FILE"
set +a

# PM2 재시작 (환경변수 적용)
if pm2 list | grep -q "booking"; then
    pm2 delete booking || true
fi

# PM2 시작 (환경변수 주입)
cd "$HOME/booking-system"
# 환경변수를 명시적으로 export하여 PM2에 전달
export DATABASE_URL
export DB_PASS
export OBJECT_STORAGE_BUCKET
export OBJECT_STORAGE_ENDPOINT
export OBJECT_STORAGE_FORCE_PATH_STYLE
export OBJECT_STORAGE_ACCESS_KEY
export OBJECT_STORAGE_SECRET_KEY
export OBJECT_STORAGE_REGION
export NODE_ENV
export PORT
export NEXTAUTH_URL
export NEXT_PUBLIC_APP_URL
export SMTP_HOST
export SMTP_PORT
export SMTP_USER
export SMTP_PASS

pm2 start "pnpm start" --name booking --time --update-env
pm2 save || true

echo ""
echo "✅ 데이터베이스 연결 문제 해결 완료"
echo ""
echo "확인:"
echo "  - PostgreSQL: sudo systemctl status postgresql"
echo "  - PM2: pm2 list"
echo "  - 로그: pm2 logs booking --lines 20"
echo "  - Health: curl http://localhost:3000/api/health"


#!/bin/bash
# PostgreSQL 설치 및 초기화 스크립트 (sudo 권한 필요)
# 멱등성 보장: 이미 설정되어 있어도 재실행 가능

set -euo pipefail

echo "=== PostgreSQL 설치 및 초기화 ==="

# 1. PostgreSQL 설치
echo "📦 PostgreSQL 설치 중..."
if ! command -v psql &> /dev/null; then
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl enable --now postgresql
else
    echo "✅ PostgreSQL 이미 설치됨"
fi

# 2. 강한 랜덤 비밀번호 생성
echo "🔐 데이터베이스 비밀번호 생성 중..."
if ! grep -q '^DB_PASS=' /etc/malmoi/booking.env 2>/dev/null; then
    DB_PASS=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-24)
    echo "DB_PASS=$DB_PASS" | sudo tee -a /etc/malmoi/booking.env >/dev/null
    echo "✅ DB 비밀번호 생성됨"
else
    DB_PASS=$(grep '^DB_PASS=' /etc/malmoi/booking.env | cut -d= -f2)
    echo "✅ 기존 DB 비밀번호 사용"
fi

# 3. 유저 생성 (존재하면 건너뜀)
echo "👤 데이터베이스 유저 생성 중..."
if sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='malmoi_admin'" | grep -q 1; then
    echo "✅ 유저 malmoi_admin 이미 존재"
    # 비밀번호 업데이트
    sudo -u postgres psql -c "ALTER ROLE malmoi_admin WITH PASSWORD '$DB_PASS';" || true
else
    sudo -u postgres psql -c "CREATE ROLE malmoi_admin LOGIN PASSWORD '$DB_PASS';"
    echo "✅ 유저 malmoi_admin 생성됨"
fi

# 4. 데이터베이스 생성 (존재하면 건너뜀)
echo "🗄️ 데이터베이스 생성 중..."
if sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='malmoi_system'" | grep -q 1; then
    echo "✅ 데이터베이스 malmoi_system 이미 존재"
else
    sudo -u postgres createdb -O malmoi_admin malmoi_system
    echo "✅ 데이터베이스 malmoi_system 생성됨"
fi

# 5. DATABASE_URL 환경변수 주입
echo "📝 DATABASE_URL 환경변수 설정 중..."
if ! grep -q '^DATABASE_URL=' /etc/malmoi/booking.env 2>/dev/null; then
    echo "DATABASE_URL=postgresql://malmoi_admin:$DB_PASS@localhost:5432/malmoi_system?sslmode=disable" | sudo tee -a /etc/malmoi/booking.env >/dev/null
    echo "✅ DATABASE_URL 설정됨"
else
    # 기존 DATABASE_URL 업데이트
    sudo sed -i "s|^DATABASE_URL=.*|DATABASE_URL=postgresql://malmoi_admin:$DB_PASS@localhost:5432/malmoi_system?sslmode=disable|" /etc/malmoi/booking.env
    echo "✅ DATABASE_URL 업데이트됨"
fi

# 6. PostgreSQL 설정 (로컬 접근만 허용)
echo "🔒 PostgreSQL 보안 설정 중..."
if ! grep -q "^listen_addresses = 'localhost'" /etc/postgresql/*/main/postgresql.conf 2>/dev/null; then
    sudo sed -i "s/^#listen_addresses = 'localhost'/listen_addresses = 'localhost'/" /etc/postgresql/*/main/postgresql.conf 2>/dev/null || true
    sudo systemctl restart postgresql || true
    echo "✅ PostgreSQL 로컬 접근만 허용"
fi

echo "✅ PostgreSQL 설정 완료"


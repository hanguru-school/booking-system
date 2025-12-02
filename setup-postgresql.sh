#!/bin/bash
set -euo pipefail

echo ">> 1) PostgreSQL 설치"
sudo apt update
sudo apt install -y postgresql postgresql-contrib

echo ">> 2) PostgreSQL 시작 및 자동 시작 설정"
sudo systemctl start postgresql
sudo systemctl enable postgresql

echo ">> 3) 데이터베이스 및 사용자 생성"
sudo -u postgres psql <<EOF
CREATE DATABASE malmoi_system;
CREATE USER malmoi WITH PASSWORD 'malmoi2020';
GRANT ALL PRIVILEGES ON DATABASE malmoi_system TO malmoi;
ALTER USER malmoi CREATEDB;
\q
EOF

echo ">> 4) .env 파일 업데이트"
cd ~/booking-system

# DATABASE_URL이 이미 있으면 업데이트, 없으면 추가
if grep -q "DATABASE_URL=" .env; then
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"postgresql://malmoi:malmoi2020@localhost:5432/malmoi_system?schema=public\"|g" .env
else
    echo "" >> .env
    echo "# Local PostgreSQL Database" >> .env
    echo "DATABASE_URL=\"postgresql://malmoi:malmoi2020@localhost:5432/malmoi_system?schema=public\"" >> .env
fi

echo ">> 5) 마이그레이션 실행"
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
npx prisma migrate deploy

echo ">> 완료!"
echo "데이터베이스가 설정되었습니다."




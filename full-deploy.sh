#!/bin/bash
set -euo pipefail

REMOTE_USER="malmoi"
REMOTE_HOST="100.80.210.105"
REMOTE_DIR="~/booking-system"
SUDO_PASSWORD="malmoi2020"

echo "🚀 완전 자동 배포 시작..."

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

# 2. expect를 사용하여 원격 서버 설정
echo "🔧 원격 서버 설정 중..."

expect <<EOF
set timeout 600
spawn ssh ${REMOTE_USER}@${REMOTE_HOST} "cd ~/booking-system && bash -c '
# PostgreSQL 시작
sudo systemctl start postgresql 2>/dev/null || true
sudo systemctl enable postgresql 2>/dev/null || true

# 데이터베이스 존재 확인 및 생성
DB_EXISTS=\$(sudo -u postgres psql -tAc \"SELECT 1 FROM pg_database WHERE datname=''malmoi_system''\" 2>/dev/null || echo \"0\")

if [ \"\$DB_EXISTS\" != \"1\" ]; then
    echo \"📦 데이터베이스 생성 중...\"
    sudo -u postgres psql <<SQL
CREATE DATABASE malmoi_system;
CREATE USER malmoi WITH PASSWORD '\''malmoi2020'\'';
GRANT ALL PRIVILEGES ON DATABASE malmoi_system TO malmoi;
ALTER USER malmoi CREATEDB;
\q
SQL
else
    echo \"✅ 데이터베이스가 이미 존재합니다.\"
fi

# .env 파일 업데이트
if grep -q \"DATABASE_URL=\" .env; then
    sed -i \"s|DATABASE_URL=.*|DATABASE_URL=\\\"postgresql://malmoi:malmoi2020@localhost:5432/malmoi_system?schema=public\\\"|g\" .env
else
    echo \"\" >> .env
    echo \"# Local PostgreSQL Database\" >> .env
    echo \"DATABASE_URL=\\\"postgresql://malmoi:malmoi2020@localhost:5432/malmoi_system?schema=public\\\"\" >> .env
fi

# Node.js 설정
export NVM_DIR=\"\$HOME/.nvm\"
[ -s \"\$NVM_DIR/nvm.sh\" ] && \. \"\$NVM_DIR/nvm.sh\"

# 의존성 업데이트
echo \"📦 의존성 업데이트 중...\"
npm install

# Prisma 클라이언트 재생성
echo \"🔄 Prisma 클라이언트 재생성 중...\"
npx prisma generate

# 마이그레이션 실행
echo \"🗄️  데이터베이스 마이그레이션 실행 중...\"
npx prisma migrate deploy

# 빌드
echo \"🏗️  프로덕션 빌드 중...\"
npm run build

echo \"✅ 배포 완료!\"
'"

expect {
    "password:" {
        send "${SUDO_PASSWORD}\r"
        exp_continue
    }
    "yes/no" {
        send "yes\r"
        exp_continue
    }
    eof
}

wait
EOF

echo "✨ 완전 자동 배포 완료!"




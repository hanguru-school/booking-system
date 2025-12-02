#!/bin/bash
set -euo pipefail

# 원격 서버 정보
REMOTE_USER="malmoi"
REMOTE_HOST="100.80.210.105"
REMOTE_DIR="~/booking-system"
SUDO_PASSWORD="malmoi2020"  # sudo 비밀번호 (실제 환경에서는 환경 변수로 관리 권장)

echo "🚀 자동 설정 시작..."

# expect가 설치되어 있는지 확인
if ! command -v expect &> /dev/null; then
    echo "📦 expect 설치 중..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install expect
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update && sudo apt-get install -y expect
    fi
fi

# expect 스크립트 생성
cat > /tmp/remote-setup.exp <<'EXPSCRIPT'
#!/usr/bin/expect -f
set timeout 300
set remote_user [lindex $argv 0]
set remote_host [lindex $argv 1]
set sudo_password [lindex $argv 2]

spawn ssh ${remote_user}@${remote_host} "cd ~/booking-system && bash -c '
# PostgreSQL 설치 확인
if ! command -v psql &> /dev/null; then
    echo \"📦 PostgreSQL 설치 중...\"
    sudo apt update
    sudo apt install -y postgresql postgresql-contrib
fi

# PostgreSQL 시작
echo \"▶️  PostgreSQL 시작 중...\"
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 데이터베이스 생성
echo \"🗄️  데이터베이스 생성 중...\"
sudo -u postgres psql <<EOF
CREATE DATABASE malmoi_system;
CREATE USER malmoi WITH PASSWORD '\''malmoi2020'\'';
GRANT ALL PRIVILEGES ON DATABASE malmoi_system TO malmoi;
ALTER USER malmoi CREATEDB;
\q
EOF

# .env 파일 업데이트
echo \"⚙️  .env 파일 설정 중...\"
cd ~/booking-system
if grep -q \"DATABASE_URL=\" .env; then
    sed -i \"s|DATABASE_URL=.*|DATABASE_URL=\\\"postgresql://malmoi:malmoi2020@localhost:5432/malmoi_system?schema=public\\\"|g\" .env
else
    echo \"\" >> .env
    echo \"# Local PostgreSQL Database\" >> .env
    echo \"DATABASE_URL=\\\"postgresql://malmoi:malmoi2020@localhost:5432/malmoi_system?schema=public\\\"\" >> .env
fi

# 마이그레이션 실행
echo \"🔄 마이그레이션 실행 중...\"
export NVM_DIR=\"\$HOME/.nvm\" && [ -s \"\$NVM_DIR/nvm.sh\" ] && \. \"\$NVM_DIR/nvm.sh\"
npx prisma migrate deploy

echo \"✅ 설정 완료!\"
'"

expect {
    "password:" {
        send "${sudo_password}\r"
        exp_continue
    }
    "yes/no" {
        send "yes\r"
        exp_continue
    }
    eof
}

wait
EXPSCRIPT

chmod +x /tmp/remote-setup.exp

echo "🔧 원격 서버 설정 실행 중..."
/tmp/remote-setup.exp "$REMOTE_USER" "$REMOTE_HOST" "$SUDO_PASSWORD"

echo "✨ 자동 설정 완료!"




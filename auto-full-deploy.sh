#!/bin/bash
set -euo pipefail

REMOTE_USER="malmoi"
REMOTE_HOST="100.80.210.105"
REMOTE_DIR="~/booking-system"
SUDO_PASSWORD="malmoi2020"

echo "🚀 완전 자동 배포 시작..."

# 1. 코드 및 스크립트 업로드
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

# 2. expect를 사용하여 원격 스크립트 실행
echo "🔧 원격 서버 설정 중..."

expect <<EXPECT_SCRIPT
set timeout 1200
set remote_user "malmoi"
set remote_host "100.80.210.105"
set sudo_password "malmoi2020"

spawn ssh -t \${remote_user}@\${remote_host} "cd ~/booking-system && chmod +x remote-setup.sh && ./remote-setup.sh"

expect {
    "password:" {
        send "\r"
        exp_continue
    }
    "\[sudo\] password" {
        send "\${sudo_password}\r"
        exp_continue
    }
    "Password:" {
        send "\${sudo_password}\r"
        exp_continue
    }
    "password for" {
        send "\${sudo_password}\r"
        exp_continue
    }
    eof
}

wait
EXPECT_SCRIPT

echo "✨ 완전 자동 배포 완료!"

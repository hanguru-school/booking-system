#!/bin/bash
# 서버 부트스트랩 스크립트 (sudo 권한 필요)
# 멱등성 보장: 이미 설정되어 있어도 재실행 가능

set -euo pipefail

echo "=== 서버 부트스트랩 시작 ==="

# 1. 기본 패키지 설치
echo "📦 기본 패키지 설치 중..."
sudo apt update
sudo apt -y upgrade
sudo apt install -y git curl build-essential unzip jq net-tools openssl ufw

# 2. 자동 보안 업데이트
echo "🔒 자동 보안 업데이트 설정 중..."
sudo apt install -y unattended-upgrades
echo "unattended-upgrades unattended-upgrades/enable_auto_updates boolean true" | sudo debconf-set-selections
sudo dpkg-reconfigure -f noninteractive unattended-upgrades

# 3. 타임존 설정
echo "🕐 타임존 설정 중..."
sudo timedatectl set-timezone Asia/Tokyo

# 4. Node & pnpm & pm2
echo "📦 Node/pnpm/PM2 설정 중..."
if command -v corepack &> /dev/null; then
    corepack enable || true
else
    echo "corepack 없음 - Node 설치 필요"
fi

# PM2 전역 설치
if ! command -v pm2 &> /dev/null; then
    npm i -g pm2 || sudo npm i -g pm2 || true
fi

# 5. 비대화식 셸 출력 방지
echo "🔇 비대화식 셸 출력 방지 설정 중..."
if ! grep -q '^\[\[ \$- != \*i\* \]\] && return' ~/.bashrc; then
    sed -i '1i[[ $- != *i* ]] && return' ~/.bashrc
fi

# 6. 디렉터리 생성
echo "📁 디렉터리 생성 중..."
mkdir -p ~/repos/booking-system.git ~/booking-system
sudo mkdir -p /srv/malmoi/uploads /srv/malmoi/backups/{database,files} /srv/malmoi/minio
sudo mkdir -p /etc/malmoi
sudo chmod 750 /etc/malmoi
sudo touch /etc/malmoi/booking.env
sudo chmod 600 /etc/malmoi/booking.env
sudo chown -R malmoi:malmoi /srv/malmoi

echo "✅ 부트스트랩 완료"


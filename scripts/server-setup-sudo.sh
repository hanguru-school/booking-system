#!/bin/bash
# 서버 기본 설정 스크립트 (sudo 권한 필요)
# 멱등성 보장: 이미 설정되어 있어도 재실행 가능

set -euo pipefail

echo "=== 서버 기본 설정 시작 (sudo 권한 필요) ==="

# 1. 패키지 업데이트 및 필수 패키지 설치
echo "📦 패키지 업데이트 및 설치 중..."
sudo apt update
sudo apt -y upgrade
sudo apt install -y git curl build-essential unzip

# 2. 자동 보안 업데이트 설정
echo "🔒 자동 보안 업데이트 설정 중..."
sudo apt install -y unattended-upgrades
echo "unattended-upgrades unattended-upgrades/enable_auto_updates boolean true" | sudo debconf-set-selections
sudo dpkg-reconfigure -f noninteractive unattended-upgrades

# 3. 타임존 설정
echo "🕐 타임존 설정 중..."
sudo timedatectl set-timezone Asia/Tokyo

# 4. sudoers NOPASSWD 설정 (선택사항)
echo "🔐 sudoers NOPASSWD 설정 확인 중..."
if ! sudo grep -q "^malmoi.*NOPASSWD" /etc/sudoers.d/* 2>/dev/null; then
    echo "⚠️  sudoers NOPASSWD가 설정되어 있지 않습니다."
    echo "설정하려면 다음 명령을 실행하세요:"
    echo "  echo 'malmoi ALL=(ALL) NOPASSWD: ALL' | sudo tee /etc/sudoers.d/malmoi-nopasswd"
    echo "  sudo chmod 0440 /etc/sudoers.d/malmoi-nopasswd"
else
    echo "✅ sudoers NOPASSWD 이미 설정됨"
fi

echo ""
echo "=== 서버 기본 설정 완료 ==="
echo "타임존 확인: timedatectl | grep Timezone"
echo "자동 업데이트 확인: sudo systemctl status unattended-upgrades"


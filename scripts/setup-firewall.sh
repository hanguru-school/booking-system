#!/bin/bash
# 방화벽 설정 스크립트 (sudo 권한 필요)
# 멱등성 보장: 이미 설정되어 있어도 재실행 가능

set -euo pipefail

echo "=== 방화벽 설정 ==="

# UFW 활성화
echo "🔥 UFW 설정 중..."
sudo ufw --force reset || true

# OpenSSH 허용
sudo ufw allow OpenSSH

# 내부망에서만 접근 허용 (192.168.1.0/24)
sudo ufw allow from 192.168.1.0/24 to any port 3000 proto tcp comment "Next.js App"
sudo ufw allow from 192.168.1.0/24 to any port 9000 proto tcp comment "MinIO API"
sudo ufw allow from 192.168.1.0/24 to any port 9001 proto tcp comment "MinIO Console"

# Tailscale 네트워크 허용 (100.x.x.x)
sudo ufw allow from 100.0.0.0/8 to any port 3000 proto tcp comment "Tailscale Next.js"
sudo ufw allow from 100.0.0.0/8 to any port 9000 proto tcp comment "Tailscale MinIO API"
sudo ufw allow from 100.0.0.0/8 to any port 9001 proto tcp comment "Tailscale MinIO Console"

# UFW 활성화
sudo ufw --force enable

echo "✅ 방화벽 설정 완료"
sudo ufw status numbered


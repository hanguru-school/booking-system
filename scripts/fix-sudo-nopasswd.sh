#!/bin/bash
# sudo NOPASSWD 설정 스크립트
# 이 스크립트는 서버에 직접 접속해서 실행해야 합니다 (sudo 권한 필요)

set -euo pipefail

echo "=== sudo NOPASSWD 설정 ==="

# 현재 사용자 확인
CURRENT_USER=$(whoami)
echo "현재 사용자: $CURRENT_USER"

# sudoers.d 디렉터리 확인
if [ ! -d /etc/sudoers.d ]; then
    echo "sudoers.d 디렉터리 생성 중..."
    sudo mkdir -p /etc/sudoers.d
fi

# NOPASSWD 설정 파일 생성
SUDOERS_FILE="/etc/sudoers.d/${CURRENT_USER}-nopasswd"
echo "설정 파일: $SUDOERS_FILE"

# 이미 설정되어 있는지 확인
if sudo grep -q "^${CURRENT_USER}.*NOPASSWD" "$SUDOERS_FILE" 2>/dev/null; then
    echo "✅ 이미 NOPASSWD 설정됨"
    sudo cat "$SUDOERS_FILE"
else
    echo "NOPASSWD 설정 추가 중..."
    echo "${CURRENT_USER} ALL=(ALL) NOPASSWD: ALL" | sudo tee "$SUDOERS_FILE" > /dev/null
    sudo chmod 0440 "$SUDOERS_FILE"
    echo "✅ NOPASSWD 설정 완료"
fi

# 설정 확인
echo ""
echo "=== 설정 확인 ==="
sudo visudo -c
sudo cat "$SUDOERS_FILE"

echo ""
echo "=== 테스트 ==="
if sudo -n echo "NOPASSWD 테스트 성공" 2>/dev/null; then
    echo "✅ NOPASSWD 정상 작동"
else
    echo "❌ NOPASSWD 작동 안 함 - 설정을 확인하세요"
fi


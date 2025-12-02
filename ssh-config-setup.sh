#!/bin/bash

# SSH 설정 파일 개선 스크립트
# SSH 연결 타임아웃 문제 해결

SSH_CONFIG="$HOME/.ssh/config"
HOST_NAME="hanguru-system-server"

echo "🔧 SSH 설정 개선 중..."

# .ssh 디렉토리 확인
if [ ! -d "$HOME/.ssh" ]; then
  mkdir -p "$HOME/.ssh"
  chmod 700 "$HOME/.ssh"
fi

# 기존 설정 확인
if grep -q "Host $HOST_NAME" "$SSH_CONFIG" 2>/dev/null; then
  echo "⚠️  이미 $HOST_NAME 설정이 있습니다."
  echo "   다음 설정을 추가/수정하세요:"
  echo ""
  echo "   Host $HOST_NAME"
  echo "     HostName $HOST_NAME"
  echo "     User malmoi"
  echo "     ConnectTimeout 15"
  echo "     ServerAliveInterval 5"
  echo "     ServerAliveCountMax 3"
  echo "     TCPKeepAlive yes"
  echo ""
else
  echo "📝 SSH 설정 추가 중..."
  cat >> "$SSH_CONFIG" << EOF

# Hanguru System Server
Host $HOST_NAME
  HostName $HOST_NAME
  User malmoi
  ConnectTimeout 15
  ServerAliveInterval 5
  ServerAliveCountMax 3
  TCPKeepAlive yes
  StrictHostKeyChecking no
EOF
  chmod 600 "$SSH_CONFIG"
  echo "✅ SSH 설정 추가 완료!"
fi

echo ""
echo "💡 이제 다음 명령으로 테스트하세요:"
echo "   ssh $HOST_NAME 'echo 연결 성공'"



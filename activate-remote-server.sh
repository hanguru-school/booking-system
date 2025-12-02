#!/bin/bash

# 원격 서버(100.80.210.105)에서 서비스 활성화 스크립트

REMOTE_IP="100.80.210.105"
REMOTE_PORT="3000"
REMOTE_USER="${REMOTE_USER:-admin}"

echo "🌐 원격 서버 $REMOTE_IP:$REMOTE_PORT 활성화 중..."

# 1. 원격 서버 연결 테스트
echo "📡 원격 서버 연결 테스트..."
if ping -c 2 $REMOTE_IP > /dev/null 2>&1; then
    echo "✅ 원격 서버 연결 가능"
else
    echo "❌ 원격 서버 연결 불가"
    exit 1
fi

# 2. 원격 서버에서 서비스 상태 확인
echo "🔍 원격 서버에서 서비스 상태 확인..."
REMOTE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 3 http://$REMOTE_IP:$REMOTE_PORT 2>/dev/null || echo "000")

if [ "$REMOTE_STATUS" = "200" ]; then
    echo "✅ 원격 서버에서 이미 서비스가 실행 중입니다!"
    echo "   접속: http://$REMOTE_IP:$REMOTE_PORT"
    exit 0
elif [ "$REMOTE_STATUS" = "000" ]; then
    echo "⚠️  원격 서버에서 서비스가 실행되지 않습니다."
    echo ""
    echo "원격 서버에서 다음 명령을 실행하세요:"
    echo ""
    echo "  ssh $REMOTE_USER@$REMOTE_IP"
    echo "  cd /path/to/booking-system"
    echo "  ./start-classroom.sh"
    echo ""
    echo "또는 원격 서버에 직접 접속하여 서비스를 시작하세요."
else
    echo "⚠️  원격 서버 응답: HTTP $REMOTE_STATUS"
fi



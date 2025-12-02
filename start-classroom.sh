#!/bin/bash

# 교실 서버 (프로덕션) 시작 스크립트

echo "🏫 교실 서버 시작 중..."

# 프로젝트 디렉토리로 이동
cd /Users/jinasmacbook/booking-system

# 기존 프로세스 종료
echo "📋 기존 프로세스 정리 중..."
pkill -f "npm run start:nas" 2>/dev/null
pkill -f "next start" 2>/dev/null
sleep 2

# 빌드 확인
if [ ! -d ".next" ]; then
    echo "🔨 빌드가 없습니다. 빌드 중..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ 빌드 실패"
        exit 1
    fi
fi

# 프로덕션 서버 시작
echo "🚀 프로덕션 서버 시작 중..."
NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 nohup npm run start:nas > production.log 2>&1 &
SERVER_PID=$!
echo "✅ 프로덕션 서버 시작됨 (PID: $SERVER_PID)"

# 서버 시작 대기
echo "⏳ 서버 시작 대기 중..."
sleep 5

# 서버 상태 확인
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo ""
    echo "🎉 교실 서버가 성공적으로 시작되었습니다!"
    echo ""
    echo "📱 접속 정보:"
    echo "   - 로컬: http://localhost:3000"
    
    # 모든 네트워크 인터페이스 IP 확인
    EN0_IP=$(ipconfig getifaddr en0 2>/dev/null || echo "")
    UTUN4_IP=$(ifconfig utun4 2>/dev/null | grep "inet " | awk '{print $2}' || echo "")
    
    if [ -n "$EN0_IP" ]; then
        echo "   - 로컬 네트워크: http://$EN0_IP:3000"
    fi
    
    if [ -n "$UTUN4_IP" ]; then
        echo "   - VPN/터널: http://$UTUN4_IP:3000"
    fi
    
    # 100.80.210.105 확인
    if route get 100.80.210.105 2>/dev/null | grep -q "interface: utun4"; then
        echo "   - 교실 서버 IP: http://100.80.210.105:3000 ✅"
    fi
    
    echo ""
    echo "📊 모니터링:"
    echo "   - 서버 로그: tail -f production.log"
    echo ""
    echo "🛑 종료하려면: ./stop-classroom.sh"
    echo ""
else
    echo "⚠️  서버 시작 확인 중 문제가 발생했습니다."
    echo "   로그를 확인하세요: tail -f production.log"
fi

# PID 저장
echo $SERVER_PID > .classroom.pid
echo "✅ 완료! 교실 서버가 백그라운드에서 실행 중입니다."


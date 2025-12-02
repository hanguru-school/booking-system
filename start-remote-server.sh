#!/bin/bash

# 원격 서버(100.80.210.105)에서 교실 서버 시작 스크립트

REMOTE_IP="100.80.210.105"
REMOTE_HOST="hanguru-system-server"

echo "🌐 원격 서버 $REMOTE_HOST ($REMOTE_IP)에서 교실 서버 시작 중..."

# 가능한 사용자명 목록
USERS=("admin" "ubuntu" "root" "hanguru" "malmoi")

# 사용자명 찾기
FOUND_USER=""
for USER in "${USERS[@]}"; do
    echo "🔍 사용자 '$USER'로 연결 시도 중..."
    if ssh -o ConnectTimeout=3 -o StrictHostKeyChecking=no $USER@$REMOTE_HOST "echo '연결 성공'" 2>/dev/null; then
        FOUND_USER=$USER
        echo "✅ 사용자 '$USER'로 연결 성공!"
        break
    fi
done

if [ -z "$FOUND_USER" ]; then
    echo "❌ 원격 서버에 연결할 수 없습니다."
    echo ""
    echo "다음 방법을 시도해보세요:"
    echo "1. Tailscale 관리 패널에서 SSH 키 설정 확인"
    echo "2. 원격 서버에 직접 접속하여 사용자명 확인"
    echo "3. 수동으로 SSH 접속:"
    echo "   ssh [사용자명]@$REMOTE_HOST"
    echo ""
    exit 1
fi

echo ""
echo "🚀 원격 서버에서 교실 서버 시작 중..."

# 원격 서버에서 서비스 시작
ssh $FOUND_USER@$REMOTE_HOST << 'ENDSSH'
    # 프로젝트 디렉토리 찾기
    PROJECT_DIRS=(
        "/home/admin/malmoi-system"
        "/home/ubuntu/malmoi-system"
        "/root/malmoi-system"
        "/opt/malmoi-system"
        "$HOME/malmoi-system"
        "$HOME/booking-system"
    )
    
    FOUND_DIR=""
    for DIR in "${PROJECT_DIRS[@]}"; do
        if [ -d "$DIR" ]; then
            FOUND_DIR="$DIR"
            echo "✅ 프로젝트 디렉토리 발견: $DIR"
            break
        fi
    done
    
    if [ -z "$FOUND_DIR" ]; then
        echo "❌ 프로젝트 디렉토리를 찾을 수 없습니다."
        echo "다음 디렉토리를 확인했습니다:"
        for DIR in "${PROJECT_DIRS[@]}"; do
            echo "  - $DIR"
        done
        exit 1
    fi
    
    cd "$FOUND_DIR"
    echo "📂 작업 디렉토리: $(pwd)"
    
    # 기존 프로세스 종료
    echo "🛑 기존 프로세스 종료 중..."
    pkill -f "npm run start" 2>/dev/null
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
    NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 nohup npm run start > production.log 2>&1 &
    SERVER_PID=$!
    echo "✅ 프로덕션 서버 시작됨 (PID: $SERVER_PID)"
    
    # 서버 시작 대기
    sleep 5
    
    # 서버 상태 확인
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo ""
        echo "🎉 교실 서버가 성공적으로 시작되었습니다!"
        echo "   접속: http://100.80.210.105:3000"
        echo "   로그: tail -f $FOUND_DIR/production.log"
    else
        echo "⚠️  서버 시작 확인 중 문제가 발생했습니다."
        echo "   로그를 확인하세요: tail -f $FOUND_DIR/production.log"
    fi
ENDSSH

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 원격 서버에서 교실 서버 시작 완료!"
    echo "   접속: http://$REMOTE_IP:3000"
else
    echo ""
    echo "❌ 원격 서버에서 서버 시작 실패"
fi



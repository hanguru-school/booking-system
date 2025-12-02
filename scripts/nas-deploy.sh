#!/bin/bash

# ========================================
# MalMoi 한국어 교실 - DXP2800 NAS 서버 배포 스크립트
# ========================================

set -e  # 오류 발생 시 스크립트 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 함수: 로그 출력
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# 메인 스크립트
main() {
    log "🚀 DXP2800 NAS 서버 배포 시작..."
    
    # ========================================
    # 환경 변수 설정
    # ========================================
    if [ -f "env.production" ]; then
        log "📋 프로덕션 환경 변수 파일 로드 중..."
        export $(cat env.production | grep -v '^#' | xargs)
    elif [ -f ".env" ]; then
        log "📋 환경 변수 파일 로드 중..."
        export $(cat .env | grep -v '^#' | xargs)
    else
        error "❌ 환경 변수 파일을 찾을 수 없습니다."
        echo "env.production 또는 .env 파일을 생성하고 환경 변수를 설정해주세요."
        exit 1
    fi
    
    # ========================================
    # Node.js 버전 확인
    # ========================================
    log "🔍 Node.js 버전 확인 중..."
    NODE_VERSION=$(node --version)
    log "Node.js 버전: $NODE_VERSION"
    
    # ========================================
    # 의존성 설치
    # ========================================
    log "📦 의존성 설치 중..."
    npm ci --production=false
    
    # ========================================
    # Prisma 데이터베이스 마이그레이션
    # ========================================
    log "🗄️ 데이터베이스 마이그레이션 중..."
    npx prisma generate
    npx prisma migrate deploy
    
    # ========================================
    # 애플리케이션 빌드
    # ========================================
    log "🔨 애플리케이션 빌드 중..."
    npm run build
    
    # ========================================
    # 포트 및 호스트 설정
    # ========================================
    PORT=${PORT:-3000}
    HOSTNAME=${HOSTNAME:-0.0.0.0}
    
    log "🌐 서버 시작 중... (포트: $PORT, 호스트: $HOSTNAME)"
    
    # ========================================
    # systemd 서비스 재시작
    # ========================================
    if systemctl is-active --quiet malmoi; then
        log "🔄 systemd 서비스 재시작 중..."
        sudo systemctl restart malmoi
    else
        log "🔄 systemd 서비스 시작 중..."
        sudo systemctl start malmoi
    fi
    
    # ========================================
    # 서비스 상태 확인
    # ========================================
    sleep 5
    if systemctl is-active --quiet malmoi; then
        log "✅ systemd 서비스가 정상적으로 실행 중입니다."
    else
        error "❌ systemd 서비스 시작에 실패했습니다."
        sudo systemctl status malmoi
        exit 1
    fi
    
    # ========================================
    # 헬스체크 확인
    # ========================================
    log "🏥 헬스체크 확인 중..."
    sleep 10
    
    for i in {1..30}; do
        if curl -s http://localhost:$PORT/api/health > /dev/null; then
            log "✅ 애플리케이션이 정상적으로 실행 중입니다."
            break
        else
            warning "헬스체크 대기 중... ($i/30)"
            sleep 2
        fi
        
        if [ $i -eq 30 ]; then
            error "❌ 헬스체크에 실패했습니다."
            exit 1
        fi
    done
    
    log "🎉 DXP2800 NAS 서버 배포 완료!"
    log "📊 서비스 상태: $(systemctl is-active malmoi)"
    log "🌐 접속 URL: http://$(hostname -I | awk '{print $1}'):$PORT"
    log "🏥 헬스체크: http://localhost:$PORT/api/health"
}

# 스크립트 실행
main "$@" 
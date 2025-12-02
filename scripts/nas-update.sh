#!/bin/bash

# ========================================
# MalMoi 한국어 교실 - DXP2800 NAS 서버 업데이트 스크립트
# ========================================

set -e

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
    log "🚀 DXP2800 NAS 서버 업데이트 시작..."
    
    # ========================================
    # 프로젝트 디렉토리로 이동
    # ========================================
    cd /home/admin/malmoi-system
    
    # ========================================
    # 현재 상태 백업
    # ========================================
    log "💾 현재 상태 백업 중..."
    if [ -d ".git" ]; then
        CURRENT_COMMIT=$(git rev-parse HEAD)
        log "현재 커밋: $CURRENT_COMMIT"
    fi
    
    # ========================================
    # Git 변경사항 확인
    # ========================================
    log "📥 최신 코드 가져오기..."
    git fetch origin
    
    # 변경사항 확인
    LOCAL_COMMIT=$(git rev-parse HEAD)
    REMOTE_COMMIT=$(git rev-parse origin/main)
    
    if [ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ]; then
        log "✅ 이미 최신 버전입니다."
        exit 0
    fi
    
    log "🔄 업데이트가 필요합니다. 업데이트를 진행합니다..."
    
    # ========================================
    # 서비스 중지
    # ========================================
    log "⏹️ 서비스 중지 중..."
    sudo systemctl stop malmoi
    
    # ========================================
    # 코드 업데이트
    # ========================================
    log "📥 코드 업데이트 중..."
    git pull origin main
    
    # ========================================
    # 의존성 업데이트
    # ========================================
    log "📦 의존성 업데이트 중..."
    npm ci --production=false
    
    # ========================================
    # Prisma 마이그레이션
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
    # 서비스 재시작
    # ========================================
    log "🚀 서비스 재시작 중..."
    sudo systemctl start malmoi
    
    # ========================================
    # 상태 확인
    # ========================================
    sleep 10
    if systemctl is-active --quiet malmoi; then
        log "✅ 서비스가 정상적으로 재시작되었습니다."
    else
        error "❌ 서비스 재시작에 실패했습니다."
        sudo systemctl status malmoi
        exit 1
    fi
    
    # ========================================
    # 헬스체크 확인
    # ========================================
    log "🏥 헬스체크 확인 중..."
    for i in {1..30}; do
        if curl -s http://localhost:3000/api/health > /dev/null; then
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
    
    # ========================================
    # 업데이트 완료 정보
    # ========================================
    NEW_COMMIT=$(git rev-parse HEAD)
    log "🎉 업데이트 완료!"
    log "이전 커밋: $LOCAL_COMMIT"
    log "새 커밋: $NEW_COMMIT"
    log "서비스 상태: $(systemctl is-active malmoi)"
    log "접속 URL: http://$(hostname -I | awk '{print $1}'):3000"
}

# 스크립트 실행
main "$@" 
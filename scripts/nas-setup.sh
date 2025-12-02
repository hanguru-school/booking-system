#!/bin/bash

# ========================================
# MalMoi 한국어 교실 - DXP2800 NAS 서버 초기 설정
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
    log "🚀 DXP2800 NAS 서버 초기 설정 시작..."
    
    # ========================================
    # 1. 시스템 업데이트
    # ========================================
    log "📦 시스템 업데이트 중..."
    sudo apt update && sudo apt upgrade -y
    
    # ========================================
    # 2. 필수 패키지 설치
    # ========================================
    log "📦 필수 패키지 설치 중..."
    sudo apt install -y git curl wget unzip
    
    # ========================================
    # 3. Node.js 18+ 설치
    # ========================================
    log "📦 Node.js 18+ 설치 중..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    # Node.js 버전 확인
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    log "✅ Node.js 버전: $NODE_VERSION"
    log "✅ npm 버전: $NPM_VERSION"
    
    # ========================================
    # 4. PostgreSQL 클라이언트 설치
    # ========================================
    log "📦 PostgreSQL 클라이언트 설치 중..."
    sudo apt install -y postgresql-client
    
    # ========================================
    # 5. 관리자 계정 생성 (필요시)
    # ========================================
    if ! id "admin" &>/dev/null; then
        log "👤 관리자 계정 생성 중..."
        sudo useradd -m -s /bin/bash admin
        sudo usermod -aG sudo admin
        echo "admin:admin123" | sudo chpasswd
        log "✅ 관리자 계정 생성 완료 (사용자명: admin, 비밀번호: admin123)"
    else
        log "✅ 관리자 계정이 이미 존재합니다."
    fi
    
    # ========================================
    # 6. 프로젝트 디렉토리 생성
    # ========================================
    log "📁 프로젝트 디렉토리 생성 중..."
    sudo mkdir -p /home/admin/malmoi-system
    sudo chown admin:admin /home/admin/malmoi-system
    
    # ========================================
    # 7. 방화벽 설정
    # ========================================
    log "🔥 방화벽 설정 중..."
    sudo ufw allow 22
    sudo ufw allow 3000
    sudo ufw allow 80
    sudo ufw allow 443
    sudo ufw --force enable
    
    # ========================================
    # 8. 시간대 설정
    # ========================================
    log "⏰ 시간대 설정 중..."
    sudo timedatectl set-timezone Asia/Tokyo
    
    # ========================================
    # 9. systemd 서비스 파일 복사
    # ========================================
    log "⚙️ systemd 서비스 설정 중..."
    if [ -f "malmoi.service" ]; then
        sudo cp malmoi.service /etc/systemd/system/
        sudo systemctl daemon-reload
        sudo systemctl enable malmoi
        log "✅ systemd 서비스 설정 완료"
    else
        warning "malmoi.service 파일을 찾을 수 없습니다."
    fi
    
    # ========================================
    # 10. 프로젝트 클론 (GitHub에서)
    # ========================================
    log "📥 프로젝트 클론 중..."
    cd /home/admin
    if [ ! -d "malmoi-system" ] || [ -z "$(ls -A malmoi-system)" ]; then
        sudo -u admin git clone https://github.com/hanguru-school/malmoi-system.git
        sudo chown -R admin:admin malmoi-system
    else
        log "✅ 프로젝트 디렉토리가 이미 존재합니다."
    fi
    
    # ========================================
    # 11. 환경 변수 파일 설정
    # ========================================
    log "🔧 환경 변수 파일 설정 중..."
    cd /home/admin/malmoi-system
    
    if [ -f "env.production" ]; then
        sudo -u admin cp env.production .env
        log "✅ 환경 변수 파일 복사 완료"
        warning "⚠️  .env 파일을 편집하여 실제 값으로 설정해주세요."
        warning "⚠️  특히 AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY를 설정해야 합니다."
    else
        warning "env.production 파일을 찾을 수 없습니다."
    fi
    
    # ========================================
    # 12. 의존성 설치 및 빌드
    # ========================================
    log "📦 의존성 설치 중..."
    sudo -u admin npm ci --production=false
    
    log "🗄️ Prisma 클라이언트 생성 중..."
    sudo -u admin npx prisma generate
    
    log "🔨 애플리케이션 빌드 중..."
    sudo -u admin npm run build
    
    # ========================================
    # 13. 서비스 시작
    # ========================================
    log "🚀 서비스 시작 중..."
    sudo systemctl start malmoi
    
    # ========================================
    # 14. 상태 확인
    # ========================================
    sleep 5
    if systemctl is-active --quiet malmoi; then
        log "✅ systemd 서비스가 정상적으로 실행 중입니다."
    else
        error "❌ systemd 서비스 시작에 실패했습니다."
        sudo systemctl status malmoi
    fi
    
    # ========================================
    # 15. 네트워크 정보 출력
    # ========================================
    log "🌐 네트워크 정보:"
    echo "IP 주소: $(hostname -I | awk '{print $1}')"
    echo "호스트명: $(hostname)"
    echo "접속 URL: http://$(hostname -I | awk '{print $1}'):3000"
    echo "헬스체크: http://$(hostname -I | awk '{print $1}'):3000/api/health"
    
    # ========================================
    # 16. 유용한 명령어 안내
    # ========================================
    log "📋 유용한 명령어:"
    echo "서비스 상태 확인: sudo systemctl status malmoi"
    echo "서비스 재시작: sudo systemctl restart malmoi"
    echo "로그 확인: sudo journalctl -u malmoi -f"
    echo "업데이트: cd /home/admin/malmoi-system && git pull && npm run build && sudo systemctl restart malmoi"
    
    log "🎉 DXP2800 NAS 서버 초기 설정 완료!"
}

# 스크립트 실행
main "$@" 
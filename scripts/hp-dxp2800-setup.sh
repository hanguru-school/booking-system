#!/bin/bash

# ========================================
# HP DXP2800 서버 MalMoi 시스템 완전 설치
# Ubuntu Server 22.04 LTS 기반 로컬 서버 구축
# ========================================

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

confirm() {
    read -p "$1 (y/N): " -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]]
}

# 랜덤 문자열 생성 함수
generate_random_string() {
    openssl rand -hex 32
}

main() {
    log "🚀 HP DXP2800 MalMoi 시스템 설치 시작..."
    
    # 현재 사용자가 sudo 권한이 있는지 확인
    if ! sudo -n true 2>/dev/null; then
        error "sudo 권한이 필요합니다. 관리자 권한으로 실행해주세요."
        exit 1
    fi
    
    # ========================================
    # 1. 시스템 기본 설정
    # ========================================
    log "📦 1. 시스템 업데이트 및 기본 패키지 설치..."
    
    # 시스템 업데이트
    sudo apt update && sudo apt upgrade -y
    
    # 기본 필수 패키지 설치
    sudo apt install -y \
        curl \
        wget \
        git \
        unzip \
        build-essential \
        software-properties-common \
        apt-transport-https \
        ca-certificates \
        gnupg \
        lsb-release \
        htop \
        nano \
        vim \
        ufw \
        fail2ban
    
    log "✅ 시스템 업데이트 완료"
    
    # ========================================
    # 2. Node.js LTS 설치
    # ========================================
    log "📦 2. Node.js LTS 설치..."
    
    # Node.js 20 LTS 설치
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    # 버전 확인
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    log "Node.js 버전: $NODE_VERSION"
    log "npm 버전: $NPM_VERSION"
    
    log "✅ Node.js 설치 완료"
    
    # ========================================
    # 3. PM2 설치
    # ========================================
    log "📦 3. PM2 프로세스 매니저 설치..."
    
    sudo npm install -g pm2
    
    # PM2 startup 설정
    sudo pm2 startup systemd -u $USER --hp /home/$USER
    
    log "✅ PM2 설치 완료"
    
    # ========================================
    # 4. PostgreSQL 설치 및 설정
    # ========================================
    log "🗄️ 4. PostgreSQL 설치 및 설정..."
    
    # PostgreSQL 15 설치
    sudo apt install -y postgresql postgresql-contrib
    
    # PostgreSQL 서비스 시작 및 활성화
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    
    # 비밀번호 생성
    POSTGRES_PASSWORD=$(generate_random_string)
    log "생성된 PostgreSQL 비밀번호: $POSTGRES_PASSWORD"
    
    # malmoi_admin 사용자 및 malmoi_system 데이터베이스 생성
    sudo -u postgres psql << EOF
CREATE USER malmoi_admin WITH PASSWORD '$POSTGRES_PASSWORD';
CREATE DATABASE malmoi_system OWNER malmoi_admin;
GRANT ALL PRIVILEGES ON DATABASE malmoi_system TO malmoi_admin;
ALTER USER malmoi_admin CREATEDB;
EOF
    
    # PostgreSQL 연결 테스트
    if PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -U malmoi_admin -d malmoi_system -c "SELECT version();" > /dev/null 2>&1; then
        log "✅ PostgreSQL 설정 완료"
    else
        error "PostgreSQL 연결 테스트 실패"
        exit 1
    fi
    
    # ========================================
    # 5. 프로젝트 클론 및 설정
    # ========================================
    log "📥 5. MalMoi 프로젝트 클론..."
    
    # 프로젝트 디렉토리로 이동
    cd /home/$USER
    
    # 기존 프로젝트 디렉토리가 있으면 백업
    if [ -d "malmoi-system" ]; then
        sudo mv malmoi-system malmoi-system.backup.$(date +%Y%m%d_%H%M%S)
        warning "기존 malmoi-system 디렉토리를 백업했습니다."
    fi
    
    # 프로젝트 클론
    git clone https://github.com/hanguru-school/malmoi-system.git
    cd malmoi-system
    
    # 현재 사용자에게 소유권 부여
    sudo chown -R $USER:$USER /home/$USER/malmoi-system
    
    log "✅ 프로젝트 클론 완료"
    
    # ========================================
    # 6. 환경 변수 설정
    # ========================================
    log "⚙️ 6. 환경 변수 설정..."
    
    # 서버 IP 확인
    SERVER_IP=$(hostname -I | awk '{print $1}')
    log "서버 IP: $SERVER_IP"
    
    # 랜덤 시크릿 생성
    NEXTAUTH_SECRET=$(generate_random_string)
    JWT_SECRET=$(generate_random_string)
    
    # .env 파일 생성
    cat > .env << EOF
# ========================================
# MalMoi 시스템 - 로컬 서버 환경 변수
# HP DXP2800 서버용 설정
# ========================================

# 환경 설정
NODE_ENV=production
NEXT_PUBLIC_ENVIRONMENT=production

# 데이터베이스 설정
DATABASE_URL=postgresql://malmoi_admin:$POSTGRES_PASSWORD@localhost:5432/malmoi_system?sslmode=disable

# 서버 설정
NEXTAUTH_URL=http://$SERVER_IP:3000
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
JWT_SECRET=$JWT_SECRET

# 애플리케이션 설정
NEXT_PUBLIC_APP_URL=http://$SERVER_IP:3000
API_BASE_URL=http://$SERVER_IP:3000/api

# 로컬 인증 설정 (AWS Cognito 대신)
AUTH_TYPE=local
SESSION_SECRET=$JWT_SECRET

# 파일 업로드 설정 (로컬 저장)
UPLOAD_DIR=/home/$USER/malmoi-system/uploads
MAX_FILE_SIZE=10485760

# 기능 플래그
ENABLE_ANALYTICS=true
ENABLE_NOTIFICATIONS=true
ENABLE_BACKUP=true
ENABLE_CLOUD_SERVICES=false

# 로그 설정
LOG_LEVEL=info
LOG_DIR=/home/$USER/malmoi-system/logs

# 메일 설정 (선택사항)
# SMTP_HOST=localhost
# SMTP_PORT=587
# SMTP_USER=
# SMTP_PASS=

# LINE 설정 (선택사항)
# LINE_CHANNEL_ID=
# LINE_CHANNEL_SECRET=
# LINE_CHANNEL_ACCESS_TOKEN=

# 백업 설정
BACKUP_ENABLED=true
BACKUP_DIR=/home/$USER/malmoi-system/backups
BACKUP_RETENTION_DAYS=30
EOF
    
    log "✅ 환경 변수 설정 완료"
    log "DATABASE_URL: postgresql://malmoi_admin:$POSTGRES_PASSWORD@localhost:5432/malmoi_system?sslmode=disable"
    log "NEXTAUTH_URL: http://$SERVER_IP:3000"
    
    # ========================================
    # 7. 의존성 설치 및 빌드
    # ========================================
    log "📦 7. 의존성 설치 및 애플리케이션 빌드..."
    
    # 필요한 디렉토리 생성
    mkdir -p uploads logs backups
    
    # npm 의존성 설치
    npm install
    
    # Prisma 클라이언트 생성
    npx prisma generate
    
    # 데이터베이스 마이그레이션
    npx prisma migrate deploy
    
    # 애플리케이션 빌드
    npm run build
    
    log "✅ 빌드 완료"
    
    # ========================================
    # 8. PM2로 애플리케이션 실행
    # ========================================
    log "🚀 8. PM2로 애플리케이션 실행..."
    
    # PM2로 애플리케이션 시작
    pm2 start npm --name "malmoi-system" -- run start
    
    # PM2 설정 저장
    pm2 save
    
    # PM2 상태 확인
    pm2 list
    
    log "✅ PM2 애플리케이션 실행 완료"
    
    # ========================================
    # 9. 방화벽 설정
    # ========================================
    log "🔥 9. 방화벽 설정..."
    
    # UFW 방화벽 설정
    sudo ufw --force enable
    sudo ufw allow ssh
    sudo ufw allow 3000/tcp
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    
    # 방화벽 상태 확인
    sudo ufw status
    
    log "✅ 방화벽 설정 완료"
    
    # ========================================
    # 10. 서비스 상태 확인
    # ========================================
    log "🔍 10. 서비스 상태 확인..."
    
    # PostgreSQL 상태
    if systemctl is-active --quiet postgresql; then
        log "✅ PostgreSQL 서비스 실행 중"
    else
        error "❌ PostgreSQL 서비스 실행 실패"
    fi
    
    # PM2 상태
    if pm2 list | grep -q "malmoi-system"; then
        log "✅ MalMoi 애플리케이션 실행 중"
    else
        error "❌ MalMoi 애플리케이션 실행 실패"
    fi
    
    # 애플리케이션 헬스체크 (30초 대기 후)
    log "애플리케이션 시작 대기 중..."
    sleep 30
    
    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        log "✅ 애플리케이션 헬스체크 성공"
    else
        warning "⚠️ 애플리케이션 헬스체크 실패 (아직 시작 중일 수 있음)"
    fi
    
    # ========================================
    # 11. 시스템 정보 출력
    # ========================================
    log "📋 11. 설치 완료 정보"
    
    echo
    echo "========================================="
    echo "🎉 MalMoi 시스템 설치 완료!"
    echo "========================================="
    echo
    echo "📊 서버 정보:"
    echo "  - 서버 IP: $SERVER_IP"
    echo "  - 애플리케이션 URL: http://$SERVER_IP:3000"
    echo "  - 프로젝트 경로: /home/$USER/malmoi-system"
    echo
    echo "🗄️ 데이터베이스 정보:"
    echo "  - 호스트: localhost"
    echo "  - 포트: 5432"
    echo "  - 데이터베이스: malmoi_system"
    echo "  - 사용자: malmoi_admin"
    echo "  - 비밀번호: $POSTGRES_PASSWORD"
    echo
    echo "🔧 PM2 관리 명령어:"
    echo "  - 상태 확인: pm2 list"
    echo "  - 로그 확인: pm2 logs malmoi-system"
    echo "  - 재시작: pm2 restart malmoi-system"
    echo "  - 중지: pm2 stop malmoi-system"
    echo "  - 삭제: pm2 delete malmoi-system"
    echo
    echo "🔥 방화벽 상태:"
    echo "  - SSH (22): 허용"
    echo "  - HTTP (80): 허용"
    echo "  - HTTPS (443): 허용"
    echo "  - MalMoi (3000): 허용"
    echo
    echo "🌐 접속 방법:"
    echo "  1. 로컬: http://localhost:3000"
    echo "  2. 네트워크: http://$SERVER_IP:3000"
    echo "  3. 헬스체크: http://$SERVER_IP:3000/api/health"
    echo
    echo "📝 다음 단계:"
    echo "  1. 브라우저에서 http://$SERVER_IP:3000 접속 테스트"
    echo "  2. 관리자 계정 생성 및 로그인"
    echo "  3. app.hanguru.school 도메인을 $SERVER_IP로 연결"
    echo "  4. 필요시 SSL 인증서 설정"
    echo
    echo "🔧 설정 파일 위치:"
    echo "  - 환경 변수: /home/$USER/malmoi-system/.env"
    echo "  - 로그: /home/$USER/malmoi-system/logs/"
    echo "  - 업로드: /home/$USER/malmoi-system/uploads/"
    echo "  - 백업: /home/$USER/malmoi-system/backups/"
    echo
    echo "========================================="
    
    # 설치 정보를 파일로 저장
    cat > /home/$USER/malmoi-installation-info.txt << EOF
MalMoi 시스템 설치 정보
설치 일시: $(date)
서버 IP: $SERVER_IP
애플리케이션 URL: http://$SERVER_IP:3000
데이터베이스 비밀번호: $POSTGRES_PASSWORD
NEXTAUTH_SECRET: $NEXTAUTH_SECRET
JWT_SECRET: $JWT_SECRET
프로젝트 경로: /home/$USER/malmoi-system
EOF
    
    log "📄 설치 정보가 /home/$USER/malmoi-installation-info.txt에 저장되었습니다."
    
    # ========================================
    # 12. 도메인 연결 가이드
    # ========================================
    echo
    log "🌐 도메인 연결 가이드"
    echo
    echo "app.hanguru.school 도메인을 이 서버로 연결하려면:"
    echo
    echo "1. 도메인 관리 페이지에 접속"
    echo "2. DNS 설정에서 A 레코드 수정:"
    echo "   - Type: A"
    echo "   - Name: app (또는 @)"
    echo "   - Value: $SERVER_IP"
    echo "   - TTL: 300 (5분)"
    echo
    echo "3. DNS 전파 후 .env 파일의 NEXTAUTH_URL 수정:"
    echo "   NEXTAUTH_URL=https://app.hanguru.school"
    echo
    echo "4. PM2 재시작:"
    echo "   pm2 restart malmoi-system"
    echo
    echo "5. SSL 인증서 설치 (선택사항):"
    echo "   sudo apt install certbot"
    echo "   sudo certbot certonly --standalone -d app.hanguru.school"
    echo
    
    warning "⚠️ 중요: 위의 정보를 안전한 곳에 저장해주세요!"
    warning "⚠️ 특히 데이터베이스 비밀번호와 시크릿 키를 잘 보관하세요!"
    
    log "🎉 HP DXP2800 MalMoi 시스템 설치가 완료되었습니다!"
    log "브라우저에서 http://$SERVER_IP:3000 에 접속하여 확인해보세요."
}

# 스크립트 실행
main "$@"
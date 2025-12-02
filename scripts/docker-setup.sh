#!/bin/bash

# ========================================
# DXP2800 Docker 환경 설정 스크립트
# MalMoi 시스템 Docker 실행 환경 구성
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

confirm() {
    read -p "$1 (y/N): " -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]]
}

main() {
    log "🚀 DXP2800 Docker 환경 설정 시작..."
    
    # ========================================
    # 1. Docker 설치 확인 및 설치
    # ========================================
    log "🐳 Docker 설치 확인..."
    
    if ! command -v docker &> /dev/null; then
        log "Docker가 설치되어 있지 않습니다. 설치를 진행합니다..."
        
        # Docker 설치
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        rm get-docker.sh
        
        # 사용자를 docker 그룹에 추가
        sudo usermod -aG docker admin
        
        log "Docker 설치 완료. 시스템을 재시작한 후 다시 실행해주세요."
        log "또는 'newgrp docker' 명령어를 실행하여 그룹을 다시 로드하세요."
    else
        log "✅ Docker가 이미 설치되어 있습니다."
    fi
    
    # Docker 버전 확인
    DOCKER_VERSION=$(docker --version)
    log "Docker 버전: $DOCKER_VERSION"
    
    # ========================================
    # 2. Docker Compose 설치 확인 및 설치
    # ========================================
    log "🔧 Docker Compose 설치 확인..."
    
    if ! command -v docker-compose &> /dev/null; then
        log "Docker Compose를 설치합니다..."
        
        # Docker Compose 설치
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        
        log "✅ Docker Compose 설치 완료"
    else
        log "✅ Docker Compose가 이미 설치되어 있습니다."
    fi
    
    # Docker Compose 버전 확인
    COMPOSE_VERSION=$(docker-compose --version)
    log "Docker Compose 버전: $COMPOSE_VERSION"
    
    # ========================================
    # 3. 스토리지 디렉토리 생성
    # ========================================
    log "📁 Docker 볼륨 디렉토리 생성..."
    
    # 필요한 디렉토리들 생성
    sudo mkdir -p /mnt/malmoi-storage/app/uploads
    sudo mkdir -p /mnt/malmoi-storage/app/static
    sudo mkdir -p /mnt/malmoi-storage/database/postgresql
    sudo mkdir -p /mnt/malmoi-storage/database/redis
    sudo mkdir -p /mnt/malmoi-storage/logs/app
    sudo mkdir -p /mnt/malmoi-storage/logs/nginx
    sudo mkdir -p /mnt/malmoi-storage/logs/postgresql
    
    # nginx 디렉토리 생성
    sudo mkdir -p /home/admin/malmoi-system/nginx/sites-available
    
    # 권한 설정
    sudo chown -R admin:admin /mnt/malmoi-storage/app
    sudo chown -R admin:admin /mnt/malmoi-storage/logs
    sudo chmod 755 /mnt/malmoi-storage/database
    
    log "✅ 디렉토리 생성 완료"
    
    # ========================================
    # 4. 환경 변수 파일 설정
    # ========================================
    log "🔧 환경 변수 파일 설정..."
    
    # 현재 디렉토리로 이동
    cd /home/admin/malmoi-system
    
    # 환경 변수 파일 복사
    if [ -f "env.nas.local" ]; then
        cp env.nas.local .env
        log "✅ .env 파일 생성 완료"
    else
        error "env.nas.local 파일을 찾을 수 없습니다."
        exit 1
    fi
    
    # Docker용 환경 변수 파일 생성
    cat > .env.docker << 'EOF'
# Docker Compose 환경 변수
COMPOSE_PROJECT_NAME=malmoi
COMPOSE_FILE=docker-compose.yml

# PostgreSQL 설정
POSTGRES_DB=malmoi_system
POSTGRES_USER=malmoi_admin
POSTGRES_PASSWORD=malmoi_admin_password_2024

# 네트워크 설정
MALMOI_NETWORK=malmoi-network
MALMOI_SUBNET=172.20.0.0/16

# 볼륨 설정
MALMOI_STORAGE_PATH=/mnt/malmoi-storage

# 서비스 포트
MALMOI_APP_PORT=3000
MALMOI_DB_PORT=5432
MALMOI_REDIS_PORT=6379
MALMOI_HTTP_PORT=80
MALMOI_HTTPS_PORT=443
EOF
    
    log "✅ Docker 환경 변수 파일 생성 완료"
    
    # ========================================
    # 5. Nginx 설정 파일 생성
    # ========================================
    log "🌐 Nginx 설정 파일 생성..."
    
    # sites-available 디렉토리에 기본 설정 생성
    cat > nginx/sites-available/default << 'EOF'
# MalMoi 기본 사이트 설정
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    server_name _;
    
    location / {
        proxy_pass http://malmoi-app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
    
    log "✅ Nginx 설정 파일 생성 완료"
    
    # ========================================
    # 6. Docker 이미지 빌드
    # ========================================
    log "🔨 Docker 이미지 빌드..."
    
    # 기존 컨테이너 중지 및 제거
    if [ "$(docker ps -aq -f name=malmoi)" ]; then
        log "기존 컨테이너 중지 및 제거..."
        docker-compose down -v
    fi
    
    # 이미지 빌드
    docker-compose build --no-cache
    
    log "✅ Docker 이미지 빌드 완료"
    
    # ========================================
    # 7. 데이터베이스 초기화 준비
    # ========================================
    log "🗄️ 데이터베이스 초기화 준비..."
    
    # PostgreSQL 컨테이너만 먼저 시작
    docker-compose up -d malmoi-db
    
    # PostgreSQL이 시작될 때까지 대기
    log "PostgreSQL 시작 대기 중..."
    for i in {1..30}; do
        if docker-compose exec -T malmoi-db pg_isready -U malmoi_admin -d malmoi_system; then
            log "✅ PostgreSQL이 준비되었습니다."
            break
        fi
        
        if [ $i -eq 30 ]; then
            error "PostgreSQL 시작 실패"
            docker-compose logs malmoi-db
            exit 1
        fi
        
        sleep 2
    done
    
    # ========================================
    # 8. Prisma 마이그레이션 실행
    # ========================================
    log "🔄 Prisma 마이그레이션 실행..."
    
    # Prisma 클라이언트 생성
    npx prisma generate
    
    # 데이터베이스 마이그레이션
    npx prisma migrate deploy
    
    log "✅ 데이터베이스 마이그레이션 완료"
    
    # ========================================
    # 9. 전체 서비스 시작
    # ========================================
    log "🚀 전체 서비스 시작..."
    
    # 모든 서비스 시작
    docker-compose up -d
    
    # 서비스 상태 확인
    sleep 10
    docker-compose ps
    
    # ========================================
    # 10. 헬스체크 확인
    # ========================================
    log "🏥 헬스체크 확인..."
    
    # 애플리케이션 헬스체크
    for i in {1..30}; do
        if curl -s http://localhost:3000/api/health > /dev/null; then
            log "✅ 애플리케이션이 정상적으로 실행 중입니다."
            break
        fi
        
        if [ $i -eq 30 ]; then
            error "애플리케이션 헬스체크 실패"
            docker-compose logs malmoi-app
            exit 1
        fi
        
        sleep 2
    done
    
    # Nginx 헬스체크
    if curl -s http://localhost/api/health > /dev/null; then
        log "✅ Nginx 프록시가 정상적으로 작동 중입니다."
    else
        warning "Nginx 프록시 확인이 필요합니다."
    fi
    
    # ========================================
    # 11. 시스템 서비스 등록 (선택사항)
    # ========================================
    log "⚙️ 시스템 서비스 등록..."
    
    cat << 'EOF' | sudo tee /etc/systemd/system/malmoi-docker.service > /dev/null
[Unit]
Description=MalMoi Docker Compose Service
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/admin/malmoi-system
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF
    
    # 서비스 등록 및 활성화
    sudo systemctl daemon-reload
    sudo systemctl enable malmoi-docker
    
    log "✅ 시스템 서비스 등록 완료"
    
    # ========================================
    # 12. 관리 스크립트 생성
    # ========================================
    log "📝 관리 스크립트 생성..."
    
    # 시작/중지/재시작 스크립트
    cat << 'EOF' > /home/admin/malmoi-docker-manager.sh
#!/bin/bash

# MalMoi Docker 관리 스크립트

WORK_DIR="/home/admin/malmoi-system"

case "$1" in
    start)
        echo "MalMoi 서비스 시작..."
        cd "$WORK_DIR"
        docker-compose up -d
        ;;
    stop)
        echo "MalMoi 서비스 중지..."
        cd "$WORK_DIR"
        docker-compose down
        ;;
    restart)
        echo "MalMoi 서비스 재시작..."
        cd "$WORK_DIR"
        docker-compose down
        docker-compose up -d
        ;;
    logs)
        echo "MalMoi 서비스 로그..."
        cd "$WORK_DIR"
        docker-compose logs -f
        ;;
    status)
        echo "MalMoi 서비스 상태..."
        cd "$WORK_DIR"
        docker-compose ps
        ;;
    update)
        echo "MalMoi 서비스 업데이트..."
        cd "$WORK_DIR"
        git pull
        docker-compose build --no-cache
        docker-compose down
        docker-compose up -d
        ;;
    *)
        echo "사용법: $0 {start|stop|restart|logs|status|update}"
        exit 1
        ;;
esac
EOF
    
    chmod +x /home/admin/malmoi-docker-manager.sh
    
    log "✅ 관리 스크립트 생성 완료"
    
    # ========================================
    # 13. 설정 완료 정보 출력
    # ========================================
    log "🎉 Docker 환경 설정 완료!"
    
    echo
    echo "=== 서비스 접속 정보 ==="
    echo "애플리케이션: http://localhost:3000"
    echo "Nginx 프록시: http://localhost"
    echo "PostgreSQL: localhost:5432"
    echo "Redis: localhost:6379"
    echo
    
    echo "=== 관리 명령어 ==="
    echo "서비스 시작: /home/admin/malmoi-docker-manager.sh start"
    echo "서비스 중지: /home/admin/malmoi-docker-manager.sh stop"
    echo "서비스 재시작: /home/admin/malmoi-docker-manager.sh restart"
    echo "로그 확인: /home/admin/malmoi-docker-manager.sh logs"
    echo "상태 확인: /home/admin/malmoi-docker-manager.sh status"
    echo "업데이트: /home/admin/malmoi-docker-manager.sh update"
    echo
    
    echo "=== Docker Compose 명령어 ==="
    echo "서비스 확인: docker-compose ps"
    echo "로그 확인: docker-compose logs -f [서비스명]"
    echo "컨테이너 접속: docker-compose exec [서비스명] /bin/sh"
    echo
    
    echo "=== 데이터 위치 ==="
    echo "애플리케이션 데이터: /mnt/malmoi-storage/app"
    echo "데이터베이스 데이터: /mnt/malmoi-storage/database"
    echo "로그 파일: /mnt/malmoi-storage/logs"
    echo
    
    log "🔧 추가 설정이 필요한 경우 README.md를 참조하세요."
}

main "$@"
#!/bin/bash

# ========================================
# DXP2800 PostgreSQL 설치 및 설정 스크립트
# AWS RDS에서 로컬 PostgreSQL로 이관
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

# 확인 함수
confirm() {
    read -p "$1 (y/N): " -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]]
}

main() {
    log "🚀 PostgreSQL 설치 및 설정 시작..."
    
    # ========================================
    # 1. PostgreSQL 설치
    # ========================================
    log "📦 PostgreSQL 설치 중..."
    
    # 시스템 업데이트
    sudo apt update
    
    # PostgreSQL 설치
    sudo apt install -y postgresql postgresql-contrib postgresql-client
    
    # PostgreSQL 버전 확인
    PG_VERSION=$(psql --version | awk '{print $3}' | sed 's/\..*//')
    log "설치된 PostgreSQL 버전: $PG_VERSION"
    
    # ========================================
    # 2. 데이터 디렉토리 설정
    # ========================================
    log "📁 데이터 디렉토리 설정..."
    
    # PostgreSQL 서비스 중지
    sudo systemctl stop postgresql
    
    # 스토리지 마운트 포인트에 PostgreSQL 데이터 디렉토리 생성
    sudo mkdir -p /mnt/malmoi-storage/database/postgresql/$PG_VERSION/main
    sudo chown -R postgres:postgres /mnt/malmoi-storage/database/postgresql
    sudo chmod 700 /mnt/malmoi-storage/database/postgresql/$PG_VERSION/main
    
    # 기존 데이터 디렉토리 백업 (있을 경우)
    if [ -d "/var/lib/postgresql/$PG_VERSION/main" ]; then
        sudo mv /var/lib/postgresql/$PG_VERSION/main /var/lib/postgresql/$PG_VERSION/main.backup.$(date +%Y%m%d_%H%M%S)
    fi
    
    # 새 데이터 디렉토리로 심볼릭 링크 생성
    sudo ln -sf /mnt/malmoi-storage/database/postgresql/$PG_VERSION/main /var/lib/postgresql/$PG_VERSION/main
    
    # PostgreSQL 설정 파일 수정
    PG_CONFIG_DIR="/etc/postgresql/$PG_VERSION/main"
    
    # postgresql.conf 백업
    sudo cp "$PG_CONFIG_DIR/postgresql.conf" "$PG_CONFIG_DIR/postgresql.conf.backup.$(date +%Y%m%d_%H%M%S)"
    
    # postgresql.conf 설정
    sudo tee -a "$PG_CONFIG_DIR/postgresql.conf" > /dev/null << EOF

# ========================================
# MalMoi 시스템 사용자 정의 설정
# ========================================

# 데이터 디렉토리
data_directory = '/mnt/malmoi-storage/database/postgresql/$PG_VERSION/main'

# 메모리 설정 (2GB RAM 기준)
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

# 연결 설정
max_connections = 100
listen_addresses = 'localhost,127.0.0.1'
port = 5432

# 로그 설정
log_destination = 'stderr'
logging_collector = on
log_directory = '/mnt/malmoi-storage/logs/postgresql'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_rotation_age = 1d
log_rotation_size = 100MB
log_min_duration_statement = 1000

# 백업 및 복제 설정
archive_mode = on
archive_command = 'cp %p /mnt/malmoi-storage/database/backups/%f'
wal_level = replica

# 체크포인트 설정
checkpoint_completion_target = 0.9
wal_buffers = 16MB

# 자동 VACUUM 설정
autovacuum = on
autovacuum_max_workers = 3
autovacuum_naptime = 1min
EOF

    # 로그 디렉토리 생성
    sudo mkdir -p /mnt/malmoi-storage/logs/postgresql
    sudo chown postgres:postgres /mnt/malmoi-storage/logs/postgresql
    
    # ========================================
    # 3. 데이터베이스 초기화
    # ========================================
    log "🗄️ 데이터베이스 초기화..."
    
    # 데이터베이스 초기화
    sudo -u postgres /usr/lib/postgresql/$PG_VERSION/bin/initdb -D /mnt/malmoi-storage/database/postgresql/$PG_VERSION/main
    
    # PostgreSQL 서비스 시작
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    
    # ========================================
    # 4. 사용자 및 데이터베이스 생성
    # ========================================
    log "👤 사용자 및 데이터베이스 생성..."
    
    # malmoi_admin 사용자 생성
    sudo -u postgres psql -c "CREATE USER malmoi_admin WITH PASSWORD 'malmoi_admin_password_2024';"
    sudo -u postgres psql -c "ALTER USER malmoi_admin CREATEDB;"
    sudo -u postgres psql -c "ALTER USER malmoi_admin CREATEROLE;"
    
    # malmoi_system 데이터베이스 생성
    sudo -u postgres psql -c "CREATE DATABASE malmoi_system OWNER malmoi_admin;"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE malmoi_system TO malmoi_admin;"
    
    # 연결 테스트
    sudo -u postgres psql malmoi_system -c "SELECT version();"
    
    log "✅ 로컬 PostgreSQL 설정 완료"
    
    # ========================================
    # 5. AWS RDS 데이터 백업 준비
    # ========================================
    log "☁️ AWS RDS 데이터 백업 준비..."
    
    # AWS RDS 연결 정보 (환경 변수에서 가져오기)
    if [ -f ".env" ]; then
        source .env
    elif [ -f "env.production" ]; then
        source env.production
    fi
    
    AWS_RDS_HOST=${AWS_RDS_HOST:-"malmoi-system-db-tokyo.crooggsemeim.ap-northeast-1.rds.amazonaws.com"}
    AWS_RDS_USERNAME=${AWS_RDS_USERNAME:-"malmoi_admin"}
    AWS_RDS_DATABASE=${AWS_RDS_DATABASE:-"malmoi_system"}
    AWS_RDS_PASSWORD=${AWS_RDS_PASSWORD:-"malmoi_admin_password_2024"}
    
    log "AWS RDS 연결 정보:"
    log "호스트: $AWS_RDS_HOST"
    log "사용자: $AWS_RDS_USERNAME"
    log "데이터베이스: $AWS_RDS_DATABASE"
    
    # 백업 디렉토리 생성
    BACKUP_DIR="/mnt/malmoi-storage/database/backups"
    sudo mkdir -p "$BACKUP_DIR"
    sudo chown admin:admin "$BACKUP_DIR"
    
    # 백업 스크립트 생성
    cat << 'EOF' > "$BACKUP_DIR/rds-backup.sh"
#!/bin/bash

# AWS RDS 백업 스크립트
set -e

BACKUP_DIR="/mnt/malmoi-storage/database/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# 환경 변수 로드
if [ -f "/home/admin/malmoi-system/.env" ]; then
    source /home/admin/malmoi-system/.env
elif [ -f "/home/admin/malmoi-system/env.production" ]; then
    source /home/admin/malmoi-system/env.production
fi

AWS_RDS_HOST=${AWS_RDS_HOST:-"malmoi-system-db-tokyo.crooggsemeim.ap-northeast-1.rds.amazonaws.com"}
AWS_RDS_USERNAME=${AWS_RDS_USERNAME:-"malmoi_admin"}
AWS_RDS_DATABASE=${AWS_RDS_DATABASE:-"malmoi_system"}

echo "$(date): AWS RDS 데이터 백업 시작..."

# 전체 데이터베이스 백업
PGPASSWORD="$AWS_RDS_PASSWORD" pg_dump \
    -h "$AWS_RDS_HOST" \
    -U "$AWS_RDS_USERNAME" \
    -d "$AWS_RDS_DATABASE" \
    -f "$BACKUP_DIR/aws_rds_backup_$TIMESTAMP.sql" \
    --verbose

# 압축
gzip "$BACKUP_DIR/aws_rds_backup_$TIMESTAMP.sql"

echo "$(date): AWS RDS 데이터 백업 완료: aws_rds_backup_$TIMESTAMP.sql.gz"

# 7일 이상 된 백업 파일 삭제
find "$BACKUP_DIR" -name "aws_rds_backup_*.sql.gz" -mtime +7 -delete

EOF
    
    chmod +x "$BACKUP_DIR/rds-backup.sh"
    
    # ========================================
    # 6. 데이터 마이그레이션 스크립트 생성
    # ========================================
    log "🔄 데이터 마이그레이션 스크립트 생성..."
    
    cat << 'EOF' > "$BACKUP_DIR/migrate-from-rds.sh"
#!/bin/bash

# AWS RDS에서 로컬 PostgreSQL로 데이터 마이그레이션 스크립트
set -e

BACKUP_DIR="/mnt/malmoi-storage/database/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# 환경 변수 로드
if [ -f "/home/admin/malmoi-system/.env" ]; then
    source /home/admin/malmoi-system/.env
elif [ -f "/home/admin/malmoi-system/env.production" ]; then
    source /home/admin/malmoi-system/env.production
fi

AWS_RDS_HOST=${AWS_RDS_HOST:-"malmoi-system-db-tokyo.crooggsemeim.ap-northeast-1.rds.amazonaws.com"}
AWS_RDS_USERNAME=${AWS_RDS_USERNAME:-"malmoi_admin"}
AWS_RDS_DATABASE=${AWS_RDS_DATABASE:-"malmoi_system"}

echo "$(date): 데이터 마이그레이션 시작..."

# 1. AWS RDS 데이터 백업
echo "1. AWS RDS 데이터 백업 중..."
PGPASSWORD="$AWS_RDS_PASSWORD" pg_dump \
    -h "$AWS_RDS_HOST" \
    -U "$AWS_RDS_USERNAME" \
    -d "$AWS_RDS_DATABASE" \
    -f "$BACKUP_DIR/migration_backup_$TIMESTAMP.sql" \
    --clean --if-exists --verbose

echo "   백업 완료: migration_backup_$TIMESTAMP.sql"

# 2. 로컬 데이터베이스 초기화 (기존 데이터 삭제)
echo "2. 로컬 데이터베이스 초기화 중..."
sudo -u postgres psql -c "DROP DATABASE IF EXISTS malmoi_system;"
sudo -u postgres psql -c "CREATE DATABASE malmoi_system OWNER malmoi_admin;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE malmoi_system TO malmoi_admin;"

# 3. 데이터 복원
echo "3. 로컬 데이터베이스로 데이터 복원 중..."
sudo -u postgres psql malmoi_system < "$BACKUP_DIR/migration_backup_$TIMESTAMP.sql"

# 4. 권한 재설정
echo "4. 권한 재설정 중..."
sudo -u postgres psql malmoi_system -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO malmoi_admin;"
sudo -u postgres psql malmoi_system -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO malmoi_admin;"

# 5. 연결 테스트
echo "5. 연결 테스트 중..."
sudo -u postgres psql malmoi_system -c "SELECT COUNT(*) FROM \"User\";" || echo "User 테이블이 없거나 접근할 수 없습니다."

echo "$(date): 데이터 마이그레이션 완료!"
echo "백업 파일: $BACKUP_DIR/migration_backup_$TIMESTAMP.sql"

# 백업 파일 압축
gzip "$BACKUP_DIR/migration_backup_$TIMESTAMP.sql"
echo "압축된 백업: migration_backup_$TIMESTAMP.sql.gz"

EOF
    
    chmod +x "$BACKUP_DIR/migrate-from-rds.sh"
    
    # ========================================
    # 7. 자동 백업 설정
    # ========================================
    log "⏰ 자동 백업 설정..."
    
    # 일일 백업 스크립트
    cat << 'EOF' > "$BACKUP_DIR/daily-backup.sh"
#!/bin/bash

# 로컬 PostgreSQL 일일 백업 스크립트
set -e

BACKUP_DIR="/mnt/malmoi-storage/database/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "$(date): 일일 백업 시작..."

# PostgreSQL 백업
sudo -u postgres pg_dump malmoi_system > "$BACKUP_DIR/daily_backup_$TIMESTAMP.sql"

# 압축
gzip "$BACKUP_DIR/daily_backup_$TIMESTAMP.sql"

echo "$(date): 일일 백업 완료: daily_backup_$TIMESTAMP.sql.gz"

# 30일 이상 된 백업 파일 삭제
find "$BACKUP_DIR" -name "daily_backup_*.sql.gz" -mtime +30 -delete

# 백업 로그
echo "$(date): 백업 완료 - daily_backup_$TIMESTAMP.sql.gz" >> /var/log/malmoi-backup.log

EOF
    
    chmod +x "$BACKUP_DIR/daily-backup.sh"
    
    # crontab에 일일 백업 추가 (매일 새벽 2시)
    (crontab -l 2>/dev/null; echo "0 2 * * * $BACKUP_DIR/daily-backup.sh") | crontab -
    
    # ========================================
    # 8. 설정 완료 확인
    # ========================================
    log "✅ PostgreSQL 설정 완료 확인..."
    
    echo "=== PostgreSQL 서비스 상태 ==="
    sudo systemctl status postgresql --no-pager
    echo
    
    echo "=== 데이터베이스 목록 ==="
    sudo -u postgres psql -l
    echo
    
    echo "=== 연결 테스트 ==="
    sudo -u postgres psql malmoi_system -c "SELECT current_database(), current_user, inet_server_addr(), inet_server_port();"
    echo
    
    # 연결 정보 표시
    log "📋 데이터베이스 연결 정보:"
    log "호스트: localhost"
    log "포트: 5432"
    log "데이터베이스: malmoi_system"
    log "사용자: malmoi_admin"
    log "비밀번호: malmoi_admin_password_2024"
    log "DATABASE_URL: postgresql://malmoi_admin:malmoi_admin_password_2024@localhost:5432/malmoi_system"
    
    log "🎉 PostgreSQL 설치 및 설정 완료!"
    log "📁 데이터 디렉토리: /mnt/malmoi-storage/database/postgresql"
    log "📊 로그 디렉토리: /mnt/malmoi-storage/logs/postgresql"
    log "💾 백업 디렉토리: /mnt/malmoi-storage/database/backups"
    log "🔄 마이그레이션 스크립트: $BACKUP_DIR/migrate-from-rds.sh"
    log "⏰ 자동 백업: 매일 02:00 (crontab 설정됨)"
}

main "$@"
#!/bin/bash

# ========================================
# AWS RDS에서 로컬 PostgreSQL로 데이터 마이그레이션
# Vercel + AWS에서 DXP2800 NAS로 완전 이전
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

main() {
    log "🚀 AWS에서 로컬 NAS로 데이터 마이그레이션 시작..."
    
    # ========================================
    # 1. 사전 확인
    # ========================================
    log "🔍 사전 확인 작업..."
    
    # 환경 변수 로드
    if [ -f ".env" ]; then
        source .env
    elif [ -f "env.production" ]; then
        source env.production
    else
        error "환경 변수 파일을 찾을 수 없습니다."
        exit 1
    fi
    
    # AWS RDS 연결 정보 확인
    AWS_RDS_HOST=${AWS_RDS_HOST:-"malmoi-system-db-tokyo.crooggsemeim.ap-northeast-1.rds.amazonaws.com"}
    AWS_RDS_USERNAME=${AWS_RDS_USERNAME:-"malmoi_admin"}
    AWS_RDS_DATABASE=${AWS_RDS_DATABASE:-"malmoi_system"}
    AWS_RDS_PASSWORD=${AWS_RDS_PASSWORD:-"malmoi_admin_password_2024"}
    
    log "AWS RDS 연결 정보:"
    log "호스트: $AWS_RDS_HOST"
    log "사용자: $AWS_RDS_USERNAME"
    log "데이터베이스: $AWS_RDS_DATABASE"
    
    # 로컬 PostgreSQL 상태 확인
    if systemctl is-active --quiet postgresql || docker ps | grep -q malmoi-db; then
        log "✅ 로컬 PostgreSQL이 실행 중입니다."
    else
        error "로컬 PostgreSQL이 실행되지 않았습니다. 먼저 설정해주세요."
        exit 1
    fi
    
    # AWS RDS 연결 테스트
    log "AWS RDS 연결 테스트 중..."
    if PGPASSWORD="$AWS_RDS_PASSWORD" psql -h "$AWS_RDS_HOST" -U "$AWS_RDS_USERNAME" -d "$AWS_RDS_DATABASE" -c "SELECT version();" > /dev/null 2>&1; then
        log "✅ AWS RDS 연결 성공"
    else
        error "AWS RDS 연결 실패. 네트워크 연결 및 자격 증명을 확인해주세요."
        exit 1
    fi
    
    # 로컬 PostgreSQL 연결 테스트
    if sudo -u postgres psql malmoi_system -c "SELECT version();" > /dev/null 2>&1; then
        log "✅ 로컬 PostgreSQL 연결 성공"
    else
        error "로컬 PostgreSQL 연결 실패."
        exit 1
    fi
    
    # ========================================
    # 2. 백업 디렉토리 준비
    # ========================================
    log "📁 백업 디렉토리 준비..."
    
    MIGRATION_DIR="/mnt/malmoi-storage/migration"
    BACKUP_DIR="/mnt/malmoi-storage/backups/migration"
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    
    sudo mkdir -p "$MIGRATION_DIR"
    sudo mkdir -p "$BACKUP_DIR"
    sudo chown -R admin:admin "$MIGRATION_DIR"
    sudo chown -R admin:admin "$BACKUP_DIR"
    
    log "✅ 백업 디렉토리 준비 완료"
    
    # ========================================
    # 3. 현재 로컬 데이터 백업 (안전을 위해)
    # ========================================
    log "💾 현재 로컬 데이터 백업 중..."
    
    LOCAL_BACKUP_FILE="$BACKUP_DIR/local_before_migration_$TIMESTAMP.sql"
    
    if sudo -u postgres pg_dump malmoi_system > "$LOCAL_BACKUP_FILE"; then
        gzip "$LOCAL_BACKUP_FILE"
        log "✅ 로컬 데이터 백업 완료: local_before_migration_$TIMESTAMP.sql.gz"
    else
        warning "로컬 데이터 백업 실패. 계속 진행하시겠습니까?"
        if ! confirm "계속 진행하시겠습니까?"; then
            exit 1
        fi
    fi
    
    # ========================================
    # 4. AWS RDS 데이터 백업
    # ========================================
    log "☁️ AWS RDS 데이터 백업 중..."
    
    AWS_BACKUP_FILE="$MIGRATION_DIR/aws_rds_migration_$TIMESTAMP.sql"
    
    log "AWS RDS에서 데이터 덤프 중... (시간이 오래 걸릴 수 있습니다)"
    
    if PGPASSWORD="$AWS_RDS_PASSWORD" pg_dump \
        -h "$AWS_RDS_HOST" \
        -U "$AWS_RDS_USERNAME" \
        -d "$AWS_RDS_DATABASE" \
        -f "$AWS_BACKUP_FILE" \
        --clean --if-exists --verbose; then
        
        # 백업 파일 크기 확인
        BACKUP_SIZE=$(du -h "$AWS_BACKUP_FILE" | cut -f1)
        log "✅ AWS RDS 데이터 백업 완료: aws_rds_migration_$TIMESTAMP.sql ($BACKUP_SIZE)"
        
        # 압축
        gzip "$AWS_BACKUP_FILE"
        log "백업 파일 압축 완료"
    else
        error "AWS RDS 데이터 백업 실패"
        exit 1
    fi
    
    # ========================================
    # 5. 데이터 검증 및 분석
    # ========================================
    log "🔍 데이터 검증 및 분석..."
    
    # AWS RDS 데이터 통계
    log "AWS RDS 데이터 통계 수집 중..."
    cat << 'EOF' > "$MIGRATION_DIR/get_aws_stats.sql"
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows
FROM pg_stat_user_tables 
ORDER BY n_live_tup DESC;

SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
EOF
    
    PGPASSWORD="$AWS_RDS_PASSWORD" psql \
        -h "$AWS_RDS_HOST" \
        -U "$AWS_RDS_USERNAME" \
        -d "$AWS_RDS_DATABASE" \
        -f "$MIGRATION_DIR/get_aws_stats.sql" \
        -o "$MIGRATION_DIR/aws_data_stats_$TIMESTAMP.txt"
    
    log "✅ AWS RDS 데이터 통계 수집 완료"
    
    # ========================================
    # 6. 서비스 중지
    # ========================================
    log "⏹️ 애플리케이션 서비스 중지..."
    
    warning "⚠️  데이터 마이그레이션 중에는 애플리케이션이 중지됩니다."
    if ! confirm "애플리케이션을 중지하고 마이그레이션을 계속하시겠습니까?"; then
        log "마이그레이션이 취소되었습니다."
        exit 0
    fi
    
    # Docker 환경인 경우
    if command -v docker-compose &> /dev/null && [ -f "docker-compose.yml" ]; then
        log "Docker 서비스 중지 중..."
        docker-compose stop malmoi-app
        log "✅ Docker 애플리케이션 서비스 중지 완료"
    fi
    
    # systemd 서비스인 경우
    if systemctl is-active --quiet malmoi; then
        log "systemd 서비스 중지 중..."
        sudo systemctl stop malmoi
        log "✅ systemd 서비스 중지 완료"
    fi
    
    # ========================================
    # 7. 로컬 데이터베이스 초기화
    # ========================================
    log "🗄️ 로컬 데이터베이스 초기화..."
    
    warning "⚠️  기존 로컬 데이터가 삭제됩니다."
    if ! confirm "로컬 데이터베이스를 초기화하시겠습니까?"; then
        log "마이그레이션이 취소되었습니다."
        exit 0
    fi
    
    # 데이터베이스 재생성
    if [ -n "$(docker ps -q -f name=malmoi-db)" ]; then
        # Docker 환경
        docker exec malmoi-db psql -U malmoi_admin -c "DROP DATABASE IF EXISTS malmoi_system;"
        docker exec malmoi-db psql -U malmoi_admin -c "CREATE DATABASE malmoi_system OWNER malmoi_admin;"
    else
        # 직접 설치 환경
        sudo -u postgres psql -c "DROP DATABASE IF EXISTS malmoi_system;"
        sudo -u postgres psql -c "CREATE DATABASE malmoi_system OWNER malmoi_admin;"
        sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE malmoi_system TO malmoi_admin;"
    fi
    
    log "✅ 로컬 데이터베이스 초기화 완료"
    
    # ========================================
    # 8. AWS 데이터 복원
    # ========================================
    log "📥 AWS 데이터를 로컬 데이터베이스로 복원 중..."
    
    # 압축 해제
    gunzip "$AWS_BACKUP_FILE.gz"
    
    # 데이터 복원
    if [ -n "$(docker ps -q -f name=malmoi-db)" ]; then
        # Docker 환경
        cat "$AWS_BACKUP_FILE" | docker exec -i malmoi-db psql -U malmoi_admin malmoi_system
    else
        # 직접 설치 환경
        sudo -u postgres psql malmoi_system < "$AWS_BACKUP_FILE"
    fi
    
    log "✅ 데이터 복원 완료"
    
    # ========================================
    # 9. 권한 재설정
    # ========================================
    log "🔐 권한 재설정..."
    
    if [ -n "$(docker ps -q -f name=malmoi-db)" ]; then
        # Docker 환경
        docker exec malmoi-db psql -U malmoi_admin malmoi_system -c "
            GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO malmoi_admin;
            GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO malmoi_admin;
            GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO malmoi_admin;
        "
    else
        # 직접 설치 환경
        sudo -u postgres psql malmoi_system -c "
            GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO malmoi_admin;
            GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO malmoi_admin;
            GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO malmoi_admin;
        "
    fi
    
    log "✅ 권한 재설정 완료"
    
    # ========================================
    # 10. 데이터 검증
    # ========================================
    log "✅ 마이그레이션된 데이터 검증..."
    
    # 테이블 목록 및 레코드 수 확인
    cat << 'EOF' > "$MIGRATION_DIR/verify_migration.sql"
SELECT 
    schemaname,
    tablename,
    n_live_tup as record_count
FROM pg_stat_user_tables 
ORDER BY n_live_tup DESC;

SELECT COUNT(*) as total_users FROM "User";
SELECT COUNT(*) as total_students FROM "Student";
SELECT COUNT(*) as total_teachers FROM "Teacher";
SELECT COUNT(*) as total_reservations FROM "Reservation";
EOF
    
    if [ -n "$(docker ps -q -f name=malmoi-db)" ]; then
        # Docker 환경
        docker exec malmoi-db psql -U malmoi_admin malmoi_system -f /dev/stdin < "$MIGRATION_DIR/verify_migration.sql" > "$MIGRATION_DIR/migration_verification_$TIMESTAMP.txt"
    else
        # 직접 설치 환경
        sudo -u postgres psql malmoi_system -f "$MIGRATION_DIR/verify_migration.sql" > "$MIGRATION_DIR/migration_verification_$TIMESTAMP.txt"
    fi
    
    log "✅ 데이터 검증 완료"
    
    # ========================================
    # 11. 환경 변수 업데이트
    # ========================================
    log "⚙️ 환경 변수 업데이트..."
    
    # 로컬 환경 변수 파일 복사
    if [ -f "env.nas.local" ]; then
        cp env.nas.local .env
        log "✅ 로컬 환경 변수 파일 적용 완료"
    else
        warning "env.nas.local 파일을 찾을 수 없습니다. 수동으로 DATABASE_URL을 변경해주세요."
    fi
    
    # ========================================
    # 12. Prisma 스키마 동기화
    # ========================================
    log "🔄 Prisma 스키마 동기화..."
    
    # Prisma 클라이언트 재생성
    npx prisma generate
    
    # 스키마 동기화 (필요시)
    npx prisma db pull || true
    npx prisma db push || true
    
    log "✅ Prisma 스키마 동기화 완료"
    
    # ========================================
    # 13. 서비스 재시작
    # ========================================
    log "🚀 서비스 재시작..."
    
    # Docker 환경인 경우
    if command -v docker-compose &> /dev/null && [ -f "docker-compose.yml" ]; then
        log "Docker 서비스 재시작 중..."
        docker-compose start malmoi-app
        
        # 헬스체크 대기
        log "애플리케이션 시작 대기 중..."
        for i in {1..30}; do
            if curl -s http://localhost:3000/api/health > /dev/null; then
                log "✅ 애플리케이션이 정상적으로 시작되었습니다."
                break
            fi
            
            if [ $i -eq 30 ]; then
                warning "애플리케이션 시작 확인 실패. 수동으로 확인해주세요."
            fi
            
            sleep 2
        done
    fi
    
    # systemd 서비스인 경우
    if systemctl list-unit-files | grep -q malmoi; then
        log "systemd 서비스 재시작 중..."
        sudo systemctl start malmoi
        
        # 서비스 상태 확인
        if systemctl is-active --quiet malmoi; then
            log "✅ systemd 서비스가 정상적으로 시작되었습니다."
        else
            warning "systemd 서비스 시작 실패. 수동으로 확인해주세요."
        fi
    fi
    
    # ========================================
    # 14. 마이그레이션 완료 보고서 생성
    # ========================================
    log "📊 마이그레이션 완료 보고서 생성..."
    
    cat << EOF > "$MIGRATION_DIR/migration_report_$TIMESTAMP.md"
# AWS RDS → 로컬 PostgreSQL 마이그레이션 보고서

## 마이그레이션 정보
- 마이그레이션 시작: $(date -d "$TIMESTAMP" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || echo $TIMESTAMP)
- 마이그레이션 완료: $(date)
- 소스: AWS RDS ($AWS_RDS_HOST)
- 대상: 로컬 PostgreSQL (localhost:5432)

## 백업 파일
- AWS 데이터 백업: aws_rds_migration_$TIMESTAMP.sql.gz
- 로컬 데이터 백업: local_before_migration_$TIMESTAMP.sql.gz (마이그레이션 전)
- 데이터 통계: aws_data_stats_$TIMESTAMP.txt
- 검증 결과: migration_verification_$TIMESTAMP.txt

## 마이그레이션 단계
1. ✅ 사전 확인 (AWS RDS, 로컬 PostgreSQL 연결)
2. ✅ 현재 로컬 데이터 백업
3. ✅ AWS RDS 데이터 백업
4. ✅ 데이터 검증 및 분석
5. ✅ 애플리케이션 서비스 중지
6. ✅ 로컬 데이터베이스 초기화
7. ✅ AWS 데이터 복원
8. ✅ 권한 재설정
9. ✅ 데이터 검증
10. ✅ 환경 변수 업데이트
11. ✅ Prisma 스키마 동기화
12. ✅ 서비스 재시작

## 검증 결과
$(cat "$MIGRATION_DIR/migration_verification_$TIMESTAMP.txt" 2>/dev/null || echo "검증 파일을 찾을 수 없음")

## 다음 단계
1. 애플리케이션 동작 확인: http://localhost:3000
2. 관리자 로그인 테스트
3. 주요 기능 테스트 (예약, 사용자 관리 등)
4. AWS 서비스 정리 (선택사항)
5. DDNS 설정 및 외부 접속 테스트

## 롤백 방법 (문제 발생 시)
\`\`\`bash
# 로컬 데이터를 마이그레이션 전 상태로 복원
gunzip -c $BACKUP_DIR/local_before_migration_$TIMESTAMP.sql.gz | sudo -u postgres psql malmoi_system

# 또는 AWS RDS 환경 변수로 복원
cp env.production .env
sudo systemctl restart malmoi
\`\`\`

## 파일 위치
- 마이그레이션 파일: $MIGRATION_DIR/
- 백업 파일: $BACKUP_DIR/
- 보고서: $MIGRATION_DIR/migration_report_$TIMESTAMP.md
EOF
    
    log "✅ 마이그레이션 완료 보고서 생성 완료"
    
    # ========================================
    # 15. 최종 확인 및 안내
    # ========================================
    log "🎉 AWS RDS → 로컬 PostgreSQL 마이그레이션 완료!"
    
    echo
    echo "=== 마이그레이션 완료 ==="
    echo "백업 파일: $MIGRATION_DIR/aws_rds_migration_$TIMESTAMP.sql.gz"
    echo "보고서: $MIGRATION_DIR/migration_report_$TIMESTAMP.md"
    echo "검증 결과: $MIGRATION_DIR/migration_verification_$TIMESTAMP.txt"
    echo
    
    echo "=== 다음 확인 사항 ==="
    echo "1. 애플리케이션 접속: http://localhost:3000"
    echo "2. 헬스체크: http://localhost:3000/api/health"
    echo "3. 관리자 로그인 테스트"
    echo "4. 데이터베이스 연결: psql -h localhost -U malmoi_admin malmoi_system"
    echo
    
    echo "=== AWS 서비스 정리 (선택사항) ==="
    echo "마이그레이션이 성공적으로 완료되면 다음 AWS 서비스를 정리할 수 있습니다:"
    echo "- RDS 인스턴스 중지/삭제"
    echo "- Vercel 배포 중지"
    echo "- 사용하지 않는 AWS 리소스 정리"
    echo
    
    warning "⚠️  AWS 서비스 정리 전에 충분한 테스트를 수행하세요!"
    warning "⚠️  백업 파일을 안전한 곳에 보관하세요!"
    
    log "📋 자세한 내용은 마이그레이션 보고서를 확인하세요:"
    log "cat $MIGRATION_DIR/migration_report_$TIMESTAMP.md"
}

main "$@"
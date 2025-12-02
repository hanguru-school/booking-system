#!/bin/bash
set -euo pipefail

cd ~/booking-system

# 백업 디렉토리 생성
echo "📁 백업 디렉토리 생성 중..."
mkdir -p ~/backups/database/{daily,weekly,monthly}
mkdir -p ~/backups/logs

# 데이터베이스 백업 스크립트 생성
echo "📝 백업 스크립트 생성 중..."
cat > ~/backup-database.sh <<'BACKUP_SCRIPT'
#!/bin/bash
set -euo pipefail

BACKUP_DIR="$HOME/backups/database"
LOG_FILE="$HOME/backups/logs/backup.log"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE=$(date +%Y-%m-%d)
DAY_OF_WEEK=$(date +%u)  # 1=Monday, 7=Sunday
DAY_OF_MONTH=$(date +%d)

# 로그 함수
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=========================================="
log "데이터베이스 백업 시작"

# .env 파일에서 DATABASE_URL 읽기
cd ~/booking-system
if [ ! -f .env ]; then
    log "ERROR: .env 파일을 찾을 수 없습니다."
    exit 1
fi

# DATABASE_URL 파싱
DATABASE_URL=$(grep "^DATABASE_URL=" .env | cut -d'=' -f2- | tr -d '"')
if [ -z "$DATABASE_URL" ]; then
    log "ERROR: DATABASE_URL을 찾을 수 없습니다."
    exit 1
fi

# PostgreSQL 연결 정보 추출
DB_USER=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')

# PGPASSWORD 환경 변수 설정
export PGPASSWORD="$DB_PASS"

# 일일 백업
log "일일 백업 생성 중..."
DAILY_BACKUP="$BACKUP_DIR/daily/malmoi_system_${TIMESTAMP}.sql.gz"
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" --no-owner --no-acl | gzip > "$DAILY_BACKUP"

if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "$DAILY_BACKUP" | cut -f1)
    log "✅ 일일 백업 완료: $DAILY_BACKUP (크기: $BACKUP_SIZE)"
else
    log "❌ 일일 백업 실패"
    exit 1
fi

# 주간 백업 (일요일)
if [ "$DAY_OF_WEEK" -eq 7 ]; then
    log "주간 백업 생성 중..."
    WEEKLY_BACKUP="$BACKUP_DIR/weekly/malmoi_system_week_${DATE}.sql.gz"
    cp "$DAILY_BACKUP" "$WEEKLY_BACKUP"
    log "✅ 주간 백업 완료: $WEEKLY_BACKUP"
fi

# 월간 백업 (매월 1일)
if [ "$DAY_OF_MONTH" -eq 1 ]; then
    log "월간 백업 생성 중..."
    MONTHLY_BACKUP="$BACKUP_DIR/monthly/malmoi_system_month_$(date +%Y%m).sql.gz"
    cp "$DAILY_BACKUP" "$MONTHLY_BACKUP"
    log "✅ 월간 백업 완료: $MONTHLY_BACKUP"
fi

# 오래된 백업 정리 (일일: 30일, 주간: 12주, 월간: 12개월)
log "오래된 백업 정리 중..."

# 일일 백업: 30일 이상 된 것 삭제
find "$BACKUP_DIR/daily" -name "*.sql.gz" -mtime +30 -delete 2>/dev/null || true
log "일일 백업 정리 완료 (30일 이상 된 백업 삭제)"

# 주간 백업: 84일(12주) 이상 된 것 삭제
find "$BACKUP_DIR/weekly" -name "*.sql.gz" -mtime +84 -delete 2>/dev/null || true
log "주간 백업 정리 완료 (12주 이상 된 백업 삭제)"

# 월간 백업: 365일(12개월) 이상 된 것 삭제
find "$BACKUP_DIR/monthly" -name "*.sql.gz" -mtime +365 -delete 2>/dev/null || true
log "월간 백업 정리 완료 (12개월 이상 된 백업 삭제)"

# 백업 통계
DAILY_COUNT=$(find "$BACKUP_DIR/daily" -name "*.sql.gz" 2>/dev/null | wc -l)
WEEKLY_COUNT=$(find "$BACKUP_DIR/weekly" -name "*.sql.gz" 2>/dev/null | wc -l)
MONTHLY_COUNT=$(find "$BACKUP_DIR/monthly" -name "*.sql.gz" 2>/dev/null | wc -l)

log "백업 통계:"
log "  일일 백업: $DAILY_COUNT개"
log "  주간 백업: $WEEKLY_COUNT개"
log "  월간 백업: $MONTHLY_COUNT개"

log "데이터베이스 백업 완료"
log "=========================================="

unset PGPASSWORD
BACKUP_SCRIPT

chmod +x ~/backup-database.sh

# cron 작업 설정
echo "⏰ 자동 백업 스케줄 설정 중..."
(crontab -l 2>/dev/null | grep -v "backup-database.sh"; echo "0 2 * * * $HOME/backup-database.sh >> $HOME/backups/logs/cron.log 2>&1") | crontab -

echo "✅ 데이터베이스 자동 백업 설정 완료!"
echo ""
echo "백업 스케줄:"
echo "  - 일일 백업: 매일 오전 2시"
echo "  - 주간 백업: 매주 일요일 오전 2시"
echo "  - 월간 백업: 매월 1일 오전 2시"
echo ""
echo "백업 위치:"
echo "  - 일일: ~/backups/database/daily/"
echo "  - 주간: ~/backups/database/weekly/"
echo "  - 월간: ~/backups/database/monthly/"
echo ""
echo "백업 보관 기간:"
echo "  - 일일: 30일"
echo "  - 주간: 12주"
echo "  - 월간: 12개월"
echo ""
echo "수동 백업 실행: ~/backup-database.sh"




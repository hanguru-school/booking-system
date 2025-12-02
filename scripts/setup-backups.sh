#!/bin/bash
# 백업 자동화 스크립트 설정 (sudo 권한 필요)
# 멱등성 보장: 이미 설정되어 있어도 재실행 가능

set -euo pipefail

echo "=== 백업 자동화 설정 ==="

# 1. DB 백업 스크립트
echo "📝 DB 백업 스크립트 생성 중..."
sudo tee /usr/local/bin/backup-database.sh >/dev/null <<'BK'
#!/usr/bin/env bash
set -euo pipefail

source /etc/malmoi/booking.env
BASE="/srv/malmoi/backups/database"
mkdir -p "$BASE"/{daily,weekly,monthly}

DAY=$(date +%F)
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# 일일 백업
pg_dump -U malmoi_admin -h 127.0.0.1 -Fc -f "$BASE/daily/${DAY}.sqlc" malmoi_system
gzip -f "$BASE/daily/${DAY}.sqlc"

# 주간 백업 (일요일)
if [ "$(date +%u)" -eq 7 ]; then
    cp "$BASE/daily/${DAY}.sqlc.gz" "$BASE/weekly/week_${DAY}.sqlc.gz"
fi

# 월간 백업 (매월 1일)
if [ "$(date +%d)" -eq 01 ]; then
    cp "$BASE/daily/${DAY}.sqlc.gz" "$BASE/monthly/month_$(date +%Y%m).sqlc.gz"
fi

# 보관 정책: 일일 30일, 주간 12주, 월간 12개월
find "$BASE/daily" -type f -mtime +30 -delete
find "$BASE/weekly" -type f -mtime +84 -delete
find "$BASE/monthly" -type f -mtime +365 -delete

echo "[$(date +'%Y-%m-%d %H:%M:%S')] DB 백업 완료: $BASE/daily/${DAY}.sqlc.gz"
BK

sudo chmod +x /usr/local/bin/backup-database.sh
echo "✅ DB 백업 스크립트 생성됨"

# 2. 파일 백업 스크립트
echo "📝 파일 백업 스크립트 생성 중..."
sudo tee /usr/local/bin/backup-files.sh >/dev/null <<'FK'
#!/usr/bin/env bash
set -euo pipefail

source /etc/malmoi/booking.env
BASE="/srv/malmoi/backups/files"
mkdir -p "$BASE"

export MINIO_ROOT_USER="$OBJECT_STORAGE_ACCESS_KEY"
export MINIO_ROOT_PASSWORD="$OBJECT_STORAGE_SECRET_KEY"

mc alias set local "$OBJECT_STORAGE_ENDPOINT" "$OBJECT_STORAGE_ACCESS_KEY" "$OBJECT_STORAGE_SECRET_KEY" 2>/dev/null || true
mc mirror --overwrite local/${OBJECT_STORAGE_BUCKET} "$BASE" || true

echo "[$(date +'%Y-%m-%d %H:%M:%S')] 파일 백업 완료: $BASE"
FK

sudo chmod +x /usr/local/bin/backup-files.sh
echo "✅ 파일 백업 스크립트 생성됨"

# 3. 복원 리허설 스크립트 (월 1회)
echo "📝 복원 리허설 스크립트 생성 중..."
sudo tee /usr/local/bin/backup-restore-test.sh >/dev/null <<'RT'
#!/usr/bin/env bash
set -euo pipefail

# 월 1일만 실행
if [ "$(date +%d)" -ne 01 ]; then
    exit 0
fi

BASE="/srv/malmoi/backups/database/monthly"
LATEST=$(ls -t "$BASE"/*.sqlc.gz 2>/dev/null | head -1)

if [ -z "$LATEST" ]; then
    echo "백업 파일 없음"
    exit 0
fi

# 임시 DB로 복원 테스트
TEMP_DB="malmoi_system_test_$(date +%Y%m%d)"
sudo -u postgres createdb "$TEMP_DB" 2>/dev/null || true

gunzip -c "$LATEST" | pg_restore -U malmoi_admin -h 127.0.0.1 -d "$TEMP_DB" --no-owner --no-acl || true

# 테스트 후 삭제
sudo -u postgres dropdb "$TEMP_DB" 2>/dev/null || true

echo "[$(date +'%Y-%m-%d %H:%M:%S')] 복원 리허설 완료"
RT

sudo chmod +x /usr/local/bin/backup-restore-test.sh
echo "✅ 복원 리허설 스크립트 생성됨"

# 4. Cron 등록
echo "⏰ Cron 작업 등록 중..."
(crontab -l 2>/dev/null | grep -v "backup-database.sh" | grep -v "backup-files.sh" | grep -v "backup-restore-test.sh"; \
 echo "0 2 * * * /usr/local/bin/backup-database.sh >> /srv/malmoi/backups/logs/db-backup.log 2>&1"; \
 echo "30 2 * * * /usr/local/bin/backup-files.sh >> /srv/malmoi/backups/logs/files-backup.log 2>&1"; \
 echo "0 3 1 * * /usr/local/bin/backup-restore-test.sh >> /srv/malmoi/backups/logs/restore-test.log 2>&1") | crontab -

mkdir -p /srv/malmoi/backups/logs
sudo chown -R malmoi:malmoi /srv/malmoi/backups

echo "✅ 백업 자동화 설정 완료"
echo "  - DB 백업: 매일 02:00"
echo "  - 파일 백업: 매일 02:30"
echo "  - 복원 테스트: 매월 1일 03:00"


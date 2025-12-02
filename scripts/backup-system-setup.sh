#!/bin/bash

# ========================================
# DXP2800 백업 시스템 및 모니터링 설정
# 정기 백업, SMART 모니터링, 알림 시스템
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

main() {
    log "🚀 백업 시스템 및 모니터링 설정 시작..."
    
    # ========================================
    # 1. 필수 패키지 설치
    # ========================================
    log "📦 필수 패키지 설치..."
    
    sudo apt update
    sudo apt install -y \
        smartmontools \
        rsync \
        gzip \
        tar \
        cron \
        mailutils \
        hddtemp \
        lm-sensors \
        htop \
        iotop \
        ncdu
    
    log "✅ 필수 패키지 설치 완료"
    
    # ========================================
    # 2. 백업 디렉토리 구조 생성
    # ========================================
    log "📁 백업 디렉토리 구조 생성..."
    
    # 백업 디렉토리 생성
    sudo mkdir -p /mnt/malmoi-storage/backups/{daily,weekly,monthly,external}
    sudo mkdir -p /mnt/malmoi-storage/backups/{database,files,config,logs}
    sudo mkdir -p /mnt/malmoi-storage/backups/external/usb
    sudo mkdir -p /mnt/malmoi-storage/backups/external/cloud
    
    # 권한 설정
    sudo chown -R admin:admin /mnt/malmoi-storage/backups
    sudo chmod -R 755 /mnt/malmoi-storage/backups
    
    log "✅ 백업 디렉토리 구조 생성 완료"
    
    # ========================================
    # 3. 데이터베이스 백업 스크립트
    # ========================================
    log "🗄️ 데이터베이스 백업 스크립트 생성..."
    
    cat << 'EOF' > /home/admin/db-backup.sh
#!/bin/bash

# 데이터베이스 백업 스크립트

set -e

BACKUP_DIR="/mnt/malmoi-storage/backups/database"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE=$(date +%Y-%m-%d)

# 로그 함수
log() {
    echo "$(date +'%Y-%m-%d %H:%M:%S'): $1" | tee -a /var/log/malmoi-backup.log
}

log "데이터베이스 백업 시작..."

# PostgreSQL 백업
if systemctl is-active --quiet postgresql || docker ps | grep -q malmoi-db; then
    # 전체 데이터베이스 백업
    if [ -n "$(docker ps -q -f name=malmoi-db)" ]; then
        # Docker 환경
        docker exec malmoi-db pg_dump -U malmoi_admin malmoi_system > "$BACKUP_DIR/malmoi_db_$TIMESTAMP.sql"
    else
        # 직접 설치 환경
        sudo -u postgres pg_dump malmoi_system > "$BACKUP_DIR/malmoi_db_$TIMESTAMP.sql"
    fi
    
    # 압축
    gzip "$BACKUP_DIR/malmoi_db_$TIMESTAMP.sql"
    
    log "데이터베이스 백업 완료: malmoi_db_$TIMESTAMP.sql.gz"
    
    # 백업 크기 확인
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/malmoi_db_$TIMESTAMP.sql.gz" | cut -f1)
    log "백업 파일 크기: $BACKUP_SIZE"
    
    # 심볼릭 링크 생성 (최신 백업)
    ln -sf "malmoi_db_$TIMESTAMP.sql.gz" "$BACKUP_DIR/latest.sql.gz"
    
else
    log "ERROR: PostgreSQL 서비스가 실행 중이지 않습니다."
    exit 1
fi

# 백업 파일 정리 (30일 이상 된 파일 삭제)
find "$BACKUP_DIR" -name "malmoi_db_*.sql.gz" -mtime +30 -delete
log "오래된 백업 파일 정리 완료"

log "데이터베이스 백업 작업 완료"
EOF
    
    chmod +x /home/admin/db-backup.sh
    
    # ========================================
    # 4. 파일 시스템 백업 스크립트
    # ========================================
    log "📂 파일 시스템 백업 스크립트 생성..."
    
    cat << 'EOF' > /home/admin/files-backup.sh
#!/bin/bash

# 파일 시스템 백업 스크립트

set -e

BACKUP_DIR="/mnt/malmoi-storage/backups/files"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# 로그 함수
log() {
    echo "$(date +'%Y-%m-%d %H:%M:%S'): $1" | tee -a /var/log/malmoi-backup.log
}

log "파일 시스템 백업 시작..."

# 애플리케이션 파일 백업
log "애플리케이션 파일 백업 중..."
tar -czf "$BACKUP_DIR/app_files_$TIMESTAMP.tar.gz" \
    -C /mnt/malmoi-storage/app \
    uploads static 2>/dev/null || true

# 설정 파일 백업
log "설정 파일 백업 중..."
tar -czf "$BACKUP_DIR/config_files_$TIMESTAMP.tar.gz" \
    -C /home/admin/malmoi-system \
    .env docker-compose.yml nginx/ scripts/ 2>/dev/null || true

# Docker 볼륨 백업 (Docker 환경인 경우)
if command -v docker-compose &> /dev/null; then
    log "Docker 볼륨 백업 중..."
    docker run --rm \
        -v malmoi_malmoi-data:/data \
        -v "$BACKUP_DIR":/backup \
        alpine tar -czf "/backup/docker_volumes_$TIMESTAMP.tar.gz" -C /data . 2>/dev/null || true
fi

# 시스템 설정 백업
log "시스템 설정 백업 중..."
tar -czf "$BACKUP_DIR/system_config_$TIMESTAMP.tar.gz" \
    /etc/nginx/ \
    /etc/postgresql/ \
    /etc/systemd/system/malmoi* \
    /etc/ddclient* \
    /etc/crontab \
    /var/spool/cron/crontabs/admin \
    2>/dev/null || true

# 백업 완료 로그
for file in "$BACKUP_DIR"/*_"$TIMESTAMP".tar.gz; do
    if [ -f "$file" ]; then
        SIZE=$(du -h "$file" | cut -f1)
        log "백업 완료: $(basename "$file") ($SIZE)"
    fi
done

# 백업 파일 정리 (14일 이상 된 파일 삭제)
find "$BACKUP_DIR" -name "*_*.tar.gz" -mtime +14 -delete
log "오래된 백업 파일 정리 완료"

log "파일 시스템 백업 작업 완료"
EOF
    
    chmod +x /home/admin/files-backup.sh
    
    # ========================================
    # 5. 전체 백업 스크립트
    # ========================================
    log "📦 전체 백업 스크립트 생성..."
    
    cat << 'EOF' > /home/admin/full-backup.sh
#!/bin/bash

# 전체 백업 스크립트 (일일/주간/월간)

BACKUP_TYPE=$1  # daily, weekly, monthly
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# 로그 함수
log() {
    echo "$(date +'%Y-%m-%d %H:%M:%S'): $1" | tee -a /var/log/malmoi-backup.log
}

if [ -z "$BACKUP_TYPE" ]; then
    BACKUP_TYPE="daily"
fi

log "전체 백업 시작 (타입: $BACKUP_TYPE)"

# 백업 전 디스크 사용량 확인
DISK_USAGE=$(df /mnt/malmoi-storage | tail -1 | awk '{print $5}' | sed 's/%//')
log "현재 디스크 사용량: ${DISK_USAGE}%"

if [ "$DISK_USAGE" -gt 85 ]; then
    log "WARNING: 디스크 사용량이 85%를 초과했습니다!"
fi

# 데이터베이스 백업
log "데이터베이스 백업 실행..."
/home/admin/db-backup.sh

# 파일 백업
log "파일 시스템 백업 실행..."
/home/admin/files-backup.sh

# 백업 타입별 추가 작업
case "$BACKUP_TYPE" in
    "weekly")
        log "주간 백업 - 로그 아카이브..."
        tar -czf "/mnt/malmoi-storage/backups/weekly/logs_$TIMESTAMP.tar.gz" \
            /mnt/malmoi-storage/logs/ 2>/dev/null || true
        ;;
    "monthly")
        log "월간 백업 - 전체 시스템 백업..."
        tar -czf "/mnt/malmoi-storage/backups/monthly/full_system_$TIMESTAMP.tar.gz" \
            --exclude=/proc \
            --exclude=/sys \
            --exclude=/dev \
            --exclude=/tmp \
            --exclude=/mnt/malmoi-storage/backups \
            / 2>/dev/null || true
        ;;
esac

# 백업 완료 후 디스크 사용량 재확인
DISK_USAGE_AFTER=$(df /mnt/malmoi-storage | tail -1 | awk '{print $5}' | sed 's/%//')
log "백업 후 디스크 사용량: ${DISK_USAGE_AFTER}%"

# 백업 인덱스 업데이트
echo "$TIMESTAMP,$BACKUP_TYPE,$(du -sh /mnt/malmoi-storage/backups | cut -f1)" >> /mnt/malmoi-storage/backups/backup_index.log

log "전체 백업 완료 (타입: $BACKUP_TYPE)"
EOF
    
    chmod +x /home/admin/full-backup.sh
    
    # ========================================
    # 6. SMART 모니터링 설정
    # ========================================
    log "💾 SMART 모니터링 설정..."
    
    # smartd 설정
    sudo bash -c 'cat << EOF > /etc/smartd.conf
# MalMoi SMART 모니터링 설정

# 모든 디스크 모니터링
DEVICESCAN -a -o on -S on -s (S/../.././02|L/../../6/03) -m admin@localhost

# 특정 디스크 설정 (필요시 수정)
# /dev/sda -a -o on -S on -s (S/../.././02|L/../../6/03) -m admin@localhost
EOF'
    
    # smartd 서비스 활성화
    sudo systemctl enable smartd
    sudo systemctl restart smartd
    
    log "✅ SMART 모니터링 설정 완료"
    
    # ========================================
    # 7. 시스템 모니터링 스크립트
    # ========================================
    log "📊 시스템 모니터링 스크립트 생성..."
    
    cat << 'EOF' > /home/admin/system-monitor.sh
#!/bin/bash

# 시스템 모니터링 스크립트

LOG_FILE="/var/log/system-monitor.log"
TIMESTAMP=$(date +'%Y-%m-%d %H:%M:%S')

# 로그 함수
log() {
    echo "$TIMESTAMP: $1" >> "$LOG_FILE"
}

# CPU 사용률
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')

# 메모리 사용률
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.1f", $3/$2 * 100.0)}')

# 디스크 사용률
DISK_USAGE=$(df /mnt/malmoi-storage | tail -1 | awk '{print $5}' | sed 's/%//')

# 온도 확인 (가능한 경우)
if command -v sensors &> /dev/null; then
    CPU_TEMP=$(sensors | grep -i "core 0" | awk '{print $3}' | sed 's/+//' | sed 's/°C//' || echo "N/A")
else
    CPU_TEMP="N/A"
fi

# HDD 온도 확인
if command -v hddtemp &> /dev/null; then
    HDD_TEMP=$(sudo hddtemp /dev/sda 2>/dev/null | awk -F: '{print $3}' | sed 's/°C//' | tr -d ' ' || echo "N/A")
else
    HDD_TEMP="N/A"
fi

# 서비스 상태 확인
if systemctl is-active --quiet postgresql || docker ps | grep -q malmoi-db; then
    DB_STATUS="OK"
else
    DB_STATUS="FAIL"
fi

if curl -s --max-time 5 http://localhost:3000/api/health > /dev/null; then
    APP_STATUS="OK"
else
    APP_STATUS="FAIL"
fi

# 로그 기록
log "CPU:${CPU_USAGE}%,MEM:${MEMORY_USAGE}%,DISK:${DISK_USAGE}%,CPU_TEMP:${CPU_TEMP},HDD_TEMP:${HDD_TEMP},DB:${DB_STATUS},APP:${APP_STATUS}"

# 경고 임계값 확인
ALERT_LOG="/var/log/system-alerts.log"

if (( $(echo "$CPU_USAGE > 80" | bc -l) )); then
    echo "$TIMESTAMP: HIGH CPU USAGE: ${CPU_USAGE}%" >> "$ALERT_LOG"
fi

if (( $(echo "$MEMORY_USAGE > 85" | bc -l) )); then
    echo "$TIMESTAMP: HIGH MEMORY USAGE: ${MEMORY_USAGE}%" >> "$ALERT_LOG"
fi

if [ "$DISK_USAGE" -gt 90 ]; then
    echo "$TIMESTAMP: HIGH DISK USAGE: ${DISK_USAGE}%" >> "$ALERT_LOG"
fi

if [ "$DB_STATUS" = "FAIL" ] || [ "$APP_STATUS" = "FAIL" ]; then
    echo "$TIMESTAMP: SERVICE FAILURE - DB:$DB_STATUS, APP:$APP_STATUS" >> "$ALERT_LOG"
fi

# SMART 상태 확인
if command -v smartctl &> /dev/null; then
    SMART_STATUS=$(sudo smartctl -H /dev/sda 2>/dev/null | grep "SMART overall-health" | awk '{print $6}' || echo "UNKNOWN")
    if [ "$SMART_STATUS" != "PASSED" ]; then
        echo "$TIMESTAMP: SMART STATUS ALERT: $SMART_STATUS" >> "$ALERT_LOG"
    fi
fi

# 일주일 이상 된 로그 정리
find /var/log -name "system-monitor.log" -mtime +7 -delete 2>/dev/null || true
find /var/log -name "system-alerts.log" -mtime +30 -delete 2>/dev/null || true
EOF
    
    chmod +x /home/admin/system-monitor.sh
    
    # ========================================
    # 8. 외부 백업 스크립트 (USB/클라우드)
    # ========================================
    log "💾 외부 백업 스크립트 생성..."
    
    cat << 'EOF' > /home/admin/external-backup.sh
#!/bin/bash

# 외부 백업 스크립트 (USB/클라우드)

BACKUP_TYPE=$1  # usb, cloud
USB_MOUNT_POINT="/mnt/usb-backup"
BACKUP_SOURCE="/mnt/malmoi-storage/backups"

log() {
    echo "$(date +'%Y-%m-%d %H:%M:%S'): $1" | tee -a /var/log/external-backup.log
}

case "$BACKUP_TYPE" in
    "usb")
        log "USB 백업 시작..."
        
        # USB 디스크 자동 감지
        USB_DEVICE=$(lsblk -o NAME,FSTYPE,SIZE,MOUNTPOINT | grep -E "(ext4|ntfs|fat32)" | grep -v "/" | head -1 | awk '{print "/dev/"$1}')
        
        if [ -z "$USB_DEVICE" ]; then
            log "ERROR: USB 디스크를 찾을 수 없습니다."
            exit 1
        fi
        
        log "USB 디스크 발견: $USB_DEVICE"
        
        # USB 마운트
        sudo mkdir -p "$USB_MOUNT_POINT"
        sudo mount "$USB_DEVICE" "$USB_MOUNT_POINT" 2>/dev/null || {
            log "ERROR: USB 디스크 마운트 실패"
            exit 1
        }
        
        # 백업 실행
        log "USB로 백업 복사 중..."
        rsync -av --delete "$BACKUP_SOURCE/" "$USB_MOUNT_POINT/malmoi-backups/"
        
        # 안전하게 언마운트
        sudo umount "$USB_MOUNT_POINT"
        log "USB 백업 완료"
        ;;
        
    "cloud")
        log "클라우드 백업 시작..."
        
        # rclone이 설치된 경우 (사용자가 설정)
        if command -v rclone &> /dev/null; then
            log "rclone으로 클라우드 백업 중..."
            rclone sync "$BACKUP_SOURCE" remote:malmoi-backups/ --progress
            log "클라우드 백업 완료"
        else
            log "WARNING: rclone이 설치되지 않음. 클라우드 백업 건너뜀."
        fi
        ;;
        
    *)
        echo "사용법: $0 {usb|cloud}"
        echo "예시:"
        echo "  USB 백업: $0 usb"
        echo "  클라우드 백업: $0 cloud"
        exit 1
        ;;
esac
EOF
    
    chmod +x /home/admin/external-backup.sh
    
    # ========================================
    # 9. cron 작업 설정
    # ========================================
    log "⏰ cron 작업 설정..."
    
    # 기존 malmoi 관련 cron 작업 제거
    (crontab -l 2>/dev/null | grep -v malmoi | grep -v ddns | grep -v backup) | crontab -
    
    # 새 cron 작업 추가
    (crontab -l 2>/dev/null; cat << 'EOF'
# MalMoi 백업 및 모니터링 작업

# 시스템 모니터링 (5분마다)
*/5 * * * * /home/admin/system-monitor.sh

# DDNS 업데이트 (5분마다)
*/5 * * * * /home/admin/ddns-update.sh

# 네트워크 모니터링 (10분마다)
*/10 * * * * /home/admin/network-monitor.sh

# 일일 백업 (매일 새벽 2시)
0 2 * * * /home/admin/full-backup.sh daily

# 주간 백업 (매주 일요일 새벽 3시)
0 3 * * 0 /home/admin/full-backup.sh weekly

# 월간 백업 (매월 1일 새벽 4시)
0 4 1 * * /home/admin/full-backup.sh monthly

# USB 백업 (매주 토요일 새벽 5시, USB 연결 시)
0 5 * * 6 /home/admin/external-backup.sh usb

# 디스크 사용량 모니터링 (1시간마다)
0 * * * * /usr/local/bin/malmoi-disk-monitor.sh

EOF
) | crontab -
    
    log "✅ cron 작업 설정 완료"
    
    # ========================================
    # 10. 백업 복원 스크립트
    # ========================================
    log "🔄 백업 복원 스크립트 생성..."
    
    cat << 'EOF' > /home/admin/restore-backup.sh
#!/bin/bash

# 백업 복원 스크립트

BACKUP_TYPE=$1  # database, files, full
BACKUP_FILE=$2

log() {
    echo "$(date +'%Y-%m-%d %H:%M:%S'): $1"
}

if [ -z "$BACKUP_TYPE" ] || [ -z "$BACKUP_FILE" ]; then
    echo "사용법: $0 {database|files|full} <백업파일>"
    echo
    echo "예시:"
    echo "  데이터베이스 복원: $0 database /mnt/malmoi-storage/backups/database/malmoi_db_20240101_120000.sql.gz"
    echo "  파일 복원: $0 files /mnt/malmoi-storage/backups/files/app_files_20240101_120000.tar.gz"
    echo
    echo "사용 가능한 백업 파일:"
    echo "=== 데이터베이스 백업 ==="
    ls -la /mnt/malmoi-storage/backups/database/*.sql.gz 2>/dev/null | tail -5
    echo
    echo "=== 파일 백업 ==="
    ls -la /mnt/malmoi-storage/backups/files/*.tar.gz 2>/dev/null | tail -5
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    log "ERROR: 백업 파일을 찾을 수 없습니다: $BACKUP_FILE"
    exit 1
fi

log "백업 복원 시작: $BACKUP_TYPE ($BACKUP_FILE)"

# 확인 메시지
read -p "정말로 복원하시겠습니까? 기존 데이터가 덮어쓰여집니다. (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log "복원이 취소되었습니다."
    exit 0
fi

case "$BACKUP_TYPE" in
    "database")
        log "데이터베이스 복원 중..."
        
        # 서비스 중지
        if [ -n "$(docker ps -q -f name=malmoi-app)" ]; then
            docker-compose stop malmoi-app
        fi
        
        # 압축 해제 및 복원
        if [[ "$BACKUP_FILE" == *.gz ]]; then
            gunzip -c "$BACKUP_FILE" | sudo -u postgres psql malmoi_system
        else
            sudo -u postgres psql malmoi_system < "$BACKUP_FILE"
        fi
        
        # 서비스 재시작
        if command -v docker-compose &> /dev/null; then
            docker-compose start malmoi-app
        fi
        
        log "데이터베이스 복원 완료"
        ;;
        
    "files")
        log "파일 복원 중..."
        
        # 백업 생성
        CURRENT_BACKUP="/tmp/current_files_$(date +%Y%m%d_%H%M%S).tar.gz"
        tar -czf "$CURRENT_BACKUP" -C /mnt/malmoi-storage/app . 2>/dev/null || true
        log "현재 파일 백업 생성: $CURRENT_BACKUP"
        
        # 파일 복원
        if [[ "$BACKUP_FILE" == *app_files* ]]; then
            tar -xzf "$BACKUP_FILE" -C /mnt/malmoi-storage/app/
        elif [[ "$BACKUP_FILE" == *config_files* ]]; then
            tar -xzf "$BACKUP_FILE" -C /home/admin/malmoi-system/
        fi
        
        log "파일 복원 완료"
        ;;
        
    "full")
        log "전체 시스템 복원 중..."
        log "WARNING: 이 작업은 시간이 오래 걸릴 수 있습니다."
        
        # 전체 백업 복원
        tar -xzf "$BACKUP_FILE" -C /
        
        log "전체 시스템 복원 완료"
        log "시스템을 재시작하는 것을 권장합니다."
        ;;
        
    *)
        log "ERROR: 알 수 없는 백업 타입: $BACKUP_TYPE"
        exit 1
        ;;
esac

log "복원 작업 완료"
EOF
    
    chmod +x /home/admin/restore-backup.sh
    
    # ========================================
    # 11. 백업 관리 대시보드 스크립트
    # ========================================
    log "📈 백업 관리 대시보드 생성..."
    
    cat << 'EOF' > /home/admin/backup-dashboard.sh
#!/bin/bash

# 백업 관리 대시보드

echo "========================================="
echo "MalMoi 백업 관리 대시보드"
echo "========================================="
echo

# 시스템 상태
echo "=== 시스템 상태 ==="
echo "현재 시간: $(date)"
echo "업타임: $(uptime -p)"
echo "디스크 사용량: $(df -h /mnt/malmoi-storage | tail -1 | awk '{print $5}')"
echo "메모리 사용량: $(free -h | grep Mem | awk '{printf("%.1f%%", $3/$2 * 100.0)}')"
echo

# 백업 상태
echo "=== 백업 상태 ==="
echo "백업 디렉토리 크기: $(du -sh /mnt/malmoi-storage/backups | cut -f1)"
echo

echo "최근 데이터베이스 백업:"
ls -la /mnt/malmoi-storage/backups/database/*.sql.gz 2>/dev/null | tail -3 | awk '{print "  " $9 " (" $5 " bytes) - " $6 " " $7 " " $8}'

echo
echo "최근 파일 백업:"
ls -la /mnt/malmoi-storage/backups/files/*.tar.gz 2>/dev/null | tail -3 | awk '{print "  " $9 " (" $5 " bytes) - " $6 " " $7 " " $8}'

echo

# 서비스 상태
echo "=== 서비스 상태 ==="
if systemctl is-active --quiet postgresql || docker ps | grep -q malmoi-db; then
    echo "데이터베이스: ✅ 실행 중"
else
    echo "데이터베이스: ❌ 중지됨"
fi

if curl -s --max-time 5 http://localhost:3000/api/health > /dev/null; then
    echo "애플리케이션: ✅ 실행 중"
else
    echo "애플리케이션: ❌ 중지됨"
fi

if systemctl is-active --quiet smartd; then
    echo "SMART 모니터링: ✅ 실행 중"
else
    echo "SMART 모니터링: ❌ 중지됨"
fi

echo

# SMART 상태
echo "=== 디스크 상태 ==="
if command -v smartctl &> /dev/null; then
    SMART_STATUS=$(sudo smartctl -H /dev/sda 2>/dev/null | grep "SMART overall-health" | awk '{print $6}' || echo "UNKNOWN")
    echo "SMART 상태: $SMART_STATUS"
    
    if command -v hddtemp &> /dev/null; then
        HDD_TEMP=$(sudo hddtemp /dev/sda 2>/dev/null | awk -F: '{print $3}' || echo " 확인 불가")
        echo "HDD 온도:$HDD_TEMP"
    fi
else
    echo "SMART 도구가 설치되지 않음"
fi

echo

# 최근 경고
echo "=== 최근 경고 ==="
if [ -f /var/log/system-alerts.log ]; then
    tail -5 /var/log/system-alerts.log | while read line; do
        echo "  $line"
    done
else
    echo "경고 없음"
fi

echo
echo "========================================="
echo "관리 명령어:"
echo "  수동 백업: /home/admin/full-backup.sh daily"
echo "  복원: /home/admin/restore-backup.sh"
echo "  외부 백업: /home/admin/external-backup.sh usb"
echo "  시스템 모니터링: /home/admin/system-monitor.sh"
echo "========================================="
EOF
    
    chmod +x /home/admin/backup-dashboard.sh
    
    # ========================================
    # 12. 설정 완료 정보 출력
    # ========================================
    log "🎉 백업 시스템 및 모니터링 설정 완료!"
    
    echo
    echo "=== 백업 스크립트 ==="
    echo "데이터베이스 백업: /home/admin/db-backup.sh"
    echo "파일 백업: /home/admin/files-backup.sh"
    echo "전체 백업: /home/admin/full-backup.sh {daily|weekly|monthly}"
    echo "외부 백업: /home/admin/external-backup.sh {usb|cloud}"
    echo "백업 복원: /home/admin/restore-backup.sh"
    echo "백업 대시보드: /home/admin/backup-dashboard.sh"
    echo
    
    echo "=== 모니터링 스크립트 ==="
    echo "시스템 모니터링: /home/admin/system-monitor.sh"
    echo "네트워크 모니터링: /home/admin/network-monitor.sh"
    echo "디스크 모니터링: /usr/local/bin/malmoi-disk-monitor.sh"
    echo
    
    echo "=== 백업 일정 ==="
    echo "일일 백업: 매일 02:00"
    echo "주간 백업: 매주 일요일 03:00"
    echo "월간 백업: 매월 1일 04:00"
    echo "USB 백업: 매주 토요일 05:00"
    echo
    
    echo "=== 모니터링 일정 ==="
    echo "시스템 모니터링: 5분마다"
    echo "네트워크 모니터링: 10분마다"
    echo "디스크 모니터링: 1시간마다"
    echo
    
    echo "=== 로그 위치 ==="
    echo "백업 로그: /var/log/malmoi-backup.log"
    echo "시스템 모니터링: /var/log/system-monitor.log"
    echo "시스템 경고: /var/log/system-alerts.log"
    echo "외부 백업: /var/log/external-backup.log"
    echo
    
    echo "=== cron 작업 확인 ==="
    echo "crontab -l"
    echo
    
    log "📊 백업 대시보드를 실행하여 상태를 확인하세요:"
    log "/home/admin/backup-dashboard.sh"
}

main "$@"
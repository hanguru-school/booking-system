#!/bin/bash

# ========================================
# DXP2800 스토리지 세팅 스크립트
# 2TB 5400rpm SATA HDD, 단일 디스크 모드, ext4
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

# 사용자 확인 함수
confirm() {
    read -p "$1 (y/N): " -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]]
}

main() {
    log "🚀 DXP2800 스토리지 세팅 시작..."
    
    # ========================================
    # 1. 현재 디스크 상태 확인
    # ========================================
    log "💾 현재 디스크 상태 확인..."
    echo "=== 디스크 목록 ==="
    lsblk -o NAME,SIZE,TYPE,MOUNTPOINT,FSTYPE
    echo
    echo "=== 사용 가능한 디스크 ==="
    sudo fdisk -l | grep "Disk /dev/"
    echo
    
    # ========================================
    # 2. 대상 디스크 선택
    # ========================================
    read -p "스토리지로 사용할 디스크 경로를 입력하세요 (예: /dev/sdb): " DISK_PATH
    
    if [ ! -b "$DISK_PATH" ]; then
        error "디스크 $DISK_PATH를 찾을 수 없습니다."
        exit 1
    fi
    
    log "선택된 디스크: $DISK_PATH"
    
    # 디스크 정보 표시
    echo "=== 디스크 정보 ==="
    sudo fdisk -l "$DISK_PATH"
    echo
    
    warning "⚠️  이 작업은 $DISK_PATH의 모든 데이터를 삭제합니다!"
    if ! confirm "계속하시겠습니까?"; then
        log "작업이 취소되었습니다."
        exit 0
    fi
    
    # ========================================
    # 3. 파티션 생성
    # ========================================
    log "📦 파티션 생성 중..."
    
    # 기존 파티션 삭제 및 새 파티션 생성
    sudo parted "$DISK_PATH" --script mklabel gpt
    sudo parted "$DISK_PATH" --script mkpart primary ext4 1MiB 100%
    
    # 파티션 경로 설정
    PARTITION="${DISK_PATH}1"
    
    log "생성된 파티션: $PARTITION"
    
    # ========================================
    # 4. ext4 파일시스템 포맷
    # ========================================
    log "🔧 ext4 파일시스템으로 포맷 중..."
    sudo mkfs.ext4 -F "$PARTITION"
    
    # ========================================
    # 5. 마운트 포인트 생성
    # ========================================
    log "📁 마운트 포인트 생성..."
    sudo mkdir -p /mnt/malmoi-storage
    sudo mkdir -p /mnt/malmoi-storage/data
    sudo mkdir -p /mnt/malmoi-storage/backups
    sudo mkdir -p /mnt/malmoi-storage/logs
    
    # ========================================
    # 6. 디스크 마운트
    # ========================================
    log "🔗 디스크 마운트 중..."
    sudo mount "$PARTITION" /mnt/malmoi-storage
    
    # UUID 확인
    UUID=$(sudo blkid -s UUID -o value "$PARTITION")
    log "디스크 UUID: $UUID"
    
    # ========================================
    # 7. fstab 설정 (부팅 시 자동 마운트)
    # ========================================
    log "⚙️ fstab 설정 중..."
    
    # 기존 설정 백업
    sudo cp /etc/fstab /etc/fstab.backup.$(date +%Y%m%d_%H%M%S)
    
    # fstab에 추가
    echo "UUID=$UUID /mnt/malmoi-storage ext4 defaults,noatime 0 2" | sudo tee -a /etc/fstab
    
    # ========================================
    # 8. 디렉토리 구조 생성
    # ========================================
    log "📂 디렉토리 구조 생성..."
    
    # 애플리케이션 데이터 디렉토리
    sudo mkdir -p /mnt/malmoi-storage/app
    sudo mkdir -p /mnt/malmoi-storage/app/uploads
    sudo mkdir -p /mnt/malmoi-storage/app/static
    
    # 데이터베이스 디렉토리
    sudo mkdir -p /mnt/malmoi-storage/database
    sudo mkdir -p /mnt/malmoi-storage/database/postgresql
    sudo mkdir -p /mnt/malmoi-storage/database/backups
    
    # 로그 디렉토리
    sudo mkdir -p /mnt/malmoi-storage/logs/app
    sudo mkdir -p /mnt/malmoi-storage/logs/system
    sudo mkdir -p /mnt/malmoi-storage/logs/postgresql
    
    # 백업 디렉토리
    sudo mkdir -p /mnt/malmoi-storage/backups/daily
    sudo mkdir -p /mnt/malmoi-storage/backups/weekly
    sudo mkdir -p /mnt/malmoi-storage/backups/monthly
    
    # ========================================
    # 9. 권한 설정
    # ========================================
    log "🔐 권한 설정..."
    
    # admin 사용자 생성 (없을 경우)
    if ! id "admin" &>/dev/null; then
        sudo useradd -m -s /bin/bash admin
        sudo usermod -aG sudo admin
        echo "admin:admin123" | sudo chpasswd
        log "관리자 계정 생성 완료"
    fi
    
    # 디렉토리 소유권 설정
    sudo chown -R admin:admin /mnt/malmoi-storage/app
    sudo chown -R admin:admin /mnt/malmoi-storage/logs/app
    sudo chown -R admin:admin /mnt/malmoi-storage/backups
    
    # PostgreSQL 데이터 디렉토리는 postgres 사용자 소유로 설정 (나중에)
    sudo chmod 755 /mnt/malmoi-storage/database
    
    # ========================================
    # 10. 심볼릭 링크 생성
    # ========================================
    log "🔗 심볼릭 링크 생성..."
    
    # 표준 경로에 심볼릭 링크 생성
    sudo ln -sf /mnt/malmoi-storage /opt/malmoi
    sudo ln -sf /mnt/malmoi-storage/app /home/admin/malmoi-app
    sudo ln -sf /mnt/malmoi-storage/database /home/admin/malmoi-db
    sudo ln -sf /mnt/malmoi-storage/backups /home/admin/malmoi-backups
    
    # ========================================
    # 11. 모니터링 스크립트 생성
    # ========================================
    log "📊 모니터링 스크립트 생성..."
    
    cat << 'EOF' | sudo tee /usr/local/bin/malmoi-disk-monitor.sh > /dev/null
#!/bin/bash
# DXP2800 디스크 모니터링 스크립트

STORAGE_PATH="/mnt/malmoi-storage"
THRESHOLD=90  # 사용률 90% 이상 시 경고

# 디스크 사용률 확인
USAGE=$(df "$STORAGE_PATH" | awk 'NR==2 {print $5}' | sed 's/%//')

if [ "$USAGE" -gt "$THRESHOLD" ]; then
    echo "$(date): WARNING - 디스크 사용률이 ${USAGE}%입니다!" | tee -a /var/log/malmoi-storage.log
    
    # 로그 파일에 기록
    echo "$(date): 디스크 상태:" >> /var/log/malmoi-storage.log
    df -h "$STORAGE_PATH" >> /var/log/malmoi-storage.log
fi

# SMART 상태 확인 (smartmontools 설치 후 사용)
if command -v smartctl &> /dev/null; then
    SMART_STATUS=$(sudo smartctl -H /dev/sdb | grep "SMART overall-health" | awk '{print $6}')
    if [ "$SMART_STATUS" != "PASSED" ]; then
        echo "$(date): ERROR - 디스크 SMART 상태 이상: $SMART_STATUS" | tee -a /var/log/malmoi-storage.log
    fi
fi
EOF
    
    sudo chmod +x /usr/local/bin/malmoi-disk-monitor.sh
    
    # cron 작업 추가 (1시간마다 실행)
    (crontab -l 2>/dev/null; echo "0 * * * * /usr/local/bin/malmoi-disk-monitor.sh") | crontab -
    
    # ========================================
    # 12. 설정 완료 확인
    # ========================================
    log "✅ 스토리지 설정 완료 확인..."
    
    echo "=== 마운트 상태 ==="
    df -h /mnt/malmoi-storage
    echo
    
    echo "=== 디렉토리 구조 ==="
    tree /mnt/malmoi-storage -L 3 2>/dev/null || find /mnt/malmoi-storage -type d | head -20
    echo
    
    echo "=== fstab 설정 ==="
    grep malmoi-storage /etc/fstab
    echo
    
    # ========================================
    # 13. 향후 마이그레이션 가이드 생성
    # ========================================
    log "📝 마이그레이션 가이드 생성..."
    
    cat << 'EOF' > /mnt/malmoi-storage/MIGRATION_GUIDE.md
# DXP2800 스토리지 마이그레이션 가이드

## 현재 구성
- 디스크: 2TB 5400rpm SATA HDD
- 파일시스템: ext4
- 마운트 포인트: /mnt/malmoi-storage
- 모드: 단일 디스크 (RAID 미구성)

## NAS 전용 HDD로 교체 시 절차

### 1. 데이터 백업
```bash
# 전체 데이터 백업
sudo rsync -av /mnt/malmoi-storage/ /backup/location/

# 데이터베이스 백업
sudo -u postgres pg_dumpall > /backup/location/full_backup.sql
```

### 2. 새 디스크 설치 및 포맷
```bash
# 새 디스크로 교체 후
sudo /path/to/dxp2800-storage-setup.sh
```

### 3. 데이터 복원
```bash
# 데이터 복원
sudo rsync -av /backup/location/ /mnt/malmoi-storage/

# 데이터베이스 복원
sudo -u postgres psql < /backup/location/full_backup.sql
```

### 권장 NAS 전용 HDD
- Western Digital Red (WD Red)
- Seagate IronWolf
- Toshiba N300

## 모니터링
- 디스크 사용률: `/usr/local/bin/malmoi-disk-monitor.sh`
- 로그 위치: `/var/log/malmoi-storage.log`
- SMART 모니터링: `smartctl -a /dev/sdb`
EOF
    
    log "🎉 DXP2800 스토리지 세팅 완료!"
    log "💾 마운트 포인트: /mnt/malmoi-storage"
    log "🔗 심볼릭 링크: /opt/malmoi"
    log "📊 모니터링: /usr/local/bin/malmoi-disk-monitor.sh"
    log "📝 마이그레이션 가이드: /mnt/malmoi-storage/MIGRATION_GUIDE.md"
}

main "$@"
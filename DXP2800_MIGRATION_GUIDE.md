# 🖥️ DXP2800 NAS 서버 완전 마이그레이션 가이드

## 📋 개요

이 가이드는 MalMoi 한국어 교실 시스템을 Vercel + AWS 환경에서 DXP2800 NAS 서버로 완전히 마이그레이션하는 방법을 설명합니다.

## 🎯 마이그레이션 목표

- **완전한 로컬화**: AWS RDS, S3, Cognito 의존성 제거
- **단일 서버 운영**: DXP2800에서 모든 서비스 통합 운영
- **저비용 운영**: 클라우드 서비스 비용 절약
- **데이터 주권**: 모든 데이터를 로컬에서 직접 관리
- **높은 가용성**: DDNS를 통한 외부 접속 지원

## 🚀 마이그레이션 절차

### 1단계: DXP2800 하드웨어 준비

#### 1.1 스토리지 설정
```bash
# DXP2800 전원 및 기본 설정
# Ubuntu/Debian 계열 OS 설치 완료 후

# 스토리지 설정 스크립트 실행
sudo ./scripts/dxp2800-storage-setup.sh

# 2TB HDD를 ext4로 포맷하고 /mnt/malmoi-storage에 마운트
# 단일 디스크 모드 (RAID 미구성)
```

**주요 디렉토리 구조:**
```
/mnt/malmoi-storage/
├── app/                 # 애플리케이션 데이터
│   ├── uploads/        # 업로드 파일
│   └── static/         # 정적 파일
├── database/           # 데이터베이스 파일
│   ├── postgresql/     # PostgreSQL 데이터
│   ├── redis/          # Redis 데이터
│   └── backups/        # DB 백업
├── logs/               # 로그 파일
│   ├── app/           # 애플리케이션 로그
│   ├── nginx/         # Nginx 로그
│   └── postgresql/    # PostgreSQL 로그
└── backups/           # 시스템 백업
    ├── daily/         # 일일 백업
    ├── weekly/        # 주간 백업
    └── monthly/       # 월간 백업
```

#### 1.2 네트워크 설정
```bash
# 고정 IP 설정 (권장: 192.168.0.50)
sudo nano /etc/netplan/01-malmoi-network.yaml

network:
  version: 2
  renderer: networkd
  ethernets:
    eth0:
      dhcp4: no
      addresses:
        - 192.168.0.50/24
      gateway4: 192.168.0.1
      nameservers:
        addresses: [8.8.8.8, 8.8.4.4]

sudo netplan apply
```

### 2단계: PostgreSQL 로컬 설치

```bash
# PostgreSQL 설치 및 설정
sudo ./scripts/postgresql-setup.sh

# 주요 작업:
# - PostgreSQL 15 설치
# - 데이터 디렉토리를 /mnt/malmoi-storage/database/postgresql로 설정
# - malmoi_admin 사용자 및 malmoi_system 데이터베이스 생성
# - 성능 최적화 설정 적용
```

**PostgreSQL 설정 결과:**
- 호스트: localhost
- 포트: 5432
- 데이터베이스: malmoi_system
- 사용자: malmoi_admin
- 비밀번호: malmoi_admin_password_2024

### 3단계: Docker 환경 구성

```bash
# Docker 및 Docker Compose 설치
sudo ./scripts/docker-setup.sh

# 주요 컨테이너:
# - malmoi-app: Next.js 애플리케이션
# - malmoi-db: PostgreSQL (선택사항, 로컬 설치 선호)
# - malmoi-redis: Redis 캐시
# - malmoi-nginx: 리버스 프록시
```

**Docker Compose 서비스:**
```yaml
# docker-compose.yml
services:
  malmoi-app:    # Next.js 애플리케이션 (포트: 3000)
  malmoi-db:     # PostgreSQL (포트: 5432) - 선택사항
  malmoi-redis:  # Redis (포트: 6379)
  malmoi-nginx:  # Nginx (포트: 80, 443)
```

### 4단계: DDNS 및 네트워크 설정

```bash
# DDNS 및 네트워크 설정
sudo ./scripts/ddns-setup.sh

# 주요 작업:
# - DDNS 클라이언트 (ddclient) 설치
# - No-IP, Duck DNS, Dynu, FreeDNS 설정 파일 생성
# - 방화벽 설정 (포트 22, 80, 443, 3000)
# - 자동 IP 업데이트 스크립트 설정
```

**DDNS 서비스 옵션:**
1. **No-IP** (권장): no-ip.com
2. **Duck DNS**: duckdns.org
3. **Dynu**: dynu.com
4. **FreeDNS**: freedns.afraid.org

**라우터 포트 포워딩 설정:**
```
HTTP:  외부 80 → 내부 192.168.0.50:80
HTTPS: 외부 443 → 내부 192.168.0.50:443
SSH:   외부 2222 → 내부 192.168.0.50:22 (보안)
```

### 5단계: 백업 시스템 설정

```bash
# 백업 시스템 및 모니터링 설정
sudo ./scripts/backup-system-setup.sh

# 주요 기능:
# - 자동 데이터베이스 백업 (일일/주간/월간)
# - 파일 시스템 백업
# - SMART 모니터링
# - 시스템 상태 모니터링
# - 외부 백업 (USB/클라우드)
```

**백업 일정:**
- 일일 백업: 매일 02:00
- 주간 백업: 매주 일요일 03:00
- 월간 백업: 매월 1일 04:00
- USB 백업: 매주 토요일 05:00

### 6단계: AWS 데이터 마이그레이션

```bash
# AWS RDS에서 로컬 PostgreSQL로 데이터 마이그레이션
sudo ./scripts/aws-to-local-migration.sh

# 마이그레이션 과정:
# 1. AWS RDS 연결 및 데이터 백업
# 2. 현재 로컬 데이터 백업 (안전장치)
# 3. 로컬 데이터베이스 초기화
# 4. AWS 데이터 복원
# 5. 권한 재설정
# 6. 데이터 검증
# 7. 환경 변수 업데이트
# 8. 서비스 재시작
```

**환경 변수 변경:**
```bash
# 기존 (AWS 환경)
DATABASE_URL=postgresql://malmoi_admin:password@aws-rds-host:5432/malmoi_system

# 변경 후 (로컬 환경)
DATABASE_URL=postgresql://malmoi_admin:malmoi_admin_password_2024@localhost:5432/malmoi_system
```

### 7단계: 시스템 테스트 및 검증

```bash
# 시스템 전체 테스트
sudo ./scripts/system-test.sh

# 백업 대시보드 확인
/home/admin/backup-dashboard.sh

# 네트워크 상태 확인
/home/admin/network-monitor.sh
```

## 🔧 서비스 관리

### Docker 환경 관리
```bash
# 서비스 시작/중지/재시작
/home/admin/malmoi-docker-manager.sh start
/home/admin/malmoi-docker-manager.sh stop
/home/admin/malmoi-docker-manager.sh restart

# 로그 확인
/home/admin/malmoi-docker-manager.sh logs

# 상태 확인
/home/admin/malmoi-docker-manager.sh status

# 업데이트
/home/admin/malmoi-docker-manager.sh update
```

### 백업 관리
```bash
# 수동 백업
/home/admin/full-backup.sh daily

# USB 백업
/home/admin/external-backup.sh usb

# 클라우드 백업
/home/admin/external-backup.sh cloud

# 백업 복원
/home/admin/restore-backup.sh database /path/to/backup.sql.gz
```

### 모니터링
```bash
# 백업 대시보드
/home/admin/backup-dashboard.sh

# 시스템 모니터링
/home/admin/system-monitor.sh

# 네트워크 모니터링
/home/admin/network-monitor.sh

# DNS 확인
/home/admin/check-dns.sh
```

## 🌐 외부 접속 설정

### DDNS 도메인 설정
1. DDNS 서비스 가입 (No-IP 권장)
2. 도메인 등록 (예: malmoi.ddns.net)
3. ddclient 설정 파일 수정:
```bash
sudo nano /etc/ddclient.conf
# 계정 정보 입력
```

### SSL 인증서 설치
```bash
# Let's Encrypt SSL 인증서 설치
/home/admin/ssl-setup.sh malmoi.ddns.net

# 자동 갱신 설정됨 (crontab)
```

### app.hanguru.school 도메인 연결
```bash
# 도메인 설정 가이드 실행
/home/admin/domain-setup.sh

# DNS A 레코드 설정:
# Type: A
# Name: app
# Value: [현재 외부 IP]
# TTL: 300

# SSL 인증서 설치
/home/admin/ssl-setup.sh app.hanguru.school
```

## 📊 성능 최적화

### PostgreSQL 최적화
```sql
-- /mnt/malmoi-storage/database/postgresql/*/main/postgresql.conf
shared_buffers = 256MB          # 메모리의 25%
effective_cache_size = 1GB      # 총 메모리의 50%
work_mem = 4MB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
```

### Nginx 최적화
```nginx
# nginx/nginx.conf
worker_processes auto;
worker_connections 1024;
gzip on;
gzip_comp_level 6;
client_max_body_size 100M;
```

### Docker 리소스 제한
```yaml
# docker-compose.yml
services:
  malmoi-app:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

## 🔒 보안 설정

### 방화벽 설정
```bash
# 기본 포트만 허용
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS
sudo ufw deny 5432     # PostgreSQL (외부 차단)
sudo ufw enable
```

### SSH 보안 강화
```bash
# SSH 포트 변경
sudo nano /etc/ssh/sshd_config
Port 2222
PasswordAuthentication no  # 키 인증만 허용

sudo systemctl restart sshd
```

### 데이터베이스 보안
```bash
# PostgreSQL 외부 접속 차단
# postgresql.conf에서
listen_addresses = 'localhost'

# pg_hba.conf에서 로컬만 허용
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
```

## 📈 모니터링 및 알림

### 시스템 모니터링
- **CPU 사용률**: 80% 이상 시 경고
- **메모리 사용률**: 85% 이상 시 경고
- **디스크 사용률**: 90% 이상 시 경고
- **서비스 상태**: DB, 앱 중단 시 경고

### SMART 모니터링
- **HDD 상태**: SMART 오류 시 즉시 경고
- **온도 모니터링**: 과열 시 경고
- **사용 시간**: 수명 예측

### 네트워크 모니터링
- **외부 IP 변화**: DDNS 자동 업데이트
- **인터넷 연결**: 연결 끊김 감지
- **서비스 접근성**: 외부에서 접속 가능 여부

## 🔄 향후 확장 계획

### NAS 전용 HDD 교체
```bash
# 데이터 백업
sudo rsync -av /mnt/malmoi-storage/ /backup/location/

# 새 HDD 설치 후 복원
sudo ./scripts/dxp2800-storage-setup.sh
sudo rsync -av /backup/location/ /mnt/malmoi-storage/
```

### RAID 구성 (향후)
- **RAID 1**: 미러링으로 데이터 안전성 확보
- **RAID 5**: 3개 이상 디스크로 용량과 안전성 균형

### 클라우드 백업 연동
```bash
# rclone 설치 및 설정
curl https://rclone.org/install.sh | sudo bash
rclone config

# Google Drive, OneDrive, AWS S3 등 연동 가능
```

## 🚨 문제 해결

### 일반적인 문제들

#### 서비스 시작 실패
```bash
# Docker 서비스 확인
docker-compose ps
docker-compose logs malmoi-app

# PostgreSQL 확인
sudo systemctl status postgresql
sudo journalctl -u postgresql -f

# 디스크 공간 확인
df -h /mnt/malmoi-storage
```

#### 외부 접속 불가
```bash
# 방화벽 확인
sudo ufw status

# 포트 포워딩 확인
# 라우터 관리 페이지에서 확인

# DDNS 상태 확인
/home/admin/check-dns.sh
```

#### 성능 문제
```bash
# 시스템 리소스 확인
htop
iotop
iostat

# 로그 확인
tail -f /var/log/system-monitor.log
tail -f /mnt/malmoi-storage/logs/app/malmoi.log
```

### 롤백 방법

#### AWS 환경으로 복원 (비상시)
```bash
# AWS 환경 변수 복원
cp env.production .env

# Vercel 재배포
git push origin main

# DNS를 Vercel로 변경
# A 레코드를 Vercel IP로 수정
```

#### 로컬 데이터 복원
```bash
# 최신 백업으로 복원
/home/admin/restore-backup.sh database /mnt/malmoi-storage/backups/database/latest.sql.gz

# 파일 복원
/home/admin/restore-backup.sh files /mnt/malmoi-storage/backups/files/latest.tar.gz
```

## 📋 체크리스트

### 마이그레이션 완료 체크리스트

- [ ] DXP2800 하드웨어 설정 완료
- [ ] 스토리지 마운트 및 디렉토리 구조 생성
- [ ] PostgreSQL 로컬 설치 및 설정
- [ ] Docker 환경 구성
- [ ] AWS RDS 데이터 마이그레이션
- [ ] 환경 변수 로컬 버전으로 변경
- [ ] 애플리케이션 정상 동작 확인
- [ ] DDNS 설정 및 외부 접속 테스트
- [ ] SSL 인증서 설치 (선택사항)
- [ ] 백업 시스템 설정 및 테스트
- [ ] 모니터링 시스템 동작 확인
- [ ] 성능 테스트 및 최적화
- [ ] 보안 설정 완료
- [ ] 문서화 및 운영 가이드 작성

### 운영 체크리스트 (일간)

- [ ] 시스템 상태 확인: `/home/admin/backup-dashboard.sh`
- [ ] 백업 상태 확인
- [ ] 로그 파일 확인
- [ ] 디스크 사용량 확인
- [ ] 외부 접속 가능 여부 확인

### 운영 체크리스트 (주간)

- [ ] SMART 상태 확인
- [ ] 보안 업데이트 적용
- [ ] 백업 파일 정리
- [ ] 성능 모니터링 리뷰
- [ ] 사용자 피드백 검토

### 운영 체크리스트 (월간)

- [ ] 전체 시스템 백업
- [ ] HDD 상태 점검
- [ ] 보안 감사
- [ ] 용량 계획 검토
- [ ] 업그레이드 계획 수립

## 🎉 마이그레이션 완료!

축하합니다! MalMoi 한국어 교실 시스템이 DXP2800 NAS 서버에서 성공적으로 운영되고 있습니다.

### 주요 달성 사항

1. **완전한 로컬화**: AWS 의존성 제거
2. **비용 절감**: 클라우드 서비스 요금 절약
3. **데이터 주권**: 모든 데이터를 직접 통제
4. **높은 가용성**: DDNS를 통한 24/7 서비스
5. **자동화된 백업**: 데이터 손실 위험 최소화
6. **포괄적 모니터링**: 시스템 상태 실시간 감시

### 문의 및 지원

- 시스템 로그: `/var/log/malmoi-*.log`
- 백업 대시보드: `/home/admin/backup-dashboard.sh`
- 문제 해결 가이드: 본 문서의 🚨 문제 해결 섹션 참조

운영 중 문제가 발생하면 백업을 통한 빠른 복구가 가능하며, 모든 설정과 데이터가 안전하게 보관되어 있습니다.
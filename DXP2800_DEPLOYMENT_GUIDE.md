# 🖥️ DXP2800 NAS 서버 배포 가이드

## 📋 개요

이 가이드는 MalMoi 한국어 교실 시스템을 DXP2800 NAS 서버에서 배포하는 방법을 설명합니다.

## 🎯 목표

- Vercel + AWS 환경과 100% 동일한 기능 제공
- DNS 전환만으로 서버 전환 가능
- 문제 발생 시 빠른 복구 가능
- `npm install → npm run build → npm run start`로 간단 실행

## 🚀 1단계: DXP2800 NAS 기본 설정

### 1.1 NAS 전원 및 연결

```bash
# 1. NAS 전원 켜기
# 2. 모니터, 키보드, 마우스 연결
# 3. Ubuntu/Debian 계열 OS 확인
lsb_release -a
```

### 1.2 관리자 계정 생성

```bash
# 관리자 계정 생성
sudo useradd -m -s /bin/bash admin
sudo usermod -aG sudo admin
echo "admin:admin123" | sudo chpasswd

# 관리자 계정으로 전환
su - admin
```

### 1.3 네트워크 설정 (고정 IP)

```bash
# 네트워크 인터페이스 확인
ip addr show

# 고정 IP 설정 (예: 192.168.0.50)
sudo nano /etc/netplan/01-netcfg.yaml
```

```yaml
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
```

```bash
# 네트워크 설정 적용
sudo netplan apply

# 설정 확인
ip addr show
ping -c 3 google.com
```

### 1.4 시스템 언어 및 시간대 설정

```bash
# 시간대 설정
sudo timedatectl set-timezone Asia/Tokyo

# 언어 설정 (필요시)
sudo locale-gen ja_JP.UTF-8
sudo update-locale LANG=ja_JP.UTF-8
```

## 📦 2단계: 필수 패키지 설치

### 2.1 시스템 업데이트

```bash
sudo apt update && sudo apt upgrade -y
```

### 2.2 필수 패키지 설치

```bash
# 기본 패키지
sudo apt install -y git curl wget unzip

# Node.js 18+ 설치
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL 클라이언트 설치
sudo apt install -y postgresql-client

# 버전 확인
node --version
npm --version
```

## 📥 3단계: 프로젝트 다운로드

```bash
# 프로젝트 디렉토리 생성
sudo mkdir -p /home/admin/malmoi-system
sudo chown admin:admin /home/admin/malmoi-system

# 프로젝트 클론
cd /home/admin
git clone https://github.com/hanguru-school/malmoi-system.git
cd malmoi-system
```

## 🔧 4단계: 환경 변수 설정

### 4.1 환경 변수 파일 생성

```bash
# 프로덕션 환경 변수 파일 복사
cp env.production .env

# 환경 변수 편집
nano .env
```

### 4.2 필수 환경 변수 설정

다음 값들을 실제 값으로 변경하세요:

```bash
# AWS 액세스 키 (실제 값으로 변경)
AWS_ACCESS_KEY_ID=your_actual_access_key_id
AWS_SECRET_ACCESS_KEY=your_actual_secret_access_key

# LINE 설정 (실제 값으로 변경)
LINE_CHANNEL_ID=your_actual_line_channel_id
LINE_CHANNEL_SECRET=your_actual_line_channel_secret
LINE_CHANNEL_ACCESS_TOKEN=your_actual_line_channel_access_token

# 기타 설정 (필요시)
SENTRY_DSN=your_actual_sentry_dsn
SMTP_USER=your_actual_email@gmail.com
SMTP_PASS=your_actual_app_password
```

## 🏗️ 5단계: Node 패키지 설치 & 빌드

```bash
# 의존성 설치
npm install

# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 마이그레이션
npx prisma migrate deploy

# 애플리케이션 빌드
npm run build
```

## 🚀 6단계: 실행 (테스트 모드)

```bash
# 테스트 실행
npm run start

# 브라우저에서 확인
# http://192.168.0.50:3000
```

## ⚙️ 7단계: 서비스로 등록 (자동 실행)

### 7.1 systemd 서비스 파일 생성

```bash
# 서비스 파일 복사
sudo cp malmoi.service /etc/systemd/system/

# 서비스 활성화
sudo systemctl daemon-reload
sudo systemctl enable malmoi
sudo systemctl start malmoi

# 상태 확인
sudo systemctl status malmoi
```

### 7.2 방화벽 설정

```bash
# 방화벽 설정
sudo ufw allow 22
sudo ufw allow 3000
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# 상태 확인
sudo ufw status
```

## 🔍 8단계: AWS RDS & Cognito 연결 확인

### 8.1 데이터베이스 연결 테스트

```bash
# PostgreSQL 연결 테스트
psql -h malmoi-system-db-tokyo.crooggsemeim.ap-northeast-1.rds.amazonaws.com -U malmoi_admin -d malmoi_system

# 연결 성공 시 → DB 정상 동작
```

### 8.2 Cognito 로그인 테스트

```bash
# 헬스체크 API 호출
curl http://localhost:3000/api/health

# 브라우저에서 로그인 테스트
# https://app.hanguru.school (DNS 설정 후)
```

## 🌐 9단계: 도메인 연결 (선택)

### 9.1 DNS 설정

도메인 관리자 페이지에서 다음 설정을 변경하세요:

```
Type: A
Name: app.hanguru.school
Value: 192.168.0.50
TTL: 300
```

### 9.2 SSL 인증서 설정 (HTTPS)

```bash
# Let's Encrypt 설치
sudo apt install certbot

# SSL 인증서 발급
sudo certbot certonly --standalone -d app.hanguru.school

# 인증서 자동 갱신 설정
sudo crontab -e
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔄 10단계: Vercel + AWS와 병행 운영

### 10.1 GitHub 자동 배포 유지

- GitHub main 브랜치 푸시 → Vercel 자동 배포 유지
- NAS 서버는 수동 업데이트

### 10.2 NAS 서버 수동 업데이트

```bash
# 업데이트 스크립트 실행
cd /home/admin/malmoi-system
sudo ./scripts/nas-update.sh

# 또는 수동 업데이트
git pull origin main
npm install
npm run build
sudo systemctl restart malmoi
```

### 10.3 서버 전환

문제 발생 시 DNS만 변경하여 NAS 또는 Vercel로 전환 가능:

```bash
# DNS 전환 스크립트 실행
./scripts/dns-switch.sh nas    # NAS 서버로 전환
./scripts/dns-switch.sh vercel # Vercel로 복귀
```

## 📊 11단계: 모니터링 및 관리

### 11.1 서비스 상태 확인

```bash
# 서비스 상태
sudo systemctl status malmoi

# 로그 확인
sudo journalctl -u malmoi -f

# 실시간 모니터링
sudo journalctl -u malmoi --since "1 hour ago"
```

### 11.2 성능 모니터링

```bash
# 시스템 리소스 확인
htop
free -h
df -h

# 포트 사용 확인
netstat -tlnp | grep :3000
```

### 11.3 백업 및 복구

```bash
# 데이터베이스 백업
pg_dump "postgresql://malmoi_admin:password@host:5432/database" > backup_$(date +%Y%m%d_%H%M%S).sql

# 로그 파일 정리
sudo journalctl --vacuum-time=30d
```

## 🚨 12단계: 문제 해결

### 12.1 일반적인 문제들

#### 서비스 시작 실패
```bash
# 서비스 상태 확인
sudo systemctl status malmoi

# 로그 확인
sudo journalctl -u malmoi --no-pager -l

# 수동 실행 테스트
cd /home/admin/malmoi-system
npm run start
```

#### 포트 충돌
```bash
# 포트 사용 확인
lsof -i :3000

# 프로세스 종료
sudo kill -9 [PID]
```

#### 데이터베이스 연결 실패
```bash
# 연결 테스트
psql -h malmoi-system-db-tokyo.crooggsemeim.ap-northeast-1.rds.amazonaws.com -U malmoi_admin -d malmoi_system

# 환경 변수 확인
echo $DATABASE_URL
```

#### 권한 문제
```bash
# 파일 권한 설정
sudo chown -R admin:admin /home/admin/malmoi-system
sudo chmod +x scripts/*.sh
```

### 12.2 로그 분석

```bash
# 실시간 로그
sudo journalctl -u malmoi -f

# 에러 로그만
sudo journalctl -u malmoi --no-pager | grep ERROR

# 특정 시간대 로그
sudo journalctl -u malmoi --since "2024-01-15 10:00:00" --until "2024-01-15 11:00:00"
```

## 📋 13단계: 유용한 명령어

### 13.1 서비스 관리

```bash
# 서비스 시작/중지/재시작
sudo systemctl start malmoi
sudo systemctl stop malmoi
sudo systemctl restart malmoi

# 서비스 상태 확인
sudo systemctl status malmoi
sudo systemctl is-active malmoi
sudo systemctl is-enabled malmoi
```

### 13.2 로그 관리

```bash
# 실시간 로그
sudo journalctl -u malmoi -f

# 로그 레벨 설정
sudo journalctl -u malmoi --no-pager -l

# 로그 정리
sudo journalctl --vacuum-time=30d
```

### 13.3 업데이트 관리

```bash
# 자동 업데이트 스크립트
sudo ./scripts/nas-update.sh

# 수동 업데이트
cd /home/admin/malmoi-system
git pull origin main
npm install
npm run build
sudo systemctl restart malmoi
```

## ✅ 14단계: 완료 체크리스트

- [ ] DXP2800 NAS 전원 및 연결 완료
- [ ] 관리자 계정 생성 완료
- [ ] 네트워크 설정 (고정 IP) 완료
- [ ] 시스템 언어 & 시간대 설정 완료
- [ ] 필수 패키지 설치 완료
- [ ] 프로젝트 다운로드 완료
- [ ] 환경 변수 설정 완료
- [ ] Node 패키지 설치 & 빌드 완료
- [ ] 테스트 실행 성공
- [ ] systemd 서비스 등록 완료
- [ ] 방화벽 설정 완료
- [ ] AWS RDS 연결 확인 완료
- [ ] Cognito 로그인 테스트 완료
- [ ] DNS 설정 완료 (선택사항)
- [ ] SSL 인증서 설정 완료 (선택사항)

## 🎉 완료!

이제 DXP2800 NAS 서버에서 MalMoi 한국어 교실 시스템이 정상적으로 실행됩니다.

- **로컬 접속**: http://192.168.0.50:3000
- **도메인 접속**: https://app.hanguru.school (DNS 설정 후)
- **헬스체크**: http://192.168.0.50:3000/api/health
- **서비스 상태**: `sudo systemctl status malmoi`

### 주요 특징

1. **Vercel + AWS 환경과 100% 동일**: 코드 수정 없이 NAS에서 실행
2. **간단한 실행**: `npm install → npm run build → npm run start`
3. **자동 서비스**: systemd로 자동 시작 및 재시작
4. **수동 업데이트**: `git pull && npm run build && systemctl restart malmoi`
5. **DNS 전환**: 문제 발생 시 DNS만 변경하여 서버 전환 가능 
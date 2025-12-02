# 🖥️ HP DXP2800 서버 MalMoi 시스템 설치 가이드

## 📋 개요

이 가이드는 HP DXP2800 서버에 Ubuntu Server 22.04 LTS를 설치하고, MalMoi 한국어 교실 시스템을 Vercel/AWS 없이 완전히 로컬에서 실행하는 방법을 설명합니다.

## 🎯 목표

- HP DXP2800에 1TB HDD 장착 후 Ubuntu Server 설치
- Node.js, PostgreSQL, PM2 등 필수 소프트웨어 설치
- GitHub에서 malmoi-system 프로젝트 클론 및 설정
- 로컬 데이터베이스 설정 및 마이그레이션
- PM2로 자동 실행 및 부팅 시 자동 시작 설정
- app.hanguru.school 도메인 연결

## 🚀 1단계: 하드웨어 준비 및 OS 설치

### 1.1 하드웨어 준비
1. **HDD 장착**: HP DXP2800에 1TB HDD 설치
2. **BIOS 설정**: UEFI 모드로 설정
3. **부팅 순서**: USB를 첫 번째 부팅 장치로 설정

### 1.2 Ubuntu Server 22.04 LTS 설치
1. **Ubuntu Server 이미지 다운로드**
   - https://ubuntu.com/download/server
   - Ubuntu Server 22.04.3 LTS 선택

2. **부팅 USB 생성**
   - Rufus (Windows) 또는 dd 명령어 (Linux/Mac) 사용

3. **OS 설치**
   ```bash
   # 설치 시 중요 설정:
   # - 언어: English
   # - 키보드: Korean (또는 US)
   # - 네트워크: DHCP 자동 설정
   # - 스토리지: 전체 디스크 사용
   # - 사용자 계정 생성
   # - OpenSSH 서버 설치 ✅ 체크
   ```

4. **초기 접속**
   ```bash
   # 서버 IP 확인
   ip addr show
   
   # SSH 접속 (다른 컴퓨터에서)
   ssh username@server_ip
   ```

## 🛠️ 2단계: 자동 설치 스크립트 실행

### 2.1 설치 스크립트 다운로드

```bash
# 프로젝트 클론 (설치 스크립트 포함)
git clone https://github.com/hanguru-school/malmoi-system.git
cd malmoi-system

# 또는 스크립트만 다운로드
wget https://raw.githubusercontent.com/hanguru-school/malmoi-system/main/scripts/hp-dxp2800-setup.sh
chmod +x hp-dxp2800-setup.sh
```

### 2.2 자동 설치 실행

```bash
# 설치 스크립트 실행
sudo ./scripts/hp-dxp2800-setup.sh
```

**설치 스크립트가 수행하는 작업:**
1. ✅ 시스템 업데이트 및 기본 패키지 설치
2. ✅ Node.js 20 LTS 설치
3. ✅ PM2 프로세스 매니저 설치
4. ✅ PostgreSQL 설치 및 설정
5. ✅ malmoi_admin 사용자 및 malmoi_system 데이터베이스 생성
6. ✅ 프로젝트 클론 (https://github.com/hanguru-school/malmoi-system.git)
7. ✅ 환경 변수 설정 (.env 파일 생성)
8. ✅ npm install, Prisma 마이그레이션, 빌드
9. ✅ PM2로 애플리케이션 시작
10. ✅ 방화벽 설정 (포트 22, 80, 443, 3000 허용)
11. ✅ 부팅 시 자동 실행 설정

### 2.3 설치 완료 확인

설치 완료 후 다음 정보가 표시됩니다:

```
========================================
🎉 MalMoi 시스템 설치 완료!
========================================

📊 서버 정보:
  - 서버 IP: 192.168.1.100
  - 애플리케이션 URL: http://192.168.1.100:3000
  - 프로젝트 경로: /home/username/malmoi-system

🗄️ 데이터베이스 정보:
  - 호스트: localhost
  - 포트: 5432
  - 데이터베이스: malmoi_system
  - 사용자: malmoi_admin
  - 비밀번호: [자동생성된 32자리 비밀번호]

🌐 접속 방법:
  1. 로컬: http://localhost:3000
  2. 네트워크: http://192.168.1.100:3000
  3. 헬스체크: http://192.168.1.100:3000/api/health
```

## 🌐 3단계: 도메인 연결

### 3.1 서버 접속 테스트

```bash
# 브라우저에서 다음 URL 접속:
http://서버_IP:3000

# 헬스체크 API 테스트:
curl http://서버_IP:3000/api/health
```

### 3.2 app.hanguru.school 도메인 연결

```bash
# 도메인 연결 스크립트 실행
./scripts/domain-update.sh
```

**도메인 연결 과정:**
1. **DNS 설정 변경**
   - 도메인 관리 페이지 접속
   - A 레코드 수정: app.hanguru.school → 서버 고정 IP
   - TTL: 300초 (5분) 설정

2. **환경 변수 업데이트**
   - NEXTAUTH_URL을 도메인으로 변경
   - PM2 애플리케이션 재시작

3. **접속 테스트**
   - http://app.hanguru.school:3000
   - https://app.hanguru.school:3000/api/health

## 🔧 4단계: 시스템 관리

### 4.1 PM2 명령어

```bash
# 애플리케이션 상태 확인
pm2 list

# 로그 확인
pm2 logs malmoi-system

# 재시작
pm2 restart malmoi-system

# 중지
pm2 stop malmoi-system

# 삭제
pm2 delete malmoi-system

# 수동 시작 (필요시)
pm2 start npm --name "malmoi-system" -- run start
```

### 4.2 데이터베이스 관리

```bash
# PostgreSQL 접속
sudo -u postgres psql malmoi_system

# 또는 malmoi_admin 계정으로 접속
psql -h localhost -U malmoi_admin -d malmoi_system

# 데이터베이스 상태 확인
sudo systemctl status postgresql

# PostgreSQL 재시작
sudo systemctl restart postgresql
```

### 4.3 시스템 상태 확인

```bash
# 전체 서비스 상태
sudo systemctl status postgresql
pm2 list
sudo ufw status

# 포트 사용 확인
netstat -tlnp | grep :3000
netstat -tlnp | grep :5432

# 디스크 사용량
df -h

# 메모리 사용량
free -h

# CPU 사용량
htop
```

## 🔒 5단계: 보안 및 SSL 설정

### 5.1 방화벽 강화

```bash
# SSH 포트 변경 (권장)
sudo nano /etc/ssh/sshd_config
# Port 2222 추가

sudo systemctl restart sshd
sudo ufw allow 2222
sudo ufw delete allow 22

# Fail2ban 설정 (무차별 대입 공격 방지)
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 5.2 SSL 인증서 설치

```bash
# Certbot 설치
sudo apt update
sudo apt install -y certbot

# SSL 인증서 발급
sudo certbot certonly --standalone -d app.hanguru.school

# 자동 갱신 설정
sudo crontab -e
# 추가: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 5.3 Nginx 리버스 프록시 설정 (선택사항)

```bash
# Nginx 설치
sudo apt install -y nginx

# 설정 파일 생성
sudo nano /etc/nginx/sites-available/malmoi

# 내용:
server {
    listen 80;
    server_name app.hanguru.school;
    
    location / {
        proxy_pass http://localhost:3000;
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

# 설정 활성화
sudo ln -s /etc/nginx/sites-available/malmoi /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔄 6단계: 백업 및 유지보수

### 6.1 자동 백업 설정

```bash
# 백업 스크립트 생성
nano /home/$USER/backup-malmoi.sh
```

```bash
#!/bin/bash
# MalMoi 시스템 백업 스크립트

BACKUP_DIR="/home/$USER/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 데이터베이스 백업
pg_dump -h localhost -U malmoi_admin malmoi_system > $BACKUP_DIR/db_$DATE.sql

# 프로젝트 파일 백업
tar -czf $BACKUP_DIR/malmoi_$DATE.tar.gz /home/$USER/malmoi-system

# 30일 이상 된 백업 삭제
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "백업 완료: $DATE"
```

```bash
# 실행 권한 부여
chmod +x /home/$USER/backup-malmoi.sh

# crontab에 등록 (매일 새벽 2시)
crontab -e
# 추가: 0 2 * * * /home/$USER/backup-malmoi.sh
```

### 6.2 시스템 업데이트

```bash
# 정기 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# Node.js 업데이트 (필요시)
sudo npm install -g npm@latest

# PM2 업데이트
sudo npm install -g pm2@latest
```

### 6.3 애플리케이션 업데이트

```bash
cd /home/$USER/malmoi-system

# 최신 코드 가져오기
git pull origin main

# 의존성 업데이트
npm install

# 데이터베이스 마이그레이션
npx prisma migrate deploy

# 빌드
npm run build

# PM2 재시작
pm2 restart malmoi-system
```

## 🚨 7단계: 문제 해결

### 7.1 일반적인 문제들

#### 애플리케이션이 시작되지 않음
```bash
# PM2 로그 확인
pm2 logs malmoi-system

# 환경 변수 확인
cat /home/$USER/malmoi-system/.env

# 포트 충돌 확인
netstat -tlnp | grep :3000

# 수동 시작 테스트
cd /home/$USER/malmoi-system
npm run start
```

#### 데이터베이스 연결 실패
```bash
# PostgreSQL 상태 확인
sudo systemctl status postgresql

# 연결 테스트
psql -h localhost -U malmoi_admin -d malmoi_system

# PostgreSQL 로그 확인
sudo tail -f /var/log/postgresql/postgresql-*.log
```

#### 외부 접속 불가
```bash
# 방화벽 상태 확인
sudo ufw status

# 포트 리스닝 확인
netstat -tlnp | grep :3000

# 네트워크 인터페이스 확인
ip addr show
```

### 7.2 로그 위치

```bash
# PM2 로그
~/.pm2/logs/

# PostgreSQL 로그
/var/log/postgresql/

# 시스템 로그
/var/log/syslog

# Nginx 로그 (설치된 경우)
/var/log/nginx/
```

## 📋 8단계: 완료 체크리스트

### 설치 완료 확인
- [ ] Ubuntu Server 22.04 LTS 설치 완료
- [ ] Node.js 20 LTS 설치 확인
- [ ] PostgreSQL 설치 및 malmoi_system DB 생성
- [ ] malmoi-system 프로젝트 클론 완료
- [ ] .env 파일 설정 완료
- [ ] npm install 및 빌드 성공
- [ ] PM2로 애플리케이션 실행 중
- [ ] 방화벽 설정 완료 (포트 3000 허용)
- [ ] 부팅 시 자동 실행 설정 완료

### 접속 테스트
- [ ] http://서버_IP:3000 접속 가능
- [ ] http://서버_IP:3000/api/health 응답 확인
- [ ] 관리자 계정 생성 및 로그인 테스트
- [ ] 기본 기능 동작 확인

### 도메인 연결
- [ ] DNS A 레코드 설정 완료
- [ ] app.hanguru.school 도메인 접속 가능
- [ ] NEXTAUTH_URL 도메인으로 변경 완료
- [ ] PM2 재시작 후 정상 동작 확인

### 보안 및 백업
- [ ] SSL 인증서 설치 (선택사항)
- [ ] 자동 백업 스크립트 설정
- [ ] Fail2ban 보안 설정
- [ ] SSH 포트 변경 (권장)

## 🎉 완료!

이제 HP DXP2800 서버에서 MalMoi 한국어 교실 시스템이 완전히 독립적으로 실행됩니다!

### 주요 달성 사항

1. **완전한 로컬화**: Vercel/AWS 의존성 제거
2. **자동 실행**: 부팅 시 자동 시작 설정
3. **도메인 연결**: app.hanguru.school 접속 가능
4. **데이터베이스**: PostgreSQL 로컬 설치 및 설정
5. **프로세스 관리**: PM2를 통한 안정적인 서비스 운영
6. **보안**: 방화벽 및 SSL 인증서 설정

### 접속 정보

- **로컬**: http://localhost:3000
- **네트워크**: http://서버_IP:3000
- **도메인**: http://app.hanguru.school:3000
- **HTTPS**: https://app.hanguru.school:3000 (SSL 설정 시)

### 관리 명령어

```bash
# 상태 확인
pm2 list
sudo systemctl status postgresql

# 재시작
pm2 restart malmoi-system
sudo systemctl restart postgresql

# 로그 확인
pm2 logs malmoi-system
sudo journalctl -u postgresql

# 백업
/home/$USER/backup-malmoi.sh
```

문제가 발생하면 위의 문제 해결 섹션을 참조하거나 로그를 확인해주세요!
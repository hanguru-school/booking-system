# 🖥️ NAS 서버 배포 가이드

## 📋 개요

이 가이드는 MalMoi 한국어 교실 시스템을 NAS 서버(DXP2800)에서 병행 운영하기 위한 설정 방법을 설명합니다.

## 🎯 목표

- Vercel + AWS 환경과 동일한 기능 제공
- DNS 전환만으로 서버 전환 가능
- 문제 발생 시 빠른 복구 가능

## 🚀 1단계: NAS 서버 준비

### 1.1 필수 패키지 설치

```bash
# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# Node.js 18+ 설치
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 설치 (프로세스 관리)
sudo npm install -g pm2

# Git 설치
sudo apt-get install -y git

# 방화벽 설정
sudo ufw allow 3000
sudo ufw allow 22
sudo ufw enable
```

### 1.2 프로젝트 클론

```bash
# 프로젝트 디렉토리 생성
mkdir -p /opt/malmoi
cd /opt/malmoi

# GitHub에서 프로젝트 클론
git clone https://github.com/your-username/booking-system.git
cd booking-system
```

## 🔧 2단계: 환경 변수 설정

### 2.1 환경 변수 파일 생성

```bash
# 환경 변수 파일 복사
cp env.nas .env

# 환경 변수 편집
nano .env
```

### 2.2 필수 환경 변수 설정

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

## 🏗️ 3단계: 애플리케이션 빌드 및 실행

### 3.1 의존성 설치 및 빌드

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

### 3.2 PM2로 실행

```bash
# PM2로 애플리케이션 시작
pm2 start ecosystem.config.js

# 상태 확인
pm2 status

# 로그 확인
pm2 logs malmoi-booking-system
```

### 3.3 PM2 자동 시작 설정

```bash
# PM2 자동 시작 설정
pm2 startup
pm2 save
```

## 🌐 4단계: 네트워크 설정

### 4.1 방화벽 설정

```bash
# 포트 3000 허용
sudo ufw allow 3000

# SSH 허용
sudo ufw allow 22

# 방화벽 활성화
sudo ufw enable

# 상태 확인
sudo ufw status
```

### 4.2 포트 확인

```bash
# 포트 사용 확인
netstat -tlnp | grep :3000

# 프로세스 확인
ps aux | grep node
```

## 🔍 5단계: 연결 확인

### 5.1 데이터베이스 연결 테스트

```bash
# Prisma Studio 실행 (선택사항)
npx prisma studio
```

### 5.2 환경 변수 확인

```bash
# 환경 변수 로드 확인
node -e "console.log('DATABASE_URL:', process.env.DATABASE_URL ? '설정됨' : '설정되지 않음')"
node -e "console.log('AWS_REGION:', process.env.AWS_REGION)"
node -e "console.log('COGNITO_USER_POOL_ID:', process.env.COGNITO_USER_POOL_ID ? '설정됨' : '설정되지 않음')"
```

### 5.3 서버 상태 확인

```bash
# 헬스체크 API 호출
curl http://localhost:3000/api/health

# 브라우저에서 확인
# http://localhost:3000
```

## 🔄 6단계: DNS 설정 (서버 전환 시)

### 6.1 DNS 레코드 변경

도메인 관리자 페이지에서 다음 설정을 변경하세요:

```
Type: A
Name: app.hanguru.school
Value: [NAS 서버 IP 주소]
TTL: 300
```

### 6.2 DNS 전파 확인

```bash
# DNS 전파 확인
nslookup app.hanguru.school
dig app.hanguru.school

# 전파 완료까지 대기 (최대 5분)
```

## 📊 7단계: 모니터링 설정

### 7.1 로그 모니터링

```bash
# 실시간 로그 확인
pm2 logs malmoi-booking-system --lines 100

# 에러 로그 확인
tail -f logs/err.log

# 전체 로그 확인
tail -f logs/combined.log
```

### 7.2 성능 모니터링

```bash
# PM2 모니터링 대시보드
pm2 monit

# 시스템 리소스 확인
htop
free -h
df -h
```

## 🔄 8단계: 업데이트 방법

### 8.1 자동 업데이트 (GitHub Actions)

GitHub 저장소의 Secrets에 다음을 설정하세요:

```
NAS_HOST=your_nas_ip
NAS_USERNAME=your_username
NAS_SSH_KEY=your_ssh_private_key
NAS_PORT=22
```

### 8.2 수동 업데이트

```bash
# 최신 코드 가져오기
git pull origin main

# 의존성 업데이트
npm install

# 재빌드
npm run build

# PM2 재시작
pm2 restart malmoi-booking-system
```

## 🚨 9단계: 문제 해결

### 9.1 일반적인 문제들

#### 포트 충돌
```bash
# 포트 사용 확인
lsof -i :3000

# 프로세스 종료
kill -9 [PID]
```

#### 메모리 부족
```bash
# 메모리 사용량 확인
free -h

# PM2 메모리 제한 설정
pm2 restart malmoi-booking-system --max-memory-restart 1G
```

#### 데이터베이스 연결 실패
```bash
# AWS RDS 연결 테스트
psql "postgresql://malmoi_admin:password@host:5432/database"

# 환경 변수 확인
echo $DATABASE_URL
```

#### 권한 문제
```bash
# 파일 권한 설정
chmod +x scripts/nas-deploy.sh
chmod 644 .env
```

### 9.2 로그 분석

```bash
# 에러 로그 확인
pm2 logs malmoi-booking-system --err

# 특정 시간대 로그
pm2 logs malmoi-booking-system --lines 1000 | grep "2024-01-15"
```

## 🔧 10단계: 유지보수

### 10.1 정기 백업

```bash
# 데이터베이스 백업
pg_dump "postgresql://malmoi_admin:password@host:5432/database" > backup_$(date +%Y%m%d_%H%M%S).sql

# 로그 파일 정리
find logs/ -name "*.log" -mtime +30 -delete
```

### 10.2 성능 최적화

```bash
# 메모리 사용량 모니터링
pm2 monit

# CPU 사용량 확인
top -p $(pgrep -f "malmoi-booking-system")
```

## 📞 11단계: 지원 및 연락처

### 11.1 문제 보고

문제가 발생하면 다음 정보를 포함하여 보고해주세요:

- 오류 메시지
- 로그 파일 내용
- 시스템 정보 (`uname -a`)
- Node.js 버전 (`node --version`)
- PM2 상태 (`pm2 status`)

### 11.2 유용한 명령어

```bash
# 전체 시스템 상태 확인
pm2 status
pm2 monit
htop
df -h
free -h

# 로그 확인
pm2 logs malmoi-booking-system
tail -f logs/combined.log

# 프로세스 재시작
pm2 restart malmoi-booking-system

# 환경 변수 확인
node -e "console.log(process.env)"
```

## ✅ 완료 체크리스트

- [ ] Node.js 18+ 설치 완료
- [ ] PM2 설치 완료
- [ ] 프로젝트 클론 완료
- [ ] 환경 변수 설정 완료
- [ ] 의존성 설치 완료
- [ ] 데이터베이스 마이그레이션 완료
- [ ] 애플리케이션 빌드 완료
- [ ] PM2로 실행 완료
- [ ] 방화벽 설정 완료
- [ ] 헬스체크 통과
- [ ] DNS 설정 완료 (서버 전환 시)

## 🎉 완료!

이제 NAS 서버에서 MalMoi 한국어 교실 시스템이 정상적으로 실행됩니다.

- **로컬 접속**: http://localhost:3000
- **외부 접속**: http://[NAS_IP]:3000
- **헬스체크**: http://localhost:3000/api/health 
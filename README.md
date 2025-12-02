# MalMoi 한국어 교실 시스템

## 📋 프로젝트 개요

MalMoi 한국어 교실은 한국어 학습자와 교사를 위한 종합 관리 시스템입니다. 이 시스템은 현재 **DXP2800 NAS 서버**에서 완전히 로컬화되어 운영되며, 기존 Vercel + AWS 클라우드 환경에서 마이그레이션되었습니다.

### 🎯 주요 특징
- **완전한 로컬화**: AWS RDS, S3, Cognito 의존성 제거
- **비용 효율적**: 클라우드 서비스 요금 절약
- **데이터 주권**: 모든 데이터를 로컬에서 직접 관리
- **고가용성**: DDNS를 통한 24/7 외부 접속 지원
- **자동화된 백업**: 데이터 손실 위험 최소화

## 🖥️ DXP2800 NAS 서버 운영

### 현재 운영 환경
- **서버**: DXP2800 NAS
- **OS**: Ubuntu/Debian 계열
- **스토리지**: 2TB HDD (ext4, 단일 디스크)
- **데이터베이스**: PostgreSQL 15 (로컬)
- **웹서버**: Nginx + Docker
- **모니터링**: 자동화된 백업 및 SMART 모니터링

### 📂 디렉토리 구조
```
/mnt/malmoi-storage/
├── app/                 # 애플리케이션 데이터
├── database/           # PostgreSQL + Redis 데이터
├── logs/               # 시스템 및 애플리케이션 로그
└── backups/           # 자동 백업 파일
```

### 🌐 접속 정보
- **로컬 접속**: http://192.168.0.50:3000
- **외부 접속**: https://malmoi.ddns.net (DDNS 설정 시)
- **관리자 대시보드**: /home/admin/backup-dashboard.sh

---

## 🚀 완전 마이그레이션 가이드

### DXP2800으로 완전 이전하기

상세한 마이그레이션 가이드는 **[DXP2800_MIGRATION_GUIDE.md](./DXP2800_MIGRATION_GUIDE.md)**를 참조하세요.

#### 빠른 설정 (요약)
```bash
# 1. 스토리지 설정
sudo ./scripts/dxp2800-storage-setup.sh

# 2. PostgreSQL 설치
sudo ./scripts/postgresql-setup.sh

# 3. Docker 환경 구성
sudo ./scripts/docker-setup.sh

# 4. DDNS 설정
sudo ./scripts/ddns-setup.sh

# 5. 백업 시스템 설정
sudo ./scripts/backup-system-setup.sh

# 6. AWS 데이터 마이그레이션
sudo ./scripts/aws-to-local-migration.sh

# 7. 시스템 테스트
sudo ./scripts/system-test.sh
```

---

## 🔄 레거시 배포 방법 (참고용)

### Vercel + AWS 자동 배포 (현재 비활성화)

이제 `feature/production-system-setup` 브랜치에 push하면 자동으로 배포됩니다!

#### 배포 방법
1. 코드 수정
2. `git add . && git commit -m "메시지" && git push origin feature/production-system-setup`
3. 자동 배포 완료! 🎉

#### 배포 확인
- **Vercel 대시보드**: https://vercel.com/dashboard
- **사이트 접속**: https://app.hanguru.school

---

## 🖥️ NAS 서버 배포 방법 (레거시)

### 사전 준비사항

#### 1. 필수 패키지 설치
```bash
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

#### 2. 프로젝트 클론
```bash
git clone https://github.com/your-username/booking-system.git
cd booking-system
```

#### 3. 환경 변수 설정
```bash
# 환경 변수 파일 복사
cp env.nas .env

# 실제 값으로 수정 (AWS 액세스 키 등)
nano .env
```

#### 4. 애플리케이션 빌드 및 실행

**방법 1: 직접 실행**
```bash
# 의존성 설치
npm install

# 데이터베이스 마이그레이션
npx prisma generate
npx prisma migrate deploy

# 빌드 및 실행
npm run nas-deploy
```

**방법 2: PM2 사용 (권장)**
```bash
# PM2로 실행
pm2 start ecosystem.config.js

# 상태 확인
pm2 status

# 로그 확인
pm2 logs malmoi-booking-system

# 재시작
pm2 restart malmoi-booking-system

# 중지
pm2 stop malmoi-booking-system
```

#### 5. 방화벽 및 포트 설정

**방화벽 설정**
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

**포트 확인**
```bash
# 포트 사용 확인
netstat -tlnp | grep :3000

# 프로세스 확인
ps aux | grep node
```

#### 6. AWS RDS 및 Cognito 연결 확인

**데이터베이스 연결 테스트**
```bash
# Prisma Studio 실행 (선택사항)
npx prisma studio
```

**환경 변수 확인**
```bash
# 환경 변수 로드 확인
node -e "console.log(process.env.DATABASE_URL)"
node -e "console.log(process.env.AWS_REGION)"
```

#### 7. DNS 설정 (서버 전환 시)

**DNS 레코드 변경**
```
Type: A
Name: app.hanguru.school
Value: [NAS 서버 IP 주소]
TTL: 300
```

**확인 방법**
```bash
# DNS 전파 확인
nslookup app.hanguru.school
dig app.hanguru.school
```

### 🚨 문제 해결

#### 일반적인 문제들

**1. 포트 충돌**
```bash
# 포트 사용 확인
lsof -i :3000

# 프로세스 종료
kill -9 [PID]
```

**2. 메모리 부족**
```bash
# 메모리 사용량 확인
free -h

# PM2 메모리 제한 설정
pm2 restart malmoi-booking-system --max-memory-restart 1G
```

**3. 데이터베이스 연결 실패**
```bash
# AWS RDS 연결 테스트
psql "postgresql://malmoi_admin:password@host:5432/database"

# 환경 변수 확인
echo $DATABASE_URL
```

**4. 권한 문제**
```bash
# 파일 권한 설정
chmod +x scripts/nas-deploy.sh
chmod 644 .env
```

### 📊 모니터링

**로그 확인**
```bash
# 실시간 로그
pm2 logs malmoi-booking-system --lines 100

# 에러 로그
tail -f logs/err.log

# 전체 로그
tail -f logs/combined.log
```

**성능 모니터링**
```bash
# PM2 모니터링
pm2 monit

# 시스템 리소스 확인
htop
```

### 🔄 업데이트 방법

**자동 업데이트 (GitHub Actions 사용)**
```bash
# 최신 코드 가져오기
git pull origin main

# 재빌드 및 재시작
pm2 restart malmoi-booking-system
```

**수동 업데이트**
```bash
# 코드 업데이트
git pull origin main

# 의존성 업데이트
npm install

# 재빌드
npm run build

# PM2 재시작
pm2 restart malmoi-booking-system
```

---

## 프로젝트 개요

한국어 교실을 위한 종합적인 예약 및 관리 시스템입니다.

### 주요 기능

- **학생 관리**: 학생 정보, 수업 예약, 진도 추적
- **교사 관리**: 수업 일정, 학생 관리, 자료 공유
- **예약 시스템**: 실시간 예약, 알림, 결제 연동
- **학습 관리**: 진도 추적, 과제 관리, 성과 분석
- **통신 시스템**: 메시지, 알림, 리뷰 시스템

### 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (AWS RDS)
- **Authentication**: AWS Cognito
- **Deployment**: Vercel + NAS 서버
- **Styling**: Tailwind CSS

### 환경 설정

1. **환경 변수 설정**
   ```bash
   cp .env.example .env.local
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **데이터베이스 설정**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **개발 서버 실행**
   ```bash
   npm run dev
   ```

### 배포

프로젝트는 Vercel과 NAS 서버에서 병행 운영됩니다.

- **Production (Vercel)**: https://app.hanguru.school
- **NAS 서버**: 동일한 도메인으로 DNS 전환 가능
- **Preview**: 각 브랜치별 자동 배포

### 개발 가이드

- **코딩 스타일**: ESLint + Prettier
- **타입 체크**: TypeScript
- **테스트**: Jest + React Testing Library

### 라이센스

MIT License

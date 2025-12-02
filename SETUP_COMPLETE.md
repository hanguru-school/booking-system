# 서버 설정 완료 보고서

**완료 일시**: 2025-11-27  
**서버**: malmoi@100.80.210.105 (Ubuntu 24.04)

---

## ✅ 완료된 작업

### 1. 기본 설정
- ✅ 기본 패키지 설치
- ✅ 타임존 설정 (Asia/Tokyo)
- ✅ 자동 보안 업데이트 설정

### 2. Node.js 환경
- ✅ Node.js v20.19.5
- ✅ pnpm v10.23.0
- ✅ PM2 v6.0.14

### 3. 데이터베이스
- ✅ PostgreSQL 설치
- ✅ 데이터베이스 생성 (malmoi_system)
- ✅ 사용자 생성 (malmoi_admin)
- ✅ 서비스 실행 중

### 4. 파일 스토리지
- ✅ MinIO 설치
- ✅ 버킷 생성 (malmoi-system-files)
- ✅ 서비스 실행 중

### 5. 애플리케이션
- ✅ 코드 배포 완료
- ✅ 빌드 완료
- ✅ PM2 서비스 실행 중

### 6. 환경변수
- ✅ `/etc/malmoi/booking.env` 생성
- ✅ 데이터베이스 연결 정보 설정
- ✅ MinIO 연결 정보 설정

---

## 📋 서비스 정보

### 접속 URL
- **로컬 네트워크**: http://192.168.1.41:3000
- **Tailscale**: http://100.80.210.105:3000
- **Health Check**: http://192.168.1.41:3000/api/health

### 서비스 포트
- **3000**: Next.js 애플리케이션
- **5432**: PostgreSQL (로컬만)
- **9000**: MinIO API (로컬만)
- **9001**: MinIO Console (로컬만)

---

## 🔍 검증 명령

### 서비스 상태 확인
```bash
# PostgreSQL
sudo systemctl status postgresql

# MinIO
sudo systemctl status minio

# PM2
pm2 list
pm2 logs booking --lines 50
```

### 데이터베이스 확인
```bash
# 연결 테스트
psql -U malmoi_admin -h localhost -d malmoi_system -c "SELECT version();"

# 테이블 목록
psql -U malmoi_admin -h localhost -d malmoi_system -c "\dt"
```

### MinIO 확인
```bash
# 버킷 목록
mc ls local/

# 버킷 내용
mc ls local/malmoi-system-files
```

### 애플리케이션 확인
```bash
# Health Check
curl http://localhost:3000/api/health

# 외부 접근
curl http://192.168.1.41:3000/api/health
```

---

## 📝 다음 단계

### 1. 브라우저 접속 테스트
```
http://192.168.1.41:3000
```

### 2. 로그 모니터링
```bash
pm2 logs booking
```

### 3. 백업 확인
```bash
# 백업 디렉터리
ls -lh /srv/malmoi/backups/database/daily/

# 백업 스크립트
/usr/local/bin/backup-database.sh
```

### 4. Git 배포 테스트
```bash
# 로컬에서
git push server main
```

---

## 🔐 보안 설정

### 환경변수 파일
- **위치**: `/etc/malmoi/booking.env`
- **권한**: root:root, 600
- **내용**: 데이터베이스 비밀번호, MinIO 자격 증명 등

### 방화벽
- OpenSSH 허용
- 내부망(192.168.1.0/24)에서 3000, 9000, 9001 포트 허용
- Tailscale(100.0.0.0/8) 네트워크 허용

---

## 🎉 완료!

모든 설정이 완료되었습니다. 이제 애플리케이션을 사용할 수 있습니다!


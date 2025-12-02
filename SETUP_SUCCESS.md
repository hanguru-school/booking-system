# 🎉 서버 설정 완료!

**완료 일시**: 2025-11-27  
**서버**: malmoi@100.80.210.105 (Ubuntu 24.04)

---

## ✅ 설치 완료 확인

### 실행 중인 서비스
- ✅ **PostgreSQL**: 프로세스 실행 중
- ✅ **MinIO**: 프로세스 실행 중  
- ✅ **PM2**: 서비스 실행 중 (`booking`)
- ✅ **Next.js**: 서버 실행 중

### 설치된 소프트웨어
- ✅ PostgreSQL 16.10
- ✅ MinIO (RELEASE.2025-09-07)
- ✅ Node.js v20.19.5
- ✅ pnpm v10.23.0
- ✅ PM2 v6.0.14

---

## 🌐 접속 정보

### 애플리케이션
- **로컬 네트워크**: http://192.168.1.41:3000
- **Tailscale**: http://100.80.210.105:3000
- **Health Check**: http://192.168.1.41:3000/api/health

### 서비스 포트
- **3000**: Next.js 애플리케이션
- **5432**: PostgreSQL (로컬만)
- **9000**: MinIO API (로컬만)
- **9001**: MinIO Console (로컬만)

---

## 📋 유용한 명령어

### 서비스 상태 확인
```bash
# PostgreSQL
sudo systemctl status postgresql
ps aux | grep postgres

# MinIO
sudo systemctl status minio
ps aux | grep minio

# PM2
pm2 list
pm2 logs booking
```

### 데이터베이스 접속
```bash
psql -U malmoi_admin -h localhost -d malmoi_system
```

### MinIO 접속
```bash
# 콘솔: http://192.168.1.41:9001
# API: http://192.168.1.41:9000
```

### 로그 확인
```bash
# PM2 로그
pm2 logs booking --lines 50

# PostgreSQL 로그
sudo journalctl -u postgresql -n 50

# MinIO 로그
sudo journalctl -u minio -n 50
```

---

## 🚀 다음 단계

1. **브라우저에서 접속 테스트**
   ```
   http://192.168.1.41:3000
   ```

2. **데이터베이스 마이그레이션** (필요시)
   ```bash
   cd ~/booking-system
   pnpm prisma migrate deploy
   ```

3. **Git 배포 테스트**
   ```bash
   # 로컬에서
   git push server main
   ```

---

## 📝 참고 사항

- 환경변수는 `/etc/malmoi/booking.env`에서 관리됩니다
- 백업은 자동으로 실행됩니다 (매일 02:00)
- 모든 서비스는 자동 시작 설정되어 있습니다

---

**축하합니다! 서버 설정이 완료되었습니다! 🎉**


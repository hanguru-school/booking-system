# 서버 설정 검증 보고서

**검증 일시**: 2025-11-27  
**서버**: malmoi@100.80.210.105 (Ubuntu 24.04)

---

## ✅ 검증 항목

### 1. PostgreSQL
- [ ] 서비스 실행 중
- [ ] 데이터베이스 `malmoi_system` 존재
- [ ] 사용자 `malmoi_admin` 존재
- [ ] 연결 테스트 성공

### 2. MinIO
- [ ] 서비스 실행 중
- [ ] 버킷 `malmoi-system-files` 생성됨
- [ ] mc 클라이언트 접근 가능

### 3. 환경변수
- [ ] `/etc/malmoi/booking.env` 파일 존재
- [ ] `DATABASE_URL` 설정됨
- [ ] `S3_ENDPOINT` 설정됨
- [ ] `AWS_S3_BUCKET` 설정됨

### 4. 애플리케이션
- [ ] PM2 서비스 실행 중
- [ ] Health Check 응답
- [ ] 데이터베이스 연결 성공
- [ ] 에러 없음

---

## 📋 다음 단계

검증이 완료되면:

1. **외부 접근 확인**
   ```bash
   curl http://192.168.1.41:3000/api/health
   # 또는 Tailscale: curl http://100.80.210.105:3000/api/health
   ```

2. **로그 모니터링**
   ```bash
   pm2 logs booking --lines 50
   ```

3. **백업 확인**
   ```bash
   ls -lh /srv/malmoi/backups/database/daily/
   ```

---

## 🔧 문제 해결

### 데이터베이스 연결 실패 시
```bash
# PostgreSQL 서비스 확인
sudo systemctl status postgresql

# 연결 테스트
psql -U malmoi_admin -h localhost -d malmoi_system

# 환경변수 확인
cat /etc/malmoi/booking.env | grep DATABASE_URL
```

### MinIO 연결 실패 시
```bash
# MinIO 서비스 확인
sudo systemctl status minio

# 버킷 확인
mc ls local/
```

### PM2 재시작
```bash
pm2 restart booking --update-env
pm2 logs booking --lines 50
```


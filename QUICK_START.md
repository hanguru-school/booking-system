# 🚀 빠른 시작 가이드

## ✅ 완료된 작업 (sudo 없이)

1. ✅ Node/pnpm/PM2 설치
   - Node: v20.19.5
   - pnpm: v10.23.0
   - PM2: v6.0.14

2. ✅ 디렉터리 생성
   - `/home/malmoi/booking-system`
   - `/home/malmoi/repos/booking-system.git`

3. ✅ Git 배포 파이프라인
   - post-receive 훅 생성 완료

---

## 🔧 남은 작업 (sudo 권한 필요)

서버에 SSH 접속 후 다음 명령 실행:

```bash
ssh -o BatchMode=yes -o PreferredAuthentications=publickey -o StrictHostKeyChecking=accept-new malmoi@192.168.1.41
# 또는 Tailscale 사용 시: ssh -o BatchMode=yes -o PreferredAuthentications=publickey -o StrictHostKeyChecking=accept-new malmoi@100.80.210.105

# 스크립트 실행 권한 부여
chmod +x ~/scripts/*.sh 2>/dev/null || true

# 전체 설정 실행 (한 번에)
bash ~/scripts/setup-complete.sh
```

---

## 📦 스크립트 위치

모든 스크립트는 서버의 `~/scripts/` 디렉터리에 있습니다:

- `server-bootstrap.sh` - 기본 패키지/타임존
- `setup-postgresql.sh` - PostgreSQL 설치 및 DB 생성
- `setup-minio.sh` - MinIO 설치 및 버킷 생성
- `setup-env-secrets.sh` - 환경변수 시크릿 설정
- `setup-backups.sh` - 백업 자동화
- `setup-firewall.sh` - 방화벽 설정
- `setup-complete.sh` - 전체 통합 실행

---

## 🚀 첫 배포

로컬에서:

```bash
cd /Users/jinasmacbook/booking-system

# 서버 원격 저장소 추가
git remote remove server 2>/dev/null || true
git remote add server ssh://malmoi@192.168.1.41/home/malmoi/repos/booking-system.git
# 또는 Tailscale 사용 시: git remote add server ssh://malmoi@100.80.210.105/home/malmoi/repos/booking-system.git

# 배포
git push server main
```

---

## 🔍 검증

서버에서:

```bash
# 서비스 상태
sudo systemctl status postgresql
sudo systemctl status minio
pm2 list

# 애플리케이션
curl -fsS http://localhost:3000/
```

---

자세한 내용은 `DEPLOYMENT_SETUP_COMPLETE.md` 참고


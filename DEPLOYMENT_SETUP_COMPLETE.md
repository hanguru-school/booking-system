# 서버 배포 환경 완전 설정 가이드

**작성일**: 2025-11-27  
**서버**: malmoi@192.168.1.41 (Ubuntu 24.04) 또는 Tailscale 100.80.210.105

---

## ✅ 완료된 작업 (sudo 없이)

1. ✅ **Node/PM2 설정**
   - pnpm v10.23.0 설치 완료
   - PM2 v6.0.14 설치 완료
   - 비대화식 셸 가드 추가 완료

2. ✅ **디렉터리 표준화**
   - `/home/malmoi/booking-system` - 프로젝트 디렉터리
   - `/home/malmoi/repos/booking-system.git` - 베어 저장소

3. ✅ **Git 배포 파이프라인**
   - post-receive 훅 생성 완료
   - 자동 배포 스크립트 설정됨

---

## 🔧 남은 작업 (sudo 권한 필요)

서버에 SSH로 접속하여 다음 스크립트를 실행하세요:

```bash
# 서버에 접속
ssh -o BatchMode=yes -o PreferredAuthentications=publickey -o StrictHostKeyChecking=accept-new malmoi@192.168.1.41
# 또는 Tailscale 사용 시: ssh -o BatchMode=yes -o PreferredAuthentications=publickey -o StrictHostKeyChecking=accept-new malmoi@100.80.210.105

# 스크립트 실행 권한 부여
chmod +x ~/scripts/*.sh

# 전체 설정 실행
bash ~/scripts/setup-complete.sh
```

또는 단계별로 실행:

```bash
# 1. 기본 패키지/타임존
bash ~/scripts/server-bootstrap.sh

# 2. PostgreSQL
bash ~/scripts/setup-postgresql.sh

# 3. MinIO
bash ~/scripts/setup-minio.sh

# 4. 환경변수 시크릿
bash ~/scripts/setup-env-secrets.sh

# 5. 백업 자동화
bash ~/scripts/setup-backups.sh

# 6. 방화벽
bash ~/scripts/setup-firewall.sh
```

---

## 📋 설정 스크립트 상세

### 1. server-bootstrap.sh
- 기본 패키지 설치 (git, curl, build-essential, unzip, jq, net-tools, openssl, ufw)
- 자동 보안 업데이트 설정
- 타임존 Asia/Tokyo 설정
- 디렉터리 생성 (`/srv/malmoi`, `/etc/malmoi`)

### 2. setup-postgresql.sh
- PostgreSQL 설치
- DB 유저 생성: `malmoi_admin`
- DB 생성: `malmoi_system`
- 강한 랜덤 비밀번호 생성 및 `/etc/malmoi/booking.env`에 저장
- DATABASE_URL 환경변수 설정

### 3. setup-minio.sh
- MinIO 바이너리 설치
- MinIO systemd 서비스 설정
- 루트 자격 증명 생성 및 저장
- 버킷 `malmoi-system-files` 생성
- mc (MinIO Client) 설치
- S3 호환 환경변수 설정

### 4. setup-env-secrets.sh
- `/etc/malmoi/booking.env` 기본 환경변수 설정
- NODE_ENV, PORT, SMTP 설정 등

### 5. setup-backups.sh
- DB 백업 스크립트 (`/usr/local/bin/backup-database.sh`)
- 파일 백업 스크립트 (`/usr/local/bin/backup-files.sh`)
- 복원 리허설 스크립트 (`/usr/local/bin/backup-restore-test.sh`)
- Cron 작업 등록

### 6. setup-firewall.sh
- UFW 방화벽 설정
- OpenSSH 허용
- 내부망(192.168.0.0/16)에서 3000, 9000, 9001 포트 허용
- Tailscale(100.0.0.0/8) 네트워크 허용

---

## 🚀 배포 방법

### 로컬에서 첫 배포

```bash
# 로컬 프로젝트 디렉터리에서
cd /Users/jinasmacbook/booking-system

# 서버 원격 저장소 추가
git remote remove server 2>/dev/null || true
git remote add server ssh://malmoi@192.168.1.41/home/malmoi/repos/booking-system.git
# 또는 Tailscale 사용 시: git remote add server ssh://malmoi@100.80.210.105/home/malmoi/repos/booking-system.git

# 배포
git push server main
```

### 이후 배포

```bash
# 변경사항 커밋 후
git push server main
```

배포가 자동으로 실행됩니다:
1. 코드 체크아웃/업데이트
2. 의존성 설치 (`pnpm install --frozen-lockfile`)
3. Prisma 마이그레이션 (`pnpm prisma migrate deploy`)
4. 빌드 (`pnpm build`)
5. PM2 재시작

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
# DB 목록
psql -U malmoi_admin -h localhost -d malmoi_system -c "\l"

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
# 로컬에서
curl -fsS http://localhost:3000/

# 서버에서
curl -fsS http://127.0.0.1:3000/
```

---

## 📁 디렉터리 구조

```
/home/malmoi/
├── booking-system/          # 프로젝트 디렉터리
├── repos/
│   └── booking-system.git/  # 베어 저장소
└── scripts/                 # 설정 스크립트

/srv/malmoi/
├── uploads/                 # 로컬 업로드 (fallback)
├── minio/                   # MinIO 데이터
└── backups/
    ├── database/            # DB 백업
    │   ├── daily/
    │   ├── weekly/
    │   └── monthly/
    └── files/               # 파일 백업

/etc/malmoi/
└── booking.env              # 환경변수 시크릿 (root:root, 600)
```

---

## 🔐 환경변수 파일

`/etc/malmoi/booking.env` (root 소유, 600 권한)

주요 환경변수:
- `DATABASE_URL` - PostgreSQL 연결 문자열
- `MINIO_ROOT_USER` - MinIO 루트 사용자
- `MINIO_ROOT_PASSWORD` - MinIO 루트 비밀번호
- `AWS_ACCESS_KEY_ID` - S3 호환 액세스 키 (MinIO 루트 사용자)
- `AWS_SECRET_ACCESS_KEY` - S3 호환 시크릿 키 (MinIO 루트 비밀번호)
- `AWS_S3_BUCKET` - 버킷 이름
- `S3_ENDPOINT` - MinIO 엔드포인트
- `S3_FORCE_PATH_STYLE` - 경로 스타일 강제
- `NODE_ENV` - production
- `PORT` - 3000
- `SMTP_*` - 이메일 설정

---

## 🔄 UGREEN DXP2800으로 파일 저장 이전 시

1. DXP2800에서 MinIO 실행
2. `/etc/malmoi/booking.env` 수정:
   ```bash
   sudo nano /etc/malmoi/booking.env
   
   # 변경
   S3_ENDPOINT=http://<DXP2800-IP>:9000
   AWS_ACCESS_KEY_ID=<DXP2800-MinIO-User>
   AWS_SECRET_ACCESS_KEY=<DXP2800-MinIO-Password>
   ```
3. 기존 데이터 마이그레이션:
   ```bash
   # 로컬 MinIO → DXP2800
   mc mirror local/malmoi-system-files dxp2800/malmoi-system-files
   ```
4. PM2 재시작:
   ```bash
   pm2 restart booking
   ```

---

## 📊 백업 스케줄

- **DB 백업**: 매일 02:00 (`/srv/malmoi/backups/database/daily/`)
- **파일 백업**: 매일 02:30 (`/srv/malmoi/backups/files/`)
- **복원 테스트**: 매월 1일 03:00

### 백업 보관 정책
- 일일: 30일
- 주간: 12주
- 월간: 12개월

### 수동 백업
```bash
# DB 백업
/usr/local/bin/backup-database.sh

# 파일 백업
/usr/local/bin/backup-files.sh
```

---

## 🛡️ 보안 설정

### 방화벽 규칙
- OpenSSH: 모든 IP 허용
- 포트 3000: 내부망(192.168.0.0/16) + Tailscale(100.0.0.0/8)만 허용
- 포트 9000/9001: 내부망(192.168.0.0/16) + Tailscale(100.0.0.0/8)만 허용

### 파일 권한
- `/etc/malmoi/booking.env`: root:root, 600
- `/srv/malmoi/uploads`: malmoi:malmoi, 750
- `/srv/malmoi/backups`: malmoi:malmoi, 750

---

## ⚠️ 문제 해결

### PostgreSQL 접속 실패
```bash
# 서비스 상태 확인
sudo systemctl status postgresql

# 로그 확인
sudo journalctl -u postgresql -n 50
```

### MinIO 접속 실패
```bash
# 서비스 상태 확인
sudo systemctl status minio

# 로그 확인
sudo journalctl -u minio -n 50

# 포트 확인
sudo netstat -tlnp | grep 9000
```

### 배포 실패
```bash
# 배포 로그 확인
tail -f ~/.pm2/logs/deploy.log

# PM2 상태 확인
pm2 list
pm2 logs booking --lines 100
```

---

## 📝 다음 단계

1. ✅ 서버 설정 스크립트 실행 (sudo 권한 필요)
2. ✅ 첫 배포 실행 (`git push server main`)
3. ✅ 서비스 검증
4. ✅ (선택) Nginx 리버스 프록시 설정

---

## 📚 참고 문서

- `DATA_STORAGE_ANALYSIS.md` - 데이터 저장 방식 분석
- `DEPLOYMENT_GUIDE_GIT.md` - Git 배포 가이드
- `DEPLOYMENT_GUIDE_RSYNC.md` - Rsync 배포 가이드


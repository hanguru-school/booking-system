# 🚀 지금 바로 배포하기

## 현재 상황

✅ **로컬 변경사항**: 완료
- 환경변수 파일 정리 (AWS 제거)
- 코드 최적화 (MinIO 호환)
- 스크립트 업데이트

❌ **서버 상태**: 아직 배포 안 됨
- 서버의 코드는 8월 초 버전 (오래됨)
- Git 저장소가 아직 설정되지 않음
- 환경변수 파일 없음
- PM2 설치 안 됨

---

## 배포 방법

### 방법 1: Git 배포 (권장)

```bash
# 1. 변경사항 커밋
cd /Users/jinasmacbook/booking-system
git add .
git commit -m "서버 설정 정리: AWS 제거, 로컬 PostgreSQL/MinIO 설정"

# 2. 서버 remote 추가
git remote remove server 2>/dev/null || true
git remote add server ssh://malmoi@192.168.1.41/home/malmoi/repos/booking-system.git
# 또는 Tailscale: git remote add server ssh://malmoi@100.80.210.105/home/malmoi/repos/booking-system.git

# 3. 배포
git push server feature/production-system-setup:main
```

### 방법 2: Rsync 배포 (빠른 테스트용)

```bash
cd /Users/jinasmacbook/booking-system

# Rsync로 파일 전송
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
  ./ malmoi@192.168.1.41:~/booking-system/

# 서버에서 빌드 및 재시작
ssh malmoi@192.168.1.41 << 'ENDSSH'
cd ~/booking-system
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
export PATH="$HOME/.local/bin:$PATH"
pnpm install --frozen-lockfile
pnpm build
pm2 restart booking || pm2 start "pnpm start" --name booking --time
ENDSSH
```

---

## 서버 설정 (최초 1회)

서버에 SSH 접속 후:

```bash
ssh malmoi@192.168.1.41
# 또는 Tailscale: ssh malmoi@100.80.210.105

# 1. 스크립트 실행 권한 부여
chmod +x ~/scripts/*.sh 2>/dev/null || true

# 2. 전체 설정 실행 (sudo 권한 필요)
bash ~/scripts/setup-complete.sh
```

이 스크립트가 다음을 수행합니다:
- PostgreSQL 설치 및 DB 생성
- MinIO 설치 및 버킷 생성
- 환경변수 설정 (`/etc/malmoi/booking.env`)
- 백업 자동화
- 방화벽 설정

---

## 배포 후 확인

```bash
# 서버에서
curl http://localhost:3000/api/health
pm2 logs booking --lines 50
```

---

## 주의사항

1. **서버 설정 스크립트를 먼저 실행**해야 합니다 (PostgreSQL, MinIO 등)
2. **환경변수 파일** (`/etc/malmoi/booking.env`)이 생성되어야 합니다
3. **Git 배포 파이프라인**이 설정되어야 자동 배포가 작동합니다

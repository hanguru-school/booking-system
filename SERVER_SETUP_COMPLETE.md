# 서버 설정 완료 보고서

## 📋 설정 완료 항목

### ✅ 1. 기본 패키지/보안 설정

**상태**: ⚠️ sudo 권한 필요 (스크립트 제공됨)

서버에서 다음 스크립트를 실행하여 완료하세요:

```bash
# 서버에 업로드된 스크립트 실행
ssh malmoi@100.80.210.105 "bash ~/server-setup-sudo.sh"

# 또는 로컬에서 실행
./scripts/server-setup-sudo.sh
```

**포함 작업**:
- `apt update && apt upgrade`
- 필수 패키지 설치 (git, curl, build-essential, unzip)
- 자동 보안 업데이트 설정
- 타임존 설정 (Asia/Tokyo)

### ✅ 2. Node 런타임 설정

**상태**: ✅ 완료

- **Node.js**: v20.19.5 (nvm으로 설치됨)
- **pnpm**: v10.23.0 (사용자 디렉터리에 설치)
- **PM2**: v6.0.14 (사용자 디렉터리에 설치)

**설치 위치**:
- pnpm: `~/.local/bin/pnpm`
- PM2: `~/.local/bin/pm2`

### ✅ 3. 디렉터리 구조

**상태**: ✅ 완료

- 앱 루트: `/home/malmoi/booking-system` ✅
- 베어 저장소: `/home/malmoi/repos/booking-system.git` ✅
- 로그 디렉터리: `/home/malmoi/.pm2/logs` ✅

### ✅ 4. Git 푸시 배포 파이프라인

**상태**: ✅ 완료

**베어 저장소**: `/home/malmoi/repos/booking-system.git`

**post-receive 훅**: `/home/malmoi/repos/booking-system.git/hooks/post-receive`
- 실행 권한: ✅ 설정됨
- 멱등성: ✅ 보장됨
- 로그: `~/.pm2/logs/deploy.log`

**배포 프로세스**:
1. 프로젝트 업데이트 (git fetch && git reset --hard)
2. 의존성 설치 (pnpm install --frozen-lockfile)
3. Prisma 생성 (prisma generate)
4. 빌드 (pnpm run build)
5. PM2 재시작/시작

### ✅ 5. Rsync 대안 배포

**상태**: ✅ 스크립트 제공됨

**스크립트 위치**: `./scripts/deploy-rsync.sh`

**사용법**:
```bash
./scripts/deploy-rsync.sh
```

**제외 디렉터리**:
- `.git`, `node_modules`, `.next`, `.turbo`, `.DS_Store`, `*.log`, `.env.local`

### ✅ 6. 비대화식 중단 요인 제거

**상태**: ✅ 완료

**~/.bashrc 설정**:
- 비대화식 가드: `[[ $- != *i* ]] && return` ✅
- PATH 설정: `~/.local/bin` 추가 ✅
- NVM 설정: 자동 로드 ✅

### ✅ 7. 서비스 확인

**상태**: ⚠️ 첫 배포 필요

**현재 PM2 프로세스**: 없음 (첫 배포 후 시작됨)

**확인 명령**:
```bash
# PM2 상태
ssh malmoi@100.80.210.105 "pm2 list"

# 서비스 응답
ssh malmoi@100.80.210.105 "curl -fsS http://localhost:3000/"

# 배포 로그
ssh malmoi@100.80.210.105 "tail -f ~/.pm2/logs/deploy.log"
```

## 🚀 배포 방법

### 방법 1: Git 푸시 배포 (권장)

```bash
# 로컬에서 원격 저장소 추가 (최초 1회)
git remote add server ssh://malmoi@100.80.210.105/home/malmoi/repos/booking-system.git

# 배포
git push server main
```

자세한 내용: [DEPLOYMENT_GUIDE_GIT.md](./DEPLOYMENT_GUIDE_GIT.md)

### 방법 2: Rsync 배포

```bash
./scripts/deploy-rsync.sh
```

자세한 내용: [DEPLOYMENT_GUIDE_RSYNC.md](./DEPLOYMENT_GUIDE_RSYNC.md)

## 📁 생성된 파일 목록

### 서버에 생성된 파일

```
/home/malmoi/repos/booking-system.git/
  └── hooks/
      └── post-receive (2.3KB, 실행 권한)

/home/malmoi/.bashrc (수정됨)
  - 비대화식 가드 추가
  - PATH 설정 추가
  - NVM 설정 추가

/home/malmoi/server-setup-sudo.sh (업로드됨)
```

### 로컬에 생성된 파일

```
scripts/
  ├── server-setup-sudo.sh (sudo 작업용 스크립트)
  └── deploy-rsync.sh (Rsync 배포 스크립트)

DEPLOYMENT_GUIDE_GIT.md (Git 푸시 배포 가이드)
DEPLOYMENT_GUIDE_RSYNC.md (Rsync 배포 가이드)
SERVER_SETUP_COMPLETE.md (이 문서)
```

## 🔧 남은 작업

### 1. sudo 작업 실행 (필수)

서버에 SSH로 접속하여 다음을 실행:

```bash
bash ~/server-setup-sudo.sh
```

또는 로컬에서:

```bash
ssh malmoi@100.80.210.105 "bash ~/server-setup-sudo.sh"
```

### 2. 첫 배포 실행

Git 푸시 배포:

```bash
git remote add server ssh://malmoi@100.80.210.105/home/malmoi/repos/booking-system.git
git push server main
```

또는 Rsync 배포:

```bash
./scripts/deploy-rsync.sh
```

### 3. 서비스 확인

```bash
# PM2 상태
ssh malmoi@100.80.210.105 "pm2 list"

# 서비스 응답
ssh malmoi@100.80.210.105 "curl -fsS http://localhost:3000/"

# 로그 확인
ssh malmoi@100.80.210.105 "pm2 logs booking --lines 50"
```

## 🔐 SSH 접속 정보

**서버**: `malmoi@100.80.210.105`

**SSH 옵션** (비대화식 환경):
```bash
-o BatchMode=yes -o PreferredAuthentications=publickey -o StrictHostKeyChecking=accept-new
```

**예시**:
```bash
ssh -o BatchMode=yes -o PreferredAuthentications=publickey -o StrictHostKeyChecking=accept-new malmoi@100.80.210.105
```

## 📊 설정 요약

| 항목 | 상태 | 비고 |
|------|------|------|
| 기본 패키지 | ⚠️ | sudo 스크립트 실행 필요 |
| Node.js | ✅ | v20.19.5 |
| pnpm | ✅ | v10.23.0 |
| PM2 | ✅ | v6.0.14 |
| 베어 저장소 | ✅ | `/home/malmoi/repos/booking-system.git` |
| post-receive 훅 | ✅ | 자동 배포 설정됨 |
| 비대화식 가드 | ✅ | ~/.bashrc 수정됨 |
| 첫 배포 | ⚠️ | 실행 필요 |

## 🎯 다음 단계

1. ✅ sudo 작업 스크립트 실행
2. ✅ 첫 배포 실행 (Git 푸시 또는 Rsync)
3. ✅ 서비스 확인 및 테스트
4. ✅ (선택) 역프록시 설정 (nginx 등)

## 📝 참고사항

- 모든 설정은 **멱등(idempotent)**하게 설계되어 있어 여러 번 실행해도 안전합니다.
- 배포 실패 시 이전 버전이 계속 실행됩니다.
- PM2는 프로세스 자동 재시작이 설정되어 있습니다.
- 배포 로그는 `~/.pm2/logs/deploy.log`에 저장됩니다.

## 🆘 문제 해결

### 배포 실패 시

1. 배포 로그 확인:
   ```bash
   ssh malmoi@100.80.210.105 "cat ~/.pm2/logs/deploy.log"
   ```

2. PM2 상태 확인:
   ```bash
   ssh malmoi@100.80.210.105 "pm2 list && pm2 logs booking --lines 100"
   ```

3. 수동 배포:
   ```bash
   ssh malmoi@100.80.210.105
   cd ~/booking-system
   git pull origin main
   pnpm install --frozen-lockfile
   pnpm run build
   pm2 restart booking
   ```

### SSH 연결 문제

공개키 인증이 설정되어 있는지 확인:

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
ssh-copy-id malmoi@100.80.210.105
```


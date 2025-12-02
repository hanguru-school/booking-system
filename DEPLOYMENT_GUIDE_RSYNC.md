# Rsync 배포 가이드

이 가이드는 Rsync를 사용하여 파일을 동기화하고 서버에서 빌드하는 방법을 설명합니다.

## 배포 스크립트 사용

프로젝트 루트에서 다음 명령을 실행하세요:

```bash
./scripts/deploy-rsync.sh
```

## 수동 배포

### 1. 파일 동기화

```bash
rsync -azP --delete \
  --exclude '.git' \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.turbo' \
  --exclude '.DS_Store' \
  --exclude '*.log' \
  --exclude '.env.local' \
  -e "ssh -o BatchMode=yes -o PreferredAuthentications=publickey -o StrictHostKeyChecking=accept-new" \
  ./ malmoi@100.80.210.105:/home/malmoi/booking-system/
```

### 2. 서버에서 빌드 및 재시작

```bash
ssh -o BatchMode=yes -o PreferredAuthentications=publickey -o StrictHostKeyChecking=accept-new malmoi@100.80.210.105 << 'ENDSSH'
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
export PATH="$HOME/.local/bin:$PATH"

cd ~/booking-system

# 의존성 설치
pnpm install --frozen-lockfile || npm ci

# Prisma 생성
npx prisma generate

# 빌드
pnpm run build || npm run build

# PM2 재시작
pm2 restart booking || pm2 start "npm run start" --name booking --time
pm2 save
ENDSSH
```

## 제외 디렉터리

다음 디렉터리/파일은 동기화에서 제외됩니다:

- `.git` - Git 저장소
- `node_modules` - 의존성 패키지
- `.next` - Next.js 빌드 결과물
- `.turbo` - Turborepo 캐시
- `.DS_Store` - macOS 시스템 파일
- `*.log` - 로그 파일
- `.env.local` - 로컬 환경 변수

## 장점

- **빠른 동기화**: 변경된 파일만 전송
- **세밀한 제어**: 어떤 파일을 제외할지 명시적으로 지정
- **대용량 파일**: `.git`이나 `node_modules`를 제외하여 전송량 감소

## 단점

- **수동 실행**: Git 푸시처럼 자동화되지 않음
- **로컬 변경사항**: 커밋하지 않은 변경사항도 전송됨

## 서비스 확인

배포 후 서비스 상태 확인:

```bash
# PM2 상태
ssh malmoi@100.80.210.105 "pm2 list"

# PM2 로그
ssh malmoi@100.80.210.105 "pm2 logs booking --lines 50"

# 서비스 응답 확인
ssh malmoi@100.80.210.105 "curl -fsS http://localhost:3000/"
```

## 문제 해결

### Rsync 실패 시

1. **SSH 연결 확인**:
   ```bash
   ssh malmoi@100.80.210.105 "echo '연결 성공'"
   ```

2. **권한 확인**:
   ```bash
   ssh malmoi@100.80.210.105 "ls -ld ~/booking-system"
   ```

### 빌드 실패 시

서버에 직접 접속하여 수동으로 빌드:

```bash
ssh malmoi@100.80.210.105
cd ~/booking-system
pnpm install
pnpm run build
pm2 restart booking
```

## Git 푸시 배포와 비교

| 항목 | Git 푸시 배포 | Rsync 배포 |
|------|--------------|-----------|
| 자동화 | ✅ 자동 | ❌ 수동 |
| 커밋 필요 | ✅ 필요 | ❌ 불필요 |
| 속도 | 보통 | 빠름 |
| 제어 | 낮음 | 높음 |
| 추천 | 프로덕션 | 개발/테스트 |


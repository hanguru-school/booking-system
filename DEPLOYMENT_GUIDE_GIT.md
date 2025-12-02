# Git 푸시 배포 가이드

이 가이드는 서버에 설정된 Git 베어 저장소를 사용하여 자동 배포하는 방법을 설명합니다.

## 서버 설정 완료 상태

✅ Git 베어 저장소: `/home/malmoi/repos/booking-system.git`
✅ post-receive 훅: 자동 배포 스크립트 설정됨
✅ PM2: 프로세스 관리자 설치됨
✅ pnpm: 패키지 매니저 설치됨

## 로컬에서 Git 원격 저장소 추가

로컬 프로젝트 디렉터리에서 다음 명령을 실행하세요:

```bash
# Git 원격 저장소 추가 (이미 추가되어 있으면 생략)
git remote add server ssh://malmoi@100.80.210.105/home/malmoi/repos/booking-system.git

# 또는 기존 원격 저장소 확인
git remote -v
```

## 배포 방법

### 1. 기본 배포 (main 브랜치)

```bash
# 변경사항 커밋
git add .
git commit -m "배포 메시지"

# 서버로 푸시 (자동 배포 트리거)
git push server main
```

### 2. 다른 브랜치 배포

```bash
# 현재 브랜치를 서버의 main으로 푸시
git push server <현재-브랜치>:main
```

## 배포 프로세스

`git push`를 실행하면 서버의 `post-receive` 훅이 자동으로 다음을 수행합니다:

1. **프로젝트 업데이트**: `git fetch && git reset --hard origin/main`
2. **의존성 설치**: `pnpm install --frozen-lockfile`
3. **Prisma 생성**: `prisma generate`
4. **빌드**: `pnpm run build`
5. **PM2 재시작**: `pm2 restart booking` 또는 `pm2 start`

## 배포 로그 확인

서버에 SSH로 접속하여 배포 로그를 확인할 수 있습니다:

```bash
# 배포 로그 확인
ssh malmoi@100.80.210.105 "tail -f ~/.pm2/logs/deploy.log"

# PM2 프로세스 상태
ssh malmoi@100.80.210.105 "pm2 list"

# PM2 로그 확인
ssh malmoi@100.80.210.105 "pm2 logs booking --lines 50"
```

## 서비스 확인

배포 후 서비스가 정상적으로 실행되는지 확인:

```bash
# 서버에서 확인
ssh malmoi@100.80.210.105 "curl -fsS http://localhost:3000/"

# 또는 브라우저에서
# http://100.80.210.105:3000
```

## 문제 해결

### 배포 실패 시

1. **배포 로그 확인**:
   ```bash
   ssh malmoi@100.80.210.105 "cat ~/.pm2/logs/deploy.log"
   ```

2. **PM2 상태 확인**:
   ```bash
   ssh malmoi@100.80.210.105 "pm2 list && pm2 logs booking --lines 100"
   ```

3. **수동 배포**:
   ```bash
   ssh malmoi@100.80.210.105
   cd ~/booking-system
   git pull origin main
   pnpm install --frozen-lockfile
   pnpm run build
   pm2 restart booking
   ```

### 첫 배포 시

첫 배포는 프로젝트 디렉터리를 클론하므로 시간이 더 걸릴 수 있습니다.

## SSH 옵션

비대화식 환경에서도 작동하도록 다음 SSH 옵션을 사용합니다:

```bash
-o BatchMode=yes -o PreferredAuthentications=publickey -o StrictHostKeyChecking=accept-new
```

## 참고사항

- 배포는 **멱등(idempotent)**하게 설계되어 있어 여러 번 실행해도 안전합니다.
- 빌드 실패 시 배포가 중단되며, 이전 버전이 계속 실행됩니다.
- PM2는 프로세스가 자동으로 재시작되도록 설정되어 있습니다.


# 간단한 배포 가이드

SSH 연결이 느리거나 멈출 때 사용할 수 있는 방법들입니다.

## 방법 1: Git 사용 (추천) ⭐

가장 안정적인 방법입니다.

### 1단계: 로컬에서 커밋 & 푸시
```bash
# 변경사항 커밋
git add src/app/admin/reservations/page.tsx
git commit -m "fix: 예약 페이지 모든 항목 표시"
git push origin feature/production-system-setup
```

### 2단계: 서버에서 pull
```bash
# 서버에 SSH 접속
ssh malmoi@hanguru-system-server

# 프로젝트 디렉토리로 이동
cd ~/booking-system

# 최신 코드 가져오기
git pull origin feature/production-system-setup
```

**장점:** 
- SSH 연결이 안정적
- 변경 이력 추적 가능
- 롤백 쉬움

---

## 방법 2: SSH 설정 개선

SSH 연결 타임아웃 문제를 해결합니다.

### SSH 설정 파일 수정
```bash
# ~/.ssh/config 파일 열기
nano ~/.ssh/config

# 다음 내용 추가
Host hanguru-system-server
  HostName hanguru-system-server
  User malmoi
  ConnectTimeout 15
  ServerAliveInterval 5
  ServerAliveCountMax 3
  TCPKeepAlive yes
```

또는 자동 설정:
```bash
./ssh-config-setup.sh
```

---

## 방법 3: 수동 파일 복사

가장 간단하지만 수동 작업이 필요합니다.

### 로컬에서 실행
```bash
# 단일 파일 배포
scp src/app/admin/reservations/page.tsx malmoi@hanguru-system-server:~/booking-system/src/app/admin/reservations/page.tsx
```

### 서버에서 확인
```bash
ssh malmoi@hanguru-system-server
cd ~/booking-system
ls -la src/app/admin/reservations/page.tsx
```

---

## 방법 4: 스크립트 사용

### Git 배포 스크립트
```bash
./deploy-via-git.sh "커밋 메시지"
```

### 단일 파일 배포 스크립트
```bash
./deploy-single-file.sh src/app/admin/reservations/page.tsx
```

---

## 현재 수정된 파일

- `src/app/admin/reservations/page.tsx` - 모든 예약 항목 표시

## 배포 후 확인

1. 서버에서 페이지 새로고침
2. 캘린더에서 예약이 모두 표시되는지 확인
3. "+N개 더" 메시지가 사라졌는지 확인



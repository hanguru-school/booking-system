# 이메일 설정 가이드

## office@hanguru.school 이메일 전송 설정

### 현재 상태
- ✅ SMTP 설정 구조가 `.env` 파일에 추가되었습니다
- ⚠️  **SMTP_PASS (비밀번호)를 수동으로 설정해야 합니다**

### 설정 방법

#### 방법 1: 원격 서버에서 직접 설정 (권장)

```bash
ssh malmoi@hanguru-system-server
cd ~/booking-system
nano .env
```

`.env` 파일에서 다음 줄을 찾아서:
```
SMTP_PASS=your_app_password
```

실제 Gmail 앱 비밀번호로 변경:
```
SMTP_PASS=실제_앱_비밀번호
```

#### 방법 2: Gmail 앱 비밀번호 생성

1. **Google 계정 설정**
   - https://myaccount.google.com 접속
   - 보안 → 2단계 인증 활성화

2. **앱 비밀번호 생성**
   - https://myaccount.google.com/apppasswords 접속
   - "앱 선택" → "메일"
   - "기기 선택" → "기타(맞춤 이름)" → "MalMoi System" 입력
   - 생성된 16자리 비밀번호 복사

3. **.env 파일에 설정**
   ```bash
   SMTP_PASS=생성된_16자리_비밀번호
   ```

#### 방법 3: 다른 이메일 서비스 사용

office@hanguru.school이 Gmail이 아닌 경우:

```bash
ssh malmoi@hanguru-system-server
cd ~/booking-system
nano .env
```

다음 설정을 수정:
```
SMTP_HOST=실제_SMTP_서버
SMTP_PORT=587
SMTP_USER=office@hanguru.school
SMTP_PASS=실제_비밀번호
SMTP_SECURE=false  # 465 포트 사용 시 true
EMAIL_FROM=office@hanguru.school
```

### 서버 재시작

설정 후 서버를 재시작해야 합니다:

```bash
./restart-remote-server.sh
```

또는 원격 서버에서:
```bash
cd ~/booking-system
pkill -f "next dev"
sleep 2
npm run dev > dev.log 2>&1 &
```

### 테스트

설정이 완료되면 학생 관리 페이지에서 패스워드 재설정을 테스트해보세요.

### 문제 해결

#### 이메일이 전송되지 않는 경우

1. **로그 확인**
   ```bash
   ssh malmoi@hanguru-system-server
   tail -f ~/booking-system/dev.log | grep -i email
   ```

2. **SMTP 설정 확인**
   ```bash
   ssh malmoi@hanguru-system-server
   cd ~/booking-system
   grep -E '^SMTP_|^EMAIL_FROM' .env
   ```

3. **일반적인 오류**
   - "Invalid login": SMTP_USER 또는 SMTP_PASS가 잘못됨
   - "Connection timeout": SMTP_HOST 또는 SMTP_PORT가 잘못됨
   - "Authentication failed": Gmail 앱 비밀번호가 필요함

### 현재 설정 확인

```bash
ssh malmoi@hanguru-system-server "cd ~/booking-system && grep -E '^SMTP_|^EMAIL_FROM' .env"
```



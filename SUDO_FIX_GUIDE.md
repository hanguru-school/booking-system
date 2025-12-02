# sudo 패스워드 문제 해결 가이드

## 문제
비대화식 SSH 접속에서는 sudo 패스워드를 입력할 수 없어서 스크립트 실행이 실패합니다.

## 해결 방법

### 방법 1: 서버에 직접 접속해서 NOPASSWD 설정 (권장)

```bash
# 1. 서버에 SSH 접속 (대화식 모드)
ssh malmoi@192.168.1.41
# 또는 Tailscale: ssh malmoi@100.80.210.105

# 2. NOPASSWD 설정 스크립트 실행
chmod +x ~/scripts/fix-sudo-nopasswd.sh
bash ~/scripts/fix-sudo-nopasswd.sh
```

또는 수동으로:

```bash
# sudoers 파일 생성
echo "malmoi ALL=(ALL) NOPASSWD: ALL" | sudo tee /etc/sudoers.d/malmoi-nopasswd
sudo chmod 0440 /etc/sudoers.d/malmoi-nopasswd

# 설정 확인
sudo visudo -c
```

### 방법 2: sudo 없이 실행 가능한 작업만 진행

일부 작업은 sudo 없이도 가능합니다:

```bash
# PM2 재시작 (sudo 불필요)
pm2 restart booking

# 환경변수 확인 (sudo 불필요)
cat ~/booking-system/.env

# 로그 확인 (sudo 불필요)
pm2 logs booking
```

### 방법 3: sudoers 파일 직접 수정

서버에 접속해서:

```bash
sudo visudo
```

다음 줄 추가:
```
malmoi ALL=(ALL) NOPASSWD: ALL
```

## 보안 주의사항

NOPASSWD 설정은 보안상 위험할 수 있습니다. 다음을 권장합니다:

1. **특정 명령어만 허용** (더 안전):
   ```
   malmoi ALL=(ALL) NOPASSWD: /usr/bin/systemctl, /usr/bin/apt, /usr/bin/dpkg-reconfigure
   ```

2. **특정 스크립트만 허용**:
   ```
   malmoi ALL=(ALL) NOPASSWD: /home/malmoi/scripts/*.sh
   ```

3. **IP 제한** (가능한 경우):
   ```
   malmoi ALL=(ALL) NOPASSWD: ALL
   # 특정 IP에서만 접속 허용
   ```

## 설정 후 확인

```bash
# NOPASSWD 테스트
sudo -n echo "성공" && echo "✅ NOPASSWD 작동" || echo "❌ 실패"

# 스크립트 실행 테스트
bash ~/scripts/setup-complete.sh
```

## 다음 단계

NOPASSWD 설정 후:

```bash
# 전체 설정 스크립트 실행
bash ~/scripts/setup-complete.sh
```

이제 sudo 패스워드 없이 모든 스크립트가 실행됩니다.


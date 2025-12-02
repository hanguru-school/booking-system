# 서버 접속 가이드

## 서버 정보
- **서버 IP**: `192.168.1.41` (로컬 네트워크) 또는 `100.80.210.105` (Tailscale)
- **사용자**: `malmoi`
- **포트**: `22` (기본 SSH 포트)
- **인증**: SSH 공개키 인증

## 접속 방법

### 1. 기본 SSH 접속

```bash
# 로컬 네트워크 사용 시
ssh malmoi@192.168.1.41

# Tailscale 사용 시
ssh malmoi@100.80.210.105
```

### 2. SSH 옵션 포함 (권장)

```bash
# StrictHostKeyChecking 옵션 포함 (처음 접속 시 자동으로 호스트 키 추가)
ssh -o StrictHostKeyChecking=accept-new malmoi@192.168.1.41

# 또는 Tailscale 사용 시
ssh -o StrictHostKeyChecking=accept-new malmoi@100.80.210.105
```

### 3. 특정 SSH 키 파일 지정

```bash
# SSH 키 파일 경로 지정 (필요한 경우)
ssh -i ~/.ssh/id_rsa malmoi@192.168.1.41
```

### 4. SSH 설정 파일 사용 (편리함)

`~/.ssh/config` 파일에 다음을 추가하면 더 편리하게 접속할 수 있습니다:

```bash
# ~/.ssh/config 파일 편집
nano ~/.ssh/config
```

다음 내용 추가:

```
Host booking-server
    HostName 192.168.1.41
    User malmoi
    StrictHostKeyChecking accept-new
    IdentityFile ~/.ssh/id_rsa

Host booking-server-tailscale
    HostName 100.80.210.105
    User malmoi
    StrictHostKeyChecking accept-new
    IdentityFile ~/.ssh/id_rsa
```

설정 후 간단하게 접속:

```bash
# 로컬 네트워크
ssh booking-server

# Tailscale
ssh booking-server-tailscale
```

## 접속 후 작업

### 환경변수 파일 생성

```bash
# 데이터베이스 연결 문제 해결 (환경변수 파일 생성 포함)
sudo bash ~/scripts/fix-database-connection.sh
```

### PM2 재시작

```bash
# PM2 재시작 (ecosystem.config.js 사용)
cd ~/booking-system
pm2 delete booking || true
pm2 start ecosystem.config.js
pm2 save

# 상태 확인
pm2 list
pm2 logs booking --lines 20
```

### 서비스 확인

```bash
# PostgreSQL 상태
sudo systemctl status postgresql

# MinIO 상태
sudo systemctl status minio

# PM2 상태
pm2 list

# 애플리케이션 Health Check
curl http://localhost:3000/api/health
```

## 문제 해결

### SSH 접속이 안 될 때

1. **네트워크 확인**
   ```bash
   ping 192.168.1.41
   # 또는
   ping 100.80.210.105
   ```

2. **SSH 서비스 확인** (서버에서)
   ```bash
   sudo systemctl status ssh
   ```

3. **방화벽 확인** (서버에서)
   ```bash
   sudo ufw status
   ```

### 권한 문제

```bash
# SSH 키 권한 확인
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub
```

## 빠른 참조

```bash
# 접속
ssh malmoi@192.168.1.41

# 환경변수 파일 생성 및 데이터베이스 설정
sudo bash ~/scripts/fix-database-connection.sh

# PM2 재시작
cd ~/booking-system && pm2 restart booking

# 로그 확인
pm2 logs booking --lines 50

# 서비스 상태 확인
pm2 list
sudo systemctl status postgresql
sudo systemctl status minio
```


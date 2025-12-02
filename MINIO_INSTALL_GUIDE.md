# MinIO 설치 가이드

## 현재 상황
- PostgreSQL: ✅ 설치 및 실행 중
- MinIO: ❌ 설치 실패 (다운로드 URL 오류 + sudo 권한 필요)

## 해결 방법

서버에 직접 접속해서 다음 명령을 실행하세요:

```bash
# 1. 서버 접속
ssh malmoi@192.168.1.41
# 또는 Tailscale: ssh malmoi@100.80.210.105

# 2. MinIO 다운로드 및 설치
curl -fsSL -o /tmp/minio https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x /tmp/minio
sudo mv /tmp/minio /usr/local/bin/minio

# 3. MinIO 설치 확인
minio --version

# 4. MinIO 설정 스크립트 실행
bash ~/scripts/setup-minio.sh
```

또는 전체 설정 스크립트를 다시 실행:

```bash
bash ~/scripts/setup-complete.sh
```

## MinIO 수동 설정 (스크립트 실패 시)

```bash
# 1. 환경변수 파일 확인/생성
sudo mkdir -p /etc/malmoi
sudo chmod 750 /etc/malmoi

# 2. MinIO 자격 증명 생성
MINIO_USER=$(openssl rand -hex 16)
MINIO_PASS=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)

echo "MINIO_ROOT_USER=$MINIO_USER" | sudo tee -a /etc/malmoi/booking.env
echo "MINIO_ROOT_PASSWORD=$MINIO_PASS" | sudo tee -a /etc/malmoi/booking.env

# 3. systemd 서비스 파일 생성
sudo tee /etc/systemd/system/minio.service > /dev/null <<EOF
[Unit]
Description=MinIO Object Storage
After=network-online.target
Wants=network-online.target

[Service]
EnvironmentFile=/etc/malmoi/booking.env
ExecStart=/usr/local/bin/minio server /srv/malmoi/minio --console-address ":9001"
User=malmoi
Group=malmoi
Restart=always
RestartSec=5
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF

# 4. 서비스 시작
sudo systemctl daemon-reload
sudo systemctl enable minio
sudo systemctl start minio
sudo systemctl status minio

# 5. mc 클라이언트 설치
curl -fsSL -o /tmp/mc https://dl.min.io/client/mc/release/linux-amd64/mc
chmod +x /tmp/mc
sudo mv /tmp/mc /usr/local/bin/mc

# 6. 버킷 생성
export MINIO_ROOT_USER
export MINIO_ROOT_PASSWORD
MINIO_ROOT_USER=$(grep '^MINIO_ROOT_USER=' /etc/malmoi/booking.env | cut -d= -f2)
MINIO_ROOT_PASSWORD=$(grep '^MINIO_ROOT_PASSWORD=' /etc/malmoi/booking.env | cut -d= -f2)

mc alias set local http://127.0.0.1:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD"
mc mb local/malmoi-system-files || true

# 7. 환경변수 업데이트
echo "AWS_ACCESS_KEY_ID=$MINIO_ROOT_USER" | sudo tee -a /etc/malmoi/booking.env
echo "AWS_SECRET_ACCESS_KEY=$MINIO_ROOT_PASSWORD" | sudo tee -a /etc/malmoi/booking.env
echo "AWS_S3_BUCKET=malmoi-system-files" | sudo tee -a /etc/malmoi/booking.env
echo "S3_ENDPOINT=http://127.0.0.1:9000" | sudo tee -a /etc/malmoi/booking.env
echo "S3_FORCE_PATH_STYLE=true" | sudo tee -a /etc/malmoi/booking.env
echo "AWS_REGION=ap-northeast-1" | sudo tee -a /etc/malmoi/booking.env

sudo chmod 600 /etc/malmoi/booking.env
```

## 확인

```bash
# MinIO 서비스 상태
sudo systemctl status minio

# 버킷 확인
mc ls local/

# PM2 재시작 (환경변수 적용)
pm2 restart booking --update-env
```


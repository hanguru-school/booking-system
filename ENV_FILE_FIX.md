# 환경변수 파일 권한 문제 해결

## 문제
`/etc/malmoi/booking.env` 파일에 대한 권한 오류가 발생했습니다.

## 해결 방법

서버에 접속해서 다음 명령을 실행하세요:

```bash
# 1. 환경변수 파일 생성 및 권한 설정
sudo mkdir -p /etc/malmoi
sudo chmod 750 /etc/malmoi

# 2. 수정된 스크립트 실행
bash ~/scripts/setup-env-secrets.sh

# 3. 권한 확인 및 수정 (필요시)
sudo chmod 640 /etc/malmoi/booking.env
sudo chown root:malmoi /etc/malmoi/booking.env

# 4. 파일 확인
cat /etc/malmoi/booking.env
```

또는 수동으로 파일 생성:

```bash
sudo tee /etc/malmoi/booking.env > /dev/null <<'EOF'
# 데이터베이스 (PostgreSQL에서 생성된 값 사용)
DATABASE_URL=postgresql://malmoi_admin:<PASSWORD>@localhost:5432/malmoi_system?sslmode=disable

# 파일 스토리지 (MinIO에서 생성된 값 사용)
AWS_REGION=ap-northeast-1
AWS_S3_BUCKET=malmoi-system-files
AWS_ACCESS_KEY_ID=<MINIO_ROOT_USER>
AWS_SECRET_ACCESS_KEY=<MINIO_ROOT_PASSWORD>
S3_ENDPOINT=http://127.0.0.1:9000
S3_FORCE_PATH_STYLE=true
S3_BUCKET_NAME=malmoi-system-files

# 애플리케이션
NODE_ENV=production
PORT=3000
NEXTAUTH_URL=http://192.168.1.41:3000
NEXT_PUBLIC_APP_URL=http://192.168.1.41:3000

# 이메일
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=office@hanguru.school
SMTP_PASS=
EMAIL_FROM=office@hanguru.school
EOF

sudo chmod 640 /etc/malmoi/booking.env
sudo chown root:malmoi /etc/malmoi/booking.env
```

## MinIO 자격 증명 확인

MinIO 자격 증명을 확인하려면:

```bash
# MinIO가 실행 중이면 기본값 사용 가능
# 또는 setup-minio.sh가 생성한 값 확인
sudo grep MINIO_ROOT /etc/malmoi/booking.env
```

## PM2 재시작

환경변수 파일 생성 후:

```bash
set -a
source /etc/malmoi/booking.env
set +a
pm2 restart booking --update-env
```


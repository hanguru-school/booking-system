# 환경변수 파일 생성 가이드

## 문제
`/etc/malmoi/booking.env` 파일이 생성되지 않았습니다.

## 해결 방법

서버에 접속해서 다음 명령을 실행하세요:

```bash
# 1. 디렉터리 확인 및 생성
sudo mkdir -p /etc/malmoi
sudo chmod 750 /etc/malmoi

# 2. PostgreSQL 비밀번호 확인 (이미 생성되어 있을 수 있음)
# setup-postgresql.sh가 생성한 비밀번호 확인
sudo grep DB_PASS /etc/malmoi/booking.env 2>/dev/null || echo "DB_PASS 없음"

# 3. MinIO 자격 증명 확인
sudo grep MINIO_ROOT /etc/malmoi/booking.env 2>/dev/null || echo "MINIO_ROOT 없음"

# 4. 환경변수 파일 생성 (기존 값이 있으면 사용, 없으면 새로 생성)
sudo tee /etc/malmoi/booking.env > /dev/null <<'EOF'
# 데이터베이스
DATABASE_URL=postgresql://malmoi_admin:$(sudo grep DB_PASS /etc/malmoi/booking.env 2>/dev/null | cut -d= -f2 || echo "malmoi_admin_password_2024")@localhost:5432/malmoi_system?sslmode=disable

# 파일 스토리지 (MinIO)
AWS_REGION=ap-northeast-1
AWS_S3_BUCKET=malmoi-system-files
AWS_ACCESS_KEY_ID=$(sudo grep MINIO_ROOT_USER /etc/malmoi/booking.env 2>/dev/null | cut -d= -f2 || echo "minioadmin")
AWS_SECRET_ACCESS_KEY=$(sudo grep MINIO_ROOT_PASSWORD /etc/malmoi/booking.env 2>/dev/null | cut -d= -f2 || echo "minioadmin")
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

# 5. 권한 설정 (읽기 가능하도록)
sudo chmod 644 /etc/malmoi/booking.env
sudo chown root:root /etc/malmoi/booking.env

# 6. 파일 확인
cat /etc/malmoi/booking.env
```

## 더 간단한 방법

기존 스크립트를 다시 실행:

```bash
# setup-postgresql.sh가 DB_PASS를 생성했는지 확인
sudo cat /etc/malmoi/booking.env 2>/dev/null | grep DB_PASS

# setup-minio.sh가 MINIO_ROOT를 생성했는지 확인
sudo cat /etc/malmoi/booking.env 2>/dev/null | grep MINIO_ROOT

# 없으면 전체 스크립트 재실행
bash ~/scripts/setup-complete.sh
```

## PM2 재시작

파일 생성 후:

```bash
# 환경변수 적용
set -a
source /etc/malmoi/booking.env
set +a

# PM2 재시작
pm2 restart booking --update-env

# 확인
pm2 logs booking --lines 20
```


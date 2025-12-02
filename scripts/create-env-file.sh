#!/bin/bash
# 환경변수 파일 생성 스크립트 (sudo 권한 필요)
# 멱등성 보장: 이미 설정되어 있어도 재실행 가능

set -euo pipefail

echo "=== 환경변수 파일 생성 ==="

ENV_FILE="/etc/malmoi/booking.env"

# 디렉터리 생성
sudo mkdir -p /etc/malmoi
sudo chmod 750 /etc/malmoi

# 기존 파일에서 값 가져오기 (있으면)
DB_PASS=$(sudo grep '^DB_PASS=' "$ENV_FILE" 2>/dev/null | cut -d= -f2 || echo "")
MINIO_ROOT_USER=$(sudo grep '^MINIO_ROOT_USER=' "$ENV_FILE" 2>/dev/null | cut -d= -f2 || echo "")
MINIO_ROOT_PASSWORD=$(sudo grep '^MINIO_ROOT_PASSWORD=' "$ENV_FILE" 2>/dev/null | cut -d= -f2 || echo "")

# 없으면 생성
if [ -z "$DB_PASS" ]; then
    DB_PASS=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-24)
    echo "DB_PASS=$DB_PASS" | sudo tee "$ENV_FILE" >/dev/null
    echo "✅ DB_PASS 생성됨"
fi

if [ -z "$MINIO_ROOT_USER" ]; then
    MINIO_ROOT_USER=$(openssl rand -hex 16)
    echo "MINIO_ROOT_USER=$MINIO_ROOT_USER" | sudo tee -a "$ENV_FILE" >/dev/null
    echo "✅ MINIO_ROOT_USER 생성됨"
fi

if [ -z "$MINIO_ROOT_PASSWORD" ]; then
    MINIO_ROOT_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    echo "MINIO_ROOT_PASSWORD=$MINIO_ROOT_PASSWORD" | sudo tee -a "$ENV_FILE" >/dev/null
    echo "✅ MINIO_ROOT_PASSWORD 생성됨"
fi

# 환경변수 파일 생성/업데이트
echo "📝 환경변수 파일 생성 중..."

sudo tee "$ENV_FILE" >/dev/null <<EOF
# 데이터베이스 (로컬 PostgreSQL)
DATABASE_URL=postgresql://malmoi_admin:${DB_PASS}@localhost:5432/malmoi_system?sslmode=disable
DB_PASS=${DB_PASS}

# 파일 스토리지 (Object Storage - MinIO 호환)
OBJECT_STORAGE_BUCKET=malmoi-system-files
OBJECT_STORAGE_ENDPOINT=http://127.0.0.1:9000
OBJECT_STORAGE_FORCE_PATH_STYLE=true
OBJECT_STORAGE_ACCESS_KEY=${MINIO_ROOT_USER}
OBJECT_STORAGE_SECRET_KEY=${MINIO_ROOT_PASSWORD}
OBJECT_STORAGE_REGION=local
MINIO_ROOT_USER=${MINIO_ROOT_USER}
MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD}

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

# 권한 설정 (읽기 가능하도록)
sudo chmod 644 "$ENV_FILE"
sudo chown root:root "$ENV_FILE"

echo "✅ 환경변수 파일 생성 완료: $ENV_FILE"
echo "권한: $(sudo stat -c '%a %U:%G' "$ENV_FILE")"

# 파일 내용 확인 (마스킹)
echo ""
echo "=== 생성된 환경변수 (일부) ==="
sudo grep -E "^DATABASE_URL=|^OBJECT_STORAGE_ENDPOINT=|^OBJECT_STORAGE_BUCKET=" "$ENV_FILE" | sed 's/:[^@]*@/:***@/g' | sed 's/=.*/=***/g' || true


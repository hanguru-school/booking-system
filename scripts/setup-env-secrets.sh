#!/bin/bash
# 환경변수 시스템 시크릿 주입 스크립트 (sudo 권한 필요)
# 멱등성 보장: 이미 설정되어 있어도 재실행 가능

set -euo pipefail

echo "=== 환경변수 시스템 시크릿 설정 ==="

# /etc/malmoi/booking.env 파일 확인 및 기본값 설정
ENV_FILE="/etc/malmoi/booking.env"

# 파일이 없으면 생성
if [ ! -f "$ENV_FILE" ]; then
    sudo touch "$ENV_FILE"
sudo chmod 640 "$ENV_FILE"
sudo chown root:malmoi "$ENV_FILE"
fi

# 기본 환경변수 추가 (존재하지 않으면 추가)
echo "📝 환경변수 설정 중..."

# NODE_ENV
if ! grep -q '^NODE_ENV=' "$ENV_FILE" 2>/dev/null; then
    echo "NODE_ENV=production" | sudo tee -a "$ENV_FILE" >/dev/null
fi

# PORT
if ! grep -q '^PORT=' "$ENV_FILE" 2>/dev/null; then
    echo "PORT=3000" | sudo tee -a "$ENV_FILE" >/dev/null
fi

# SMTP 설정 (비어있으면 기본값)
if ! grep -q '^SMTP_HOST=' "$ENV_FILE" 2>/dev/null; then
    echo "SMTP_HOST=smtp.gmail.com" | sudo tee -a "$ENV_FILE" >/dev/null
fi
if ! grep -q '^SMTP_PORT=' "$ENV_FILE" 2>/dev/null; then
    echo "SMTP_PORT=587" | sudo tee -a "$ENV_FILE" >/dev/null
fi
if ! grep -q '^SMTP_SECURE=' "$ENV_FILE" 2>/dev/null; then
    echo "SMTP_SECURE=false" | sudo tee -a "$ENV_FILE" >/dev/null
fi
if ! grep -q '^SMTP_USER=' "$ENV_FILE" 2>/dev/null; then
    echo "SMTP_USER=office@hanguru.school" | sudo tee -a "$ENV_FILE" >/dev/null
fi
if ! grep -q '^SMTP_PASS=' "$ENV_FILE" 2>/dev/null; then
    echo "SMTP_PASS=" | sudo tee -a "$ENV_FILE" >/dev/null
fi

# DATABASE_URL은 setup-postgresql.sh에서 설정됨
# MinIO 관련은 setup-minio.sh에서 설정됨

echo "✅ 환경변수 설정 완료"
echo "환경변수 파일: $ENV_FILE"
echo "권한: $(ls -l "$ENV_FILE" | awk '{print $1, $3, $4}')"


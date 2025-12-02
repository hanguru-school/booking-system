#!/bin/bash
# 환경변수 마이그레이션 스크립트 (AWS_* → OBJECT_STORAGE_*)
# 서버에서 실행: sudo bash ~/scripts/migrate-env-vars.sh

set -euo pipefail

echo "=== 환경변수 마이그레이션 (AWS_* → OBJECT_STORAGE_*) ==="

ENV_FILE="/etc/malmoi/booking.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ 환경변수 파일이 없습니다: $ENV_FILE"
    exit 1
fi

# 1) 기존 값을 읽어 새 키로 매핑
echo "📖 기존 환경변수 읽기 중..."
source "$ENV_FILE"

# 2) 새 변수 추가 (기존 값이 있으면 사용, 없으면 기본값)
echo "📝 새 환경변수 추가 중..."
sudo tee -a "$ENV_FILE" >/dev/null <<'ENV'

# === OBJECT STORAGE (neutral naming) ===
OBJECT_STORAGE_BUCKET=${OBJECT_STORAGE_BUCKET:-${AWS_S3_BUCKET:-malmoi-system-files}}
OBJECT_STORAGE_ENDPOINT=${OBJECT_STORAGE_ENDPOINT:-${S3_ENDPOINT:-http://127.0.0.1:9000}}
OBJECT_STORAGE_FORCE_PATH_STYLE=${OBJECT_STORAGE_FORCE_PATH_STYLE:-${S3_FORCE_PATH_STYLE:-true}}
OBJECT_STORAGE_ACCESS_KEY=${OBJECT_STORAGE_ACCESS_KEY:-${AWS_ACCESS_KEY_ID}}
OBJECT_STORAGE_SECRET_KEY=${OBJECT_STORAGE_SECRET_KEY:-${AWS_SECRET_ACCESS_KEY}}
OBJECT_STORAGE_REGION=${OBJECT_STORAGE_REGION:-local}
ENV

# 3) 더 이상 쓰지 않을 AWS_* 키는 주석 처리
echo "🔇 기존 AWS_* 변수 주석 처리 중..."
sudo sed -i \
  -e 's/^AWS_S3_BUCKET=/# AWS_S3_BUCKET=/' \
  -e 's/^AWS_ACCESS_KEY_ID=/# AWS_ACCESS_KEY_ID=/' \
  -e 's/^AWS_SECRET_ACCESS_KEY=/# AWS_SECRET_ACCESS_KEY=/' \
  -e 's/^AWS_REGION=/# AWS_REGION=/' \
  -e 's/^S3_ENDPOINT=/# S3_ENDPOINT=/' \
  -e 's/^S3_FORCE_PATH_STYLE=/# S3_FORCE_PATH_STYLE=/' \
  -e 's/^S3_BUCKET_NAME=/# S3_BUCKET_NAME=/' \
  "$ENV_FILE"

echo "✅ 환경변수 마이그레이션 완료"
echo ""
echo "=== 새 환경변수 확인 ==="
sudo grep -E '^OBJECT_STORAGE_' "$ENV_FILE" | sed 's/=.*/=***/g' || echo "새 변수 없음"


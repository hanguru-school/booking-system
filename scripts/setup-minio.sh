#!/bin/bash
# MinIO 로컬 설치 스크립트 (sudo 권한 필요)
# 멱등성 보장: 이미 설정되어 있어도 재실행 가능

set -euo pipefail

echo "=== MinIO 설치 및 설정 ==="

# 1. MinIO 바이너리 설치
echo "📦 MinIO 설치 중..."
if ! command -v minio &> /dev/null; then
    # 최신 안정 버전 사용
    MINIO_VER="RELEASE.2024-12-13T19-20-15Z"
    curl -fsSL -o /tmp/minio "https://dl.min.io/server/minio/release/linux-amd64/archive/minio.${MINIO_VER}" || {
        echo "⚠️ 특정 버전 다운로드 실패, 최신 버전 시도 중..."
        curl -fsSL -o /tmp/minio "https://dl.min.io/server/minio/release/linux-amd64/minio"
    }
    chmod +x /tmp/minio
    sudo mv /tmp/minio /usr/local/bin/minio
    echo "✅ MinIO 설치됨"
else
    echo "✅ MinIO 이미 설치됨"
fi

# 2. MinIO 루트 자격 증명 생성
echo "🔐 MinIO 자격 증명 생성 중..."
if ! grep -q '^MINIO_ROOT_USER=' /etc/malmoi/booking.env 2>/dev/null; then
    MINIO_ACCESS=$(openssl rand -hex 16)
    echo "MINIO_ROOT_USER=$MINIO_ACCESS" | sudo tee -a /etc/malmoi/booking.env >/dev/null
    echo "✅ MINIO_ROOT_USER 생성됨"
else
    MINIO_ACCESS=$(grep '^MINIO_ROOT_USER=' /etc/malmoi/booking.env | cut -d= -f2)
    echo "✅ 기존 MINIO_ROOT_USER 사용"
fi

if ! grep -q '^MINIO_ROOT_PASSWORD=' /etc/malmoi/booking.env 2>/dev/null; then
    MINIO_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    echo "MINIO_ROOT_PASSWORD=$MINIO_SECRET" | sudo tee -a /etc/malmoi/booking.env >/dev/null
    echo "✅ MINIO_ROOT_PASSWORD 생성됨"
else
    MINIO_SECRET=$(grep '^MINIO_ROOT_PASSWORD=' /etc/malmoi/booking.env | cut -d= -f2)
    echo "✅ 기존 MINIO_ROOT_PASSWORD 사용"
fi

# 3. MinIO 데이터 디렉터리
echo "📁 MinIO 데이터 디렉터리 설정 중..."
sudo mkdir -p /srv/malmoi/minio
sudo chown -R malmoi:malmoi /srv/malmoi/minio

# 4. MinIO systemd 유닛 생성
echo "⚙️ MinIO systemd 서비스 설정 중..."
sudo tee /etc/systemd/system/minio.service >/dev/null <<'UNIT'
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
UNIT

sudo systemctl daemon-reload

# 5. MinIO 서비스 시작
echo "🚀 MinIO 서비스 시작 중..."
if sudo systemctl is-active --quiet minio; then
    sudo systemctl restart minio
    echo "✅ MinIO 재시작됨"
else
    sudo systemctl enable --now minio
    echo "✅ MinIO 시작됨"
fi

# MinIO 시작 대기
sleep 5

# 6. mc (MinIO Client) 설치
echo "📦 MinIO Client 설치 중..."
if ! command -v mc &> /dev/null; then
    curl -fsSL -o /tmp/mc "https://dl.min.io/client/mc/release/linux-amd64/mc"
    chmod +x /tmp/mc
    sudo mv /tmp/mc /usr/local/bin/mc
    echo "✅ mc 설치됨"
else
    echo "✅ mc 이미 설치됨"
fi

# 7. MinIO 버킷 생성
echo "🪣 MinIO 버킷 생성 중..."
export MINIO_ROOT_USER
export MINIO_ROOT_PASSWORD
MINIO_ROOT_USER=$(grep '^MINIO_ROOT_USER=' /etc/malmoi/booking.env | cut -d= -f2)
MINIO_ROOT_PASSWORD=$(grep '^MINIO_ROOT_PASSWORD=' /etc/malmoi/booking.env | cut -d= -f2)

# alias 설정
mc alias set local http://127.0.0.1:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" 2>/dev/null || \
mc alias set local http://127.0.0.1:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD"

# 버킷 생성 (존재하면 무시)
if mc ls local/malmoi-system-files &>/dev/null; then
    echo "✅ 버킷 malmoi-system-files 이미 존재"
else
    mc mb local/malmoi-system-files
    echo "✅ 버킷 malmoi-system-files 생성됨"
fi

# 버킷 정책 설정 (private 기본)
mc anonymous set download local/malmoi-system-files 2>/dev/null || true
echo "✅ 버킷 정책 설정됨"

# 8. 환경변수 주입 (Object Storage - 중립적 이름)
echo "📝 Object Storage 환경변수 설정 중..."
if ! grep -q '^OBJECT_STORAGE_ACCESS_KEY=' /etc/malmoi/booking.env 2>/dev/null; then
    echo "OBJECT_STORAGE_ACCESS_KEY=$MINIO_ROOT_USER" | sudo tee -a /etc/malmoi/booking.env >/dev/null
fi
if ! grep -q '^OBJECT_STORAGE_SECRET_KEY=' /etc/malmoi/booking.env 2>/dev/null; then
    echo "OBJECT_STORAGE_SECRET_KEY=$MINIO_ROOT_PASSWORD" | sudo tee -a /etc/malmoi/booking.env >/dev/null
fi
if ! grep -q '^OBJECT_STORAGE_BUCKET=' /etc/malmoi/booking.env 2>/dev/null; then
    echo "OBJECT_STORAGE_BUCKET=malmoi-system-files" | sudo tee -a /etc/malmoi/booking.env >/dev/null
fi
if ! grep -q '^OBJECT_STORAGE_ENDPOINT=' /etc/malmoi/booking.env 2>/dev/null; then
    echo "OBJECT_STORAGE_ENDPOINT=http://127.0.0.1:9000" | sudo tee -a /etc/malmoi/booking.env >/dev/null
fi
if ! grep -q '^OBJECT_STORAGE_FORCE_PATH_STYLE=' /etc/malmoi/booking.env 2>/dev/null; then
    echo "OBJECT_STORAGE_FORCE_PATH_STYLE=true" | sudo tee -a /etc/malmoi/booking.env >/dev/null
fi
if ! grep -q '^OBJECT_STORAGE_REGION=' /etc/malmoi/booking.env 2>/dev/null; then
    echo "OBJECT_STORAGE_REGION=local" | sudo tee -a /etc/malmoi/booking.env >/dev/null
fi

echo "✅ MinIO 설정 완료"


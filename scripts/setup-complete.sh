#!/bin/bash
# 전체 서버 설정 통합 스크립트 (sudo 권한 필요)
# 멱등성 보장: 이미 설정되어 있어도 재실행 가능

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=========================================="
echo "서버 완전 설정 스크립트"
echo "=========================================="
echo ""

# 1. 부트스트랩
echo "1/7: 기본 패키지/타임존/업데이트"
bash "$SCRIPT_DIR/server-bootstrap.sh"
echo ""

# 2. PostgreSQL
echo "2/7: PostgreSQL 설치 및 초기화"
bash "$SCRIPT_DIR/setup-postgresql.sh"
echo ""

# 3. MinIO
echo "3/7: MinIO 설치 및 설정"
bash "$SCRIPT_DIR/setup-minio.sh"
echo ""

# 4. 환경변수 시크릿
echo "4/7: 환경변수 시스템 시크릿 설정"
bash "$SCRIPT_DIR/setup-env-secrets.sh"
echo ""

# 5. 백업 자동화
echo "5/7: 백업 자동화 설정"
bash "$SCRIPT_DIR/setup-backups.sh"
echo ""

# 6. 방화벽
echo "6/7: 방화벽 설정"
bash "$SCRIPT_DIR/setup-firewall.sh"
echo ""

# 7. Git 배포 (이미 설정됨, 확인만)
echo "7/7: Git 배포 파이프라인 확인"
if [ -f "$HOME/repos/booking-system.git/hooks/post-receive" ]; then
    echo "✅ Git 배포 파이프라인 이미 설정됨"
else
    bash "$SCRIPT_DIR/setup-git-deploy.sh"
fi
echo ""

echo "=========================================="
echo "✅ 모든 설정 완료!"
echo "=========================================="
echo ""
echo "다음 단계:"
echo "1. 서비스 상태 확인:"
echo "   sudo systemctl status postgresql"
echo "   sudo systemctl status minio"
echo "   pm2 list"
echo ""
echo "2. 로컬에서 배포:"
echo "   git remote add server ssh://malmoi@192.168.1.41/home/malmoi/repos/booking-system.git"
echo "   # 또는 Tailscale 사용 시:"
echo "   git remote add server ssh://malmoi@100.80.210.105/home/malmoi/repos/booking-system.git"
echo "   git push server main"
echo ""


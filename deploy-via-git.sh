#!/bin/bash

# Git을 통한 배포 (SSH 연결 문제 우회)
# 로컬에서 Git push → 서버에서 Git pull

COMMIT_MESSAGE=${1:-"fix: 예약 페이지 모든 항목 표시"}

echo "📦 Git을 통한 배포 시작..."
echo ""

# 현재 변경사항 확인
if [ -z "$(git status --porcelain)" ]; then
  echo "⚠️  변경사항이 없습니다."
  exit 0
fi

# 변경사항 표시
echo "변경된 파일:"
git status --short
echo ""

# 커밋 및 푸시
echo "💾 커밋 중..."
git add src/app/admin/reservations/page.tsx
git commit -m "$COMMIT_MESSAGE" || echo "⚠️  커밋 실패 (이미 커밋됨?)"

echo "📤 GitHub에 푸시 중..."
git push origin feature/production-system-setup

echo ""
echo "✅ 로컬 푸시 완료!"
echo ""
echo "📋 다음 단계: 서버에서 다음 명령을 실행하세요:"
echo ""
echo "   ssh malmoi@hanguru-system-server"
echo "   cd ~/booking-system"
echo "   git pull origin feature/production-system-setup"
echo ""
echo "   또는 자동으로 pull하려면:"
echo "   ssh malmoi@hanguru-system-server 'cd ~/booking-system && git pull origin feature/production-system-setup'"



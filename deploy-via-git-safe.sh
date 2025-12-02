#!/bin/bash

# Git 기반 안전한 배포 (로컬에서 실행)
# Git push → 서버가 자동으로 pull & 빌드

COMMIT_MESSAGE=${1:-"fix: 예약 페이지 모든 항목 표시"}

REMOTE_USER="malmoi"
REMOTE_HOST="100.80.210.105"
REPO_DIR="/home/malmoi/repos/booking-system.git"

# SSH 옵션
SSH_OPTS="-o BatchMode=yes -o PreferredAuthentications=publickey -o StrictHostKeyChecking=accept-new"

echo "📦 Git 기반 배포 시작..."
echo ""

# 현재 브랜치 확인
CURRENT_BRANCH=$(git branch --show-current)
echo "현재 브랜치: $CURRENT_BRANCH"
echo ""

# 변경사항 확인
if [ -z "$(git status --porcelain)" ]; then
  echo "⚠️  변경사항이 없습니다."
  read -p "그래도 배포하시겠습니까? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 0
  fi
fi

# 변경사항 표시
echo "변경된 파일:"
git status --short
echo ""

# 커밋
echo "💾 커밋 중..."
git add -A
git commit -m "$COMMIT_MESSAGE" || {
  echo "⚠️  커밋 실패 (이미 커밋됨 또는 변경사항 없음)"
  read -p "계속하시겠습니까? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 0
  fi
}

# server remote 확인
if ! git remote | grep -q "^server$"; then
  echo "📝 Git remote 'server' 추가 중..."
  git remote add server ssh://${REMOTE_USER}@${REMOTE_HOST}${REPO_DIR} 2>/dev/null || {
    echo "⚠️  remote 추가 실패 (이미 존재할 수 있음)"
  }
fi

# 푸시
echo "📤 서버에 푸시 중..."
if git push server $CURRENT_BRANCH 2>&1; then
  echo ""
  echo "✅ 배포 완료!"
  echo ""
  echo "서버에서 자동으로:"
  echo "  - 코드 업데이트"
  echo "  - 의존성 설치"
  echo "  - 빌드"
  echo "  - 서비스 재시작"
  echo ""
  echo "💡 배포 상태 확인:"
  echo "   ssh ${REMOTE_USER}@${REMOTE_HOST} 'tail -f ~/booking-system/dev.log'"
else
  echo ""
  echo "❌ 푸시 실패"
  echo ""
  echo "Git 기반 배포가 설정되지 않았을 수 있습니다."
  echo "서버에서 setup-git-deploy.sh를 참고하여 설정하세요."
  exit 1
fi



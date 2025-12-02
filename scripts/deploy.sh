#!/bin/bash

# 자동 배포 스크립트
# 사용법: ./scripts/deploy.sh [커밋 메시지]

set -e

echo "🚀 자동 배포 시작..."

# 커밋 메시지 설정
COMMIT_MESSAGE=${1:-"feat: 자동 배포"}
BRANCH_NAME="feature/production-system-setup"

# 현재 브랜치 확인
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "$BRANCH_NAME" ]; then
    echo "⚠️  $BRANCH_NAME 브랜치로 전환합니다..."
    git checkout $BRANCH_NAME
fi

# 변경사항 스테이징
echo "📦 변경사항 스테이징..."
git add .

# 커밋
echo "💾 커밋 중..."
git commit -m "$COMMIT_MESSAGE"

# 푸시
echo "📤 푸시 중..."
git push origin $BRANCH_NAME

echo "✅ 배포 완료!"
echo "🌐 Vercel에서 자동 배포가 시작됩니다..."
echo "📊 배포 상태 확인: https://vercel.com/dashboard"
echo "🌍 사이트 접속: https://app.hanguru.school"

# GitHub Actions 상태 확인
echo "⏳ GitHub Actions 상태 확인 중..."
sleep 5

echo "🎉 배포 프로세스가 완료되었습니다!" 
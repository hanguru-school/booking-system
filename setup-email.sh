#!/bin/bash

# 이메일 SMTP 설정 스크립트
# office@hanguru.school로 이메일을 보내도록 설정

REMOTE_USER="malmoi"
REMOTE_HOST="hanguru-system-server"
REMOTE_DIR="~/booking-system"

echo "📧 이메일 SMTP 설정 시작..."
echo ""
echo "office@hanguru.school로 이메일을 보내기 위한 SMTP 설정이 필요합니다."
echo ""
echo "다음 정보를 입력해주세요:"
echo ""

# SMTP 설정 입력 받기
read -p "SMTP 호스트 (예: smtp.gmail.com): " SMTP_HOST
read -p "SMTP 포트 (예: 587): " SMTP_PORT
read -p "SMTP 사용자명 (이메일 주소, 예: office@hanguru.school): " SMTP_USER
read -s -p "SMTP 비밀번호 (앱 비밀번호): " SMTP_PASS
echo ""

# 기본값 설정
SMTP_HOST=${SMTP_HOST:-smtp.gmail.com}
SMTP_PORT=${SMTP_PORT:-587}
SMTP_USER=${SMTP_USER:-office@hanguru.school}

echo ""
echo "설정할 내용:"
echo "  SMTP_HOST: $SMTP_HOST"
echo "  SMTP_PORT: $SMTP_PORT"
echo "  SMTP_USER: $SMTP_USER"
echo "  EMAIL_FROM: office@hanguru.school"
echo ""

read -p "이 설정을 적용하시겠습니까? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo "취소되었습니다."
    exit 0
fi

# 원격 서버에 SMTP 설정 추가
ssh ${REMOTE_USER}@${REMOTE_HOST} << ENDSSH
cd ${REMOTE_DIR}

# 기존 SMTP 설정 제거
sed -i '/^SMTP_HOST=/d' .env
sed -i '/^SMTP_PORT=/d' .env
sed -i '/^SMTP_USER=/d' .env
sed -i '/^SMTP_PASS=/d' .env
sed -i '/^SMTP_SECURE=/d' .env
sed -i '/^EMAIL_FROM=/d' .env

# 새로운 SMTP 설정 추가
echo "" >> .env
echo "# 이메일 SMTP 설정" >> .env
echo "SMTP_HOST=$SMTP_HOST" >> .env
echo "SMTP_PORT=$SMTP_PORT" >> .env
echo "SMTP_USER=$SMTP_USER" >> .env
echo "SMTP_PASS=$SMTP_PASS" >> .env
echo "SMTP_SECURE=false" >> .env
echo "EMAIL_FROM=office@hanguru.school" >> .env

echo "✅ SMTP 설정이 추가되었습니다."
echo ""
echo "현재 설정:"
grep -E '^SMTP_|^EMAIL_FROM' .env
ENDSSH

echo ""
echo "✅ 이메일 설정 완료!"
echo ""
echo "⚠️  서버를 재시작해야 설정이 적용됩니다."
echo "   ./restart-remote-server.sh 를 실행하세요."



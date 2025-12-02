#!/bin/bash

# 자동 이메일 SMTP 설정 스크립트 (Gmail 기본값 사용)
# office@hanguru.school로 이메일을 보내도록 설정

REMOTE_USER="malmoi"
REMOTE_HOST="hanguru-system-server"
REMOTE_DIR="~/booking-system"

echo "📧 이메일 SMTP 설정 (Gmail 기본값)"
echo ""
echo "office@hanguru.school로 이메일을 보내기 위한 Gmail SMTP 설정을 적용합니다."
echo ""
echo "⚠️  주의: Gmail을 사용하려면:"
echo "   1. Google 계정에서 2단계 인증 활성화"
echo "   2. 앱 비밀번호 생성"
echo "   3. 생성된 앱 비밀번호를 SMTP_PASS에 설정"
echo ""

# Gmail SMTP 기본 설정
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="office@hanguru.school"
SMTP_SECURE="false"
EMAIL_FROM="office@hanguru.school"

# SMTP 비밀번호 입력 받기
read -s -p "Gmail 앱 비밀번호를 입력하세요: " SMTP_PASS
echo ""

if [ -z "$SMTP_PASS" ]; then
    echo "❌ 비밀번호가 입력되지 않았습니다."
    exit 1
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
echo "# 이메일 SMTP 설정 (office@hanguru.school)" >> .env
echo "SMTP_HOST=$SMTP_HOST" >> .env
echo "SMTP_PORT=$SMTP_PORT" >> .env
echo "SMTP_USER=$SMTP_USER" >> .env
echo "SMTP_PASS=$SMTP_PASS" >> .env
echo "SMTP_SECURE=$SMTP_SECURE" >> .env
echo "EMAIL_FROM=$EMAIL_FROM" >> .env

echo "✅ SMTP 설정이 추가되었습니다."
echo ""
echo "현재 설정:"
grep -E '^SMTP_|^EMAIL_FROM' .env | sed 's/PASS=.*/PASS=***/'
ENDSSH

echo ""
echo "✅ 이메일 설정 완료!"
echo ""
echo "🔄 서버를 재시작합니다..."

# 서버 재시작
ssh ${REMOTE_USER}@${REMOTE_HOST} << 'ENDSSH'
cd ~/booking-system

echo "🛑 기존 서버 종료 중..."
pkill -f "next dev" 2>/dev/null
pkill -f "next-server" 2>/dev/null
sleep 3

echo "🚀 서버 시작 중..."
nohup npm run dev > dev.log 2>&1 &
SERVER_PID=$!
echo "✅ 서버 시작됨 (PID: $SERVER_PID)"
echo $SERVER_PID > .dev.pid

sleep 10

echo "📊 서버 상태 확인..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ 서버 정상 작동!"
else
    echo "⚠️  서버 확인 중..."
    tail -20 dev.log
fi
ENDSSH

echo ""
echo "✅ 완료! 이제 이메일이 전송됩니다."



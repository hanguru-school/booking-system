#!/bin/bash

# ========================================
# app.hanguru.school 도메인 연결 스크립트
# HP DXP2800 서버로 도메인 전환
# ========================================

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

main() {
    log "🌐 app.hanguru.school 도메인 연결 설정..."
    
    # 현재 서버 IP 확인
    SERVER_IP=$(hostname -I | awk '{print $1}')
    log "현재 서버 IP: $SERVER_IP"
    
    # 현재 도메인 DNS 확인
    log "현재 app.hanguru.school DNS 확인 중..."
    CURRENT_IP=$(nslookup app.hanguru.school | grep -A1 "Name:" | tail -n1 | awk '{print $2}' 2>/dev/null || echo "확인 실패")
    log "현재 도메인 IP: $CURRENT_IP"
    
    echo
    echo "========================================="
    echo "도메인 연결 설정 가이드"
    echo "========================================="
    echo
    echo "🎯 목표: app.hanguru.school → $SERVER_IP"
    echo
    echo "📋 DNS 설정 방법:"
    echo "1. 도메인 관리 페이지에 접속 (Cloudflare, Route53, 등)"
    echo "2. DNS 설정에서 A 레코드를 다음과 같이 수정:"
    echo "   ┌─────────────────────────────────────┐"
    echo "   │ Type: A                             │"
    echo "   │ Name: app                           │"
    echo "   │ Value: $SERVER_IP                   │"
    echo "   │ TTL: 300 (5분)                     │"
    echo "   └─────────────────────────────────────┘"
    echo
    echo "3. DNS 전파 확인 (5-10분 소요):"
    echo "   nslookup app.hanguru.school"
    echo "   dig app.hanguru.school"
    echo
    
    # DNS 전파 확인 루프
    echo "🔍 DNS 전파 확인을 시작하겠습니다..."
    echo "DNS 설정을 완료했다면 Enter를 눌러주세요."
    read -p "계속하려면 Enter를 누르세요..."
    
    log "DNS 전파 확인 중..."
    
    for i in {1..30}; do
        RESOLVED_IP=$(nslookup app.hanguru.school | grep -A1 "Name:" | tail -n1 | awk '{print $2}' 2>/dev/null || echo "")
        
        if [ "$RESOLVED_IP" = "$SERVER_IP" ]; then
            log "✅ DNS 전파 완료! app.hanguru.school → $SERVER_IP"
            break
        else
            info "DNS 전파 대기 중... ($i/30) 현재: $RESOLVED_IP"
            sleep 10
        fi
        
        if [ $i -eq 30 ]; then
            warning "⚠️ DNS 전파가 완료되지 않았습니다. 시간이 더 필요할 수 있습니다."
        fi
    done
    
    # ========================================
    # 환경 변수 업데이트
    # ========================================
    log "⚙️ 환경 변수 업데이트..."
    
    cd /home/$USER/malmoi-system
    
    if [ -f ".env" ]; then
        # .env 파일 백업
        cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
        
        # NEXTAUTH_URL을 도메인으로 변경
        sed -i "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=https://app.hanguru.school|g" .env
        sed -i "s|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=https://app.hanguru.school|g" .env
        sed -i "s|API_BASE_URL=.*|API_BASE_URL=https://app.hanguru.school/api|g" .env
        
        log "✅ 환경 변수 업데이트 완료"
        log "NEXTAUTH_URL: https://app.hanguru.school"
    else
        error ".env 파일을 찾을 수 없습니다."
        exit 1
    fi
    
    # ========================================
    # PM2 애플리케이션 재시작
    # ========================================
    log "🚀 애플리케이션 재시작..."
    
    if pm2 list | grep -q "malmoi-system"; then
        pm2 restart malmoi-system
        log "✅ PM2 애플리케이션 재시작 완료"
    else
        warning "PM2에서 malmoi-system을 찾을 수 없습니다."
        log "애플리케이션을 수동으로 시작해주세요: pm2 start npm --name 'malmoi-system' -- run start"
    fi
    
    # ========================================
    # SSL 인증서 설치 가이드
    # ========================================
    echo
    echo "========================================="
    echo "🔒 SSL 인증서 설치 (HTTPS 지원)"
    echo "========================================="
    echo
    echo "보안을 위해 SSL 인증서 설치를 권장합니다:"
    echo
    echo "1. Certbot 설치:"
    echo "   sudo apt update"
    echo "   sudo apt install -y certbot"
    echo
    echo "2. SSL 인증서 발급:"
    echo "   sudo certbot certonly --standalone -d app.hanguru.school"
    echo
    echo "3. Nginx 리버스 프록시 설정 (권장):"
    echo "   sudo apt install -y nginx"
    echo "   # Nginx 설정 파일 편집 필요"
    echo
    echo "4. 자동 갱신 설정:"
    echo "   sudo crontab -e"
    echo "   # 0 12 * * * /usr/bin/certbot renew --quiet"
    echo
    
    # ========================================
    # 접속 테스트
    # ========================================
    log "🧪 접속 테스트..."
    
    echo "테스트 URL들:"
    echo "1. HTTP: http://app.hanguru.school"
    echo "2. 직접 포트: http://app.hanguru.school:3000"
    echo "3. 헬스체크: http://app.hanguru.school:3000/api/health"
    
    # 헬스체크 테스트
    if curl -s --max-time 10 http://app.hanguru.school:3000/api/health > /dev/null 2>&1; then
        log "✅ 도메인 접속 테스트 성공!"
    else
        warning "⚠️ 도메인 접속 테스트 실패. DNS 전파를 기다리거나 방화벽을 확인해주세요."
    fi
    
    # ========================================
    # 완료 정보
    # ========================================
    echo
    echo "========================================="
    echo "🎉 도메인 연결 설정 완료!"
    echo "========================================="
    echo
    echo "📊 연결 정보:"
    echo "  - 도메인: app.hanguru.school"
    echo "  - 서버 IP: $SERVER_IP"
    echo "  - 애플리케이션 포트: 3000"
    echo
    echo "🌐 접속 방법:"
    echo "  - 메인: http://app.hanguru.school:3000"
    echo "  - 헬스체크: http://app.hanguru.school:3000/api/health"
    echo
    echo "🔧 다음 단계:"
    echo "  1. 브라우저에서 도메인 접속 테스트"
    echo "  2. SSL 인증서 설치 (HTTPS 지원)"
    echo "  3. Nginx 리버스 프록시 설정 (포트 80/443 사용)"
    echo "  4. 관리자 계정 생성 및 시스템 설정"
    echo
    echo "📝 문제 해결:"
    echo "  - DNS 전파 확인: nslookup app.hanguru.school"
    echo "  - 방화벽 확인: sudo ufw status"
    echo "  - PM2 상태 확인: pm2 list"
    echo "  - 로그 확인: pm2 logs malmoi-system"
    echo
    echo "========================================="
    
    log "✅ 도메인 연결 설정이 완료되었습니다!"
    log "이제 https://app.hanguru.school:3000 에서 MalMoi 시스템에 접속할 수 있습니다."
}

main "$@"
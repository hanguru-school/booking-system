#!/bin/bash

# ========================================
# DXP2800 DDNS 설정 스크립트
# 동적 DNS 서비스 설정 및 네트워크 구성
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

confirm() {
    read -p "$1 (y/N): " -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]]
}

main() {
    log "🚀 DDNS 설정 및 네트워크 구성 시작..."
    
    # ========================================
    # 1. 현재 네트워크 상태 확인
    # ========================================
    log "🌐 현재 네트워크 상태 확인..."
    
    # 내부 IP 확인
    INTERNAL_IP=$(hostname -I | awk '{print $1}')
    log "내부 IP: $INTERNAL_IP"
    
    # 외부 IP 확인
    EXTERNAL_IP=$(curl -s https://ipinfo.io/ip || curl -s https://icanhazip.com || echo "확인 실패")
    log "외부 IP: $EXTERNAL_IP"
    
    # 네트워크 인터페이스 확인
    echo "=== 네트워크 인터페이스 ==="
    ip addr show
    echo
    
    # ========================================
    # 2. 고정 IP 설정 (선택사항)
    # ========================================
    log "🔧 고정 IP 설정..."
    
    # 현재 설정 백업
    sudo cp /etc/netplan/*.yaml /etc/netplan/backup_$(date +%Y%m%d_%H%M%S).yaml || true
    
    # 권장 고정 IP 설정 (192.168.0.50)
    cat << 'EOF' | sudo tee /etc/netplan/01-malmoi-network.yaml > /dev/null
network:
  version: 2
  renderer: networkd
  ethernets:
    eth0:
      dhcp4: no
      addresses:
        - 192.168.0.50/24
      gateway4: 192.168.0.1
      nameservers:
        addresses:
          - 8.8.8.8
          - 8.8.4.4
          - 1.1.1.1
      optional: true
EOF
    
    info "고정 IP 설정 파일이 생성되었습니다 (/etc/netplan/01-malmoi-network.yaml)"
    warning "실제 네트워크 환경에 맞게 수정한 후 'sudo netplan apply'를 실행하세요."
    
    # ========================================
    # 3. DDNS 클라이언트 설치
    # ========================================
    log "📦 DDNS 클라이언트 설치..."
    
    # ddclient 설치
    sudo apt update
    sudo apt install -y ddclient
    
    # 설정 디렉토리 생성
    sudo mkdir -p /etc/ddclient
    
    # ========================================
    # 4. 여러 DDNS 서비스 설정 파일 생성
    # ========================================
    log "⚙️ DDNS 서비스 설정 파일 생성..."
    
    # No-IP 설정
    cat << 'EOF' | sudo tee /etc/ddclient/ddclient-noip.conf > /dev/null
# No-IP DDNS 설정
daemon=300
syslog=yes
mail=root
mail-failure=root
pid=/var/run/ddclient.pid
ssl=yes

# No-IP
protocol=noip
use=web, web=checkip.dyndns.com/, web-skip='IP Address'
server=dynupdate.no-ip.com
login=your_noip_username
password=your_noip_password
malmoi.ddns.net
EOF
    
    # Duck DNS 설정
    cat << 'EOF' | sudo tee /etc/ddclient/ddclient-duckdns.conf > /dev/null
# Duck DNS 설정
daemon=300
syslog=yes
mail=root
mail-failure=root
pid=/var/run/ddclient.pid
ssl=yes

# Duck DNS
protocol=duckdns
use=web
server=www.duckdns.org
login=your_duckdns_domain
password=your_duckdns_token
malmoi.duckdns.org
EOF
    
    # Dynu 설정
    cat << 'EOF' | sudo tee /etc/ddclient/ddclient-dynu.conf > /dev/null
# Dynu DDNS 설정
daemon=300
syslog=yes
mail=root
mail-failure=root
pid=/var/run/ddclient.pid
ssl=yes

# Dynu
protocol=dynu
use=web
server=api.dynu.com
login=your_dynu_username
password=your_dynu_password
malmoi.dynu.net
EOF
    
    # FreeDNS 설정
    cat << 'EOF' | sudo tee /etc/ddclient/ddclient-freedns.conf > /dev/null
# FreeDNS 설정
daemon=300
syslog=yes
mail=root
mail-failure=root
pid=/var/run/ddclient.pid
ssl=yes

# FreeDNS
protocol=freedns
use=web
server=freedns.afraid.org
login=your_freedns_hash
malmoi.mooo.com
EOF
    
    # 기본 설정 파일 (No-IP 기준)
    sudo cp /etc/ddclient/ddclient-noip.conf /etc/ddclient.conf
    
    log "✅ DDNS 설정 파일 생성 완료"
    
    # ========================================
    # 5. 포트 포워딩 설정 가이드
    # ========================================
    log "📋 포트 포워딩 설정 가이드..."
    
    cat << 'EOF' > /home/admin/port_forwarding_guide.md
# 포트 포워딩 설정 가이드

## 라우터 관리 페이지 접속
일반적인 라우터 IP 주소:
- 192.168.0.1
- 192.168.1.1
- 10.0.0.1

## 포트 포워딩 설정
라우터 관리 페이지에서 다음 포트들을 포워딩하세요:

### 웹 서비스 (필수)
- HTTP: 외부 포트 80 → 내부 IP 192.168.0.50:80
- HTTPS: 외부 포트 443 → 내부 IP 192.168.0.50:443

### 개발/관리 (선택사항)
- SSH: 외부 포트 2222 → 내부 IP 192.168.0.50:22
- 애플리케이션: 외부 포트 3000 → 내부 IP 192.168.0.50:3000

### 데이터베이스 (보안상 권장하지 않음)
- PostgreSQL: 외부 포트 5432 → 내부 IP 192.168.0.50:5432

## 방화벽 설정
```bash
# 웹 서비스 포트 허용
sudo ufw allow 80
sudo ufw allow 443

# SSH 포트 변경 (보안 강화)
sudo ufw allow 2222

# 개발 포트 (필요시)
sudo ufw allow 3000

# 방화벽 활성화
sudo ufw enable
```

## 확인 방법
외부 IP로 접속하여 서비스가 정상 작동하는지 확인:
```bash
curl http://your_external_ip
curl https://malmoi.ddns.net
```
EOF
    
    chown admin:admin /home/admin/port_forwarding_guide.md
    
    # ========================================
    # 6. 방화벽 설정
    # ========================================
    log "🔥 방화벽 설정..."
    
    # 기본 포트 허용
    sudo ufw allow 22      # SSH
    sudo ufw allow 80      # HTTP
    sudo ufw allow 443     # HTTPS
    sudo ufw allow 3000    # 애플리케이션
    
    # SSH 포트 변경 (보안 강화)
    sudo ufw allow 2222
    
    # 로컬 네트워크에서만 데이터베이스 접근 허용
    sudo ufw allow from 192.168.0.0/24 to any port 5432
    sudo ufw allow from 172.16.0.0/12 to any port 5432    # Docker 네트워크
    
    # 방화벽 활성화
    sudo ufw --force enable
    
    log "✅ 방화벽 설정 완료"
    
    # ========================================
    # 7. DDNS 업데이트 스크립트 생성
    # ========================================
    log "🔄 DDNS 업데이트 스크립트 생성..."
    
    cat << 'EOF' > /home/admin/ddns-update.sh
#!/bin/bash

# DDNS 수동 업데이트 스크립트

# 현재 외부 IP 확인
CURRENT_IP=$(curl -s https://ipinfo.io/ip)
echo "현재 외부 IP: $CURRENT_IP"

# 이전 IP와 비교
LAST_IP_FILE="/tmp/last_ip"
if [ -f "$LAST_IP_FILE" ]; then
    LAST_IP=$(cat "$LAST_IP_FILE")
    if [ "$CURRENT_IP" = "$LAST_IP" ]; then
        echo "IP 변경 없음. 업데이트 불필요."
        exit 0
    fi
fi

# IP가 변경된 경우 DDNS 업데이트
echo "IP 변경 감지: $LAST_IP → $CURRENT_IP"
echo "DDNS 업데이트 실행..."

# ddclient 강제 업데이트
sudo ddclient -force -verbose

# 새 IP 저장
echo "$CURRENT_IP" > "$LAST_IP_FILE"

# 로그 기록
echo "$(date): IP 업데이트 $LAST_IP → $CURRENT_IP" >> /var/log/ddns-update.log

echo "DDNS 업데이트 완료"
EOF
    
    chmod +x /home/admin/ddns-update.sh
    
    # cron 작업 추가 (5분마다 IP 확인)
    (crontab -l 2>/dev/null; echo "*/5 * * * * /home/admin/ddns-update.sh") | crontab -
    
    log "✅ DDNS 업데이트 스크립트 생성 완료"
    
    # ========================================
    # 8. SSL 인증서 설정 준비
    # ========================================
    log "🔒 SSL 인증서 설정 준비..."
    
    # Let's Encrypt 설치
    sudo apt install -y certbot python3-certbot-nginx
    
    # SSL 인증서 설치 스크립트 생성
    cat << 'EOF' > /home/admin/ssl-setup.sh
#!/bin/bash

# SSL 인증서 설치 스크립트

DOMAIN=$1

if [ -z "$DOMAIN" ]; then
    echo "사용법: $0 <도메인명>"
    echo "예시: $0 malmoi.ddns.net"
    exit 1
fi

echo "도메인 $DOMAIN에 대한 SSL 인증서 발급..."

# 웹 서버 중지 (standalone 모드 사용)
sudo systemctl stop nginx || docker-compose stop malmoi-nginx

# 인증서 발급
sudo certbot certonly --standalone -d "$DOMAIN"

# 웹 서버 재시작
sudo systemctl start nginx || docker-compose start malmoi-nginx

# 자동 갱신 설정
sudo crontab -l 2>/dev/null | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | sudo crontab -

echo "SSL 인증서 설치 완료"
echo "인증서 위치: /etc/letsencrypt/live/$DOMAIN/"
EOF
    
    chmod +x /home/admin/ssl-setup.sh
    
    # ========================================
    # 9. 도메인 설정 스크립트 생성
    # ========================================
    log "🌐 도메인 설정 스크립트 생성..."
    
    cat << 'EOF' > /home/admin/domain-setup.sh
#!/bin/bash

# 도메인 설정 스크립트 (app.hanguru.school 연결용)

DOMAIN="app.hanguru.school"
CURRENT_IP=$(curl -s https://ipinfo.io/ip)

echo "현재 외부 IP: $CURRENT_IP"
echo "설정할 도메인: $DOMAIN"

cat << EOL

도메인 설정 방법:

1. 도메인 관리자 페이지에 접속
2. DNS 설정에서 다음과 같이 설정:
   - Type: A
   - Name: app (또는 @)
   - Value: $CURRENT_IP
   - TTL: 300 (5분)

3. 설정 후 다음 명령어로 확인:
   nslookup $DOMAIN
   dig $DOMAIN

4. 도메인이 정상적으로 연결되면 SSL 인증서 설치:
   /home/admin/ssl-setup.sh $DOMAIN

5. Nginx 설정에서 HTTPS 활성화:
   - nginx/nginx.conf 파일에서 HTTPS 서버 블록 주석 해제
   - docker-compose restart malmoi-nginx

EOL

# DNS 전파 확인 스크립트
cat << 'EOFCHECK' > /home/admin/check-dns.sh
#!/bin/bash

DOMAIN="app.hanguru.school"
EXPECTED_IP=$(curl -s https://ipinfo.io/ip)

echo "도메인: $DOMAIN"
echo "예상 IP: $EXPECTED_IP"
echo

# DNS 조회
RESOLVED_IP=$(nslookup "$DOMAIN" | grep -A1 "Name:" | tail -n1 | awk '{print $2}' || echo "조회 실패")

echo "DNS 조회 결과: $RESOLVED_IP"

if [ "$RESOLVED_IP" = "$EXPECTED_IP" ]; then
    echo "✅ DNS 설정이 올바릅니다!"
else
    echo "❌ DNS 설정을 확인해주세요."
fi

# 웹 접속 테스트
echo
echo "웹 접속 테스트:"
if curl -s "http://$DOMAIN/api/health" > /dev/null; then
    echo "✅ HTTP 접속 성공"
else
    echo "❌ HTTP 접속 실패"
fi

if curl -s "https://$DOMAIN/api/health" > /dev/null 2>&1; then
    echo "✅ HTTPS 접속 성공"
else
    echo "❌ HTTPS 접속 실패 (SSL 인증서 미설치 가능성)"
fi
EOFCHECK

chmod +x /home/admin/check-dns.sh

EOF
    
    chmod +x /home/admin/domain-setup.sh
    
    # ========================================
    # 10. 네트워크 모니터링 스크립트 생성
    # ========================================
    log "📊 네트워크 모니터링 스크립트 생성..."
    
    cat << 'EOF' > /home/admin/network-monitor.sh
#!/bin/bash

# 네트워크 모니터링 스크립트

LOG_FILE="/var/log/network-monitor.log"

# 현재 시간
TIMESTAMP=$(date +'%Y-%m-%d %H:%M:%S')

# 내부 IP
INTERNAL_IP=$(hostname -I | awk '{print $1}')

# 외부 IP
EXTERNAL_IP=$(curl -s --max-time 10 https://ipinfo.io/ip || echo "확인 실패")

# 인터넷 연결 확인
INTERNET_OK=$(ping -c 1 8.8.8.8 > /dev/null 2>&1 && echo "OK" || echo "FAIL")

# DDNS 도메인 확인 (설정된 경우)
DDNS_DOMAIN="malmoi.ddns.net"  # 실제 설정한 도메인으로 변경
DDNS_IP=$(nslookup "$DDNS_DOMAIN" 2>/dev/null | grep -A1 "Name:" | tail -n1 | awk '{print $2}' || echo "미설정")

# 서비스 상태 확인
APP_STATUS=$(curl -s --max-time 5 http://localhost:3000/api/health > /dev/null && echo "OK" || echo "FAIL")
DB_STATUS=$(pg_isready -h localhost -p 5432 -U malmoi_admin > /dev/null 2>&1 && echo "OK" || echo "FAIL")

# 로그 기록
echo "$TIMESTAMP,내부IP:$INTERNAL_IP,외부IP:$EXTERNAL_IP,인터넷:$INTERNET_OK,DDNS:$DDNS_IP,앱:$APP_STATUS,DB:$DB_STATUS" >> "$LOG_FILE"

# 문제 발생 시 알림 (선택사항)
if [ "$INTERNET_OK" = "FAIL" ] || [ "$APP_STATUS" = "FAIL" ] || [ "$DB_STATUS" = "FAIL" ]; then
    echo "$TIMESTAMP: 서비스 상태 이상 - 인터넷:$INTERNET_OK, 앱:$APP_STATUS, DB:$DB_STATUS" | tee -a /var/log/service-alert.log
fi

# 일주일 이상 된 로그 삭제
find /var/log -name "network-monitor.log" -mtime +7 -delete 2>/dev/null || true
EOF
    
    chmod +x /home/admin/network-monitor.sh
    
    # cron 작업 추가 (10분마다 모니터링)
    (crontab -l 2>/dev/null; echo "*/10 * * * * /home/admin/network-monitor.sh") | crontab -
    
    log "✅ 네트워크 모니터링 스크립트 생성 완료"
    
    # ========================================
    # 11. 설정 완료 정보 출력
    # ========================================
    log "🎉 DDNS 및 네트워크 설정 완료!"
    
    echo
    echo "=== 네트워크 정보 ==="
    echo "내부 IP: $INTERNAL_IP"
    echo "외부 IP: $EXTERNAL_IP"
    echo
    
    echo "=== DDNS 설정 파일 ==="
    echo "No-IP: /etc/ddclient/ddclient-noip.conf"
    echo "Duck DNS: /etc/ddclient/ddclient-duckdns.conf"
    echo "Dynu: /etc/ddclient/ddclient-dynu.conf"
    echo "FreeDNS: /etc/ddclient/ddclient-freedns.conf"
    echo "현재 활성 설정: /etc/ddclient.conf"
    echo
    
    echo "=== 관리 스크립트 ==="
    echo "DDNS 업데이트: /home/admin/ddns-update.sh"
    echo "SSL 인증서 설치: /home/admin/ssl-setup.sh <도메인>"
    echo "도메인 설정 가이드: /home/admin/domain-setup.sh"
    echo "DNS 확인: /home/admin/check-dns.sh"
    echo "네트워크 모니터링: /home/admin/network-monitor.sh"
    echo
    
    echo "=== 다음 단계 ==="
    echo "1. DDNS 서비스 가입 및 설정 파일 수정"
    echo "2. 라우터에서 포트 포워딩 설정 (/home/admin/port_forwarding_guide.md 참조)"
    echo "3. 방화벽 설정 확인: sudo ufw status"
    echo "4. DDNS 도메인으로 접속 테스트"
    echo "5. SSL 인증서 설치 (필요시)"
    echo "6. app.hanguru.school 도메인 연결 (필요시)"
    echo
    
    warning "⚠️  DDNS 설정 파일에서 실제 계정 정보로 수정해주세요:"
    warning "   sudo nano /etc/ddclient.conf"
    warning "⚠️  라우터에서 포트 포워딩을 설정해주세요."
    warning "⚠️  외부에서 접속하기 전에 보안 설정을 확인해주세요."
}

main "$@"
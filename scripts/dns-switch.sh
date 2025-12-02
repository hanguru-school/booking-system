#!/bin/bash

# ========================================
# MalMoi 한국어 교실 - DNS 전환 스크립트
# Vercel ↔ NAS 서버 간 전환
# ========================================

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 함수: 로그 출력
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

# 함수: DNS 전파 확인
check_dns_propagation() {
    local domain="app.hanguru.school"
    local expected_ip="$1"
    
    log "DNS 전파 확인 중..."
    
    # nslookup으로 확인
    local nslookup_result=$(nslookup $domain 2>/dev/null | grep "Address:" | tail -1 | awk '{print $2}')
    
    if [ "$nslookup_result" = "$expected_ip" ]; then
        log "✅ DNS 전파 완료: $domain → $expected_ip"
        return 0
    else
        warning "DNS 전파 대기 중... 현재: $nslookup_result, 예상: $expected_ip"
        return 1
    fi
}

# 함수: 서버 상태 확인
check_server_health() {
    local url="https://app.hanguru.school/api/health"
    
    log "서버 상태 확인 중..."
    
    local response=$(curl -s -o /dev/null -w "%{http_code}" $url 2>/dev/null || echo "000")
    
    if [ "$response" = "200" ]; then
        log "✅ 서버 정상 동작 중"
        return 0
    else
        error "❌ 서버 응답 오류: HTTP $response"
        return 1
    fi
}

# 메인 스크립트
main() {
    log "🚀 DNS 전환 스크립트 시작"
    
    # 인수 확인
    if [ $# -eq 0 ]; then
        echo "사용법: $0 [vercel|nas]"
        echo ""
        echo "옵션:"
        echo "  vercel  - Vercel 서버로 전환"
        echo "  nas     - NAS 서버로 전환"
        echo ""
        echo "예시:"
        echo "  $0 nas"
        echo "  $0 vercel"
        exit 1
    fi
    
    local target="$1"
    
    case $target in
        "vercel")
            log "🔄 Vercel 서버로 전환 중..."
            
            # Vercel IP 주소 (실제 IP로 변경 필요)
            local vercel_ip="76.76.19.34"
            
            # DNS 변경 (실제 DNS API 호출로 변경 필요)
            log "DNS 레코드를 Vercel로 변경 중..."
            # 여기에 실제 DNS API 호출 코드 추가
            
            # 전파 확인
            for i in {1..30}; do
                if check_dns_propagation "$vercel_ip"; then
                    break
                fi
                sleep 10
            done
            
            # 서버 상태 확인
            sleep 30
            check_server_health
            
            log "✅ Vercel 서버로 전환 완료"
            ;;
            
        "nas")
            log "🔄 NAS 서버로 전환 중..."
            
            # NAS 서버 IP 주소 (실제 IP로 변경 필요)
            local nas_ip="192.168.1.100"
            
            # DNS 변경 (실제 DNS API 호출로 변경 필요)
            log "DNS 레코드를 NAS 서버로 변경 중..."
            # 여기에 실제 DNS API 호출 코드 추가
            
            # 전파 확인
            for i in {1..30}; do
                if check_dns_propagation "$nas_ip"; then
                    break
                fi
                sleep 10
            done
            
            # 서버 상태 확인
            sleep 30
            check_server_health
            
            log "✅ NAS 서버로 전환 완료"
            ;;
            
        *)
            error "잘못된 옵션: $target"
            echo "사용법: $0 [vercel|nas]"
            exit 1
            ;;
    esac
}

# 스크립트 실행
main "$@" 
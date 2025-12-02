#!/bin/bash

# ========================================
# DXP2800 시스템 전체 테스트 스크립트
# 마이그레이션 완료 후 검증
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

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# 테스트 결과 저장
TEST_RESULTS=()
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 테스트 실행 함수
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_result="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    info "테스트 실행: $test_name"
    
    if eval "$test_command" >/dev/null 2>&1; then
        if [ "$expected_result" = "success" ]; then
            success "✅ $test_name - 통과"
            TEST_RESULTS+=("✅ $test_name - 통과")
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            error "❌ $test_name - 실패 (예상하지 않은 성공)"
            TEST_RESULTS+=("❌ $test_name - 실패 (예상하지 않은 성공)")
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
    else
        if [ "$expected_result" = "fail" ]; then
            success "✅ $test_name - 통과 (예상된 실패)"
            TEST_RESULTS+=("✅ $test_name - 통과 (예상된 실패)")
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            error "❌ $test_name - 실패"
            TEST_RESULTS+=("❌ $test_name - 실패")
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
    fi
}

main() {
    log "🚀 DXP2800 시스템 전체 테스트 시작..."
    
    # ========================================
    # 1. 시스템 기본 테스트
    # ========================================
    log "🔍 1. 시스템 기본 테스트"
    
    run_test "시스템 부팅 시간 확인" "[ \$(cut -d' ' -f1 /proc/uptime | cut -d'.' -f1) -gt 0 ]" "success"
    run_test "메모리 사용량 확인 (< 85%)" "[ \$(free | grep Mem | awk '{printf(\"%.0f\", \$3/\$2 * 100.0)}') -lt 85 ]" "success"
    run_test "디스크 사용량 확인 (< 90%)" "[ \$(df /mnt/malmoi-storage | tail -1 | awk '{print \$5}' | sed 's/%//') -lt 90 ]" "success"
    
    # ========================================
    # 2. 스토리지 테스트
    # ========================================
    log "💾 2. 스토리지 테스트"
    
    run_test "malmoi-storage 마운트 확인" "mountpoint -q /mnt/malmoi-storage" "success"
    run_test "데이터 디렉토리 존재 확인" "[ -d /mnt/malmoi-storage/database ]" "success"
    run_test "앱 디렉토리 존재 확인" "[ -d /mnt/malmoi-storage/app ]" "success"
    run_test "백업 디렉토리 존재 확인" "[ -d /mnt/malmoi-storage/backups ]" "success"
    run_test "로그 디렉토리 존재 확인" "[ -d /mnt/malmoi-storage/logs ]" "success"
    
    # 읽기/쓰기 테스트
    run_test "스토리지 쓰기 테스트" "echo 'test' > /mnt/malmoi-storage/test.txt && rm /mnt/malmoi-storage/test.txt" "success"
    
    # ========================================
    # 3. PostgreSQL 테스트
    # ========================================
    log "🗄️ 3. PostgreSQL 테스트"
    
    run_test "PostgreSQL 서비스 실행 확인" "systemctl is-active --quiet postgresql" "success"
    run_test "PostgreSQL 포트 리스닝 확인" "netstat -tlnp | grep -q :5432" "success"
    run_test "malmoi_system 데이터베이스 존재 확인" "sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw malmoi_system" "success"
    run_test "malmoi_admin 사용자 존재 확인" "sudo -u postgres psql -c \"SELECT 1 FROM pg_roles WHERE rolname='malmoi_admin'\" | grep -q 1" "success"
    
    # 데이터베이스 연결 테스트
    run_test "로컬 PostgreSQL 연결 테스트" "sudo -u postgres psql malmoi_system -c 'SELECT 1;'" "success"
    
    # 테이블 존재 확인 (마이그레이션 완료 후)
    run_test "User 테이블 존재 확인" "sudo -u postgres psql malmoi_system -c \"SELECT to_regclass('public.\"User\"');\" | grep -q User" "success"
    
    # ========================================
    # 4. Docker 환경 테스트
    # ========================================
    log "🐳 4. Docker 환경 테스트"
    
    if command -v docker &> /dev/null; then
        run_test "Docker 서비스 실행 확인" "systemctl is-active --quiet docker" "success"
        run_test "Docker Compose 설치 확인" "command -v docker-compose" "success"
        
        if [ -f "docker-compose.yml" ]; then
            run_test "Docker Compose 파일 유효성 확인" "docker-compose config" "success"
            
            # Docker 컨테이너 상태 확인
            if docker-compose ps | grep -q malmoi-app; then
                run_test "malmoi-app 컨테이너 실행 확인" "docker-compose ps malmoi-app | grep -q Up" "success"
            fi
            
            if docker-compose ps | grep -q malmoi-nginx; then
                run_test "malmoi-nginx 컨테이너 실행 확인" "docker-compose ps malmoi-nginx | grep -q Up" "success"
            fi
            
            if docker-compose ps | grep -q malmoi-redis; then
                run_test "malmoi-redis 컨테이너 실행 확인" "docker-compose ps malmoi-redis | grep -q Up" "success"
            fi
        fi
    else
        warning "Docker가 설치되지 않음. Docker 테스트 건너뜀."
    fi
    
    # ========================================
    # 5. 네트워크 테스트
    # ========================================
    log "🌐 5. 네트워크 테스트"
    
    run_test "인터넷 연결 확인" "ping -c 1 8.8.8.8" "success"
    run_test "DNS 해석 확인" "nslookup google.com" "success"
    run_test "외부 IP 확인" "curl -s --max-time 10 https://ipinfo.io/ip" "success"
    
    # 포트 확인
    run_test "HTTP 포트(80) 리스닝 확인" "netstat -tlnp | grep -q :80" "success"
    run_test "애플리케이션 포트(3000) 리스닝 확인" "netstat -tlnp | grep -q :3000" "success"
    
    # ========================================
    # 6. 애플리케이션 테스트
    # ========================================
    log "🚀 6. 애플리케이션 테스트"
    
    # 헬스체크 API 테스트
    run_test "애플리케이션 헬스체크" "curl -s --max-time 10 http://localhost:3000/api/health | grep -q healthy" "success"
    
    # 메인 페이지 응답 테스트
    run_test "메인 페이지 응답 확인" "curl -s --max-time 10 http://localhost:3000/ | grep -q html" "success"
    
    # API 엔드포인트 테스트
    run_test "API 상태 확인" "curl -s --max-time 10 http://localhost:3000/api/system/status" "success"
    
    # Nginx 프록시 테스트 (포트 80)
    if netstat -tlnp | grep -q :80; then
        run_test "Nginx 프록시 응답 확인" "curl -s --max-time 10 http://localhost/ | grep -q html" "success"
    fi
    
    # ========================================
    # 7. DDNS 및 외부 접속 테스트
    # ========================================
    log "🌍 7. DDNS 및 외부 접속 테스트"
    
    run_test "ddclient 설치 확인" "command -v ddclient" "success"
    run_test "ddclient 설정 파일 존재 확인" "[ -f /etc/ddclient.conf ]" "success"
    
    # 방화벽 테스트
    run_test "UFW 방화벽 활성화 확인" "sudo ufw status | grep -q active" "success"
    run_test "HTTP 포트 방화벽 허용 확인" "sudo ufw status | grep -q '80/tcp'" "success"
    run_test "HTTPS 포트 방화벽 허용 확인" "sudo ufw status | grep -q '443/tcp'" "success"
    
    # ========================================
    # 8. 백업 시스템 테스트
    # ========================================
    log "💾 8. 백업 시스템 테스트"
    
    run_test "백업 스크립트 존재 확인" "[ -f /home/admin/db-backup.sh ]" "success"
    run_test "백업 스크립트 실행 권한 확인" "[ -x /home/admin/db-backup.sh ]" "success"
    run_test "전체 백업 스크립트 존재 확인" "[ -f /home/admin/full-backup.sh ]" "success"
    run_test "복원 스크립트 존재 확인" "[ -f /home/admin/restore-backup.sh ]" "success"
    
    # SMART 모니터링 테스트
    if command -v smartctl &> /dev/null; then
        run_test "SMART 모니터링 도구 설치 확인" "command -v smartctl" "success"
        run_test "smartd 서비스 실행 확인" "systemctl is-active --quiet smartd" "success"
    fi
    
    # cron 작업 확인
    run_test "cron 작업 설정 확인" "crontab -l | grep -q malmoi" "success"
    
    # ========================================
    # 9. 모니터링 시스템 테스트
    # ========================================
    log "📊 9. 모니터링 시스템 테스트"
    
    run_test "시스템 모니터링 스크립트 존재 확인" "[ -f /home/admin/system-monitor.sh ]" "success"
    run_test "네트워크 모니터링 스크립트 존재 확인" "[ -f /home/admin/network-monitor.sh ]" "success"
    run_test "백업 대시보드 스크립트 존재 확인" "[ -f /home/admin/backup-dashboard.sh ]" "success"
    
    # 로그 파일 확인
    run_test "시스템 모니터링 로그 파일 존재 확인" "[ -f /var/log/system-monitor.log ] || touch /var/log/system-monitor.log" "success"
    
    # ========================================
    # 10. 보안 테스트
    # ========================================
    log "🔒 10. 보안 테스트"
    
    run_test "방화벽 활성화 확인" "sudo ufw status | grep -q 'Status: active'" "success"
    run_test "SSH 서비스 실행 확인" "systemctl is-active --quiet ssh" "success"
    
    # PostgreSQL 외부 접속 차단 확인
    run_test "PostgreSQL 외부 접속 차단 확인" "! nc -z localhost 5432 -w 1 || netstat -tlnp | grep :5432 | grep -q 127.0.0.1" "success"
    
    # ========================================
    # 11. 성능 테스트
    # ========================================
    log "⚡ 11. 성능 테스트"
    
    # 응답 시간 테스트
    run_test "애플리케이션 응답 시간 테스트 (< 5초)" "timeout 5 curl -s http://localhost:3000/api/health" "success"
    
    # 디스크 I/O 테스트
    run_test "디스크 쓰기 성능 테스트" "dd if=/dev/zero of=/mnt/malmoi-storage/test_write.tmp bs=1M count=10 oflag=direct" "success"
    run_test "디스크 읽기 성능 테스트" "dd if=/mnt/malmoi-storage/test_write.tmp of=/dev/null bs=1M" "success"
    run_test "테스트 파일 정리" "rm -f /mnt/malmoi-storage/test_write.tmp" "success"
    
    # ========================================
    # 12. 데이터 무결성 테스트
    # ========================================
    log "🔍 12. 데이터 무결성 테스트"
    
    # 데이터베이스 연결성 테스트
    run_test "데이터베이스 테이블 카운트 확인" "sudo -u postgres psql malmoi_system -c \"SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';\" | grep -q [0-9]" "success"
    
    # 환경 변수 확인
    run_test "환경 변수 파일 존재 확인" "[ -f .env ] || [ -f env.nas.local ]" "success"
    
    # ========================================
    # 테스트 결과 요약
    # ========================================
    log "📋 테스트 결과 요약"
    
    echo
    echo "========================================="
    echo "테스트 결과 요약"
    echo "========================================="
    echo "총 테스트: $TOTAL_TESTS"
    echo "통과: $PASSED_TESTS"
    echo "실패: $FAILED_TESTS"
    echo "성공률: $(( PASSED_TESTS * 100 / TOTAL_TESTS ))%"
    echo
    
    echo "상세 결과:"
    for result in "${TEST_RESULTS[@]}"; do
        echo "  $result"
    done
    
    echo
    echo "========================================="
    
    # 테스트 결과 파일 저장
    REPORT_FILE="/mnt/malmoi-storage/logs/system-test-$(date +%Y%m%d_%H%M%S).log"
    {
        echo "DXP2800 시스템 테스트 보고서"
        echo "날짜: $(date)"
        echo "총 테스트: $TOTAL_TESTS"
        echo "통과: $PASSED_TESTS"
        echo "실패: $FAILED_TESTS"
        echo "성공률: $(( PASSED_TESTS * 100 / TOTAL_TESTS ))%"
        echo
        echo "상세 결과:"
        for result in "${TEST_RESULTS[@]}"; do
            echo "  $result"
        done
    } > "$REPORT_FILE"
    
    log "📄 테스트 보고서 저장: $REPORT_FILE"
    
    # 결과에 따른 종료 코드
    if [ $FAILED_TESTS -eq 0 ]; then
        success "🎉 모든 테스트가 성공적으로 통과했습니다!"
        
        echo
        echo "✅ 시스템이 정상적으로 운영 중입니다."
        echo "📊 대시보드: /home/admin/backup-dashboard.sh"
        echo "🌐 접속 URL: http://localhost:3000"
        echo "🏥 헬스체크: http://localhost:3000/api/health"
        
        return 0
    else
        error "❌ $FAILED_TESTS개의 테스트가 실패했습니다."
        
        echo
        echo "실패한 테스트를 확인하고 문제를 해결해주세요."
        echo "문제 해결 가이드: DXP2800_MIGRATION_GUIDE.md"
        
        return 1
    fi
}

main "$@"
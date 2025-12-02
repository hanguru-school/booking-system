-- ========================================
-- MalMoi 한국어 교실 - 데이터베이스 초기화
-- PostgreSQL 초기 설정
-- ========================================

-- 데이터베이스 생성 (Docker 컨테이너에서는 자동 생성됨)
-- CREATE DATABASE malmoi_system;

-- 사용자 권한 설정
GRANT ALL PRIVILEGES ON DATABASE malmoi_system TO malmoi_admin;
GRANT ALL PRIVILEGES ON SCHEMA public TO malmoi_admin;

-- 확장 기능 설치
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 테이블 소유권 설정 (마이그레이션 후 실행)
-- ALTER SCHEMA public OWNER TO malmoi_admin;

-- 인덱스 최적화를 위한 설정
SET maintenance_work_mem = '256MB';

-- 초기화 완료 로그
SELECT 'PostgreSQL 초기화 완료 - ' || current_timestamp AS initialization_status;
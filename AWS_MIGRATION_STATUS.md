# AWS → 로컬 마이그레이션 상태

**작성일**: 2025-11-27

---

## ✅ 완료된 작업

### 1. 서버 인프라 설정
- ✅ PostgreSQL 로컬 설치 스크립트 준비
- ✅ MinIO 로컬 설치 스크립트 준비
- ✅ 환경변수 시스템 시크릿 설정 (`/etc/malmoi/booking.env`)
- ✅ Git 배포 파이프라인 설정

### 2. 코드 수정
- ✅ `src/app/api/upload/route.ts` - MinIO 호환 설정 추가
  - `S3_ENDPOINT` 환경변수 지원
  - `S3_FORCE_PATH_STYLE` 지원
  - MinIO URL 생성 로직 추가

---

## ⚠️ 남은 작업

### 1. 서버 설정 실행 (sudo 권한 필요)
```bash
ssh malmoi@100.80.210.105
bash ~/scripts/setup-complete.sh
```

이 스크립트가 다음을 수행합니다:
- PostgreSQL 로컬 설치 및 DB 생성
- MinIO 로컬 설치 및 버킷 생성
- 환경변수 설정 (`/etc/malmoi/booking.env`)

### 2. 서버의 기존 .env 파일 정리
현재 서버의 `~/booking-system/.env` 파일에 AWS 설정이 남아있습니다:
- `DATABASE_URL` → 로컬 PostgreSQL로 변경 필요
- `AWS_RDS_*` → 제거 또는 주석 처리
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` → MinIO 자격 증명으로 교체

### 3. AWS SDK 패키지 (선택사항)
현재 `package.json`에 AWS SDK 패키지가 있습니다:
- `@aws-sdk/client-s3` - MinIO 호환을 위해 유지 (S3 호환 API)
- `@aws-sdk/client-cognito-identity-provider` - Cognito 인증용 (필요 시 유지)
- `aws-sdk` - 레거시 (제거 고려)

**참고**: MinIO는 S3 호환 API를 제공하므로 AWS SDK를 그대로 사용할 수 있습니다.

---

## 📋 환경변수 매핑

### 기존 (AWS)
```
DATABASE_URL=postgresql://...@malmoi-system-db-tokyo.crooggsemeim.ap-northeast-1.rds.amazonaws.com:5432/...
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
S3_BUCKET_NAME=malmoi-system-files
```

### 신규 (로컬)
```
DATABASE_URL=postgresql://malmoi_admin:<PASSWORD>@localhost:5432/malmoi_system?sslmode=disable
AWS_ACCESS_KEY_ID=<MINIO_ROOT_USER>  # MinIO 루트 사용자
AWS_SECRET_ACCESS_KEY=<MINIO_ROOT_PASSWORD>  # MinIO 루트 비밀번호
AWS_S3_BUCKET=malmoi-system-files
S3_ENDPOINT=http://127.0.0.1:9000
S3_FORCE_PATH_STYLE=true
AWS_REGION=ap-northeast-1  # MinIO는 리전 무시하지만 호환성을 위해 유지
```

---

## 🔄 마이그레이션 절차

### 1단계: 서버 설정 실행
```bash
ssh malmoi@100.80.210.105
bash ~/scripts/setup-complete.sh
```

### 2단계: 데이터 마이그레이션 (선택사항)
AWS RDS에서 로컬 PostgreSQL로 데이터 이전:
```bash
# AWS RDS 백업
pg_dump -h malmoi-system-db-tokyo.crooggsemeim.ap-northeast-1.rds.amazonaws.com \
  -U malmoi_admin -d malmoi_system > aws_backup.sql

# 로컬 PostgreSQL로 복원
psql -U malmoi_admin -d malmoi_system < aws_backup.sql
```

### 3단계: 파일 마이그레이션 (선택사항)
AWS S3에서 MinIO로 파일 이전:
```bash
# mc 설정
mc alias set aws https://s3.ap-northeast-1.amazonaws.com <AWS_ACCESS_KEY> <AWS_SECRET_KEY>
mc alias set local http://127.0.0.1:9000 <MINIO_ROOT_USER> <MINIO_ROOT_PASSWORD>

# 파일 동기화
mc mirror aws/malmoi-system-files local/malmoi-system-files
```

### 4단계: 배포 및 검증
```bash
# 로컬에서
git push server main

# 서버에서 검증
curl -fsS http://localhost:3000/
pm2 logs booking
```

---

## 📝 코드 변경 사항

### `src/app/api/upload/route.ts`
- `S3_ENDPOINT` 환경변수 지원 추가
- MinIO 호환 URL 생성 로직 추가
- AWS S3와 MinIO 모두 지원

---

## ⚠️ 주의사항

1. **Cognito 인증**: AWS Cognito를 사용하는 경우, 인증 로직도 수정이 필요할 수 있습니다.
2. **기존 파일 URL**: AWS S3에 업로드된 기존 파일의 URL은 변경됩니다.
3. **백업**: 마이그레이션 전에 AWS RDS와 S3의 백업을 반드시 수행하세요.

---

## ✅ 완전히 AWS 제거하려면

1. **코드에서 AWS 관련 참조 제거** (선택사항)
   - `src/lib/aws-rds.ts` - 로컬 PostgreSQL 사용 시 불필요
   - Cognito 인증 로직 - 다른 인증 방식으로 교체 필요

2. **환경변수 파일 정리**
   - `env.production`, `env.nas` - AWS 설정 주석 처리 또는 제거

3. **패키지 제거** (선택사항)
   - `@aws-sdk/client-cognito-identity-provider` - Cognito 미사용 시
   - `aws-sdk` - 레거시 패키지

**참고**: MinIO는 S3 호환 API를 제공하므로, AWS SDK는 그대로 사용할 수 있습니다. 완전히 제거할 필요는 없습니다.


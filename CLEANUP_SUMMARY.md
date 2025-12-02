# 서버 설정 정리 완료 요약

**작성일**: 2025-11-27  
**대상 서버**: Ubuntu 24.04 / malmoi / 192.168.1.41 또는 Tailscale 100.80.210.105

---

## ✅ 완료된 작업

### 1. 환경변수 파일 정리
- ✅ `env.production` 삭제 (AWS RDS/S3 설정 포함)
- ✅ `env.nas` 삭제 (AWS RDS/S3 설정 포함)
- ✅ `env.nas.local` 삭제 (DXP2800 설정 포함)
- ✅ `env.example` 업데이트 (로컬 서버 설정으로 변경)
- ✅ `env.template` 업데이트 (로컬 서버 설정으로 변경)
- ✅ `env.local.server` 생성 (현재 서버 전용 설정)

### 2. 코드 최적화
- ✅ `src/lib/env-validator.ts` - AWS RDS/Cognito 관련 검증 제거
- ✅ `src/app/api/health/route.ts` - AWS RDS 정보 제거, MinIO 정보 추가
- ✅ `src/app/api/upload/route.ts` - MinIO 호환 설정 추가 (이미 완료)

### 3. 스크립트 업데이트
- ✅ `scripts/setup-firewall.sh` - 내부망 IP 범위 수정 (192.168.1.0/24)
- ✅ `scripts/setup-complete.sh` - 서버 IP 정보 업데이트

### 4. 문서 업데이트
- ✅ `QUICK_START.md` - 현재 서버 IP로 업데이트
- ✅ `DEPLOYMENT_SETUP_COMPLETE.md` - 현재 서버 IP로 업데이트

---

## 📋 현재 서버 설정

### 서버 정보
- **OS**: Ubuntu 24.04
- **사용자**: malmoi
- **IP**: 192.168.1.41 (로컬 네트워크) 또는 100.80.210.105 (Tailscale)
- **포트**: 3000 (Next.js), 5432 (PostgreSQL), 9000/9001 (MinIO)

### 데이터베이스
- **타입**: 로컬 PostgreSQL
- **호스트**: localhost:5432
- **데이터베이스**: malmoi_system
- **사용자**: malmoi_admin

### 파일 스토리지
- **타입**: 로컬 MinIO (S3 호환)
- **엔드포인트**: http://127.0.0.1:9000
- **버킷**: malmoi-system-files

---

## ⚠️ 남은 작업 (선택사항)

### 1. 하드코딩된 이메일 주소
다음 파일들에 `office@hanguru.school` 또는 `hanguru.school@gmail.com`이 하드코딩되어 있습니다:
- `src/lib/email-sender.ts`
- `src/lib/email-signature.ts`
- `src/app/api/email/send/route.ts`
- 기타 여러 페이지 파일들

**권장**: 환경변수로 관리하거나 그대로 유지 (비즈니스 정보이므로)

### 2. 도메인 참조
다음 파일들에 `app.hanguru.school` 도메인이 참조되어 있습니다:
- `src/lib/environment-utils.ts`
- `src/lib/environment-check.ts`
- `src/lib/cognito-provider.ts`
- 기타 여러 파일들

**권장**: 현재는 로컬 서버이므로 이 참조들은 무시되거나 환경변수로 관리

### 3. AWS RDS 관련 코드
- `src/lib/aws-rds.ts` - AWS RDS 연결 코드 (현재는 사용하지 않음)
- `src/app/api/system/env-status/route.ts` - AWS RDS 환경변수 표시

**권장**: 필요 없으면 삭제하거나 주석 처리

---

## 📝 환경변수 설정 가이드

서버의 `/etc/malmoi/booking.env` 파일에 다음 설정이 필요합니다:

```bash
# 데이터베이스
DATABASE_URL=postgresql://malmoi_admin:<PASSWORD>@localhost:5432/malmoi_system?sslmode=disable

# 파일 스토리지 (MinIO)
AWS_REGION=ap-northeast-1
AWS_S3_BUCKET=malmoi-system-files
AWS_ACCESS_KEY_ID=<MINIO_ROOT_USER>
AWS_SECRET_ACCESS_KEY=<MINIO_ROOT_PASSWORD>
S3_ENDPOINT=http://127.0.0.1:9000
S3_FORCE_PATH_STYLE=true

# 애플리케이션
NODE_ENV=production
PORT=3000
NEXTAUTH_URL=http://192.168.1.41:3000
NEXT_PUBLIC_APP_URL=http://192.168.1.41:3000

# 이메일
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=office@hanguru.school
SMTP_PASS=<PASSWORD>
EMAIL_FROM=office@hanguru.school
```

---

## 🚀 다음 단계

1. 서버에서 설정 스크립트 실행:
   ```bash
   ssh malmoi@192.168.1.41
   bash ~/scripts/setup-complete.sh
   ```

2. 첫 배포:
   ```bash
   git remote add server ssh://malmoi@192.168.1.41/home/malmoi/repos/booking-system.git
   git push server main
   ```

3. 검증:
   ```bash
   curl http://192.168.1.41:3000/api/health
   ```

---

## 📚 참고

- 모든 AWS RDS/S3 관련 설정이 제거되었습니다
- 로컬 PostgreSQL과 MinIO를 사용합니다
- 환경변수는 `/etc/malmoi/booking.env`에서 관리합니다
- Git 배포 파이프라인이 설정되어 있습니다


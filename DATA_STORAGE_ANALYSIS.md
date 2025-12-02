# 데이터 저장 방식 분석 보고서

**조사 일시**: 2025-11-26  
**조사자**: DevOps 리드  
**시스템**: booking-system (MalMoi 한국어 교실)

---

## 📊 요약표

| 항목 | 내용 | 비고 |
|------|------|------|
| **DB 종류/버전** | PostgreSQL 16 (로컬 설치됨) / AWS RDS PostgreSQL (운영 사용) | 로컬 PostgreSQL 16 프로세스 실행 중 (`/var/lib/postgresql/16/main`), 실제 사용은 AWS RDS |
| **DB 위치** | **원격**: AWS RDS (ap-northeast-1) | `malmoi-system-db-tokyo.crooggsemeim.ap-northeast-1.rds.amazonaws.com:5432` |
| **DB 이름** | `malmoi_system` | |
| **DB 사용자** | `malmoi_admin` | 비밀번호: `malmoi_admin_password_2024` (앞 6자: `malmoi`) |
| **DB 연결 상태** | ⚠️ 서버에서 접속 불가 (네트워크/VPC 설정 필요) | RDS는 VPC 내부에서만 접근 가능할 수 있음 |
| **ORM/마이그레이션 도구** | Prisma 6.12.0 | `prisma/schema.prisma`, `prisma/migrations/` |
| **마이그레이션 스크립트** | `prisma generate && next build` | `package.json`의 `build` 스크립트 |
| **파일 저장소** | **AWS S3** | 버킷: `malmoi-system-files`, 리전: `ap-northeast-1` |
| **파일 업로드 경로** | S3 버킷 내 `uploads/` 폴더 | 코드: `src/app/api/upload/route.ts` |
| **캐시/큐** | **없음** | Redis 미사용 (환경 변수에 REDIS_URL 없음) |
| **백업 경로** | `~/backups/database/{daily,weekly,monthly}/` | 스크립트: `setup-db-backup.sh`, 디렉터리 존재 확인됨 |
| **백업 주기** | 일일(매일 02:00), 주간(일요일), 월간(1일) | Cron: `0 2 * * *` |
| **백업 보관** | 일일 30일, 주간 12주, 월간 12개월 | 자동 정리 스크립트 포함 |
| **최근 백업** | ✅ 확인됨 (2025-11-24, 2025-11-25, 2025-11-26) | 일일 백업 정상 작동 중 (약 13-14KB) |

---

## 🗄️ 주요 데이터베이스 테이블 (Prisma Schema 기준)

### 사용자 및 인증
- `users` - 사용자 기본 정보
- `user_sessions` - 세션 관리
- `user_preferences` - 사용자 설정
- `admins`, `students`, `teachers`, `staff`, `parents` - 역할별 상세 정보

### 예약 및 수업
- `reservations` - 수업 예약
- `lesson_notes` - 수업 노트
- `reviews` - 리뷰
- `homework` - 숙제

### 결제 및 급여
- `payments` - 결제 내역
- `payrolls` - 급여 명세

### 커리큘럼 및 학습
- `curriculum`, `curriculum_items`, `curriculum_progress` - 커리큘럼 관리
- `student_grammar_history`, `student_vocab_history`, `student_usage_history` - 학습 이력
- `learning_stats`, `word_stats` - 학습 통계

### 로그 및 감사
- `activity_logs` - 활동 로그 (CREATE, UPDATE, DELETE, LOGIN 등)
- `system_logs` - 시스템 로그 (INFO, WARN, ERROR, DEBUG)
- `notification_logs` - 알림 전송 로그
- `tagging_logs` - 태깅 로그

### 기타
- `agreements` - 동의서 (규정 동의, 입회 동의)
- `contact_inquiries` - 문의사항
- `trial_lesson_requests` - 체험레슨 신청
- `system_settings` - 시스템 설정

**총 테이블 수**: 50개 이상 (Prisma Schema 기준)

### 전체 테이블 목록 (Prisma Schema)
1. `users` - 사용자
2. `students` - 학생
3. `teachers` - 선생님
4. `staff` - 직원
5. `reservations` - 예약
6. `tagging_logs` - 태깅 로그
7. `teacher_attendances` - 선생님 출석
8. `staff_work_logs` - 직원 근무 로그
9. `lesson_notes` - 수업 노트
10. `reviews` - 리뷰
11. `homework` - 숙제
12. `curriculum` - 커리큘럼
13. `curriculum_items` - 커리큘럼 항목
14. `curriculum_progress` - 커리큘럼 진행
15. `notification_logs` - 알림 로그
16. `payments` - 결제
17. `AudioFile` - 오디오 파일
18. `StudentRecording` - 학생 녹음
19. `WritingTest` - 작문 테스트
20. `GrammarItem` - 문법 항목
21. `VocabItem` - 어휘 항목
22. `UsageItem` - 사용법 항목
23. `StudentGrammarHistory` - 학생 문법 이력
24. `StudentVocabHistory` - 학생 어휘 이력
25. `StudentUsageHistory` - 학생 사용법 이력
26. `Payroll` - 급여
27. `AttendanceEditLog` - 출석 수정 로그
28. `CommunityPost` - 커뮤니티 게시글
29. `CommunityComment` - 커뮤니티 댓글
30. `Like` - 좋아요
31. `Report` - 신고
32. `PointLog` - 포인트 로그
33. `Badge` - 배지
34. `StudentBadge` - 학생 배지
35. `CheerMessage` - 응원 메시지
36. `CheerLog` - 응원 로그
37. `UIDTag` - UID 태그
38. `UIDDevice` - UID 디바이스
39. `StudentMemo` - 학생 메모
40. `MemoSummary` - 메모 요약
41. `WordStat` - 단어 통계
42. `LearningStat` - 학습 통계
43. `parents` - 보호자
44. `admins` - 관리자
45. `services` - 서비스
46. `memo_types` - 메모 타입
47. `teacher_services` - 선생님 서비스
48. `admin_notifications` - 관리자 알림
49. `trial_lesson_requests` - 체험레슨 신청
50. `contact_inquiries` - 문의사항
51. `system_settings` - 시스템 설정
52. `user_sessions` - 사용자 세션
53. `user_preferences` - 사용자 설정
54. `activity_logs` - 활동 로그
55. `system_logs` - 시스템 로그
56. `agreements` - 동의서

---

## 🔐 환경 변수 (마스킹 처리)

### 데이터베이스
```
DATABASE_URL="postgresql://malmoi_admin:malmoi_admin_password_2024@malmoi-system-db-tokyo.crooggsemeim.ap-northeast-1.rds.amazonaws.com:5432/malmoi_system?sslmode=require"
AWS_RDS_HOST="malmoi-system-db-tokyo.crooggsemeim.ap-northeast-1.rds.amazonaws.com"
AWS_RDS_PORT="5432"
AWS_RDS_DATABASE="malmoi_system"
AWS_RDS_USERNAME="malmoi_admin"
AWS_RDS_PASSWORD="malmoi_admin_password_2024" (앞 6자: malmoi)
```

### 파일 스토리지 (S3)
```
AWS_REGION="ap-northeast-1"
AWS_ACCESS_KEY_ID="your_aws_access_key_id" (앞 6자: your_a - 실제 값으로 교체 필요)
AWS_SECRET_ACCESS_KEY="your_aws_secret_access_key" (앞 6자: your_a - 실제 값으로 교체 필요)
AWS_S3_BUCKET="malmoi-system-files"
S3_BUCKET_NAME="malmoi-system-files"
S3_BUCKET_REGION="ap-northeast-1"
```

### Firebase (선택적)
```
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_firebase_storage_bucket"
```

---

## 📁 파일 저장 방식

### 현재 구현
- **주요 스토리지**: AWS S3
- **버킷 이름**: `malmoi-system-files`
- **리전**: `ap-northeast-1` (Tokyo)
- **업로드 경로**: `uploads/{timestamp}-{filename}`
- **파일 크기 제한**: 5MB
- **지원 파일 타입**: 이미지 파일만 (`image/*`)

### 코드 위치
- 업로드 API: `src/app/api/upload/route.ts`
- S3 클라이언트: `@aws-sdk/client-s3` 사용

### 대안 스토리지 (설정 파일에 언급됨)
- 로컬 디스크 옵션: `UPLOAD_DIR=/mnt/malmoi-storage/app/uploads` (env.nas.local)
- 현재는 사용하지 않음

---

## 🔄 마이그레이션 전략

### Prisma 마이그레이션
- **마이그레이션 파일**: `prisma/migrations/` 디렉터리
- **마이그레이션 히스토리**:
  1. `20250729014302_init_schema` - 초기 스키마
  2. `20250805005656_update_reservation_system` - 예약 시스템 업데이트
  3. `20250805081943_add_master_info_fields` - 마스터 정보 필드 추가
  4. `20250805084629_add_detailed_info_to_staff_teacher_student` - 상세 정보 추가
  5. `20250805105916_add_bank_branch_field` - 은행 지점 필드 추가
  6. `20250805121249_add_account_type_field` - 계좌 타입 필드 추가

### 실행 방법
```bash
# 빌드 시 자동 실행
npm run build  # prisma generate && next build

# 수동 실행
npx prisma migrate deploy  # 프로덕션
npx prisma migrate dev     # 개발
```

---

## 💾 백업 전략

### 백업 스크립트
- **위치**: `setup-db-backup.sh`
- **실행 주기**: 매일 오전 2시 (Cron)
- **백업 방법**: `pg_dump` + `gzip`

### 백업 구조
```
~/backups/database/
├── daily/     # 일일 백업 (30일 보관)
├── weekly/    # 주간 백업 (12주 보관)
└── monthly/   # 월간 백업 (12개월 보관)
```

### 백업 명령어
```bash
# 수동 백업
~/backup-database.sh

# 자동 백업 (Cron)
0 2 * * * $HOME/backup-database.sh
```

---

## ⚠️ 위험/개선 포인트

### 🔴 높은 위험도

1. **AWS 자격 증명 하드코딩**
   - `.env` 파일에 `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` 직접 저장
   - **개선**: AWS IAM Role 사용 또는 Secrets Manager 활용

2. **데이터베이스 비밀번호 평문 저장**
   - `.env` 파일에 비밀번호 평문 저장
   - **개선**: 환경 변수 암호화 또는 Secrets Manager 사용

3. **로컬 PostgreSQL 미사용**
   - 로컬에 PostgreSQL 16이 설치되어 있으나 실제로는 AWS RDS 사용
   - **개선**: 로컬 DB 제거 또는 개발 환경으로 활용

4. **Redis 미사용**
   - 세션/캐시 관리가 데이터베이스에만 의존
   - **개선**: Redis 도입 검토 (성능 향상)

### 🟡 중간 위험도

5. **S3 버킷 공개 설정**
   - 코드에서 `ACL: "public-read"` 사용
   - **개선**: CloudFront 또는 서명된 URL 사용

6. **백업 검증 부재**
   - 백업 생성 후 복원 테스트 없음
   - **개선**: 주기적 백업 복원 테스트

7. **파일 크기 제한 낮음**
   - 5MB 제한으로 대용량 파일 업로드 불가
   - **개선**: 파일 타입별 크기 제한 설정

8. **마이그레이션 롤백 전략 없음**
   - Prisma 마이그레이션 롤백 방법 미정의
   - **개선**: 마이그레이션 롤백 절차 문서화

### 🟢 낮은 위험도

9. **로컬 스토리지 옵션 미구현**
   - `env.nas.local`에 로컬 스토리지 설정이 있으나 미사용
   - **개선**: S3 장애 시 대체 방안으로 로컬 스토리지 구현

10. **백업 암호화 없음**
    - 백업 파일이 암호화되지 않음
    - **개선**: 백업 파일 암호화 (gpg 등)

---

## ✅ 바로 실행 가능한 체크 명령 (5개)

### 1. 데이터베이스 연결 상태 확인
```bash
ssh -o BatchMode=yes -o PreferredAuthentications=publickey -o StrictHostKeyChecking=accept-new malmoi@100.80.210.105 'cd ~/booking-system && npx prisma db pull --print 2>&1 | head -20'
```

### 2. S3 버킷 접근 확인
```bash
ssh -o BatchMode=yes -o PreferredAuthentications=publickey -o StrictHostKeyChecking=accept-new malmoi@100.80.210.105 'cd ~/booking-system && node -e "const { S3Client, ListBucketsCommand } = require(\"@aws-sdk/client-s3\"); const client = new S3Client({ region: process.env.AWS_REGION || \"ap-northeast-1\", credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID || \"\", secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || \"\" } }); client.send(new ListBucketsCommand({})).then(r => console.log(\"S3 접근 성공:\", r.Buckets?.map(b => b.Name))).catch(e => console.error(\"S3 접근 실패:\", e.message));"'
```

### 3. 백업 파일 존재 및 크기 확인
```bash
ssh -o BatchMode=yes -o PreferredAuthentications=publickey -o StrictHostKeyChecking=accept-new malmoi@100.80.210.105 'ls -lh ~/backups/database/daily/*.sql.gz 2>/dev/null | tail -5 || echo "백업 파일 없음"'
```

### 4. 데이터베이스 테이블 목록 및 크기 확인
```bash
ssh -o BatchMode=yes -o PreferredAuthentications=publickey -o StrictHostKeyChecking=accept-new malmoi@100.80.210.105 'cd ~/booking-system && node -e "const { PrismaClient } = require(\"@prisma/client\"); const prisma = new PrismaClient(); prisma.\$queryRaw\`SELECT schemaname, relname, pg_size_pretty(pg_total_relation_size(schemaname||\".\"||relname)) as size FROM pg_stat_user_tables ORDER BY pg_total_relation_size(schemaname||\".\"||relname) DESC LIMIT 20\`.then(r => { console.table(r); prisma.\$disconnect(); }).catch(e => { console.error(e); prisma.\$disconnect(); });"'
```

### 5. 환경 변수 설정 완전성 확인
```bash
ssh -o BatchMode=yes -o PreferredAuthentications=publickey -o StrictHostKeyChecking=accept-new malmoi@100.80.210.105 'cd ~/booking-system && node -e "const required = [\"DATABASE_URL\", \"AWS_S3_BUCKET\", \"AWS_ACCESS_KEY_ID\", \"AWS_SECRET_ACCESS_KEY\"]; const env = require(\"dotenv\").config().parsed || {}; required.forEach(k => console.log(k + \":\", env[k] ? \"✅ 설정됨\" : \"❌ 없음\"));"'
```

---

## 📋 추가 조사 필요 사항

1. **AWS RDS 백업 설정**: AWS 콘솔에서 RDS 자동 백업 설정 확인
2. **S3 버전 관리**: S3 버킷 버전 관리 활성화 여부 확인
3. **데이터베이스 복제**: RDS 읽기 전용 복제본 존재 여부
4. **모니터링**: CloudWatch 또는 다른 모니터링 도구 사용 여부
5. **재해 복구 계획**: RDS 스냅샷 및 복원 절차 문서화 여부

---

## 📝 결론

현재 시스템은 **AWS RDS PostgreSQL + AWS S3**를 사용하는 클라우드 중심 아키텍처입니다. 로컬 PostgreSQL은 설치되어 있으나 미사용 상태입니다. 백업은 자동화되어 있으나 검증 절차가 부족하며, 보안 측면에서 자격 증명 관리 개선이 필요합니다.


# 패스워드 재설정 기능 구성

## 개요
학생 관리 페이지에서 관리자가 학생의 패스워드를 재설정하고 임시 패스워드를 이메일로 전송하는 기능입니다.

## 구성 요소

### 1. 프론트엔드
**파일**: `src/app/admin/students/page.tsx`
- 위치: 학생 상세 정보 모달의 "패스워드 재설정" 버튼
- 동작:
  1. 학생 이메일 확인
  2. 확인 다이얼로그 표시
  3. API 호출: `POST /api/admin/students/{id}/reset-password`
  4. 결과 표시 (성공/실패)

### 2. API 라우트
**파일**: `src/app/api/admin/students/[id]/reset-password/route.ts`
- 동작:
  1. 관리자 인증 확인
  2. 학생 정보 조회
  3. 임시 패스워드 생성 (8자리 영문+숫자)
  4. 패스워드 해시화 및 DB 업데이트
  5. 이메일 전송 API 호출
  6. 결과 반환

### 3. 이메일 전송 API
**파일**: `src/app/api/email/send/route.ts`
- 사용 라이브러리: `nodemailer`
- SMTP 설정 (환경 변수):
  - `SMTP_HOST`: SMTP 서버 주소 (기본: smtp.gmail.com)
  - `SMTP_PORT`: SMTP 포트 (기본: 587)
  - `SMTP_SECURE`: SSL/TLS 사용 여부 (기본: false)
  - `SMTP_USER`: SMTP 사용자명 (이메일 주소)
  - `SMTP_PASS`: SMTP 비밀번호 (앱 비밀번호)
  - `EMAIL_FROM`: 발신자 이메일 주소

## 문제 해결

### 이메일이 전송되지 않는 경우

1. **SMTP 설정 확인**
   ```bash
   # 원격 서버에서 확인
   ssh malmoi@hanguru-system-server
   cd ~/booking-system
   grep -E 'SMTP|EMAIL' .env
   ```

2. **필수 환경 변수 설정**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   EMAIL_FROM=office@hanguru.school
   ```

3. **Gmail 앱 비밀번호 생성**
   - Google 계정 설정 → 보안 → 2단계 인증 활성화
   - 앱 비밀번호 생성
   - 생성된 비밀번호를 `SMTP_PASS`에 설정

4. **서버 로그 확인**
   ```bash
   # 원격 서버에서
   tail -f ~/booking-system/dev.log | grep -i email
   ```

5. **이메일 전송 실패 시**
   - 패스워드는 재설정되지만 이메일 전송 실패 시 사용자에게 알림
   - 임시 패스워드가 화면에 표시되므로 수동으로 전달 가능

## 개선 사항

### 최근 수정 (2025-11-23)
1. ✅ 이메일 전송 응답 확인 추가
2. ✅ 이메일 전송 실패 시 상세 에러 메시지 표시
3. ✅ 프론트엔드에서 이메일 전송 상태 표시
4. ✅ 로깅 개선

### 향후 개선
- [ ] 이메일 전송 재시도 로직
- [ ] 이메일 전송 큐 시스템
- [ ] 이메일 전송 히스토리 저장
- [ ] 대체 이메일 서비스 연동 (SendGrid, AWS SES 등)



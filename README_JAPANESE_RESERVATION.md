# 🇯🇵 일본인 학생용 한국어 수업 예약 시스템

## 📋 시스템 개요

이 시스템은 일본인 학생들이 한국어 수업을 예약, 확인, 변경, 취소할 수 있는 전용 웹 애플리케이션입니다.

### 🎯 주요 기능

- ✅ 일본어 UI로 완전 구성
- ✅ LINE 및 이메일 로그인 기반 접근
- ✅ 5분 단위 예약 시스템
- ✅ 온라인/대면 수업 지원
- ✅ 자동 알림 시스템
- ✅ Google Calendar 연동

## 🚀 시작하기

### 1. 시스템 접속

```
메인 페이지: http://localhost:3002/reservation/japanese
```

### 2. 사용자 계정

#### 테스트 계정

- **이메일**: student1@example.com
- **비밀번호**: password123
- **UID**: STUDENT1234

## 📱 페이지 구성

### 1. 메인 페이지 (`/reservation/japanese`)

- 시스템 소개 및 안내
- "예약 시작" 및 "예약 확인" 버튼
- 코스별 가격 정보

### 2. 로그인/회원가입 (`/reservation/japanese/login`)

- 이메일/비밀번호 로그인
- 회원가입 시 UID 입력 필수
- 일본 전화번호 형식 검증

### 3. 예약 생성 (`/reservation/japanese/new`)

- 4단계 예약 프로세스:
  1. **코스 선택**: 40분~180분 코스
  2. **날짜 선택**: 달력에서 선택
  3. **시간 선택**: 5분 단위 (9:00-21:00)
  4. **확인**: 예약 내용 최종 확인

### 4. 마이페이지 (`/reservation/japanese/mypage`)

- 예약 목록 조회
- 필터링 (전체/예정/완료/취소)
- 예약 취소 및 캘린더 추가

### 5. 예약 확정 (`/reservation/japanese/confirm`)

- 예약 완료 확인
- 예약 코드 복사
- 캘린더 연동

## 🎓 코스 정보

| 코스명         | 시간  | 가격    | 설명             |
| -------------- | ----- | ------- | ---------------- |
| 基礎コース     | 40분  | ¥3,000  | 한국어 기초 학습 |
| 標準コー스     | 60분  | ¥4,500  | 일상회화 중심    |
| 集中コー스     | 90분  | ¥6,500  | 심화 학습        |
| 特訓コー스     | 120분 | ¥8,500  | 고급자 특훈      |
| マスターコース | 180분 | ¥12,000 | 완전 마스터      |

## 🔧 기술 스택

### Frontend

- **Next.js 15.4.1** - React 프레임워크
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 스타일링
- **Lucide React** - 아이콘

### Backend

- **Next.js API Routes** - 서버 API
- **JWT** - 인증 토큰
- **Cookies** - 세션 관리

### 데이터베이스 (향후 구현)

- **MySQL/PostgreSQL** - 예약 데이터
- **Firebase** - 사용자 인증
- **Redis** - 세션 캐시

## 📡 API 엔드포인트

### 인증

- `POST /api/reservation/japanese/login` - 로그인
- `POST /api/reservation/japanese/register` - 회원가입

### 예약 관리

- `POST /api/reservation/japanese/create` - 예약 생성
- `GET /api/reservation/japanese/details` - 예약 상세
- `POST /api/reservation/japanese/cancel` - 예약 취소
- `GET /api/reservation/japanese/list` - 예약 목록

## 🔐 보안 기능

### 인증 및 권한

- JWT 토큰 기반 인증
- 쿠키 기반 세션 관리
- 사용자별 예약 접근 제어

### 데이터 검증

- 입력 데이터 형식 검증
- 중복 예약 방지
- UID 유효성 검증

## 📅 예약 규칙

### 시간 관리

- **예약 가능 시간**: 9:00 ~ 21:00
- **시간 단위**: 5분 단위
- **버퍼 시간**: 수업 전후 자동 블록

### 취소 정책

- **취소 가능**: 수업 24시간 전까지
- **취소 방법**: 마이페이지에서 직접 취소

## 🔔 알림 시스템 (향후 구현)

### 자동 알림

- **전일 리마인드**: 예약 전날 오후 6시
- **수업 시작 알림**: 수업 시작 10분 전
- **리뷰 요청**: 수업 5시간 후
- **월간 유도**: 매월 1일, 15일, 25일

### 알림 방법

- **LINE**: LINE LIFF 연동
- **이메일**: 자동 메일 발송

## 🛠️ 개발 환경 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

```bash
# .env.local
JWT_SECRET=your-secret-key
DATABASE_URL=your-database-url
LINE_CHANNEL_ID=your-line-channel-id
ZOOM_API_KEY=your-zoom-api-key
```

### 3. 개발 서버 실행

```bash
npm run dev
```

## 📊 데이터베이스 스키마 (향후 구현)

### 사용자 테이블

```sql
CREATE TABLE japanese_students (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  uid VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('active', 'inactive') DEFAULT 'active'
);
```

### 예약 테이블

```sql
CREATE TABLE reservations (
  id VARCHAR(50) PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL,
  course_id VARCHAR(20) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  type ENUM('online', 'offline') NOT NULL,
  status ENUM('confirmed', 'completed', 'cancelled') DEFAULT 'confirmed',
  price INT NOT NULL,
  reservation_code VARCHAR(20) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES japanese_students(id)
);
```

## 🚀 배포 가이드

### 1. Vercel 배포 (권장)

```bash
npm install -g vercel
vercel --prod
```

### 2. Docker 배포

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📞 지원 및 문의

### 개발자 정보

- **시스템**: 일본인 학생용 한국어 수업 예약 시스템
- **버전**: 1.0.0
- **최종 업데이트**: 2024년 1월

### 기술 지원

- 이슈 발생 시 GitHub Issues 등록
- 기능 요청 시 Pull Request 제출

## 🔄 향후 개발 계획

### Phase 1 (현재)

- ✅ 기본 예약 시스템
- ✅ 사용자 인증
- ✅ 일본어 UI

### Phase 2 (다음 단계)

- 🔄 LINE LIFF 인증 연동
- 🔄 Zoom API 연동
- 🔄 자동 알림 시스템

### Phase 3 (고도화)

- 🔄 관리자 대시보드
- 🔄 통계 및 리포트
- 🔄 결제 시스템 연동

---

**© 2024 한국어 수업 예약 시스템. All rights reserved.**

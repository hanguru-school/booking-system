# Vercel 환경변수 설정 가이드

## 🚨 현재 상황

현재 Vercel에 환경변수가 하나도 설정되지 않아 LINE 연동이 작동하지 않습니다.

## 📋 설정해야 할 환경변수

### **1. Vercel 대시보드 접속**

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. `mal-moi/booking-system` 프로젝트 선택
3. **Settings** 탭 클릭
4. **Environment Variables** 섹션으로 이동

### **2. LINE 연동 환경변수 추가**

#### **2.1 LINE Login 환경변수**

```
Name: NEXT_PUBLIC_LINE_CLIENT_ID
Value: [LINE Login 채널의 Channel ID]
Environment: Production, Preview, Development
```

```
Name: NEXT_PUBLIC_LINE_REDIRECT_URI
Value: https://hanguru.school/auth/line/callback
Environment: Production, Preview, Development
```

```
Name: LINE_CHANNEL_SECRET
Value: [LINE Login 채널의 Channel Secret]
Environment: Production, Preview, Development
```

#### **2.2 LINE Messaging API 환경변수 (교실용)**

```
Name: LINE_CHANNEL_ACCESS_TOKEN
Value: [Messaging API 채널의 Channel Access Token]
Environment: Production, Preview, Development
```

```
Name: LINE_MESSAGING_SECRET
Value: [Messaging API 채널의 Channel Secret]
Environment: Production, Preview, Development
```

#### **2.3 LINE Business Center 환경변수 (교실용)**

```
Name: LINE_BUSINESS_CHANNEL_ID
Value: [Business Center 채널의 Channel ID]
Environment: Production, Preview, Development
```

```
Name: LINE_BUSINESS_CHANNEL_SECRET
Value: [Business Center 채널의 Channel Secret]
Environment: Production, Preview, Development
```

### **3. 기타 필수 환경변수**

#### **3.1 NextAuth 설정**

```
Name: NEXTAUTH_SECRET
Value: [랜덤한 32자 이상의 문자열]
Environment: Production, Preview, Development
```

```
Name: NEXTAUTH_URL
Value: https://hanguru.school
Environment: Production, Preview, Development
```

#### **3.2 데이터베이스 설정**

```
Name: DATABASE_URL
Value: postgresql://malmoi_admin:password@malmoi-system-db.cp4q8o4akkqg.ap-northeast-2.rds.amazonaws.com:5432/malmoi_system
Environment: Production, Preview, Development
```

## 🔍 환경변수 확인 방법

### **1. Vercel CLI로 확인**

```bash
npx vercel env ls
```

### **2. 배포 후 확인**

```bash
npx vercel --prod
```

## ⚠️ 주의사항

1. **NEXT*PUBLIC* 접두사**: 클라이언트에서 접근 가능한 변수
2. **보안**: Channel Secret은 절대 클라이언트에 노출되지 않음
3. **환경**: Production, Preview, Development 모두 설정 필요

## 🧪 테스트 방법

1. 환경변수 설정 후 재배포
2. `/auth/login` 페이지에서 LINE 로그인 버튼 클릭
3. LINE 로그인 플로우 확인
4. 콜백 처리 확인

## 📞 문제 해결

### **일반적인 오류**

- **400 Bad Request**: Callback URL 불일치
- **401 Unauthorized**: Client ID/Secret 오류
- **403 Forbidden**: Scope 권한 부족

### **디버깅**

- 브라우저 개발자 도구에서 네트워크 요청 확인
- Vercel 함수 로그 확인
- LINE 개발자 콘솔에서 로그 확인

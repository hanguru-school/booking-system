# 로컬 Mac을 서버로 사용하기

## 🖥️ 방법 1: 로컬 네트워크에서만 접속 (간단)

### 1. Mac의 IP 주소 확인
```bash
# 터미널에서 실행
ipconfig getifaddr en0
# 예: 192.168.1.100
```

### 2. Next.js 서버 실행
```bash
cd /Users/jinasmacbook/booking-system

# 모든 네트워크 인터페이스에서 접속 허용
npm run dev -- -H 0.0.0.0 -p 3004
```

### 3. 같은 WiFi의 다른 기기에서 접속
```
http://192.168.1.100:3004
```

**제한사항:**
- ❌ 외부 인터넷에서 접속 불가
- ✅ 같은 WiFi에서만 접속 가능
- ✅ Mac이 켜져 있어야 함

---

## 🌐 방법 2: 외부 인터넷에서도 접속 가능 (복잡)

### 필요한 작업:

#### 1. ngrok 사용 (임시 터널, 가장 쉬움)
```bash
# ngrok 설치
brew install ngrok

# 회원가입 후 인증토큰 설정
ngrok config add-authtoken YOUR_TOKEN

# 터널 생성
ngrok http 3004
```

**결과:**
```
Forwarding: https://abc123.ngrok.io → http://localhost:3004
```

**장점:**
- ⚡ 즉시 사용 가능
- 🌐 전세계 어디서나 접속
- 🔒 자동 HTTPS

**단점:**
- 💰 무료 플랜: URL이 매번 바뀜, 세션 시간 제한
- 💰 유료 플랜: 월 $8 (고정 URL)
- 🐌 속도 약간 느림 (터널 경유)

#### 2. 공유기 포트포워딩 + DDNS (복잡)

**필요한 작업:**
1. 공유기 관리자 페이지 접속
2. 포트포워딩 설정 (3004 → Mac IP)
3. DDNS 서비스 가입 (Duck DNS 등)
4. 방화벽 설정
5. Mac 절전 모드 비활성화

**장점:**
- 🆓 완전 무료
- 🌐 고정 도메인 사용 가능

**단점:**
- 🔧 설정 매우 복잡
- 🔒 보안 위험 (집 IP 노출)
- ⚡ 업로드 속도에 따라 느릴 수 있음
- 💻 Mac이 항상 켜져 있어야 함
- 🔌 정전/재부팅 시 서비스 중단

---

## 🚀 방법 3: 클라우드 배포 (가장 추천!)

### Vercel (무료/유료)

```bash
# 1. Vercel 계정 생성
# https://vercel.com

# 2. Vercel CLI 설치
npm i -g vercel

# 3. 로그인
vercel login

# 4. 프로젝트 배포
cd /Users/jinasmacbook/booking-system
vercel

# 5. 환경변수 설정
vercel env add DATABASE_URL
vercel env add EMAIL_USER
vercel env add EMAIL_PASS

# 6. 재배포
vercel --prod
```

**결과:**
```
✅ 배포 완료!
🌐 https://malmoi-korean-class.vercel.app
```

**장점:**
- 🆓 무료 플랜 충분 (개발/테스트)
- ⚡ 초고속 글로벌 CDN
- 🔒 자동 HTTPS/SSL
- 🔄 GitHub 푸시하면 자동 배포
- 📊 모니터링/로그 제공
- 💾 무료 PostgreSQL 포함

**단점:**
- 💰 트래픽 많으면 유료 ($20/월)
- 📝 서버리스 환경 (일부 제약)

### Render.com (무료/유료)

```bash
# GitHub 저장소 연결만 하면 자동 배포
```

**장점:**
- 🆓 무료 플랜 (PostgreSQL 포함)
- 🐳 Docker 지원
- 🔄 자동 배포

**단점:**
- 🐌 무료 플랜은 느림
- 😴 비활성 시 슬립 모드

---

## 📊 방법 비교표

| 방법 | 비용 | 난이도 | 속도 | 안정성 | 접속 범위 |
|------|------|--------|------|--------|----------|
| **Vercel** | 무료~$20 | ⭐ | ⚡⚡⚡ | ⭐⭐⭐ | 🌐 전세계 |
| **ngrok** | 무료~$8 | ⭐⭐ | ⚡⚡ | ⭐⭐ | 🌐 전세계 |
| **로컬 WiFi** | 무료 | ⭐ | ⚡⚡⚡ | ⭐ | 🏠 같은 WiFi |
| **포트포워딩** | 무료 | ⭐⭐⭐⭐⭐ | ⚡⚡ | ⭐ | 🌐 전세계 |
| **Render** | 무료~$7 | ⭐⭐ | ⚡ | ⭐⭐ | 🌐 전세계 |

---

## 🎯 상황별 추천

### 개발/테스트 단계 (지금)
```
1순위: 로컬 WiFi (무료, 간단)
2순위: ngrok (무료, 외부 접속)
3순위: Vercel 무료 플랜
```

### 실제 운영 단계
```
1순위: Vercel Pro ($20/월)
2순위: AWS/Azure (더 큰 서비스)
3순위: 전용 서버 임대
```

---

## 💡 가장 이상적인 방법 (추천!)

### **단계적 접근:**

#### 🔵 **1단계: 로컬 개발 (지금)**
```bash
# 현재 Mac에서 개발
npm run dev

# 같은 WiFi에서 테스트
npm run dev -- -H 0.0.0.0 -p 3004
# → http://192.168.1.100:3004
```

#### 🟢 **2단계: 임시 공개 테스트 (필요시)**
```bash
# ngrok으로 외부 접속 가능하게
ngrok http 3004
# → https://abc123.ngrok.io

# 친구/동료에게 URL 공유해서 테스트
```

#### 🟡 **3단계: 정식 배포 (완성 후)**
```bash
# Vercel에 배포
vercel --prod

# 또는 GitHub Actions로 자동 배포 설정
# → main 브랜치에 푸시하면 자동 배포
```

#### 🔴 **4단계: 실제 운영 (서비스 오픈)**
```bash
# 도메인 연결
# malmoi-korean.com → Vercel

# 데이터베이스 업그레이드
# Vercel Postgres Pro 플랜

# 모니터링 설정
# Sentry, LogRocket 등
```

---

## 🚀 지금 바로 시작하기

### 옵션 A: 로컬에서만 (0원, 5분)
```bash
cd /Users/jinasmacbook/booking-system
npm run dev -- -H 0.0.0.0 -p 3004

# Mac IP 확인
ipconfig getifaddr en0

# 다른 기기에서 접속
# http://[Mac IP]:3004
```

### 옵션 B: 외부 접속 가능 (0원, 10분)
```bash
# ngrok 설치
brew install ngrok

# ngrok 계정 생성 (무료)
# https://ngrok.com

# 인증토큰 설정
ngrok config add-authtoken [YOUR_TOKEN]

# 서버 실행
npm run dev

# 새 터미널에서 터널 생성
ngrok http 3004

# 생성된 URL로 어디서든 접속!
```

### 옵션 C: 정식 배포 (0원~, 30분)
```bash
# Vercel 배포
npm i -g vercel
vercel login
vercel

# 환경변수 설정 (Vercel 대시보드)
# 완료!
```

---

## 📝 결론

**가장 이상적인 방법:**

1. **지금 (개발)**: Mac에서 로컬 개발 + ngrok으로 테스트
2. **완성 후 (배포)**: Vercel 무료 플랜으로 배포
3. **서비스 오픈 (운영)**: Vercel Pro 또는 전용 서버

**이유:**
- ✅ 개발은 로컬이 가장 빠르고 편함
- ✅ 테스트는 ngrok으로 외부 접속 가능
- ✅ 배포는 Vercel이 가장 간단하고 안정적
- ✅ 비용 효율적 (무료 → 필요시 유료)
- ✅ Mac 24시간 켜둘 필요 없음
- ✅ 보안 걱정 없음

어떤 방법을 원하시나요? 선택하시면 상세하게 설정 도와드리겠습니다! 🎉



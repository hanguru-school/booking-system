# 수정 완료된 파일 목록

## 수정된 파일들

1. **src/app/admin/student-identifiers/page.tsx**
   - useAuth 제거 (빌드 에러 해결)

2. **src/app/layout.tsx**
   - viewport 메타 태그 추가 (모바일 반응형)

3. **src/app/admin/layout.tsx**
   - 모바일 사이드바 최적화
   - 메인 콘텐츠가 항상 보이도록 수정

4. **src/app/globals.css**
   - 모바일 반응형 CSS 추가

5. **src/lib/prisma.ts**
   - checkPrismaConnection 함수 추가

6. **src/app/admin/reservations/page.tsx**
   - 모바일 반응형 스타일 추가

7. **src/app/admin/students/lessons/page.tsx**
   - useSearchParams Suspense 래핑

8. **src/app/admin/students/payments/page.tsx**
   - useSearchParams Suspense 래핑

9. **src/app/admin/students/levels/page.tsx**
   - useSearchParams Suspense 래핑

## 원격 서버 배포 방법

### 방법 1: Git 사용 (권장)
```bash
ssh malmoi@hanguru-system-server
cd ~/booking-system
git pull origin main
# 또는
git pull origin feature/production-system-setup
```

### 방법 2: 파일 직접 복사
로컬에서 실행:
```bash
cd /Users/jinasmacbook/booking-system

# 주요 파일들 복사
scp src/app/admin/student-identifiers/page.tsx malmoi@hanguru-system-server:~/booking-system/src/app/admin/student-identifiers/
scp src/app/layout.tsx malmoi@hanguru-system-server:~/booking-system/src/app/
scp src/app/admin/layout.tsx malmoi@hanguru-system-server:~/booking-system/src/app/admin/
scp src/app/globals.css malmoi@hanguru-system-server:~/booking-system/src/app/
scp src/lib/prisma.ts malmoi@hanguru-system-server:~/booking-system/src/lib/
```

### 방법 3: 원격 서버에서 직접 수정
원격 서버 터미널에서:
```bash
cd ~/booking-system/src/app/admin/student-identifiers
# 파일 편집하여 useAuth 제거
nano page.tsx
```

## 서버 재시작
```bash
cd ~/booking-system
pkill -f "next dev"
sleep 2
NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 nohup npm run dev > dev.log 2>&1 &
echo $! > .dev.pid
```



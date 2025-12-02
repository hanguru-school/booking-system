# 원격 서버 배포 가이드

## 빠른 배포 방법

원격 서버에 SSH로 접속한 후 다음 명령을 실행하세요:

```bash
ssh malmoi@hanguru-system-server
cd ~/booking-system

# Git에서 최신 코드 가져오기 (또는 직접 파일 수정)
git pull origin main

# 또는 변경된 파일만 수동으로 복사
# 로컬에서: scp src/app/api/auth/login/route.ts malmoi@hanguru-system-server:~/booking-system/src/app/api/auth/login/
# 로컬에서: scp src/app/auth/login/page.tsx malmoi@hanguru-system-server:~/booking-system/src/app/auth/login/
# 로컬에서: scp src/app/layout.tsx malmoi@hanguru-system-server:~/booking-system/src/app/
# 로컬에서: scp src/app/admin/layout.tsx malmoi@hanguru-system-server:~/booking-system/src/app/admin/
# 로컬에서: scp src/app/globals.css malmoi@hanguru-system-server:~/booking-system/src/app/

# 서버 재시작
pkill -f "next dev"
pkill -f "npm run dev"
sleep 2
NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 nohup npm run dev > dev.log 2>&1 &
echo $! > .dev.pid

# 서버 상태 확인
sleep 5
curl http://localhost:3000 > /dev/null && echo "✅ 서버 정상 작동" || echo "❌ 서버 오류"
```

## 주요 수정 사항

1. **로그인 API**: `/src/app/api/auth/login/route.ts` - 정상 작동 확인됨
2. **로그인 페이지**: `/src/app/auth/login/page.tsx` - 정상 작동 확인됨
3. **레이아웃**: `/src/app/layout.tsx` - viewport 메타 태그 추가
4. **관리자 레이아웃**: `/src/app/admin/layout.tsx` - 모바일 반응형 수정
5. **CSS**: `/src/app/globals.css` - 모바일 최적화 추가

## 문제 해결

관리자 로그인이 안 되는 경우:
1. 데이터베이스 연결 확인
2. 관리자 계정 존재 여부 확인
3. 비밀번호 해시 확인



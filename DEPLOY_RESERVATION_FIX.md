# 예약 날짜/시간 표시 문제 수정 배포 가이드

## 수정된 파일

1. `src/app/api/admin/reservations/route.ts` - 예약 생성/조회 API
2. `src/app/api/reservations/list/route.ts` - 예약 목록 조회 API  
3. `src/app/admin/reservations/page.tsx` - 예약 관리 페이지

## 수정 내용

### 1. 예약 생성 시 날짜/시간 저장
- 입력받은 날짜/시간을 로컬 시간대로 그대로 저장
- `toISOString()` 사용하지 않음 (UTC 변환 방지)

### 2. 예약 조회 시 날짜/시간 표시
- DB에서 가져온 Date 객체를 로컬 시간대 기준으로 파싱
- `getFullYear()`, `getMonth()`, `getDate()`, `getHours()`, `getMinutes()` 사용

### 3. 날짜 비교 로직
- YYYY-MM-DD 형식 문자열로 직접 비교
- 시간대 변환 없이 정확한 날짜 매칭

## 배포 방법

```bash
# 파일 배포
scp src/app/api/admin/reservations/route.ts malmoi@hanguru-system-server:~/booking-system/src/app/api/admin/reservations/route.ts

scp src/app/api/reservations/list/route.ts malmoi@hanguru-system-server:~/booking-system/src/app/api/reservations/list/route.ts

scp src/app/admin/reservations/page.tsx malmoi@hanguru-system-server:~/booking-system/src/app/admin/reservations/page.tsx

# 서버 재시작
ssh malmoi@hanguru-system-server "cd ~/booking-system && pkill -f 'next dev' && sleep 2 && npm run dev > dev.log 2>&1 &"
```

## 테스트 방법

1. 11월 26일 9시로 예약 생성
2. 월별 일정표에서 11월 26일에 예약이 표시되는지 확인
3. 시간이 09:00으로 정확히 표시되는지 확인
4. 예약 상세 모달에서 날짜와 시간이 정확한지 확인



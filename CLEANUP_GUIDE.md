# 기존 서울 리전 리소스 삭제 가이드

## 🎯 삭제할 AWS 리소스들:

### 1. RDS 데이터베이스 (서울 리전)

```
❌ DB 인스턴스: malmoi-system-db
❌ 리전: ap-northeast-2 (Seoul)
❌ 엔드포인트: malmoi-system-db.cp4q8o4akkqg.ap-northeast-1.rds.amazonaws.com
```

### 2. S3 버킷 (서울 리전)

```
❌ 버킷 이름: malmoi-system-files
❌ 리전: ap-northeast-2 (Seoul)
```

### 3. Cognito User Pool (서울 리전)

```
❌ User Pool: malmoi-system-pool (서울)
❌ User Pool ID: ap-northeast-2_5R7g8tN40
❌ 리전: ap-northeast-2 (Seoul)
```

## 🎯 삭제 순서:

### 1단계: RDS 데이터베이스 삭제

1. **AWS RDS 콘솔** 접속
2. **서울 리전** 선택
3. **malmoi-system-db** 선택
4. **"Delete"** 클릭
5. **"Create final snapshot?"** 선택
6. **"Delete"** 클릭

### 2단계: S3 버킷 삭제

1. **AWS S3 콘솔** 접속
2. **서울 리전** 선택
3. **malmoi-system-files** 선택
4. **"Delete"** 클릭
5. **버킷 이름 입력** 확인
6. **"Delete"** 클릭

### 3단계: Cognito User Pool 삭제

1. **AWS Cognito 콘솔** 접속
2. **서울 리전** 선택
3. **malmoi-system-pool** 선택
4. **"Delete"** 클릭
5. **"Delete"** 클릭

## ⚠️ 주의사항:

- **새 도쿄 리전 리소스가 정상 작동하는지 확인 후 삭제**
- **중요한 데이터는 백업 후 삭제**
- **삭제 후 복구 불가능**

# S3 버킷 도쿄 리전 마이그레이션 가이드

## 🎯 AWS S3 콘솔 설정:

### 1단계: 새 S3 버킷 생성 (도쿄 리전)

1. **AWS S3 콘솔** 접속
2. **"Create bucket"** 클릭
3. **버킷 이름:** `malmoi-system-files-tokyo`
4. **리전:** `Asia Pacific (Tokyo) ap-northeast-1`
5. **Block Public Access:** 체크 해제 (필요한 경우)
6. **"Create bucket"** 클릭

### 2단계: 기존 파일 복사

1. **기존 버킷** (`malmoi-system-files`) 선택
2. **모든 파일 선택**
3. **"Copy"** 클릭
4. **대상:** `malmoi-system-files-tokyo`
5. **"Copy"** 클릭

### 3단계: 환경 변수 업데이트

```
AWS_S3_BUCKET = malmoi-system-files-tokyo
```

## 📋 설정할 S3 버킷 정보:

### 새 S3 버킷 (도쿄 리전)

```
✅ 버킷 이름: malmoi-system-files-tokyo
✅ 리전: ap-northeast-1 (Tokyo)
✅ 접근 권한: Private (기본)
✅ 버전 관리: Disabled (기본)
✅ 암호화: SSE-S3 (기본)
```

### 기존 S3 버킷 (서울 리전) - 삭제 예정

```
❌ 버킷 이름: malmoi-system-files
❌ 리전: ap-northeast-2 (Seoul)
```

## 🎯 마이그레이션 순서:

1. **새 S3 버킷 생성** (도쿄 리전)
2. **기존 파일 복사**
3. **환경 변수 업데이트**
4. **기존 버킷 삭제** (선택사항)

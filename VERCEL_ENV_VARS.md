# Vercel 환경 변수 설정 가이드

## 📋 추가할 환경 변수들:

### Database Configuration

```
DATABASE_URL = postgresql://malmoi_admin:malmoi_admin_password_2024@malmoi-system-db-tokyo.crooggsemeim.ap-northeast-1.rds.amazonaws.com:5432/malmoi_system?sslmode=require
```

### AWS Configuration

```
AWS_REGION = ap-northeast-1
AWS_RDS_HOST = malmoi-system-db-tokyo.crooggsemeim.ap-northeast-1.rds.amazonaws.com
AWS_RDS_PORT = 5432
AWS_RDS_DATABASE = malmoi_system
AWS_RDS_USERNAME = malmoi_admin
AWS_RDS_PASSWORD = malmoi_admin_password_2024
```

### JWT Configuration

```
JWT_SECRET = 4822d5d02c9ec4fd183db70c1645ec1e
```

### AWS Cognito Configuration

```
COGNITO_CLIENT_ID = 4bdn0n9r92huqpcs21e0th1nve
COGNITO_CLIENT_SECRET = 9ko7sn73f63en08gqh8uhhmvaagmt2o1vn9gnffjcgoecjskf8e
COGNITO_USER_POOL_ID = ap-northeast-1_5R7g8tN40
COGNITO_DOMAIN = https://malmoi-system-pool.auth.ap-northeast-1.amazoncognito.com
```

### Next.js Public Environment Variables

```
NEXT_PUBLIC_COGNITO_CALLBACK_URL = https://app.hanguru.school/api/auth/callback/cognito
NEXT_PUBLIC_COGNITO_SIGNOUT_URL = https://app.hanguru.school
NEXT_PUBLIC_COGNITO_OAUTH_SCOPES = email openid phone
```

## 📋 삭제할 환경 변수들:

### NextAuth.js 관련 (삭제)

```
❌ NEXTAUTH_SECRET
❌ NEXTAUTH_URL
```

### 서울 리전 관련 (삭제)

```
❌ AWS_REGION (서울 리전 값)
❌ DATABASE_URL (서울 리전 값)
❌ AWS_RDS_HOST (서울 리전 값)
```

## 🎯 설정 순서:

1. **기존 환경 변수 삭제** (NextAuth.js, 서울 리전 관련)
2. **새 환경 변수 추가** (도쿄 리전, JWT, Cognito)
3. **배포 확인**

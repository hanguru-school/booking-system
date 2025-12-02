# ========================================
# MalMoi 한국어 교실 - Production Dockerfile
# DXP2800 NAS 서버용 최적화
# ========================================

FROM node:18-alpine AS base

# 한국어 로케일 및 타임존 설정
RUN apk add --no-cache tzdata
ENV TZ=Asia/Tokyo

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일 복사
COPY package*.json ./
COPY prisma ./prisma/

# ========================================
# Dependencies 설치 단계
# ========================================
FROM base AS deps
RUN npm ci --only=production && npm cache clean --force

# ========================================
# 개발 의존성 설치 및 빌드 단계
# ========================================
FROM base AS builder

# 모든 의존성 설치
RUN npm ci

# 소스 코드 복사
COPY . .

# Prisma 클라이언트 생성
RUN npx prisma generate

# Next.js 애플리케이션 빌드
RUN npm run build

# ========================================
# Production 실행 단계
# ========================================
FROM node:18-alpine AS runner

# 시스템 패키지 설치
RUN apk add --no-cache \
    curl \
    postgresql-client \
    tzdata

# 타임존 설정
ENV TZ=Asia/Tokyo
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# 작업 디렉토리 설정
WORKDIR /app

# 사용자 생성
RUN addgroup --system --gid 1001 malmoi
RUN adduser --system --uid 1001 malmoi

# 필요한 파일들 복사
COPY --from=deps --chown=malmoi:malmoi /app/node_modules ./node_modules
COPY --from=builder --chown=malmoi:malmoi /app/.next ./.next
COPY --from=builder --chown=malmoi:malmoi /app/public ./public
COPY --from=builder --chown=malmoi:malmoi /app/package*.json ./
COPY --from=builder --chown=malmoi:malmoi /app/prisma ./prisma
COPY --from=builder --chown=malmoi:malmoi /app/next.config.ts ./
COPY --from=builder --chown=malmoi:malmoi /app/src ./src

# 권한 설정
RUN chown -R malmoi:malmoi /app

# 포트 설정
EXPOSE 3000

# 환경 변수 설정
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# 헬스체크 추가
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# 사용자 전환
USER malmoi

# 시작 스크립트
CMD ["npm", "start"]
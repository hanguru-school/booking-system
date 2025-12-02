import dotenv from "dotenv";
import { readFileSync } from "fs";

// 환경변수 로딩: 서버에서는 /etc/malmoi/booking.env 우선 사용
if (typeof window === "undefined" && process.env.NODE_ENV === "production") {
  try {
    // 서버 환경에서 /etc/malmoi/booking.env 파일 읽기 시도
    const envFile = "/etc/malmoi/booking.env";
    // 권한 문제 해결: child_process로 sudo 없이 읽기 시도
    let envContent: string;
    try {
      envContent = readFileSync(envFile, "utf-8");
    } catch (readError: any) {
      // 권한 오류인 경우, PM2 환경변수에서 이미 로드되었을 수 있음
      if (readError.code === "EACCES" || readError.code === "EPERM") {
        console.warn("⚠️ /etc/malmoi/booking.env 읽기 권한 없음, PM2 환경변수 사용");
        // PM2가 이미 환경변수를 로드했을 수 있으므로 계속 진행
        envContent = "";
      } else {
        throw readError;
      }
    }
    
    if (!envContent) {
      // 파일을 읽지 못했지만 PM2 환경변수에서 이미 로드되었을 수 있음
      console.log("✅ PM2 환경변수 사용 (파일 읽기 스킵)");
    } else {
      const envVars: Record<string, string> = {};
      
      envContent.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const [key, ...valueParts] = trimmed.split("=");
          if (key && valueParts.length > 0) {
            const value = valueParts.join("=").replace(/^["']|["']$/g, "");
            envVars[key.trim()] = value.trim();
          }
        }
      });
      
      // 환경변수에 주입 (기존 값도 덮어쓰기 - 서버 환경에서는 파일 값이 우선)
      Object.entries(envVars).forEach(([key, value]) => {
        process.env[key] = value;
      });
      
      console.log("✅ /etc/malmoi/booking.env 로드 완료");
      console.log("DATABASE_URL:", process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:[^@]*@/, ":***@") : "not set");
    }
  } catch (error) {
    // 파일이 없거나 읽을 수 없으면 기본 dotenv 사용
    console.warn("⚠️ /etc/malmoi/booking.env 로드 실패, 기본 .env 파일 사용:", error);
    dotenv.config();
  }
} else {
  // 개발 환경에서는 기본 dotenv 사용
  dotenv.config();
}

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'error', 'warn'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// 데이터베이스 연결 확인 함수
export async function checkPrismaConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      success: true,
      message: "데이터베이스 연결이 정상입니다.",
    };
  } catch (error) {
    console.error("Prisma connection check failed:", error);
    return {
      success: false,
      message: "데이터베이스 연결에 실패했습니다.",
      error: error instanceof Error ? error.message : "DATABASE_CONNECTION_FAILED",
    };
  }
}

export default prisma

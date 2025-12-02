import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // 데이터베이스 연결 확인
    await prisma.$queryRaw`SELECT 1`;
    
    // 서버 정보
    const serverInfo = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || "0.1.0",
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: "connected",
      storage: {
        type: process.env.OBJECT_STORAGE_ENDPOINT ? "Object Storage (MinIO)" : "not_configured",
        endpoint: process.env.OBJECT_STORAGE_ENDPOINT || "not_configured",
        bucket: process.env.OBJECT_STORAGE_BUCKET || "not_configured"
      }
    };

    return NextResponse.json(serverInfo, { status: 200 });
  } catch (error) {
    console.error("Health check failed:", error);
    
    return NextResponse.json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
      environment: process.env.NODE_ENV
    }, { status: 500 });
  }
}

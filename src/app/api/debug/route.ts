import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("디버그 API 시작");
    
    // 환경 변수 확인
    const envVars = {
      DATABASE_URL: process.env.DATABASE_URL ? "설정됨" : "설정되지 않음",
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      // Object Storage
      OBJECT_STORAGE_ENDPOINT: process.env.OBJECT_STORAGE_ENDPOINT ? "설정됨" : "설정되지 않음",
      OBJECT_STORAGE_BUCKET: process.env.OBJECT_STORAGE_BUCKET ? "설정됨" : "설정되지 않음",
    };
    
    console.log("환경 변수:", envVars);
    
    // 데이터베이스 URL 형식 확인
    let dbUrlInfo: any = "확인 불가";
    if (process.env.DATABASE_URL) {
      try {
        const url = new URL(process.env.DATABASE_URL);
        dbUrlInfo = {
          protocol: url.protocol,
          host: url.hostname,
          port: url.port,
          database: url.pathname.slice(1),
          hasUsername: !!url.username,
          hasPassword: !!url.password,
        };
      } catch (urlError) {
        dbUrlInfo = "잘못된 URL 형식";
      }
    }
    
    return NextResponse.json({
      success: true,
      message: "디버그 API 정상 작동",
      timestamp: new Date().toISOString(),
      environment: envVars,
      databaseUrl: dbUrlInfo,
    });
  } catch (error) {
    console.error("디버그 API 오류:", error);
    return NextResponse.json({
      success: false,
      error: "디버그 API 오류",
      details: error instanceof Error ? error.message : "알 수 없는 오류",
    }, { status: 500 });
  }
} 
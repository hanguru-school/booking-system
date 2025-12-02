import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    console.log("관리자 목록 API 호출됨");
    
    // 모든 관리자 조회
    const admins = await prisma.user.findMany({
      where: {
        role: "ADMIN",
      },
      include: {
        admin: true,
      },
    });

    console.log(`데이터베이스에서 ${admins.length}명의 관리자 조회됨`);

    // 응답 데이터 형식 변환
    const formattedAdmins = admins.map(admin => ({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      status: admin.admin?.isApproved ? "ACTIVE" : "PENDING",
      permissions: admin.admin?.permissions || {
        userManagement: false,
        reservationManagement: false,
        teacherManagement: false,
        studentManagement: false,
        paymentManagement: false,
        systemSettings: false,
      },
      createdAt: admin.createdAt.toISOString(),
      lastLogin: null, // 로그인 기록은 별도 테이블에서 관리
      admin: admin.admin, // admin 정보도 포함
    }));

    console.log("응답 데이터:", formattedAdmins);

    return NextResponse.json({
      success: true,
      admins: formattedAdmins,
    });
  } catch (error) {
    console.error("관리자 목록 조회 오류:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "관리자 목록 조회 중 오류가 발생했습니다." 
      },
      { status: 500 }
    );
  }
} 
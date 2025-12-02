import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface UIDRegistration {
  uid: string;
  userType: "student" | "employee";
  name: string;
  email?: string;
  phone?: string;
  studentCode?: string; // 학생 인증 코드
  department?: string; // 직원 부서
  position?: string; // 직원 직책
}

export async function POST(request: NextRequest) {
  try {
    const body: UIDRegistration = await request.json();

    // 필수 필드 검증
    if (!body.uid || !body.userType || !body.name) {
      return NextResponse.json(
        { success: false, message: "필수 필드가 누락되었습니다." },
        { status: 400 },
      );
    }

    // UID 중복 검사
    const existingUser = await checkExistingUID(body.uid);
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "이미 등록된 UID입니다." },
        { status: 409 },
      );
    }

    // 사용자 정보 저장
    const userData = await saveUserData(body);

    // 태깅 시스템에 등록
    await registerUID(body.uid, body.userType, userData.id);

    return NextResponse.json({
      success: true,
      message: "UID가 성공적으로 등록되었습니다.",
      data: {
        uid: body.uid,
        userType: body.userType,
        name: body.name,
        userId: userData.id,
      },
    });
  } catch (error) {
    console.error("UID 등록 오류:", error);
    return NextResponse.json(
      { success: false, message: "UID 등록 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

async function checkExistingUID(uid: string): Promise<boolean> {
  // 실제로는 데이터베이스에서 조회
  const mockRegisteredUIDs = [
    "student_001",
    "student_002",
    "student_003",
    "employee_001",
    "employee_002",
    "employee_003",
  ];

  return mockRegisteredUIDs.includes(uid);
}

async function saveUserData(
  userData: UIDRegistration,
): Promise<{ id: string }> {
  // 실제로는 데이터베이스에 저장
  console.log("사용자 정보 저장:", userData);

  return {
    id: `user_${Date.now()}`,
  };
}

async function registerUID(
  uid: string,
  userType: string,
  userId: string,
): Promise<void> {
  // 태깅 시스템에 UID 등록
  console.log("태깅 시스템 등록:", { uid, userType, userId });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // 필터 조건 구성
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }

    // UID 디바이스 목록 조회
    const devices = await prisma.uIDDevice.findMany({
      where,
      include: {
        user: {
          include: {
            student: true,
            teacher: true,
            staff: true,
          },
        },
      },
      orderBy: {
        registeredAt: "desc",
      },
      take: limit,
      skip: offset,
    });

    // 총 개수 조회
    const totalCount = await prisma.uIDDevice.count({ where });

    return NextResponse.json({
      success: true,
      devices: devices.map((device) => ({
        id: device.id,
        uid: device.uid,
        deviceType: device.deviceType,
        registeredAt: device.registeredAt,
        userId: device.userId,
        userName: device.user.name,
        userRole: device.user.role,
        studentName: device.user.student?.name,
        teacherName: device.user.teacher?.name,
        staffName: device.user.staff?.name,
      })),
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    console.error("UID devices error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "UID 디바이스 조회 중 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// 직원 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const skip = (page - 1) * limit;

    // 검색 조건 구성
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { kanjiName: { contains: search, mode: "insensitive" } },
        { koreanName: { contains: search, mode: "insensitive" } },
        { englishName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { position: { contains: search, mode: "insensitive" } },
        { department: { contains: search, mode: "insensitive" } },
      ];
    }
    if (status) {
      where.status = status;
    }

    // 직원 목록 조회
    const staff = await prisma.staff.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            createdAt: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    // 전체 개수 조회
    const total = await prisma.staff.count({ where });

    const formattedStaff = staff.map((employee) => ({
      id: employee.id,
      userId: employee.userId,
      name: employee.name,
      kanjiName: employee.kanjiName,
      yomigana: employee.yomigana,
      koreanName: employee.koreanName,
      englishName: employee.englishName,
      phone: employee.phone,
      emergencyContact: employee.emergencyContact,
      emergencyRelation: employee.emergencyRelation,
      postalCode: employee.postalCode,
      address: employee.address,
      addressDetail: employee.addressDetail,
      birthDate: employee.birthDate,
      transportation: employee.transportation,
      bankName: employee.bankName,
      bankBranch: employee.bankBranch,
      accountType: employee.accountType,
      accountNumber: employee.accountNumber,
      accountHolder: employee.accountHolder,
      position: employee.position,
      department: employee.department,
      salary: employee.salary,
      status: employee.status,
      isActive: employee.isActive,
      email: employee.user.email,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      staff: formattedStaff,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("직원 목록 조회 오류:", error);
    return NextResponse.json(
      { success: false, error: "직원 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 직원 추가
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      kanjiName,
      yomigana,
      koreanName,
      englishName,
      email,
      phone,
      emergencyContact,
      emergencyRelation,
      postalCode,
      address,
      addressDetail,
      birthDate,
      transportation,
      bankName,
      bankBranch,
      accountType,
      accountNumber,
      accountHolder,
      position,
      department,
      salary,
      password,
    } = body;

    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "이미 존재하는 이메일입니다." },
        { status: 400 }
      );
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 12);

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        email,
        name: koreanName || name,
        password: hashedPassword,
        role: "STAFF",
      },
    });

    // 교통수단 데이터 처리 (경로를 출발/도착지점으로 변환)
    let processedTransportation = transportation;
    if (transportation && Array.isArray(transportation)) {
      processedTransportation = transportation.map((transport: any) => {
        // routes 배열이 없거나 빈 배열인 경우 기본값 설정
        if (!transport.routes || !Array.isArray(transport.routes) || transport.routes.length === 0) {
          return {
            ...transport,
            routes: [],
            departurePoint: "",
            arrivalPoint: "",
            route: ""
          };
        }
        
        const departurePoint = transport.routes[0];
        const arrivalPoint = transport.routes[transport.routes.length - 1];
        
        // 마지막 경로가 喜志駅가 아닌 경우 강제로 추가
        let finalArrivalPoint = arrivalPoint;
        if (arrivalPoint !== "喜志駅") {
          finalArrivalPoint = "喜志駅";
        }
        
        return {
          ...transport,
          departurePoint,
          arrivalPoint: finalArrivalPoint,
          route: transport.routes.join(" → ")
        };
      });
    }

    // 직원 프로필 생성
    const staff = await prisma.staff.create({
      data: {
        userId: user.id,
        name,
        kanjiName,
        yomigana,
        koreanName,
        englishName,
        phone,
        emergencyContact,
        emergencyRelation,
        postalCode,
        address,
        addressDetail,
        birthDate: birthDate ? new Date(birthDate) : null,
        transportation: processedTransportation,
        bankName,
        bankBranch,
        accountType,
        accountNumber,
        accountHolder,
        position,
        department,
        salary: parseInt(salary),
        status: "ACTIVE",
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "직원이 성공적으로 추가되었습니다.",
      staff: {
        id: staff.id,
        userId: staff.userId,
        name: staff.name,
        kanjiName: staff.kanjiName,
        yomigana: staff.yomigana,
        koreanName: staff.koreanName,
        englishName: staff.englishName,
        phone: staff.phone,
        emergencyContact: staff.emergencyContact,
        emergencyRelation: staff.emergencyRelation,
        postalCode: staff.postalCode,
        address: staff.address,
        addressDetail: staff.addressDetail,
        birthDate: staff.birthDate,
        transportation: staff.transportation,
        bankName: staff.bankName,
        bankBranch: staff.bankBranch,
        accountType: staff.accountType,
        accountNumber: staff.accountNumber,
        accountHolder: staff.accountHolder,
        position: staff.position,
        department: staff.department,
        salary: staff.salary,
        status: staff.status,
        isActive: staff.isActive,
        email: user.email,
        createdAt: staff.createdAt,
        updatedAt: staff.updatedAt,
      },
    });
  } catch (error) {
    console.error("직원 추가 오류:", error);
    return NextResponse.json(
      { success: false, error: "직원 추가 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 
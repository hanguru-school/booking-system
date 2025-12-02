import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// 선생님 목록 조회
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
        { subjects: { hasSome: [search] } },
      ];
    }
    if (status) {
      where.status = status;
    }

    // 선생님 목록 조회
    const teachers = await prisma.teacher.findMany({
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
    const total = await prisma.teacher.count({ where });

    const formattedTeachers = teachers.map((teacher) => ({
      id: teacher.id,
      userId: teacher.userId,
      name: teacher.name,
      kanjiName: teacher.kanjiName,
      yomigana: teacher.yomigana,
      koreanName: teacher.koreanName,
      englishName: teacher.englishName,
      phone: teacher.phone,
      emergencyContact: teacher.emergencyContact,
      emergencyRelation: teacher.emergencyRelation,
      postalCode: teacher.postalCode,
      address: teacher.address,
      addressDetail: teacher.addressDetail,
      birthDate: teacher.birthDate,
      transportation: teacher.transportation,
      bankName: teacher.bankName,
      bankBranch: teacher.bankBranch,
      accountType: teacher.accountType,
      accountNumber: teacher.accountNumber,
      accountHolder: teacher.accountHolder,
      subjects: teacher.subjects,
      hourlyRate: teacher.hourlyRate,
      colorCode: teacher.colorCode,
      availableDays: teacher.availableDays,
      availableTimeSlots: teacher.availableTimeSlots,
      status: teacher.status,
      isActive: teacher.isActive,
      hireDate: teacher.hireDate,
      email: teacher.user.email,
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      teachers: formattedTeachers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("선생님 목록 조회 오류:", error);
    return NextResponse.json(
      { success: false, error: "선생님 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 선생님 추가
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
      subjects,
      hourlyRate,
      colorCode,
      availableDays,
      availableTimeSlots,
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
        role: "TEACHER",
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

    // 선생님 프로필 생성
    const teacher = await prisma.teacher.create({
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
        subjects: subjects || [],
        hourlyRate: parseInt(hourlyRate) || 30000,
        colorCode: colorCode || "#3B82F6",
        availableDays: availableDays || [],
        availableTimeSlots: availableTimeSlots || [],
        status: "PENDING",
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "선생님이 성공적으로 추가되었습니다.",
      teacher: {
        id: teacher.id,
        userId: teacher.userId,
        name: teacher.name,
        kanjiName: teacher.kanjiName,
        yomigana: teacher.yomigana,
        koreanName: teacher.koreanName,
        englishName: teacher.englishName,
        phone: teacher.phone,
        emergencyContact: teacher.emergencyContact,
        emergencyRelation: teacher.emergencyRelation,
        postalCode: teacher.postalCode,
        address: teacher.address,
        addressDetail: teacher.addressDetail,
        birthDate: teacher.birthDate,
        transportation: teacher.transportation,
        bankName: teacher.bankName,
        bankBranch: teacher.bankBranch,
        accountType: teacher.accountType,
        accountNumber: teacher.accountNumber,
        accountHolder: teacher.accountHolder,
        subjects: teacher.subjects,
        hourlyRate: teacher.hourlyRate,
        colorCode: teacher.colorCode,
        availableDays: teacher.availableDays,
        availableTimeSlots: teacher.availableTimeSlots,
        status: teacher.status,
        isActive: teacher.isActive,
        email: user.email,
        createdAt: teacher.createdAt,
        updatedAt: teacher.updatedAt,
      },
    });
  } catch (error) {
    console.error("선생님 추가 오류:", error);
    return NextResponse.json(
      { success: false, error: "선생님 추가 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

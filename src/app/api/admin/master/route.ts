import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 마스터 정보 조회
export async function GET(request: NextRequest) {
  try {
    console.log("마스터 정보 조회 API 호출됨");
    
    // 첫 번째 관리자를 마스터로 간주
    const master = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      include: { admin: true },
      orderBy: { createdAt: "asc" }
    });

    if (!master) {
      return NextResponse.json(
        { success: false, error: "마스터 관리자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const masterInfo = {
      id: master.id,
      kanjiName: master.admin?.kanjiName || "",
      yomigana: master.admin?.yomigana || "",
      koreanName: master.admin?.koreanName || "",
      englishName: master.admin?.englishName || "",
      name: master.name,
      email: master.email,
      phone: master.admin?.phone || "010-0000-0000",
      emergencyContact: master.admin?.emergencyContact || "",
      emergencyRelation: master.admin?.emergencyRelation || "",
      postalCode: master.admin?.postalCode || "",
      address: master.admin?.address || "",
      addressDetail: master.admin?.addressDetail || "",
      birthDate: master.admin?.birthDate || "",
      transportation: master.admin?.transportation || [],
      bankName: master.admin?.bankName || "",
      bankBranch: master.admin?.bankBranch || "",
      accountType: master.admin?.accountType || "",
      accountNumber: master.admin?.accountNumber || "",
      accountHolder: master.admin?.accountHolder || "",
      twoFactorEnabled: false, // 2단계 인증은 별도 구현 필요
      permissions: master.admin?.permissions || {},
      isApproved: master.admin?.isApproved || false,
    };
    
    return NextResponse.json({ success: true, master: masterInfo });
  } catch (error) {
    console.error("마스터 정보 조회 오류:", error);
    return NextResponse.json(
      { success: false, error: "마스터 정보 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 마스터 정보 수정
export async function PUT(request: NextRequest) {
  try {
    console.log("마스터 정보 수정 API 호출됨");
    const body = await request.json();
    const { 
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
      accountHolder
    } = body;

    // 첫 번째 관리자를 마스터로 간주하고 업데이트
    const masterUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      orderBy: { createdAt: "asc" }
    });

    if (!masterUser) {
      return NextResponse.json(
        { success: false, error: "마스터 관리자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 이메일 변경 시 중복 확인 (자신 제외)
    if (email && email !== masterUser.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      if (existingUser) {
        return NextResponse.json(
          { success: false, error: "이미 존재하는 이메일입니다." },
          { status: 400 }
        );
      }
    }

    // 교통수단 데이터 처리 (경로를 출발/도착지점으로 변환)
    let processedTransportation = transportation;
    if (transportation && Array.isArray(transportation)) {
      processedTransportation = transportation.map((transport: any) => {
        if (transport.routes && Array.isArray(transport.routes) && transport.routes.length > 0) {
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
        }
        return transport;
      });
    }

    // User 테이블 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: masterUser.id },
      data: {
        ...(email && { email }),
        ...(koreanName && { name: koreanName }), // 한글 이름을 기본 이름으로 사용
      },
    });

    // Admin 테이블 업데이트
    const updatedAdmin = await prisma.admin.update({
      where: { userId: masterUser.id },
      data: {
        ...(kanjiName && { kanjiName }),
        ...(yomigana && { yomigana }),
        ...(koreanName && { koreanName }),
        ...(englishName && { englishName }),
        ...(phone && { phone }),
        ...(emergencyContact && { emergencyContact }),
        ...(emergencyRelation && { emergencyRelation }),
        ...(postalCode && { postalCode }),
        ...(address && { address }),
        ...(addressDetail && { addressDetail }),
        ...(birthDate && { birthDate: new Date(birthDate) }),
        ...(processedTransportation && { transportation: processedTransportation }),
        ...(bankName && { bankName }),
        ...(bankBranch && { bankBranch }),
        ...(accountType && { accountType }),
        ...(accountNumber && { accountNumber }),
        ...(accountHolder && { accountHolder }),
      },
    });

    console.log("마스터 정보 수정 완료:", updatedUser.id);
    
    return NextResponse.json({
      success: true,
      message: "마스터 정보가 성공적으로 수정되었습니다.",
      master: {
        id: updatedUser.id,
        kanjiName: updatedAdmin.kanjiName,
        yomigana: updatedAdmin.yomigana,
        koreanName: updatedAdmin.koreanName,
        englishName: updatedAdmin.englishName,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedAdmin.phone,
        emergencyContact: updatedAdmin.emergencyContact,
        emergencyRelation: updatedAdmin.emergencyRelation,
        postalCode: updatedAdmin.postalCode,
        address: updatedAdmin.address,
        addressDetail: updatedAdmin.addressDetail,
        birthDate: updatedAdmin.birthDate,
        transportation: updatedAdmin.transportation,
        bankName: updatedAdmin.bankName,
        bankBranch: updatedAdmin.bankBranch,
        accountType: updatedAdmin.accountType,
        accountNumber: updatedAdmin.accountNumber,
        accountHolder: updatedAdmin.accountHolder,
      },
    });
  } catch (error) {
    console.error("마스터 정보 수정 오류:", error);
    return NextResponse.json(
      { success: false, error: "마스터 정보 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 
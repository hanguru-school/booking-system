import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 직원 상세 정보 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const staff = await prisma.staff.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
          },
        },
        workLogs: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        payrolls: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!staff) {
      return NextResponse.json(
        { success: false, error: "직원을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
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
        accountNumber: staff.accountNumber,
        accountHolder: staff.accountHolder,
        position: staff.position,
        department: staff.department,
        salary: staff.salary,
        status: staff.status,
        isActive: staff.isActive,
        hireDate: staff.hireDate,
        email: staff.user.email,
        createdAt: staff.createdAt,
        updatedAt: staff.updatedAt,
        workLogs: staff.workLogs,
        payrolls: staff.payrolls,
      },
    });
  } catch (error) {
    console.error("직원 상세 정보 조회 오류:", error);
    return NextResponse.json(
      { success: false, error: "직원 상세 정보 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 직원 정보 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
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
      birthDate,
      transportation,
      bankName,
      accountNumber,
      accountHolder,
      position,
      department,
      salary,
      status,
      isActive,
    } = body;

    // 직원 정보 업데이트
    const updatedStaff = await prisma.staff.update({
      where: { id: params.id },
      data: {
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
        transportation,
        bankName,
        accountNumber,
        accountHolder,
        position,
        department,
        salary: salary ? parseInt(salary) : undefined,
        status,
        isActive,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "직원 정보가 성공적으로 수정되었습니다.",
      staff: {
        id: updatedStaff.id,
        userId: updatedStaff.userId,
        name: updatedStaff.name,
        kanjiName: updatedStaff.kanjiName,
        yomigana: updatedStaff.yomigana,
        koreanName: updatedStaff.koreanName,
        englishName: updatedStaff.englishName,
        phone: updatedStaff.phone,
        emergencyContact: updatedStaff.emergencyContact,
        emergencyRelation: updatedStaff.emergencyRelation,
        postalCode: updatedStaff.postalCode,
        address: updatedStaff.address,
        addressDetail: updatedStaff.addressDetail,
        birthDate: updatedStaff.birthDate,
        transportation: updatedStaff.transportation,
        bankName: updatedStaff.bankName,
        accountNumber: updatedStaff.accountNumber,
        accountHolder: updatedStaff.accountHolder,
        position: updatedStaff.position,
        department: updatedStaff.department,
        salary: updatedStaff.salary,
        status: updatedStaff.status,
        isActive: updatedStaff.isActive,
        email: updatedStaff.user.email,
        createdAt: updatedStaff.createdAt,
        updatedAt: updatedStaff.updatedAt,
      },
    });
  } catch (error) {
    console.error("직원 정보 수정 오류:", error);
    return NextResponse.json(
      { success: false, error: "직원 정보 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 직원 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 직원 정보 조회
    const staff = await prisma.staff.findUnique({
      where: { id: params.id },
      include: {
        workLogs: true,
        payrolls: true,
      },
    });

    if (!staff) {
      return NextResponse.json(
        { success: false, error: "직원을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 관련 데이터가 있는지 확인
    if (staff.workLogs.length > 0 || staff.payrolls.length > 0) {
      return NextResponse.json(
        { success: false, error: "관련된 근무 기록이나 급여 정보가 있어 삭제할 수 없습니다." },
        { status: 400 }
      );
    }

    // 직원과 사용자 정보 삭제
    await prisma.staff.delete({
      where: { id: params.id },
    });

    await prisma.user.delete({
      where: { id: staff.userId },
    });

    return NextResponse.json({
      success: true,
      message: "직원이 성공적으로 삭제되었습니다.",
    });
  } catch (error) {
    console.error("직원 삭제 오류:", error);
    return NextResponse.json(
      { success: false, error: "직원 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminId = params.id;

    // 관리자 존재 확인
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      include: { admin: true },
    });

    if (!admin) {
      return NextResponse.json(
        { 
          success: false, 
          error: "관리자를 찾을 수 없습니다." 
        },
        { status: 404 }
      );
    }

    // 관리자 프로필 삭제
    if (admin.admin) {
      await prisma.admin.delete({
        where: { id: admin.admin.id },
      });
    }

    // 사용자 계정 삭제
    await prisma.user.delete({
      where: { id: adminId },
    });

    return NextResponse.json({
      success: true,
      message: "관리자가 성공적으로 삭제되었습니다.",
    });
  } catch (error) {
    console.error("관리자 삭제 오류:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "관리자 삭제 중 오류가 발생했습니다." 
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminId = params.id;
    const body = await request.json();
    const { status } = body;

    // 관리자 존재 확인
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      include: { admin: true },
    });

    if (!admin || !admin.admin) {
      return NextResponse.json(
        { 
          success: false, 
          error: "관리자를 찾을 수 없습니다." 
        },
        { status: 404 }
      );
    }

    // 상태 업데이트
    await prisma.admin.update({
      where: { id: admin.admin.id },
      data: {
        isApproved: status === "ACTIVE",
      },
    });

    return NextResponse.json({
      success: true,
      message: "관리자 상태가 업데이트되었습니다.",
    });
  } catch (error) {
    console.error("관리자 상태 업데이트 오류:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "관리자 상태 업데이트 중 오류가 발생했습니다." 
      },
      { status: 500 }
    );
  }
} 
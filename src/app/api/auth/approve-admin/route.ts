import { NextRequest, NextResponse } from "next/server";

// 동적 import로 Prisma 로드
let prisma: any;

async function getPrisma() {
  if (!prisma) {
    const { prisma: PrismaClient } = await import("@/lib/prisma");
    prisma = PrismaClient;
  }
  return prisma;
}

export async function POST(request: NextRequest) {
  try {
    const { adminId, permissions, approvedBy } = await request.json();

    // 입력 검증
    if (!adminId || !approvedBy) {
      return NextResponse.json(
        { error: "관리자 ID와 승인자 정보는 필수입니다." },
        { status: 400 },
      );
    }

    // Prisma 클라이언트 가져오기
    const db = await getPrisma();

    // 승인자 확인 (마스터 관리자만 승인 가능)
    const approver = await db.user.findUnique({
      where: { email: approvedBy },
      include: { admin: true },
    });

    if (!approver || approver.role !== "ADMIN" || !approver.admin?.isApproved) {
      return NextResponse.json(
        { error: "승인 권한이 없습니다." },
        { status: 403 },
      );
    }

    // 관리자 계정 확인
    const adminUser = await db.user.findUnique({
      where: { id: adminId },
      include: { admin: true },
    });

    if (!adminUser || adminUser.role !== "ADMIN" || !adminUser.admin) {
      return NextResponse.json(
        { error: "해당 관리자 계정을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    if (adminUser.admin.isApproved) {
      return NextResponse.json(
        { error: "이미 승인된 관리자 계정입니다." },
        { status: 409 },
      );
    }

    // 관리자 승인 및 권한 부여
    const updatedAdmin = await db.admin.update({
      where: { userId: adminId },
      data: {
        isApproved: true,
        permissions: permissions || {},
      },
    });

    return NextResponse.json(
      {
        message: "관리자 계정이 승인되었습니다.",
        admin: updatedAdmin,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("관리자 승인 오류:", error);
    return NextResponse.json(
      { error: "관리자 승인 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

// 승인 대기 중인 관리자 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const approvedBy = searchParams.get("approvedBy");

    if (!approvedBy) {
      return NextResponse.json(
        { error: "승인자 정보가 필요합니다." },
        { status: 400 },
      );
    }

    // Prisma 클라이언트 가져오기
    const db = await getPrisma();

    // 승인자 확인
    const approver = await db.user.findUnique({
      where: { email: approvedBy },
      include: { admin: true },
    });

    if (!approver || approver.role !== "ADMIN" || !approver.admin?.isApproved) {
      return NextResponse.json(
        { error: "승인 권한이 없습니다." },
        { status: 403 },
      );
    }

    // 승인 대기 중인 관리자 목록 조회
    const pendingAdmins = await db.user.findMany({
      where: {
        role: "ADMIN",
        admin: {
          isApproved: false,
        },
      },
      include: {
        admin: true,
      },
    });

    return NextResponse.json(
      {
        pendingAdmins: pendingAdmins.map((admin: any) => ({
          id: admin.id,
          email: admin.email,
          name: admin.name,
          createdAt: admin.createdAt,
          admin: admin.admin,
        })),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("관리자 목록 조회 오류:", error);
    return NextResponse.json(
      { error: "관리자 목록 조회 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

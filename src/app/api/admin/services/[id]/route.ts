import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();
    const { name, description, duration, bufferTime, isActive, imageUrl } =
      body;

    const service = await prisma.service.update({
      where: { id: params.id },
      data: {
        name,
        description,
        duration,
        bufferTime,
        isActive,
        imageUrl,
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error("서비스 수정 실패:", error);
    return NextResponse.json(
      { error: "서비스 수정에 실패했습니다." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await prisma.service.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "서비스가 삭제되었습니다." });
  } catch (error) {
    console.error("서비스 삭제 실패:", error);
    return NextResponse.json(
      { error: "서비스 삭제에 실패했습니다." },
      { status: 500 },
    );
  }
}

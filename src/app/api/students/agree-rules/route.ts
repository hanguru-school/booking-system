import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, signatureData, agreements } = body;

    // 학생 찾기
    const student = await prisma.student.findUnique({
      where: { studentId },
    });

    if (!student) {
      return NextResponse.json(
        { error: "학생을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 규정 동의 업데이트
    const updatedStudent = await prisma.student.update({
      where: { studentId },
      data: {
        rulesAgreed: true,
        rulesAgreedAt: new Date(),
        signatureData,
        enrollmentStatus: "AGREED",
      },
    });

    return NextResponse.json({
      success: true,
      message: "규정 동의가 완료되었습니다.",
      student: updatedStudent,
    });
  } catch (error) {
    console.error("규정 동의 처리 오류:", error);
    return NextResponse.json(
      { error: "규정 동의 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}







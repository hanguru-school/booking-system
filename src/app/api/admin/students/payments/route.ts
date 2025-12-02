import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromCookies(request);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    // 학생 결제 정보 조회 (SystemSettings에서 가져오기)
    const paymentSetting = await prisma.systemSettings.findFirst({
      where: { key: studentId ? `student_payments_${studentId}` : "student_payments" },
    });

    let formattedPayments: any[] = [];

    if (paymentSetting?.value) {
      const payments = JSON.parse(paymentSetting.value as string);
      formattedPayments = Array.isArray(payments) ? payments : [];
    } else {
      // 결제 정보가 없으면 빈 배열 반환
      formattedPayments = [];
    }

    return NextResponse.json({
      success: true,
      payments: formattedPayments,
    });
  } catch (error) {
    console.error("학생 결제 정보 조회 오류:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}


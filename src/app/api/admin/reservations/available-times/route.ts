import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";

// GET: 특정 날짜의 예약된 시간 조회
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
    const date = searchParams.get("date");
    const teacherId = searchParams.get("teacherId");

    if (!date) {
      return NextResponse.json(
        { success: false, message: "날짜가 필요합니다." },
        { status: 400 }
      );
    }

    // 해당 날짜의 예약 조회
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const where: any = {
      date: {
        gte: startDate,
        lte: endDate,
      },
      status: {
        not: "CANCELLED",
      },
    };

    if (teacherId) {
      where.teacherId = teacherId;
    }

    const reservations = await prisma.reservation.findMany({
      where,
      select: {
        id: true,
        time: true,
        duration: true,
      },
    });

    // 예약된 시간 슬롯 계산 (5분 단위)
    const bookedSlots = new Set<string>();

    reservations.forEach((reservation) => {
      if (reservation.time) {
        const startTime = new Date(reservation.time);
        const duration = reservation.duration || 60;
        
        // 시작 시간부터 duration만큼 5분 단위로 표시
        for (let i = 0; i < duration; i += 5) {
          const slotTime = new Date(startTime);
          slotTime.setMinutes(slotTime.getMinutes() + i);
          const timeStr = `${String(slotTime.getHours()).padStart(2, "0")}:${String(slotTime.getMinutes()).padStart(2, "0")}`;
          bookedSlots.add(timeStr);
        }
      }
    });

    return NextResponse.json({
      success: true,
      bookedTimes: Array.from(bookedSlots),
    });
  } catch (error) {
    console.error("예약된 시간 조회 오류:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}




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

    // 학생 정보 조회
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, message: "학생 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 예약 정보 조회 (별도 쿼리)
    const reservations = await prisma.reservation.findMany({
      where: {
        studentId: student.id,
        status: "ATTENDED",
      },
      select: {
        id: true,
        duration: true,
      },
    });

    // 통계 계산
    const totalAttendance = reservations.length;
    const totalStudyTime = reservations.reduce((total, reservation) => {
      return total + (reservation.duration || 0);
    }, 0);

    // 평균 점수 계산 (예시)
    const averageScore = 85; // 실제로는 데이터베이스에서 계산

    // 생년월일 형식 변환
    let formattedBirthDate = "";
    if (student.birthDate) {
      const birthDate = new Date(student.birthDate);
      if (!isNaN(birthDate.getTime())) {
        formattedBirthDate = birthDate.toISOString().split('T')[0];
      }
    }

    const profileData = {
      studentId: student.id,
      name: student.name,
      email: student.user.email,
      phone: student.phone,
      address: student.address,
      birthDate: formattedBirthDate,
      level: student.level,
      points: student.points,
      totalAttendance,
      totalStudyTime,
      averageScore,
      joinDate: student.joinDate,
      avatar: student.avatar,
    };

    return NextResponse.json({
      success: true,
      student: profileData,
    });
  } catch (error) {
    console.error("학생 프로필 조회 오류:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = getSessionFromCookies(request);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, phone, address, birthDate } = body;

    // 학생 정보 업데이트
    const updatedStudent = await prisma.student.update({
      where: { userId: session.user.id },
      data: {
        name: name || undefined,
        phone: phone || undefined,
        address: address || undefined,
        birthDate: birthDate ? new Date(birthDate) : undefined,
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    // 사용자 이메일 업데이트
    if (email) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { email },
      });
    }

    // 생년월일 형식 변환
    let formattedBirthDate = "";
    if (updatedStudent.birthDate) {
      const birthDate = new Date(updatedStudent.birthDate);
      if (!isNaN(birthDate.getTime())) {
        formattedBirthDate = birthDate.toISOString().split('T')[0];
      }
    }

    return NextResponse.json({
      success: true,
      student: {
        studentId: updatedStudent.id,
        name: updatedStudent.name,
        email: email || updatedStudent.user.email,
        phone: updatedStudent.phone,
        address: updatedStudent.address,
        birthDate: formattedBirthDate,
        level: updatedStudent.level,
        points: updatedStudent.points,
        avatar: updatedStudent.avatar,
      },
    });
  } catch (error) {
    console.error("학생 프로필 업데이트 오류:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

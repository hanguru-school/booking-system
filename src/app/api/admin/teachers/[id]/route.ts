import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 선생님 정보 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("선생님 정보 조회 API 호출됨:", params.id);
    
    const teacher = await prisma.teacher.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true
          }
        },
        reservations: {
          include: {
            student: true
          },
          orderBy: { date: "desc" }
        },
        attendances: {
          orderBy: { date: "desc" }
        }
      }
    });
    
    if (!teacher) {
      return NextResponse.json(
        { success: false, error: "선생님을 찾을 수 없습니다." },
        { status: 404 }
      );
    }
    
    const formattedTeacher = {
      id: teacher.id,
      userId: teacher.userId,
      name: teacher.name,
      kanjiName: teacher.kanjiName,
      yomigana: teacher.yomigana,
      koreanName: teacher.koreanName,
      phone: teacher.phone,
      email: teacher.user.email,
      birthDate: teacher.birthDate,
      address: teacher.address,
      emergencyContact: teacher.emergencyContact,
      subjects: teacher.subjects,
      hourlyRate: teacher.hourlyRate,
      colorCode: teacher.colorCode,
      availableDays: teacher.availableDays,
      availableTimeSlots: teacher.availableTimeSlots,
      status: teacher.status,
      hireDate: teacher.hireDate,
      isActive: teacher.isActive,
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt,
      reservations: teacher.reservations.map(reservation => ({
        id: reservation.id,
        date: reservation.date,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
        lessonType: reservation.lessonType,
        status: reservation.status,
        location: reservation.location,
        student: {
          id: reservation.student.id,
          name: reservation.student.name
        }
      })),
      attendances: teacher.attendances.map(attendance => ({
        id: attendance.id,
        date: attendance.date,
        checkInTime: attendance.checkInTime,
        checkOutTime: attendance.checkOutTime,
        status: attendance.status
      }))
    };
    
    return NextResponse.json({
      success: true,
      teacher: formattedTeacher
    });
  } catch (error) {
    console.error("선생님 정보 조회 오류:", error);
    return NextResponse.json(
      { success: false, error: "선생님 정보 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 선생님 정보 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("선생님 정보 수정 API 호출됨:", params.id);
    const body = await request.json();
    const {
      name,
      kanjiName,
      yomigana,
      koreanName,
      email,
      phone,
      birthDate,
      address,
      emergencyContact,
      subjects,
      hourlyRate,
      colorCode,
      availableDays,
      availableTimeSlots,
      status,
      hireDate,
      isActive
    } = body;
    
    // 선생님 존재 확인
    const existingTeacher = await prisma.teacher.findUnique({
      where: { id: params.id },
      include: { user: true }
    });
    
    if (!existingTeacher) {
      return NextResponse.json(
        { success: false, error: "선생님을 찾을 수 없습니다." },
        { status: 404 }
      );
    }
    
    // 이메일 변경 시 중복 확인
    if (email && email !== existingTeacher.user.email) {
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
    
    // 사용자 정보 업데이트
    if (email || name) {
      await prisma.user.update({
        where: { id: existingTeacher.userId },
        data: {
          ...(email && { email }),
          ...(name && { name })
        }
      });
    }
    
    // 선생님 정보 업데이트
    const updatedTeacher = await prisma.teacher.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(kanjiName && { kanjiName }),
        ...(yomigana && { yomigana }),
        ...(koreanName && { koreanName }),
        ...(phone && { phone }),
        ...(birthDate && { birthDate: new Date(birthDate) }),
        ...(address && { address }),
        ...(emergencyContact && { emergencyContact }),
        ...(subjects && { subjects }),
        ...(hourlyRate && { hourlyRate }),
        ...(colorCode && { colorCode }),
        ...(availableDays && { availableDays }),
        ...(availableTimeSlots && { availableTimeSlots }),
        ...(status && { status }),
        ...(hireDate && { hireDate: new Date(hireDate) }),
        ...(typeof isActive === "boolean" && { isActive })
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true
          }
        }
      }
    });
    
    console.log("선생님 정보 수정 완료:", updatedTeacher.id);
    
    return NextResponse.json({
      success: true,
      message: "선생님 정보가 성공적으로 수정되었습니다.",
      teacher: {
        id: updatedTeacher.id,
        userId: updatedTeacher.userId,
        name: updatedTeacher.name,
        kanjiName: updatedTeacher.kanjiName,
        yomigana: updatedTeacher.yomigana,
        koreanName: updatedTeacher.koreanName,
        phone: updatedTeacher.phone,
        email: updatedTeacher.user.email,
        birthDate: updatedTeacher.birthDate,
        address: updatedTeacher.address,
        emergencyContact: updatedTeacher.emergencyContact,
        subjects: updatedTeacher.subjects,
        hourlyRate: updatedTeacher.hourlyRate,
        colorCode: updatedTeacher.colorCode,
        availableDays: updatedTeacher.availableDays,
        availableTimeSlots: updatedTeacher.availableTimeSlots,
        status: updatedTeacher.status,
        hireDate: updatedTeacher.hireDate,
        isActive: updatedTeacher.isActive,
        createdAt: updatedTeacher.createdAt,
        updatedAt: updatedTeacher.updatedAt
      }
    });
  } catch (error) {
    console.error("선생님 정보 수정 오류:", error);
    return NextResponse.json(
      { success: false, error: "선생님 정보 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 선생님 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("선생님 삭제 API 호출됨:", params.id);
    
    // 선생님 존재 확인
    const teacher = await prisma.teacher.findUnique({
      where: { id: params.id },
      include: { user: true }
    });
    
    if (!teacher) {
      return NextResponse.json(
        { success: false, error: "선생님을 찾을 수 없습니다." },
        { status: 404 }
      );
    }
    
    // 예약이 있는지 확인
    const reservationCount = await prisma.reservation.count({
      where: { teacherId: params.id }
    });
    
    if (reservationCount > 0) {
      return NextResponse.json(
        { success: false, error: "예약이 있는 선생님은 삭제할 수 없습니다." },
        { status: 400 }
      );
    }
    
    // 선생님과 사용자 삭제 (Cascade로 인해 관련 데이터도 함께 삭제됨)
    await prisma.user.delete({
      where: { id: teacher.userId }
    });
    
    console.log("선생님 삭제 완료:", params.id);
    
    return NextResponse.json({
      success: true,
      message: "선생님이 성공적으로 삭제되었습니다."
    });
  } catch (error) {
    console.error("선생님 삭제 오류:", error);
    return NextResponse.json(
      { success: false, error: "선생님 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 
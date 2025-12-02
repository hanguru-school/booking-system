import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth-utils";

// 학생 정보 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // 인증 확인
    const session = getSessionFromCookies(request);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    // Next.js 15에서는 params가 Promise일 수 있음
    const resolvedParams = await Promise.resolve(params);
    const studentId = resolvedParams.id;
    console.log("학생 정보 조회 API 호출됨:", studentId);
    
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true,
          }
        },
        reservations: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                kanjiName: true,
                phone: true,
              }
            }
          },
          orderBy: { date: "desc" }
        },
        reviews: {
          orderBy: { createdAt: "desc" }
        },
        agreements: {
          orderBy: { createdAt: "desc" }
        },
        parents: {
          include: {
            user: {
              select: {
                email: true,
                name: true,
              }
            }
          }
        },
        lessonNotes: {
          include: {
            teacher: {
              select: {
                name: true,
                kanjiName: true,
              }
            }
          },
          orderBy: { createdAt: "desc" },
          take: 10
        }
      }
    });
    
    if (!student) {
      return NextResponse.json(
        { success: false, error: "학생을 찾을 수 없습니다." },
        { status: 404 }
      );
    }
    
    // 결제 정보 조회
    const payments = await prisma.payment.findMany({
      where: {
        userId: student.userId
      },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    const formattedStudent = {
      // 기본 정보
      id: student.id,
      userId: student.userId,
      studentId: student.studentId,
      name: student.name,
      kanjiName: student.kanjiName,
      yomigana: student.yomigana,
      koreanName: student.koreanName,
      email: student.email || student.user.email,
      phone: student.phone,
      birthDate: student.birthDate,
      isMinor: student.isMinor,
      
      // 주소 정보
      address: student.address,
      addressDetail: student.addressDetail,
      postalCode: student.postalCode,
      
      // 긴급연락처 (성인용)
      emergencyContact: student.emergencyContact,
      emergencyRelation: student.emergencyRelation,
      emergencyContactNameKanji: student.emergencyContactNameKanji,
      emergencyContactNameYomigana: student.emergencyContactNameYomigana,
      emergencyContactPhone: student.emergencyContactPhone,
      emergencyContactRelation: student.emergencyContactRelation,
      emergencyContactEmail: student.emergencyContactEmail,
      
      // 보호자 정보 (미성년자용)
      parentNameKanji: student.parentNameKanji,
      parentNameYomigana: student.parentNameYomigana,
      parentPhone: student.parentPhone,
      parentRelation: student.parentRelation,
      
      // 학업 정보
      level: student.level,
      points: student.points,
      status: student.status,
      enrollmentStatus: student.enrollmentStatus,
      
      // 입회 관련
      rulesAgreed: student.rulesAgreed,
      rulesAgreedAt: student.rulesAgreedAt,
      isFirstLogin: student.isFirstLogin,
      signatureData: student.signatureData,
      agreementData: student.agreementData,
      
      // 날짜 정보
      registrationDate: student.registrationDate,
      joinDate: student.joinDate,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
      
      // 관련 데이터
      reservations: student.reservations.map(reservation => ({
        id: reservation.id,
        date: reservation.date,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
        duration: reservation.duration,
        lessonType: reservation.lessonType,
        status: reservation.status,
        location: reservation.location,
        price: reservation.price,
        notes: reservation.notes,
        teacher: reservation.teacher ? {
          id: reservation.teacher.id,
          name: reservation.teacher.kanjiName || reservation.teacher.name,
          phone: reservation.teacher.phone,
        } : null,
        lessonNotes: reservation.lessonNotes || []
      })),
      reviews: student.reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt
      })),
      agreements: student.agreements.map(agreement => ({
        id: agreement.id,
        agreementType: agreement.agreementType,
        isCompleted: agreement.isCompleted,
        completedAt: agreement.completedAt,
        createdAt: agreement.createdAt,
        signatureData: agreement.signatureData,
        agreementData: agreement.agreementData,
        agreedItems: agreement.agreedItems,
      })),
      parents: student.parents.map(parent => ({
        id: parent.id,
        name: parent.user?.name || '',
        email: parent.user?.email || '',
        relation: parent.relation,
      })),
      lessonNotes: student.lessonNotes.map(note => ({
        id: note.id,
        date: note.date,
        content: note.content,
        teacher: note.teacher ? {
          name: note.teacher.kanjiName || note.teacher.name,
        } : null,
        createdAt: note.createdAt
      })),
      payments: payments.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        description: payment.description,
        createdAt: payment.createdAt
      }))
    };
    
    return NextResponse.json({
      success: true,
      student: formattedStudent
    });
  } catch (error) {
    console.error("학생 정보 조회 오류:", error);
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json(
      { 
        success: false, 
        error: "학생 정보 조회 중 오류가 발생했습니다.",
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

// 학생 정보 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const studentId = resolvedParams.id;
    console.log("학생 정보 수정 API 호출됨:", studentId);
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
      level,
      status,
      // 긴급연락처 정보
      emergencyContactNameKanji,
      emergencyContactNameYomigana,
      emergencyContactPhone,
      emergencyContactRelation,
      emergencyContactEmail,
    } = body;
    
    // 학생 존재 확인
    const existingStudent = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true }
    });
    
    if (!existingStudent) {
      return NextResponse.json(
        { success: false, error: "학생을 찾을 수 없습니다." },
        { status: 404 }
      );
    }
    
    // 이메일 변경 시 중복 확인
    if (email && email !== existingStudent.user.email) {
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
        where: { id: existingStudent.userId },
        data: {
          ...(email && { email }),
          ...(name && { name })
        }
      });
    }
    
    // 학생 정보 업데이트
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        ...(name && { name }),
        ...(kanjiName && { kanjiName }),
        ...(yomigana && { yomigana }),
        ...(koreanName && { koreanName }),
        ...(phone !== undefined && { phone }),
        ...(birthDate && { birthDate: new Date(birthDate) }),
        ...(address !== undefined && { address }),
        ...(emergencyContact !== undefined && { emergencyContact }),
        ...(level && { level }),
        ...(status && { status }),
        // 긴급연락처 정보 (미성년자가 아닌 경우만)
        ...(emergencyContactNameKanji !== undefined && { emergencyContactNameKanji }),
        ...(emergencyContactNameYomigana !== undefined && { emergencyContactNameYomigana }),
        ...(emergencyContactPhone !== undefined && { emergencyContactPhone }),
        ...(emergencyContactRelation !== undefined && { emergencyContactRelation }),
        ...(emergencyContactEmail !== undefined && { emergencyContactEmail }),
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
    
    console.log("학생 정보 수정 완료:", updatedStudent.id);
    
    return NextResponse.json({
      success: true,
      message: "학생 정보가 성공적으로 수정되었습니다.",
      student: {
        id: updatedStudent.id,
        userId: updatedStudent.userId,
        name: updatedStudent.name,
        kanjiName: updatedStudent.kanjiName,
        yomigana: updatedStudent.yomigana,
        koreanName: updatedStudent.koreanName,
        phone: updatedStudent.phone,
        email: updatedStudent.user.email,
        birthDate: updatedStudent.birthDate,
        address: updatedStudent.address,
        emergencyContact: updatedStudent.emergencyContact,
        level: updatedStudent.level,
        points: updatedStudent.points,
        status: updatedStudent.status,
        registrationDate: updatedStudent.registrationDate,
        joinDate: updatedStudent.joinDate,
        createdAt: updatedStudent.createdAt,
        updatedAt: updatedStudent.updatedAt
      }
    });
  } catch (error) {
    console.error("학생 정보 수정 오류:", error);
    return NextResponse.json(
      { success: false, error: "학생 정보 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 학생 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const studentId = resolvedParams.id;
    console.log("학생 삭제 API 호출됨:", studentId);
    
    // 학생 존재 확인
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true }
    });
    
    if (!student) {
      return NextResponse.json(
        { success: false, error: "학생을 찾을 수 없습니다." },
        { status: 404 }
      );
    }
    
    // 예약이 있는지 확인
    const reservationCount = await prisma.reservation.count({
      where: { studentId: studentId }
    });
    
    if (reservationCount > 0) {
      return NextResponse.json(
        { success: false, error: "예약이 있는 학생은 삭제할 수 없습니다." },
        { status: 400 }
      );
    }
    
    // 학생과 사용자 삭제 (Cascade로 인해 관련 데이터도 함께 삭제됨)
    await prisma.user.delete({
      where: { id: student.userId }
    });
    
    console.log("학생 삭제 완료:", studentId);
    
    return NextResponse.json({
      success: true,
      message: "학생이 성공적으로 삭제되었습니다."
    });
  } catch (error) {
    console.error("학생 삭제 오류:", error);
    return NextResponse.json(
      { success: false, error: "학생 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 예약 정보 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("예약 정보 조회 API 호출됨:", params.id);
    
    const reservation = await prisma.reservation.findUnique({
      where: { id: params.id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            kanjiName: true,
            koreanName: true,
            level: true,
            phone: true,
            email: true
          }
        },
        teacher: {
          select: {
            id: true,
            name: true,
            kanjiName: true,
            koreanName: true,
            phone: true,
            email: true
          }
        },
        payments: {
          orderBy: { createdAt: "desc" }
        },
        reviews: {
          orderBy: { createdAt: "desc" }
        },
        lessonNotes: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                kanjiName: true,
              }
            }
          },
          orderBy: { createdAt: "desc" }
        }
      }
    });
    
    if (!reservation) {
      return NextResponse.json(
        { success: false, error: "예약을 찾을 수 없습니다." },
        { status: 404 }
      );
    }
    
    const formattedReservation = {
      id: reservation.id,
      studentId: reservation.studentId,
      teacherId: reservation.teacherId,
      lessonType: reservation.lessonType,
      date: reservation.date,
      startTime: reservation.startTime,
      endTime: reservation.endTime,
      duration: reservation.duration,
      status: reservation.status,
      location: reservation.location,
      notes: reservation.notes,
      price: reservation.price,
      createdAt: reservation.createdAt,
      updatedAt: reservation.updatedAt,
      student: reservation.student ? {
        id: reservation.student.id,
        name: reservation.student.name,
        kanjiName: reservation.student.kanjiName,
        koreanName: reservation.student.koreanName,
        level: reservation.student.level,
        phone: reservation.student.phone,
        email: reservation.student.email
      } : null,
      teacher: reservation.teacher ? {
        id: reservation.teacher.id,
        name: reservation.teacher.name,
        kanjiName: reservation.teacher.kanjiName,
        koreanName: reservation.teacher.koreanName,
        phone: reservation.teacher.phone,
        email: reservation.teacher.email
      } : null,
      payments: reservation.payments.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        createdAt: payment.createdAt
      })),
      reviews: reservation.reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt
      })),
      lessonNotes: reservation.lessonNotes.map(note => ({
        id: note.id,
        title: note.title,
        content: note.content,
        teacher: note.teacher ? {
          name: note.teacher.kanjiName || note.teacher.name,
        } : null,
        createdAt: note.createdAt
      }))
    };
    
    return NextResponse.json({
      success: true,
      reservation: formattedReservation
    });
  } catch (error) {
    console.error("예약 정보 조회 오류:", error);
    return NextResponse.json(
      { success: false, error: "예약 정보 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 예약 정보 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("예약 정보 수정 API 호출됨:", params.id);
    const body = await request.json();
    const {
      studentId,
      teacherId,
      lessonType,
      date,
      startTime,
      endTime,
      duration,
      status,
      location,
      notes,
      price
    } = body;
    
    // 예약 존재 확인
    const existingReservation = await prisma.reservation.findUnique({
      where: { id: params.id }
    });
    
    if (!existingReservation) {
      return NextResponse.json(
        { success: false, error: "예약을 찾을 수 없습니다." },
        { status: 404 }
      );
    }
    
    // 학생 존재 확인
    if (studentId) {
      const student = await prisma.student.findUnique({
        where: { id: studentId }
      });
      
      if (!student) {
        return NextResponse.json(
          { success: false, error: "학생을 찾을 수 없습니다." },
          { status: 400 }
        );
      }
    }
    
    // 선생님 존재 확인 (선택사항)
    if (teacherId) {
      const teacher = await prisma.teacher.findUnique({
        where: { id: teacherId }
      });
      
      if (!teacher) {
        return NextResponse.json(
          { success: false, error: "선생님을 찾을 수 없습니다." },
          { status: 400 }
        );
      }
    }
    
    // 시간 충돌 확인 (자신의 예약은 제외)
    if (teacherId && date && startTime && endTime) {
      const conflictingReservation = await prisma.reservation.findFirst({
        where: {
          id: { not: params.id },
          teacherId: teacherId,
          date: new Date(date),
          OR: [
            {
              AND: [
                { startTime: { lte: new Date(startTime) } },
                { endTime: { gt: new Date(startTime) } }
              ]
            },
            {
              AND: [
                { startTime: { lt: new Date(endTime) } },
                { endTime: { gte: new Date(endTime) } }
              ]
            }
          ]
        }
      });
      
      if (conflictingReservation) {
        return NextResponse.json(
          { success: false, error: "해당 시간에 이미 예약이 있습니다." },
          { status: 400 }
        );
      }
    }
    
    // 예약 정보 업데이트
    const updatedReservation = await prisma.reservation.update({
      where: { id: params.id },
      data: {
        ...(studentId && { studentId }),
        ...(teacherId && { teacherId }),
        ...(lessonType && { lessonType }),
        ...(date && { date: new Date(date) }),
        ...(startTime && { startTime: new Date(startTime) }),
        ...(endTime && { endTime: new Date(endTime) }),
        ...(duration && { duration }),
        ...(status && { status }),
        ...(location && { location }),
        ...(notes && { notes }),
        ...(price && { price })
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            kanjiName: true,
            koreanName: true,
            level: true
          }
        },
        teacher: {
          select: {
            id: true,
            name: true,
            kanjiName: true,
            koreanName: true
          }
        }
      }
    });
    
    console.log("예약 정보 수정 완료:", updatedReservation.id);
    
    return NextResponse.json({
      success: true,
      message: "예약 정보가 성공적으로 수정되었습니다.",
      reservation: {
        id: updatedReservation.id,
        studentId: updatedReservation.studentId,
        teacherId: updatedReservation.teacherId,
        lessonType: updatedReservation.lessonType,
        date: updatedReservation.date,
        startTime: updatedReservation.startTime,
        endTime: updatedReservation.endTime,
        duration: updatedReservation.duration,
        status: updatedReservation.status,
        location: updatedReservation.location,
        notes: updatedReservation.notes,
        price: updatedReservation.price,
        createdAt: updatedReservation.createdAt,
        updatedAt: updatedReservation.updatedAt,
        student: updatedReservation.student ? {
          id: updatedReservation.student.id,
          name: updatedReservation.student.name,
          kanjiName: updatedReservation.student.kanjiName,
          koreanName: updatedReservation.student.koreanName,
          level: updatedReservation.student.level
        } : null,
        teacher: updatedReservation.teacher ? {
          id: updatedReservation.teacher.id,
          name: updatedReservation.teacher.name,
          kanjiName: updatedReservation.teacher.kanjiName,
          koreanName: updatedReservation.teacher.koreanName
        } : null
      }
    });
  } catch (error) {
    console.error("예약 정보 수정 오류:", error);
    return NextResponse.json(
      { success: false, error: "예약 정보 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 예약 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("예약 삭제 API 호출됨:", params.id);
    
    // 예약 존재 확인
    const reservation = await prisma.reservation.findUnique({
      where: { id: params.id }
    });
    
    if (!reservation) {
      return NextResponse.json(
        { success: false, error: "예약을 찾을 수 없습니다." },
        { status: 404 }
      );
    }
    
    // 예약 삭제
    await prisma.reservation.delete({
      where: { id: params.id }
    });
    
    console.log("예약 삭제 완료:", params.id);
    
    return NextResponse.json({
      success: true,
      message: "예약이 성공적으로 삭제되었습니다."
    });
  } catch (error) {
    console.error("예약 삭제 오류:", error);
    return NextResponse.json(
      { success: false, error: "예약 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

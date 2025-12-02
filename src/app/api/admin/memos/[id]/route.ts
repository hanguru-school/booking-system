import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";

// GET: 메모 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = getSessionFromCookies(request);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const { id } = await Promise.resolve(params);
    const memoId = id;

    const memo = await prisma.studentMemo.findUnique({
      where: { id: memoId },
      include: {
        student: {
          select: {
            name: true,
            kanjiName: true,
            studentId: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!memo) {
      return NextResponse.json(
        { success: false, message: "메모를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // content에서 JSON 파싱
    let parsedContent: any;
    try {
      parsedContent = JSON.parse(memo.content);
    } catch {
      // 기존 형식 호환성
      parsedContent = { content: memo.content };
    }

    return NextResponse.json({
      success: true,
      memo: {
        id: memo.id,
        content: parsedContent.content || memo.content,
        memoType: parsedContent.memoType || "class",
        isPublic: parsedContent.isPublic || false,
        date: parsedContent.date,
        time: parsedContent.time,
        reservationId: memo.lessonId || parsedContent.reservationId,
        relatedTeacherId: parsedContent.relatedTeacherId,
        relatedStaffId: parsedContent.relatedStaffId,
        studentName: memo.student.kanjiName || memo.student.name,
        studentId: memo.student.studentId,
        authorName: memo.author?.name || '알 수 없음',
        createdAt: memo.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("메모 조회 오류:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// PUT: 메모 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = getSessionFromCookies(request);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const { id } = await Promise.resolve(params);
    const memoId = id;

    // 기존 메모 확인
    const existingMemo = await prisma.studentMemo.findUnique({
      where: { id: memoId },
    });

    if (!existingMemo) {
      return NextResponse.json(
        { success: false, message: "메모를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 권한 확인 (작성자 또는 관리자만 수정 가능)
    if (existingMemo.authorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "메모를 수정할 권한이 없습니다." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      date,
      time,
      reservationId,
      relatedTeacherId,
      relatedStaffId,
      content,
      memoType = "class",
      isPublic = false,
    } = body;

    if (!content || !date || !time) {
      return NextResponse.json(
        { success: false, message: "필수 항목을 모두 입력해주세요." },
        { status: 400 }
      );
    }

    // 예약 확인 (선택사항) - lessonId로 사용
    let studentId: string | null = existingMemo.studentId;
    if (reservationId) {
      const reservation = await prisma.reservation.findUnique({
        where: { id: reservationId },
        include: {
          student: true,
        },
      });

      if (reservation) {
        studentId = reservation.studentId;
      }
    }

    // studentId가 없으면 기존 studentId 유지
    if (!studentId) {
      studentId = existingMemo.studentId;
    }

    // 메모 업데이트
    // content에 메타데이터를 JSON으로 저장
    const memoData = {
      date,
      time,
      memoType,
      isPublic,
      reservationId: reservationId || null,
      relatedTeacherId: relatedTeacherId || null,
      relatedStaffId: relatedStaffId || null,
    };

    const updatedMemo = await prisma.studentMemo.update({
      where: { id: memoId },
      data: {
        studentId,
        lessonId: reservationId || null,
        content: JSON.stringify({ ...memoData, content }), // 메타데이터와 내용을 JSON으로 저장
      },
      include: {
        student: {
          select: {
            name: true,
            kanjiName: true,
          },
        },
      },
    });

    // content에서 JSON 파싱
    let parsedContent: any;
    try {
      parsedContent = JSON.parse(updatedMemo.content);
    } catch {
      // 기존 형식 호환성
      parsedContent = { content: updatedMemo.content };
    }

    return NextResponse.json({
      success: true,
      memo: {
        id: updatedMemo.id,
        content: parsedContent.content || updatedMemo.content,
        memoType: parsedContent.memoType || "class",
        isPublic: parsedContent.isPublic || false,
        date: parsedContent.date,
        time: parsedContent.time,
        studentName: updatedMemo.student.kanjiName || updatedMemo.student.name,
        createdAt: updatedMemo.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("메모 수정 오류:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// DELETE: 메모 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = getSessionFromCookies(request);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const { id } = await Promise.resolve(params);
    const memoId = id;

    // 기존 메모 확인
    const existingMemo = await prisma.studentMemo.findUnique({
      where: { id: memoId },
    });

    if (!existingMemo) {
      return NextResponse.json(
        { success: false, message: "메모를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 권한 확인 (작성자 또는 관리자만 삭제 가능)
    if (existingMemo.authorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "메모를 삭제할 권한이 없습니다." },
        { status: 403 }
      );
    }

    await prisma.studentMemo.delete({
      where: { id: memoId },
    });

    return NextResponse.json({
      success: true,
      message: "메모가 삭제되었습니다.",
    });
  } catch (error) {
    console.error("메모 삭제 오류:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}




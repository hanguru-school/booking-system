import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromCookies(request);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "인증이 필요합니다." },
        { status: 401 }
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
    let studentId: string | null = null;
    if (reservationId) {
      const reservation = await prisma.reservation.findUnique({
        where: { id: reservationId },
        include: {
          student: true,
        },
      });

      if (!reservation) {
        return NextResponse.json(
          { success: false, message: "예약을 찾을 수 없습니다." },
          { status: 404 }
        );
      }
      studentId = reservation.studentId;
    }

    // studentId가 없으면 더미 학생을 찾거나 생성 (스키마상 필수이므로)
    if (!studentId) {
      // 메모 유형에 따라 다르게 처리
      // 일단 첫 번째 학생을 사용하거나, 관리자용 더미 학생을 찾음
      const dummyStudent = await prisma.student.findFirst({
        orderBy: { createdAt: 'asc' },
      });
      if (!dummyStudent) {
        return NextResponse.json(
          { success: false, message: "학생 정보가 필요합니다." },
          { status: 400 }
        );
      }
      studentId = dummyStudent.id;
    }

    // 메모 생성
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

    const memo = await prisma.studentMemo.create({
      data: {
        studentId,
        lessonId: reservationId || null,
        content: JSON.stringify({ ...memoData, content }), // 메타데이터와 내용을 JSON으로 저장
        authorId: session.user.id,
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
        studentName: memo.student.kanjiName || memo.student.name,
        createdAt: memo.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("메모 생성 오류:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

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
    const studentId = searchParams.get("studentId");
    const reservationId = searchParams.get("reservationId");
    const date = searchParams.get("date"); // 날짜 필터

    const where: any = {};
    if (studentId) {
      where.studentId = studentId;
    }
    if (reservationId) {
      where.lessonId = reservationId; // lessonId로 사용
    }

    // 날짜 범위가 지정되지 않은 경우, 최근 3개월로 제한
    if (!date) {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      // 메모는 content에 JSON으로 날짜가 저장되어 있어서 쿼리 레벨에서 필터링하기 어려움
      // 대신 take로 제한
    }

    const memos = await prisma.studentMemo.findMany({
      where,
      include: {
        student: {
          select: {
            name: true,
            kanjiName: true,
            studentId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 1000, // 최대 1000개로 제한
    });

    // author 정보를 별도로 가져오기
    const authorIds = [...new Set(memos.map(m => m.authorId))];
    const authors = await prisma.user.findMany({
      where: {
        id: { in: authorIds },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const authorMap = new Map(authors.map(a => [a.id, a]));

    // 날짜 필터링 (클라이언트 측에서도 필터링하지만 서버에서도 필터링)
    let filteredMemos = memos;
    if (date) {
      filteredMemos = memos.filter((memo) => {
        try {
          const parsedContent = JSON.parse(memo.content);
          if (parsedContent.date) {
            const memoDate = new Date(parsedContent.date).toISOString().split('T')[0];
            return memoDate === date;
          }
          return false;
        } catch {
          return false;
        }
      });
    }

    return NextResponse.json({
      success: true,
      memos: filteredMemos.map((memo) => {
        // content에서 JSON 파싱
        let parsedContent: any;
        try {
          parsedContent = JSON.parse(memo.content);
        } catch {
          // 기존 형식 호환성
          parsedContent = { content: memo.content };
        }
        const author = authorMap.get(memo.authorId);

        return {
          id: memo.id,
          content: parsedContent.content || memo.content,
          memoType: parsedContent.memoType || "class",
          isPublic: parsedContent.isPublic || false,
          date: parsedContent.date,
          time: parsedContent.time,
          studentName: memo.student.kanjiName || memo.student.name,
          studentId: memo.student.studentId,
          reservationId: memo.lessonId || parsedContent.reservationId,
          relatedTeacherId: parsedContent.relatedTeacherId,
          relatedStaffId: parsedContent.relatedStaffId,
          authorName: author?.name || '알 수 없음',
          createdAt: memo.createdAt.toISOString(),
        };
      }),
    });
  } catch (error) {
    console.error("메모 목록 조회 오류:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}


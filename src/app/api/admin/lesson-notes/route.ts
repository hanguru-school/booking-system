import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const session = getSessionFromCookies(request);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const reservationId = searchParams.get('reservationId');
    const studentId = searchParams.get('studentId');

    let lessonNotes;

    if (reservationId) {
      // 예약 ID로 레슨노트 조회
      lessonNotes = await prisma.lessonNote.findMany({
        where: {
          reservationId: reservationId,
        },
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              kanjiName: true,
            }
          },
          student: {
            select: {
              id: true,
              name: true,
              kanjiName: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } else if (studentId) {
      // 학생 ID로 레슨노트 조회
      lessonNotes = await prisma.lessonNote.findMany({
        where: {
          studentId: studentId,
        },
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              kanjiName: true,
            }
          },
          student: {
            select: {
              id: true,
              name: true,
              kanjiName: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } else {
      return NextResponse.json(
        { error: "reservationId 또는 studentId가 필요합니다." },
        { status: 400 }
      );
    }

    const formattedNotes = lessonNotes.map(note => ({
      id: note.id,
      title: note.title,
      content: note.content,
      date: note.createdAt,
      teacher: note.teacher ? {
        name: note.teacher.kanjiName || note.teacher.name,
      } : null,
      reservationId: note.reservationId,
      createdAt: note.createdAt,
    }));

    return NextResponse.json({
      success: true,
      notes: formattedNotes
    });
  } catch (error) {
    console.error("레슨노트 조회 오류:", error);
    return NextResponse.json(
      { error: "레슨노트 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}




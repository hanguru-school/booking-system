import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const session = getSessionFromCookies(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    // 학생 정보 확인
    if (userRole !== "STUDENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 학생 정보 조회
    const student = await prisma.student.findUnique({
      where: { userId: userId },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // 학생의 레슨 노트 조회
    const lessonNotes = await prisma.lessonNote.findMany({
      where: {
        studentId: student.id,
      },
      include: {
        teacher: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 응답 데이터 형식 변환
    const notes = lessonNotes.map((note) => ({
      id: note.id,
      title: note.title,
      teacherName: note.teacher.name,
      date: note.createdAt.toISOString(),
      duration: "60분", // 기본값 설정
      description: note.content,
      audioUrl: note.audioUrl || undefined,
      score: undefined, // 스키마에 없으므로 undefined
    }));

    return NextResponse.json({ notes });
  } catch (error) {
    console.error("레슨 노트 조회 오류:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

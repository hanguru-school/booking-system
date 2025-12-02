import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    console.log("=== 학생 단어장 조회 API 시작 ===");

    // 1. 세션 확인
    const session = await getSessionFromCookies(request);
    if (!session?.user?.id) {
      console.log("세션 없음 - 401 반환");
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    // 2. 학생 정보 조회
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });

    if (!student) {
      console.log("학생 정보 없음 - 404 반환");
      return NextResponse.json(
        { error: "학생 정보를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 3. 레슨노트에서 단어 추출 (실제로는 더 복잡한 로직 필요)
    const lessonNotes = await prisma.lessonNote.findMany({
      where: { studentId: student.id },
      select: {
        id: true,
        content: true,
        createdAt: true,
      },
    });

    // 4. 단어 추출 및 정리 (실제로는 NLP 또는 수동 입력 필요)
    const vocabulary: Array<{
      id: string;
      word: string;
      meaning: string;
      partOfSpeech: string;
      example: string;
      pronunciation: string;
      dateAdded: string;
    }> = [];
    const wordSet = new Set();

    lessonNotes.forEach((note) => {
      // 간단한 단어 추출 로직 (실제로는 더 정교한 NLP 필요)
      const words =
        note.content.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g) || [];

      words.forEach((word) => {
        if (word.length >= 2 && !wordSet.has(word)) {
          wordSet.add(word);
          vocabulary.push({
            id: `vocab_${Date.now()}_${Math.random()}`,
            word: word,
            meaning: `의미: ${word}`, // 실제로는 사전 API 연동 필요
            partOfSpeech: "명사", // 실제로는 품사 분석 필요
            example: `예문: ${word}를 사용한 문장`, // 실제로는 예문 생성 필요
            pronunciation: `발음: ${word}`, // 실제로는 발음 정보 필요
            dateAdded: note.createdAt.toISOString(),
          });
        }
      });
    });

    // 5. 기본 단어 추가 (실제로는 데이터베이스에서 관리)
    const basicWords = [
      {
        id: "basic_1",
        word: "こんにちは",
        meaning: "안녕하세요",
        partOfSpeech: "인사말",
        example: "こんにちは、お元気ですか？",
        pronunciation: "konnichiwa",
        dateAdded: new Date().toISOString(),
      },
      {
        id: "basic_2",
        word: "ありがとう",
        meaning: "감사합니다",
        partOfSpeech: "인사말",
        example: "ありがとうございます。",
        pronunciation: "arigatou",
        dateAdded: new Date().toISOString(),
      },
      {
        id: "basic_3",
        word: "勉強",
        meaning: "공부",
        partOfSpeech: "명사",
        example: "日本語を勉強しています。",
        pronunciation: "benkyou",
        dateAdded: new Date().toISOString(),
      },
      {
        id: "basic_4",
        word: "行く",
        meaning: "가다",
        partOfSpeech: "동사",
        example: "学校に行きます。",
        pronunciation: "iku",
        dateAdded: new Date().toISOString(),
      },
      {
        id: "basic_5",
        word: "大きい",
        meaning: "크다",
        partOfSpeech: "형용사",
        example: "大きい家です。",
        pronunciation: "ookii",
        dateAdded: new Date().toISOString(),
      },
    ];

    // 기본 단어와 추출된 단어 합치기
    const allVocabulary = [...basicWords, ...vocabulary];

    console.log("단어장 조회 성공:", allVocabulary.length, "개 단어");

    // 6. 응답 반환
    return NextResponse.json({
      success: true,
      vocabulary: allVocabulary,
    });
  } catch (error) {
    console.error("=== 학생 단어장 조회 API 오류 ===");
    console.error(
      "오류 타입:",
      error instanceof Error ? error.constructor.name : typeof error,
    );
    console.error(
      "오류 메시지:",
      error instanceof Error ? error.message : String(error),
    );
    console.error(
      "오류 스택:",
      error instanceof Error ? error.stack : "No stack trace",
    );

    return NextResponse.json(
      { error: "단어장 조회 중 오류가 발생했습니다." },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

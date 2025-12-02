import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      studentId,
      userId,
      agreementType,
      studentData,
      agreementData,
      signatureData,
      pdfData,
      agreedItems,
    } = body;

    if (!studentId || !agreementType || !studentData || !agreementData) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 학생 존재 확인
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json(
        { error: '학생을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 동의서 저장
    const agreement = await prisma.agreement.create({
      data: {
        studentId,
        userId: userId || null,
        agreementType: agreementType as any,
        studentData,
        agreementData,
        signatureData: signatureData || null,
        pdfData: pdfData || null,
        agreedItems: agreedItems || [],
        isCompleted: true,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      agreement,
      message: '동의서가 성공적으로 저장되었습니다.',
    });
  } catch (error) {
    console.error('동의서 저장 오류:', error);
    return NextResponse.json(
      {
        error: '동의서 저장 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const agreementType = searchParams.get('agreementType');

    const where: any = {};
    if (studentId) where.studentId = studentId;
    if (agreementType) where.agreementType = agreementType as any;

    const agreements = await prisma.agreement.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            kanjiName: true,
            yomigana: true,
            studentId: true,
            email: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      agreements,
    });
  } catch (error) {
    console.error('동의서 조회 오류:', error);
    return NextResponse.json(
      {
        error: '동의서 조회 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}


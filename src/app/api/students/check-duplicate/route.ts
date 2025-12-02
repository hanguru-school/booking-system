import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, nameKanji, birthDate } = body;

    const errors: string[] = [];

    // 이메일 중복 확인
    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail }
      });

      if (existingUser) {
        errors.push('이미 등록된 이메일입니다.');
      }
    }

    // 이름 + 생년월일 중복 확인
    if (nameKanji && birthDate) {
      try {
        const birthDateObj = new Date(birthDate);
        
        const existingStudent = await prisma.student.findFirst({
          where: {
            kanjiName: nameKanji.trim(),
            birthDate: {
              equals: birthDateObj
            }
          }
        });

        if (existingStudent) {
          errors.push('이미 등록된 학생입니다. (이름과 생년월일이 동일)');
        }
      } catch (dateError) {
        console.error('생년월일 파싱 오류:', dateError);
      }
    }

    return NextResponse.json({
      success: true,
      isDuplicate: errors.length > 0,
      errors: errors
    });
  } catch (error) {
    console.error('중복 체크 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '중복 체크 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}




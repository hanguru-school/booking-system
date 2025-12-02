import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function isConnectionError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes('P1001') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('getaddrinfo ENOTFOUND'))
  );
}

function generateOfflineStudentId(now: Date): string {
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const random = crypto.randomInt(0, 99).toString().padStart(2, '0');
  const millis = now.getMilliseconds().toString().padStart(3, '0');
  return `${year}${month}${day}${random}${millis.substring(0, 2)}`;
}

export async function POST(request: NextRequest) {
  try {
    const now = new Date();
    
    // YYMMDD 형식으로 날짜 생성
    const year = now.getFullYear().toString().slice(-2); // 마지막 2자리
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hour = now.getHours().toString().padStart(2, '0');
    
    const datePrefix = `${year}${month}${day}`;
    
    // 해당 날짜의 마지막 순번 조회
    const lastStudent = await prisma.student.findFirst({
      where: {
        studentId: {
          startsWith: datePrefix
        }
      },
      orderBy: {
        studentId: 'desc'
      }
    });
    
    let sequenceNumber = 1;
    if (lastStudent && lastStudent.studentId) {
      // 마지막 학번에서 순번 부분 추출 (8-9번째 자리)
      const lastSequence = parseInt(lastStudent.studentId.substring(6, 8));
      sequenceNumber = lastSequence + 1;
    }
    
    // 순번을 2자리로 포맷
    const sequenceStr = sequenceNumber.toString().padStart(2, '0');
    
    // 최종 학번 생성: YYMMDDXXHH
    const studentId = `${datePrefix}${sequenceStr}${hour}`;
    
    // 학번 중복 확인
    const existingStudent = await prisma.student.findUnique({
      where: {
        studentId: studentId
      }
    });
    
    if (existingStudent) {
      // 중복이면 순번을 증가시켜 다시 시도
      const newSequenceStr = (sequenceNumber + 1).toString().padStart(2, '0');
      const newStudentId = `${datePrefix}${newSequenceStr}${hour}`;
      
      return NextResponse.json({
        success: true,
        studentId: newStudentId,
        generatedAt: now.toISOString()
      });
    }
    
    return NextResponse.json({
      success: true,
      studentId: studentId,
      generatedAt: now.toISOString()
    });
    
  } catch (error) {
    if (isConnectionError(error)) {
      const now = new Date();
      const fallbackId = generateOfflineStudentId(now);
      return NextResponse.json({
        success: true,
        studentId: fallbackId,
        generatedAt: now.toISOString(),
        offline: true
      });
    }

    console.error('학번 생성 오류:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '학번 생성에 실패했습니다.' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

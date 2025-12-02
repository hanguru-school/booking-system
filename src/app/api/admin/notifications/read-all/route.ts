import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 모든 알림 읽음 처리
export async function PUT(request: NextRequest) {
  try {
    await prisma.adminNotification.updateMany({
      where: { status: 'UNREAD' },
      data: { status: 'READ' },
    });

    return NextResponse.json({
      success: true,
      message: '모든 알림이 읽음으로 표시되었습니다.',
    });
  } catch (error) {
    console.error('알림 일괄 업데이트 오류:', error);
    return NextResponse.json(
      { success: false, error: '알림을 업데이트할 수 없습니다.' },
      { status: 500 }
    );
  }
}




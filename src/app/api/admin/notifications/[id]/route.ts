import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 알림 읽음 처리
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { read } = body;

    const notification = await prisma.adminNotification.update({
      where: { id },
      data: {
        status: read ? 'READ' : 'UNREAD',
      },
    });

    return NextResponse.json({
      success: true,
      notification: {
        id: notification.id,
        read: notification.status === 'READ',
      },
    });
  } catch (error) {
    console.error('알림 업데이트 오류:', error);
    return NextResponse.json(
      { success: false, error: '알림을 업데이트할 수 없습니다.' },
      { status: 500 }
    );
  }
}




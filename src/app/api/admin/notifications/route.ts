import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 알림 목록 가져오기
export async function GET(request: NextRequest) {
  try {
    const notifications = await prisma.adminNotification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50, // 최근 50개만
    });

    const formattedNotifications = notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      time: n.createdAt.toISOString(),
      read: n.status === 'READ',
      priority: (n.data as any)?.priority || 'medium',
      data: n.data,
    }));

    return NextResponse.json({
      success: true,
      notifications: formattedNotifications,
    });
  } catch (error) {
    console.error('알림 가져오기 오류:', error);
    return NextResponse.json(
      { success: false, error: '알림을 가져올 수 없습니다.' },
      { status: 500 }
    );
  }
}

// 새 알림 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, title, message, priority = 'medium', data } = body;

    if (!type || !title || !message) {
      return NextResponse.json(
        { success: false, error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const notification = await prisma.adminNotification.create({
      data: {
        type,
        title,
        message,
        status: 'UNREAD',
        data: {
          ...data,
          priority,
        },
      },
    });

    return NextResponse.json({
      success: true,
      notification: {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        time: notification.createdAt.toISOString(),
        read: false,
        priority,
        data: notification.data,
      },
    });
  } catch (error) {
    console.error('알림 생성 오류:', error);
    return NextResponse.json(
      { success: false, error: '알림을 생성할 수 없습니다.' },
      { status: 500 }
    );
  }
}




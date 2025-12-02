import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, html, text } = body;

    if (!to || !subject || (!html && !text)) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 이메일 설정 (환경 변수에서 가져오기)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
      },
    });

    // 이메일 발송
    const info = await transporter.sendMail({
      from: {
        name: '韓国語教室malmoi',
        address: process.env.EMAIL_FROM || process.env.SMTP_USER || 'office@hanguru.school',
      },
      to: to,
      subject: subject,
      html: html,
      text: text || html.replace(/<[^>]*>/g, ''), // HTML이 있으면 텍스트로 변환
    });

    console.log('이메일 발송 성공:', info.messageId);

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      message: '이메일이 성공적으로 발송되었습니다.',
    });
  } catch (error) {
    console.error('이메일 발송 오류:', error);
    return NextResponse.json(
      { 
        error: '이메일 발송 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}




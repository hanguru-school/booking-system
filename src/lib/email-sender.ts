// 서버 사이드에서 직접 이메일을 전송하는 함수
import nodemailer from 'nodemailer';

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmailDirectly(data: EmailData) {
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
    to: data.to,
    subject: data.subject,
    html: data.html,
    text: data.text || data.html.replace(/<[^>]*>/g, ''), // HTML이 있으면 텍스트로 변환
  });

  console.log('이메일 발송 성공:', info.messageId);
  return info;
}



import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Next.js 15에서 params가 Promise일 수 있음
    const params = await Promise.resolve(context.params);
    const studentId = params.id;
    
    console.log("=== 패스워드 재설정 API 호출 ===");
    console.log("학생 ID:", studentId);
    
    const session = getSessionFromCookies(request);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: "학생을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (!student.user) {
      return NextResponse.json(
        { success: false, error: "학생 계정이 없습니다." },
        { status: 404 }
      );
    }

    // 임시 패스워드 생성 (8자리 영문+숫자)
    const temporaryPassword = crypto.randomBytes(4).toString('hex').toUpperCase();
    
    // 패스워드 해시화
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // 사용자 패스워드 업데이트
    await prisma.user.update({
      where: { id: student.user.id },
      data: {
        password: hashedPassword,
        isFirstLogin: true, // 로그인 후 패스워드 변경 필수 (isFirstLogin을 사용)
      },
    });

    // 이메일 전송
    const email = student.user.email || student.email;
    let emailSent = false;
    let emailError: string | null = null;
    
    if (email) {
      try {
        // 이메일 전송 API 호출
        // 서버 사이드에서는 절대 URL 사용
        const origin = request.headers.get('origin') || 
                      request.headers.get('host') || 
                      'localhost:3000';
        const protocol = request.headers.get('x-forwarded-proto') || 
                       (origin.includes('localhost') ? 'http' : 'https');
        const baseUrl = `${protocol}://${origin}`;
        
        const { getEmailSignature, getEmailSignaturePlain } = await import('@/lib/email-signature');
        
        const loginUrl = `${baseUrl}/auth/login`;
        const emailHtml = `
          <div style="font-family: 'Noto Sans JP', 'Hiragino Sans', 'Meiryo', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937;">
            <h2 style="color: #2563eb; font-size: 24px; margin-bottom: 20px; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
              仮パスワードのお知らせ
            </h2>
            <p style="font-size: 16px; line-height: 1.8; margin-bottom: 20px;">
              こんにちは、${student.name || '学生'}様。
            </p>
            <p style="font-size: 16px; line-height: 1.8; margin-bottom: 30px;">
              管理者がリクエストした仮パスワードが発行されました。
            </p>
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 10px; margin: 30px 0; text-align: center; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: rgba(255, 255, 255, 0.9); font-weight: 500;">
                仮パスワード
              </p>
              <p style="margin: 0; font-size: 28px; font-weight: bold; color: #ffffff; letter-spacing: 4px; font-family: 'Courier New', monospace;">
                ${temporaryPassword}
              </p>
            </div>
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 30px 0; border-radius: 5px;">
              <p style="margin: 0; font-size: 15px; color: #92400e; font-weight: 500;">
                ⚠️ ログイン後、必ずパスワードを変更してください。
              </p>
            </div>
            <div style="margin: 30px 0; text-align: center;">
              <a href="${loginUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                ログインページへ
              </a>
            </div>
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px; line-height: 1.6;">
              このメールは自動送信されています。心当たりがない場合は、このメールを無視してください。
            </p>
            ${getEmailSignature()}
          </div>
        `;
        
        const emailText = `
仮パス워ードのお知らせ

こんにちは、${student.name || '学生'}様。

管理者がリクエストした仮パスワードが発行されました。

仮パスワード: ${temporaryPassword}

⚠️ ログイン後、必ずパスワードを変更してください。

ログインページ: ${loginUrl}

${getEmailSignaturePlain()}
        `.trim();
        
        // 서버 사이드에서 직접 이메일 전송 함수 호출 (fetch 대신)
        try {
          const { sendEmailDirectly } = await import('@/lib/email-sender');
          await sendEmailDirectly({
            to: email,
            subject: '【MalMoi韓国語教室】仮パスワードのお知らせ',
            html: emailHtml,
            text: emailText,
          });
          emailSent = true;
          console.log('✅ 이메일 전송 성공 (직접 호출)');
        } catch (directEmailError) {
          // 직접 호출 실패 시 fetch로 재시도
          console.error('❌ 직접 이메일 전송 실패, fetch로 재시도:', directEmailError);
          
          try {
            const emailResponse = await fetch(`${baseUrl}/api/email/send`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                to: email,
                subject: '【MalMoi韓国語教室】仮パスワードのお知らせ',
                html: emailHtml,
                text: emailText,
              }),
            });

            if (!emailResponse.ok) {
              const errorData = await emailResponse.json().catch(() => ({}));
              emailError = errorData.error || `이메일 전송 실패 (${emailResponse.status})`;
              console.error('❌ 이메일 전송 API 오류:', emailError, {
                status: emailResponse.status,
                statusText: emailResponse.statusText,
              });
            } else {
              emailSent = true;
              const result = await emailResponse.json();
              console.log('✅ 이메일 전송 성공 (fetch):', result.messageId || result);
            }
          } catch (fetchError) {
            emailError = fetchError instanceof Error ? fetchError.message : '이메일 전송 중 알 수 없는 오류 발생';
            console.error('❌ 이메일 전송 fetch 오류:', emailError);
          }
        }
      } catch (emailError) {
        const errorMessage = emailError instanceof Error ? emailError.message : '이메일 전송 중 알 수 없는 오류 발생';
        emailError = errorMessage;
        console.error('❌ 이메일 전송 오류:', errorMessage);
      }
    } else {
      emailError = '학생 이메일이 등록되지 않았습니다.';
      console.warn('이메일 전송 불가: 학생 이메일 없음', { studentId: student.id });
    }

    return NextResponse.json({
      success: true,
      message: emailSent 
        ? "임시 패스워드가 이메일로 전송되었습니다."
        : emailError 
          ? `패스워드는 재설정되었지만 이메일 전송에 실패했습니다: ${emailError}`
          : "임시 패스워드가 재설정되었습니다.",
      temporaryPassword, // 개발/테스트용으로 임시 패스워드 반환
      emailSent,
      emailError: emailError || undefined,
    });
  } catch (error) {
    console.error("패스워드 재설정 오류:", error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    console.error("오류 상세:", {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage || "서버 오류가 발생했습니다.",
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}


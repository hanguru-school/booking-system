// 이메일 발송 유틸리티 함수

interface WelcomeEmailData {
  email: string;
  studentId: string;
  initialPassword: string;
  nameKanji: string;
  nameYomigana: string;
  rulesAgreement: any;
  enrollmentData: any;
}

interface EmergencyContactEmailData {
  emergencyContactEmail: string;
  emergencyContactNameKanji: string;
  emergencyContactNameYomigana: string;
  emergencyContactRelation: string;
  studentNameKanji: string;
  studentNameYomigana: string;
  studentEmail: string;
  studentPhone: string;
}

export async function sendWelcomeEmail(data: WelcomeEmailData) {
  // 실제 이메일 발송 로직은 여기에 구현
  // 예: Nodemailer, SendGrid, AWS SES 등을 사용
  
  console.log('=== 환영 이메일 발송 ===');
  console.log('수신자:', data.email);
  console.log('학번:', data.studentId);
  console.log('초기 비밀번호:', data.initialPassword);
  console.log('이름 (한자):', data.nameKanji);
  console.log('이름 (요미가나):', data.nameYomigana);
  console.log('규정 동의:', data.rulesAgreement ? '완료' : '미완료');
  console.log('=======================');

  // 실제 구현에서는 다음과 같은 내용을 포함한 이메일을 발송:
  // 1. 학생 정보 (학번 포함)
  // 2. 초기 비밀번호 (핸드폰 뒤 4자리)
  // 3. 첫 로그인 시 패스워드 변경 안내
  // 4. 개인정보 입력 안내
  // 5. 규정 동의서 PDF 첨부
  // 6. 입회 동의서 PDF 첨부
  
  // 임시로 성공 반환
  return Promise.resolve();
}

export async function sendEmergencyContactNotification(data: EmergencyContactEmailData) {
  try {
    const { getEmailSignature, getEmailSignaturePlain } = await import('@/lib/email-signature');
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const emailContent = `
${data.emergencyContactNameKanji}様

${data.studentNameKanji}（${data.studentNameYomigana}）様が、緊急時連絡先としてMalMoi韓国語教室にご登録されました。

■ 登録された情報
- 学生名: ${data.studentNameKanji}（${data.studentNameYomigana}）
- 学生連絡先: ${data.studentPhone}
- 学生メール: ${data.studentEmail}
- ご本人様との関係: ${data.emergencyContactRelation}

■ 緊急時連絡について
緊急時には、教室からご連絡させていただく場合がございます。
この場合、学生の安全に関わる重要な事項についてご協力をお願いする場合がございます。

■ 個人情報の保護
本メールは、学生が登録時に提供した情報に基づいて送信されました。
個人情報は関連法令に従って保護され、緊急時連絡の目的でのみ使用されます。

ご不明な点がございましたら、いつでも教室までご連絡ください。

${getEmailSignaturePlain()}
    `.trim();

    const htmlContent = `
      <div style="font-family: 'Noto Sans JP', 'Hiragino Sans', 'Meiryo', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937; line-height: 1.8;">
        <h2 style="color: #2563eb; font-size: 24px; margin-bottom: 20px; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
          緊急時連絡先登録のお知らせ
        </h2>
        <p style="font-size: 16px; margin-bottom: 20px;">
          ${data.emergencyContactNameKanji}様
        </p>
        <p style="font-size: 16px; margin-bottom: 30px;">
          ${data.studentNameKanji}（${data.studentNameYomigana}）様が、緊急時連絡先として<strong>MalMoi韓国語教室</strong>にご登録されました。
        </p>
        
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 30px 0;">
          <h3 style="color: #2563eb; margin-top: 0; margin-bottom: 15px; font-size: 18px;">■ 登録された情報</h3>
          <ul style="margin: 0; padding-left: 20px; line-height: 2;">
            <li><strong>学生名:</strong> ${data.studentNameKanji}（${data.studentNameYomigana}）</li>
            <li><strong>学生連絡先:</strong> ${data.studentPhone}</li>
            <li><strong>学生メール:</strong> ${data.studentEmail}</li>
            <li><strong>ご本人様との関係:</strong> ${data.emergencyContactRelation}</li>
          </ul>
        </div>
        
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 30px 0; border-radius: 5px;">
          <h3 style="color: #92400e; margin-top: 0; margin-bottom: 10px; font-size: 16px;">■ 緊急時連絡について</h3>
          <p style="margin: 0; color: #92400e; font-size: 15px;">
            緊急時には、教室からご連絡させていただく場合がございます。この場合、学生の安全に関わる重要な事項についてご協力をお願いする場合がございます。
          </p>
        </div>
        
        <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin: 30px 0; border-radius: 5px;">
          <h3 style="color: #1e40af; margin-top: 0; margin-bottom: 10px; font-size: 16px;">■ 個人情報の保護</h3>
          <p style="margin: 0; color: #1e40af; font-size: 15px;">
            本メールは、学生が登録時に提供した情報に基づいて送信されました。個人情報は関連法令に従って保護され、緊急時連絡の目的でのみ使用されます。
          </p>
        </div>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${appUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
            教室ホームページへ
          </a>
        </div>
        
        <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
          ご不明な点がございましたら、いつでも教室までご連絡ください。
        </p>
        
        ${getEmailSignature()}
      </div>
    `;

    // 이메일 발송 API 호출
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: data.emergencyContactEmail,
        subject: `【MalMoi韓国語教室】緊急時連絡先登録のお知らせ`,
        html: htmlContent,
        text: emailContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '이메일 발송 실패');
    }

    const result = await response.json();
    console.log('긴급연락처 알림 이메일 발송 성공:', result.messageId);
    return result;
  } catch (error) {
    console.error('긴급연락처 알림 이메일 발송 오류:', error);
    throw error;
  }
}

// PDF 생성 함수 (규정 동의서, 입회 동의서)
export async function generatePDFs(studentData: any, rulesAgreement: any) {
  // 실제 PDF 생성 로직은 여기에 구현
  // 예: Puppeteer, jsPDF 등을 사용
  
  console.log('=== PDF 생성 ===');
  console.log('학생 데이터:', studentData);
  console.log('규정 동의 데이터:', rulesAgreement);
  console.log('===============');
  
  // 임시로 성공 반환
  return Promise.resolve({
    rulesAgreementPDF: 'rules-agreement.pdf',
    enrollmentAgreementPDF: 'enrollment-agreement.pdf'
  });
}

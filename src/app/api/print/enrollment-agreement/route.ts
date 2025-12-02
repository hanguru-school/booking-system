import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  let browser;
  try {
    const { student, agreementData, signatureData } = await request.json();

    if (!student) {
      return NextResponse.json({ error: '학생 정보가 필요합니다.' }, { status: 400 });
    }

    // HTML 이스케이프 헬퍼 함수
    const escapeHtml = (text: string | null | undefined): string => {
      if (!text) return '';
      return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    // 학생 정보 이스케이프
    const safeNameKanji = escapeHtml(student.nameKanji);
    const safeNameYomigana = escapeHtml(student.nameYomigana);
    const safeBirthDate = escapeHtml(student.birthDate);
    const safeStudentId = escapeHtml(student.studentId);
    const safePhone = escapeHtml(student.phone);
    const safeEmail = escapeHtml(student.email);
    const safeEmergencyName = escapeHtml(student.emergencyContactName);
    const safeEmergencyYomigana = escapeHtml(student.emergencyContactYomigana);
    const safeEmergencyRelation = escapeHtml(student.emergencyContactRelation);
    const safeEmergencyPhone = escapeHtml(student.emergencyContactPhone);

    // HTML 콘텐츠 생성
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MalMoi韓国語教室 入会同意書</title>
        <style>
          @page {
            size: A4;
            margin: 6mm;
          }
          
          body {
            font-family: 'Noto Sans JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', 'MS PGothic', 'MS Gothic', sans-serif;
            font-size: 8pt;
            line-height: 1.15;
            color: #000;
            margin: 0;
            padding: 0;
            width: 90.91%;
            transform: scale(1.1);
            transform-origin: top left;
          }
          
          .header {
            text-align: center;
            margin-bottom: 2mm;
          }
          
          .header h1 {
            font-size: 9pt;
            margin-bottom: 0.5mm;
          }
          
          .header h2 {
            font-size: 16pt;
            margin-bottom: 2mm;
          }
          
          .header p {
            font-size: 7.5pt;
            line-height: 1.25;
            margin-bottom: 1mm;
          }
          
          .rule-section {
            page-break-inside: avoid;
            break-inside: avoid;
            page-break-before: auto;
            page-break-after: auto;
            orphans: 3;
            widows: 3;
            margin-bottom: 2mm;
          }
          
          .rule-section h3 {
            font-size: 8.5pt;
            font-weight: bold;
            margin-bottom: 1mm;
          }
          
          .rule-section p {
            font-size: 7.5pt;
            line-height: 1.25;
            margin-bottom: 0.5mm;
          }
          
          .agreement-statement {
            margin-bottom: 2mm;
            text-align: justify;
            font-size: 7.5pt;
            line-height: 1.25;
          }
          
          .agreement-statement p {
            font-size: 7.5pt;
            line-height: 1.25;
            margin-bottom: 0.5mm;
          }
          
          .form-row {
            display: flex;
            align-items: center;
            margin-bottom: 2px;
            font-size: 7.5pt;
          }
          
          .form-row label {
            font-weight: 500;
            margin-right: 4px;
            min-width: 90px;
            font-size: 7.5pt;
          }
          
          .signature-line {
            border-bottom: 1px solid #000;
            flex: 1;
            padding-bottom: 1px;
            min-height: 14px;
            font-size: 7.5pt;
          }
          
          .personal-info-section {
            margin-top: 2mm;
            margin-bottom: 2mm;
          }
          .personal-info-section h3 {
            font-size: 8.5pt;
            font-weight: bold;
            margin-bottom: 1mm;
          }
          .page-2-start {
            page-break-before: auto;
            margin-top: 2mm;
          }
          .emergency-contact-section {
            margin-top: 2mm;
            margin-bottom: 2mm;
          }
          .emergency-contact-section h3 {
            font-size: 8.5pt;
            font-weight: bold;
            margin-bottom: 1mm;
          }
          .agreement-statement {
            margin-top: 2mm;
            margin-bottom: 2mm;
            page-break-inside: avoid;
          }
          .signature-section {
            margin-top: 1.5mm;
            margin-bottom: 1.5mm;
          }
          
          .signature-section h3 {
            font-size: 8pt;
            font-weight: bold;
            margin-bottom: 0.5mm;
          }
          
          .signature-section label {
            font-size: 7pt;
            margin-bottom: 0.3mm;
          }
          
          .signature-canvas {
            border: 1px solid #000;
            margin: 2pt 0;
            width: 180px;
            height: 45px;
            max-width: 180px;
            max-height: 45px;
          }
          
          .signature-canvas img {
            width: 180px;
            height: 45px;
            object-fit: contain;
          }
          
          .footer-address {
            text-align: center;
            font-size: 7pt;
            margin-top: 1.5mm;
            page-break-before: avoid;
          }
          
          .footer-address p {
            margin-bottom: 0.5mm;
            font-size: 7pt;
          }
        </style>
      </head>
      <body>
        <!-- 헤더 -->
        <div class="header">
          <h1>MalMoi韓国語教室</h1>
          <h2>入会同意書</h2>
          <p>本同意書は、MalMoi韓国語教室（以下「教室」）と入会者（以下「学生」）との間で、</p>
          <p>安心して学習を進めるための基本的なルール・権利・義務について確認するものです。</p>
          <p>以下の内容をよくお読みいただき、ご同意のうえご入会ください。</p>
        </div>

        <!-- 입회 동의서 내용 -->
        <section class="rule-section">
          <h3>1. 学習への姿勢および出席に関する事項</h3>
          <p>学生は、学習の継続とレベルアップを目的として、可能な範囲で規則的な受講に努めます。</p>
          <p>遅刻・欠席・変更がある場合は、できるだけ早く教室へ連絡します。</p>
          <p>教室は、より良い学習環境を維持するため、必要に応じて指導方針や教材内容を調整することがあります。</p>
        </section>

        <section class="rule-section">
          <h3>2. 学生と教室のコミュニケーション</h3>
          <p>レッスンに関する質問、学習相談、予約・受講状況の確認など、学生は適切な方法で教室へ問い合わせることができます。</p>
          <p>教室は、学生の学習状況・受講履歴・ノートなどをもとに、必要なサポートや助言を行います。</p>
          <p>教室からの連絡事項（変更・お知らせなど）は、LINE・メール等を通じて学生に通知します。</p>
        </section>

        <section class="rule-section">
          <h3>3. 教室設備の利用・安全に関する事項</h3>
          <p>学生は、教室の設備・備品を丁寧に扱い、故意または重大な過失による破損があった場合、相応の対応を行います。</p>
          <p>他の学生や講師、近隣への迷惑行為は行わないようご協力ください。</p>
          <p>教室内での盗難・紛失については、故意・重大過失を除き、教室は責任を負いません。</p>
        </section>

        <section class="rule-section">
          <h3>4. 個人情報の取り扱い（プライバシー）</h3>
          <p>教室は、学生から提供された個人情報（氏名・連絡先・学習履歴等）を適切に管理します。</p>
          <p>個人情報は以下の目的にのみ使用します。</p>
          <p>・レッスン提供、連絡、予約管理</p>
          <p>・緊急時の連絡</p>
          <p>・教室運営に必要な範囲での記録・事務処理</p>
          <p>法令に基づく場合を除き、第三者へ個人情報を提供することはありません。</p>
          <p>学生は、自身の個人情報の開示・訂正を教室に申請することができます。</p>
        </section>

        <section class="rule-section">
          <h3>5. 学習記録・音声データ・レッスンノートの取り扱い</h3>
          <p>レッスンノート・音声データなどの学習記録は、学生個人の学習目的に限り利用するものとします。</p>
          <p>許可なく他者への共有、SNS投稿、商用利用などは行わないものとします。</p>
          <p>教室は、学習記録を適切に保存し、必要に応じて学生に提供します。</p>
        </section>

        <section class="rule-section">
          <h3>6. 教室の権利および運営上の判断</h3>
          <p>教室は、円滑な運営のため、レッスン内容・形式・講師配置・設備使用などを調整することがあります。</p>
          <p>著しく学習目的にそぐわない行為や他の学生への迷惑行為がある場合、レッスン提供をお断りする場合があります。</p>
          <p>教室の事前告知のもと、規定の改訂を行うことがあります。</p>
        </section>

        <section class="rule-section">
          <h3>7. 規約・受講規定への同意</h3>
          <p>学生は、教室が定める<strong>受講規定（別紙：2025-10-17版）</strong>に従うことに同意します。</p>
          <p>規定内容（受講開始、購入単位、キャンセル、休学、卒業、ノート閲覧など）について理解し、遵守します。</p>
          <p>入会後は、受講規定に基づきレッスンが運用されることを確認します。</p>
        </section>

        <section class="rule-section">
          <h3>8. 免責事項</h3>
          <p>災害・設備故障・講師急病など予期せぬ事情によりレッスンが実施できない場合、教室は速やかに代替日程の案内を行います。</p>
          <p>上記に該当する場合、学生に対するペナルティ（キャンセル料等）は発生しません。</p>
        </section>

        <!-- 개인정보 섹션 -->
        <div class="personal-info-section page-2-start">
          <h3>학생정보</h3>
          <div class="form-row">
            <label>氏名（漢字）：</label>
            <div class="signature-line">${safeNameKanji}</div>
          </div>
          <div class="form-row">
            <label>フリガナ：</label>
            <div class="signature-line">${safeNameYomigana}</div>
          </div>
          <div class="form-row">
            <label>生年月日（西暦）：</label>
            <div class="signature-line">${safeBirthDate}</div>
          </div>
          <div class="form-row">
            <label>学籍番号：</label>
            <div class="signature-line">${safeStudentId ? safeStudentId : '＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿'}</div>
          </div>
          <div class="form-row">
            <label>電話番号：</label>
            <div class="signature-line">${safePhone}</div>
          </div>
          <div class="form-row">
            <label>メールアドレス：</label>
            <div class="signature-line">${safeEmail}</div>
          </div>
        </div>

        <!-- 긴급연락처 섹션 -->
        <div class="emergency-contact-section">
          <h3>緊急連絡先（保護者または指定連絡者）</h3>
          <div class="form-row">
            <label>氏名（漢字）：</label>
            <div class="signature-line">${safeEmergencyName}</div>
          </div>
          <div class="form-row">
            <label>フリガナ：</label>
            <div class="signature-line">${safeEmergencyYomigana ? safeEmergencyYomigana : '＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿'}</div>
          </div>
          <div class="form-row">
            <label>続柄：</label>
            <div class="signature-line">${safeEmergencyRelation}</div>
          </div>
          <div class="form-row">
            <label>携帯電話：</label>
            <div class="signature-line">${safeEmergencyPhone}</div>
          </div>
        </div>

        <!-- 동의문 -->
        <div class="agreement-statement">
          <h3>📑 同意欄（署名必須）</h3>
          <p>以下の内容に同意のうえ、入会を申請します。</p>
          <p>✓ 上記「入会同意書」の内容を読み、理解しました。</p>
          <p>✓ 教室の運営方針・個人情報の取り扱い・権利と義務に同意します。</p>
          <p>✓ 別紙「受講規定（2025-10-17版）」に従うことに同意します。</p>
        </div>

        <!-- 서명 섹션 -->
        <div class="signature-section">
          <h3>署名（画面に手書き）</h3>
          <div class="form-row">
            <label>署名（本人）：</label>
          </div>
          <div class="signature-canvas">
            ${signatureData ? `<img src="${signatureData}" style="max-width: 100%; height: auto;" />` : ''}
          </div>
          <div class="form-row">
            <label>日付：${new Date().toLocaleDateString('ja-JP')}</label>
          </div>
        </div>

        <!-- 푸터 -->
        <div class="footer-address">
          <p>MalMoi韓国語教室</p>
          <p>大阪府富田林市喜志町５丁目１−２　SAMURAI BLD　４D</p>
          <p>TEL: 090-6327-3043　E-mail: office@hanguru.school</p>
        </div>
      </body>
      </html>
    `;

    // Puppeteer로 PDF 생성
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    
    // 페이지 타임아웃 설정
    await page.setDefaultTimeout(30000);
    
    await page.setContent(htmlContent, { 
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '6mm',
        right: '6mm',
        bottom: '6mm',
        left: '6mm'
      },
      printBackground: true,
      preferCSSPageSize: true,
      timeout: 30000
    });

    await browser.close();
    browser = null;

    // 파일명 생성 (특수문자 제거)
    const rawName = (student.nameKanji || '').trim();
    const asciiName = rawName
      .normalize('NFKD')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '_');

    const today = new Date();
    const dateStamp = `${today.getFullYear().toString().slice(-2)}${(today.getMonth() + 1)
      .toString()
      .padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;

    const fallbackFileName = `MalMoi_EnrollmentAgreement_${dateStamp}_${asciiName || 'student'}.pdf`;
    const utf8FileName = `MalMoi_入会同意書_${dateStamp}_${rawName || '学生'}.pdf`;

    const contentDisposition = `attachment; filename="${fallbackFileName}"; filename*=UTF-8''${encodeURIComponent(utf8FileName)}`;

    // PDF 응답 반환
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': contentDisposition
      }
    });

  } catch (error) {
    console.error('PDF 생성 오류:', error);
    
    // 브라우저가 열려있으면 닫기
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('브라우저 종료 오류:', closeError);
      }
    }
    
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    console.error('상세 오류:', errorMessage);
    
    return NextResponse.json({ 
      error: 'PDF 생성에 실패했습니다.',
      details: errorMessage 
    }, { status: 500 });
  }
}

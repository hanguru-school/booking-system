import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { student, agreedRules, signatureData, timestamp } = body;

    // Puppeteer로 브라우저 인스턴스 생성
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-software-rasterizer',
          '--disable-extensions',
          '--single-process'
        ],
        timeout: 30000,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
      });
    } catch (error) {
      console.error('Puppeteer 브라우저 실행 오류:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      return NextResponse.json(
        { 
          error: `PDF 생성 서비스를 시작할 수 없습니다. 
          
오류 내용: ${errorMessage}

해결 방법:
서버에서 다음 명령어를 실행해주세요:
sudo apt-get update
sudo apt-get install -y libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2 libpango-1.0-0 libcairo2 libatspi2.0-0 libxshmfence1` 
        },
        { status: 500 }
      );
    }

    const page = await browser.newPage();

    // 파일명 생성
    const fileName = `MalMoi_Agreement_${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}_${student.nameKanji.replace(/[^\w\s-]/g, '')}.pdf`;

    // HTML 콘텐츠 생성
    const htmlContent = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>受講規定同意書</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        @page {
            margin: 8mm;
            size: A4 portrait;
        }
        
        body {
            font-family: 'Noto Sans JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', 'MS PGothic', 'MS Gothic', sans-serif;
            font-size: 9pt;
            line-height: 1.3;
            color: black;
            background: white;
            margin: 0;
            padding: 6mm;
        }
        
        .agreement-document {
            max-width: 210mm;
            margin: 0 auto;
        }
        
        .document-header {
            text-align: center;
            margin-bottom: 8mm;
        }
        
        .school-name {
            font-size: 9pt;
            font-weight: 400;
            margin-bottom: 2mm;
        }
        
        .document-title {
            font-size: 18pt;
            font-weight: 700;
            margin-bottom: 6mm;
        }
        
        .greeting-section {
            margin-bottom: 8mm;
            text-align: justify;
            font-size: 9pt;
            line-height: 1.3;
        }
        
        .greeting-section p {
            margin-bottom: 2mm;
        }
        
        .rules-section {
            margin-bottom: 8mm;
        }
        
        .rule-section {
            margin-bottom: 6px;
            border: 1px solid #000;
            padding: 3mm;
            page-break-inside: avoid;
            break-inside: avoid;
            page-break-before: auto;
            page-break-after: auto;
        }
        
        .rule-header {
            margin-bottom: 1.5mm;
        }
        
        .rule-title {
            font-size: 10pt;
            font-weight: 700;
            margin: 0;
        }
        
        .rule-content {
            margin-bottom: 1.5mm;
        }
        
        .rule-text {
            white-space: pre-line;
            margin-bottom: 1.5mm;
            font-size: 8.5pt;
            line-height: 1.3;
        }
        
        .rule-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1.5mm;
            page-break-inside: avoid;
            break-inside: avoid;
            font-size: 8pt;
        }
        
        .table-cell {
            border: 1px solid #000;
            padding: 1mm;
            text-align: center;
            font-size: 8pt;
        }
        
        .rule-check {
            text-align: right;
        }
        
        .check-button {
            display: inline-flex;
            align-items: center;
            gap: 2mm;
            padding: 1mm 2mm;
            border: 1px solid #000;
            background: #e6ffe6;
            font-size: 8pt;
            border-radius: 1mm;
        }
        
        .page-break-before {
            page-break-before: always;
        }
        
        .agreement-statement {
            margin-bottom: 5mm;
            text-align: justify;
            font-size: 9pt;
            line-height: 1.3;
        }
        
        .agreement-statement p {
            margin-bottom: 1.5mm;
        }
        
        .signature-section {
            margin-bottom: 8mm;
        }
        
        .signature-form {
            margin-bottom: 5mm;
        }
        
        .form-row {
            display: flex;
            align-items: center;
            margin-bottom: 1.5mm;
            font-size: 8.5pt;
        }
        
        .form-row label {
            width: 32mm;
            font-weight: 500;
            font-size: 8.5pt;
        }
        
        .signature-line {
            flex: 1;
            border-bottom: 1px solid #000;
            height: 4mm;
            display: flex;
            align-items: center;
            padding-left: 2mm;
            font-size: 8.5pt;
        }
        
        .emergency-contact {
            margin-bottom: 5mm;
        }
        
        .emergency-contact h4 {
            font-size: 9pt;
            font-weight: 700;
            margin-bottom: 1.5mm;
        }
        
        .signature-canvas-area {
            margin-bottom: 5mm;
        }
        
        .signature-canvas-area label {
            display: block;
            margin-bottom: 1mm;
            font-weight: 500;
            font-size: 8.5pt;
        }
        
        .signature-canvas {
            border: 1px solid #000;
            width: 400px;
            height: 100px;
        }
        
        .footer-address {
            margin-top: 10mm;
            text-align: center;
        }
        
        .contact-details {
            font-size: 10pt;
        }
        
        .page-break-avoid {
            page-break-inside: avoid;
        }
        
        .page-break-before {
            page-break-before: always;
        }
    </style>
</head>
<body>
    <div class="agreement-document">
        <!-- 문서 헤더 -->
        <div class="document-header">
            <div class="school-name">MalMoi韓国語教室</div>
            <div class="document-title">受講規定同意書</div>
        </div>

        <!-- 인사말 -->
        <div class="greeting-section">
            <p>このたびは、MalMoi韓国語教室にご入会いただき、誠にありがとうございます。</p>
            <p>下記の受講規定および個人情報の取り扱い内容をよくお読みいただき、同意のうえで署名してください。</p>
        </div>

        <!-- 규정 목록 -->
        <div class="rules-section">
            <section class="rule-section">
                <div class="rule-header">
                    <h3 class="rule-title">1. 受講開始</h3>
                </section>
                <div class="rule-content">
                    <div class="rule-text">・レッスンは入会日から30日以内に開始してください。
・30日を超えると事務手数料（180分）が発生します。
・予約が長期間ない場合は自動的に休会扱いとなります。
・受講開始日は体験レッスン後または購入日から自由に設定できます。
・月の開始日に応じて下記時間を受講された場合、手数料はかかりません。</div>
                    <table class="rule-table">
                        <tbody>
                            <tr>
                                <td class="table-cell">受講開始日</td>
                                <td class="table-cell">必要受講時間</td>
                            </tr>
                            <tr>
                                <td class="table-cell">1〜7日</td>
                                <td class="table-cell">180分以上</td>
                            </tr>
                            <tr>
                                <td class="table-cell">8〜15日</td>
                                <td class="table-cell">120分以上</td>
                            </tr>
                            <tr>
                                <td class="table-cell">16〜31日</td>
                                <td class="table-cell">60分以上</td>
                            </tr>
                        </tbody>
                    </table>
                </section>
                <div class="rule-check">
                    <div class="check-button">✓ 同意済み</div>
                </section>
            </section>

            <section class="rule-section">
                <div class="rule-header">
                    <h3 class="rule-title">2. レッスン時間の購入</h3>
                </section>
                <div class="rule-content">
                    <div class="rule-text">・入会時は600分の購入が必要です。
・残時間が180分以下になった時点で追加購入してください。
・購入した時間は返金不可ですが、他の生徒への譲渡は可能です。
・学習の安定のため360分以上の購入を推奨します。</div>
                </section>
                <div class="rule-check">
                    <div class="check-button">✓ 同意済み</div>
                </section>
            </section>

            <section class="rule-section">
                <div class="rule-header">
                    <h3 class="rule-title">3. 受講ペース・休会・卒業</h3>
                </section>
                <div class="rule-content">
                    <div class="rule-text">・月180分以上の受講を推奨します（義務ではありません）。
・2ヶ月受講がない場合は休会扱い、3ヶ月で卒業扱いとなります。
・卒業時はレッスンノートが削除されます。
・復学時は最新の料金と規定が適用されます。</div>
                </section>
                <div class="rule-check">
                    <div class="check-button">✓ 同意済み</div>
                </section>
            </section>

            <section class="rule-section">
                <div class="rule-header">
                    <h3 class="rule-title">4. 予約とキャンセル</h3>
                </section>
                <div class="rule-content">
                    <div class="rule-text">・予約は「予約ページ」から行ってください。
・予約後の変更は不可、キャンセルのみ可能です。
・前日キャンセル（48〜24時間前）：レッスン時間の50％
・当日キャンセル（24時間以内）：100％
・当日キャンセルが3回以上：200％
・同週キャンセル：レッスン時間に関係なく20分の手数料
・不可抗力（災害・事故等）：50％
・教室都合で変更する場合、手数料は発生しません。
・教室都合で変更後に生徒側キャンセルの場合：通常規定の50％を適用します。</div>
                </section>
                <div class="rule-check">
                    <div class="check-button">✓ 同意済み</div>
                </section>
            </section>

            <section class="rule-section">
                <div class="rule-header">
                    <h3 class="rule-title">5. 教材とレッスン内容</h3>
                </section>
                <div class="rule-content">
                    <div class="rule-text">・教材・音声・資料は学習目的以外での使用を禁止します。
・SNSや商用サイトへの無断転載は禁止です。
・録音・録画を希望する場合は事前に講師へ相談してください。
・音声データは60分以上のレッスンのみ無料提供／60分未満は10分分の手数料が発生します。</div>
                </section>
                <div class="rule-check">
                    <div class="check-button">✓ 同意済み</div>
                </section>
            </section>

            <section class="rule-section">
                <div class="rule-header">
                    <h3 class="rule-title">6. レッスンノート</h3>
                </section>
                <div class="rule-content">
                    <div class="rule-text">・各レッスン終了後、3日以内にノートを掲載します。3日を過ぎても表示されない場合はご連絡ください。
・学生情報の登録は必須です。緊急時に連絡が取れない場合の責任は負いません。
・音声データは60分単位で掲載されます。</div>
                </section>
                <div class="rule-check">
                    <div class="check-button">✓ 同意済み</div>
                </section>
            </section>

            <section class="rule-section">
                <div class="rule-header">
                    <h3 class="rule-title">7. 支払い</h3>
                </section>
                <div class="rule-content">
                    <div class="rule-text">・現金または電子決済をご利用いただけます。
・領収証は希望により発行します。
・残時間が180分以下になった時点でお支払いください。</div>
                </section>
                <div class="rule-check">
                    <div class="check-button">✓ 同意済み</div>
                </section>
            </section>

            <section class="rule-section">
                <div class="rule-header">
                    <h3 class="rule-title">8. 教室運営・その他</h3>
                </section>
                <div class="rule-content">
                    <div class="rule-text">・工事・災害・悪天候等で休講となる場合があります。
・教室都合により予約変更をお願いする場合があります。
・規定は予告なく改訂されることがあります。最新情報はレッスンノートでお知らせします。
・本規定はPOLICY_VERSION：2025-10-17に基づきます。</div>
                </section>
                <div class="rule-check">
                    <div class="check-button">✓ 同意済み</div>
                </section>
            </section>

            <section class="rule-section">
                <div class="rule-header">
                    <h3 class="rule-title">9. 禁止事項</h3>
                </section>
                <div class="rule-content">
                    <div class="rule-text">他の生徒への迷惑行為は禁止です。
教室の備品を破損した場合は、修理費を負担していただきます。
レッスン中の録音・録画は禁止です。</div>
                </section>
                <div class="rule-check">
                    <div class="check-button">✓ 同意済み</div>
                </section>
            </section>

            <section class="rule-section">
                <div class="rule-header">
                    <h3 class="rule-title">10. 教室運営・その他</h3>
                </section>
                <div class="rule-content">
                    <div class="rule-text">教室の運営方針は変更される場合があります。
変更時は事前にご連絡いたします。
その他のご質問はお気軽にお問い合わせください。</div>
                </section>
                <div class="rule-check">
                    <div class="check-button">✓ 同意済み</div>
                </section>
            </section>
        </div>

        <!-- 서명란 -->
        <div class="signature-section page-break-before">
            <!-- 동의문 - 서명란 위로 이동 -->
            <div class="agreement-statement">
                <p>私は、MalMoi韓国語教室の受講規定（POLICY_VERSION：2025-10-17）を理解し、</p>
                <p>これに従って受講を行うことに同意します。</p>
                <p>また、記載した個人情報の取り扱いについても同意いたします。</p>
            </div>

            <div class="signature-form">
                <div class="form-row">
                    <label>氏名（漢字）：</label>
                    <div class="signature-line">${student.nameKanji}</div>
                </div>
                <div class="form-row">
                    <label>フリガナ：</label>
                    <div class="signature-line">${student.nameYomigana}</div>
                </div>
                <div class="form-row">
                    <label>生年月日（西暦）：</label>
                    <div class="signature-line">${student.birthDate}</div>
                </div>
                <div class="form-row">
                    <label>学籍番号：</label>
                    <div class="signature-line">${student.studentId || '＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿'}</div>
                </div>
                <div class="form-row">
                    <label>電話番号：</label>
                    <div class="signature-line">${student.phone}</div>
                </div>
                <div class="form-row">
                    <label>メールアドレス：</label>
                    <div class="signature-line">${student.email}</div>
                </div>
            </div>

            <div class="emergency-contact">
                <h4>緊急連絡先（保護者または指定連絡者）</h4>
                <div class="form-row">
                    <label>氏名（漢字）：</label>
                    <div class="signature-line">${student.emergencyContactName}</div>
                </div>
                <div class="form-row">
                    <label>フリガナ：</label>
                    <div class="signature-line">${student.emergencyContactYomigana || '＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿'}</div>
                </div>
                <div class="form-row">
                    <label>続柄：</label>
                    <div class="signature-line">${student.emergencyContactRelation}</div>
                </div>
                <div class="form-row">
                    <label>携帯電話：</label>
                    <div class="signature-line">${student.emergencyContactPhone}</div>
                </div>
            </div>

            <div class="signature-canvas-area">
                <label>署名（本人）：</label>
                ${signatureData ? `<img src="${signatureData}" class="signature-canvas" />` : '<div class="signature-canvas"></div>'}
            </div>

            <div class="form-row">
                <label>日付：</label>
                <div class="signature-line">${new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'numeric', day: 'numeric' }).replace(/\//g, '年').replace(/(\d+)年(\d+)月(\d+)日/, '$1年$2月$3日')}</div>
            </div>
        </div>

        <!-- 연락처 정보 -->
        <div class="footer-address">
            <div class="contact-details">
                <p>MalMoi韓国語教室</p>
                <p>大阪府富田林市喜志町５丁目１−２　SAMURAI BLD　４D</p>
                <p>TEL: 090-6327-3043　E-mail: office@hanguru.school</p>
            </div>
        </div>
    </div>
</body>
</html>
    `;

    try {
      // HTML 콘텐츠를 페이지에 설정
      await page.setContent(htmlContent, { 
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // 페이지가 완전히 로드될 때까지 대기
      await page.waitForTimeout(1000);

      // PDF 생성 - 3페이지에 맞게 최적화
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '8mm',
          right: '8mm',
          bottom: '8mm',
          left: '8mm'
        },
        preferCSSPageSize: false,
        displayHeaderFooter: false
      });

      if (!pdf || pdf.length === 0) {
        throw new Error('PDF 생성 실패: 빈 파일이 생성되었습니다.');
      }

      return new NextResponse(pdf, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"; filename*=UTF-8''${encodeURIComponent(fileName)}`
        }
      });
    } catch (error) {
      console.error('PDF 생성 중 오류:', error);
      throw error;
    } finally {
      if (browser) {
        await browser.close().catch(err => console.error('브라우저 종료 오류:', err));
      }
    }

  } catch (error) {
    console.error('PDF 생성 오류:', error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    return NextResponse.json(
      { error: `PDF 생성 중 오류가 발생했습니다: ${errorMessage}` },
      { status: 500 }
    );
  }
}

import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

interface PrintPageProps {
  params: { studentId: string };
}

export const metadata: Metadata = {
  title: "Enrollment Agreement - Print",
  robots: { index: false, follow: false },
};

async function getStudent(studentId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      studentId: true,
      nameKanji: true,
      nameYomigana: true,
      birthDate: true,
      phone: true,
      email: true,
      emergencyContactName: true,
      emergencyContactYomigana: true,
      emergencyContactRelation: true,
      emergencyContactPhone: true,
      signatureData: true,
      createdAt: true,
    },
  });

  if (!student) {
    return null;
  }

  return {
    id: student.id,
    studentId: student.studentId ?? "",
    nameKanji: student.nameKanji ?? "",
    nameYomigana: student.nameYomigana ?? "",
    birthDate: student.birthDate ?? "",
    phone: student.phone ?? "",
    email: student.email ?? "",
    emergencyContactName: student.emergencyContactName ?? "",
    emergencyContactYomigana: student.emergencyContactYomigana ?? "",
    emergencyContactRelation: student.emergencyContactRelation ?? "",
    emergencyContactPhone: student.emergencyContactPhone ?? "",
    signatureData: student.signatureData ?? "",
    createdAt: student.createdAt,
  };
}

export default async function EnrollmentAgreementPrintPage({ params }: PrintPageProps) {
  const student = await getStudent(params.studentId);

  if (!student) {
    return (
      <main className="print-wrap">
        <p>対象の学生情報が見つかりませんでした。</p>
      </main>
    );
  }

  const createdDate = new Date(student.createdAt);
  const createdStr = createdDate.toLocaleDateString("ja-JP");

  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <title>入会同意書 - {student.nameKanji || student.studentId}</title>
        <style>{`
          body {
            margin: 0;
            padding: 0;
            font-family: "Noto Sans JP", "Noto Sans CJK KR", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background: #f5f5f5;
          }
          .print-wrap {
            max-width: 720px;
            margin: 0 auto;
            padding: 16px 24px 32px;
            background: #ffffff;
          }
          h1, h2, h3 {
            margin: 0;
          }
          .header {
            text-align: center;
            margin-bottom: 24px;
          }
          .header-title-main {
            font-size: 24pt;
            font-weight: 700;
            letter-spacing: 0.12em;
            margin-top: 8px;
          }
          .header-title-sub {
            font-size: 12pt;
            font-weight: 600;
            color: #333333;
          }
          .section {
            margin-top: 16px;
            margin-bottom: 16px;
          }
          .section-title {
            font-size: 13pt;
            font-weight: 600;
            margin-bottom: 6px;
            color: #222222;
          }
          .section-body {
            font-size: 10.5pt;
            line-height: 1.6;
            color: #444444;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px 16px;
            font-size: 10.5pt;
            margin-top: 8px;
          }
          .info-row {
            display: flex;
            align-items: center;
            margin-bottom: 4px;
          }
          .info-label {
            min-width: 120px;
            font-weight: 500;
          }
          .info-value {
            border-bottom: 1px solid #000;
            flex: 1;
            min-height: 18px;
            padding-bottom: 1px;
          }
          .notice {
            font-size: 10pt;
            line-height: 1.6;
            margin-top: 16px;
          }
          .signature-block {
            margin-top: 20px;
            font-size: 10.5pt;
          }
          .signature-row {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
          }
          .signature-label {
            min-width: 120px;
          }
          .signature-box {
            flex: 1;
            min-height: 60px;
            border: 1px solid #000;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .footer-address {
            margin-top: 24px;
            text-align: center;
            font-size: 10pt;
          }
          .footer-address p {
            margin: 2px 0;
          }

          @page {
            size: A4;
            margin: 12mm;
          }

          @media print {
            body {
              background: #ffffff;
            }
            .print-wrap {
              box-shadow: none;
              margin: 0;
              padding: 4mm 4mm 6mm;
            }
          }
        `}</style>
      </head>
      <body>
        <main className="print-wrap">
          <header className="header">
            <div className="header-title-sub">韓国語教室MalMoi</div>
            <div className="header-title-main">入会同意書</div>
          </header>

          <section className="section">
            <div className="section-body">
              <p>このたびは、MalMoi韓国語教室にご関心をお寄せいただき、誠にありがとうございます。</p>
              <p>ご入会にあたり、以下の内容をご確認のうえ、ご署名くださいますようお願いいたします。</p>
              <p>本書は、安心して学んでいただくための基本的なルールおよび個人情報の取り扱いに関する同意書です。</p>
            </div>
          </section>

          <section className="section">
            <h3 className="section-title">1. 入会について</h3>
            <div className="section-body">
              <p>当教室の学習方針および受講規定にご理解・ご同意のうえでお申し込みください。</p>
              <p>体験レッスンを受講された方は、正式入会時に所定のレッスン時間（600分）をご購入いただきます。</p>
              <p>ご入会後は、レッスン時間の有効活用と学習リズムの安定を目的として、月180分以上の受講を推奨しております。</p>
              <p>長期間受講がない場合（2ヶ月以上）は休学扱い、3ヶ月を経過した場合は卒業扱いとなります。</p>
            </div>
          </section>

          <section className="section">
            <h3 className="section-title">2. 個人情報の取り扱い</h3>
            <div className="section-body">
              <p>ご記入いただいた個人情報は、次の目的のみに使用いたします。</p>
              <p>・受講管理およびご連絡</p>
              <p>・緊急時の安全確保および保護者への連絡</p>
              <p>・教室運営上の事務処理（スケジュール・出席・請求・統計等）</p>
              <p>法令に基づく場合を除き、第三者への提供は一切行いません。</p>
              <p>個人情報は厳重に管理し、在籍期間終了後は適切な方法で処理いたします。</p>
            </div>
          </section>

          <section className="section">
            <h3 className="section-title">学生情報</h3>
            <div className="info-grid">
              <div className="info-row">
                <div className="info-label">氏名（漢字）</div>
                <div className="info-value">{student.nameKanji}</div>
              </div>
              <div className="info-row">
                <div className="info-label">フリガナ</div>
                <div className="info-value">{student.nameYomigana}</div>
              </div>
              <div className="info-row">
                <div className="info-label">生年月日</div>
                <div className="info-value">{student.birthDate}</div>
              </div>
              <div className="info-row">
                <div className="info-label">学籍番号</div>
                <div className="info-value">{student.studentId}</div>
              </div>
              <div className="info-row">
                <div className="info-label">電話番号</div>
                <div className="info-value">{student.phone}</div>
              </div>
              <div className="info-row">
                <div className="info-label">メールアドレス</div>
                <div className="info-value">{student.email}</div>
              </div>
            </div>
          </section>

          <section className="section">
            <h3 className="section-title">緊急連絡先（保護者または指定連絡者）</h3>
            <div className="info-grid">
              <div className="info-row">
                <div className="info-label">氏名（漢字）</div>
                <div className="info-value">{student.emergencyContactName}</div>
              </div>
              <div className="info-row">
                <div className="info-label">フリガナ</div>
                <div className="info-value">{student.emergencyContactYomigana}</div>
              </div>
              <div className="info-row">
                <div className="info-label">続柄</div>
                <div className="info-value">{student.emergencyContactRelation}</div>
              </div>
              <div className="info-row">
                <div className="info-label">携帯電話</div>
                <div className="info-value">{student.emergencyContactPhone}</div>
              </div>
            </div>
          </section>

          <section className="section notice">
            <p>本同意書は、入会手続きおよび受講管理に必要な範囲で保存されます。</p>
            <p>内容に変更が生じた場合は速やかに事務局までご連絡ください。</p>
          </section>

          <section className="signature-block">
            <div className="signature-row">
              <div className="signature-label">日付</div>
              <div className="info-value">{createdStr}</div>
            </div>
            <div className="signature-row">
              <div className="signature-label">署名（本人）</div>
              <div className="signature-box">
                {student.signatureData ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={student.signatureData}
                    alt="署名"
                    style={{ maxWidth: "100%", maxHeight: "100%" }}
                  />
                ) : (
                  <span>（署名）</span>
                )}
              </div>
            </div>
          </section>

          <footer className="footer-address">
            <p>MalMoi韓国語教室</p>
            <p>大阪府富田林市喜志町５丁目１−２　SAMURAI BLD　４D</p>
            <p>TEL: 090-6327-3043　E-mail: office@hanguru.school</p>
          </footer>
        </main>
      </body>
    </html>
  );
}





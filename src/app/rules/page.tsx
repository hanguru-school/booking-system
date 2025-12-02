'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

interface Student {
  nameKanji: string;
  nameYomigana: string;
  birthDate: string;
  email: string;
  phone: string;
  studentId?: string;
  emergencyContactName: string;
  emergencyContactYomigana?: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
  emergencyContactEmail: string;
  parentName?: string;
  parentPhone?: string;
  parentRelation?: string;
}

interface Rule {
  id: string;
  title: string;
  content: string;
}

const POLICY_VERSION = '2025-10-17';

const RulesPage: React.FC = () => {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [agreedRules, setAgreedRules] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);

  const rules: Rule[] = [
    {
      id: '1',
      title: '1. 受講開始',
      content: `・レッスンは入会日から30日以内に開始してください。
・30日を超えると事務手数料（180分）が発生します。
・予約が長期間ない場合は自動的に休会扱いとなります。
・受講開始日は体験レッスン後または購入日から自由に設定できます。
・月の開始日に応じて下記時間を受講された場合、手数料はかかりません。`
    },
    {
      id: '2',
      title: '2. レッスン時間の購入',
      content: `・入会時は600分の購入が必要です。
・残時間が180分以下になった時点で追加購入してください。
・購入した時間は返金不可ですが、他の生徒への譲渡は可能です。
・学習の安定のため360分以上の購入を推奨します。`
    },
    {
      id: '3',
      title: '3. 受講ペース・休会・卒業',
      content: `・月180分以上の受講を推奨します（義務ではありません）。
・2ヶ月受講がない場合は休会扱い、3ヶ月で卒業扱いとなります。
・卒業時はレッスンノートが削除されます。
・復学時は最新の料金と規定が適用されます。`
    },
    {
      id: '4',
      title: '4. 予約とキャンセル',
      content: `・予約は「予約ページ」から行ってください。
・予約後の変更は不可、キャンセルのみ可能です。
・前日キャンセル（48〜24時間前）：レッスン時間の50％
・当日キャンセル（24時間以内）：100％
・当日キャンセルが3回以上：200％
・同週キャンセル：レッスン時間に関係なく20分の手数料
・不可抗力（災害・事故等）：50％
・教室都合で変更する場合、手数料は発生しません。
・教室都合で変更後に生徒側キャンセルの場合：通常規定の50％を適用します。`
    },
    {
      id: '5',
      title: '5. 教材とレッスン内容',
      content: `・教材・音声・資料は学習目的以外での使用を禁止します。
・SNSや商用サイトへの無断転載は禁止です。
・録音・録画を希望する場合は事前に講師へ相談してください。
・音声データは60分以上のレッスンのみ無料提供／60分未満は10分分の手数料が発生します。`
    },
    {
      id: '6',
      title: '6. レッスンノート',
      content: `・各レッスン終了後、3日以内にノートを掲載します。3日を過ぎても表示されない場合はご連絡ください。
・学生情報の登録は必須です。緊急時に連絡が取れない場合の責任は負いません。
・音声データは60分単位で掲載されます。`
    },
    {
      id: '7',
      title: '7. 支払い',
      content: `・現金または電子決済をご利用いただけます。
・領収証は希望により発行します。
・残時間が180分以下になった時点でお支払いください。`
    },
    {
      id: '8',
      title: '8. 教室運営・その他',
      content: `・工事・災害・悪天候等で休講となる場合があります。
・教室都合により予約変更をお願いする場合があります。
・規定は予告なく改訂されることがあります。最新情報はレッスンノートでお知らせします。
・本規定はPOLICY_VERSION：2025-10-17に基づきます。`
    }
  ];

  useEffect(() => {
    const loadEnrollmentData = () => {
      try {
        const enrollmentData = localStorage.getItem('enrollmentData');
        if (enrollmentData) {
          const parsed = JSON.parse(enrollmentData);
          setStudent(parsed);
        } else {
          // 더미 데이터 (테스트용)
          setStudent({
            nameKanji: '藤村梨恵',
            nameYomigana: 'フジムラリエ',
            birthDate: '2005-03-15',
            email: 'fujimura.rie@example.com',
            phone: '090-1234-5678',
            studentId: 'S2025001',
            emergencyContactName: '藤村梨恵',
            emergencyContactYomigana: 'フジムラリエ',
            emergencyContactRelation: '父',
            emergencyContactPhone: '090-9876-5432',
            emergencyContactEmail: 'fujimura.father@example.com'
          });
        }
      } catch (error) {
        console.error('입회 데이터 로드 오류:', error);
        router.push('/enrollment');
      } finally {
        setLoading(false);
      }
    };

    loadEnrollmentData();
  }, [router]);

  useEffect(() => {
    if (student) {
      document.title = `受講規定同意書 - ${student.nameKanji}`;
    }
  }, [student]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('touches' in e) {
      // 터치 이벤트
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // 마우스 이벤트
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

    const coords = getCoordinates(e);
    if (!coords) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

    const coords = getCoordinates(e);
    if (!coords) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

    const coords = getCoordinates(e);
    if (!coords) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

    const coords = getCoordinates(e);
    if (!coords) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleTouchEnd = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

      const ctx = canvas.getContext('2d');
    if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const isSignatureEmpty = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return true;

    const ctx = canvas.getContext('2d');
    if (!ctx) return true;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return imageData.data.every(pixel => pixel === 0);
  };

  const handleRuleToggle = (ruleId: string) => {
    const newAgreedRules = new Set(agreedRules);
    if (newAgreedRules.has(ruleId)) {
      newAgreedRules.delete(ruleId);
    } else {
      newAgreedRules.add(ruleId);
    }
    setAgreedRules(newAgreedRules);
  };

  const isAllAgreed = () => {
    return rules.every(rule => agreedRules.has(rule.id));
  };

  const handleSubmit = () => {
    if (!isAllAgreed()) {
      alert('모든 규정에 동의해주세요.');
      return;
    }
    
    if (isSignatureEmpty()) {
      alert('서명을 완료해주세요.');
      return;
    }

    try {
      const agreementData = {
        student,
        agreedRules: Array.from(agreedRules),
        signatureData: signatureCanvasRef.current?.toDataURL(),
        timestamp: new Date().toISOString()
      };

      localStorage.setItem('agreementData', JSON.stringify(agreementData));
      router.push('/enrollment-agreement');
    } catch (error) {
      console.error('동의 데이터 저장 오류:', error);
      alert('데이터 저장 중 오류가 발생했습니다.');
    }
  };

  const printDocument = () => {
    if (!isAllAgreed()) {
      alert('すべての規定に同意してください。');
      return;
    }
    if (isSignatureEmpty()) {
      alert('署名を完了してください。');
      return;
    }
    window.print();
  };

  const downloadPDF = async () => {
    if (!isAllAgreed()) {
      alert('すべての規定に同意してください。');
      return;
    }
    
    if (isSignatureEmpty()) {
      alert('署名を完了してください。');
      return;
    }

    if (!student) {
      alert('学生情報が見つかりません。');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/print/agreement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student,
          agreedRules: Array.from(agreedRules),
          signatureData: signatureCanvasRef.current?.toDataURL(),
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        let errorMessage = 'PDF生成に失敗しました';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `서버 오류 (${response.status}): ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/pdf')) {
        const text = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(text);
        } catch (e) {
          errorData = { error: text || '알 수 없는 오류' };
        }
        throw new Error(errorData.error || 'PDF 파일이 아닙니다.');
      }

      const blob = await response.blob();
      
      if (!blob || blob.size === 0) {
        throw new Error('PDF 파일이 생성되지 않았습니다. (파일 크기: 0)');
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MalMoi_Agreement_${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}_${student.nameKanji.replace(/[^\w\s-]/g, '')}.pdf`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
    } catch (error) {
      console.error('PDF 生成 오류:', error);
      const errorMessage = error instanceof Error ? error.message : 'PDF 생성 중 오류가 발생했습니다.';
      alert(`PDF 생성 오류:\n${errorMessage}\n\n다시 시도해주세요.`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">학생 정보를 찾을 수 없습니다.</div>
      </div>
    );
  }

  const isMinor = new Date().getFullYear() - new Date(student.birthDate).getFullYear() < 20;

  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
      {/* 통합 문서 컨테이너 */}
      <div id="agreement-content" className="agreement-document">
        {/* 문서 헤더 */}
        <div className="document-header">
          <div className="school-name">MalMoi韓国語教室</div>
          <div className="document-title">受講規定同意書</div>
                    </div>
                    
        {/* 인사말 */}
        <div className="greeting-section">
          <p>このたびは、MalMoi韓国語教室にご入会いただき、誠にありがとうございます。</p>
          <p>下記の受講規定および個人情報の取り扱い内容をよくお読みいただき、同意のうえで署名してください。</p>
                    </div>
                    
        {/* 규정 목록 */}
        <div className="rules-section">
          {rules.map((rule, index) => (
            <section key={rule.id} className="rule-section">
              <div className="rule-header">
                <h3 className="rule-title">{rule.title}</h3>
              </div>
              <div className="rule-content">
                <div className="rule-text">{rule.content}</div>
                {rule.id === '1' && (
                  <table className="rule-table">
                          <tbody>
                            <tr>
                        <td className="table-cell">受講開始日</td>
                        <td className="table-cell">必要受講時間</td>
                      </tr>
                      <tr>
                        <td className="table-cell">1〜7日</td>
                        <td className="table-cell">180分以上</td>
                            </tr>
                            <tr>
                        <td className="table-cell">8〜15日</td>
                        <td className="table-cell">120分以上</td>
                            </tr>
                            <tr>
                        <td className="table-cell">16〜31日</td>
                        <td className="table-cell">60分以上</td>
                            </tr>
                          </tbody>
                        </table>
                    )}
                  </div>
              <div className="rule-check">
                <button
                  onClick={() => handleRuleToggle(rule.id)}
                  className={`check-button ${agreedRules.has(rule.id) ? 'checked' : ''}`}
                >
                  <CheckCircle className="check-icon" />
                  {agreedRules.has(rule.id) ? '同意済み' : '同意する'}
                </button>
                  </div>
            </section>
              ))}
            </div>

        {/* 서명란 */}
        <div className="signature-section page-break-before">
          {/* 동의문 - 서명란 위로 이동 */}
          <div className="agreement-statement">
            <p>私は、MalMoi韓国語教室の受講規定（POLICY_VERSION：{POLICY_VERSION}）を理解し、</p>
            <p>これに従って受講を行うことに同意します。</p>
            <p>また、記載した個人情報の取り扱いについても同意いたします。</p>
          </div>

          <div className="signature-form">
            <div className="form-row">
              <label>氏名（漢字）：</label>
              <div className="signature-line">{student.nameKanji}</div>
                      </div>
            <div className="form-row">
              <label>フリガナ：</label>
              <div className="signature-line">{student.nameYomigana}</div>
                        </div>
            <div className="form-row">
              <label>生年月日（西暦）：</label>
              <div className="signature-line">{student.birthDate}</div>
                      </div>
            <div className="form-row">
              <label>学籍番号：</label>
              <div className="signature-line">{student.studentId || '＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿'}</div>
                        </div>
            <div className="form-row">
              <label>電話番号：</label>
              <div className="signature-line">{student.phone}</div>
                      </div>
            <div className="form-row">
              <label>メールアドレス：</label>
              <div className="signature-line">{student.email}</div>
                    </div>
                  </div>
                  
          <div className="emergency-contact">
            <h4>緊急連絡先（保護者または指定連絡者）</h4>
            <div className="form-row">
              <label>氏名（漢字）：</label>
              <div className="signature-line">{student.emergencyContactName}</div>
                      </div>
            <div className="form-row">
              <label>フリガナ：</label>
              <div className="signature-line">{student.emergencyContactYomigana || '＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿'}</div>
                  </div>
            <div className="form-row">
              <label>続柄：</label>
              <div className="signature-line">{student.emergencyContactRelation}</div>
                </div>
            <div className="form-row">
              <label>携帯電話：</label>
              <div className="signature-line">{student.emergencyContactPhone}</div>
            </div>
          </div>

          <div className="signature-canvas-area">
            <label>署名（本人）：</label>
            <canvas
              ref={signatureCanvasRef}
              className="signature-canvas"
              width={400}
              height={100}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
              style={{ touchAction: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
            />
          </div>

          <div className="form-row">
            <label>日付：</label>
            <div className="signature-line">{new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'numeric', day: 'numeric' }).replace(/\//g, '年').replace(/(\d+)年(\d+)月(\d+)日/, '$1年$2月$3日')}</div>
          </div>

          {isMinor && (
            <div className="form-row">
              <label>保護者署名：</label>
              <div className="signature-line">＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿</div>
            </div>
          )}
        </div>

        {/* 연락처 정보 */}
        <div className="footer-address">
          <div className="contact-details">
            <p>MalMoi韓国語教室</p>
            <p>大阪府富田林市喜志町５丁目１−２　SAMURAI BLD　４D</p>
            <p>TEL: 090-6327-3043　E-mail: office@hanguru.school</p>
          </div>
        </div>
      </div>

      {/* 액션 버튼들 */}
      <div className="action-buttons">
              <button
                onClick={clearSignature}
          className="action-button clear-button"
        >
          署名をクリア
        </button>
        <button
          onClick={printDocument}
          disabled={!isAllAgreed() || isSignatureEmpty()}
          className={`action-button print-button ${isAllAgreed() && !isSignatureEmpty() ? 'enabled' : 'disabled'}`}
        >
          印刷
        </button>
        <button
          onClick={downloadPDF}
          disabled={!isAllAgreed() || isSignatureEmpty()}
          className={`action-button pdf-button ${isAllAgreed() && !isSignatureEmpty() ? 'enabled' : 'disabled'}`}
        >
          PDFダウンロード
              </button>
              <button
          onClick={handleSubmit}
          disabled={!isAllAgreed() || isSignatureEmpty()}
          className={`action-button submit-button ${isAllAgreed() && !isSignatureEmpty() ? 'enabled' : 'disabled'}`}
              >
          同意して次へ
              </button>
      </div>

      {/* 통합 인쇄용 스타일 */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap');
        
        .agreement-document {
          background: white;
          color: black;
          font-family: 'Noto Sans JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', 'MS PGothic', 'MS Gothic', sans-serif;
          font-size: 11pt;
          line-height: 1.5;
          padding: 12mm;
          max-width: 210mm;
          width: 100%;
          margin: 0 auto;
          box-shadow: none;
          border: none;
          box-sizing: border-box;
        }

        @media (max-width: 768px) {
          .agreement-document {
            padding: 8mm;
            max-width: 100%;
          }
        }

        .document-header {
          text-align: center;
          margin-bottom: 20mm;
        }

        .school-name {
          font-size: 11pt;
          font-weight: 400;
          margin-bottom: 5mm;
        }

        .document-title {
          font-size: 24pt;
          font-weight: 700;
          margin-bottom: 10mm;
        }

        .greeting-section {
          margin-bottom: 15mm;
          text-align: justify;
        }

        .greeting-section p {
          margin-bottom: 5mm;
        }

        .rules-section {
          margin-bottom: 15mm;
        }

        .rule-section {
          margin-bottom: 18px;
          border: 1px solid #000;
          padding: 5mm;
          page-break-inside: avoid;
          break-inside: avoid;
          page-break-before: auto;
          page-break-after: auto;
        }

        .rule-header {
          margin-bottom: 3mm;
        }

        .rule-title {
          font-size: 12pt;
          font-weight: 700;
          margin: 0;
        }

        .rule-content {
          margin-bottom: 3mm;
        }

        .rule-text {
          white-space: pre-line;
          margin-bottom: 3mm;
        }

        .rule-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 3mm;
          page-break-inside: avoid;
          break-inside: avoid;
        }

        .table-cell {
          border: 1px solid #000;
          padding: 2mm;
          text-align: center;
        }

        .rule-check {
          text-align: right;
        }

        .check-button {
          display: inline-flex;
          align-items: center;
          gap: 2mm;
          padding: 2mm 4mm;
          border: 1px solid #000;
          background: white;
          font-size: 10pt;
          cursor: pointer;
          border-radius: 1mm;
        }

        .check-button.checked {
          background-color: #e6ffe6;
        }

        .check-icon {
          width: 12px;
          height: 12px;
        }

        .agreement-statement {
          margin-bottom: 8mm;
          text-align: justify;
        }

        .agreement-statement p {
          margin-bottom: 3mm;
        }

        .signature-section {
          margin-bottom: 15mm;
        }

        .signature-form {
          margin-bottom: 8mm;
        }

        .form-row {
          display: flex;
          align-items: center;
          margin-bottom: 3mm;
        }

        .form-row label {
          width: 40mm;
          font-weight: 500;
        }

        .signature-line {
          flex: 1;
          border-bottom: 1px solid #000;
          height: 6mm;
          display: flex;
          align-items: center;
          padding-left: 2mm;
        }

        .emergency-contact {
          margin-bottom: 8mm;
        }

        .emergency-contact h4 {
          font-size: 11pt;
          font-weight: 700;
          margin-bottom: 3mm;
        }

        .signature-canvas-area {
          margin-bottom: 8mm;
        }

        .signature-canvas-area label {
          display: block;
          margin-bottom: 2mm;
          font-weight: 500;
        }

        .signature-canvas {
          border: 1px solid #000;
          cursor: crosshair;
        }

        .footer-address {
          margin-top: 10mm;
          text-align: center;
        }

        .contact-details {
          font-size: 10pt;
        }

        .action-buttons {
          display: flex;
          justify-content: center;
          gap: 10mm;
          margin-top: 10mm;
          margin-bottom: 20mm;
        }

        .action-button {
          padding: 3mm 6mm;
          border: 1px solid #000;
          background: white;
          font-size: 11pt;
          cursor: pointer;
          border-radius: 2mm;
          transition: all 0.3s ease;
        }

        .action-button:disabled {
          background-color: #f3f4f6 !important;
          color: #9ca3af !important;
          border-color: #d1d5db !important;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .clear-button {
          background-color: #ffe6e6;
          color: #000;
        }

        .print-button {
          background-color: #e6f3ff;
          color: #000;
        }

        .print-button.enabled {
          background-color: #3b82f6;
          color: #ffffff;
          font-weight: 600;
        }

        .pdf-button {
          background-color: #e6ffe6;
          color: #000;
        }

        .pdf-button.enabled {
          background-color: #10b981;
          color: #ffffff;
          font-weight: 600;
        }

        .submit-button {
          background-color: #ffe6e6;
          color: #000;
        }

        .submit-button.enabled {
          background-color: #8b5cf6;
          color: #ffffff;
          font-weight: 600;
        }

        /* 페이지 분할 제어 */
        .page-break-avoid {
          page-break-inside: avoid;
          break-inside: avoid;
        }

        .page-break-before {
          page-break-before: always;
        }

        /* 섹션별 페이지 분할 최적화 */
        .rule-section {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          orphans: 3;
          widows: 3;
        }

        .rule-section:first-child {
          page-break-before: avoid;
        }

        .rule-section:last-child {
          page-break-after: avoid;
        }

        /* 인쇄용 스타일 - 3페이지에 맞게 최적화 */
        @media print {
          @page {
            margin: 8mm;
            size: A4 portrait;
          }
          
          body * {
            visibility: hidden;
          }
          
          #agreement-content,
          #agreement-content * {
            visibility: visible;
          }
          
          #agreement-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            padding: 0;
          }

          .agreement-document {
            padding: 6mm !important;
            max-width: 100% !important;
          }

          .document-header {
            margin-bottom: 8mm !important;
          }

          .school-name {
            font-size: 9pt !important;
            margin-bottom: 2mm !important;
          }

          .document-title {
            font-size: 18pt !important;
            margin-bottom: 6mm !important;
          }

          .greeting-section {
            margin-bottom: 8mm !important;
            font-size: 9pt !important;
            line-height: 1.3 !important;
          }

          .greeting-section p {
            margin-bottom: 2mm !important;
          }

          .rules-section {
            margin-bottom: 8mm !important;
          }

          /* 인쇄 시 페이지 분할 최적화 - 3페이지에 맞게 */
          .rule-section {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin-bottom: 6px !important;
            padding: 3mm !important;
            orphans: 2;
            widows: 2;
          }

          .rule-title {
            font-size: 10pt !important;
            margin-bottom: 1.5mm !important;
          }

          .rule-content {
            font-size: 8.5pt !important;
            line-height: 1.3 !important;
            margin-bottom: 1.5mm !important;
          }

          .rule-text {
            font-size: 8.5pt !important;
            line-height: 1.3 !important;
            margin-bottom: 1.5mm !important;
          }

          .rule-table {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            font-size: 8pt !important;
            margin-top: 1.5mm !important;
          }

          .table-cell {
            padding: 1mm !important;
            font-size: 8pt !important;
          }

          .rule-header {
            page-break-after: avoid;
            margin-bottom: 1.5mm !important;
          }

          .rule-check {
            page-break-before: avoid;
            margin-top: 1.5mm !important;
          }

          .check-button {
            padding: 1mm 2mm !important;
            font-size: 8pt !important;
          }

          .agreement-statement {
            margin-bottom: 5mm !important;
            font-size: 9pt !important;
            line-height: 1.3 !important;
          }

          .agreement-statement p {
            margin-bottom: 1.5mm !important;
          }

          .signature-section {
            margin-bottom: 8mm !important;
          }

          .signature-form {
            margin-bottom: 5mm !important;
          }

          .form-row {
            margin-bottom: 1.5mm !important;
            font-size: 8.5pt !important;
          }

          .form-row label {
            width: 32mm !important;
            font-size: 8.5pt !important;
          }

          .signature-line {
            height: 4mm !important;
            font-size: 8.5pt !important;
          }

          .emergency-contact {
            margin-bottom: 5mm !important;
          }

          .emergency-contact h4 {
            font-size: 9pt !important;
            margin-bottom: 1.5mm !important;
          }

          .signature-canvas-area {
            margin-bottom: 5mm !important;
          }

          .signature-canvas-area label {
            font-size: 8.5pt !important;
            margin-bottom: 1mm !important;
          }

          .signature-canvas {
            border: 1px solid #000;
            width: 100% !important;
            max-width: 280px !important;
            height: 70px !important;
          }

          .footer-address {
            margin-top: 6mm !important;
            font-size: 8pt !important;
          }

          .contact-details {
            font-size: 8pt !important;
          }

          .action-buttons {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default RulesPage;
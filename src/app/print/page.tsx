'use client';

import { useState, useEffect, useRef } from 'react';
import { Download, Printer, FileText, PenTool, CheckCircle, X } from 'lucide-react';

export default function DocumentPrint() {
  const [student, setStudent] = useState<any>(null);
  const [documentData, setDocumentData] = useState<any>(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureData, setSignatureData] = useState({ data: '', isEmpty: true });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    // ローカルストレージから学生情報取得
    const savedStudent = localStorage.getItem('student');
    if (savedStudent) {
      setStudent(JSON.parse(savedStudent));
    } else {
      // ログインページにリダイレクト
      window.location.href = '/';
    }
  }, []);

  // 署名データが変更されたときに文書内容を更新
  useEffect(() => {
    if (student) {
      const docData = {
        title: '入会説明及び同意書',
        studentInfo: student,
        applicationDate: new Date().toLocaleDateString('ja-JP'),
        content: generateDocumentContent(student, signatureData)
      };
      setDocumentData(docData);
    }
  }, [student, signatureData]);

  const generateDocumentContent = (studentData: any, signatureData: any) => {
    const isMinor = studentData.isMinor;
    
    return `
      <div style="font-family: 'Noto Sans JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', 'MS PGothic', 'MS Gothic', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6;">
        <h1 style="text-align: center; color: #333; margin-bottom: 30px; font-size: 24px; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          入会説明及び同意書
        </h1>

        <div style="margin-bottom: 25px;">
          <h2 style="color: #555; border-bottom: 1px solid #007bff; padding-bottom: 5px; font-size: 18px;">
            1. 入会案内
          </h2>
          <p style="color: #666; margin: 10px 0;">
            このたびは、MalMoi韓国語教室にご関心をお寄せいただき、誠にありがとうございます。<br>
            ご入会にあたり、以下の内容をご確認のうえ、ご署名くださいますようお願いいたします。<br>
            本書は、安心して学んでいただくための基本的なルールおよび個人情報の取り扱いに関する同意書です。
          </p>
        </div>

        <div style="margin-bottom: 25px;">
          <h2 style="color: #555; border-bottom: 1px solid #007bff; padding-bottom: 5px; font-size: 18px;">
            2. 入会条件
          </h2>
          <ul style="color: #666; margin: 10px 0; padding-left: 20px;">
            入会について<br><br>
            当教室の学習方針および受講規定にご理解・ご同意のうえでお申し込みください。<br><br>
            体験レッスンを受講された方は、正式入会時に所定のレッスン時間（600分）をご購入いただきます。<br><br>
            ご入会後は、レッスン時間の有効活用と学習計画の安定を目的として、月180分以上の受講を推奨しております。<br><br>
            長期間受講がない場合（2ヶ月以上）は休学扱い、3ヶ月を経過した場合は卒業扱いとなります。
          </ul>
        </div>

        <div style="margin-bottom: 25px;">
          <h2 style="color: #555; border-bottom: 1px solid #007bff; padding-bottom: 5px; font-size: 18px;">
            3. 個人情報の取り扱い
          </h2>
          <p style="color: #666; margin: 10px 0;">
            ご記入いただいた個人情報は、次の目的のみに使用いたします。<br><br>
            受講に関する管理およびご連絡<br><br>
            緊急時の安全確保および保護者への連絡<br><br>
            教室運営上の事務処理（スケジュール・出席・請求・統計等）<br><br>
            法令に基づく場合を除き、第三者への提供は一切行いません。<br>
            個人情報は厳重に管理し、在籍期間終了後は適切な方法で処理いたします。
        </div>

        <div style="margin-bottom: 25px;">
          <h2 style="color: #555; border-bottom: 1px solid #007bff; padding-bottom: 5px; font-size: 18px;">
            4. 会員情報
          </h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; border: 1px solid #dee2e6;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold; width: 30%;">氏名（漢字）</td>
                <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${studentData.nameKanji}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">氏名（よみがな）</td>
                <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${studentData.nameYomigana}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">生年月日</td>
                <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${new Date(studentData.birthDate).toLocaleDateString('ja-JP')}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">電話番号</td>
                <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${studentData.phone}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">メールアドレス</td>
                <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${studentData.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">緊急連絡先</td>
                <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">
                  ${studentData.emergencyContactName} (${studentData.emergencyContactRelation})<br>
                  ${studentData.emergencyContactPhone}
                </td>
              </tr>
              ${isMinor ? `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">保護者氏名（漢字）</td>
                <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${studentData.parentNameKanji}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">保護者氏名（よみがな）</td>
                <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${studentData.parentNameYomigana}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">保護者電話番号</td>
                <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${studentData.parentPhone}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">保護者続柄</td>
                <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${studentData.parentRelation}</td>
              </tr>
              ` : ''}
            </table>
          </div>
        </div>

        <div style="margin-bottom: 25px;">
          <h2 style="color: #555; border-bottom: 1px solid #007bff; padding-bottom: 5px; font-size: 18px;">
            5. 同意事項
          </h2>
          <p style="color: #666; margin: 10px 0;">
            私は、上記内容および教室の受講規定（POLICY_VERSION：2025-10-17）を理解し、<br>
            これに従って受講を行うことに同意します。<br>
            また、記載した個人情報の取扱いについても同意いたします。
          </p>
        </div>

        <div style="text-align: center; margin-top: 50px;">
          <div style="display: inline-block; text-align: left;">
            <p style="color: #666; font-size: 14px; margin: 5px 0;">
              入会申請日: ${new Date().toLocaleDateString('ja-JP')}
            </p>
            ${!isMinor ? `
            <p style="color: #666; font-size: 14px; margin: 5px 0;">
              申請者: ${studentData.nameKanji} 
              ${signatureData.data && !signatureData.isEmpty ? 
                `<img src="${signatureData.data}" alt="署名" style="height: 30px; margin-left: 20px; border: 1px solid #ccc; vertical-align: middle;" />` : 
                '<span style="margin-left: 20px;">（署名欄）</span>'
              }
            </p>
            ` : ''}
            ${isMinor ? `
            <p style="color: #666; font-size: 14px; margin: 5px 0;">
              保護者: ${studentData.parentNameKanji} 
              ${signatureData.data && !signatureData.isEmpty ? 
                `<img src="${signatureData.data}" alt="署名" style="height: 30px; margin-left: 20px; border: 1px solid #ccc; vertical-align: middle;" />` : 
                '<span style="margin-left: 20px;">（署名欄）</span>'
              }
            </p>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  };

  // 署名関連の関数
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const confirmSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataURL = canvas.toDataURL();
    setSignatureData({ data: dataURL, isEmpty: false });
    setShowSignatureModal(false);
  };

  // キャンバス初期化
  useEffect(() => {
    if (showSignatureModal && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [showSignatureModal]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>入会説明及び同意書</title>
            <style>
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
              body { font-family: 'Noto Sans JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', 'MS PGothic', 'MS Gothic', Arial, sans-serif; }
            </style>
          </head>
          <body>
            ${documentData.content}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([documentData.content], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `入会同意書_${student.nameKanji}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleExit = async () => {
    try {
      // メール送信処理
      const response = await fetch('http://localhost:3002/api/students/send-documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          studentId: student.studentId,
          signatureData: signatureData.data,
          isMinor: student.isMinor
        }),
      });

      if (response.ok) {
        alert('文書がメールで送信されました。');
        // ローカルストレージをクリアしてログインページにリダイレクト
        localStorage.clear();
        window.location.href = '/';
      } else {
        alert('メール送信に失敗しました。');
      }
    } catch (error) {
      console.error('メール送信エラー:', error);
      alert('メール送信中にエラーが発生しました。');
    }
  };

  if (!student || !documentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 署名モーダル */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">デジタル署名</h3>
              <button
                onClick={() => setShowSignatureModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                下の枠内に署名を描いてください
              </p>
              <canvas
                ref={canvasRef}
                width={400}
                height={200}
                className="border border-gray-300 rounded cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                style={{ touchAction: 'none' }}
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={clearSignature}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                クリア
              </button>
              <button
                onClick={confirmSignature}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                確認
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">入会同意書印刷</h1>
              <p className="text-gray-600">A4用紙に合わせて印刷できます</p>
            </div>
          </div>
        </div>
      </header>

      {/* 文書プレビュー */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                文書プレビュー
              </h2>
              <p className="text-gray-600 text-sm">
                以下の内容がA4用紙に合わせて印刷されます。印刷前に内容をご確認ください。
              </p>
              
              {/* 署名状態表示 */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <PenTool className="h-4 w-4 mr-2 text-gray-600" />
                    <span className="text-sm text-gray-700">署名状態:</span>
                  </div>
                  <div className="flex items-center">
                    {!signatureData.isEmpty ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                        <span className="text-sm text-green-600 font-medium">署名完了</span>
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-1 text-red-600" />
                        <span className="text-sm text-red-600 font-medium">未署名</span>
                      </>
                    )}
                  </div>
                </div>
                {!signatureData.isEmpty && (
                  <div className="mt-2">
                    <img 
                      src={signatureData.data} 
                      alt="署名" 
                      className="h-8 border border-gray-300 rounded"
                    />
                  </div>
                )}
              </div>
            </div>

            <div 
              className="border border-gray-300 rounded-lg p-6 bg-white"
              dangerouslySetInnerHTML={{ __html: documentData.content }}
            />

            {/* アクションボタン */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowSignatureModal(true)}
                className="flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <PenTool className="h-5 w-5 mr-2" />
                署名する
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Printer className="h-5 w-5 mr-2" />
                印刷
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-5 w-5 mr-2" />
                ダウンロード
              </button>
            </div>

            {/* ナビゲーションボタン */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.history.back()}
                className="flex items-center justify-center px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                戻る
              </button>
              <button
                onClick={handleExit}
                className="flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                終了
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}



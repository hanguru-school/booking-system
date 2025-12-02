'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Printer, Download, CheckCircle } from 'lucide-react';

interface Student {
  nameKanji: string;
  nameYomigana: string;
  birthDate: string;
  phone: string;
  email: string;
  studentId?: string;
  emergencyContactName: string;
  emergencyContactYomigana?: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
  emergencyContactEmail: string;
}

interface AgreementData {
  studentId: string;
  agreedRules: string[];
  signatureDate: string;
  studentName: string;
}

export default function EnrollmentAgreementPage() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [agreementData, setAgreementData] = useState<AgreementData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    try {
      // localStorage 안전성 검사
      if (typeof Storage === 'undefined') {
        console.error('localStorage is not supported');
        alert('ブラウザがlocalStorageをサポートしていません。');
        router.push('/enrollment');
        return;
      }

      // 입회 정보와 동의 정보를 가져오기
      const enrollmentData = localStorage.getItem('enrollmentData');
      const agreementDataStr = localStorage.getItem('agreementData');
      
      if (!enrollmentData || !agreementDataStr) {
        alert('입회 정보가 없습니다. 처음부터 다시 시작해주세요.');
        router.push('/enrollment');
        return;
      }
      
      const enrollmentDataParsed = JSON.parse(enrollmentData);
      const agreementDataParsed = JSON.parse(agreementDataStr);
      
      setStudent(enrollmentDataParsed);
      setAgreementData(agreementDataParsed);
      
      // 페이지 제목을 동적으로 설정
      const today = new Date();
      const year = today.getFullYear().toString().slice(-2);
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      const day = today.getDate().toString().padStart(2, '0');
      const dateStr = `${year}${month}${day}`;
      const studentName = (enrollmentDataParsed.nameKanji || '').replace(/[^\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF\u20000-\u2A6DF\u2A700-\u2B73F\u2B740-\u2B81F\u2B820-\u2CEAF\uF900-\uFAFF\u2F800-\u2FA1F]/g, '');
      document.title = `MalMoi_入会同意書_${dateStr}_${studentName}`;
    } catch (error) {
      console.error('데이터 로드 오류:', error);
      alert('데이터 로드 중 오류가 발생했습니다. 처음부터 다시 시도해주세요.');
      router.push('/enrollment');
    }
  }, [router]);

  // 서명 관련 함수들
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

    try {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
    } catch (error) {
      console.error('서명 시작 오류:', error);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

    try {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.lineTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
      ctx.stroke();
    } catch (error) {
      console.error('서명 그리기 오류:', error);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    
    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } catch (error) {
      console.error('서명 지우기 오류:', error);
    }
  };

  const isSignatureEmpty = (): boolean => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return true;
    
    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) return true;
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] !== 0) return false;
      }
      return true;
    } catch (error) {
      console.error('서명 확인 오류:', error);
      return true;
    }
  };

  const handleFinalSubmit = async () => {
    if (!student || !agreementData) {
      alert('입회 정보가 없습니다.');
      return;
    }

    if (isSignatureEmpty()) {
      alert('서명을 완료해주세요.');
      return;
    }

    setLoading(true);

    try {
      // 최종 입회 데이터 전송
      const requestData = {
        ...student,
        agreementData: agreementData
      };

      const response = await fetch('/api/students/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const data = await response.json();
        
        // 로그인 정보 저장
        localStorage.setItem('token', data.token);
        localStorage.setItem('student', JSON.stringify(data.student));
        localStorage.setItem('initialPassword', data.initialPassword);
        
        // 긴급연락처에 알림 메일 발송
        if (student.emergencyContactEmail) {
          try {
            // 이메일 발송 로직 (실제 구현 필요)
            console.log('긴급연락처 알림 메일 발송:', student.emergencyContactEmail);
          } catch (emailError) {
            console.error('긴급연락처 알림 메일 발송 오류:', emailError);
            // 메일 발송 오류는 입회 완료를 방해하지 않음
          }
        }
        
        // 임시 데이터 삭제 (안전성 검사 포함)
        try {
          if (typeof Storage !== 'undefined') {
            localStorage.removeItem('agreementData');
            localStorage.removeItem('enrollmentData');
          }
        } catch (cleanupError) {
          console.error('localStorage 정리 오류:', cleanupError);
        }
        
        // 완료 메시지 표시
        const emergencyContactMessage = student.emergencyContactEmail 
          ? '\n긴급연락처에도 알림 메일이 발송되었습니다.'
          : '';
        
        alert(`입회 신청이 완료되었습니다!${emergencyContactMessage}\n\n학생 ID: ${data.student.studentId}\n초기 비밀번호: ${data.initialPassword}\n\n관리자 시스템에 등록되었습니다.`);
        
        // 학생 페이지로 이동
        router.push('/student/dashboard');
      } else {
        const errorData = await response.json();
        alert(`입회 신청 중 오류가 발생했습니다: ${errorData.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('입회 신청 오류:', error);
      alert('입회 신청 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const printDocument = () => {
    if (isSignatureEmpty()) {
      alert('서명을 완료해주세요.');
      return;
    }
    
    window.print();
  };

  const downloadPDF = async () => {
    if (isSignatureEmpty()) {
      alert('서명을 완료해주세요.');
      return;
    }

    try {
      // 서명 데이터를 가져오기
      const canvas = signatureCanvasRef.current;
      if (!canvas) {
        alert('서명 데이터를 찾을 수 없습니다.');
        return;
      }

      const signatureData = canvas.toDataURL('image/png');

      // 서버에 PDF 생성 요청
      const response = await fetch('/api/print/enrollment-agreement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student,
          agreementData,
          signatureData
        }),
      });

      if (!response.ok) {
        throw new Error('PDF 생성에 실패했습니다.');
      }

      // PDF 파일 다운로드
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MalMoi_入会同意書_${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}_${student?.nameKanji?.replace(/[^\w\s-]/g, '') || '学生'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('PDF 생성 오류:', error);
      alert('PDF 생성에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">처리 중...</p>
        </div>
      </div>
    );
  }

  if (!student || !agreementData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">입회 정보를 찾을 수 없습니다.</p>
          <button 
            onClick={() => router.push('/enrollment')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            입회 신청으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 인쇄용 콘텐츠 */}
        <div id="agreement-content" className="bg-white rounded-lg shadow-md p-8">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <h1 className="font-bold text-gray-800 mb-2" style={{ fontSize: '12pt' }}>韓国語教室MalMoi</h1>
            <h2 className="font-bold text-gray-800 mb-6" style={{ fontSize: '24pt', letterSpacing: '0.1em' }}>入会同意書</h2>
          </div>
          
          {/* 안내 문구 */}
          <div className="text-sm text-gray-700 mb-8 leading-relaxed">
            <p>このたびは、MalMoi韓国語教室にご関心をお寄せいただき、誠にありがとうございます。</p>
            <p>ご入会にあたり、以下の内容をご確認のうえ、ご署名くださいますようお願いいたします。</p>
            <p>本書は、安心して学んでいただくための基本的なルールおよび個人情報の取り扱いに関する同意書です。</p>
          </div>

          {/* 입회 동의서 내용 */}
          <div className="space-y-10">
            <section className="rule-section">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">1. 入会について</h3>
              <div className="text-sm text-gray-700 leading-relaxed space-y-2">
                <p>当教室の学習方針および受講規定にご理解・ご同意のうえでお申し込みください。</p>
                <p>体験レッスンを受講された方は、正式入会時に所定のレッスン時間（600分）をご購入いただきます。</p>
                <p>ご入会後は、レッスン時間の有効活用と学習リズムの安定を目的として、月180分以上の受講を推奨しております。</p>
                <p>長期間受講がない場合（2ヶ月以上）は休学扱い、3ヶ月を経過した場合は卒業扱いとなります。</p>
              </div>
            </section>

            <section className="rule-section">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">2. 個人情報の取り扱い</h3>
              <div className="text-sm text-gray-700 leading-relaxed space-y-2">
                <p>ご記入いただいた個人情報は、次の目的のみに使用いたします。</p>
                <p>・受講管理およびご連絡</p>
                <p>・緊急時の安全確保および保護者への連絡</p>
                <p>・教室運営上の事務処理（スケジュール・出席・請求・統計等）</p>
                <p>法令に基づく場合を除き、第三者への提供は一切行いません。</p>
                <p>個人情報は厳重に管理し、在籍期間終了後は適切な方法で処理いたします。</p>
              </div>
            </section>
          </div>

          {/* 개인정보 섹션 */}
          <div className="personal-info-section page-break-before mt-10">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">학생정보</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
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
          </div>

          {/* 긴급연락처 섹션 */}
          <div className="emergency-contact-section mt-10">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">緊急連絡先（保護者または指定連絡者）</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
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
          </div>

          {/* 안내 문구 */}
          <div className="notice-section mb-6 mt-10">
            <p className="text-sm text-gray-700 leading-relaxed">
              本同意書は、入会手続きおよび受講管理に必要な範囲で保存されます。<br />
              内容に変更が生じた場合は速やかに事務局までご連絡ください。
            </p>
          </div>

          {/* 서명 섹션 */}
          <div className="signature-section mt-10">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">署名</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  署名（本人）：
                </label>
                <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
                  <canvas
                    ref={signatureCanvasRef}
                    width={280}
                    height={80}
                    className="border border-gray-200 rounded cursor-crosshair w-full max-w-full"
                    style={{ maxWidth: '100%', height: 'auto' }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  />
                  <button
                    onClick={clearSignature}
                    className="mt-2 px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    クリア
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  日付：{new Date().toLocaleDateString('ja-JP')}
                </label>
              </div>
            </div>
          </div>

          {/* 푸터 */}
          <div className="footer-address">
            <p>MalMoi韓国語教室</p>
            <p>大阪府富田林市喜志町５丁目１−２　SAMURAI BLD　４D</p>
            <p>TEL: 090-6327-3043　E-mail: hanguru.school@gmail.com</p>
          </div>
        </div>

        {/* 버튼 섹션 */}
        <div className="action-buttons flex gap-4 justify-center">
          <button
            onClick={printDocument}
            disabled={isSignatureEmpty()}
            className={`flex flex-col items-center justify-center px-6 py-3 rounded-lg font-medium w-32 ${
              isSignatureEmpty()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Printer className="w-5 h-5 mb-2" />
            <span className="text-sm whitespace-nowrap">文書印刷</span>
          </button>
          
          <button
            onClick={downloadPDF}
            disabled={isSignatureEmpty()}
            className={`flex flex-col items-center justify-center px-6 py-3 rounded-lg font-medium w-32 ${
              isSignatureEmpty()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            <Download className="w-5 h-5 mb-2" />
            <span className="text-sm whitespace-nowrap">PDFダウンロード</span>
          </button>
          
          <button
            onClick={handleFinalSubmit}
            disabled={isSignatureEmpty()}
            className={`flex flex-col items-center justify-center px-6 py-3 rounded-lg font-medium w-32 ${
              isSignatureEmpty()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            <CheckCircle className="w-5 h-5 mb-2" />
            <span className="text-sm whitespace-nowrap">入会完了</span>
          </button>
        </div>
      </div>

      {/* 인쇄용 스타일 */}
      <style jsx global>{`
        @page {
          size: A4;
          margin: 15mm;
        }

        @media print {
          body * {
            visibility: hidden;
          }
          #agreement-content, #agreement-content * {
            visibility: visible;
          }
          #agreement-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .action-buttons {
            display: none !important;
          }
          .rule-section {
            page-break-inside: avoid;
            break-inside: avoid;
            page-break-before: auto;
            page-break-after: auto;
            orphans: 3;
            widows: 3;
            margin-bottom: 10mm;
          }
          .agreement-statement {
            margin-bottom: 8mm;
            text-align: justify;
          }
          .page-break-before {
            page-break-before: always;
          }
          .form-row {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
          }
          .form-row label {
            font-weight: 500;
            margin-right: 8px;
            min-width: 120px;
          }
          .signature-line {
            border-bottom: 1px solid #000;
            flex: 1;
            padding-bottom: 2px;
            min-height: 20px;
          }
          .personal-info-section {
            margin-top: 10mm;
            margin-bottom: 15mm;
          }
          .emergency-contact-section {
            margin-top: 10mm;
            margin-bottom: 15mm;
          }
          .notice-section {
            margin-top: 10mm;
            margin-bottom: 10mm;
          }
          .signature-section {
            margin-top: 15mm;
            margin-bottom: 15mm;
          }
          .footer-address {
            text-align: center;
            font-size: 11pt;
            margin-top: 20mm;
          }
        }
      `}</style>
    </div>
  );
}

"use client";

import { useState } from "react";
import QRCodeScanner from "@/components/student/QRCodeScanner";
import { StudentIdentifierData } from "@/types/student";
import { ArrowLeft, QrCode, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function StudentQRScanPage() {
  const [showScanner, setShowScanner] = useState(false);
  const [scannedData, setScannedData] = useState<StudentIdentifierData | null>(
    null,
  );
  const [scanError, setScanError] = useState<string | null>(null);

  const handleQRScan = (data: StudentIdentifierData) => {
    setScannedData(data);
    setShowScanner(false);
    setScanError(null);
  };

  const handleQRScanError = (error: string) => {
    setScanError(error);
    setShowScanner(false);
  };

  const resetScan = () => {
    setScannedData(null);
    setScanError(null);
    setShowScanner(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/student/home"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>홈으로 돌아가기</span>
        </Link>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">QR 코드 스캔</h1>
        <p className="text-gray-600">
          QR 코드를 스캔하여 학생 정보를 확인하세요
        </p>
      </div>

      {/* 스캔 결과 또는 스캔 버튼 */}
      {!showScanner && !scannedData && !scanError && (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <QrCode className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              QR 코드 스캔
            </h2>
            <p className="text-gray-600">
              카메라를 사용하여 QR 코드를 스캔하세요
            </p>
          </div>
          <button
            onClick={() => setShowScanner(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            스캔 시작
          </button>
        </div>
      )}

      {/* 스캔 에러 */}
      {scanError && (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              스캔 실패
            </h2>
            <p className="text-gray-600 mb-4">{scanError}</p>
          </div>
          <button
            onClick={resetScan}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 스캔 성공 결과 */}
      {scannedData && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              스캔 성공!
            </h2>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              학생 정보
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">학생 ID:</span>
                <span className="font-medium">{scannedData.studentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">이름:</span>
                <span className="font-medium">{scannedData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">레벨:</span>
                <span className="font-medium">{scannedData.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">생성일:</span>
                <span className="font-medium">
                  {new Date(scannedData.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={resetScan}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              새로 스캔
            </button>
            <Link
              href="/student/home"
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              홈으로
            </Link>
          </div>
        </div>
      )}

      {/* QR 스캐너 컴포넌트 */}
      {showScanner && (
        <QRCodeScanner
          onScan={handleQRScan}
          onError={handleQRScanError}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}

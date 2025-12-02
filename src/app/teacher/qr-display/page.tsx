"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, QrCode, X, Maximize2 } from "lucide-react";

export default function TeacherQRDisplayPage() {
  const [qrCodeData, setQrCodeData] = useState<string>("");
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [teacherInfo, setTeacherInfo] = useState<{
    id: string;
    name: string;
    department: string;
  } | null>(null);

  useEffect(() => {
    // 실제로는 API에서 선생님 정보를 가져와야 함
    const mockTeacherInfo = {
      id: "T-001",
      name: "김선생님",
      department: "한국어 교육",
    };
    setTeacherInfo(mockTeacherInfo);

    // QR코드 데이터 생성 (선생님 prefix: T-)
    const qrData = `T-${mockTeacherInfo.id}-${Date.now()}`;
    setQrCodeData(qrData);
  }, []);

  const generateNewQR = () => {
    if (teacherInfo) {
      const newQrData = `T-${teacherInfo.id}-${Date.now()}`;
      setQrCodeData(newQrData);
    }
  };

  if (!teacherInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/teacher/home"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>뒤로가기</span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">QR코드 표시</h1>
            <p className="text-gray-600">선생님 전용 QR코드를 표시합니다</p>
          </div>
        </div>
      </div>

      {/* QR코드 표시 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">QR코드</h2>
          <button
            onClick={() => setShowFullScreen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
            코드 보이기
          </button>
        </div>

        <div className="flex flex-col items-center space-y-4">
          {/* QR코드 이미지 (실제로는 QR 라이브러리 사용) */}
          <div className="w-64 h-64 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">QR코드 이미지</p>
              <p className="text-xs text-gray-400 mt-1">{qrCodeData}</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">QR코드 데이터</p>
            <p className="font-mono text-sm bg-gray-100 p-2 rounded mt-1">
              {qrCodeData}
            </p>
          </div>
        </div>
      </div>

      {/* 선생님 정보 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          선생님 정보
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              선생님 ID
            </label>
            <p className="text-lg font-semibold text-gray-900">
              {teacherInfo.id}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              이름
            </label>
            <p className="text-lg font-semibold text-gray-900">
              {teacherInfo.name}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              부서
            </label>
            <p className="text-lg font-semibold text-gray-900">
              {teacherInfo.department}
            </p>
          </div>
        </div>
      </div>

      {/* 사용 안내 */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-900 mb-2">QR코드 사용 안내</h3>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• 이 QR코드는 선생님 전용으로 생성되었습니다 (접두사: T-)</li>
          <li>• 출근/퇴근 시 태깅 시스템에서 사용하세요</li>
          <li>• 보안을 위해 주기적으로 새로고침하세요</li>
          <li>• 다른 사람과 공유하지 마세요</li>
        </ul>
      </div>

      {/* 전체화면 QR코드 모달 */}
      {showFullScreen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                QR코드 전체화면
              </h2>
              <button
                onClick={() => setShowFullScreen(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col items-center space-y-6">
              {/* 큰 QR코드 이미지 */}
              <div className="w-96 h-96 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <QrCode className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg text-gray-500">QR코드 이미지</p>
                  <p className="text-sm text-gray-400 mt-2">{qrCodeData}</p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-lg text-gray-600 mb-2">QR코드 데이터</p>
                <p className="font-mono text-lg bg-gray-100 p-4 rounded-lg">
                  {qrCodeData}
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={generateNewQR}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  새로고침
                </button>
                <button
                  onClick={() => setShowFullScreen(false)}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

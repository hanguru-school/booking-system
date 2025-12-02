"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Download, RefreshCw, QrCode, Shield } from "lucide-react";

export default function AdminQRDisplayPage() {
  const [qrCodeData, setQrCodeData] = useState<string>("");
  const [adminInfo, setAdminInfo] = useState<{
    id: string;
    name: string;
    role: string;
    permissions: string[];
  } | null>(null);

  useEffect(() => {
    // 실제로는 API에서 관리자 정보를 가져와야 함
    const mockAdminInfo = {
      id: "A-001",
      name: "관리자",
      role: "시스템 관리자",
      permissions: ["전체 관리", "사용자 관리", "시스템 설정", "데이터 관리"],
    };
    setAdminInfo(mockAdminInfo);

    // QR코드 데이터 생성 (관리자 prefix: A-)
    const qrData = `A-${mockAdminInfo.id}-${Date.now()}`;
    setQrCodeData(qrData);
  }, []);

  const generateNewQR = () => {
    if (adminInfo) {
      const newQrData = `A-${adminInfo.id}-${Date.now()}`;
      setQrCodeData(newQrData);
    }
  };

  const downloadQR = () => {
    // QR코드 이미지 다운로드 로직
    alert("QR코드가 다운로드되었습니다.");
  };

  if (!adminInfo) {
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
            href="/admin/home"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>뒤로가기</span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">QR코드 표시</h1>
            <p className="text-gray-600">관리자 전용 QR코드를 표시합니다</p>
          </div>
        </div>
      </div>

      {/* 관리자 정보 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-600" />
          관리자 정보
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              관리자 ID
            </label>
            <p className="text-lg font-semibold text-gray-900">
              {adminInfo.id}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              이름
            </label>
            <p className="text-lg font-semibold text-gray-900">
              {adminInfo.name}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              역할
            </label>
            <p className="text-lg font-semibold text-gray-900">
              {adminInfo.role}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            권한
          </label>
          <div className="flex flex-wrap gap-2">
            {adminInfo.permissions.map((permission, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full"
              >
                {permission}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* QR코드 표시 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">QR코드</h2>
          <div className="flex gap-2">
            <button
              onClick={generateNewQR}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              새로고침
            </button>
            <button
              onClick={downloadQR}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              다운로드
            </button>
          </div>
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

      {/* 사용 안내 */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="font-semibold text-red-900 mb-2">QR코드 사용 안내</h3>
        <ul className="text-sm text-red-800 space-y-1">
          <li>• 이 QR코드는 관리자 전용으로 생성되었습니다 (접두사: A-)</li>
          <li>• 출근/퇴근 시 태깅 시스템에서 사용하세요</li>
          <li>• 보안을 위해 주기적으로 새로고침하세요</li>
          <li>• 다른 사람과 공유하지 마세요</li>
          <li>• 관리자 권한이므로 보안에 특히 주의하세요</li>
        </ul>
      </div>
    </div>
  );
}

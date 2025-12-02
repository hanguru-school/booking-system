"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageCircle, CheckCircle } from "lucide-react";

export default function StudentLineSettingsPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [lineId, setLineId] = useState("");

  const handleConnect = () => {
    // LINE 연동 로직
    setIsConnected(true);
    setLineId("student123");
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setLineId("");
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
        <h1 className="text-3xl font-bold text-gray-900 mb-4">LINE 연동</h1>
        <p className="text-gray-600">LINE과 연동하여 수업 알림을 받아보세요</p>
      </div>

      {/* LINE 연동 상태 */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-center mb-6">
          <MessageCircle className="w-16 h-16 text-green-600" />
        </div>

        {isConnected ? (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                LINE 연동 완료
              </h2>
            </div>
            <p className="text-gray-600 mb-6">
              LINE ID: <span className="font-medium">{lineId}</span>
            </p>
            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">연동된 기능</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• 수업 일정 알림</li>
                  <li>• 레슨노트 업로드 알림</li>
                  <li>• 숙제 등록 알림</li>
                  <li>• 선생님 메시지</li>
                </ul>
              </div>
              <button
                onClick={handleDisconnect}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                연동 해제
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              LINE 연동하기
            </h2>
            <p className="text-gray-600 mb-6">
              LINE과 연동하면 수업 관련 알림을 실시간으로 받을 수 있습니다.
            </p>
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">
                  연동 시 제공되는 기능
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 수업 일정 알림</li>
                  <li>• 레슨노트 업로드 알림</li>
                  <li>• 숙제 등록 알림</li>
                  <li>• 선생님 메시지</li>
                </ul>
              </div>
              <button
                onClick={handleConnect}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <MessageCircle className="w-5 h-5" />
                LINE 연동하기
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 연동 가이드 */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">연동 방법</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
              1
            </div>
            <div>
              <p className="text-gray-900">
                LINE 앱에서 학교 공식 계정을 추가합니다.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
              2
            </div>
            <div>
              <p className="text-gray-900">
                위의 "LINE 연동하기" 버튼을 클릭합니다.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
              3
            </div>
            <div>
              <p className="text-gray-900">
                LINE에서 인증 메시지를 확인하고 승인합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

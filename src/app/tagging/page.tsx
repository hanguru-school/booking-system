"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Tablet,
  Smartphone,
  Monitor,
  QrCode,
  ArrowRight,
  Settings,
  BarChart3,
  Users,
} from "lucide-react";

export default function TaggingMainPage() {
  const router = useRouter();
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [location, setLocation] = useState("교실 A");

  const handleDeviceSelect = (device: string) => {
    setSelectedDevice(device);
  };

  const handleStartTagging = () => {
    if (!selectedDevice) return;

    if (selectedDevice === "tablet") {
      router.push(`/tagging/tablet?device=ipad&location=${location}`);
    } else if (selectedDevice === "mobile") {
      // 모바일의 경우 UID를 시뮬레이션
      const uid = `mobile_${Date.now()}`;
      router.push(`/tagging/mobile?uid=${uid}&location=${location}`);
    }
  };

  const devices = [
    {
      id: "tablet",
      name: "iPad 태깅",
      description: "iPad 또는 Mac에서 사용하는 태깅 인터페이스",
      icon: Tablet,
      color: "blue",
    },
    {
      id: "mobile",
      name: "스마트폰 태깅",
      description: "iPhone 또는 Android에서 FeliCa/NFC 사용",
      icon: Smartphone,
      color: "green",
    },
    {
      id: "desktop",
      name: "데스크톱 태깅",
      description: "Mac 또는 PC에서 사용하는 태깅 인터페이스",
      icon: Monitor,
      color: "purple",
    },
  ];

  const getDeviceIcon = (device: any) => {
    const IconComponent = device.icon;
    return <IconComponent className={`w-8 h-8 text-${device.color}-600`} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-6">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <QrCode className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              UID 태깅 시스템
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            IC카드 및 스마트폰을 통한 출석 체크 및 관리 시스템
          </p>
        </div>

        {/* 디바이스 선택 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            디바이스 선택
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {devices.map((device) => (
              <button
                key={device.id}
                onClick={() => handleDeviceSelect(device.id)}
                className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                  selectedDevice === device.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-4">
                  {getDeviceIcon(device)}
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">
                      {device.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {device.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* 위치 설정 */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              태깅 위치
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="교실 A">교실 A</option>
              <option value="교실 B">교실 B</option>
              <option value="교실 C">교실 C</option>
              <option value="1층 로비">1층 로비</option>
              <option value="2층 로비">2층 로비</option>
              <option value="사무실">사무실</option>
            </select>
          </div>

          {/* 시작 버튼 */}
          <button
            onClick={handleStartTagging}
            disabled={!selectedDevice}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            태깅 시작하기
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* 기능 설명 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-8 h-8 text-green-600" />
              <h3 className="text-xl font-semibold text-gray-900">학생 태깅</h3>
            </div>
            <ul className="space-y-2 text-gray-600">
              <li>• 예약 확인 및 출석 처리</li>
              <li>• 포인트 자동 적립</li>
              <li>• 정기권/쿠폰 사용</li>
              <li>• 중복 태깅 방지</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-8 h-8 text-orange-600" />
              <h3 className="text-xl font-semibold text-gray-900">직원 태깅</h3>
            </div>
            <ul className="space-y-2 text-gray-600">
              <li>• 출근/퇴근 기록</li>
              <li>• 자동 퇴근 처리</li>
              <li>• 교통비 계산</li>
              <li>• 근무 시간 관리</li>
            </ul>
          </div>
        </div>

        {/* 관리 링크 */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            관리 기능
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push("/admin/tagging-management")}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">태깅 관리</div>
                <div className="text-sm text-gray-600">로그 및 통계</div>
              </div>
            </button>

            <button
              onClick={() => router.push("/admin/uid-management")}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="w-6 h-6 text-green-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">UID 관리</div>
                <div className="text-sm text-gray-600">등록 및 연결</div>
              </div>
            </button>

            <button
              onClick={() => router.push("/admin/passport-management")}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <QrCode className="w-6 h-6 text-purple-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">정기권 관리</div>
                <div className="text-sm text-gray-600">구매 및 사용</div>
              </div>
            </button>
          </div>
        </div>

        {/* 사용 가이드 */}
        <div className="bg-blue-50 rounded-2xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            사용 가이드
          </h3>
          <div className="space-y-2 text-blue-800">
            <p>• IC카드나 스마트폰을 기기에 가져다 대면 자동으로 태깅됩니다</p>
            <p>• 신규 사용자는 UID 등록 후 사용자 정보를 입력해야 합니다</p>
            <p>
              • 태깅 시 예약 상태, 정기권 잔여량, 포인트 적립이 자동으로
              처리됩니다
            </p>
            <p>
              • 관리자는 태깅 관리 페이지에서 모든 로그와 통계를 확인할 수
              있습니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

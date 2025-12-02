"use client";

import { useState, useEffect } from "react";
import { Save, Home, Clock, Repeat, CheckCircle } from "lucide-react";
import Link from "next/link";

interface TaggingSettings {
  checkoutThreshold: number;
  maxReTags: number;
}

export default function TaggingSettingsPage() {
  const [settings, setSettings] = useState<TaggingSettings>({
    checkoutThreshold: 30,
    maxReTags: 3,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 설정 조회
  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/tagging/settings");
      const data = await response.json();

      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error("설정 조회 실패:", error);
    }
  };

  // 설정 저장
  const saveSettings = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch("/api/tagging/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("설정이 성공적으로 저장되었습니다");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("설정 저장 실패");
      }
    } catch (error) {
      setMessage("설정 저장 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">태깅 설정</h1>
            <p className="text-lg text-gray-600">태깅 처리 조건 및 규칙 설정</p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            메인으로
          </Link>
        </div>

        {/* 메시지 */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.includes("성공")
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {message}
            </div>
          </div>
        )}

        {/* 설정 폼 */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            태깅 처리 설정
          </h2>

          <div className="space-y-8">
            {/* 출퇴근 분기 기준 */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-medium text-gray-900">
                  출퇴근 분기 기준
                </h3>
              </div>
              <div className="ml-9">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  분 단위 기준
                </label>
                <input
                  type="number"
                  value={settings.checkoutThreshold}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      checkoutThreshold: parseInt(e.target.value) || 30,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="1"
                  max="60"
                />
                <p className="text-sm text-gray-500 mt-2">
                  출석과 퇴근을 구분하는 시간 기준 (1-60분)
                </p>
              </div>
            </div>

            {/* 최대 연속 태깅 횟수 */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center gap-3 mb-4">
                <Repeat className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-medium text-gray-900">
                  최대 연속 태깅 횟수
                </h3>
              </div>
              <div className="ml-9">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  횟수 제한
                </label>
                <input
                  type="number"
                  value={settings.maxReTags}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maxReTags: parseInt(e.target.value) || 3,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="1"
                  max="10"
                />
                <p className="text-sm text-gray-500 mt-2">
                  연속으로 태그할 수 있는 최대 횟수 (1-10회)
                </p>
              </div>
            </div>

            {/* 저장 버튼 */}
            <div className="pt-4">
              <button
                onClick={saveSettings}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 text-lg font-medium"
              >
                <Save className="w-6 h-6" />
                {loading ? "저장 중..." : "설정 저장"}
              </button>
            </div>
          </div>
        </div>

        {/* 설명 섹션 */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            설정 설명
          </h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong>출퇴근 분기 기준:</strong> 같은 날에 출석과 퇴근을
                구분하는 시간 기준입니다. 예를 들어 30분으로 설정하면, 오전
                9시에 태그하면 출석, 오후 6시에 태그하면 퇴근으로 기록됩니다.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Repeat className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong>최대 연속 태깅 횟수:</strong> 짧은 시간 내에 같은
                사용자가 연속으로 태그할 수 있는 횟수를 제한합니다. 이는 실수로
                중복 태그하는 것을 방지하고 시스템 안정성을 높입니다.
              </div>
            </div>
          </div>
        </div>

        {/* 관리자 링크 */}
        <div className="mt-8 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/admin/tagging/logs"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              태깅 이력 보기
            </Link>
            <Link
              href="/tagging/home"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              태그 페이지로
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

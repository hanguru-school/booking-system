"use client";

import { useState } from "react";
import { Globe, ArrowLeft, Save, CheckCircle, Languages } from "lucide-react";
import Link from "next/link";

interface LanguageSettings {
  currentLanguage: "ko" | "ja";
  preferredLanguage: "ko" | "ja";
  autoDetect: boolean;
}

export default function StudentLanguageSettingsPage() {
  const [settings, setSettings] = useState<LanguageSettings>({
    currentLanguage: "ko",
    preferredLanguage: "ko",
    autoDetect: true,
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const languages = [
    {
      code: "ko",
      name: "한국어",
      nativeName: "한국어",
      flag: "🇰🇷",
      description: "한국어로 표시됩니다",
    },
    {
      code: "ja",
      name: "日本語",
      nativeName: "日本語",
      flag: "🇯🇵",
      description: "日本語で表示されます",
    },
  ];

  const handleLanguageChange = (language: "ko" | "ja") => {
    setSettings((prev) => ({
      ...prev,
      preferredLanguage: language,
    }));
  };

  const handleAutoDetectToggle = () => {
    setSettings((prev) => ({
      ...prev,
      autoDetect: !prev.autoDetect,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    // 실제 API 호출로 대체
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">언어 설정</h1>
            <p className="text-gray-600">언어를 선택하고 관리하세요</p>
          </div>
          <Link
            href="/student/profile"
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>돌아가기</span>
          </Link>
        </div>

        <div className="space-y-6">
          {/* 현재 언어 표시 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">현재 언어</h2>
            </div>

            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl">
                {
                  languages.find(
                    (lang) => lang.code === settings.currentLanguage,
                  )?.flag
                }
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {
                    languages.find(
                      (lang) => lang.code === settings.currentLanguage,
                    )?.name
                  }
                </h3>
                <p className="text-sm text-gray-600">
                  {
                    languages.find(
                      (lang) => lang.code === settings.currentLanguage,
                    )?.description
                  }
                </p>
              </div>
            </div>
          </div>

          {/* 언어 선택 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Languages className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">언어 선택</h2>
            </div>

            <div className="space-y-4">
              {languages.map((language) => (
                <div
                  key={language.code}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    settings.preferredLanguage === language.code
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() =>
                    handleLanguageChange(language.code as "ko" | "ja")
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{language.flag}</div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {language.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {language.nativeName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {language.description}
                        </p>
                      </div>
                    </div>
                    {settings.preferredLanguage === language.code && (
                      <CheckCircle className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 자동 감지 설정 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  브라우저 언어 자동 감지
                </h3>
                <p className="text-sm text-gray-600">
                  브라우저 설정에 따라 자동으로 언어를 감지합니다
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoDetect}
                  onChange={handleAutoDetectToggle}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Save className="w-5 h-5" />
              )}
              <span>{saving ? "저장 중..." : "저장"}</span>
            </button>
          </div>

          {/* 언어별 미리보기 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              언어별 미리보기
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🇰🇷</span>
                  <h4 className="font-medium">한국어</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <p>• 예약하기</p>
                  <p>• 내 예약</p>
                  <p>• 레슨 노트</p>
                  <p>• 숙제</p>
                  <p>• 단어장</p>
                </div>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🇯🇵</span>
                  <h4 className="font-medium">日本語</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <p>• 予約する</p>
                  <p>• マイ予約</p>
                  <p>• レッスンノート</p>
                  <p>• 宿題</p>
                  <p>• 単語帳</p>
                </div>
              </div>
            </div>
          </div>

          {/* 저장 완료 메시지 */}
          {saved && (
            <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>언어 설정이 저장되었습니다</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

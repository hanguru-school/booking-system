"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Clock,
  Bell,
  Zap,
  Palette,
  Smartphone,
  Languages,
  Download,
  Upload,
  RotateCcw,
  Home,
} from "lucide-react";
import Link from "next/link";

interface SystemSettings {
  device: {
    type: "mobile" | "tablet" | "desktop";
    uiScale: number;
    layout: "compact" | "normal" | "spacious";
    showAdvancedFeatures: boolean;
    priorityFeatures: string[];
  };
  language: {
    autoDetect: boolean;
    preferredLanguage: "ko" | "ja" | "en" | "zh";
    fallbackLanguage: "ko" | "ja" | "en" | "zh";
  };
  time: {
    timezone: string;
    dateFormat: "YYYY-MM-DD" | "MM/DD/YYYY" | "DD/MM/YYYY";
    timeFormat: "12h" | "24h";
    autoSync: boolean;
  };
  notifications: {
    email: {
      enabled: boolean;
      frequency: "immediate" | "daily" | "weekly";
      types: string[];
    };
    line: {
      enabled: boolean;
      frequency: "immediate" | "daily" | "weekly";
      types: string[];
    };
    push: {
      enabled: boolean;
      frequency: "immediate" | "daily" | "weekly";
      types: string[];
    };
    reminders: {
      beforeClass: number;
      afterClass: number;
      weekly: boolean;
      monthly: boolean;
    };
  };
  performance: {
    cacheEnabled: boolean;
    cacheTTL: number;
    imageCompression: boolean;
    audioCompression: boolean;
    lazyLoading: boolean;
    prefetchEnabled: boolean;
  };
  userPreferences: {
    theme: "light" | "dark" | "auto";
    fontSize: "small" | "medium" | "large";
    colorBlindMode: boolean;
    reducedMotion: boolean;
    quickAccess: string[];
    pinnedMenus: string[];
  };
  analytics: {
    enabled: boolean;
    trackUserBehavior: boolean;
    autoOptimize: boolean;
  };
}

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("device");
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState("");

  // 설정 조회
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/settings");
      const data = await response.json();

      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error("설정 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 설정 업데이트
  const updateSettings = async (updates: Partial<SystemSettings>) => {
    if (!settings) return;

    try {
      setLoading(true);
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...settings, ...updates }),
      });

      const data = await response.json();

      if (data.success) {
        setSettings({ ...settings, ...updates });
        alert("설정이 저장되었습니다");
      } else {
        alert(data.error || "설정 저장 실패");
      }
    } catch (error) {
      alert("설정 저장 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  // 자동 최적화 실행
  const runAutoOptimize = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "auto_optimize" }),
      });

      const data = await response.json();

      if (data.success) {
        alert("자동 최적화가 완료되었습니다");
        fetchSettings();
      } else {
        alert(data.error || "자동 최적화 실패");
      }
    } catch (error) {
      alert("자동 최적화 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  // 설정 초기화
  const resetSettings = async () => {
    if (!confirm("정말로 모든 설정을 초기화하시겠습니까?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "reset_settings" }),
      });

      const data = await response.json();

      if (data.success) {
        alert("설정이 초기화되었습니다");
        fetchSettings();
      } else {
        alert(data.error || "설정 초기화 실패");
      }
    } catch (error) {
      alert("설정 초기화 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  // 설정 내보내기
  const exportSettings = () => {
    if (!settings) return;

    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "system-settings.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setShowExportModal(false);
  };

  // 설정 가져오기
  const importSettings = async () => {
    try {
      const parsedSettings = JSON.parse(importData);
      await updateSettings(parsedSettings);
      setShowImportModal(false);
      setImportData("");
    } catch (error) {
      alert("잘못된 설정 파일입니다");
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading && !settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">設定を読み込めません</p>
          <button
            onClick={fetchSettings}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              시스템 설정
            </h1>
            <p className="text-lg text-gray-600">
              시스템 환경 최적화 및 사용자 설정 관리
            </p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            메인 페이지로
          </Link>
        </div>

        {/* 액션 버튼 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={runAutoOptimize}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Zap className="w-5 h-5" />
              자동 최적화
            </button>

            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              설정 내보내기
            </button>

            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Upload className="w-5 h-5" />
              설정 가져오기
            </button>

            <button
              onClick={resetSettings}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-5 h-5" />
              설정 초기화
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 탭 네비게이션 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                설정 카테고리
              </h2>
              <div className="space-y-2">
                {[
                  { id: "device", name: "기기 최적화", icon: Smartphone },
                  { id: "language", name: "언어 설정", icon: Languages },
                  { id: "time", name: "시간/날짜", icon: Clock },
                  { id: "notifications", name: "알림 설정", icon: Bell },
                  { id: "performance", name: "성능 최적화", icon: Zap },
                  { id: "preferences", name: "사용자 환경", icon: Palette },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 설정 내용 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-center py-8">
                <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">설정 내용이 여기에 표시됩니다</p>
              </div>
            </div>
          </div>
        </div>

        {/* 모달들 */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                설정 내보내기
              </h3>
              <p className="text-gray-600 mb-4">
                현재 시스템 설정을 JSON 파일로 다운로드합니다.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={exportSettings}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  내보내기
                </button>
              </div>
            </div>
          </div>
        )}

        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                설정 가져오기
              </h3>
              <p className="text-gray-600 mb-4">
                JSON 파일의 설정을 시스템에 적용합니다.
              </p>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="JSON 설정 데이터를 붙여넣으세요..."
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportData("");
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={importSettings}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  가져오기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

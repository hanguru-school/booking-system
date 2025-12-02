"use client";

import { useState } from "react";
import {
  MessageSquare,
  ArrowLeft,
  Save,
  CheckCircle,
  QrCode,
} from "lucide-react";
import Link from "next/link";

interface LineSettings {
  connected: boolean;
  notifications: {
    lessonReminders: boolean;
    homeworkDeadlines: boolean;
    teacherMessages: boolean;
    gradeUpdates: boolean;
  };
  autoReply: {
    enabled: boolean;
    message: string;
  };
}

export default function StudentLineSettingsPage() {
  const [settings, setSettings] = useState<LineSettings>({
    connected: false,
    notifications: {
      lessonReminders: true,
      homeworkDeadlines: true,
      teacherMessages: true,
      gradeUpdates: false,
    },
    autoReply: {
      enabled: false,
      message: "수업 중입니다. 나중에 연락드리겠습니다.",
    },
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleToggle = (
    category: keyof LineSettings["notifications"] | "enabled",
    value?: boolean,
  ) => {
    if (category === "enabled") {
      setSettings((prev) => ({
        ...prev,
        autoReply: {
          ...prev.autoReply,
          enabled: value || !prev.autoReply.enabled,
        },
      }));
    } else {
      setSettings((prev) => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [category]: !prev.notifications[category],
        },
      }));
    }
  };

  const handleMessageChange = (message: string) => {
    setSettings((prev) => ({
      ...prev,
      autoReply: {
        ...prev.autoReply,
        message,
      },
    }));
  };

  const handleConnect = () => {
    // 실제 LINE 연동 로직
    setSettings((prev) => ({ ...prev, connected: true }));
  };

  const handleDisconnect = () => {
    setSettings((prev) => ({ ...prev, connected: false }));
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
            <h1 className="text-2xl font-bold text-gray-900">LINE 연동</h1>
            <p className="text-gray-600">LINE 알림 연동 설정을 관리하세요</p>
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
          {/* 연결 상태 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-6 h-6 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                LINE 연결 상태
              </h2>
            </div>

            {settings.connected ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <h3 className="font-medium text-green-900">
                        LINE에 연결됨
                      </h3>
                      <p className="text-sm text-green-700">
                        알림을 LINE으로 받을 수 있습니다
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleDisconnect}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    연결 해제
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-gray-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        LINE에 연결되지 않음
                      </h3>
                      <p className="text-sm text-gray-600">
                        LINE을 연결하여 알림을 받으세요
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleConnect}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>LINE 연결</span>
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">연결 방법</h4>
                  <ol className="text-sm text-blue-800 space-y-1">
                    <li>1. 위의 "LINE 연결" 버튼을 클릭하세요</li>
                    <li>2. 표시되는 QR 코드를 LINE 앱으로 스캔하세요</li>
                    <li>3. LINE에서 "한국어 학원"을 친구로 추가하세요</li>
                    <li>4. 연결이 완료되면 알림을 받을 수 있습니다</li>
                  </ol>
                </div>
              </div>
            )}
          </div>

          {/* 알림 설정 */}
          {settings.connected && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-6 h-6 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  LINE 알림 설정
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">수업 리마인더</h3>
                    <p className="text-sm text-gray-600">
                      수업 시작 전 LINE으로 알림을 받습니다
                    </p>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.notifications.lessonReminders}
                      onChange={() => handleToggle("lessonReminders")}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">숙제 마감일</h3>
                    <p className="text-sm text-gray-600">
                      숙제 마감일 전 LINE으로 알림을 받습니다
                    </p>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.notifications.homeworkDeadlines}
                      onChange={() => handleToggle("homeworkDeadlines")}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">선생님 메시지</h3>
                    <p className="text-sm text-gray-600">
                      선생님이 보낸 메시지를 LINE으로 받습니다
                    </p>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.notifications.teacherMessages}
                      onChange={() => handleToggle("teacherMessages")}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">성적 업데이트</h3>
                    <p className="text-sm text-gray-600">
                      성적이 업데이트되면 LINE으로 알림을 받습니다
                    </p>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.notifications.gradeUpdates}
                      onChange={() => handleToggle("gradeUpdates")}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 자동 답장 설정 */}
          {settings.connected && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-6 h-6 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  자동 답장 설정
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      자동 답장 활성화
                    </h3>
                    <p className="text-sm text-gray-600">
                      수업 중에 받은 메시지에 자동으로 답장합니다
                    </p>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.autoReply.enabled}
                      onChange={() => handleToggle("enabled")}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </label>
                </div>

                {settings.autoReply.enabled && (
                  <div className="space-y-3">
                    <label className="block">
                      <span className="text-sm font-medium text-gray-700">
                        자동 답장 메시지
                      </span>
                      <textarea
                        value={settings.autoReply.message}
                        onChange={(e) => handleMessageChange(e.target.value)}
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="자동 답장으로 보낼 메시지를 입력하세요"
                      />
                    </label>
                    <p className="text-xs text-gray-500">
                      수업 중에 메시지를 받으면 이 메시지가 자동으로 전송됩니다.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 저장 버튼 */}
          {settings.connected && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {saved && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span>설정이 저장되었습니다</span>
                  </div>
                )}
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{saving ? "저장 중..." : "설정 저장"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

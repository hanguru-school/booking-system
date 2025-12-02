"use client";

import { useState } from "react";
import {
  Bell,
  Mail,
  Clock,
  Calendar,
  MessageSquare,
  ArrowLeft,
  Save,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

interface NotificationSettings {
  lessonReminder: {
    enabled: boolean;
    timeBefore: number; // minutes
  };
  homeworkReminder: {
    enabled: boolean;
    timeBefore: number; // hours
  };
  lessonStart: {
    enabled: boolean;
    timeBefore: number; // minutes
  };
  lessonEnd: {
    enabled: boolean;
    timeBefore: number; // minutes
  };
  emailNotifications: {
    enabled: boolean;
    lessonUpdates: boolean;
    homeworkAssignments: boolean;
    gradeUpdates: boolean;
    systemAnnouncements: boolean;
  };
  pushNotifications: {
    enabled: boolean;
    lessonReminders: boolean;
    homeworkDeadlines: boolean;
    teacherMessages: boolean;
    gradeUpdates: boolean;
  };
}

export default function StudentNotificationSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings>({
    lessonReminder: {
      enabled: true,
      timeBefore: 30,
    },
    homeworkReminder: {
      enabled: true,
      timeBefore: 24,
    },
    lessonStart: {
      enabled: true,
      timeBefore: 10,
    },
    lessonEnd: {
      enabled: false,
      timeBefore: 5,
    },
    emailNotifications: {
      enabled: true,
      lessonUpdates: true,
      homeworkAssignments: true,
      gradeUpdates: true,
      systemAnnouncements: false,
    },
    pushNotifications: {
      enabled: true,
      lessonReminders: true,
      homeworkDeadlines: true,
      teacherMessages: true,
      gradeUpdates: false,
    },
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleToggle = (
    category: keyof NotificationSettings,
    field: string,
  ) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: !(prev[category] as Record<string, boolean>)[field],
      },
    }));
  };

  const handleTimeChange = (
    category: keyof NotificationSettings,
    field: string,
    value: number,
  ) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
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
            <h1 className="text-2xl font-bold text-gray-900">알림 설정</h1>
            <p className="text-gray-600">
              수업 알림 및 리마인더 설정을 관리하세요
            </p>
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
          {/* 수업 알림 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">수업 알림</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">
                      수업 시작 전 알림
                    </h3>
                    <p className="text-sm text-gray-600">
                      수업 시작 전 미리 알림을 받습니다
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={settings.lessonStart.timeBefore}
                    onChange={(e) =>
                      handleTimeChange(
                        "lessonStart",
                        "timeBefore",
                        parseInt(e.target.value),
                      )
                    }
                    disabled={!settings.lessonStart.enabled}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                  >
                    <option value={5}>5분 전</option>
                    <option value={10}>10분 전</option>
                    <option value={15}>15분 전</option>
                    <option value={30}>30분 전</option>
                  </select>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.lessonStart.enabled}
                      onChange={() => handleToggle("lessonStart", "enabled")}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">
                      수업 종료 전 알림
                    </h3>
                    <p className="text-sm text-gray-600">
                      수업 종료 전 알림을 받습니다
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={settings.lessonEnd.timeBefore}
                    onChange={(e) =>
                      handleTimeChange(
                        "lessonEnd",
                        "timeBefore",
                        parseInt(e.target.value),
                      )
                    }
                    disabled={!settings.lessonEnd.enabled}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                  >
                    <option value={5}>5분 전</option>
                    <option value={10}>10분 전</option>
                    <option value={15}>15분 전</option>
                  </select>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.lessonEnd.enabled}
                      onChange={() => handleToggle("lessonEnd", "enabled")}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 숙제 알림 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-6 h-6 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">숙제 알림</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">
                      숙제 마감일 알림
                    </h3>
                    <p className="text-sm text-gray-600">
                      숙제 마감일 전 알림을 받습니다
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={settings.homeworkReminder.timeBefore}
                    onChange={(e) =>
                      handleTimeChange(
                        "homeworkReminder",
                        "timeBefore",
                        parseInt(e.target.value),
                      )
                    }
                    disabled={!settings.homeworkReminder.enabled}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                  >
                    <option value={6}>6시간 전</option>
                    <option value={12}>12시간 전</option>
                    <option value={24}>24시간 전</option>
                    <option value={48}>48시간 전</option>
                  </select>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.homeworkReminder.enabled}
                      onChange={() =>
                        handleToggle("homeworkReminder", "enabled")
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 이메일 알림 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                이메일 알림
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">
                    이메일 알림 활성화
                  </h3>
                  <p className="text-sm text-gray-600">
                    모든 이메일 알림을 켜거나 끕니다
                  </p>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications.enabled}
                    onChange={() =>
                      handleToggle("emailNotifications", "enabled")
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </label>
              </div>

              {settings.emailNotifications.enabled && (
                <div className="space-y-3 ml-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">수업 업데이트</span>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications.lessonUpdates}
                        onChange={() =>
                          handleToggle("emailNotifications", "lessonUpdates")
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">숙제 할당</span>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={
                          settings.emailNotifications.homeworkAssignments
                        }
                        onChange={() =>
                          handleToggle(
                            "emailNotifications",
                            "homeworkAssignments",
                          )
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">성적 업데이트</span>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications.gradeUpdates}
                        onChange={() =>
                          handleToggle("emailNotifications", "gradeUpdates")
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      시스템 공지사항
                    </span>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={
                          settings.emailNotifications.systemAnnouncements
                        }
                        onChange={() =>
                          handleToggle(
                            "emailNotifications",
                            "systemAnnouncements",
                          )
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 푸시 알림 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-6 h-6 text-orange-600" />
              <h2 className="text-lg font-semibold text-gray-900">푸시 알림</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">
                    푸시 알림 활성화
                  </h3>
                  <p className="text-sm text-gray-600">
                    모든 푸시 알림을 켜거나 끕니다
                  </p>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.pushNotifications.enabled}
                    onChange={() =>
                      handleToggle("pushNotifications", "enabled")
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </label>
              </div>

              {settings.pushNotifications.enabled && (
                <div className="space-y-3 ml-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">수업 리마인더</span>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.pushNotifications.lessonReminders}
                        onChange={() =>
                          handleToggle("pushNotifications", "lessonReminders")
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">숙제 마감일</span>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.pushNotifications.homeworkDeadlines}
                        onChange={() =>
                          handleToggle("pushNotifications", "homeworkDeadlines")
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">선생님 메시지</span>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.pushNotifications.teacherMessages}
                        onChange={() =>
                          handleToggle("pushNotifications", "teacherMessages")
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">성적 업데이트</span>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.pushNotifications.gradeUpdates}
                        onChange={() =>
                          handleToggle("pushNotifications", "gradeUpdates")
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 저장 버튼 */}
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
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  Calendar,
  Clock,
  MessageSquare,
  Edit,
  Plus,
  CheckCircle,
  AlertCircle,
  X,
  Search,
  Mail,
  BarChart3,
} from "lucide-react";

interface Reminder {
  id: string;
  type:
    | "lesson-reminder"
    | "monthly-summary"
    | "tagging-warning"
    | "encouragement"
    | "next-booking"
    | "no-booking"
    | "mid-month"
    | "next-month";
  title: string;
  message: string;
  target: "student" | "admin" | "both";
  triggerTime: string;
  isActive: boolean;
  lastSent?: string;
  sentCount: number;
  conditions: string[];
}

interface NotificationLog {
  id: string;
  reminderId: string;
  recipientId: string;
  recipientName: string;
  channel: "email" | "line" | "push";
  status: "sent" | "failed" | "pending";
  sentAt: string;
  message: string;
}

export default function ReminderSystemPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>(
    [],
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<"reminders" | "logs" | "settings">(
    "reminders",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<
    | "all"
    | "lesson-reminder"
    | "monthly-summary"
    | "tagging-warning"
    | "encouragement"
    | "next-booking"
    | "no-booking"
    | "mid-month"
    | "next-month"
  >("all");

  const reminderTypes = [
    {
      id: "lesson-reminder",
      name: "수업 전일 리마인드",
      icon: <Bell className="w-4 h-4" />,
    },
    {
      id: "monthly-summary",
      name: "월초 예약 요약",
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: "tagging-warning",
      name: "태깅 미완료 경고",
      icon: <AlertCircle className="w-4 h-4" />,
    },
    {
      id: "encouragement",
      name: "수업 완료 응원",
      icon: <MessageSquare className="w-4 h-4" />,
    },
    {
      id: "next-booking",
      name: "다음 예약 유도",
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: "no-booking",
      name: "7일 무예약 알림",
      icon: <AlertCircle className="w-4 h-4" />,
    },
    {
      id: "mid-month",
      name: "중간월 예약 부족",
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: "next-month",
      name: "다음달 예약 유도",
      icon: <Calendar className="w-4 h-4" />,
    },
  ];

  useEffect(() => {
    const mockReminders: Reminder[] = [
      {
        id: "REM001",
        type: "lesson-reminder",
        title: "수업 전일 리마인드",
        message:
          "내일 오후 2시에 한국어 수업이 있습니다. 준비물을 확인해주세요!",
        target: "student",
        triggerTime: "18:00",
        isActive: true,
        lastSent: "2024-01-15T18:00:00Z",
        sentCount: 45,
        conditions: ["예약 전날 오후 6시"],
      },
      {
        id: "REM002",
        type: "monthly-summary",
        title: "월초 예약 요약",
        message:
          "이번 달 예약 현황을 확인해보세요. 새로운 수업을 예약하시겠습니까?",
        target: "student",
        triggerTime: "09:00",
        isActive: true,
        lastSent: "2024-01-01T09:00:00Z",
        sentCount: 12,
        conditions: ["매월 1일"],
      },
      {
        id: "REM003",
        type: "tagging-warning",
        title: "태깅 미완료 경고",
        message: "수업 시작 후 10분이 지났습니다. 출석 태깅을 완료해주세요.",
        target: "both",
        triggerTime: "10:00",
        isActive: true,
        lastSent: "2024-01-15T10:00:00Z",
        sentCount: 8,
        conditions: ["수업 시작 후 10분 경과"],
      },
    ];

    const mockLogs: NotificationLog[] = [
      {
        id: "LOG001",
        reminderId: "REM001",
        recipientId: "STU001",
        recipientName: "김학생",
        channel: "line",
        status: "sent",
        sentAt: "2024-01-15T18:00:00Z",
        message:
          "내일 오후 2시에 한국어 수업이 있습니다. 준비물을 확인해주세요!",
      },
      {
        id: "LOG002",
        reminderId: "REM002",
        recipientId: "STU002",
        recipientName: "이학생",
        channel: "email",
        status: "sent",
        sentAt: "2024-01-01T09:00:00Z",
        message:
          "이번 달 예약 현황을 확인해보세요. 새로운 수업을 예약하시겠습니까?",
      },
    ];

    setReminders(mockReminders);
    setNotificationLogs(mockLogs);
  }, []);

  const handleToggleActive = (reminderId: string) => {
    setReminders((prev) =>
      prev.map((reminder) =>
        reminder.id === reminderId
          ? { ...reminder, isActive: !reminder.isActive }
          : reminder,
      ),
    );
  };

  const handleEditReminder = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setShowCreateModal(true);
  };

  const getFilteredReminders = () => {
    let filtered = reminders;

    if (filterType !== "all") {
      filtered = filtered.filter((reminder) => reminder.type === filterType);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (reminder) =>
          reminder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reminder.message.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return filtered;
  };

  const getFilteredLogs = () => {
    return notificationLogs.filter(
      (log) =>
        log.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.message.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email":
        return <Mail className="w-4 h-4" />;
      case "line":
        return <MessageSquare className="w-4 h-4" />;
      case "push":
        return <Bell className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const filteredReminders = getFilteredReminders();
  const filteredLogs = getFilteredLogs();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                자동 리마인드 시스템
              </h1>
              <p className="mt-2 text-gray-600">자동화된 알림 및 메시지 관리</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />새 리마인드
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Navigation Tabs */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">메뉴</h2>
                </div>
                <nav className="p-2">
                  <button
                    onClick={() => setActiveTab("reminders")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                      activeTab === "reminders"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    리마인드 관리
                  </button>
                  <button
                    onClick={() => setActiveTab("logs")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                      activeTab === "logs"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    발송 로그
                  </button>
                  <button
                    onClick={() => setActiveTab("settings")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                      activeTab === "settings"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    설정
                  </button>
                </nav>
              </div>

              {/* Quick Stats */}
              {activeTab === "reminders" && (
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    빠른 통계
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        활성 리마인드
                      </span>
                      <span className="font-medium">
                        {reminders.filter((r) => r.isActive).length}개
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">총 발송</span>
                      <span className="font-medium">
                        {reminders.reduce((sum, r) => sum + r.sentCount, 0)}회
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "reminders" && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-64">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="리마인드 검색..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <select
                      value={filterType}
                      onChange={(e) =>
                        setFilterType(
                          e.target.value as
                            | "all"
                            | "lesson-reminder"
                            | "monthly-summary"
                            | "tagging-warning"
                            | "encouragement"
                            | "next-booking"
                            | "no-booking"
                            | "mid-month"
                            | "next-month",
                        )
                      }
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">전체 유형</option>
                      {reminderTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Reminders List */}
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                      리마인드 목록
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {filteredReminders.length === 0 ? (
                      <div className="p-12 text-center">
                        <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">리마인드가 없습니다.</p>
                      </div>
                    ) : (
                      filteredReminders.map((reminder) => (
                        <div key={reminder.id} className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    reminder.isActive
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {reminder.isActive ? "활성" : "비활성"}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {
                                    reminderTypes.find(
                                      (t) => t.id === reminder.type,
                                    )?.name
                                  }
                                </span>
                                <span className="text-sm text-gray-500">
                                  대상:{" "}
                                  {reminder.target === "both"
                                    ? "학생/관리자"
                                    : reminder.target === "student"
                                      ? "학생"
                                      : "관리자"}
                                </span>
                              </div>

                              <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {reminder.title}
                              </h3>

                              <p className="text-gray-600 mb-3">
                                {reminder.message}
                              </p>

                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>발송 시간: {reminder.triggerTime}</span>
                                <span>발송 횟수: {reminder.sentCount}회</span>
                                {reminder.lastSent && (
                                  <span>
                                    마지막 발송:{" "}
                                    {new Date(
                                      reminder.lastSent,
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleToggleActive(reminder.id)}
                                className={`p-2 rounded ${
                                  reminder.isActive
                                    ? "text-green-600 hover:bg-green-50"
                                    : "text-gray-400 hover:bg-gray-50"
                                }`}
                              >
                                {reminder.isActive ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : (
                                  <X className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleEditReminder(reminder)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "logs" && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-64">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="수신자, 메시지 검색..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Logs List */}
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                      발송 로그
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {filteredLogs.length === 0 ? (
                      <div className="p-12 text-center">
                        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">발송 로그가 없습니다.</p>
                      </div>
                    ) : (
                      filteredLogs.map((log) => (
                        <div key={log.id} className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                {getStatusIcon(log.status)}
                                {getChannelIcon(log.channel)}
                                <span className="font-medium text-gray-900">
                                  {log.recipientName}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {new Date(log.sentAt).toLocaleDateString()}
                                </span>
                              </div>

                              <p className="text-gray-600 text-sm">
                                {log.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    알림 설정
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          이메일 알림
                        </h3>
                        <p className="text-sm text-gray-600">
                          이메일을 통한 알림 발송
                        </p>
                      </div>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        활성화
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">LINE 알림</h3>
                        <p className="text-sm text-gray-600">
                          LINE을 통한 알림 발송
                        </p>
                      </div>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        활성화
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">푸시 알림</h3>
                        <p className="text-sm text-gray-600">
                          웹 푸시 알림 발송
                        </p>
                      </div>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        활성화
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

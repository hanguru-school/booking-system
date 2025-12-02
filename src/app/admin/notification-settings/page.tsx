"use client";

import {
  Plus,
  ToggleRight,
  ToggleLeft,
  Edit,
  Eye,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
interface NotificationTemplate {
  id: string;
  type: string;
  name: string;
  title: string;
  content: string;
  channels: ("line" | "email" | "push")[];
  timing: "immediate" | "scheduled" | "delayed";
  delayHours?: number;
  conditions: {
    userType: "student" | "teacher" | "staff";
    minRating?: number;
    maxRating?: number;
    hasReservation?: boolean;
    hasLineConnected?: boolean;
  };
  isActive: boolean;
  usageCount: number;
  lastUsed?: string;
}

interface NotificationStats {
  totalSent: number;
  deliveryRate: number;
  channelStats: {
    line: { sent: number; delivered: number; rate: number };
    email: { sent: number; delivered: number; rate: number };
    push: { sent: number; delivered: number; rate: number };
  };
  typeStats: {
    reservation_reminder: number;
    review_request: number;
    attendance_alert: number;
    points_low: number;
  };
  recentActivity: {
    type: string;
    count: number;
    timestamp: string;
  }[];
}

export default function AdminNotificationSettingsPage() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<NotificationTemplate | null>(null);
  const [activeTab, setActiveTab] = useState<
    "templates" | "stats" | "settings"
  >("templates");

  // 폼 상태
  const [formData, setFormData] = useState({
    type: "",
    name: "",
    title: "",
    content: "",
    channels: [] as string[],
    timing: "immediate" as string,
    delayHours: 0,
    userType: "student" as string,
    minRating: 0,
    maxRating: 5,
    hasReservation: false,
    hasLineConnected: false,
    isActive: true,
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [templatesResponse, statsResponse] = await Promise.all([
          fetch('/api/admin/push-notifications', { credentials: 'include' }).catch(() => ({ ok: false })),
          fetch('/api/admin/notification-stats', { credentials: 'include' }).catch(() => ({ ok: false })),
        ]);

        const templatesData = templatesResponse.ok ? await templatesResponse.json() : { notificationTypes: [] };
        const statsData = statsResponse.ok ? await statsResponse.json() : { stats: null };

        setTemplates(templatesData.notificationTypes || []);
        setStats(statsData.stats || {
          totalSent: 0,
          deliveryRate: 0,
          channelStats: {
            line: { sent: 0, delivered: 0, rate: 0 },
            email: { sent: 0, delivered: 0, rate: 0 },
            push: { sent: 0, delivered: 0, rate: 0 },
          },
          typeStats: {},
          recentActivity: [],
        });
      } catch (error) {
        console.error('알림 설정 데이터 로딩 실패:', error);
        setTemplates([]);
        setStats({
          totalSent: 0,
          deliveryRate: 0,
          channelStats: {
            line: { sent: 0, delivered: 0, rate: 0 },
            email: { sent: 0, delivered: 0, rate: 0 },
            push: { sent: 0, delivered: 0, rate: 0 },
          },
          typeStats: {},
          recentActivity: [],
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 실제 API 호출로 대체
      const newTemplate: NotificationTemplate = {
        id: Date.now().toString(),
        type: formData.type,
        name: formData.name,
        title: formData.title,
        content: formData.content,
        channels: formData.channels as ("line" | "email" | "push")[],
        timing: formData.timing as "immediate" | "scheduled" | "delayed",
        delayHours: formData.delayHours,
        conditions: {
          userType: formData.userType as "student" | "teacher" | "staff",
          minRating: formData.minRating,
          maxRating: formData.maxRating,
          hasReservation: formData.hasReservation,
          hasLineConnected: formData.hasLineConnected,
        },
        isActive: formData.isActive,
        usageCount: 0,
      };

      setTemplates([...templates, newTemplate]);
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error("템플릿 생성 오류:", error);
    }
  };

  const handleUpdateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTemplate) return;

    try {
      // 실제 API 호출로 대체
      const updatedTemplates = templates.map((template) =>
        template.id === selectedTemplate.id
          ? {
              ...template,
              type: formData.type,
              name: formData.name,
              title: formData.title,
              content: formData.content,
              channels: formData.channels as ("line" | "email" | "push")[],
              timing: formData.timing as "immediate" | "scheduled" | "delayed",
              delayHours: formData.delayHours,
              conditions: {
                userType: formData.userType as "student" | "teacher" | "staff",
                minRating: formData.minRating,
                maxRating: formData.maxRating,
                hasReservation: formData.hasReservation,
                hasLineConnected: formData.hasLineConnected,
              },
              isActive: formData.isActive,
            }
          : template,
      );

      setTemplates(updatedTemplates);
      setShowEditModal(false);
      resetForm();
    } catch (error) {
      console.error("템플릿 수정 오류:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      type: "",
      name: "",
      title: "",
      content: "",
      channels: [],
      timing: "immediate",
      delayHours: 0,
      userType: "student",
      minRating: 0,
      maxRating: 5,
      hasReservation: false,
      hasLineConnected: false,
      isActive: true,
    });
  };

  const openEditModal = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      type: template.type,
      name: template.name,
      title: template.title,
      content: template.content,
      channels: template.channels,
      timing: template.timing,
      delayHours: template.delayHours || 0,
      userType: template.conditions.userType,
      minRating: template.conditions.minRating || 0,
      maxRating: template.conditions.maxRating || 5,
      hasReservation: template.conditions.hasReservation || false,
      hasLineConnected: template.conditions.hasLineConnected || false,
      isActive: template.isActive,
    });
    setShowEditModal(true);
  };

  const toggleTemplateStatus = (templateId: string) => {
    setTemplates(
      templates.map((template) =>
        template.id === templateId
          ? { ...template, isActive: !template.isActive }
          : template,
      ),
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">알림 설정</h1>
          <p className="text-lg text-gray-600">
            푸시 알림 템플릿과 발송 조건을 관리하세요
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />새 템플릿 생성
        </button>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white rounded-xl shadow-lg mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("templates")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "templates"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              알림 템플릿
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "stats"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              발송 통계
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "settings"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              시스템 설정
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "templates" && (
            <div className="space-y-6">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="border border-gray-200 rounded-lg p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        타입: {template.type}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleTemplateStatus(template.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          template.isActive
                            ? "text-green-600 hover:bg-green-100"
                            : "text-gray-400 hover:bg-gray-100"
                        }`}
                      >
                        {template.isActive ? (
                          <ToggleRight className="w-5 h-5" />
                        ) : (
                          <ToggleLeft className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => openEditModal(template)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">제목</h4>
                      <p className="text-gray-600">{template.title}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        발송 채널
                      </h4>
                      <div className="flex gap-2">
                        {template.channels.map((channel) => (
                          <span
                            key={channel}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                          >
                            {channel}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">내용</h4>
                    <p className="text-gray-600">{template.content}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">발송 시점:</span>
                      <span className="ml-2 font-medium">
                        {template.timing === "immediate"
                          ? "즉시"
                          : template.timing === "scheduled"
                            ? "예약"
                            : "지연"}
                        {template.delayHours > 0 &&
                          ` (${template.delayHours}시간 후)`}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">사용 횟수:</span>
                      <span className="ml-2 font-medium">
                        {template.usageCount}회
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">마지막 사용:</span>
                      <span className="ml-2 font-medium">
                        {template.lastUsed
                          ? new Date(template.lastUsed).toLocaleDateString(
                              "ko-KR",
                            )
                          : "없음"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "stats" && stats && (
            <div className="space-y-8">
              {/* 전체 통계 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-blue-600">총 발송</div>
                      <div className="text-2xl font-bold text-blue-900">
                        {stats.totalSent}
                      </div>
                    </div>
                    <Send className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="mt-2 text-sm text-blue-700">
                    전달률: {stats.deliveryRate}%
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-green-600">성공 발송</div>
                      <div className="text-2xl font-bold text-green-900">
                        {Math.round(
                          (stats.totalSent * stats.deliveryRate) / 100,
                        )}
                      </div>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="mt-2 text-sm text-green-700">
                    실패:{" "}
                    {Math.round(
                      (stats.totalSent * (100 - stats.deliveryRate)) / 100,
                    )}
                    건
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-yellow-600">오늘 발송</div>
                      <div className="text-2xl font-bold text-yellow-900">
                        {stats.recentActivity.reduce(
                          (sum, activity) => sum + activity.count,
                          0,
                        )}
                      </div>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                  <div className="mt-2 text-sm text-yellow-700">
                    이번 주: {stats.recentActivity.length}회
                  </div>
                </div>
              </div>

              {/* 채널별 통계 */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  채널별 발송 통계
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(stats.channelStats).map(([channel, data]) => (
                    <div key={channel} className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {data.sent}
                      </div>
                      <div className="text-sm text-gray-600">발송</div>
                      <div className="text-lg font-semibold text-green-600">
                        {data.delivered}
                      </div>
                      <div className="text-sm text-gray-600">전달</div>
                      <div className="text-sm font-medium text-blue-600">
                        {data.rate}%
                      </div>
                      <div className="text-xs text-gray-500">전달률</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 타입별 통계 */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  알림 타입별 통계
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(stats.typeStats).map(([type, count]) => (
                    <div
                      key={type}
                      className="text-center p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="text-xl font-bold text-gray-900">
                        {count}
                      </div>
                      <div className="text-sm text-gray-600 capitalize">
                        {type.replace("_", " ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-yellow-900">시스템 설정</h3>
                    <p className="text-sm text-yellow-800 mt-1">
                      알림 시스템의 전역 설정을 관리할 수 있습니다. 설정 변경 시
                      주의가 필요합니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      자동 알림 활성화
                    </h4>
                    <p className="text-sm text-gray-600">
                      예약 리마인드, 리뷰 요청 등 자동 알림 발송
                    </p>
                  </div>
                  <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg">
                    <ToggleRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      중복 발송 방지
                    </h4>
                    <p className="text-sm text-gray-600">
                      하루 최대 1건으로 알림 중복 발송 제한
                    </p>
                  </div>
                  <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg">
                    <ToggleRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      긴급 알림 우선순위
                    </h4>
                    <p className="text-sm text-gray-600">
                      긴급 알림을 일반 알림보다 우선 발송
                    </p>
                  </div>
                  <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg">
                    <ToggleRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 템플릿 생성/수정 모달 */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {showCreateModal ? "새 알림 템플릿 생성" : "알림 템플릿 수정"}
            </h3>

            <form
              onSubmit={
                showCreateModal ? handleCreateTemplate : handleUpdateTemplate
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    타입
                  </label>
                  <input
                    type="text"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    placeholder="예: reservation_reminder"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    이름
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="템플릿 이름"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  제목
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="알림 제목"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  내용
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="알림 내용 (변수: {studentName}, {date}, {time} 등 사용 가능)"
                  className="w-full h-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    발송 채널
                  </label>
                  <div className="space-y-2">
                    {["line", "email", "push"].map((channel) => (
                      <label key={channel} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.channels.includes(channel)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                channels: [...formData.channels, channel],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                channels: formData.channels.filter(
                                  (c) => c !== channel,
                                ),
                              });
                            }
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-900 capitalize">
                          {channel}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    발송 시점
                  </label>
                  <select
                    value={formData.timing}
                    onChange={(e) =>
                      setFormData({ ...formData, timing: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="immediate">즉시</option>
                    <option value="scheduled">예약</option>
                    <option value="delayed">지연</option>
                  </select>

                  {(formData.timing === "scheduled" ||
                    formData.timing === "delayed") && (
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        지연 시간 (시간)
                      </label>
                      <input
                        type="number"
                        value={formData.delayHours}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            delayHours: parseFloat(e.target.value),
                          })
                        }
                        min="0"
                        step="0.1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  발송 조건
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      사용자 타입
                    </label>
                    <select
                      value={formData.userType}
                      onChange={(e) =>
                        setFormData({ ...formData, userType: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="student">학생</option>
                      <option value="teacher">선생님</option>
                      <option value="staff">스태프</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.hasReservation}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hasReservation: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-900">
                        예약이 있는 사용자
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.hasLineConnected}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hasLineConnected: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-900">
                        LINE 연동 사용자
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {showCreateModal ? "생성" : "수정"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

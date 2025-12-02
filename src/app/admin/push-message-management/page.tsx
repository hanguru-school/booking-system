"use client";

import {
  Plus,
  Search,
  Play,
  Pause,
  Edit,
  Eye,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
interface PushMessage {
  id: string;
  type: string;
  name: string;
  title: string;
  content: string;
  channels: ("line" | "email" | "push")[];
  trigger: "manual" | "automatic" | "scheduled";
  conditions: {
    userType: "student" | "teacher" | "staff";
    eventType?: string;
    timing?: string;
    delayHours?: number;
  };
  isActive: boolean;
  usageCount: number;
  lastSent?: string;
  createdAt: string;
}

interface MessageHistory {
  id: string;
  messageId: string;
  messageName: string;
  recipientName: string;
  recipientType: string;
  channel: string;
  status: "sent" | "delivered" | "failed" | "pending";
  sentAt: string;
  deliveredAt?: string;
  errorMessage?: string;
}

export default function AdminPushMessageManagementPage() {
  const [messages, setMessages] = useState<PushMessage[]>([]);
  const [history, setHistory] = useState<MessageHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "templates" | "history" | "settings"
  >("templates");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<PushMessage | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [typeFilter, setTypeFilter] = useState<
    "all" | "manual" | "automatic" | "scheduled"
  >("all");

  // 폼 상태
  const [formData, setFormData] = useState({
    type: "",
    name: "",
    title: "",
    content: "",
    channels: [] as string[],
    trigger: "manual" as string,
    userType: "student" as string,
    eventType: "",
    timing: "",
    delayHours: 0,
    isActive: true,
  });

  useEffect(() => {
    // 실제 API 호출로 대체
    setTimeout(() => {
      const mockMessages: PushMessage[] = [
        {
          id: "1",
          type: "reservation_confirmed",
          name: "예약 확정 알림",
          title: "수업 예약이 확정되었습니다",
          content:
            "안녕하세요! {studentName}님의 {date} {time} 수업 예약이 확정되었습니다. 수업 준비를 부탁드립니다.",
          channels: ["line", "email"],
          trigger: "automatic",
          conditions: {
            userType: "student",
            eventType: "reservation_confirmed",
          },
          isActive: true,
          usageCount: 156,
          lastSent: "2024-01-15T10:30:00Z",
          createdAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "2",
          type: "reservation_reminder",
          name: "수업 리마인드",
          title: "내일 수업 리마인드",
          content:
            "안녕하세요! 내일 {date} {time}에 {studentName}님의 수업이 예정되어 있습니다. 잊지 마세요!",
          channels: ["line", "email"],
          trigger: "scheduled",
          conditions: {
            userType: "student",
            eventType: "reservation_reminder",
            timing: "day_before_8am",
            delayHours: 24,
          },
          isActive: true,
          usageCount: 89,
          lastSent: "2024-01-14T08:00:00Z",
          createdAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "3",
          type: "review_request",
          name: "리뷰 작성 요청",
          title: "수업 리뷰 작성 요청",
          content:
            "오늘 수업은 어떠셨나요? 소중한 의견을 들려주세요. 리뷰 작성 시 포인트를 드립니다!",
          channels: ["line", "email"],
          trigger: "automatic",
          conditions: {
            userType: "student",
            eventType: "lesson_completed",
            delayHours: 5,
          },
          isActive: true,
          usageCount: 67,
          lastSent: "2024-01-15T16:00:00Z",
          createdAt: "2024-01-01T00:00:00Z",
        },
      ];

      const mockHistory: MessageHistory[] = [
        {
          id: "1",
          messageId: "1",
          messageName: "예약 확정 알림",
          recipientName: "김학생",
          recipientType: "student",
          channel: "line",
          status: "delivered",
          sentAt: "2024-01-15T10:30:00Z",
          deliveredAt: "2024-01-15T10:30:05Z",
        },
        {
          id: "2",
          messageId: "2",
          messageName: "수업 리마인드",
          recipientName: "이학생",
          recipientType: "student",
          channel: "email",
          status: "sent",
          sentAt: "2024-01-14T08:00:00Z",
        },
      ];

      setMessages(mockMessages);
      setHistory(mockHistory);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && message.isActive) ||
      (statusFilter === "inactive" && !message.isActive);

    const matchesType = typeFilter === "all" || message.trigger === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleCreateMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 실제 API 호출로 대체
      const newMessage: PushMessage = {
        id: Date.now().toString(),
        type: formData.type,
        name: formData.name,
        title: formData.title,
        content: formData.content,
        channels: formData.channels as ("line" | "email" | "push")[],
        trigger: formData.trigger as "manual" | "automatic" | "scheduled",
        conditions: {
          userType: formData.userType as "student" | "teacher" | "staff",
          eventType: formData.eventType || undefined,
          timing: formData.timing || undefined,
          delayHours: formData.delayHours,
        },
        isActive: formData.isActive,
        usageCount: 0,
        createdAt: new Date().toISOString(),
      };

      setMessages([...messages, newMessage]);
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error("메시지 생성 오류:", error);
    }
  };

  const handleUpdateMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMessage) return;

    try {
      // 실제 API 호출로 대체
      const updatedMessages = messages.map((message) =>
        message.id === selectedMessage.id
          ? {
              ...message,
              type: formData.type,
              name: formData.name,
              title: formData.title,
              content: formData.content,
              channels: formData.channels as ("line" | "email" | "push")[],
              trigger: formData.trigger as "manual" | "automatic" | "scheduled",
              conditions: {
                userType: formData.userType as "student" | "teacher" | "staff",
                eventType: formData.eventType || undefined,
                timing: formData.timing || undefined,
                delayHours: formData.delayHours,
              },
              isActive: formData.isActive,
            }
          : message,
      );

      setMessages(updatedMessages);
      setShowEditModal(false);
      resetForm();
    } catch (error) {
      console.error("메시지 수정 오류:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      type: "",
      name: "",
      title: "",
      content: "",
      channels: [],
      trigger: "manual",
      userType: "student",
      eventType: "",
      timing: "",
      delayHours: 0,
      isActive: true,
    });
  };

  const openEditModal = (message: PushMessage) => {
    setSelectedMessage(message);
    setFormData({
      type: message.type,
      name: message.name,
      title: message.title,
      content: message.content,
      channels: message.channels,
      trigger: message.trigger,
      userType: message.conditions.userType,
      eventType: message.conditions.eventType || "",
      timing: message.conditions.timing || "",
      delayHours: message.conditions.delayHours || 0,
      isActive: message.isActive,
    });
    setShowEditModal(true);
  };

  const toggleMessageStatus = (messageId: string) => {
    setMessages(
      messages.map((message) =>
        message.id === messageId
          ? { ...message, isActive: !message.isActive }
          : message,
      ),
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTriggerColor = (trigger: string) => {
    switch (trigger) {
      case "automatic":
        return "bg-blue-100 text-blue-800";
      case "scheduled":
        return "bg-purple-100 text-purple-800";
      case "manual":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            푸시 알림 메시지 관리
          </h1>
          <p className="text-lg text-gray-600">
            알림 템플릿과 발송 이력을 관리하세요
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />새 메시지 생성
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
              메시지 템플릿
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "history"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              발송 이력
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
            <div>
              {/* 필터 및 검색 */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="메시지명, 타입으로 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value as "all" | "active" | "inactive",
                    )
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">전체 상태</option>
                  <option value="active">활성</option>
                  <option value="inactive">비활성</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) =>
                    setTypeFilter(
                      e.target.value as
                        | "all"
                        | "manual"
                        | "automatic"
                        | "scheduled",
                    )
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">전체 타입</option>
                  <option value="manual">수동</option>
                  <option value="automatic">자동</option>
                  <option value="scheduled">예약</option>
                </select>
              </div>

              {/* 메시지 목록 */}
              <div className="space-y-4">
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className="border border-gray-200 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {message.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          타입: {message.type}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTriggerColor(message.trigger)}`}
                        >
                          {message.trigger === "automatic"
                            ? "자동"
                            : message.trigger === "scheduled"
                              ? "예약"
                              : "수동"}
                        </span>
                        <button
                          onClick={() => toggleMessageStatus(message.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            message.isActive
                              ? "text-green-600 hover:bg-green-100"
                              : "text-gray-400 hover:bg-gray-100"
                          }`}
                        >
                          {message.isActive ? (
                            <Play className="w-4 h-4" />
                          ) : (
                            <Pause className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => openEditModal(message)}
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
                        <p className="text-gray-600">{message.title}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          발송 채널
                        </h4>
                        <div className="flex gap-2">
                          {message.channels.map((channel) => (
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
                      <p className="text-gray-600">{message.content}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">사용 횟수:</span>
                        <span className="ml-2 font-medium">
                          {message.usageCount}회
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">마지막 발송:</span>
                        <span className="ml-2 font-medium">
                          {message.lastSent
                            ? new Date(message.lastSent).toLocaleDateString(
                                "ko-KR",
                              )
                            : "없음"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">생성일:</span>
                        <span className="ml-2 font-medium">
                          {new Date(message.createdAt).toLocaleDateString(
                            "ko-KR",
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        메시지
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        수신자
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        채널
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">
                        상태
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">
                        발송일
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">
                        액션
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {item.messageName}
                            </div>
                            <div className="text-sm text-gray-600">
                              {item.recipientType}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {item.recipientName}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {item.channel}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                          >
                            {item.status === "delivered"
                              ? "전달됨"
                              : item.status === "sent"
                                ? "발송됨"
                                : item.status === "failed"
                                  ? "실패"
                                  : "대기중"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-sm text-gray-600">
                          {new Date(item.sentAt).toLocaleString("ko-KR")}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                      푸시 알림 시스템의 전역 설정을 관리할 수 있습니다.
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
                    <Play className="w-5 h-5" />
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
                    <Play className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      LINE 미연동자 이메일 안내
                    </h4>
                    <p className="text-sm text-gray-600">
                      이메일 하단에 LINE 연동 안내 메시지 자동 삽입
                    </p>
                  </div>
                  <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg">
                    <Play className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 메시지 생성/수정 모달 */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {showCreateModal ? "새 메시지 생성" : "메시지 수정"}
            </h3>

            <form
              onSubmit={
                showCreateModal ? handleCreateMessage : handleUpdateMessage
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
                    placeholder="예: reservation_confirmed"
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
                    placeholder="메시지 이름"
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
                    발송 방식
                  </label>
                  <select
                    value={formData.trigger}
                    onChange={(e) =>
                      setFormData({ ...formData, trigger: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="manual">수동</option>
                    <option value="automatic">자동</option>
                    <option value="scheduled">예약</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
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

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
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

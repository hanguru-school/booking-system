"use client";

import { useState, useEffect } from "react";
import {
  Search,
  RefreshCw,
  Save,
  AlertTriangle,
  MessageSquare,
  Mail,
  Smartphone,
  Eye,
} from "lucide-react";

interface SentMessage {
  id: string;
  sendTime: string;
  recipientName: string;
  recipientUid: string;
  channel: "email" | "line" | "push";
  messageType:
    | "booking_confirmation"
    | "cancellation"
    | "reminder"
    | "review_request"
    | "completion"
    | "other";
  content: string;
  status: "sent" | "delivered" | "failed" | "pending";
  errorMessage?: string;
  isTemplate: boolean;
  templateName?: string;
}

export default function MessageHistoryPage() {
  const [messages, setMessages] = useState<SentMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<SentMessage | null>(
    null,
  );

  // 필터 상태
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // 편집 상태
  const [editingMessage, setEditingMessage] = useState({
    content: "",
    messageType: "other" as SentMessage["messageType"],
    templateName: "",
  });

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      // 실제 API 호출로 대체
      const mockMessages: SentMessage[] = [
        {
          id: "1",
          sendTime: "2024-01-15T10:30:00",
          recipientName: "김학생",
          recipientUid: "ST001",
          channel: "email",
          messageType: "booking_confirmation",
          content:
            "김학생님, 1월 15일 14:00 한국어 수업 예약이 확정되었습니다. 수업 전 10분 전에 입장해주세요.",
          status: "delivered",
          isTemplate: false,
        },
        {
          id: "2",
          sendTime: "2024-01-15T09:15:00",
          recipientName: "박학생",
          recipientUid: "ST002",
          channel: "line",
          messageType: "reminder",
          content:
            "박학생님, 오늘 16:00 한국어 수업이 있습니다. 준비물을 잊지 마세요!",
          status: "sent",
          isTemplate: false,
        },
        {
          id: "3",
          sendTime: "2024-01-14T16:45:00",
          recipientName: "이학생",
          recipientUid: "ST003",
          channel: "push",
          messageType: "review_request",
          content:
            "이학생님, 지난 수업에 대한 리뷰를 작성해주세요. 학습 효과를 높이는데 도움이 됩니다.",
          status: "failed",
          errorMessage: "Push notification failed",
          isTemplate: false,
        },
        {
          id: "4",
          sendTime: "2024-01-14T14:20:00",
          recipientName: "최학생",
          recipientUid: "ST004",
          channel: "email",
          messageType: "cancellation",
          content:
            "최학생님, 1월 16일 수업이 취소되었습니다. 새로운 일정을 확인해주세요.",
          status: "delivered",
          isTemplate: true,
          templateName: "수업 취소 알림",
        },
      ];
      setMessages(mockMessages);
    } catch (error) {
      console.error("메시지 이력 로딩 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/admin/messages/${messageId}/resend`, {
        method: "POST",
      });

      if (response.ok) {
        await fetchMessages();
        alert("메시지가 재발송되었습니다.");
      } else {
        alert("메시지 재발송에 실패했습니다.");
      }
    } catch (error) {
      alert("메시지 재발송 중 오류가 발생했습니다.");
    }
  };

  const handleResendAll = async () => {
    if (!confirm("실패한 모든 메시지를 재발송하시겠습니까?")) return;

    try {
      const response = await fetch("/api/admin/messages/resend-all", {
        method: "POST",
      });

      if (response.ok) {
        await fetchMessages();
        alert("실패한 메시지들이 재발송되었습니다.");
      } else {
        alert("메시지 재발송에 실패했습니다.");
      }
    } catch (error) {
      alert("메시지 재발송 중 오류가 발생했습니다.");
    }
  };

  const handleSaveAsTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage) return;

    try {
      const response = await fetch("/api/admin/message-templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editingMessage.templateName,
          content: editingMessage.content,
          messageType: editingMessage.messageType,
          originalMessageId: selectedMessage.id,
        }),
      });

      if (response.ok) {
        setShowEditModal(false);
        setSelectedMessage(null);
        alert("템플릿이 저장되었습니다.");
      } else {
        alert("템플릿 저장에 실패했습니다.");
      }
    } catch (error) {
      alert("템플릿 저장 중 오류가 발생했습니다.");
    }
  };

  const handleFlagError = async (messageId: string) => {
    try {
      const response = await fetch(
        `/api/admin/messages/${messageId}/flag-error`,
        {
          method: "PUT",
        },
      );

      if (response.ok) {
        await fetchMessages();
        alert("오류가 플래그되었습니다.");
      } else {
        alert("오류 플래그에 실패했습니다.");
      }
    } catch (error) {
      alert("오류 플래그 중 오류가 발생했습니다.");
    }
  };

  const getChannelIcon = (channel: SentMessage["channel"]) => {
    switch (channel) {
      case "email":
        return <Mail className="w-4 h-4" />;
      case "line":
        return <MessageSquare className="w-4 h-4" />;
      case "push":
        return <Smartphone className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getChannelText = (channel: SentMessage["channel"]) => {
    switch (channel) {
      case "email":
        return "이메일";
      case "line":
        return "LINE";
      case "push":
        return "푸시";
      default:
        return "알 수 없음";
    }
  };

  const getMessageTypeText = (type: SentMessage["messageType"]) => {
    switch (type) {
      case "booking_confirmation":
        return "예약 확정";
      case "cancellation":
        return "취소";
      case "reminder":
        return "리마인드";
      case "review_request":
        return "리뷰 요청";
      case "completion":
        return "완료";
      case "other":
        return "기타";
      default:
        return "알 수 없음";
    }
  };

  const getStatusColor = (status: SentMessage["status"]) => {
    switch (status) {
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: SentMessage["status"]) => {
    switch (status) {
      case "sent":
        return "발송됨";
      case "delivered":
        return "전달됨";
      case "failed":
        return "실패";
      case "pending":
        return "대기중";
      default:
        return "알 수 없음";
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.recipientUid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesChannel =
      channelFilter === "all" || message.channel === channelFilter;
    const matchesType =
      typeFilter === "all" || message.messageType === typeFilter;
    const matchesStatus =
      statusFilter === "all" || message.status === statusFilter;

    let matchesDate = true;
    if (dateFilter !== "all") {
      const messageDate = new Date(message.sendTime);
      const now = new Date();
      const diffDays = Math.floor(
        (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      switch (dateFilter) {
        case "today":
          matchesDate = diffDays === 0;
          break;
        case "week":
          matchesDate = diffDays <= 7;
          break;
        case "month":
          matchesDate = diffDays <= 30;
          break;
      }
    }

    return (
      matchesSearch &&
      matchesChannel &&
      matchesType &&
      matchesStatus &&
      matchesDate
    );
  });

  const failedMessages = messages.filter((m) => m.status === "failed");

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">송신 메시지 이력</h1>
        <p className="text-gray-600">
          발송된 모든 메시지를 확인하고 관리합니다.
        </p>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">총 메시지</p>
              <p className="text-2xl font-bold">{messages.length}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">전달됨</p>
              <p className="text-2xl font-bold text-green-600">
                {messages.filter((m) => m.status === "delivered").length}
              </p>
            </div>
            <MessageSquare className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">실패</p>
              <p className="text-2xl font-bold text-red-600">
                {failedMessages.length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">템플릿</p>
              <p className="text-2xl font-bold text-purple-600">
                {messages.filter((m) => m.isTemplate).length}
              </p>
            </div>
            <Save className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="수신자, 내용 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체 채널</option>
              <option value="email">이메일</option>
              <option value="line">LINE</option>
              <option value="push">푸시</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체 유형</option>
              <option value="booking_confirmation">예약 확정</option>
              <option value="cancellation">취소</option>
              <option value="reminder">리마인드</option>
              <option value="review_request">리뷰 요청</option>
              <option value="completion">완료</option>
              <option value="other">기타</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체 상태</option>
              <option value="sent">발송됨</option>
              <option value="delivered">전달됨</option>
              <option value="failed">실패</option>
              <option value="pending">대기중</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체 기간</option>
              <option value="today">오늘</option>
              <option value="week">최근 7일</option>
              <option value="month">최근 30일</option>
            </select>

            {failedMessages.length > 0 && (
              <button
                onClick={handleResendAll}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <RefreshCw className="w-4 h-4" />
                <span>실패한 메시지 재발송</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 메시지 목록 */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">
            메시지 목록 ({filteredMessages.length}개)
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              메시지가 없습니다
            </h3>
            <p className="text-gray-600">검색 조건을 변경해보세요.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    발송일시
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    수신자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    채널
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    유형
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    내용
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMessages.map((message) => (
                  <tr key={message.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateTime(message.sendTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {message.recipientName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {message.recipientUid}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getChannelIcon(message.channel)}
                        <span className="text-sm text-gray-900">
                          {getChannelText(message.channel)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getMessageTypeText(message.messageType)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-900 truncate">
                          {message.content}
                        </p>
                        {message.isTemplate && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                            템플릿
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}
                      >
                        {getStatusText(message.status)}
                      </span>
                      {message.status === "failed" && message.errorMessage && (
                        <div className="text-xs text-red-600 mt-1">
                          {message.errorMessage}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedMessage(message);
                            setShowDetailModal(true);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {message.status === "failed" && (
                          <button
                            onClick={() => handleResendMessage(message.id)}
                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedMessage(message);
                            setEditingMessage({
                              content: message.content,
                              messageType: message.messageType,
                              templateName: message.templateName || "",
                            });
                            setShowEditModal(true);
                          }}
                          className="p-1 text-purple-600 hover:bg-purple-100 rounded"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        {message.status === "failed" && (
                          <button
                            onClick={() => handleFlagError(message.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 메시지 상세 보기 모달 */}
      {showDetailModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">메시지 상세</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    수신자
                  </label>
                  <div className="p-2 bg-gray-50 rounded border">
                    {selectedMessage.recipientName} (
                    {selectedMessage.recipientUid})
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    발송일시
                  </label>
                  <div className="p-2 bg-gray-50 rounded border">
                    {formatDateTime(selectedMessage.sendTime)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    채널
                  </label>
                  <div className="p-2 bg-gray-50 rounded border">
                    <div className="flex items-center space-x-2">
                      {getChannelIcon(selectedMessage.channel)}
                      <span>{getChannelText(selectedMessage.channel)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    메시지 유형
                  </label>
                  <div className="p-2 bg-gray-50 rounded border">
                    {getMessageTypeText(selectedMessage.messageType)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  상태
                </label>
                <div className="p-2 bg-gray-50 rounded border">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedMessage.status)}`}
                  >
                    {getStatusText(selectedMessage.status)}
                  </span>
                  {selectedMessage.status === "failed" &&
                    selectedMessage.errorMessage && (
                      <div className="text-sm text-red-600 mt-2">
                        오류: {selectedMessage.errorMessage}
                      </div>
                    )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  메시지 내용
                </label>
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {selectedMessage.content}
                  </p>
                </div>
              </div>

              {selectedMessage.isTemplate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    템플릿명
                  </label>
                  <div className="p-2 bg-gray-50 rounded border">
                    {selectedMessage.templateName}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                {selectedMessage.status === "failed" && (
                  <button
                    onClick={() => {
                      handleResendMessage(selectedMessage.id);
                      setShowDetailModal(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    재발송
                  </button>
                )}
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 템플릿 저장 모달 */}
      {showEditModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">템플릿으로 저장</h3>
            <form onSubmit={handleSaveAsTemplate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  템플릿명
                </label>
                <input
                  type="text"
                  value={editingMessage.templateName}
                  onChange={(e) =>
                    setEditingMessage((prev) => ({
                      ...prev,
                      templateName: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="템플릿 이름을 입력하세요"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  메시지 유형
                </label>
                <select
                  value={editingMessage.messageType}
                  onChange={(e) =>
                    setEditingMessage((prev) => ({
                      ...prev,
                      messageType: e.target.value as SentMessage["messageType"],
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="booking_confirmation">예약 확정</option>
                  <option value="cancellation">취소</option>
                  <option value="reminder">리마인드</option>
                  <option value="review_request">리뷰 요청</option>
                  <option value="completion">완료</option>
                  <option value="other">기타</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  메시지 내용
                </label>
                <textarea
                  value={editingMessage.content}
                  onChange={(e) =>
                    setEditingMessage((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="메시지 내용을 입력하세요"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  템플릿 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Send,
  MessageSquare,
  Users,
  Eye,
  Trash2,
  Calendar,
  User,
  XCircle,
  Copy,
} from "lucide-react";

interface Message {
  id: string;
  title: string;
  content: string;
  type: "notification" | "announcement" | "reminder" | "custom";
  recipients: string[];
  sender: string;
  status: "draft" | "sent" | "scheduled" | "failed";
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  readCount: number;
  totalRecipients: number;
}

interface MessageTemplate {
  id: string;
  name: string;
  type: string;
  title: string;
  content: string;
  category: string;
  isDefault: boolean;
}

const AdminMessagesPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [newMessageData, setNewMessageData] = useState({
    title: "",
    content: "",
    type: "notification" as Message["type"],
    recipients: [] as string[],
    scheduledAt: "",
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [messagesResponse, templatesResponse] = await Promise.all([
          fetch('/api/admin/messages', { credentials: 'include' }).catch(() => ({ ok: false })),
          fetch('/api/admin/message-templates', { credentials: 'include' }).catch(() => ({ ok: false })),
        ]);

        const messagesData = messagesResponse.ok ? await messagesResponse.json() : { messages: [] };
        const templatesData = templatesResponse.ok ? await templatesResponse.json() : { templates: [] };

        setMessages(messagesData.messages || []);
        setTemplates(templatesData.templates || []);
      } catch (error) {
        console.error('메시지 데이터 로딩 실패:', error);
        setMessages([]);
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.sender.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || message.type === typeFilter;
    const matchesStatus =
      statusFilter === "all" || message.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const messageStats = {
    total: messages.length,
    sent: messages.filter((m) => m.status === "sent").length,
    scheduled: messages.filter((m) => m.status === "scheduled").length,
    draft: messages.filter((m) => m.status === "draft").length,
    failed: messages.filter((m) => m.status === "failed").length,
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "notification":
        return "bg-blue-100 text-blue-800";
      case "announcement":
        return "bg-green-100 text-green-800";
      case "reminder":
        return "bg-yellow-100 text-yellow-800";
      case "custom":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRecipientsText = (recipients: string[]) => {
    const recipientMap: { [key: string]: string } = {
      all_students: "전체 학생",
      all_parents: "전체 학부모",
      all_users: "전체 사용자",
      unpaid_students: "미납 학생",
      absent_students: "결석 학생",
    };

    return recipients.map((r) => recipientMap[r] || r).join(", ");
  };

  const handleCreateMessage = () => {
    if (newMessageData.title && newMessageData.content) {
      const newMessage: Message = {
        id: Date.now().toString(),
        ...newMessageData,
        sender: "현재 관리자",
        status: newMessageData.scheduledAt ? "scheduled" : "draft",
        createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
        readCount: 0,
        totalRecipients: newMessageData.recipients.length,
      };

      setMessages([...messages, newMessage]);
      setShowNewMessageModal(false);
      setNewMessageData({
        title: "",
        content: "",
        type: "notification",
        recipients: [],
        scheduledAt: "",
      });
    }
  };

  const handleSendMessage = (messageId: string) => {
    setMessages(
      messages.map((m) =>
        m.id === messageId
          ? {
              ...m,
              status: "sent",
              sentAt: new Date()
                .toISOString()
                .replace("T", " ")
                .substring(0, 16),
            }
          : m,
      ),
    );
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((m) => m.id !== messageId));
    setSelectedMessage(null);
  };

  const handleCopyTemplate = (template: MessageTemplate) => {
    setNewMessageData({
      title: template.title,
      content: template.content,
      type: template.type as Message["type"],
      recipients: [],
      scheduledAt: "",
    });
    setShowTemplateModal(false);
    setShowNewMessageModal(true);
  };

  const recipientOptions = [
    { value: "all_students", label: "전체 학생" },
    { value: "all_parents", label: "전체 학부모" },
    { value: "all_users", label: "전체 사용자" },
    { value: "unpaid_students", label: "미납 학생" },
    { value: "absent_students", label: "결석 학생" },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">메시지 관리</h1>
          <p className="text-gray-600">
            알림, 공지사항, 리마인더 메시지를 관리할 수 있습니다.
          </p>
        </div>

        {/* Message Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">전체 메시지</p>
                <p className="text-2xl font-bold text-gray-900">
                  {messageStats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Send className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">발송됨</p>
                <p className="text-2xl font-bold text-green-600">
                  {messageStats.sent}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">예약됨</p>
                <p className="text-2xl font-bold text-blue-600">
                  {messageStats.scheduled}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">초안</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {messageStats.draft}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">실패</p>
                <p className="text-2xl font-bold text-red-600">
                  {messageStats.failed}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="메시지 제목, 내용, 발신자로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">전체 유형</option>
                  <option value="notification">알림</option>
                  <option value="announcement">공지사항</option>
                  <option value="reminder">리마인더</option>
                  <option value="custom">커스텀</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">전체 상태</option>
                  <option value="sent">발송됨</option>
                  <option value="scheduled">예약됨</option>
                  <option value="draft">초안</option>
                  <option value="failed">실패</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowTemplateModal(true)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  템플릿
                </button>
                <button
                  onClick={() => setShowNewMessageModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />새 메시지
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMessages.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              등록된 메시지가 없습니다.
            </div>
          ) : (
            filteredMessages.map((message) => (
            <div
              key={message.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3
                      className="text-lg font-semibold text-gray-900 mb-2 cursor-pointer hover:text-blue-600"
                      onClick={() => setSelectedMessage(message)}
                    >
                      {message.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(message.type)}`}
                      >
                        {message.type === "notification" && "알림"}
                        {message.type === "announcement" && "공지사항"}
                        {message.type === "reminder" && "리마인더"}
                        {message.type === "custom" && "커스텀"}
                      </span>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(message.status)}`}
                      >
                        {message.status === "sent" && "발송됨"}
                        {message.status === "scheduled" && "예약됨"}
                        {message.status === "draft" && "초안"}
                        {message.status === "failed" && "실패"}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {message.content}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="h-4 w-4 mr-2" />
                    <span>발신자: {message.sender}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-2" />
                    <span>수신자: {getRecipientsText(message.recipients)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>생성일: {message.createdAt}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>
                      읽음: {message.readCount}/{message.totalRecipients}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedMessage(message)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {message.status === "draft" && (
                      <button
                        onClick={() => handleSendMessage(message.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteMessage(message.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            ))
          )}
        </div>
      </div>

      {/* New Message Modal */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                새 메시지 작성
              </h2>
              <button
                onClick={() => setShowNewMessageModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목 *
                </label>
                <input
                  type="text"
                  value={newMessageData.title}
                  onChange={(e) =>
                    setNewMessageData({
                      ...newMessageData,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="메시지 제목을 입력하세요"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    메시지 유형 *
                  </label>
                  <select
                    value={newMessageData.type}
                    onChange={(e) =>
                      setNewMessageData({
                        ...newMessageData,
                        type: e.target.value as Message["type"],
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="notification">알림</option>
                    <option value="announcement">공지사항</option>
                    <option value="reminder">리마인더</option>
                    <option value="custom">커스텀</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    예약 발송
                  </label>
                  <input
                    type="datetime-local"
                    value={newMessageData.scheduledAt}
                    onChange={(e) =>
                      setNewMessageData({
                        ...newMessageData,
                        scheduledAt: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  수신자 *
                </label>
                <div className="space-y-2">
                  {recipientOptions.map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newMessageData.recipients.includes(
                          option.value,
                        )}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewMessageData({
                              ...newMessageData,
                              recipients: [
                                ...newMessageData.recipients,
                                option.value,
                              ],
                            });
                          } else {
                            setNewMessageData({
                              ...newMessageData,
                              recipients: newMessageData.recipients.filter(
                                (r) => r !== option.value,
                              ),
                            });
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  내용 *
                </label>
                <textarea
                  value={newMessageData.content}
                  onChange={(e) =>
                    setNewMessageData({
                      ...newMessageData,
                      content: e.target.value,
                    })
                  }
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="메시지 내용을 입력하세요"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowNewMessageModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleCreateMessage}
                  disabled={
                    !newMessageData.title ||
                    !newMessageData.content ||
                    newMessageData.recipients.length === 0
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  메시지 저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">메시지 템플릿</h2>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {templates.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  등록된 템플릿이 없습니다.
                </div>
              ) : (
                templates.map((template) => (
                <div
                  key={template.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {template.name}
                    </h3>
                    {template.isDefault && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        기본
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {template.description}
                  </p>
                  <div className="text-sm text-gray-500 mb-3">
                    <strong>제목:</strong> {template.title}
                  </div>
                  <div className="text-sm text-gray-500 mb-3">
                    <strong>내용:</strong> {template.content}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {template.category}
                    </span>
                    <button
                      onClick={() => handleCopyTemplate(template)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      사용하기
                    </button>
                  </div>
                </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                메시지 상세 정보
              </h2>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    기본 정보
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        제목:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedMessage.title}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        유형:
                      </span>
                      <span
                        className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(selectedMessage.type)}`}
                      >
                        {selectedMessage.type === "notification" && "알림"}
                        {selectedMessage.type === "announcement" && "공지사항"}
                        {selectedMessage.type === "reminder" && "리마인더"}
                        {selectedMessage.type === "custom" && "커스텀"}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        상태:
                      </span>
                      <span
                        className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedMessage.status)}`}
                      >
                        {selectedMessage.status === "sent" && "발송됨"}
                        {selectedMessage.status === "scheduled" && "예약됨"}
                        {selectedMessage.status === "draft" && "초안"}
                        {selectedMessage.status === "failed" && "실패"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    발송 정보
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        발신자:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedMessage.sender}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        수신자:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {getRecipientsText(selectedMessage.recipients)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        읽음:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedMessage.readCount}/
                        {selectedMessage.totalRecipients}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  내용
                </h3>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {selectedMessage.content}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    날짜 정보
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        생성일:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedMessage.createdAt}
                      </span>
                    </div>
                    {selectedMessage.sentAt && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          발송일:
                        </span>
                        <span className="ml-2 text-sm text-gray-900">
                          {selectedMessage.sentAt}
                        </span>
                      </div>
                    )}
                    {selectedMessage.scheduledAt && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          예약일:
                        </span>
                        <span className="ml-2 text-sm text-gray-900">
                          {selectedMessage.scheduledAt}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                {selectedMessage.status === "draft" && (
                  <button
                    onClick={() => handleSendMessage(selectedMessage.id)}
                    className="px-4 py-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    발송
                  </button>
                )}
                <button
                  onClick={() => handleDeleteMessage(selectedMessage.id)}
                  className="px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  삭제
                </button>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessagesPage;

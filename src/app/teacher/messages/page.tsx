"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  Send,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  Home,
  Plus,
} from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  sender: string;
  recipient: string;
  subject: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  priority: "low" | "medium" | "high";
  type: "inbox" | "sent" | "draft";
}

export default function TeacherMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<
    "all" | "inbox" | "sent" | "draft"
  >("inbox");
  const [priorityFilter, setPriorityFilter] = useState<
    "all" | "low" | "medium" | "high"
  >("all");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showComposeModal, setShowComposeModal] = useState(false);

  useEffect(() => {
    // 실제 API 호출로 대체
    setTimeout(() => {
      const mockMessages: Message[] = [
        {
          id: "1",
          sender: "관리자",
          recipient: "김선생님",
          subject: "새로운 학생 배정 안내",
          content:
            "안녕하세요, 김선생님. 새로운 학생이 배정되었습니다. 학생 정보를 확인해주시기 바랍니다.",
          timestamp: "2024-01-15T10:30:00",
          isRead: false,
          priority: "high",
          type: "inbox",
        },
        {
          id: "2",
          sender: "김선생님",
          recipient: "관리자",
          subject: "수업 자료 요청",
          content:
            "중급 문법 교재가 필요합니다. 가능하시면 빨리 준비해주시기 바랍니다.",
          timestamp: "2024-01-15T09:15:00",
          isRead: true,
          priority: "medium",
          type: "sent",
        },
        {
          id: "3",
          sender: "이학생",
          recipient: "김선생님",
          subject: "수업 일정 변경 요청",
          content:
            "선생님, 다음 주 수업 일정을 변경하고 싶습니다. 가능하신가요?",
          timestamp: "2024-01-14T16:45:00",
          isRead: true,
          priority: "medium",
          type: "inbox",
        },
        {
          id: "4",
          sender: "김선생님",
          recipient: "박학생",
          subject: "숙제 피드백",
          content:
            "박학생, 지난 주 숙제를 잘 해주었습니다. 특히 문법 부분이 많이 개선되었어요.",
          timestamp: "2024-01-14T14:20:00",
          isRead: true,
          priority: "low",
          type: "sent",
        },
        {
          id: "5",
          sender: "시스템",
          recipient: "김선생님",
          subject: "급여 지급 완료",
          content:
            "이번 달 급여가 지급되었습니다. 계좌를 확인해주시기 바랍니다.",
          timestamp: "2024-01-14T12:00:00",
          isRead: false,
          priority: "high",
          type: "inbox",
        },
      ];

      setMessages(mockMessages);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.recipient.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "all" || message.type === typeFilter;
    const matchesPriority =
      priorityFilter === "all" || message.priority === priorityFilter;

    return matchesSearch && matchesType && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "높음";
      case "medium":
        return "보통";
      case "low":
        return "낮음";
      default:
        return "알 수 없음";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="w-4 h-4" />;
      case "medium":
        return <Clock className="w-4 h-4" />;
      case "low":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "방금 전";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}시간 전`;
    } else {
      return date.toLocaleDateString();
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">메시지</h1>
            <p className="text-lg text-gray-600">
              메시지를 확인하고 관리하세요
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowComposeModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />새 메시지
            </button>
            <Link
              href="/teacher/home"
              className="flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Home className="w-5 h-5" />
              선생님 홈
            </Link>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">총 메시지</p>
                <p className="text-2xl font-bold text-gray-900">
                  {messages.length}개
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">받은 메시지</p>
                <p className="text-2xl font-bold text-blue-600">
                  {messages.filter((m) => m.type === "inbox").length}개
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">보낸 메시지</p>
                <p className="text-2xl font-bold text-green-600">
                  {messages.filter((m) => m.type === "sent").length}개
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Send className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">읽지 않은 메시지</p>
                <p className="text-2xl font-bold text-red-600">
                  {messages.filter((m) => !m.isRead).length}개
                </p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="제목, 내용, 발신자 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(
                  e.target.value as "all" | "inbox" | "sent" | "draft",
                )
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="inbox">받은 메시지</option>
              <option value="sent">보낸 메시지</option>
              <option value="draft">임시저장</option>
              <option value="all">전체</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(
                  e.target.value as "all" | "low" | "medium" | "high",
                )
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">전체 우선순위</option>
              <option value="high">높음</option>
              <option value="medium">보통</option>
              <option value="low">낮음</option>
            </select>

            <div className="text-sm text-gray-600">
              총 {filteredMessages.length}개의 메시지
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메시지 목록 */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                메시지 목록
              </h2>
            </div>

            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => setSelectedMessage(message)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedMessage?.id === message.id
                      ? "bg-blue-50 border-r-4 border-blue-500"
                      : ""
                  } ${!message.isRead ? "bg-yellow-50" : ""}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(message.priority)}`}
                      >
                        {getPriorityIcon(message.priority)}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {message.type === "inbox"
                          ? message.sender
                          : message.recipient}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>

                  <h3
                    className={`text-sm font-medium mb-1 ${!message.isRead ? "text-gray-900" : "text-gray-600"}`}
                  >
                    {message.subject}
                  </h3>

                  <p className="text-xs text-gray-500 line-clamp-2">
                    {message.content}
                  </p>

                  {!message.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 메시지 상세 */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg">
            {selectedMessage ? (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {selectedMessage.subject}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>
                        {selectedMessage.type === "inbox"
                          ? "보낸 사람"
                          : "받는 사람"}
                        :
                        {selectedMessage.type === "inbox"
                          ? selectedMessage.sender
                          : selectedMessage.recipient}
                      </span>
                      <span>{formatTime(selectedMessage.timestamp)}</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedMessage.priority)}`}
                      >
                        {getPriorityText(selectedMessage.priority)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg">
                      <Send className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg">
                      <AlertCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedMessage.content}
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    답장하기
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>메시지를 선택하세요</p>
              </div>
            )}
          </div>
        </div>

        {/* 새 메시지 작성 모달 */}
        {showComposeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  새 메시지
                </h3>
                <button
                  onClick={() => setShowComposeModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    받는 사람
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">받는 사람 선택</option>
                    <option value="admin">관리자</option>
                    <option value="student1">김학생</option>
                    <option value="student2">이학생</option>
                    <option value="student3">박학생</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    제목
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="제목을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    내용
                  </label>
                  <textarea
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="메시지 내용을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    우선순위
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="low">낮음</option>
                    <option value="medium">보통</option>
                    <option value="high">높음</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowComposeModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    // 전송 로직
                    setShowComposeModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  전송
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2 } from "lucide-react";

interface Message {
  id: string;
  title: string;
  content: string;
  recipient: string;
  recipientType: "student" | "parent" | "teacher" | "all";
  recipientTypes: string[]; // 중복 선택을 위한 배열
  sendDate: string;
  status: "sent" | "pending" | "failed";
  priority: "low" | "medium" | "high";
}

interface Recipient {
  id: string;
  name: string;
  type: "student" | "parent" | "teacher";
  email: string;
}

const MessagesPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipientTypes, setSelectedRecipientTypes] = useState<
    string[]
  >([]);
  const [newMessage, setNewMessage] = useState({
    title: "",
    content: "",
    recipient: "",
    recipientType: "student" as const,
    recipientTypes: [] as string[],
    priority: "medium" as const,
  });

  useEffect(() => {
    // Mock data
    const mockData: Message[] = [
      {
        id: "1",
        title: "수업 리마인드",
        content: "내일 오후 2시 수학 수업이 있습니다. 준비물을 챙겨주세요.",
        recipient: "김학생",
        recipientType: "student",
        recipientTypes: ["student"],
        sendDate: "2024-01-15 14:30",
        status: "sent",
        priority: "medium",
      },
      {
        id: "2",
        title: "상담 안내",
        content: "학부모님과의 상담 일정을 안내드립니다.",
        recipient: "이학부모",
        recipientType: "parent",
        recipientTypes: ["parent"],
        sendDate: "2024-01-15 10:00",
        status: "sent",
        priority: "high",
      },
      {
        id: "3",
        title: "시스템 점검 안내",
        content: "오늘 밤 12시부터 시스템 점검이 예정되어 있습니다.",
        recipient: "전체",
        recipientType: "all",
        recipientTypes: ["student", "parent", "teacher"],
        sendDate: "2024-01-15 09:00",
        status: "pending",
        priority: "low",
      },
    ];

    // 수신자 목록 모의 데이터
    const mockRecipients: Recipient[] = [
      {
        id: "1",
        name: "김학생",
        type: "student",
        email: "student1@example.com",
      },
      {
        id: "2",
        name: "이학생",
        type: "student",
        email: "student2@example.com",
      },
      {
        id: "3",
        name: "김부모님",
        type: "parent",
        email: "parent1@example.com",
      },
      {
        id: "4",
        name: "이부모님",
        type: "parent",
        email: "parent2@example.com",
      },
      {
        id: "5",
        name: "박선생님",
        type: "teacher",
        email: "teacher1@example.com",
      },
      {
        id: "6",
        name: "최선생님",
        type: "teacher",
        email: "teacher2@example.com",
      },
    ];
    setRecipients(mockRecipients);
    setMessages(mockData);
    setFilteredMessages(mockData);
  }, []);

  useEffect(() => {
    let filtered = messages;

    if (selectedStatus !== "all") {
      filtered = filtered.filter((msg) => msg.status === selectedStatus);
    }

    if (selectedType !== "all") {
      filtered = filtered.filter((msg) => msg.recipientType === selectedType);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (msg) =>
          msg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          msg.recipient.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredMessages(filtered);
  }, [messages, selectedStatus, selectedType, searchTerm]);

  const handleSendMessage = () => {
    if (newMessage.title && newMessage.content) {
      const message: Message = {
        id: Date.now().toString(),
        title: newMessage.title,
        content: newMessage.content,
        recipient: newMessage.recipient,
        recipientType: newMessage.recipientType,
        sendDate: new Date().toISOString().replace("T", " ").substring(0, 16),
        status: "pending",
        priority: newMessage.priority,
      };

      setMessages((prev) => [message, ...prev]);
      setNewMessage({
        title: "",
        content: "",
        recipient: "",
        recipientType: "student",
        recipientTypes: [],
        priority: "medium",
      });
      setShowComposeModal(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "sent":
        return "전송완료";
      case "pending":
        return "전송대기";
      case "failed":
        return "전송실패";
      default:
        return "알 수 없음";
    }
  };

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

  const getRecipientTypeText = (type: string) => {
    switch (type) {
      case "student":
        return "학생";
      case "parent":
        return "학부모";
      case "teacher":
        return "강사";
      case "all":
        return "전체";
      default:
        return "알 수 없음";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">메시지 관리</h1>
          <p className="text-gray-600">
            학생, 학부모, 강사에게 메시지를 발송하고 관리하세요
          </p>
        </div>
        <button
          onClick={() => setShowComposeModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          메시지 작성
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              전송 상태
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">전체</option>
              <option value="sent">전송완료</option>
              <option value="pending">전송대기</option>
              <option value="failed">전송실패</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              수신자 유형
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">전체</option>
              <option value="student">학생</option>
              <option value="parent">학부모</option>
              <option value="teacher">강사</option>
              <option value="all">전체</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              검색
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="제목, 내용, 수신자 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedStatus("all");
                setSelectedType("all");
                setSearchTerm("");
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              필터 초기화
            </button>
          </div>
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  제목
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  수신자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  수신자 유형
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  전송일시
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  우선순위
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMessages.map((message) => (
                <tr key={message.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {message.title}
                    </div>
                    <div className="text-sm text-gray-500 max-w-xs truncate">
                      {message.content}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {message.recipient}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getRecipientTypeText(message.recipientType)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {message.sendDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(message.status)}`}
                    >
                      {getStatusText(message.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(message.priority)}`}
                    >
                      {getPriorityText(message.priority)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compose Message Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              메시지 작성
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  제목
                </label>
                <input
                  type="text"
                  value={newMessage.title}
                  onChange={(e) =>
                    setNewMessage((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="메시지 제목을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  내용
                </label>
                <textarea
                  value={newMessage.content}
                  onChange={(e) =>
                    setNewMessage((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="메시지 내용을 입력하세요"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    수신자
                  </label>
                  <input
                    type="text"
                    value={newMessage.recipient}
                    onChange={(e) =>
                      setNewMessage((prev) => ({
                        ...prev,
                        recipient: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="수신자 이름 또는 '전체'"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    수신자 유형
                  </label>
                  <select
                    value={newMessage.recipientType}
                    onChange={(e) =>
                      setNewMessage((prev) => ({
                        ...prev,
                        recipientType: e.target.value as any,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="student">학생</option>
                    <option value="parent">학부모</option>
                    <option value="teacher">강사</option>
                    <option value="all">전체</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  우선순위
                </label>
                <select
                  value={newMessage.priority}
                  onChange={(e) =>
                    setNewMessage((prev) => ({
                      ...prev,
                      priority: e.target.value as any,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">낮음</option>
                  <option value="medium">보통</option>
                  <option value="high">높음</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSendMessage}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                발송
              </button>
              <button
                onClick={() => setShowComposeModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;

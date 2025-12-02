"use client";

import { useState } from "react";
import {
  MessageSquare,
  Send,
  Search,
  User,
  Calendar,
  Paperclip,
  MoreVertical,
  Reply,
  Trash2,
} from "lucide-react";

// Mock data for messages
const mockMessages = [
  {
    id: 1,
    sender: "김영희",
    senderType: "teacher",
    subject: "수학 과제 관련 문의",
    content:
      "안녕하세요. 민수 어머니, 오늘 수학 과제에서 민수가 어려워하는 부분이 있어서 연락드립니다. 분수 개념을 이해하는데 조금 더 도움이 필요할 것 같아요. 혹시 집에서도 추가로 설명해주실 수 있으시면 좋겠습니다.",
    date: "2024-01-15 14:30",
    isRead: false,
    priority: "high",
    childName: "김민수",
    subjectName: "수학",
  },
  {
    id: 2,
    sender: "박철수",
    senderType: "teacher",
    subject: "영어 발음 교정 안내",
    content:
      '민수 어머니께, 오늘 영어 수업에서 민수의 발음이 많이 좋아졌습니다. 특히 "th" 발음을 정말 잘 하고 있어요. 계속해서 연습해주시면 더욱 좋을 것 같습니다.',
    date: "2024-01-14 16:45",
    isRead: true,
    priority: "normal",
    childName: "김민수",
    subjectName: "영어",
  },
  {
    id: 3,
    sender: "이미영",
    senderType: "teacher",
    subject: "과학 실험 준비물 안내",
    content:
      "다음 주 과학 실험을 위해 준비물이 필요합니다. 실험실에서 사용할 안전 고글과 실험복을 준비해주시면 감사하겠습니다. 실험은 화학 반응에 대한 내용입니다.",
    date: "2024-01-13 10:20",
    isRead: true,
    priority: "normal",
    childName: "김민수",
    subjectName: "과학",
  },
  {
    id: 4,
    sender: "최동욱",
    senderType: "teacher",
    subject: "국어 독서 과제 확인",
    content:
      "민수가 제출한 독서 감상문을 확인했습니다. 정말 잘 썼네요! 특히 주인공의 감정 변화를 잘 분석했고, 자신의 생각도 잘 표현했습니다. 계속해서 독서 습관을 유지해주세요.",
    date: "2024-01-12 15:10",
    isRead: true,
    priority: "normal",
    childName: "김민수",
    subjectName: "국어",
  },
  {
    id: 5,
    sender: "정수진",
    senderType: "teacher",
    subject: "음악 발표회 안내",
    content:
      "다음 달 음악 발표회가 예정되어 있습니다. 민수가 피아노 연주를 하게 될 예정이니, 연습을 더 열심히 해주시면 좋겠습니다. 발표회 일정은 추후 상세히 안내드리겠습니다.",
    date: "2024-01-11 09:30",
    isRead: true,
    priority: "high",
    childName: "김민수",
    subjectName: "음악",
  },
];

const teachers = [
  { id: 1, name: "김영희", subject: "수학" },
  { id: 2, name: "박철수", subject: "영어" },
  { id: 3, name: "이미영", subject: "과학" },
  { id: 4, name: "최동욱", subject: "국어" },
  { id: 5, name: "정수진", subject: "음악" },
];

export default function MessagesPage() {
  const [selectedMessage, setSelectedMessage] = useState<
    (typeof mockMessages)[0] | null
  >(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("전체");
  const [selectedPriority, setSelectedPriority] = useState("전체");
  const [showCompose, setShowCompose] = useState(false);
  const [newMessage, setNewMessage] = useState({
    recipient: "",
    subject: "",
    content: "",
  });

  const filteredMessages = mockMessages.filter((message) => {
    const matchesSearch =
      message.subject.includes(searchTerm) ||
      message.sender.includes(searchTerm) ||
      message.content.includes(searchTerm);
    const matchesTeacher =
      selectedTeacher === "전체" || message.sender === selectedTeacher;
    const matchesPriority =
      selectedPriority === "전체" || message.priority === selectedPriority;

    return matchesSearch && matchesTeacher && matchesPriority;
  });

  const unreadCount = mockMessages.filter((message) => !message.isRead).length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-100";
      case "normal":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const handleSendMessage = () => {
    // Here you would typically send the message to the backend
    console.log("Sending message:", newMessage);
    setShowCompose(false);
    setNewMessage({ recipient: "", subject: "", content: "" });
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">메시지</h1>
        <p className="text-gray-600">선생님들과 소통하고 메시지를 확인하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <MessageSquare className="w-8 h-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 메시지</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockMessages.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <MessageSquare className="w-8 h-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                읽지 않은 메시지
              </p>
              <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <User className="w-8 h-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">연락 선생님</p>
              <p className="text-2xl font-bold text-gray-900">
                {teachers.length}명
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">최근 메시지</p>
              <p className="text-2xl font-bold text-gray-900">2024-01-15</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 메시지 목록 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border">
            {/* 헤더 */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  메시지 목록
                </h2>
                <button
                  onClick={() => setShowCompose(true)}
                  className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Send className="w-4 h-4 mr-1" />새 메시지
                </button>
              </div>

              {/* 필터 */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="메시지 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="전체">전체 선생님</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.name}>
                      {teacher.name} ({teacher.subject})
                    </option>
                  ))}
                </select>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="전체">전체 우선순위</option>
                  <option value="high">높음</option>
                  <option value="normal">보통</option>
                </select>
              </div>
            </div>

            {/* 메시지 목록 */}
            <div className="max-h-96 overflow-y-auto">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => setSelectedMessage(message)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedMessage?.id === message.id
                      ? "bg-blue-50 border-blue-200"
                      : ""
                  } ${!message.isRead ? "bg-blue-50" : ""}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3
                        className={`text-sm font-medium ${!message.isRead ? "text-gray-900" : "text-gray-600"}`}
                      >
                        {message.subject}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {message.sender} • {message.subjectName}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!message.isRead && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(message.priority)}`}
                      >
                        {message.priority === "high" ? "높음" : "보통"}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {message.content}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">{message.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 메시지 상세 */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {selectedMessage.subject}
                    </h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>
                        보낸 사람: {selectedMessage.sender} (
                        {selectedMessage.subjectName})
                      </span>
                      <span>아이: {selectedMessage.childName}</span>
                      <span>{selectedMessage.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 text-sm rounded-full ${getPriorityColor(selectedMessage.priority)}`}
                    >
                      {selectedMessage.priority === "high" ? "높음" : "보통"}
                    </span>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.content}
                  </p>
                </div>

                <div className="flex items-center space-x-4 mt-8 pt-6 border-t border-gray-200">
                  <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    <Reply className="w-4 h-4 mr-2" />
                    답장
                  </button>
                  <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                    <Paperclip className="w-4 h-4 mr-2" />
                    첨부파일
                  </button>
                  <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                    <Trash2 className="w-4 h-4 mr-2" />
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                메시지를 선택하여 내용을 확인하세요
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 새 메시지 작성 모달 */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              새 메시지 작성
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  받는 사람
                </label>
                <select
                  value={newMessage.recipient}
                  onChange={(e) =>
                    setNewMessage({ ...newMessage, recipient: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">선생님 선택</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.name}>
                      {teacher.name} ({teacher.subject})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목
                </label>
                <input
                  type="text"
                  value={newMessage.subject}
                  onChange={(e) =>
                    setNewMessage({ ...newMessage, subject: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="메시지 제목을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  내용
                </label>
                <textarea
                  value={newMessage.content}
                  onChange={(e) =>
                    setNewMessage({ ...newMessage, content: e.target.value })
                  }
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="메시지 내용을 입력하세요"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowCompose(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSendMessage}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Send className="w-4 h-4 mr-2" />
                보내기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

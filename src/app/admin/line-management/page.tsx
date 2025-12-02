"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  CheckCircle,
  XCircle,
  Search,
  Send,
  RefreshCw,
} from "lucide-react";

interface LINEUser {
  uid: string;
  name: string;
  lineUserId?: string;
  isLinked: boolean;
  lastActivity?: string;
  notificationFrequency: "daily" | "weekly" | "monthly" | "custom";
  reminderEnabled: boolean;
}

interface NotificationTemplate {
  id: string;
  name: string;
  content: string;
  type: "reminder" | "review" | "homework" | "general";
}

export default function LINEManagementPage() {
  const [users, setUsers] = useState<LINEUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<LINEUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "linked" | "unlinked"
  >("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [notificationTemplates, setNotificationTemplates] = useState<
    NotificationTemplate[]
  >([]);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Mock data initialization
  useEffect(() => {
    const initializeData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockUsers: LINEUser[] = [
        {
          uid: "STU001",
          name: "김학생",
          lineUserId: "U1234567890abcdef",
          isLinked: true,
          lastActivity: "2024-01-15 14:30",
          notificationFrequency: "weekly",
          reminderEnabled: true,
        },
        {
          uid: "STU002",
          name: "이학생",
          lineUserId: "U2345678901bcdef",
          isLinked: true,
          lastActivity: "2024-01-14 16:20",
          notificationFrequency: "daily",
          reminderEnabled: true,
        },
        {
          uid: "STU003",
          name: "박학생",
          isLinked: false,
          notificationFrequency: "weekly",
          reminderEnabled: false,
        },
        {
          uid: "STU004",
          name: "최학생",
          lineUserId: "U3456789012cdef",
          isLinked: true,
          lastActivity: "2024-01-13 10:15",
          notificationFrequency: "monthly",
          reminderEnabled: true,
        },
        {
          uid: "STU005",
          name: "정학생",
          isLinked: false,
          notificationFrequency: "weekly",
          reminderEnabled: false,
        },
      ];

      const mockTemplates: NotificationTemplate[] = [
        {
          id: "1",
          name: "수업 리마인드",
          content: "내일 오후 2시 수업이 있습니다. 준비물을 챙겨주세요!",
          type: "reminder",
        },
        {
          id: "2",
          name: "리뷰 요청",
          content: "수업이 끝났습니다. 수업 후기를 작성해주세요!",
          type: "review",
        },
        {
          id: "3",
          name: "숙제 알림",
          content: "숙제 제출 기한이 다가왔습니다. 확인해주세요!",
          type: "homework",
        },
        {
          id: "4",
          name: "월말 예약 알림",
          content: "이번 달 예약이 부족합니다. 추가 예약을 고려해보세요!",
          type: "general",
        },
      ];

      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
      setNotificationTemplates(mockTemplates);
      setIsLoading(false);
    };

    initializeData();
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = users;

    // Filter by status
    if (filterStatus === "linked") {
      filtered = filtered.filter((user) => user.isLinked);
    } else if (filterStatus === "unlinked") {
      filtered = filtered.filter((user) => !user.isLinked);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.uid.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, filterStatus]);

  const handleUserSelect = (uid: string) => {
    setSelectedUsers((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid],
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((user) => user.uid));
    }
  };

  const handleSendNotification = () => {
    if (selectedUsers.length === 0) return;

    const message = selectedTemplate
      ? notificationTemplates.find((t) => t.id === selectedTemplate)?.content ||
        customMessage
      : customMessage;

    // Mock sending notification
    console.log("Sending notification to:", selectedUsers, "Message:", message);

    // Reset form
    setShowSendModal(false);
    setSelectedTemplate("");
    setCustomMessage("");
    setSelectedUsers([]);
  };

  const handleLinkUser = (uid: string) => {
    // Mock linking user
    setUsers((prev) =>
      prev.map((user) =>
        user.uid === uid
          ? {
              ...user,
              isLinked: true,
              lineUserId: "U" + Math.random().toString(36).substr(2, 9),
            }
          : user,
      ),
    );
  };

  const getLinkedCount = () => users.filter((user) => user.isLinked).length;
  const getUnlinkedCount = () => users.filter((user) => !user.isLinked).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            LINE 연동 관리
          </h1>
          <p className="text-gray-600">
            LINE 연동 상태를 관리하고 알림을 발송할 수 있습니다.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">전체 사용자</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">연동 완료</p>
                <p className="text-2xl font-bold text-gray-900">
                  {getLinkedCount()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <XCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">미연동</p>
                <p className="text-2xl font-bold text-gray-900">
                  {getUnlinkedCount()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="사용자 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) =>
                    setFilterStatus(
                      e.target.value as "all" | "linked" | "unlinked",
                    )
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">전체</option>
                  <option value="linked">연동됨</option>
                  <option value="unlinked">미연동</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowSendModal(true)}
                  disabled={selectedUsers.length === 0}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4 mr-2" />
                  알림 발송 ({selectedUsers.length})
                </button>

                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  새로고침
                </button>
              </div>
            </div>
          </div>

          {/* User List */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedUsers.length === filteredUsers.length &&
                        filteredUsers.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    사용자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    LINE 연동 상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    마지막 활동
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    알림 설정
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.uid} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.uid)}
                        onChange={() => handleUserSelect(user.uid)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">{user.uid}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isLinked ? (
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          <span className="text-sm text-green-600">연동됨</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <XCircle className="w-4 h-4 text-red-500 mr-2" />
                          <span className="text-sm text-red-600">미연동</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastActivity || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.reminderEnabled
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.reminderEnabled ? "활성화" : "비활성화"}
                        </span>
                        <span className="text-sm text-gray-500">
                          {user.notificationFrequency === "daily" && "매일"}
                          {user.notificationFrequency === "weekly" && "주 1회"}
                          {user.notificationFrequency === "monthly" && "월 1회"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {!user.isLinked && (
                        <button
                          onClick={() => handleLinkUser(user.uid)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          연동 유도
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Send Notification Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                알림 발송
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  템플릿 선택
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">직접 입력</option>
                  {notificationTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  메시지 내용
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="발송할 메시지를 입력하세요..."
                />
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  선택된 사용자: {selectedUsers.length}명
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowSendModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  취소
                </button>
                <button
                  onClick={handleSendNotification}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  발송
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

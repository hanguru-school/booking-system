"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  BookOpen,
  Calendar,
  FileText,
  Clock,
} from "lucide-react";

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  type: "note" | "reservation" | "homework";
  isRead: boolean;
}

export default function StudentNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "새로운 레슨노트가 업로드되었습니다",
      message: "김선생님의 수업 노트를 확인해보세요",
      time: "5분 전",
      type: "note",
      isRead: false,
    },
    {
      id: 2,
      title: "내일 수업이 있습니다",
      message: "오후 2시 김선생님과의 수업을 잊지 마세요",
      time: "1시간 전",
      type: "reservation",
      isRead: false,
    },
    {
      id: 3,
      title: "새로운 숙제가 등록되었습니다",
      message: "문법 연습 문제를 풀어보세요",
      time: "2시간 전",
      type: "homework",
      isRead: true,
    },
    {
      id: 4,
      title: "수업 일정이 변경되었습니다",
      message: "다음 주 수요일 수업이 목요일로 변경되었습니다",
      time: "3시간 전",
      type: "reservation",
      isRead: true,
    },
    {
      id: 5,
      title: "레슨노트 피드백이 있습니다",
      message: "지난 주 작문 숙제에 대한 피드백을 확인해보세요",
      time: "1일 전",
      type: "note",
      isRead: true,
    },
  ]);

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification,
      ),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true })),
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "note":
        return <BookOpen className="w-5 h-5 text-blue-600" />;
      case "reservation":
        return <Calendar className="w-5 h-5 text-green-600" />;
      case "homework":
        return <FileText className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "note":
        return "bg-blue-100 text-blue-800";
      case "reservation":
        return "bg-green-100 text-green-800";
      case "homework":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/student/home"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>홈으로 돌아가기</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="text-lg font-semibold text-gray-900">알림</span>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              모두 읽음으로 표시
            </button>
          )}
        </div>
      </div>

      {/* 알림 목록 */}
      <div className="bg-white rounded-xl shadow-lg">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              알림이 없습니다
            </h3>
            <p className="text-gray-600">
              새로운 알림이 오면 여기에 표시됩니다
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.isRead ? "bg-blue-50" : ""
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3
                        className={`text-sm font-medium ${
                          !notification.isRead
                            ? "text-gray-900"
                            : "text-gray-700"
                        }`}
                      >
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}
                        >
                          {notification.type === "note"
                            ? "레슨노트"
                            : notification.type === "reservation"
                              ? "예약"
                              : notification.type === "homework"
                                ? "숙제"
                                : "기타"}
                        </span>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {notification.time}
                      </span>
                      {!notification.isRead && (
                        <span className="text-xs text-blue-600 font-medium">
                          읽지 않음
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 필터 및 정렬 옵션 */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            총 {notifications.length}개의 알림
          </span>
          <span className="text-sm text-blue-600">
            읽지 않은 알림 {unreadCount}개
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md hover:bg-gray-100">
            최신순
          </button>
          <button className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md hover:bg-gray-100">
            읽지 않은 것만
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Calendar,
  BookOpen,
  Settings,
  BarChart3,
  MessageSquare,
  FileText,
  Menu,
  X,
  LogOut,
  Bell,
  Clock,
  DollarSign,
  QrCode,
  Folder,
} from "lucide-react";

const navigation = [
  { name: "대시보드", href: "/teacher/home", icon: Home },
  { name: "출근하기", href: "/teacher/attendance", icon: Clock },
  { name: "학생 노트 작성하기", href: "/teacher/lesson-notes", icon: FileText },
  { name: "일정 관리", href: "/teacher/schedule", icon: Calendar },
  { name: "수업 관리", href: "/teacher/classes", icon: BookOpen },
  { name: "학습 자료", href: "/teacher/materials", icon: Folder },
  { name: "메시지", href: "/teacher/messages", icon: MessageSquare },
  { name: "성과 분석", href: "/teacher/performance", icon: BarChart3 },
  { name: "급여 확인하기", href: "/teacher/salary", icon: DollarSign },
  { name: "QR코드 표시", href: "/teacher/qr-display", icon: QrCode },
  { name: "설정", href: "/teacher/settings", icon: Settings },
];

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      // 쿠키 삭제
      document.cookie =
        "user-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      // 로컬 스토리지 삭제
      localStorage.removeItem("authToken");
      // 로그인 페이지로 리다이렉트
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("로그아웃 오류:", error);
      // 오류 발생 시 강제로 로그인 페이지로 이동
      window.location.href = "/auth/login";
    }
  };

  const notifications = [
    {
      id: 1,
      message: "새로운 수업 예약이 있습니다.",
      time: "5분 전",
      read: false,
    },
    {
      id: 2,
      message: "학생 노트 작성이 요청되었습니다.",
      time: "10분 전",
      read: false,
    },
    {
      id: 3,
      message: "급여 지급이 완료되었습니다.",
      time: "1시간 전",
      read: true,
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 모바일 사이드바 오버레이 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-green-900 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-green-800">
          <h1 className="text-xl font-bold text-white">선생님 포털</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-green-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <div key={item.name} className="relative">
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? "bg-green-800 text-white"
                        : "text-green-300 hover:bg-green-700 hover:text-white"
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                </div>
              );
            })}
          </div>
        </nav>

        {/* 로그아웃 버튼 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-green-800">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-green-300 rounded-md hover:bg-green-700 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            로그아웃
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="lg:pl-64">
        {/* 상단 헤더 */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:block">
                <div className="text-sm text-gray-500">선생님</div>
                <div className="text-lg font-semibold text-gray-900">
                  김선생님
                </div>
              </div>

              {/* 알림 아이콘 */}
              <div className="relative">
                <button
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className="p-2 text-gray-400 hover:text-gray-600 relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* 알림 드롭다운 */}
                {notificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900">
                          알림
                        </h3>
                        <button className="text-xs text-blue-600 hover:text-blue-800">
                          모두 읽음으로 표시
                        </button>
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                            !notification.read ? "bg-blue-50" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {notification.time}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 border-t border-gray-200">
                      <Link
                        href="/teacher/messages"
                        className="text-sm text-blue-600 hover:text-blue-800 text-center block"
                        onClick={() => setNotificationOpen(false)}
                      >
                        모든 알림 보기
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* 페이지 콘텐츠 */}
        <main>{children}</main>
      </div>
    </div>
  );
}

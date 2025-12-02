"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Clock,
  MessageSquare,
  Calendar,
  Users,
  Menu,
  X,
  Bell,
  User,
  Shield,
  CheckCircle,
  AlertTriangle,
  QrCode,
} from "lucide-react";

interface StaffPermissions {
  canViewReservations: boolean;
  canEditReservations: boolean;
  canViewMessages: boolean;
  canSendMessages: boolean;
  canViewReports: boolean;
  canManageStudents: boolean;
}

interface Notification {
  id: string;
  type: "task" | "admin" | "reminder" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
  priority: "low" | "medium" | "high";
}

const navigation = [
  {
    name: "홈",
    href: "/staff/home",
    icon: Home,
    requiredPermission: null,
  },
  {
    name: "업무 기록",
    href: "/staff/work-log",
    icon: Clock,
    requiredPermission: null,
  },
  {
    name: "근태 확인",
    href: "/staff/attendance",
    icon: Clock,
    requiredPermission: null,
  },
  {
    name: "QR코드 표시",
    href: "/staff/qr-display",
    icon: QrCode,
    requiredPermission: null,
  },
  {
    name: "메시지 관리",
    href: "/staff/messages",
    icon: MessageSquare,
    requiredPermission: "canViewMessages",
  },
  {
    name: "예약 관리",
    href: "/staff/reservations",
    icon: Calendar,
    requiredPermission: "canViewReservations",
  },
  {
    name: "학생 관리",
    href: "/staff/students",
    icon: Users,
    requiredPermission: "canManageStudents",
  },
  {
    name: "내 정보",
    href: "/staff/profile",
    icon: User,
    requiredPermission: null,
  },
];

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const pathname = usePathname();

  // 실제로는 API에서 권한 정보를 가져와야 함
  const [permissions] = useState<StaffPermissions>({
    canViewReservations: true,
    canEditReservations: false,
    canViewMessages: true,
    canSendMessages: true,
    canViewReports: false,
    canManageStudents: false,
  });

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "task",
      title: "오늘 해야 할 일",
      message: "학부모 상담 3건 응답 필요",
      time: "5분 전",
      read: false,
      priority: "high",
    },
    {
      id: "2",
      type: "admin",
      title: "관리자 알림",
      message: "새로운 업무 지침이 추가되었습니다",
      time: "10분 전",
      read: false,
      priority: "medium",
    },
    {
      id: "3",
      type: "reminder",
      title: "업무 리마인더",
      message: "오후 2시 회의 예정",
      time: "30분 전",
      read: true,
      priority: "low",
    },
    {
      id: "4",
      type: "task",
      title: "오늘 해야 할 일",
      message: "예약 변경 요청 2건 처리 필요",
      time: "1시간 전",
      read: false,
      priority: "medium",
    },
    {
      id: "5",
      type: "admin",
      title: "관리자 알림",
      message: "시스템 점검 예정 (오후 6시)",
      time: "2시간 전",
      read: true,
      priority: "low",
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

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

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true })),
    );
  };

  const hasPermission = (permission: string | null) => {
    if (!permission) return true;
    return permissions[permission as keyof StaffPermissions] || false;
  };

  const filteredNavigation = navigation.filter((item) =>
    hasPermission(item.requiredPermission),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 모바일 사이드바 오버레이 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">사무 포털</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-100 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                  {item.requiredPermission &&
                    !permissions[
                      item.requiredPermission as keyof StaffPermissions
                    ] && <Shield className="w-4 h-4 ml-auto text-gray-400" />}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* 권한 정보 */}
        <div className="absolute bottom-20 left-0 right-0 p-4">
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-900 mb-2">
              권한 정보
            </h3>
            <div className="space-y-1 text-xs text-yellow-800">
              <div className="flex items-center justify-between">
                <span>예약 관리:</span>
                <span>
                  {permissions.canEditReservations ? "편집 가능" : "열람만"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>메시지 발송:</span>
                <span>{permissions.canSendMessages ? "가능" : "불가"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>학생 관리:</span>
                <span>{permissions.canManageStudents ? "가능" : "불가"}</span>
              </div>
            </div>
          </div>
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
                <div className="text-sm text-gray-500">직원</div>
                <div className="text-lg font-semibold text-gray-900">
                  사무 관리자
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
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900">
                          알림
                        </h3>
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          모두 읽음으로 표시
                        </button>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                            !notification.read ? "bg-blue-50" : ""
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {notification.type === "task" && (
                                  <CheckCircle className="w-4 h-4 text-blue-600" />
                                )}
                                {notification.type === "admin" && (
                                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                )}
                                {notification.type === "reminder" && (
                                  <Clock className="w-4 h-4 text-green-600" />
                                )}
                                {notification.type === "system" && (
                                  <Bell className="w-4 h-4 text-purple-600" />
                                )}
                                <h4 className="text-sm font-medium text-gray-900">
                                  {notification.title}
                                </h4>
                                {notification.priority === "high" && (
                                  <span className="px-1.5 py-0.5 bg-red-100 text-red-800 text-xs rounded">
                                    긴급
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
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
                        href="/staff/notifications"
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

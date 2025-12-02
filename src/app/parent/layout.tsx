"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  MessageSquare,
  Calendar,
  Settings,
  Menu,
  X,
  LogOut,
  Bell,
  Globe,
  CreditCard,
  Star,
  BarChart3,
} from "lucide-react";
const navigation = [
  { name: "대시보드", href: "/parent/home", icon: Home },
  { name: "아이 관리", href: "/parent/children", icon: Users },
  { name: "수업 일정", href: "/parent/schedule", icon: Calendar },
  { name: "결제 내역", href: "/parent/payments", icon: CreditCard },
  { name: "선생님 리뷰", href: "/parent/reviews", icon: Star },
  { name: "학습 리포트", href: "/parent/reports", icon: BarChart3 },
  { name: "메시지", href: "/parent/messages", icon: MessageSquare },
  { name: "설정", href: "/parent/settings", icon: Settings },
];

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("language") || "ko";
    }
    return "ko";
  });
  const pathname = usePathname();

  // 언어 전환 함수
  const toggleLanguage = () => {
    const newLanguage = currentLanguage === "ko" ? "ja" : "ko";
    setCurrentLanguage(newLanguage);
    // localStorage에 언어 설정 저장
    if (typeof window !== "undefined") {
      localStorage.setItem("language", newLanguage);
    }
  };

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
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-blue-900 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-blue-800">
          <h1 className="text-xl font-bold text-white">
            {currentLanguage === "ko" ? "학부모 포털" : "保護者ポータル"}
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-blue-400 hover:text-white"
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
                        ? "bg-blue-800 text-white"
                        : "text-blue-300 hover:bg-blue-700 hover:text-white"
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

        {/* 언어 전환 버튼 */}
        <div className="absolute bottom-16 left-0 right-0 p-4 border-t border-blue-800">
          <button
            onClick={toggleLanguage}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-blue-300 rounded-md hover:bg-blue-700 hover:text-white transition-colors"
          >
            <Globe className="w-5 h-5 mr-3" />
            {currentLanguage === "ko" ? "日本語" : "한국어"}
          </button>
        </div>

        {/* 로그아웃 버튼 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-800">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-blue-300 rounded-md hover:bg-blue-700 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            {currentLanguage === "ko" ? "로그아웃" : "ログアウト"}
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
                <div className="text-sm text-gray-500">
                  {currentLanguage === "ko" ? "학부모" : "保護者"}
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {currentLanguage === "ko" ? "김부모님" : "キム保護者様"}
                </div>
              </div>

              {/* 알림 아이콘 */}
              <div className="relative">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <div className="w-5 h-5 relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      3
                    </span>
                  </div>
                </button>
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

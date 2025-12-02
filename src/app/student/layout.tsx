"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  User,
  BookOpen,
  FileText,
  BookMarked,
  Mic,
  PenTool,
  ClipboardCheck,
  FolderOpen,
  Menu,
  X,
  Home,
  LogOut,
  Bell,
  Globe,
} from "lucide-react";
import { useTranslation } from "@/lib/translations";

const navigation = [
  { name: "홈", href: "/student/home", icon: Home },
  { name: "예약", href: "/student/reservations", icon: Calendar },
  { name: "마이페이지", href: "/student/profile", icon: User },
  { name: "레슨노트", href: "/student/notes", icon: BookOpen },
  { name: "숙제", href: "/student/homework", icon: FileText, comingSoon: true },
  {
    name: "단어복습",
    href: "/student/vocabulary",
    icon: BookMarked,
    comingSoon: true,
  },
  {
    name: "듣기/녹음",
    href: "/student/listening",
    icon: Mic,
    comingSoon: true,
  },
  {
    name: "작문테스트",
    href: "/student/writing",
    icon: PenTool,
    comingSoon: true,
  },
  {
    name: "시험준비",
    href: "/student/exam-prep",
    icon: ClipboardCheck,
    comingSoon: true,
  },
  {
    name: "추가자료",
    href: "/student/materials",
    icon: FolderOpen,
    comingSoon: true,
  },
  { name: "문의하기", href: "/student/contact", icon: Globe },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<"ko" | "ja">(() => {
    // localStorage에서 언어 설정을 가져오거나 기본값 사용
    if (typeof window !== "undefined") {
      return (localStorage.getItem("language") as "ko" | "ja") || "ko";
    }
    return "ko";
  });
  const pathname = usePathname();
  const notificationRef = useRef<HTMLDivElement>(null);
  const t = useTranslation(currentLanguage);

  // 외부 클릭 감지
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 언어 전환 함수
  const toggleLanguage = () => {
    const newLanguage = currentLanguage === "ko" ? "ja" : "ko";
    setCurrentLanguage(newLanguage);
    // localStorage에 언어 설정 저장
    if (typeof window !== "undefined") {
      localStorage.setItem("language", newLanguage);
    }
  };

  // 로그아웃 함수
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
      title:
        currentLanguage === "ko"
          ? "새로운 레슨노트가 업로드되었습니다"
          : "新しいレッスンノートがアップロードされました",
      message:
        currentLanguage === "ko"
          ? "김선생님의 수업 노트를 확인해보세요"
          : "キム先生のレッスンノートを確認してください",
      time: currentLanguage === "ko" ? "5분 전" : "5分前",
      type: "note",
      link: "/student/notes",
    },
    {
      id: 2,
      title:
        currentLanguage === "ko"
          ? "내일 수업이 있습니다"
          : "明日レッスンがあります",
      message:
        currentLanguage === "ko"
          ? "오후 2시 김선생님과의 수업을 잊지 마세요"
          : "午後2時のキム先生とのレッスンを忘れないでください",
      time: currentLanguage === "ko" ? "1시간 전" : "1時間前",
      type: "reservation",
      link: "/student/reservations",
    },
    {
      id: 3,
      title:
        currentLanguage === "ko"
          ? "새로운 숙제가 등록되었습니다"
          : "新しい宿題が登録されました",
      message:
        currentLanguage === "ko"
          ? "문법 연습 문제를 풀어보세요"
          : "文法練習問題を解いてください",
      time: currentLanguage === "ko" ? "2시간 전" : "2時間前",
      type: "homework",
      link: "/student/homework",
    },
    {
      id: 4,
      title:
        currentLanguage === "ko"
          ? "수업 일정이 변경되었습니다"
          : "レッスンスケジュールが変更されました",
      message:
        currentLanguage === "ko"
          ? "다음 주 수요일 수업이 목요일로 변경되었습니다"
          : "来週水曜日のレッスンが木曜日に変更されました",
      time: currentLanguage === "ko" ? "3시간 전" : "3時間前",
      type: "reservation",
      link: "/student/reservations",
    },
    {
      id: 5,
      title:
        currentLanguage === "ko"
          ? "레슨노트 피드백이 있습니다"
          : "レッスンノートのフィードバックがあります",
      message:
        currentLanguage === "ko"
          ? "지난 주 작문 숙제에 대한 피드백을 확인해보세요"
          : "先週の作文宿題に関するフィードバックを確認してください",
      time: currentLanguage === "ko" ? "1일 전" : "1日前",
      type: "note",
      link: "/student/notes",
    },
  ];

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
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">학생 포털</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
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
                    href={item.comingSoon ? "#" : item.href}
                    onClick={(e) => {
                      if (item.comingSoon) {
                        e.preventDefault();
                        return;
                      }
                      setSidebarOpen(false);
                    }}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? "bg-blue-100 text-blue-700 border-r-2 border-blue-700"
                        : item.comingSoon
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {currentLanguage === "ko"
                      ? item.name
                      : t.student.navigation[
                          item.name as keyof typeof t.student.navigation
                        ]}
                  </Link>
                  {item.comingSoon && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      준비중
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* 로그아웃 버튼 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
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
                <div className="text-sm text-gray-500">안녕하세요,</div>
                <div className="text-lg font-semibold text-gray-900">
                  김학생님
                </div>
              </div>

              {/* 홈 버튼 */}
              <div className="relative group">
                <Link
                  href="/student/home"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="홈으로 이동"
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">홈</span>
                </Link>
                {/* 말풍선 */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  홈으로 이동
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-800"></div>
                </div>
              </div>

              {/* 알림 아이콘 */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-400 hover:text-gray-600 relative"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    {notifications.length}
                  </span>
                </button>

                {/* 알림 드롭다운 */}
                {showNotifications && (
                  <div
                    ref={notificationRef}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                  >
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">
                        알림
                      </h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <Link
                          key={notification.id}
                          href={notification.link}
                          className="block p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900 mb-1">
                                {notification.title}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">
                                {notification.message}
                              </p>
                              <span className="text-xs text-gray-400">
                                {notification.time}
                              </span>
                            </div>
                            <div
                              className={`w-2 h-2 rounded-full ml-2 ${
                                notification.type === "note"
                                  ? "bg-blue-500"
                                  : notification.type === "reservation"
                                    ? "bg-green-500"
                                    : "bg-purple-500"
                              }`}
                            />
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className="p-4 border-t border-gray-200">
                      <Link
                        href="/student/notifications"
                        className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium block text-center"
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
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

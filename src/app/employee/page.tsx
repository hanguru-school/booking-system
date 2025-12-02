"use client";

import { useState } from "react";
import {
  BookOpen,
  Calendar,
  MessageSquare,
  Clock,
  Languages,
  User,
  Settings,
  LogOut,
  Users,
  CheckCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

// 다국어 텍스트 정의
const translations = {
  ja: {
    title: "韓国語教室MalMoi",
    welcome: "職員ダッシュボード",
    subtitle: "教室運営と生徒管理のためのツール",
    attendance: "出勤管理",
    schedule: "スケジュール",
    students: "生徒管理",
    messages: "メッセージ",
    settings: "設定",
    logout: "ログアウト",
    viewAll: "すべて表示",
    todayAttendance: "今日の出勤状況",
    upcomingClasses: "今後のレッスン",
    recentMessages: "最近のメッセージ",
    noUpcoming: "予定されたレッスンはありません",
    noMessages: "新しいメッセージはありません",
    checkIn: "出勤",
    checkOut: "退勤",
    workingHours: "勤務時間",
    breakTime: "休憩時間",
    totalStudents: "総生徒数",
    activeStudents: "アクティブな生徒",
    completedClasses: "完了したレッスン",
    pendingTasks: "保留中のタスク",
  },
  ko: {
    title: "한국어교실MalMoi",
    welcome: "직원 대시보드",
    subtitle: "교실 운영과 학생 관리를 위한 도구",
    attendance: "출근 관리",
    schedule: "스케줄",
    students: "학생 관리",
    messages: "메시지",
    settings: "설정",
    logout: "로그아웃",
    viewAll: "모두 보기",
    todayAttendance: "오늘의 출근 상황",
    upcomingClasses: "예정된 수업",
    recentMessages: "최근 메시지",
    noUpcoming: "예정된 수업이 없습니다",
    noMessages: "새 메시지가 없습니다",
    checkIn: "출근",
    checkOut: "퇴근",
    workingHours: "근무 시간",
    breakTime: "휴식 시간",
    totalStudents: "총 학생 수",
    activeStudents: "활성 학생",
    completedClasses: "완료된 수업",
    pendingTasks: "대기 중인 작업",
  },
};

export default function EmployeeDashboard() {
  const router = useRouter();
  const [language, setLanguage] = useState<"ja" | "ko">("ja");

  const t = translations[language];

  const toggleLanguage = () => {
    setLanguage(language === "ja" ? "ko" : "ja");
  };

  const handleLogout = () => {
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
              >
                <Languages className="w-4 h-4" />
                {language === "ja" ? "한국어" : "日本語"}
              </button>
              <button
                onClick={() => router.push("/employee/settings")}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
              >
                <Settings className="w-4 h-4" />
                {t.settings}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                {t.logout}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{t.welcome}</h2>
          <p className="text-lg text-gray-600">{t.subtitle}</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => router.push("/employee/attendance")}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <CheckCircle className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-semibold mb-2">{t.attendance}</h3>
            <p className="text-sm opacity-90">
              {language === "ja"
                ? "出勤状況を管理する"
                : "출근 상황을 관리하세요"}
            </p>
          </button>

          <button
            onClick={() => router.push("/employee/schedule")}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Calendar className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-semibold mb-2">{t.schedule}</h3>
            <p className="text-sm opacity-90">
              {language === "ja"
                ? "スケジュールを確認する"
                : "스케줄을 확인하세요"}
            </p>
          </button>

          <button
            onClick={() => router.push("/employee/students")}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Users className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-semibold mb-2">{t.students}</h3>
            <p className="text-sm opacity-90">
              {language === "ja"
                ? "生徒情報を管理する"
                : "학생 정보를 관리하세요"}
            </p>
          </button>

          <button
            onClick={() => router.push("/employee/messages")}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <MessageSquare className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-semibold mb-2">{t.messages}</h3>
            <p className="text-sm opacity-90">
              {language === "ja"
                ? "メッセージを確認する"
                : "메시지를 확인하세요"}
            </p>
          </button>
        </div>

        {/* Today's Overview */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            {t.todayAttendance}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">08:30</div>
              <div className="text-sm text-gray-600">{t.checkIn}</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">8.5</div>
              <div className="text-sm text-gray-600">{t.workingHours}</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">45</div>
              <div className="text-sm text-gray-600">{t.totalStudents}</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-8 h-8 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">12</div>
              <div className="text-sm text-gray-600">{t.completedClasses}</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Classes */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {t.upcomingClasses}
              </h3>
              <button className="text-sm text-blue-600 hover:text-blue-700">
                {t.viewAll}
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {language === "ja" ? "中級会話レッスン" : "중급 회화 수업"}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {language === "ja"
                      ? "明日 18:00 - 19:00"
                      : "내일 18:00 - 19:00"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {language === "ja" ? "初級文法レッスン" : "초급 문법 수업"}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {language === "ja"
                      ? "金曜日 19:00 - 20:00"
                      : "금요일 19:00 - 20:00"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Messages */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {t.recentMessages}
              </h3>
              <button className="text-sm text-blue-600 hover:text-blue-700">
                {t.viewAll}
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {language === "ja" ? "田中先生" : "田中선생님"}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {language === "ja"
                      ? "レッスン資料の準備をお願いします"
                      : "수업 자료 준비를 부탁드립니다"}
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  {language === "ja" ? "1時間前" : "1시간 전"}
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {language === "ja" ? "システム" : "시스템"}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {language === "ja"
                      ? "新しい生徒が登録されました"
                      : "새로운 학생이 등록되었습니다"}
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  {language === "ja" ? "2時間前" : "2시간 전"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

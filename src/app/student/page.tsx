"use client";

import { useState } from "react";
import {
  BookOpen,
  Calendar,
  FileText,
  MessageSquare,
  Star,
  Target,
  Clock,
  Award,
  Languages,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";

// 다국어 텍스트 정의
const translations = {
  ja: {
    title: "韓国語教室MalMoi",
    welcome: "ようこそ！",
    subtitle: "スマートな韓国語学習ダッシュボード",
    quickActions: "クイックアクション",
    upcomingClasses: "今後のレッスン",
    recentMaterials: "最近の資料",
    learningProgress: "学習進捗",
    messages: "メッセージ",
    achievements: "実績",
    settings: "設定",
    logout: "ログアウト",
    viewAll: "すべて表示",
    noUpcoming: "予定されたレッスンはありません",
    noMaterials: "最近の資料はありません",
    noMessages: "新しいメッセージはありません",
    progressTitle: "今月の進捗",
    completedLessons: "完了したレッスン",
    studyHours: "学習時間",
    currentLevel: "現在のレベル",
    nextLevel: "次のレベル",
    points: "ポイント",
    streak: "連続学習日数",
    days: "日",
    hours: "時間",
    lessons: "レッスン",
    pointsText: "ポイント",
  },
  ko: {
    title: "한국어교실MalMoi",
    welcome: "환영합니다!",
    subtitle: "스마트한 한국어 학습 대시보드",
    quickActions: "빠른 액션",
    upcomingClasses: "예정된 수업",
    recentMaterials: "최근 자료",
    learningProgress: "학습 진도",
    messages: "메시지",
    achievements: "성취",
    settings: "설정",
    logout: "로그아웃",
    viewAll: "모두 보기",
    noUpcoming: "예정된 수업이 없습니다",
    noMaterials: "최근 자료가 없습니다",
    noMessages: "새 메시지가 없습니다",
    progressTitle: "이번 달 진도",
    completedLessons: "완료한 수업",
    studyHours: "학습 시간",
    currentLevel: "현재 레벨",
    nextLevel: "다음 레벨",
    points: "포인트",
    streak: "연속 학습일",
    days: "일",
    hours: "시간",
    lessons: "수업",
    pointsText: "포인트",
  },
};

export default function StudentDashboard() {
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
                onClick={() => router.push("/student/settings")}
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
            onClick={() => router.push("/student/reservations/new")}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Calendar className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-semibold mb-2">
              {language === "ja" ? "レッスン予約" : "수업 예약"}
            </h3>
            <p className="text-sm opacity-90">
              {language === "ja"
                ? "新しいレッスンを予約する"
                : "새로운 수업을 예약하세요"}
            </p>
          </button>

          <button
            onClick={() => router.push("/student/materials")}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <FileText className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-semibold mb-2">
              {language === "ja" ? "学習資料" : "학습 자료"}
            </h3>
            <p className="text-sm opacity-90">
              {language === "ja"
                ? "レッスン資料を確認する"
                : "수업 자료를 확인하세요"}
            </p>
          </button>

          <button
            onClick={() => router.push("/student/messages")}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <MessageSquare className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-semibold mb-2">
              {language === "ja" ? "メッセージ" : "메시지"}
            </h3>
            <p className="text-sm opacity-90">
              {language === "ja"
                ? "先生とメッセージを交換する"
                : "선생님과 메시지를 주고받으세요"}
            </p>
          </button>

          <button
            onClick={() => router.push("/student/achievements")}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Award className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-semibold mb-2">
              {language === "ja" ? "実績" : "성취"}
            </h3>
            <p className="text-sm opacity-90">
              {language === "ja"
                ? "学習実績を確認する"
                : "학습 성취를 확인하세요"}
            </p>
          </button>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            {t.progressTitle}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">12</div>
              <div className="text-sm text-gray-600">{t.completedLessons}</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">24</div>
              <div className="text-sm text-gray-600">{t.studyHours}</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">中級</div>
              <div className="text-sm text-gray-600">{t.currentLevel}</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="w-8 h-8 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">850</div>
              <div className="text-sm text-gray-600">{t.pointsText}</div>
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
                    {language === "ja" ? "文法レッスン" : "문법 수업"}
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
                {t.messages}
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
                      ? "レッスン資料を確認してください"
                      : "수업 자료를 확인해주세요"}
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  {language === "ja" ? "2時間前" : "2시간 전"}
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
                      ? "新しいレッスンが予約されました"
                      : "새로운 수업이 예약되었습니다"}
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  {language === "ja" ? "1日前" : "1일 전"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

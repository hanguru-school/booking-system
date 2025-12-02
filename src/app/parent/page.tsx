"use client";

import { useState } from "react";
import {
  BookOpen,
  Users,
  Calendar,
  MessageSquare,
  Star,
  Target,
  Clock,
  Languages,
  Settings,
  LogOut,
  CreditCard,
  BarChart3,
} from "lucide-react";
import { useRouter } from "next/navigation";

// 다국어 텍스트 정의
const translations = {
  ja: {
    title: "韓国語教室MalMoi",
    welcome: "保護者ダッシュボード",
    subtitle: "お子様の学習状況を確認できます",
    children: "お子様",
    payments: "支払い",
    reports: "レポート",
    messages: "メッセージ",
    settings: "設定",
    logout: "ログアウト",
    viewAll: "すべて表示",
    progressTitle: "学習進捗",
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
    upcomingClasses: "今後のレッスン",
    recentPayments: "最近の支払い",
    noUpcoming: "予定されたレッスンはありません",
    noPayments: "最近の支払いはありません",
    noMessages: "新しいメッセージはありません",
  },
  ko: {
    title: "한국어교실MalMoi",
    welcome: "학부모 대시보드",
    subtitle: "자녀의 학습 상황을 확인할 수 있습니다",
    children: "자녀",
    payments: "결제",
    reports: "보고서",
    messages: "메시지",
    settings: "설정",
    logout: "로그아웃",
    viewAll: "모두 보기",
    progressTitle: "학습 진도",
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
    upcomingClasses: "예정된 수업",
    recentPayments: "최근 결제",
    noUpcoming: "예정된 수업이 없습니다",
    noPayments: "최근 결제가 없습니다",
    noMessages: "새 메시지가 없습니다",
  },
};

export default function ParentDashboard() {
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
                onClick={() => router.push("/parent/settings")}
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
            onClick={() => router.push("/parent/children")}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Users className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-semibold mb-2">{t.children}</h3>
            <p className="text-sm opacity-90">
              {language === "ja"
                ? "お子様の学習状況を確認する"
                : "자녀의 학습 상황을 확인하세요"}
            </p>
          </button>

          <button
            onClick={() => router.push("/parent/payments")}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <CreditCard className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-semibold mb-2">{t.payments}</h3>
            <p className="text-sm opacity-90">
              {language === "ja"
                ? "支払い履歴を確認する"
                : "결제 내역을 확인하세요"}
            </p>
          </button>

          <button
            onClick={() => router.push("/parent/reports")}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <BarChart3 className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-semibold mb-2">{t.reports}</h3>
            <p className="text-sm opacity-90">
              {language === "ja"
                ? "学習レポートを確認する"
                : "학습 보고서를 확인하세요"}
            </p>
          </button>

          <button
            onClick={() => router.push("/parent/messages")}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <MessageSquare className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-semibold mb-2">{t.messages}</h3>
            <p className="text-sm opacity-90">
              {language === "ja"
                ? "先生とメッセージを交換する"
                : "선생님과 메시지를 주고받으세요"}
            </p>
          </button>
        </div>

        {/* Children Overview */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            {language === "ja" ? "お子様の学習状況" : "자녀의 학습 상황"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">田中 花子</div>
              <div className="text-sm text-gray-600">
                {language === "ja" ? "中級レベル" : "중급 레벨"}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {language === "ja" ? "12レッスン完了" : "12수업 완료"}
              </div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">田中 太郎</div>
              <div className="text-sm text-gray-600">
                {language === "ja" ? "初級レベル" : "초급 레벨"}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {language === "ja" ? "8レッスン完了" : "8수업 완료"}
              </div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">田中 次郎</div>
              <div className="text-sm text-gray-600">
                {language === "ja" ? "上級レベル" : "고급 레벨"}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {language === "ja" ? "20レッスン完了" : "20수업 완료"}
              </div>
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
                    {language === "ja"
                      ? "田中 花子 - 中級会話"
                      : "田中 花子 - 중급 회화"}
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
                    {language === "ja"
                      ? "田中 太郎 - 初級文法"
                      : "田中 太郎 - 초급 문법"}
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

          {/* Recent Payments */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {t.recentPayments}
              </h3>
              <button className="text-sm text-blue-600 hover:text-blue-700">
                {t.viewAll}
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {language === "ja" ? "月額プラン更新" : "월간 플랜 갱신"}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {language === "ja" ? "¥15,000" : "¥15,000"}
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  {language === "ja" ? "3日前" : "3일 전"}
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {language === "ja" ? "追加レッスン購入" : "추가 수업 구매"}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {language === "ja" ? "¥5,000" : "¥5,000"}
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  {language === "ja" ? "1週間前" : "1주일 전"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

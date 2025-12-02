"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
  User,
  LogOut,
  Award,
  Star,
  BookOpen,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/lib/translations";
import { useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import Navigation from "@/components/common/Navigation";

interface StudentStats {
  totalClasses: number;
  completedClasses: number;
  upcomingClasses: number;
  currentLevel: string;
  points: number;
  studyStreak: number;
  averageScore: number;
  remainingTime: {
    total: number; // 전체 남은 시간 (분)
    available: number; // 예약 가능한 남은 시간 (분)
  };
}

interface RecentReservation {
  id: string;
  date: string;
  time: string;
  teacher: string;
  subject: string;
  status: "upcoming" | "completed" | "cancelled";
}

interface RecentNote {
  id: string;
  title: string;
  date: string;
  hasAudio: boolean;
  duration: string;
}

export default function StudentHomePage() {
  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <div className="min-h-screen bg-gray-50">
        <Navigation userRole="STUDENT" />
        <StudentHomeContent />
      </div>
    </ProtectedRoute>
  );
}

function StudentHomeContent() {
  const { user, loading, logout } = useAuth();
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [recentReservations, setRecentReservations] = useState<
    RecentReservation[]
  >([]);
  const [recentNotes, setRecentNotes] = useState<RecentNote[]>([]);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  // 언어 설정
  const [currentLanguage, setCurrentLanguage] = useState<"ko" | "ja">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("language") as "ko" | "ja") || "ko";
    }
    return "ko";
  });
  const t = useTranslation(currentLanguage);

  // 랜덤 학습 메시지 배열
  const studyMessages = [
    "오늘도 열심히 공부해 봐요! 💪",
    "작은 진전이 큰 성공의 시작이에요! 🌟",
    "꾸준함이 최고의 실력이 됩니다! 📚",
    "오늘 배운 것이 내일의 자신감이에요! ✨",
    "한 걸음씩 차근차근 나아가봐요! 🚀",
    "실수해도 괜찮아요, 그것도 학습의 일부예요! 💡",
    "오늘의 노력이 미래의 성공을 만들어요! 🎯",
    "포기하지 않는 마음이 가장 큰 힘이에요! 💪",
    "매일 조금씩, 하지만 꾸준히! 📖",
    "당신의 열정이 가장 아름다운 빛이에요! ⭐",
  ];

  // 랜덤 메시지 선택
  const randomStudyMessage =
    studyMessages[Math.floor(Math.random() * studyMessages.length)];

  // 언어 전환 함수
  const toggleLanguage = () => {
    setCurrentLanguage((prev) => (prev === "ko" ? "ja" : "ko"));
  };

  // 로그아웃 함수
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        window.location.href = "/auth/login";
      }
    } catch (error) {
      console.error("로그아웃 오류:", error);
      window.location.href = "/auth/login";
    }
  };

  // 다국어 텍스트
  const texts = {
    ko: {
      welcome: "안녕하세요",
      studyMessage: "오늘도 열심히 공부해봐요!",
      student: "학생",
      logout: "로그아웃",
      thisMonthClasses: "이번 달 수업",
      completed: "완료",
      upcoming: "예정",
      currentLevel: "현재 레벨",
      averageScore: "평균 점수",
      points: "포인트",
      studyStreak: "연속 학습",
      days: "일",
      recentReservations: "최근 예약",
      recentNotes: "최근 레슨 노트",
      viewNote: "레슨 노트 확인하기",
      noReservations: "예약 내역이 없습니다",
      noNotes: "레슨 노트가 없습니다",
      mainMenu: "메인으로 돌아가기",
      learningProgress: "학습 진행률",
      remainingClasses: "목표 달성까지",
      remaining: "남음",
      viewAll: "전체보기",
      quickActions: "빠른 액션",
      newReservation: "새 예약",
      viewReservations: "예약 보기",
      viewNotes: "레슨 노트",
      viewHomework: "숙제",
      studyTip: "오늘의 학습 팁",
      tipTitle: "효과적인 학습을 위한 팁",
      tipContent:
        "매일 30분씩 꾸준히 공부하는 것이 가장 효과적입니다. 짧은 시간이라도 매일 반복하면 큰 효과를 볼 수 있어요!",
      status: {
        upcoming: "예정",
        completed: "완료",
        cancelled: "취소",
      },
    },
    ja: {
      welcome: "こんにちは",
      studyMessage: "今日も頑張って勉強しましょう！",
      student: "学生",
      logout: "ログアウト",
      thisMonthClasses: "今月の授業",
      completed: "完了",
      upcoming: "予定",
      currentLevel: "現在のレベル",
      averageScore: "平均点",
      points: "ポイント",
      studyStreak: "連続学習",
      days: "日",
      recentReservations: "最近の予約",
      recentNotes: "最近のレッスンノート",
      viewNote: "レッスンノートを確認",
      noReservations: "予約履歴がありません",
      noNotes: "レッスンノートがありません",
      mainMenu: "メインに戻る",
      learningProgress: "学習進捗率",
      remainingClasses: "目標達成まで",
      remaining: "残り",
      viewAll: "すべて見る",
      quickActions: "クイックアクション",
      newReservation: "新規予約",
      viewReservations: "予約を見る",
      viewNotes: "レッスンノート",
      viewHomework: "宿題",
      studyTip: "今日の学習のヒント",
      tipTitle: "効果的な学習のためのヒント",
      tipContent:
        "毎日30分ずつコツコツと勉強することが最も効果的です。短い時間でも毎日繰り返すことで大きな効果を得ることができます！",
      status: {
        upcoming: "予定",
        completed: "完了",
        cancelled: "キャンセル",
      },
    },
  };

  const localTexts = texts[currentLanguage];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // 세션에서 사용자 정보 가져오기 (패스워드 변경 필수 여부 확인)
        const sessionResponse = await fetch('/api/auth/session', {
          credentials: 'include',
        });
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          if (sessionData.user) {
            setMustChangePassword(sessionData.mustChangePassword || sessionData.isFirstLogin || false);
          }
        }

        // 학생 통계 데이터 가져오기
        const statsResponse = await fetch("/api/student/profile");
        if (statsResponse.ok) {
          const studentData = await statsResponse.json();

          const actualStats = {
            totalClasses: studentData.totalClasses || 0,
            completedClasses: studentData.completedClasses || 0,
            upcomingClasses: studentData.upcomingClasses || 0,
            currentLevel: studentData.level || "초급",
            points: studentData.points || 0,
            studyStreak: studentData.studyStreak || 0,
            averageScore: studentData.averageScore || 0,
            remainingTime: {
              total: studentData.remainingTime?.total || 0,
              available: studentData.remainingTime?.available || 0,
            },
          };

          setStats(actualStats);
        } else {
          // 기본 통계 데이터 (실제 데이터가 없을 때)
          setStats({
            totalClasses: 0,
            completedClasses: 0,
            upcomingClasses: 0,
            currentLevel: "초급",
            points: 0,
            studyStreak: 0,
            averageScore: 0,
            remainingTime: {
              total: 0,
              available: 0,
            },
          });
        }

        // 최근 예약 데이터
        const reservationsResponse = await fetch("/api/reservations/list");
        if (reservationsResponse.ok) {
          const reservationsData = await reservationsResponse.json();
          setRecentReservations(
            reservationsData.reservations?.slice(0, 3) || [],
          );
        } else {
          setRecentReservations([]);
        }

        // 최근 레슨 노트 데이터 (빈 배열로 설정 - 새 학생이므로)
        setRecentNotes([]);
      } catch (error) {
        console.error("사용자 데이터 가져오기 오류:", error);
      } finally {
        // setLoading(false); // useAuth에서 처리
      }
    };

    fetchUserData();
  }, []);

  // 권한 확인
  if (!user) {
    // 로그인 페이지로 리다이렉트
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
    return null;
  }

  // 학생 권한 확인
  if (user.role !== "STUDENT") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-red-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            접근 권한 없음
          </h2>
          <p className="text-gray-600 mb-6">
            학생 대시보드에 접근할 권한이 없습니다.
            <br />
            현재 권한:{" "}
            {user.role === "ADMIN"
              ? "관리자"
              : user.role === "TEACHER"
                ? "강사"
                : user.role === "STAFF"
                  ? "직원"
                  : user.role}
          </p>
          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              메인으로 돌아가기
            </Link>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* 패스워드 변경 요청 알림 */}
      {mustChangePassword && (
        <div className="mb-6 bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-orange-600 mr-3" />
              <div>
                <h3 className="text-sm font-semibold text-orange-800">
                  패스워드 변경이 필요합니다
                </h3>
                <p className="text-sm text-orange-700 mt-1">
                  보안을 위해 패스워드를 변경해주세요.
                </p>
              </div>
            </div>
            <Link
              href="/student/change-password"
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium"
            >
              패스워드 변경
            </Link>
          </div>
        </div>
      )}

      {/* 환영 메시지 */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              {t.welcome}, {user.name}님! 👋
            </h1>
            <p className="text-base lg:text-lg text-gray-600">
              {randomStudyMessage}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Globe className="w-4 h-4" />
              {currentLanguage === "ko" ? "日本語" : "한국어"}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {localTexts.logout}
            </button>
          </div>
        </div>
      </div>

      {/* 주요 액션 버튼들 */}
      <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
          주요 메뉴
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/student/reservations/new"
            className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Calendar className="w-8 h-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-900 text-center">
              {localTexts.newReservation}
            </span>
          </Link>

          <Link
            href="/student/reservations"
            className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Clock className="w-8 h-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-900 text-center">
              {localTexts.viewReservations}
            </span>
          </Link>

          <Link
            href="/student/lesson-notes"
            className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <BookOpen className="w-8 h-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-900 text-center">
              {localTexts.viewNotes}
            </span>
          </Link>

          <Link
            href="/student/profile"
            className="flex flex-col items-center justify-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <User className="w-8 h-8 text-orange-600 mb-2" />
            <span className="text-sm font-medium text-gray-900 text-center">
              마이페이지
            </span>
          </Link>
        </div>
      </div>

      {/* 학습 팁 */}
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {localTexts.studyTip}
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {localTexts.tipContent}
            </p>
          </div>
        </div>
      </div>

      {/* 통계 카드들 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* 현재 레벨 */}
        <Link
          href="/student/level"
          className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">
                {localTexts.currentLevel}
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {stats?.currentLevel}
              </div>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {localTexts.averageScore} {stats?.averageScore}%
          </div>
        </Link>

        {/* 학습 진행률 */}
        <Link
          href="/student/progress"
          className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">
                {localTexts.learningProgress}
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {stats?.completedClasses}/{stats?.totalClasses}
              </div>
            </div>
            <Award className="w-8 h-8 text-orange-600" />
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {Math.round(
              ((stats?.completedClasses || 0) / (stats?.totalClasses || 1)) *
                100,
            )}
            % {localTexts.completed}
          </div>
        </Link>

        {/* 포인트 */}
        <Link
          href="/student/points"
          className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">{localTexts.points}</div>
              <div className="text-2xl font-bold text-gray-900">
                {stats?.points}P
              </div>
            </div>
            <Star className="w-8 h-8 text-yellow-600" />
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {localTexts.studyStreak} {stats?.studyStreak}
            {localTexts.days}
          </div>
        </Link>

        {/* 이번달 수업 */}
        <Link
          href="/student/classes"
          className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">
                {localTexts.thisMonthClasses}
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {stats?.totalClasses}회
              </div>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {localTexts.completed} {stats?.completedClasses}회 /{" "}
            {localTexts.upcoming} {stats?.upcomingClasses}회
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* 최근 레슨노트 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">
                {localTexts.recentNotes}
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {recentNotes.length}개
              </div>
            </div>
            <BookOpen className="w-8 h-8 text-purple-600" />
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {recentNotes.length > 0 ? (
              <div className="space-y-1">
                {recentNotes.slice(0, 2).map((note) => (
                  <div
                    key={note.id}
                    className="flex items-center justify-between"
                  >
                    <span className="truncate">{note.title}</span>
                    <span className="text-xs text-gray-400 ml-2">
                      {note.date}
                    </span>
                  </div>
                ))}
                {recentNotes.length > 2 && (
                  <div className="text-blue-600 text-xs">
                    +{recentNotes.length - 2}개 더보기
                  </div>
                )}
              </div>
            ) : (
              <span>{localTexts.noNotes}</span>
            )}
          </div>
          <div className="mt-4">
            <Link
              href="/student/lesson-notes"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {localTexts.viewAll} →
            </Link>
          </div>
        </div>

        {/* 최근 예약 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">
                {localTexts.recentReservations}
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {recentReservations.length}개
              </div>
            </div>
            <Calendar className="w-8 h-8 text-green-600" />
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {recentReservations.length > 0 ? (
              <div className="space-y-1">
                {recentReservations.slice(0, 2).map((reservation) => (
                  <div
                    key={reservation.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          reservation.status === "upcoming"
                            ? "bg-blue-500"
                            : reservation.status === "completed"
                              ? "bg-green-500"
                              : "bg-red-500"
                        }`}
                      />
                      <span className="truncate">{reservation.subject}</span>
                    </div>
                    <span className="text-xs text-gray-400 ml-2">
                      {reservation.date}
                    </span>
                  </div>
                ))}
                {recentReservations.length > 2 && (
                  <div className="text-blue-600 text-xs">
                    +{recentReservations.length - 2}개 더보기
                  </div>
                )}
              </div>
            ) : (
              <span>{localTexts.noReservations}</span>
            )}
          </div>
          <div className="mt-4">
            <Link
              href="/student/reservations"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {localTexts.viewAll} →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

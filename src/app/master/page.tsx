"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useReservations } from "@/hooks/useReservations";
import { useRooms } from "@/hooks/useRooms";
import { useCourses } from "@/hooks/useCourses";
import {
  Calendar,
  Users,
  MapPin,
  BookOpen,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
} from "lucide-react";

export default function MasterPage() {
  const { user } = useAuth();
  const { reservations, loading: reservationsLoading } = useReservations();
  const { rooms, loading: roomsLoading } = useRooms();
  const { courses, loading: coursesLoading } = useCourses();
  const router = useRouter();

  const [selectedPeriod, setSelectedPeriod] = useState<
    "today" | "week" | "month"
  >("week");

  // 언어 설정
  const [currentLanguage, setCurrentLanguage] = useState<"ko" | "ja">("ko");

  // 언어 전환 함수
  const toggleLanguage = () => {
    setCurrentLanguage((prev) => (prev === "ko" ? "ja" : "ko"));
  };

  // 다국어 텍스트
  const texts = {
    ko: {
      title: "관리자 대시보드",
      subtitle: "전체 시스템 현황을 한눈에 확인하세요",
      today: "오늘",
      week: "이번 주",
      month: "이번 달",
      totalReservations: "총 예약",
      pendingReservations: "대기 중",
      confirmedReservations: "확정",
      completedReservations: "완료",
      cancelledReservations: "취소",
      recentReservations: "최근 예약",
      systemStatus: "시스템 상태",
      allSystems: "모든 시스템 정상",
      activeUsers: "활성 사용자",
      availableRooms: "사용 가능한 강의실",
      activeCourses: "진행 중인 과정",
      loading: "로딩 중...",
      noReservations: "예약이 없습니다",
      capacity: "수용인원",
      people: "명",
      active: "활성",
      inactive: "비활성",
      minutes: "분",
      won: "원",
      quickActions: "빠른 액션",
      reservationManagement: "예약 관리",
      reservationManagementDesc: "모든 예약을 확인하고 관리",
      courseManagement: "코스 관리",
      courseManagementDesc: "코스 정보 추가 및 수정",
      roomManagement: "교실 관리",
      roomManagementDesc: "교실 정보 관리",
      userManagement: "사용자 관리",
      userManagementDesc: "사용자 계정 관리",
      status: {
        pending: "대기 중",
        confirmed: "확정",
        completed: "완료",
        cancelled: "취소",
      },
    },
    ja: {
      title: "管理者ダッシュボード",
      subtitle: "システム全体の状況を一目で確認できます",
      today: "今日",
      week: "今週",
      month: "今月",
      totalReservations: "総予約",
      pendingReservations: "保留中",
      confirmedReservations: "確定",
      completedReservations: "完了",
      cancelledReservations: "キャンセル",
      recentReservations: "最近の予約",
      systemStatus: "システム状況",
      allSystems: "すべてのシステム正常",
      activeUsers: "アクティブユーザー",
      availableRooms: "利用可能な教室",
      activeCourses: "進行中のコース",
      loading: "読み込み中...",
      noReservations: "予約がありません",
      capacity: "定員",
      people: "名",
      active: "アクティブ",
      inactive: "非アクティブ",
      minutes: "分",
      won: "円",
      quickActions: "クイックアクション",
      reservationManagement: "予約管理",
      reservationManagementDesc: "すべての予約を確認・管理",
      courseManagement: "コース管理",
      courseManagementDesc: "コース情報の追加・編集",
      roomManagement: "教室管理",
      roomManagementDesc: "教室情報の管理",
      userManagement: "ユーザー管理",
      userManagementDesc: "ユーザーアカウントの管理",
      status: {
        pending: "保留中",
        confirmed: "確定",
        completed: "完了",
        cancelled: "キャンセル",
      },
    },
  };

  const t = texts[currentLanguage];

  // 로그인 및 권한 확인
  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
    } else if (user.role !== "admin") {
      router.push("/reservation/japanese/mypage");
    }
  }, [user, router]);

  // 통계 계산
  const getStats = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let filteredReservations = reservations;

    if (selectedPeriod === "today") {
      filteredReservations = reservations.filter((reservation) => {
        const reservationDate =
          reservation.date instanceof Date
            ? reservation.date
            : new Date(reservation.date);
        return reservationDate >= today;
      });
    } else if (selectedPeriod === "week") {
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredReservations = reservations.filter((reservation) => {
        const reservationDate =
          reservation.date instanceof Date
            ? reservation.date
            : new Date(reservation.date);
        return reservationDate >= weekAgo;
      });
    } else if (selectedPeriod === "month") {
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredReservations = reservations.filter((reservation) => {
        const reservationDate =
          reservation.date instanceof Date
            ? reservation.date
            : new Date(reservation.date);
        return reservationDate >= monthAgo;
      });
    }

    return {
      total: filteredReservations.length,
      pending: filteredReservations.filter((r) => r.status === "pending")
        .length,
      confirmed: filteredReservations.filter((r) => r.status === "confirmed")
        .length,
      completed: filteredReservations.filter((r) => r.status === "completed")
        .length,
      cancelled: filteredReservations.filter((r) => r.status === "cancelled")
        .length,
    };
  };

  const stats = getStats();

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
              <p className="text-gray-600 mt-1">{t.subtitle}</p>
            </div>
            <div className="flex items-center gap-4">
              {/* 언어 전환 버튼 */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title={
                  currentLanguage === "ko"
                    ? "日本語に切り替え"
                    : "한국어로 전환"
                }
              >
                <Globe className="w-4 h-4" />
                <span className="text-xs font-medium">
                  {currentLanguage === "ko" ? "🇯🇵" : "🇰🇷"}
                </span>
              </button>

              <select
                value={selectedPeriod}
                onChange={(e) =>
                  setSelectedPeriod(
                    e.target.value as "today" | "week" | "month",
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="today">{t.today}</option>
                <option value="week">{t.week}</option>
                <option value="month">{t.month}</option>
              </select>
            </div>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">{t.totalReservations}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">{t.pendingReservations}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pending}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">
                  {t.confirmedReservations}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.confirmed}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">
                  {t.completedReservations}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.completed}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">
                  {t.cancelledReservations}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.cancelled}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 시스템 현황 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* 교실 현황 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {t.availableRooms}
              </h2>
              <MapPin className="w-5 h-5 text-gray-400" />
            </div>

            {roomsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{room.name}</p>
                      <p className="text-sm text-gray-600">
                        {t.capacity}: {room.capacity} {t.people}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        room.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {room.isActive ? t.active : t.inactive}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 코스 현황 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {t.activeCourses}
              </h2>
              <BookOpen className="w-5 h-5 text-gray-400" />
            </div>

            {coursesLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{course.name}</p>
                      <p className="text-sm text-gray-600">
                        {course.duration} {t.minutes} •{" "}
                        {course.price.toLocaleString()} {t.won}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        course.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {course.isActive ? t.active : t.inactive}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 최근 예약 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {t.recentReservations}
              </h2>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>

            {reservationsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {reservations.slice(0, 5).map((reservation) => {
                  const statusInfo = {
                    pending: {
                      color: "text-yellow-600",
                      text: t.status.pending,
                    },
                    confirmed: {
                      color: "text-green-600",
                      text: t.status.confirmed,
                    },
                    completed: {
                      color: "text-blue-600",
                      text: t.status.completed,
                    },
                    cancelled: {
                      color: "text-red-600",
                      text: t.status.cancelled,
                    },
                  }[reservation.status] || {
                    color: "text-gray-600",
                    text: "알 수 없음",
                  };

                  const reservationDate =
                    reservation.date instanceof Date
                      ? reservation.date
                      : new Date(reservation.date);

                  return (
                    <div
                      key={reservation.id}
                      className="p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-900 text-sm">
                          {reservationDate.toLocaleDateString(
                            currentLanguage === "ko" ? "ko-KR" : "ja-JP",
                          )}
                        </p>
                        <span
                          className={`text-xs font-medium ${statusInfo.color}`}
                        >
                          {statusInfo.text}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {reservation.startTime} - {reservation.endTime}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 빠른 액션 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t.quickActions}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => router.push("/admin/reservations")}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <Calendar className="w-6 h-6 text-blue-600 mb-2" />
              <h3 className="font-medium text-gray-900">
                {t.reservationManagement}
              </h3>
              <p className="text-sm text-gray-600">
                {t.reservationManagementDesc}
              </p>
            </button>

            <button
              onClick={() => router.push("/admin/courses")}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <BookOpen className="w-6 h-6 text-green-600 mb-2" />
              <h3 className="font-medium text-gray-900">
                {t.courseManagement}
              </h3>
              <p className="text-sm text-gray-600">{t.courseManagementDesc}</p>
            </button>

            <button
              onClick={() => router.push("/admin/rooms")}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <MapPin className="w-6 h-6 text-purple-600 mb-2" />
              <h3 className="font-medium text-gray-900">{t.roomManagement}</h3>
              <p className="text-sm text-gray-600">{t.roomManagementDesc}</p>
            </button>

            <button
              onClick={() => router.push("/admin/users")}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <Users className="w-6 h-6 text-orange-600 mb-2" />
              <h3 className="font-medium text-gray-900">{t.userManagement}</h3>
              <p className="text-sm text-gray-600">{t.userManagementDesc}</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

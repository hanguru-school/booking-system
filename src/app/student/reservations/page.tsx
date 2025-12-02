"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  MessageSquare,
  Plus,
  Eye,
  Trash2,
  Filter,
  CalendarDays,
  Clock3,
  Star,
} from "lucide-react";
import Link from "next/link";

interface Reservation {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status: string;
  notes?: string;
  createdAt: string;
  teacher?: {
    name: string;
    rating: number;
  };
}

type FilterType = "all" | "last" | "thisMonth" | "first";

export default function ReservationsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/reservations/list");

      if (!response.ok) {
        throw new Error("예약 목록을 불러올 수 없습니다.");
      }

      const data = await response.json();
      setReservations(data.reservations || []);
    } catch (error) {
      console.error("예약 로드 오류:", error);
      setError(
        error instanceof Error
          ? error.message
          : "예약 목록을 불러오는 중 오류가 발생했습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    try {
      setCancelling(reservationId);
      const response = await fetch(
        `/api/reservations/${reservationId}/cancel`,
        {
          method: "PUT",
        },
      );

      if (!response.ok) {
        throw new Error("예약 취소에 실패했습니다.");
      }

      // 취소 성공 후 목록 새로고침
      await loadReservations();
      setShowCancelModal(null);
    } catch (error) {
      console.error("예약 취소 오류:", error);
      setError(
        error instanceof Error
          ? error.message
          : "예약 취소 중 오류가 발생했습니다.",
      );
    } finally {
      setCancelling(null);
    }
  };

  const getFilteredReservations = () => {
    if (filter === "all") return reservations;

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return reservations.filter((reservation) => {
      const reservationDate = new Date(reservation.date);

      switch (filter) {
        case "last":
          // 가장 최근 예약
          return reservation === reservations[0];
        case "thisMonth":
          // 이번달 예약
          return reservationDate >= thisMonth;
        case "first":
          // 첫 번째 예약
          return reservation === reservations[reservations.length - 1];
        default:
          return true;
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "ATTENDED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "확정";
      case "PENDING":
        return "대기";
      case "CANCELLED":
        return "취소";
      case "ATTENDED":
        return "완료";
      default:
        return status;
    }
  };

  const getDayOfWeek = (date: string) => {
    return new Date(date).toLocaleDateString("ko-KR", { weekday: "long" });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time: string) => {
    return time;
  };

  const filteredReservations = getFilteredReservations();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">예약 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">내 예약</h1>
            <p className="text-lg text-gray-600">
              나의 예약 이력을 확인하고 관리하세요
            </p>
          </div>
          <Link
            href="/student/reservations/new"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />새 예약하기
          </Link>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              </div>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* 필터 버튼들 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            필터
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => setFilter("all")}
              className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                filter === "all"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">전체</span>
            </button>
            <button
              onClick={() => setFilter("last")}
              className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                filter === "last"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">마지막 예약</span>
            </button>
            <button
              onClick={() => setFilter("thisMonth")}
              className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                filter === "thisMonth"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span className="text-sm font-medium">이번달 예약</span>
            </button>
            <button
              onClick={() => setFilter("first")}
              className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                filter === "first"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Clock3 className="w-4 h-4" />
              <span className="text-sm font-medium">첫 예약</span>
            </button>
          </div>
        </div>

        {/* 예약 목록 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            예약 목록 ({filteredReservations.length}개)
          </h2>

          {filteredReservations.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                예약이 없습니다
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === "all"
                  ? "아직 예약한 수업이 없습니다."
                  : "해당 조건의 예약이 없습니다."}
              </p>
              <Link
                href="/student/reservations/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />첫 예약하기
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-gray-900">
                            {formatDate(reservation.date)} (
                            {getDayOfWeek(reservation.date)})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-green-600" />
                          <span className="text-gray-700">
                            {formatTime(reservation.startTime)} ~{" "}
                            {formatTime(reservation.endTime)}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}
                        >
                          {getStatusText(reservation.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-purple-600" />
                          <span className="text-sm text-gray-600">선생님:</span>
                          <span className="font-medium text-gray-900">
                            {reservation.teacher?.name || "선생님"}
                            {reservation.teacher?.rating && (
                              <span className="ml-1 text-yellow-500">
                                ★ {reservation.teacher.rating}
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-orange-600" />
                          <span className="text-sm text-gray-600">
                            수업 방식:
                          </span>
                          <span className="font-medium text-gray-900">
                            {reservation.location === "ONLINE"
                              ? "온라인"
                              : "대면"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-red-600" />
                          <span className="text-sm text-gray-600">예약일:</span>
                          <span className="font-medium text-gray-900">
                            {new Date(reservation.createdAt).toLocaleDateString(
                              "ko-KR",
                            )}
                          </span>
                        </div>
                      </div>

                      {reservation.notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            {reservation.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {reservation.status === "CONFIRMED" && (
                        <>
                          <Link
                            href={`/student/reservations/complete/${reservation.id}`}
                            className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            상세보기
                          </Link>
                          <button
                            onClick={() => setShowCancelModal(reservation.id)}
                            className="flex items-center gap-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            취소
                          </button>
                        </>
                      )}
                      {reservation.status === "PENDING" && (
                        <button
                          onClick={() => setShowCancelModal(reservation.id)}
                          className="flex items-center gap-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          취소
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 예약 취소 모달 */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  예약 취소 확인
                </h3>
                <button
                  onClick={() => setShowCancelModal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <div className="w-5 h-5">×</div>
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  정말로 이 예약을 취소하시겠습니까?
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">
                    취소된 예약은 복구할 수 없습니다.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  돌아가기
                </button>
                <button
                  type="button"
                  onClick={() => handleCancelReservation(showCancelModal)}
                  disabled={cancelling === showCancelModal}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {cancelling === showCancelModal ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      취소 중...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      예약 취소
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  CheckCircle,
  Calendar,
  Clock,
  User,
  MapPin,
  MessageSquare,
  ArrowLeft,
  Plus,
  X,
  Trash2,
  Eye,
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
  classroom?: string;
  courseId?: string;
  teacherId?: string;
  createdAt: string;
  course?: {
    name: string;
    description: string;
    price: number;
  };
  teacher?: {
    name: string;
    rating: number;
  };
}

export default function ReservationCompletePage() {
  const router = useRouter();
  const params = useParams();
  const reservationId = params.id as string;

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadReservation();
  }, [reservationId]);

  const loadReservation = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reservations/${reservationId}`);

      if (!response.ok) {
        throw new Error("예약 정보를 불러올 수 없습니다.");
      }

      const data = await response.json();
      setReservation(data.reservation);
    } catch (error) {
      console.error("예약 로드 오류:", error);
      setError(
        error instanceof Error
          ? error.message
          : "예약 정보를 불러오는 중 오류가 발생했습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCalendar = () => {
    if (!reservation) return;

    const event = {
      title: `${reservation.course?.name || "일본어 수업"}`,
      description: `선생님: ${reservation.teacher?.name || "선생님"}\n${reservation.notes || ""}`,
      start: `${reservation.date}T${reservation.startTime}:00`,
      end: `${reservation.date}T${reservation.endTime}:00`,
      location: reservation.classroom || reservation.location,
    };

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.start}/${event.end}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;

    window.open(calendarUrl, "_blank");
  };

  const handleCancelReservation = async () => {
    try {
      setCancelling(true);
      const response = await fetch(
        `/api/reservations/${reservationId}/cancel`,
        {
          method: "PUT",
        },
      );

      if (!response.ok) {
        throw new Error("예약 취소에 실패했습니다.");
      }

      // 취소 성공 후 예약 목록으로 이동
      router.push("/student/reservations");
    } catch (error) {
      console.error("예약 취소 오류:", error);
      setError(
        error instanceof Error
          ? error.message
          : "예약 취소 중 오류가 발생했습니다.",
      );
    } finally {
      setCancelling(false);
      setShowCancelModal(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">예약 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">오류 발생</h1>
          <p className="text-gray-600 mb-6">
            {error || "예약 정보를 찾을 수 없습니다."}
          </p>
          <Link
            href="/student/reservations"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            예약 목록으로
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">예약 완료</h1>
            <p className="text-lg text-gray-600">
              예약이 성공적으로 완료되었습니다
            </p>
          </div>
          <Link
            href="/student/reservations"
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            예약 목록으로
          </Link>
        </div>

        {/* 성공 메시지 */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <h2 className="text-xl font-semibold text-green-800">
                예약이 완료되었습니다!
              </h2>
              <p className="text-green-700">예약 코드: {reservation.id}</p>
            </div>
          </div>
        </div>

        {/* 예약 상세 정보 */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            예약 정보
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 기본 정보 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">날짜</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(reservation.date)} (
                    {getDayOfWeek(reservation.date)})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">시간</p>
                  <p className="font-medium text-gray-900">
                    {formatTime(reservation.startTime)} ~{" "}
                    {formatTime(reservation.endTime)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-500">선생님</p>
                  <p className="font-medium text-gray-900">
                    {reservation.teacher?.name || "선생님"}
                    {reservation.teacher?.rating && (
                      <span className="ml-2 text-yellow-500">
                        ★ {reservation.teacher.rating}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-500">수업 방식</p>
                  <p className="font-medium text-gray-900">
                    {reservation.location === "ONLINE" ? "온라인" : "대면"}
                  </p>
                </div>
              </div>
            </div>

            {/* 추가 정보 */}
            <div className="space-y-4">
              {reservation.course && (
                <div>
                  <p className="text-sm text-gray-500">코스</p>
                  <p className="font-medium text-gray-900">
                    {reservation.course.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {reservation.course.description}
                  </p>
                </div>
              )}

              {reservation.classroom && (
                <div>
                  <p className="text-sm text-gray-500">수업 장소</p>
                  <p className="font-medium text-gray-900">
                    {reservation.classroom}
                  </p>
                </div>
              )}

              {reservation.notes && (
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">메모</p>
                    <p className="font-medium text-gray-900">
                      {reservation.notes}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500">예약 일시</p>
                <p className="font-medium text-gray-900">
                  {new Date(reservation.createdAt).toLocaleString("ko-KR")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 기능 버튼들 */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            예약 관리
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 계속 예약하기 */}
            <Link
              href="/student/reservations/new"
              className="flex flex-col items-center gap-3 p-6 border-2 border-blue-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
            >
              <Plus className="w-8 h-8 text-blue-600" />
              <div className="text-center">
                <p className="font-semibold text-gray-900">계속 예약하기</p>
                <p className="text-sm text-gray-600">새로운 수업 예약</p>
              </div>
            </Link>

            {/* 캘린더에 추가 */}
            <button
              onClick={handleAddToCalendar}
              className="flex flex-col items-center gap-3 p-6 border-2 border-green-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all"
            >
              <Calendar className="w-8 h-8 text-green-600" />
              <div className="text-center">
                <p className="font-semibold text-gray-900">캘린더에 추가</p>
                <p className="text-sm text-gray-600">Google Calendar</p>
              </div>
            </button>

            {/* 모든 예약 확인하기 */}
            <Link
              href="/student/reservations"
              className="flex flex-col items-center gap-3 p-6 border-2 border-purple-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all"
            >
              <Eye className="w-8 h-8 text-purple-600" />
              <div className="text-center">
                <p className="font-semibold text-gray-900">모든 예약 확인</p>
                <p className="text-sm text-gray-600">예약 목록 보기</p>
              </div>
            </Link>

            {/* 예약 취소하기 */}
            <button
              onClick={() => setShowCancelModal(true)}
              className="flex flex-col items-center gap-3 p-6 border-2 border-red-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-all"
            >
              <Trash2 className="w-8 h-8 text-red-600" />
              <div className="text-center">
                <p className="font-semibold text-gray-900">예약 취소</p>
                <p className="text-sm text-gray-600">이 예약 취소하기</p>
              </div>
            </button>
          </div>
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
                  onClick={() => setShowCancelModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
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
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  돌아가기
                </button>
                <button
                  type="button"
                  onClick={handleCancelReservation}
                  disabled={cancelling}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {cancelling ? (
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

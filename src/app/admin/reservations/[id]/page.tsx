"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Clock,
  User,
  BookOpen,
  Calendar,
  MapPin,
  XCircle,
  Edit,
  ArrowLeft,
  Plus,
  History,
} from "lucide-react";

interface ReservationDetail {
  id: string;
  bookingCode: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  duration: number; // 분 단위
  type: "in-person" | "online";
  studentName: string;
  studentId: string;
  teacherName: string;
  courseName: string;
  status:
    | "scheduled"
    | "completed"
    | "pre-cancelled"
    | "day-before-cancelled"
    | "same-day-cancelled";
  completionStatus: "not-started" | "in-progress" | "completed";
  memo?: string;
  location?: string;
  isRecurring: boolean;
  recurringId?: string;
  recurringNumber?: number;
}

export default function ReservationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reservationId = params.id as string;

  const [reservation, setReservation] = useState<ReservationDetail | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [newStatus, setNewStatus] =
    useState<ReservationDetail["status"]>("scheduled");
  const [newCompletionStatus, setNewCompletionStatus] =
    useState<ReservationDetail["completionStatus"]>("not-started");

  useEffect(() => {
    fetchReservationDetail();
  }, [reservationId]);

  const fetchReservationDetail = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/reservations/${reservationId}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        console.error("예약 상세 정보 로딩 실패:", response.status, response.statusText);
        setIsLoading(false);
        return;
      }
      
      const data = await response.json();
      
      if (data.success && data.reservation) {
        const res = data.reservation;
        const reservationDetail: ReservationDetail = {
          id: res.id,
          bookingCode: res.id.substring(0, 12).toUpperCase(),
          bookingDate: res.date ? new Date(res.date).toISOString().split('T')[0] : '',
          startTime: res.startTime ? new Date(res.startTime).toISOString() : '',
          endTime: res.endTime ? new Date(res.endTime).toISOString() : '',
          duration: res.duration || 60,
          type: res.location === 'ONLINE' ? 'online' : 'in-person',
          studentName: res.student?.kanjiName || res.student?.name || '알 수 없음',
          studentId: res.studentId || '',
          teacherName: res.teacher?.kanjiName || res.teacher?.name || '미설정',
          courseName: res.lessonType || '미설정',
          status: res.status === 'ATTENDED' ? 'completed' :
                  res.status === 'CANCELLED' ? 'same-day-cancelled' :
                  res.status === 'CONFIRMED' ? 'scheduled' :
                  res.status === 'PENDING' ? 'scheduled' :
                  res.status === 'NO_SHOW' ? 'completed' : 'scheduled',
          completionStatus: res.status === 'ATTENDED' ? 'completed' :
                           res.status === 'CANCELLED' ? 'not-started' :
                           res.status === 'PENDING' ? 'not-started' :
                           res.status === 'CONFIRMED' ? 'in-progress' : 'not-started',
          memo: res.notes || '',
          location: res.location === 'ONLINE' ? '온라인' : '대면',
          isRecurring: false,
        };
        setReservation(reservationDetail);
        setNewStatus(reservationDetail.status);
        setNewCompletionStatus(reservationDetail.completionStatus);
      } else {
        console.error("예약 데이터 형식 오류:", data);
      }
    } catch (error) {
      console.error("예약 상세 정보 로딩 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!reservation) return;

    setIsUpdating(true);
    try {
      const response = await fetch(
        `/api/admin/reservations/${reservationId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (response.ok) {
        setReservation((prev) =>
          prev ? { ...prev, status: newStatus } : null,
        );
        setShowStatusModal(false);
      } else {
        alert("상태 변경에 실패했습니다.");
      }
    } catch (error) {
      alert("상태 변경 중 오류가 발생했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCompletionChange = async () => {
    if (!reservation) return;

    setIsUpdating(true);
    try {
      const response = await fetch(
        `/api/admin/reservations/${reservationId}/completion`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ completionStatus: newCompletionStatus }),
        },
      );

      if (response.ok) {
        setReservation((prev) =>
          prev ? { ...prev, completionStatus: newCompletionStatus } : null,
        );
        setShowCompletionModal(false);
      } else {
        alert("완료 상태 변경에 실패했습니다.");
      }
    } catch (error) {
      alert("완료 상태 변경 중 오류가 발생했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditReservation = () => {
    router.push(`/admin/reservations/${reservationId}/edit`);
  };

  const handleCancelReservation = async () => {
    if (!confirm("정말로 이 예약을 취소하시겠습니까?")) return;

    setIsUpdating(true);
    try {
      const response = await fetch(
        `/api/admin/reservations/${reservationId}/cancel`,
        {
          method: "PUT",
        },
      );

      if (response.ok) {
        setReservation((prev) =>
          prev ? { ...prev, status: "same-day-cancelled" } : null,
        );
        alert("예약이 취소되었습니다.");
      } else {
        alert("예약 취소에 실패했습니다.");
      }
    } catch (error) {
      alert("예약 취소 중 오류가 발생했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddBooking = () => {
    router.push(`/admin/reservations/new?studentId=${reservation?.studentId}`);
  };

  const handleViewHistory = () => {
    if (reservation?.studentId) {
      router.push(
        `/admin/reservations/history?studentId=${reservation.studentId}`,
      );
    } else {
      alert('학생 ID를 찾을 수 없습니다.');
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const getStatusColor = (status: ReservationDetail["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "pre-cancelled":
        return "bg-yellow-100 text-yellow-800";
      case "day-before-cancelled":
        return "bg-orange-100 text-orange-800";
      case "same-day-cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: ReservationDetail["status"]) => {
    switch (status) {
      case "completed":
        return "완료";
      case "scheduled":
        return "예정";
      case "pre-cancelled":
        return "사전취소";
      case "day-before-cancelled":
        return "전일취소";
      case "same-day-cancelled":
        return "당일취소";
      default:
        return "알 수 없음";
    }
  };

  const getCompletionStatusText = (
    status: ReservationDetail["completionStatus"],
  ) => {
    switch (status) {
      case "not-started":
        return "시작 전";
      case "in-progress":
        return "진행 중";
      case "completed":
        return "완료";
      default:
        return "알 수 없음";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">
            예약을 찾을 수 없습니다.
          </h2>
          <p className="text-gray-600 mt-2">
            요청하신 예약 정보가 존재하지 않습니다.
          </p>
        </div>
      </div>
    );
  }

  const isCompleted = reservation.status === "completed";
  const isCancelled = reservation.status.includes("cancelled");

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">예약 상세</h1>
        </div>

        <div className="flex items-center space-x-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation.status)}`}
          >
            {getStatusText(reservation.status)}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              reservation.completionStatus === "completed"
                ? "bg-green-100 text-green-800"
                : reservation.completionStatus === "in-progress"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
            }`}
          >
            {getCompletionStatusText(reservation.completionStatus)}
          </span>
        </div>
      </div>

      {/* 예약 정보 */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 기본 정보 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-600">예약 일시</div>
                  <div className="font-medium">
                    {formatDateTime(reservation.bookingDate)}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-600">수업 시간</div>
                  <div className="font-medium">
                    {formatTime(reservation.startTime)} -{" "}
                    {formatTime(reservation.endTime)} ({reservation.duration}분)
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-600">수업 방식</div>
                  <div className="font-medium">
                    {reservation.type === "in-person" ? "대면" : "온라인"}
                    {reservation.location && ` • ${reservation.location}`}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-600">학생</div>
                  <div className="font-medium">
                    {reservation.studentName} ({reservation.studentId})
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <BookOpen className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-600">담당 선생님</div>
                  <div className="font-medium">{reservation.teacherName}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <BookOpen className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-600">코스</div>
                  <div className="font-medium">{reservation.courseName}</div>
                </div>
              </div>
            </div>

            {/* 추가 정보 */}
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">예약 코드</div>
                <div className="font-mono bg-gray-100 px-3 py-2 rounded">
                  {reservation.bookingCode}
                </div>
              </div>

              {reservation.isRecurring && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">정기 예약</div>
                  <div className="font-medium">
                    시리즈 #{reservation.recurringId} •{" "}
                    {reservation.recurringNumber}회차
                  </div>
                </div>
              )}

              {reservation.memo && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">메모</div>
                  <div className="bg-gray-50 p-3 rounded">
                    {reservation.memo}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">예약 관리</h3>

          <div className="flex flex-wrap gap-3">
            {isCompleted ? (
              <>
                <button
                  onClick={handleAddBooking}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>추가 예약</span>
                </button>
                <button
                  onClick={handleViewHistory}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  <History className="w-4 h-4" />
                  <span>예약 히스토리 보기</span>
                </button>
              </>
            ) : !isCancelled ? (
              <>
                <button
                  onClick={handleEditReservation}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Edit className="w-4 h-4" />
                  <span>예약 편집</span>
                </button>
                <button
                  onClick={handleCancelReservation}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <XCircle className="w-4 h-4" />
                  <span>예약 취소</span>
                </button>
              </>
            ) : (
              <div className="text-gray-500">취소된 예약입니다.</div>
            )}
          </div>

          {/* 상태 변경 */}
          {!isCancelled && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="text-md font-semibold mb-3">상태 관리</h4>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowStatusModal(true)}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  예약 상태 변경
                </button>
                <button
                  onClick={() => setShowCompletionModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  완료 상태 변경
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 상태 변경 모달 */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">예약 상태 변경</h3>
            <div className="space-y-3 mb-6">
              {(
                [
                  "scheduled",
                  "completed",
                  "pre-cancelled",
                  "day-before-cancelled",
                  "same-day-cancelled",
                ] as const
              ).map((status) => (
                <label key={status} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={newStatus === status}
                    onChange={(e) =>
                      setNewStatus(
                        e.target.value as ReservationDetail["status"],
                      )
                    }
                    className="text-blue-600"
                  />
                  <span>{getStatusText(status)}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                취소
              </button>
              <button
                onClick={handleStatusChange}
                disabled={isUpdating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isUpdating ? "변경 중..." : "변경"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 완료 상태 변경 모달 */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">완료 상태 변경</h3>
            <div className="space-y-3 mb-6">
              {(["not-started", "in-progress", "completed"] as const).map(
                (status) => (
                  <label key={status} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="completionStatus"
                      value={status}
                      checked={newCompletionStatus === status}
                      onChange={(e) =>
                        setNewCompletionStatus(
                          e.target
                            .value as ReservationDetail["completionStatus"],
                        )
                      }
                      className="text-blue-600"
                    />
                    <span>{getCompletionStatusText(status)}</span>
                  </label>
                ),
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCompletionModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                취소
              </button>
              <button
                onClick={handleCompletionChange}
                disabled={isUpdating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isUpdating ? "변경 중..." : "변경"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

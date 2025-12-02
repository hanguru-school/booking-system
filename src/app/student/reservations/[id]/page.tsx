"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  User,
  BookOpen,
  MapPin,
  MessageSquare,
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Star,
} from "lucide-react";
import Link from "next/link";

interface Reservation {
  id: string;
  date: string;
  time: string;
  teacher: string;
  teacherAssigned: boolean; // 선생님이 지정되었는지 여부
  subject: string;
  status: "upcoming" | "completed" | "cancelled";
  duration: number;
  location: string;
  notes?: string;
  remainingMinutes: number; // 현재 남은 시간 (분)
  totalPurchasedMinutes: number; // 총 구매한 시간 (분)
  teacherBio?: string; // 선생님 자기소개
}

export default function ReservationDetailPage() {
  const params = useParams();
  const router = useRouter();
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

      // 실제 API 호출로 대체
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockReservation: Reservation = {
        id: reservationId,
        date: "2024-01-15",
        time: "14:00",
        teacher:
          reservationId === "1"
            ? "김선생님"
            : reservationId === "2"
              ? "이선생님"
              : reservationId === "3"
                ? "박선생님"
                : reservationId === "5"
                  ? ""
                  : "정선생님",
        teacherAssigned:
          reservationId === "1"
            ? true
            : reservationId === "2"
              ? true
              : reservationId === "3"
                ? true
                : reservationId === "5"
                  ? false
                  : true,
        subject: "한국어 회화",
        status:
          reservationId === "2" || reservationId === "3"
            ? "completed"
            : reservationId === "4"
              ? "cancelled"
              : "upcoming",
        duration: 60,
        location: "온라인",
        notes: "일상 대화 연습을 하고 싶습니다.",
        remainingMinutes:
          reservationId === "5" ? 30 : reservationId === "6" ? 150 : 300,
        totalPurchasedMinutes:
          reservationId === "5" ? 120 : reservationId === "6" ? 300 : 600,
        teacherBio:
          "한국어 회화 강사로 10년 이상의 경력을 가지고 있습니다. 청소년 교육 경험이 풍부하며, 학생들의 목표에 맞춰 개인적인 수업을 진행합니다.",
      };

      setReservation(mockReservation);
      setLoading(false);
    } catch (error) {
      console.error("예약 조회 실패:", error);
      setError("예약 정보를 불러오는데 실패했습니다.");
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setCancelling(true);

      // 실제 API 호출로 대체
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("예약 취소:", reservationId);

      // 성공 시 목록으로 이동
      router.push("/student/reservations");
    } catch (error) {
      console.error("예약 취소 실패:", error);
      setError("예약 취소 중 오류가 발생했습니다.");
    } finally {
      setCancelling(false);
      setShowCancelModal(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Clock className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "upcoming":
        return "예정";
      case "completed":
        return "완료";
      case "cancelled":
        return "취소";
      default:
        return "알 수 없음";
    }
  };

  const getDayOfWeek = (date: string) => {
    return new Date(date).toLocaleDateString("ko-KR", { weekday: "long" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">예약 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">오류 발생</h1>
            <p className="text-lg text-gray-600 mb-8">
              {error || "예약을 찾을 수 없습니다."}
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">예약 상세</h1>
            <p className="text-lg text-gray-600">
              예약 정보를 확인하고 관리하세요
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

        {/* 예약 정보 카드 */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          {/* 상태 헤더 */}
          <div className={`px-6 py-4 ${getStatusColor(reservation.status)}`}>
            <div className="flex items-center gap-2">
              {getStatusIcon(reservation.status)}
              <span className="font-medium">
                {getStatusText(reservation.status)}
              </span>
            </div>
          </div>

          {/* 예약 상세 정보 */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 기본 정보 */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    기본 정보
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="text-sm text-gray-600">날짜</div>
                        <div className="font-medium text-gray-900">
                          {reservation.date} ({getDayOfWeek(reservation.date)})
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="text-sm text-gray-600">시간</div>
                        <div className="font-medium text-gray-900">
                          {reservation.time} ({reservation.duration}분)
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-purple-600" />
                      <div>
                        <div className="text-sm text-gray-600">선생님</div>
                        <div
                          className={`font-medium ${reservation.teacherAssigned ? "text-gray-900" : "text-gray-500"}`}
                        >
                          {reservation.teacherAssigned
                            ? reservation.teacher
                            : "미확정"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-orange-600" />
                      <div>
                        <div className="text-sm text-gray-600">과목</div>
                        <div className="font-medium text-gray-900">
                          {reservation.subject} ({reservation.duration}분)
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-red-600" />
                      <div>
                        <div className="text-sm text-gray-600">장소</div>
                        <div className="font-medium text-gray-900">
                          {reservation.location}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 메모 */}
                {reservation.notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      메모
                    </h3>
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-5 h-5 text-gray-600 mt-0.5" />
                      <div className="text-gray-700 bg-gray-50 rounded-lg p-3 flex-1">
                        {reservation.notes}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 남은 시간 정보 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  남은 시간 정보
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">현재 남은 시간</span>
                    <span className="font-medium text-gray-900">
                      {reservation.remainingMinutes}분
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      이번 레슨 후 남는 시간
                    </span>
                    <span className="font-medium text-gray-900">
                      {Math.max(
                        0,
                        reservation.remainingMinutes - reservation.duration,
                      )}
                      분
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">총 구매 시간</span>
                    <span className="font-medium text-gray-900">
                      {reservation.totalPurchasedMinutes}분
                    </span>
                  </div>
                </div>

                {/* 구매 안내 메시지 */}
                {reservation.remainingMinutes <= 180 && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-yellow-800 mb-1">
                          레슨 시간 구매 필요
                        </div>
                        <div className="text-sm text-yellow-700">
                          남은 시간이 {reservation.remainingMinutes}분으로
                          부족합니다. 원활한 수업을 위해 추가 시간을 구매해
                          주세요.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 선생님 정보 */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    선생님 정보
                  </h3>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <User className="w-8 h-8 text-blue-600" />
                      <div>
                        <div
                          className={`font-medium ${reservation.teacherAssigned ? "text-gray-900" : "text-gray-500"}`}
                        >
                          {reservation.teacherAssigned
                            ? reservation.teacher
                            : "미확정"}
                        </div>
                        <div className="text-sm text-gray-600">
                          한국어 전문 강사
                        </div>
                      </div>
                    </div>
                    {reservation.teacherAssigned && (
                      <div className="flex items-start gap-3">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span>4.8</span>
                        </div>
                        {reservation.teacherBio && (
                          <div className="text-sm text-gray-700 flex-1">
                            {reservation.teacherBio}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex justify-end gap-4">
          {reservation.status === "upcoming" && (
            <>
              <Link
                href={`/student/reservations/${reservation.id}/edit`}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit className="w-4 h-4" />
                수정
              </Link>
              <button
                onClick={() => setShowCancelModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                취소
              </button>
            </>
          )}
          {reservation.status === "completed" && (
            <Link
              href={`/student/reviews?lessonId=${reservation.id}`}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Star className="w-4 h-4" />
              리뷰 작성
            </Link>
          )}
        </div>

        {/* 취소 확인 모달 */}
        {showCancelModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                예약 취소
              </h3>
              <p className="text-gray-600 mb-6">
                정말로 이 예약을 취소하시겠습니까? 취소된 예약은 복구할 수
                없습니다.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={cancelling}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {cancelling ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
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

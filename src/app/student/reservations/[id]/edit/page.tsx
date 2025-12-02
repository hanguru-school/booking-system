"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  Save,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface Reservation {
  id: string;
  date: string;
  time: string;
  teacher: string;
  teacherAssigned: boolean;
  subject: string;
  status: "upcoming" | "completed" | "cancelled";
  duration: number;
  location: string;
  notes?: string;
  remainingMinutes: number;
  totalPurchasedMinutes: number;
  teacherBio?: string;
}

export default function EditReservationPage() {
  const params = useParams();
  const router = useRouter();
  const reservationId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // 원본 예약 데이터
  const [originalReservation, setOriginalReservation] =
    useState<Reservation | null>(null);

  // 폼 데이터
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // 시간대 관련
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [hoveredTime, setHoveredTime] = useState<string>("");

  // 날짜 관련
  const [minDate, setMinDate] = useState<string>("");
  const [maxDate, setMaxDate] = useState<string>("");

  // 수업 시간 옵션
  const durationOptions = [
    {
      duration: 60,
      description: "가장 기본적인 시간입니다. 초급 학생에게 적절합니다.",
    },
    {
      duration: 90,
      description:
        "회화 레슨에 가장 적절한 수업 시간입니다. 초급부터 상급까지 빠른 레벨업에 적절합니다.",
    },
    {
      duration: 120,
      description:
        "중급 이상의 학생에게 적절하며 다양한 실전회화를 연습할 수 있습니다.",
    },
    {
      duration: 150,
      description:
        "특별한 목적을 가진 전문적인 수업에 적합합니다. 중급 이상에게 적절합니다.",
    },
    {
      duration: 180,
      description:
        "특별한 목적을 가진 전문적인 수업에 적합합니다. 중급 이상에게 적절합니다.",
    },
    {
      duration: 80,
      description:
        "기본보다 조금 더 깊이 있는 수업이 가능합니다. 초급이나 발음 등의 집중레슨에 적절합니다.",
    },
  ];

  // 기존 예약 데이터 (실제로는 API에서 가져와야 함)
  const existingReservations = [
    { date: "2024-01-15", time: "10:00", duration: 90 },
    { date: "2024-01-15", time: "14:00", duration: 120 },
    { date: "2024-01-15", time: "16:30", duration: 60 },
    { date: "2024-01-16", time: "09:00", duration: 150 },
    { date: "2024-01-16", time: "13:00", duration: 90 },
  ];

  useEffect(() => {
    // 최소 날짜 (오늘), 최대 날짜 (3개월 후)
    const today = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(today.getMonth() + 3);

    setMinDate(today.toISOString().split("T")[0]);
    setMaxDate(threeMonthsLater.toISOString().split("T")[0]);

    // 데이터 로드
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // 실제 API 호출로 대체
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockReservation: Reservation = {
        id: reservationId,
        date: "2024-01-15",
        time: "14:00",
        teacher: "김선생님",
        teacherAssigned: true,
        subject: "한국어 회화",
        status: "upcoming",
        duration: 60,
        location: "온라인",
        notes: "일상 대화 연습을 하고 싶습니다.",
        remainingMinutes: 300,
        totalPurchasedMinutes: 600,
        teacherBio:
          "한국어 회화 강사로 10년 이상의 경력을 가지고 있습니다. 청소년 교육 경험이 풍부하며, 학생들의 목표에 맞춰 개인적인 수업을 진행합니다.",
      };

      setOriginalReservation(mockReservation);

      // 폼 데이터 초기화
      setSelectedLocation(mockReservation.location);
      setSelectedDuration(mockReservation.duration);
      setSelectedDate(mockReservation.date);
      setSelectedTime(mockReservation.time);
      setNotes(mockReservation.notes || "");

      setLoading(false);
    } catch (error) {
      console.error("예약 정보 로드 실패:", error);
      setError("예약 정보를 불러오는데 실패했습니다.");
      setLoading(false);
    }
  };

  const loadAvailableTimeSlots = async () => {
    try {
      if (!selectedDuration) return;

      // 실제 API 호출로 대체
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 5분 단위로 시간대 생성 (09:00 ~ 21:00)
      const slots: TimeSlot[] = [];
      for (let hour = 9; hour <= 21; hour++) {
        for (let minute = 0; minute < 60; minute += 5) {
          const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

          // 해당 날짜의 기존 예약 확인
          const dayReservations = existingReservations.filter(
            (r) => r.date === selectedDate,
          );

          // 현재 시간대와 겹치는 예약이 있는지 확인
          const isConflicting = dayReservations.some((reservation) => {
            const reservationStart = new Date(`2024-01-15 ${reservation.time}`);
            const reservationEnd = new Date(
              reservationStart.getTime() + (reservation.duration + 10) * 60000,
            ); // +10분 준비시간
            const currentStart = new Date(`2024-01-15 ${time}`);
            const currentEnd = new Date(
              currentStart.getTime() + (selectedDuration + 10) * 60000,
            ); // +10분 준비시간

            return (
              currentStart < reservationEnd && currentEnd > reservationStart
            );
          });

          slots.push({
            time,
            available: !isConflicting,
          });
        }
      }

      setAvailableTimeSlots(slots);
    } catch (error) {
      console.error("가능한 시간대 로드 오류:", error);
      setAvailableTimeSlots([]);
    }
  };

  useEffect(() => {
    if (selectedDate && selectedDuration) {
      loadAvailableTimeSlots();
    }
  }, [selectedDate, selectedDuration]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !selectedLocation ||
      !selectedDuration ||
      !selectedDate ||
      !selectedTime
    ) {
      setError("모든 필수 항목을 입력해주세요.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // 실제 API 호출로 대체
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("예약 수정:", {
        id: reservationId,
        location: selectedLocation,
        duration: selectedDuration,
        date: selectedDate,
        time: selectedTime,
        notes,
      });

      setSuccess(true);

      // 성공 시 상세 페이지로 이동
      setTimeout(() => {
        router.push(`/student/reservations/${reservationId}`);
      }, 1500);
    } catch (error) {
      console.error("예약 수정 실패:", error);
      setError("예약 수정 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const getDayOfWeek = (date: string) => {
    return new Date(date).toLocaleDateString("ko-KR", { weekday: "long" });
  };

  const hasChanges = () => {
    if (!originalReservation) return false;

    return (
      selectedLocation !== originalReservation.location ||
      selectedDuration !== originalReservation.duration ||
      selectedDate !== originalReservation.date ||
      selectedTime !== originalReservation.time ||
      notes !== (originalReservation.notes || "")
    );
  };

  // 시간이 충돌하는지 확인하는 함수
  const isTimeConflicting = (time: string) => {
    if (!selectedDuration) return false;

    const dayReservations = existingReservations.filter(
      (r) => r.date === selectedDate,
    );
    const currentTime = new Date(`2024-01-15 ${time}`);

    return dayReservations.some((reservation) => {
      const reservationStart = new Date(`2024-01-15 ${reservation.time}`);
      const reservationEnd = new Date(
        reservationStart.getTime() + (reservation.duration + 10) * 60000,
      );
      const currentEnd = new Date(
        currentTime.getTime() + (selectedDuration + 10) * 60000,
      );

      return currentTime < reservationEnd && currentEnd > reservationStart;
    });
  };

  // 시간이 호버된 범위에 포함되는지 확인하는 함수
  const isTimeInHoveredRange = (time: string) => {
    if (!hoveredTime || !selectedDuration) return false;

    const hoverStart = new Date(`2024-01-15 ${hoveredTime}`);
    const hoverEnd = new Date(
      hoverStart.getTime() + (selectedDuration + 10) * 60000,
    );
    const currentTime = new Date(`2024-01-15 ${time}`);

    return currentTime >= hoverStart && currentTime < hoverEnd;
  };

  // 시간이 중복된 범위에 포함되는지 확인하는 함수
  const isTimeInConflictingRange = (time: string) => {
    if (!selectedDuration) return false;

    const dayReservations = existingReservations.filter(
      (r) => r.date === selectedDate,
    );
    const currentTime = new Date(`2024-01-15 ${time}`);

    return dayReservations.some((reservation) => {
      const reservationStart = new Date(`2024-01-15 ${reservation.time}`);
      const reservationEnd = new Date(
        reservationStart.getTime() + (reservation.duration + 10) * 60000,
      );
      return currentTime >= reservationStart && currentTime < reservationEnd;
    });
  };

  // 시간이 선택된 범위에 포함되는지 확인하는 함수
  const isTimeInSelectedRange = (time: string) => {
    if (!selectedTime || !selectedDuration) return false;

    const selectedStart = new Date(`2024-01-15 ${selectedTime}`);
    const selectedEnd = new Date(
      selectedStart.getTime() + (selectedDuration + 10) * 60000,
    );
    const currentTime = new Date(`2024-01-15 ${time}`);

    return currentTime >= selectedStart && currentTime < selectedEnd;
  };

  // 시간대의 상태를 결정하는 함수
  const getTimeSlotStatus = (time: string) => {
    if (!selectedDuration) return "disabled";

    const isConflicting = isTimeConflicting(time);
    const isHovered = isTimeInHoveredRange(time);
    const isSelected = isTimeInSelectedRange(time);

    if (isSelected) {
      return "selected";
    } else if (isConflicting) {
      return isHovered ? "conflicting-hover" : "conflicting";
    } else {
      return isHovered ? "available-hover" : "available";
    }
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

  if (error && !originalReservation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">오류 발생</h1>
            <p className="text-lg text-gray-600 mb-8">{error}</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">예약 수정</h1>
            <p className="text-lg text-gray-600">예약 정보를 수정하세요</p>
          </div>
          <Link
            href={`/student/reservations/${reservationId}`}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            예약 상세로
          </Link>
        </div>

        {/* 성공 메시지 */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium text-green-800">
                  예약이 성공적으로 수정되었습니다!
                </div>
                <div className="text-sm text-green-700">
                  잠시 후 예약 상세 페이지로 이동합니다.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 오류 메시지 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div className="text-red-800">{error}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1단계: 수업 방식 선택 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              1. 수업 방식 선택
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedLocation("오프라인")}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  selectedLocation === "오프라인"
                    ? "border-blue-500 bg-blue-50 text-blue-900"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-medium">오프라인</div>
                <div className="text-sm text-gray-600 mt-1">대면 수업</div>
              </button>
              <button
                type="button"
                onClick={() => setSelectedLocation("온라인")}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  selectedLocation === "온라인"
                    ? "border-blue-500 bg-blue-50 text-blue-900"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-medium">온라인</div>
                <div className="text-sm text-gray-600 mt-1">
                  화상회의를 통한 원격 수업
                </div>
              </button>
            </div>
          </div>

          {/* 2단계: 수업 시간 선택 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              2. 수업 시간 선택
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {durationOptions.map((option) => (
                <button
                  key={option.duration}
                  type="button"
                  onClick={() => setSelectedDuration(option.duration)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedDuration === option.duration
                      ? "border-blue-500 bg-blue-50 text-blue-900"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium">{option.duration}분</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {option.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 3단계: 날짜 선택 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              3. 날짜 선택
            </h2>
            <div className="max-w-md">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={minDate}
                max={maxDate}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {selectedDate && (
                <div className="mt-2 text-sm text-gray-600">
                  {selectedDate} ({getDayOfWeek(selectedDate)})
                </div>
              )}
            </div>
          </div>

          {/* 4단계: 시간 선택 */}
          {selectedDate && selectedDuration && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                4. 시간 선택
              </h2>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {availableTimeSlots.map((slot) => {
                  const status = getTimeSlotStatus(slot.time);
                  const isInConflictingRange = isTimeInConflictingRange(
                    slot.time,
                  );
                  const isInHoveredRange = isTimeInHoveredRange(slot.time);

                  const getButtonClasses = () => {
                    const baseClasses =
                      "p-2 text-sm rounded transition-all duration-200 relative";

                    switch (status) {
                      case "available":
                        return `${baseClasses} bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-gray-400`;
                      case "available-hover":
                        return `${baseClasses} bg-blue-100 border border-blue-400 text-blue-800`;
                      case "conflicting":
                        return `${baseClasses} bg-gray-100 border border-gray-300 text-gray-400 cursor-not-allowed`;
                      case "conflicting-hover":
                        return `${baseClasses} bg-orange-100 border border-orange-400 text-orange-800`;
                      case "selected":
                        return `${baseClasses} bg-blue-500 text-white border-blue-500 font-medium`;
                      default:
                        return `${baseClasses} bg-gray-50 border border-gray-200 text-gray-400 cursor-not-allowed`;
                    }
                  };

                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      onClick={() =>
                        slot.available && setSelectedTime(slot.time)
                      }
                      onMouseEnter={() => setHoveredTime(slot.time)}
                      onMouseLeave={() => setHoveredTime("")}
                      className={getButtonClasses()}
                    >
                      {slot.time}
                      {isInHoveredRange &&
                        isInConflictingRange &&
                        status !== "selected" && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-0.5 bg-red-500 transform rotate-45"></div>
                          </div>
                        )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 메모 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              메모 (선택사항)
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="수업에 대한 특별한 요청사항이나 메모를 입력하세요..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 예약 요약 */}
          {(selectedLocation ||
            selectedDuration ||
            selectedDate ||
            selectedTime) && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                예약 요약
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">수업 방식:</span>
                  <span className="font-medium">
                    {selectedLocation || "선택 안됨"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">수업 시간:</span>
                  <span className="font-medium">
                    {selectedDuration
                      ? `${selectedDuration}분 (준비시간 10분 포함)`
                      : "선택 안됨"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">날짜:</span>
                  <span className="font-medium">
                    {selectedDate || "선택 안됨"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">시간:</span>
                  <span className="font-medium">
                    {selectedTime ? (
                      <>
                        {selectedTime} ~{" "}
                        {(() => {
                          const startTime = new Date(
                            `2024-01-15 ${selectedTime}`,
                          );
                          const endTime = new Date(
                            startTime.getTime() +
                              (selectedDuration + 10) * 60000,
                          );
                          return endTime.toTimeString().slice(0, 5);
                        })()}
                      </>
                    ) : (
                      "선택 안됨"
                    )}
                  </span>
                </div>
                {notes && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">메모:</span>
                    <span className="font-medium">{notes}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex justify-end gap-4">
            <Link
              href={`/student/reservations/${reservationId}`}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={
                !hasChanges() ||
                saving ||
                !selectedLocation ||
                !selectedDuration ||
                !selectedDate ||
                !selectedTime
              }
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  수정 중...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  예약 수정
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

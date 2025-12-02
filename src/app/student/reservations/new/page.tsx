"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Star,
  BookOpen,
  Video,
  AlertCircle,
  CalendarPlus,
  ArrowRight,
  Download,
  ExternalLink,
  Shield,
} from "lucide-react";

interface Course {
  id: string;
  name: string;
  description: string;
  duration: number; // 분 단위
  price: number;
  level: string;
  type: "online" | "offline" | "both";
  teacher?: {
    name: string;
    rating: number;
    specialties: string[];
  };
}

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  available: boolean;
  teacherName: string;
  location: string;
}

interface ReservationData {
  courseId: string;
  date: string;
  timeSlotId: string;
  notes?: string;
  agreedToTerms: boolean;
}

export default function NewReservationPage() {
  const router = useRouter();
  const [step, setStep] = useState<
    "course" | "datetime" | "confirm" | "complete"
  >("course");
  const [courses, setCourses] = useState<Course[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(
    null,
  );
  const [reservationData, setReservationData] = useState<ReservationData>({
    courseId: "",
    date: "",
    timeSlotId: "",
    notes: "",
    agreedToTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse && selectedDate) {
      loadTimeSlots();
    }
  }, [selectedCourse, selectedDate]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      // 실제 API 호출로 대체
      const mockCourses: Course[] = [
        {
          id: "1",
          name: "초급 회화",
          description: "기본적인 일상 회화를 배우는 코스입니다.",
          duration: 40,
          price: 30000,
          level: "초급",
          type: "both",
          teacher: {
            name: "김선생님",
            rating: 4.8,
            specialties: ["초급 회화", "발음 교정"],
          },
        },
        {
          id: "2",
          name: "중급 문법",
          description: "중급 문법과 실용적인 표현을 학습합니다.",
          duration: 60,
          price: 40000,
          level: "중급",
          type: "online",
          teacher: {
            name: "이선생님",
            rating: 4.9,
            specialties: ["문법", "작문"],
          },
        },
        {
          id: "3",
          name: "고급 토론",
          description: "고급 수준의 토론과 발표 능력을 기릅니다.",
          duration: 90,
          price: 50000,
          level: "고급",
          type: "offline",
          teacher: {
            name: "박선생님",
            rating: 4.7,
            specialties: ["토론", "발표"],
          },
        },
      ];
      setCourses(mockCourses);
    } catch (error) {
      setError("코스 정보를 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  const loadTimeSlots = async () => {
    try {
      setLoading(true);
      // 실제 API 호출로 대체
      const mockTimeSlots: TimeSlot[] = [
        {
          id: "1",
          startTime: "09:00",
          endTime: "09:40",
          available: true,
          teacherName: "김선생님",
          location: "온라인",
        },
        {
          id: "2",
          startTime: "10:00",
          endTime: "10:40",
          available: true,
          teacherName: "이선생님",
          location: "온라인",
        },
        {
          id: "3",
          startTime: "14:00",
          endTime: "14:40",
          available: false,
          teacherName: "박선생님",
          location: "대면",
        },
        {
          id: "4",
          startTime: "15:00",
          endTime: "15:40",
          available: true,
          teacherName: "김선생님",
          location: "온라인",
        },
      ];
      setTimeSlots(mockTimeSlots);
    } catch (error) {
      setError("시간대 정보를 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    setReservationData((prev) => ({ ...prev, courseId: course.id }));
    setStep("datetime");
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setReservationData((prev) => ({ ...prev, date }));
  };

  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setReservationData((prev) => ({ ...prev, timeSlotId: timeSlot.id }));
    setStep("confirm");
  };

  const handleConfirmReservation = async () => {
    try {
      setLoading(true);
      // 실제 API 호출로 대체
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStep("complete");
    } catch (error) {
      setError("예약에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    const days = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("ko-KR");
  };

  const days = getDaysInMonth(currentMonth);

  if (loading && step === "course") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">코스 정보를 불러오는 중...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">새 예약</h1>
            <p className="text-lg text-gray-600">
              {step === "course" && "수업 코스를 선택하세요"}
              {step === "datetime" && "날짜와 시간을 선택하세요"}
              {step === "confirm" && "예약 정보를 확인하세요"}
              {step === "complete" && "예약이 완료되었습니다"}
            </p>
          </div>
          {step !== "complete" && (
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              돌아가기
            </button>
          )}
        </div>

        {/* 진행 단계 표시 */}
        {step !== "complete" && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-center">
              {[
                { id: "course", label: "코스 선택", icon: BookOpen },
                { id: "datetime", label: "날짜/시간", icon: Calendar },
                { id: "confirm", label: "확인", icon: CheckCircle },
              ].map((stepItem, index) => (
                <div key={stepItem.id} className="flex items-center">
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                      step === stepItem.id
                        ? "bg-blue-100 text-blue-700"
                        : index <
                            ["course", "datetime", "confirm"].indexOf(step)
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <stepItem.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      {stepItem.label}
                    </span>
                  </div>
                  {index < 2 && (
                    <ChevronRight className="w-5 h-5 text-gray-400 mx-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* 코스 선택 단계 */}
        {step === "course" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              수업 코스 선택
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => handleCourseSelect(course)}
                  className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {course.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        course.level === "초급"
                          ? "bg-green-100 text-green-700"
                          : course.level === "중급"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {course.level}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4">{course.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {course.duration}분
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {course.type === "online"
                          ? "온라인"
                          : course.type === "offline"
                            ? "대면"
                            : "온라인/대면"}
                      </span>
                    </div>
                    {course.teacher && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {course.teacher.name}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-gray-600">
                            {course.teacher.rating}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-bold text-blue-600">
                      {formatPrice(course.price)}원
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 날짜/시간 선택 단계 */}
        {step === "datetime" && selectedCourse && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {selectedCourse.name} - 날짜 및 시간 선택
            </h2>

            {/* 달력 */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">날짜 선택</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentMonth(
                        new Date(
                          currentMonth.getFullYear(),
                          currentMonth.getMonth() - 1,
                          1,
                        ),
                      )
                    }
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-lg font-medium text-gray-900">
                    {currentMonth.toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                    })}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentMonth(
                        new Date(
                          currentMonth.getFullYear(),
                          currentMonth.getMonth() + 1,
                          1,
                        ),
                      )
                    }
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                  <div
                    key={day}
                    className="p-2 text-center text-sm font-medium text-gray-500"
                  >
                    {day}
                  </div>
                ))}
                {days.map((day, index) => {
                  const isCurrentMonth =
                    day.getMonth() === currentMonth.getMonth();
                  const isToday =
                    day.toDateString() === new Date().toDateString();
                  const isSelected =
                    selectedDate === day.toISOString().split("T")[0];
                  const isPast = day < new Date();

                  return (
                    <button
                      key={index}
                      onClick={() =>
                        !isPast &&
                        handleDateSelect(day.toISOString().split("T")[0])
                      }
                      disabled={isPast}
                      className={`p-2 text-center text-sm rounded-lg transition-colors ${
                        !isCurrentMonth
                          ? "text-gray-300"
                          : isPast
                            ? "text-gray-400 cursor-not-allowed"
                            : isSelected
                              ? "bg-blue-600 text-white"
                              : isToday
                                ? "bg-blue-100 text-blue-700"
                                : "hover:bg-gray-100"
                      }`}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 시간대 선택 */}
            {selectedDate && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  시간대 선택
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {timeSlots.map((timeSlot) => (
                    <button
                      key={timeSlot.id}
                      onClick={() =>
                        timeSlot.available && handleTimeSlotSelect(timeSlot)
                      }
                      disabled={!timeSlot.available}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        timeSlot.available
                          ? "border-gray-200 hover:border-blue-300 hover:shadow-md"
                          : "border-gray-100 bg-gray-50 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <div className="font-medium text-gray-900">
                            {timeSlot.startTime} - {timeSlot.endTime}
                          </div>
                          <div className="text-sm text-gray-600">
                            {timeSlot.teacherName} • {timeSlot.location}
                          </div>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            timeSlot.available
                              ? "border-blue-500"
                              : "border-gray-300"
                          }`}
                        >
                          {timeSlot.available && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full m-0.5"></div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 예약 확인 단계 */}
        {step === "confirm" && selectedCourse && selectedTimeSlot && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              예약 정보 확인
            </h2>

            <div className="space-y-6">
              {/* 예약 정보 */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  예약 정보
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="text-sm text-gray-600">수업 코스</div>
                      <div className="font-medium text-gray-900">
                        {selectedCourse.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="text-sm text-gray-600">수업 날짜</div>
                      <div className="font-medium text-gray-900">
                        {new Date(selectedDate).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          weekday: "long",
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="text-sm text-gray-600">수업 시간</div>
                      <div className="font-medium text-gray-900">
                        {selectedTimeSlot.startTime} -{" "}
                        {selectedTimeSlot.endTime}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-orange-600" />
                    <div>
                      <div className="text-sm text-gray-600">담당 선생님</div>
                      <div className="font-medium text-gray-900">
                        {selectedTimeSlot.teacherName}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Zoom 링크 (온라인 수업인 경우) */}
              {selectedTimeSlot.location === "온라인" && (
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Video className="w-5 h-5 text-green-600" />
                    Zoom 링크
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 mb-1">
                        수업 링크
                      </div>
                      <div className="font-medium text-gray-900">
                        https://zoom.us/j/123456789
                      </div>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                      링크 열기
                    </button>
                  </div>
                </div>
              )}

              {/* 예약 규정 동의 */}
              <div className="bg-yellow-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-yellow-600" />
                  예약 규정 동의
                </h3>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reservationData.agreedToTerms}
                      onChange={(e) =>
                        setReservationData((prev) => ({
                          ...prev,
                          agreedToTerms: e.target.checked,
                        }))
                      }
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="text-sm text-gray-700">
                      <div className="font-medium mb-1">
                        예약 규정에 동의합니다
                      </div>
                      <div className="text-gray-600">
                        • 수업 24시간 전까지 취소 가능
                        <br />
                        • 수업 시작 10분 전까지 입장
                        <br />• 개인정보 수집 및 이용에 동의
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* 메모 입력 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  메모 (선택사항)
                </h3>
                <textarea
                  value={reservationData.notes}
                  onChange={(e) =>
                    setReservationData((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="선생님께 전달할 메모를 입력하세요..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
            </div>

            {/* 예약 버튼 */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleConfirmReservation}
                disabled={!reservationData.agreedToTerms || loading}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    예약 중...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    예약 확인
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* 예약 완료 단계 */}
        {step === "complete" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                예약이 완료되었습니다!
              </h2>
              <p className="text-gray-600 mb-8">
                수업 전에 알림을 받으실 수 있습니다.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <button className="flex items-center justify-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <CalendarPlus className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">캘린더에 추가</span>
                </button>
                <button className="flex items-center justify-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Download className="w-5 h-5 text-green-600" />
                  <span className="font-medium">확인서 다운로드</span>
                </button>
                <button
                  onClick={() => {
                    setStep("course");
                    setSelectedCourse(null);
                    setSelectedDate("");
                    setSelectedTimeSlot(null);
                    setReservationData({
                      courseId: "",
                      date: "",
                      timeSlotId: "",
                      notes: "",
                      agreedToTerms: false,
                    });
                  }}
                  className="flex items-center justify-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ArrowRight className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">계속 예약하기</span>
                </button>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => router.push("/student/reservations")}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  예약 목록 보기
                </button>
                <button
                  onClick={() => router.push("/student/dashboard")}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  대시보드로 이동
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

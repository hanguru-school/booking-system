"use client";

import { useState, useEffect } from "react";
import { Calendar, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";

interface ClassSchedule {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  studentName: string;
  courseName: string;
  duration: number;
  status: "scheduled" | "completed" | "cancelled";
  attendanceStatus: "not_started" | "attended" | "absent";
  isTagged: boolean;
  isLocked: boolean;
}

interface AttendanceStatus {
  isCheckedIn: boolean;
  isCheckedOut: boolean;
  checkInTime?: string;
  checkOutTime?: string;
}

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [viewType, setViewType] = useState<"week" | "month">("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>({
    isCheckedIn: false,
    isCheckedOut: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
    checkTodayAttendance();
  }, [currentDate, viewType]);

  const fetchSchedules = async () => {
    setIsLoading(true);
    try {
      // 실제 API 호출로 대체
      const mockSchedules: ClassSchedule[] = [
        {
          id: "1",
          date: "2024-01-15",
          startTime: "10:00",
          endTime: "11:00",
          studentName: "김학생",
          courseName: "초급 한국어",
          duration: 60,
          status: "completed",
          attendanceStatus: "attended",
          isTagged: true,
          isLocked: false,
        },
        {
          id: "2",
          date: "2024-01-15",
          startTime: "14:00",
          endTime: "15:00",
          studentName: "박학생",
          courseName: "중급 한국어",
          duration: 60,
          status: "scheduled",
          attendanceStatus: "not_started",
          isTagged: false,
          isLocked: false,
        },
        {
          id: "3",
          date: "2024-01-16",
          startTime: "09:00",
          endTime: "10:00",
          studentName: "이학생",
          courseName: "고급 한국어",
          duration: 60,
          status: "scheduled",
          attendanceStatus: "not_started",
          isTagged: false,
          isLocked: false,
        },
        {
          id: "4",
          date: "2024-01-17",
          startTime: "13:00",
          endTime: "14:00",
          studentName: "최학생",
          courseName: "초급 한국어",
          duration: 60,
          status: "scheduled",
          attendanceStatus: "not_started",
          isTagged: false,
          isLocked: false,
        },
      ];
      setSchedules(mockSchedules);
    } catch (error) {
      console.error("수업 일정 로딩 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkTodayAttendance = async () => {
    try {
      // 실제 API 호출로 대체
      const mockAttendance: AttendanceStatus = {
        isCheckedIn: true,
        isCheckedOut: false,
        checkInTime: "09:30",
      };
      setAttendanceStatus(mockAttendance);
    } catch (error) {
      console.error("오늘 근태 확인 실패:", error);
    }
  };

  const handleCheckIn = async () => {
    try {
      const response = await fetch("/api/employee/attendance/checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setAttendanceStatus((prev) => ({
          ...prev,
          isCheckedIn: true,
          checkInTime: new Date().toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));
        await fetchSchedules();
        alert("출근이 기록되었습니다.");
      } else {
        alert("출근 기록에 실패했습니다.");
      }
    } catch (error) {
      alert("출근 기록 중 오류가 발생했습니다.");
    }
  };

  const handleCheckOut = async () => {
    try {
      const response = await fetch("/api/employee/attendance/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setAttendanceStatus((prev) => ({
          ...prev,
          isCheckedOut: true,
          checkOutTime: new Date().toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));
        await fetchSchedules();
        alert("퇴근이 기록되었습니다.");
      } else {
        alert("퇴근 기록에 실패했습니다.");
      }
    } catch (error) {
      alert("퇴근 기록 중 오류가 발생했습니다.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "attended":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
      case "absent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "완료";
      case "scheduled":
        return "예정";
      case "cancelled":
        return "취소";
      case "attended":
        return "출석";
      case "absent":
        return "결석";
      default:
        return "알 수 없음";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
      weekday: "short",
    });
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}시간 ${mins}분`;
  };

  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getMonthDates = () => {
    const dates = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // 이전 달의 마지막 날짜들
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getSchedulesForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];
    return schedules.filter((schedule) => schedule.date === dateString);
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (viewType === "week") {
      newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7));
    } else {
      newDate.setMonth(
        currentDate.getMonth() + (direction === "next" ? 1 : -1),
      );
    }
    setCurrentDate(newDate);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-semibold">수업 일정</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewType("week")}
                  className={`px-3 py-1 rounded text-sm ${
                    viewType === "week"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  주간
                </button>
                <button
                  onClick={() => setViewType("month")}
                  className={`px-3 py-1 rounded text-sm ${
                    viewType === "month"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  월간
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 오늘 근태 상태 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">오늘 근태</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {attendanceStatus.checkInTime || "--:--"}
              </div>
              <div className="text-sm text-gray-600">출근 시간</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {attendanceStatus.checkOutTime || "--:--"}
              </div>
              <div className="text-sm text-gray-600">퇴근 시간</div>
            </div>
            <div className="flex items-center justify-center space-x-2">
              {!attendanceStatus.isCheckedIn ? (
                <button
                  onClick={handleCheckIn}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  출근하기
                </button>
              ) : !attendanceStatus.isCheckedOut ? (
                <button
                  onClick={handleCheckOut}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  퇴근하기
                </button>
              ) : (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">근무 완료</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 캘린더 네비게이션 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateDate("prev")}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold">
              {viewType === "week"
                ? `${currentDate.toLocaleDateString("ko-KR", { month: "long", year: "numeric" })} 주간`
                : `${currentDate.toLocaleDateString("ko-KR", { month: "long", year: "numeric" })}`}
            </h3>
            <button
              onClick={() => navigateDate("next")}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* 캘린더 뷰 */}
          {viewType === "week" ? (
            <div className="grid grid-cols-7 gap-2">
              {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-gray-600 py-2"
                >
                  {day}
                </div>
              ))}
              {getWeekDates().map((date, index) => {
                const daySchedules = getSchedulesForDate(date);
                const isToday =
                  date.toDateString() === new Date().toDateString();
                return (
                  <div
                    key={index}
                    className={`min-h-32 border rounded-lg p-2 ${
                      isToday ? "bg-blue-50 border-blue-200" : "bg-white"
                    }`}
                  >
                    <div
                      className={`text-sm font-medium mb-2 ${
                        isToday ? "text-blue-600" : "text-gray-900"
                      }`}
                    >
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {daySchedules.map((schedule) => (
                        <div
                          key={schedule.id}
                          className={`text-xs p-1 rounded ${
                            schedule.isLocked
                              ? "bg-gray-100 text-gray-500"
                              : schedule.attendanceStatus === "attended"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          <div className="font-medium truncate">
                            {schedule.studentName}
                          </div>
                          <div className="text-xs">{schedule.startTime}</div>
                          {schedule.isTagged && (
                            <div className="text-xs text-green-600">✓ 출근</div>
                          )}
                          {schedule.attendanceStatus === "attended" && (
                            <div className="text-xs text-blue-600">✓ 출석</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-gray-600 py-2"
                >
                  {day}
                </div>
              ))}
              {getMonthDates().map((date, index) => {
                const daySchedules = getSchedulesForDate(date);
                const isToday =
                  date.toDateString() === new Date().toDateString();
                const isCurrentMonth =
                  date.getMonth() === currentDate.getMonth();
                return (
                  <div
                    key={index}
                    className={`min-h-20 border rounded p-1 ${
                      isToday ? "bg-blue-50 border-blue-200" : "bg-white"
                    } ${!isCurrentMonth ? "opacity-50" : ""}`}
                  >
                    <div
                      className={`text-xs font-medium mb-1 ${
                        isToday ? "text-blue-600" : "text-gray-900"
                      }`}
                    >
                      {date.getDate()}
                    </div>
                    <div className="space-y-0.5">
                      {daySchedules.slice(0, 2).map((schedule) => (
                        <div
                          key={schedule.id}
                          className={`text-xs p-0.5 rounded ${
                            schedule.isLocked
                              ? "bg-gray-100 text-gray-500"
                              : schedule.attendanceStatus === "attended"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          <div className="truncate">{schedule.studentName}</div>
                          {schedule.isTagged && (
                            <div className="text-xs text-green-600">✓</div>
                          )}
                        </div>
                      ))}
                      {daySchedules.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{daySchedules.length - 2}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 상세 일정 리스트 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">상세 일정</h3>
            <div className="space-y-4">
              {schedules.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>해당 기간에 수업 일정이 없습니다.</p>
                </div>
              ) : (
                schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="border rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="font-medium">
                            {schedule.studentName}
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}
                          >
                            {getStatusText(schedule.status)}
                          </span>
                          {schedule.isTagged && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              출근 완료
                            </span>
                          )}
                          {schedule.attendanceStatus === "attended" && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              출석 완료
                            </span>
                          )}
                          {schedule.isLocked && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              잠금됨
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatDate(schedule.date)} • {schedule.startTime}-
                          {schedule.endTime}
                        </div>
                        <div className="text-sm text-gray-500">
                          {schedule.courseName}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {formatTime(schedule.duration)}
                        </div>
                        {schedule.attendanceStatus === "not_started" &&
                          !schedule.isTagged && (
                            <div className="text-xs text-red-600 mt-1">
                              미출석
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

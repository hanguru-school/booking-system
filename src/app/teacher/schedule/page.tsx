"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Tag,
  Video,
  Building,
} from "lucide-react";

interface ClassSchedule {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  studentName: string;
  courseName: string;
  location: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  attendanceStatus: "present" | "absent" | "late" | "not-tagged";
  notes?: string;
  zoomLink?: string;
}

type ViewMode = "day" | "week" | "month";

export default function TeacherSchedulePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [classes, setClasses] = useState<ClassSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<ClassSchedule | null>(
    null,
  );
  const [showClassModal, setShowClassModal] = useState(false);

  useEffect(() => {
    loadClasses();
  }, [currentDate, viewMode]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      // 실제 API 호출로 대체
      const mockClasses: ClassSchedule[] = [
        {
          id: "1",
          date: "2024-01-15",
          startTime: "09:00",
          endTime: "09:40",
          studentName: "김학생",
          courseName: "초급 회화",
          location: "온라인",
          status: "completed",
          attendanceStatus: "present",
          zoomLink: "https://zoom.us/j/123456789",
        },
        {
          id: "2",
          date: "2024-01-15",
          startTime: "10:00",
          endTime: "10:40",
          studentName: "이학생",
          courseName: "중급 문법",
          location: "대면",
          status: "scheduled",
          attendanceStatus: "not-tagged",
        },
        {
          id: "3",
          date: "2024-01-15",
          startTime: "14:00",
          endTime: "14:40",
          studentName: "박학생",
          courseName: "고급 토론",
          location: "온라인",
          status: "in-progress",
          attendanceStatus: "late",
          zoomLink: "https://zoom.us/j/987654321",
        },
      ];
      setClasses(mockClasses);
    } catch (error) {
      console.error("수업 일정 로드 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "scheduled":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAttendanceColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800";
      case "absent":
        return "bg-red-100 text-red-800";
      case "late":
        return "bg-yellow-100 text-yellow-800";
      case "not-tagged":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "완료";
      case "in-progress":
        return "진행중";
      case "scheduled":
        return "예정";
      case "cancelled":
        return "취소";
      default:
        return "예정";
    }
  };

  const getAttendanceText = (status: string) => {
    switch (status) {
      case "present":
        return "출석";
      case "absent":
        return "결석";
      case "late":
        return "지각";
      case "not-tagged":
        return "미태깅";
      default:
        return "미태깅";
    }
  };

  const getDaysInWeek = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
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

  const formatTime = (time: string) => {
    return time;
  };

  const days =
    viewMode === "week"
      ? getDaysInWeek(currentDate)
      : getDaysInMonth(currentDate);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">수업 일정을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">수업 일정</h1>
            <p className="text-lg text-gray-600">
              나의 수업 일정을 확인하고 관리하세요
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm">
              <button
                onClick={() => setViewMode("day")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "day"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                일별
              </button>
              <button
                onClick={() => setViewMode("week")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "week"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                주별
              </button>
              <button
                onClick={() => setViewMode("month")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "month"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                월별
              </button>
            </div>
          </div>
        </div>

        {/* 날짜 네비게이션 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  const newDate = new Date(currentDate);
                  if (viewMode === "week") {
                    newDate.setDate(currentDate.getDate() - 7);
                  } else if (viewMode === "month") {
                    newDate.setMonth(currentDate.getMonth() - 1);
                  } else {
                    newDate.setDate(currentDate.getDate() - 1);
                  }
                  setCurrentDate(newDate);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-semibold text-gray-900">
                {viewMode === "day" &&
                  currentDate.toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                {viewMode === "week" &&
                  `${days[0].toLocaleDateString("ko-KR", { month: "short", day: "numeric" })} - ${days[6].toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}`}
                {viewMode === "month" &&
                  currentDate.toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                  })}
              </h2>

              <button
                onClick={() => {
                  const newDate = new Date(currentDate);
                  if (viewMode === "week") {
                    newDate.setDate(currentDate.getDate() + 7);
                  } else if (viewMode === "month") {
                    newDate.setMonth(currentDate.getMonth() + 1);
                  } else {
                    newDate.setDate(currentDate.getDate() + 1);
                  }
                  setCurrentDate(newDate);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              오늘
            </button>
          </div>

          {/* 캘린더 그리드 */}
          <div className="grid grid-cols-7 gap-1">
            {/* 요일 헤더 */}
            {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
              <div
                key={day}
                className="p-2 text-center text-sm font-medium text-gray-500"
              >
                {day}
              </div>
            ))}

            {/* 날짜 셀 */}
            {days.map((day, index) => {
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isToday = day.toDateString() === new Date().toDateString();
              const dayClasses = classes.filter(
                (c) => c.date === day.toISOString().split("T")[0],
              );

              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border border-gray-200 ${
                    !isCurrentMonth ? "bg-gray-50" : "bg-white"
                  } ${isToday ? "ring-2 ring-blue-500" : ""}`}
                >
                  <div
                    className={`text-sm font-medium mb-1 ${
                      !isCurrentMonth
                        ? "text-gray-400"
                        : isToday
                          ? "text-blue-600"
                          : "text-gray-900"
                    }`}
                  >
                    {day.getDate()}
                  </div>

                  {/* 수업 표시 */}
                  <div className="space-y-1">
                    {dayClasses.map((classItem) => (
                      <div
                        key={classItem.id}
                        onClick={() => {
                          setSelectedClass(classItem);
                          setShowClassModal(true);
                        }}
                        className="p-1 text-xs rounded cursor-pointer hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <Clock className="w-3 h-3 text-gray-500" />
                          <span className="font-medium">
                            {classItem.startTime}
                          </span>
                        </div>
                        <div className="text-xs truncate">
                          {classItem.studentName}
                        </div>
                        <div className="flex items-center gap-1">
                          <span
                            className={`px-1 py-0.5 rounded text-xs ${getStatusColor(classItem.status)}`}
                          >
                            {getStatusText(classItem.status)}
                          </span>
                          <span
                            className={`px-1 py-0.5 rounded text-xs ${getAttendanceColor(classItem.attendanceStatus)}`}
                          >
                            {getAttendanceText(classItem.attendanceStatus)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 오늘의 수업 목록 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            오늘의 수업
          </h3>

          {classes.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">오늘 예정된 수업이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {classes.map((classItem) => (
                <div
                  key={classItem.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-gray-900">
                            {formatTime(classItem.startTime)} -{" "}
                            {formatTime(classItem.endTime)}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(classItem.status)}`}
                        >
                          {getStatusText(classItem.status)}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getAttendanceColor(classItem.attendanceStatus)}`}
                        >
                          {getAttendanceText(classItem.attendanceStatus)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-purple-600" />
                          <span className="text-sm text-gray-600">학생:</span>
                          <span className="font-medium text-gray-900">
                            {classItem.studentName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-orange-600" />
                          <span className="text-sm text-gray-600">수업:</span>
                          <span className="font-medium text-gray-900">
                            {classItem.courseName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {classItem.location === "온라인" ? (
                            <Video className="w-4 h-4 text-green-600" />
                          ) : (
                            <Building className="w-4 h-4 text-green-600" />
                          )}
                          <span className="text-sm text-gray-600">방식:</span>
                          <span className="font-medium text-gray-900">
                            {classItem.location}
                          </span>
                        </div>
                      </div>

                      {classItem.notes && (
                        <div className="mt-3 p-2 bg-gray-50 rounded">
                          <p className="text-sm text-gray-700">
                            {classItem.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedClass(classItem);
                          setShowClassModal(true);
                        }}
                        className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        상세보기
                      </button>
                      {classItem.status === "scheduled" && (
                        <button className="flex items-center gap-1 px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                          <CheckCircle className="w-4 h-4" />
                          시작
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 수업 상세 모달 */}
        {showClassModal && selectedClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  수업 상세 정보
                </h3>
                <button
                  onClick={() => setShowClassModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <div className="w-5 h-5">×</div>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-600">수업 시간</div>
                    <div className="font-medium text-gray-900">
                      {formatTime(selectedClass.startTime)} -{" "}
                      {formatTime(selectedClass.endTime)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="text-sm text-gray-600">학생</div>
                    <div className="font-medium text-gray-900">
                      {selectedClass.studentName}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  <div>
                    <div className="text-sm text-gray-600">수업</div>
                    <div className="font-medium text-gray-900">
                      {selectedClass.courseName}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {selectedClass.location === "온라인" ? (
                    <Video className="w-5 h-5 text-green-600" />
                  ) : (
                    <Building className="w-5 h-5 text-green-600" />
                  )}
                  <div>
                    <div className="text-sm text-gray-600">수업 방식</div>
                    <div className="font-medium text-gray-900">
                      {selectedClass.location}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Tag className="w-5 h-5 text-yellow-600" />
                  <div>
                    <div className="text-sm text-gray-600">출석 상태</div>
                    <div
                      className={`font-medium ${getAttendanceColor(selectedClass.attendanceStatus)}`}
                    >
                      {getAttendanceText(selectedClass.attendanceStatus)}
                    </div>
                  </div>
                </div>

                {selectedClass.zoomLink && (
                  <div className="flex items-center gap-3">
                    <Video className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="text-sm text-gray-600">Zoom 링크</div>
                      <a
                        href={selectedClass.zoomLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:underline"
                      >
                        링크 열기
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowClassModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  닫기
                </button>
                {selectedClass.status === "scheduled" && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    수업 시작
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

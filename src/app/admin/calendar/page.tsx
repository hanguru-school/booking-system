"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  MapPin,
  Plus,
  Filter,
} from "lucide-react";

interface Reservation {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: string;
  location: string;
  student: {
    id: string;
    name: string;
  };
  teacher: {
    id: string;
    name: string;
  };
  service?: {
    name: string;
  };
}

type ViewMode = "month" | "week" | "day";

export default function AdminCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    teachers: [] as string[],
    locations: [] as string[],
    statuses: [] as string[],
  });
  const [showFilters, setShowFilters] = useState(false);
  const [teachers, setTeachers] = useState<Array<{ id: string; name: string }>>(
    [],
  );

  // 현재 날짜의 년월 표시
  const currentYearMonth = useMemo(() => {
    return currentDate.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
    });
  }, [currentDate]);

  // 예약 데이터 로드
  const loadReservations = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.teachers.length > 0) {
        params.append("teachers", filters.teachers.join(","));
      }
      if (filters.locations.length > 0) {
        params.append("locations", filters.locations.join(","));
      }
      if (filters.statuses.length > 0) {
        params.append("statuses", filters.statuses.join(","));
      }

      const response = await fetch(`/api/admin/reservations?${params}`);
      if (response.ok) {
        const data = await response.json();
        setReservations(data.reservations || []);
      }
    } catch (error) {
      console.error("예약 데이터 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 선생님 목록 로드
  const loadTeachers = async () => {
    try {
      const response = await fetch("/api/admin/teachers");
      if (response.ok) {
        const data = await response.json();
        setTeachers(data.teachers || []);
      }
    } catch (error) {
      console.error("선생님 목록 로드 실패:", error);
    }
  };

  useEffect(() => {
    loadReservations();
    loadTeachers();
  }, [filters]);

  // 날짜 이동 함수들
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // 월별 캘린더 렌더링
  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay() + 1); // 월요일부터 시작

    const days: Date[] = [];
    const currentDateObj = new Date(startDate);

    while (currentDateObj <= lastDay || days.length < 42) {
      days.push(new Date(currentDateObj));
      currentDateObj.setDate(currentDateObj.getDate() + 1);
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* 요일 헤더 */}
        {["월", "화", "수", "목", "금", "토", "일"].map((day) => (
          <div
            key={day}
            className="p-2 text-center font-semibold text-gray-600 bg-gray-50"
          >
            {day}
          </div>
        ))}

        {/* 날짜 셀들 */}
        {days.map((date, index) => {
          const isCurrentMonth = date.getMonth() === month;
          const isToday = date.toDateString() === new Date().toDateString();
          const dayReservations = reservations.filter(
            (r) => new Date(r.date).toDateString() === date.toDateString(),
          );

          return (
            <div
              key={index}
              className={`min-h-[120px] p-2 border border-gray-200 ${
                isCurrentMonth ? "bg-white" : "bg-gray-50"
              } ${isToday ? "ring-2 ring-blue-500" : ""}`}
            >
              <div
                className={`text-sm font-medium ${
                  isCurrentMonth ? "text-gray-900" : "text-gray-400"
                } ${isToday ? "text-blue-600" : ""}`}
              >
                {date.getDate()}
              </div>

              {/* 예약 표시 */}
              <div className="mt-1 space-y-1">
                {dayReservations.slice(0, 3).map((reservation) => (
                  <div
                    key={reservation.id}
                    className="text-xs p-1 rounded cursor-pointer hover:bg-blue-50"
                    style={{
                      backgroundColor: "#3B82F6" + "20",
                      borderLeft: `3px solid #3B82F6`,
                    }}
                    onClick={() => handleReservationClick(reservation)}
                  >
                    <div className="font-medium truncate">
                      {reservation.startTime} - {reservation.endTime}
                    </div>
                    <div className="truncate">{reservation.student.name}</div>
                    <div className="text-gray-500 truncate">
                      {reservation.teacher.name}
                    </div>
                  </div>
                ))}
                {dayReservations.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayReservations.length - 3}개 더
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // 주별 캘린더 렌더링
  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek + 1);

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      days.push(date);
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* 요일 헤더 */}
        {["월", "화", "수", "목", "금", "토", "일"].map((day, index) => (
          <div
            key={day}
            className="p-2 text-center font-semibold text-gray-600 bg-gray-50"
          >
            <div>{day}</div>
            <div className="text-sm text-gray-500">{days[index].getDate()}</div>
          </div>
        ))}

        {/* 시간대별 예약 */}
        {days.map((date, dayIndex) => {
          const dayReservations = reservations.filter(
            (r) => new Date(r.date).toDateString() === date.toDateString(),
          );

          return (
            <div
              key={dayIndex}
              className="min-h-[600px] p-2 border border-gray-200"
            >
              {dayReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="mb-2 p-2 rounded cursor-pointer hover:bg-blue-50"
                  style={{
                    backgroundColor: "#3B82F6" + "20",
                    borderLeft: `3px solid #3B82F6`,
                  }}
                  onClick={() => handleReservationClick(reservation)}
                >
                  <div className="text-sm font-medium">
                    {reservation.startTime} - {reservation.endTime}
                  </div>
                  <div className="text-xs">{reservation.student.name}</div>
                  <div className="text-xs text-gray-500">
                    {reservation.teacher.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {reservation.location}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  // 일별 캘린더 렌더링
  const renderDayView = () => {
    const dayReservations = reservations.filter(
      (r) => new Date(r.date).toDateString() === currentDate.toDateString(),
    );

    return (
      <div className="space-y-4">
        <div className="text-lg font-semibold text-gray-900">
          {currentDate.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
          })}
        </div>

        <div className="space-y-2">
          {dayReservations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              이 날의 예약이 없습니다
            </div>
          ) : (
            dayReservations.map((reservation) => (
              <div
                key={reservation.id}
                className="p-4 border rounded-lg cursor-pointer hover:bg-blue-50"
                style={{
                  backgroundColor: "#3B82F6" + "10",
                  borderLeft: `4px solid #3B82F6`,
                }}
                onClick={() => handleReservationClick(reservation)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">
                      {reservation.startTime} - {reservation.endTime}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      reservation.status === "CONFIRMED"
                        ? "bg-green-100 text-green-800"
                        : reservation.status === "CANCELLED"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {reservation.status}
                  </span>
                </div>

                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span>{reservation.student.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span>{reservation.teacher.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{reservation.location}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // 예약 클릭 핸들러
  const handleReservationClick = (reservation: Reservation) => {
    // 예약 상세 페이지로 이동 또는 모달 표시
    console.log("예약 클릭:", reservation);
    // TODO: 예약 상세 모달 또는 페이지 구현
  };

  // 필터 변경 핸들러
  const handleFilterChange = (type: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [type]: prev[type as keyof typeof prev].includes(value)
        ? prev[type as keyof typeof prev].filter((v) => v !== value)
        : [...prev[type as keyof typeof prev], value],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              전체 예약 캘린더
            </h1>
            <p className="text-lg text-gray-600">
              모든 수업 예약을 한눈에 확인하세요
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              필터
            </button>

            <button
              onClick={() => {
                /* TODO: 예약 추가 페이지로 이동 */
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              예약 추가
            </button>
          </div>
        </div>

        {/* 필터 패널 */}
        {showFilters && (
          <div className="mb-6 p-4 bg-white rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 선생님 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  선생님
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {teachers.map((teacher) => (
                    <label key={teacher.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.teachers.includes(teacher.id)}
                        onChange={() =>
                          handleFilterChange("teachers", teacher.id)
                        }
                        className="rounded border-gray-300"
                      />
                      <span className="ml-2 text-sm">{teacher.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 수업 형태 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  수업 형태
                </label>
                <div className="space-y-2">
                  {["ONLINE", "OFFLINE"].map((location) => (
                    <label key={location} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.locations.includes(location)}
                        onChange={() =>
                          handleFilterChange("locations", location)
                        }
                        className="rounded border-gray-300"
                      />
                      <span className="ml-2 text-sm">
                        {location === "ONLINE" ? "온라인" : "대면"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 예약 상태 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  예약 상태
                </label>
                <div className="space-y-2">
                  {["CONFIRMED", "PENDING", "CANCELLED"].map((status) => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.statuses.includes(status)}
                        onChange={() => handleFilterChange("statuses", status)}
                        className="rounded border-gray-300"
                      />
                      <span className="ml-2 text-sm">
                        {status === "CONFIRMED"
                          ? "확정"
                          : status === "PENDING"
                            ? "대기"
                            : "취소"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 캘린더 컨트롤 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={goToPrevious}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={goToToday}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              오늘
            </button>

            <button
              onClick={goToNext}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-semibold text-gray-900">
              {currentYearMonth}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1 rounded ${
                viewMode === "month"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              월별
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1 rounded ${
                viewMode === "week"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              주별
            </button>
            <button
              onClick={() => setViewMode("day")}
              className={`px-3 py-1 rounded ${
                viewMode === "day"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              일별
            </button>
          </div>
        </div>

        {/* 캘린더 뷰 */}
        <div className="bg-white rounded-lg border">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">로딩 중...</span>
            </div>
          ) : (
            <div className="p-6">
              {viewMode === "month" && renderMonthView()}
              {viewMode === "week" && renderWeekView()}
              {viewMode === "day" && renderDayView()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

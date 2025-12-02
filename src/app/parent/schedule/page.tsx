"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Wifi,
  Search,
  ChevronLeft,
  ChevronRight,
  Home,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface ScheduleItem {
  id: string;
  childName: string;
  courseName: string;
  teacher: string;
  date: string;
  time: string;
  duration: number;
  location: "online" | "offline";
  room?: string;
  status: "upcoming" | "in_progress" | "completed" | "cancelled";
  notes?: string;
}

export default function ParentSchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"today" | "week" | "month">("today");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "upcoming" | "in_progress" | "completed" | "cancelled"
  >("all");
  const [childFilter, setChildFilter] = useState("all");

  useEffect(() => {
    // 실제 API 호출로 대체
    setTimeout(() => {
      const mockSchedule: ScheduleItem[] = [
        {
          id: "1",
          childName: "김철수",
          courseName: "한국어 기초 과정",
          teacher: "김선생님",
          date: "2024-01-16",
          time: "14:00",
          duration: 60,
          location: "online",
          status: "upcoming",
          notes: "발음 연습 예정",
        },
        {
          id: "2",
          childName: "김영희",
          courseName: "한국어 기초 과정",
          teacher: "이선생님",
          date: "2024-01-16",
          time: "16:00",
          duration: 60,
          location: "offline",
          room: "A-101",
          status: "upcoming",
        },
        {
          id: "3",
          childName: "김철수",
          courseName: "한국어 기초 과정",
          teacher: "김선생님",
          date: "2024-01-15",
          time: "14:00",
          duration: 60,
          location: "online",
          status: "completed",
          notes: "문법 수업 완료",
        },
        {
          id: "4",
          childName: "김영희",
          courseName: "한국어 기초 과정",
          teacher: "이선생님",
          date: "2024-01-15",
          time: "16:00",
          duration: 60,
          location: "offline",
          room: "B-203",
          status: "completed",
        },
        {
          id: "5",
          childName: "김철수",
          courseName: "한국어 기초 과정",
          teacher: "김선생님",
          date: "2024-01-17",
          time: "14:00",
          duration: 60,
          location: "online",
          status: "upcoming",
        },
      ];

      setSchedule(mockSchedule);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredSchedule = schedule.filter((item) => {
    const matchesSearch =
      item.childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.teacher.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    const matchesChild =
      childFilter === "all" || item.childName === childFilter;

    return matchesSearch && matchesStatus && matchesChild;
  });

  // 날짜별 그룹화
  const groupedSchedule = filteredSchedule.reduce(
    (groups, item) => {
      const date = item.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
      return groups;
    },
    {} as Record<string, ScheduleItem[]>,
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "upcoming":
        return "예정";
      case "in_progress":
        return "진행중";
      case "completed":
        return "완료";
      case "cancelled":
        return "취소";
      default:
        return "알 수 없음";
    }
  };

  const getLocationIcon = (location: string) => {
    switch (location) {
      case "online":
        return <Wifi className="w-4 h-4" />;
      case "offline":
        return <MapPin className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  const getLocationText = (location: string) => {
    switch (location) {
      case "online":
        return "온라인";
      case "offline":
        return "오프라인";
      default:
        return "알 수 없음";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  const getViewModeText = () => {
    switch (viewMode) {
      case "today":
        return "오늘";
      case "week":
        return "이번 주";
      case "month":
        return "이번 달";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">수업 일정</h1>
            <p className="text-lg text-gray-600">
              자녀들의 수업 일정을 확인하세요
            </p>
          </div>
          <Link
            href="/parent/home"
            className="flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            홈으로
          </Link>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">총 수업</p>
                <p className="text-2xl font-bold text-gray-900">
                  {schedule.length}회
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">예정된 수업</p>
                <p className="text-2xl font-bold text-blue-600">
                  {schedule.filter((s) => s.status === "upcoming").length}회
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">완료된 수업</p>
                <p className="text-2xl font-bold text-green-600">
                  {schedule.filter((s) => s.status === "completed").length}회
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">총 수업 시간</p>
                <p className="text-2xl font-bold text-purple-600">
                  {schedule.reduce((sum, s) => sum + s.duration, 0)}분
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* 뷰 모드 선택 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 뷰 모드 버튼 */}
            <div className="flex gap-2">
              {[
                { id: "today", label: "오늘" },
                { id: "week", label: "이번 주" },
                { id: "month", label: "이번 달" },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() =>
                    setViewMode(mode.id as "today" | "week" | "month")
                  }
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === mode.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* 날짜 네비게이션 */}
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-lg font-medium text-gray-900">
                {selectedDate.toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* 필터 및 검색 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="아이 이름, 코스명, 선생님 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as
                    | "all"
                    | "upcoming"
                    | "in_progress"
                    | "completed"
                    | "cancelled",
                )
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">전체 상태</option>
              <option value="upcoming">예정</option>
              <option value="in_progress">진행중</option>
              <option value="completed">완료</option>
              <option value="cancelled">취소</option>
            </select>

            <select
              value={childFilter}
              onChange={(e) => setChildFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">전체 아이</option>
              <option value="김철수">김철수</option>
              <option value="김영희">김영희</option>
            </select>

            <div className="text-sm text-gray-600">
              총 {filteredSchedule.length}개의 수업
            </div>
          </div>
        </div>

        {/* 수업 일정 목록 */}
        <div className="space-y-6">
          {Object.entries(groupedSchedule).map(([date, items]) => (
            <div key={date} className="bg-white rounded-xl shadow-lg">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {formatDate(date)}
                </h2>
              </div>

              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={item.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">
                            {item.time}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.duration}분
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {item.courseName}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                            >
                              {getStatusText(item.status)}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {item.childName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {item.teacher}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getLocationIcon(item.location)}
                              <span className="text-sm text-gray-600">
                                {getLocationText(item.location)}
                                {item.room && ` (${item.room})`}
                              </span>
                            </div>
                          </div>

                          {item.notes && (
                            <p className="text-sm text-gray-600">
                              {item.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {item.status === "upcoming" && (
                          <button className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-lg hover:bg-red-200">
                            취소
                          </button>
                        )}
                        <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg">
                          <AlertCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

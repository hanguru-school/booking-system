"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  BookOpen,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  MessageSquare,
  Star,
  Filter,
  Search,
  Download,
} from "lucide-react";

interface LessonHistory {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  studentName: string;
  serviceName: string;
  lessonType: "face-to-face" | "online";
  status: "completed" | "cancelled" | "no-show";
  hasReview: boolean;
  reviewContent?: string;
  reviewRating?: number;
  memo?: string;
  reservationId: string;
}

export default function EmployeeHistoryPage() {
  const [lessons, setLessons] = useState<LessonHistory[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<LessonHistory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selectedLesson, setSelectedLesson] = useState<LessonHistory | null>(
    null,
  );
  const [showDetailModal, setShowDetailModal] = useState(false);

  // 샘플 데이터 로드
  useEffect(() => {
    const sampleLessons: LessonHistory[] = [
      {
        id: "1",
        date: "2025-01-15",
        startTime: "09:00",
        endTime: "09:40",
        studentName: "田中太郎",
        serviceName: "대면 수업 40분",
        lessonType: "face-to-face",
        status: "completed",
        hasReview: true,
        reviewContent: "발음 교정에 도움이 되었습니다.",
        reviewRating: 5,
        memo: "발음 교정에 집중",
        reservationId: "RES001",
      },
      {
        id: "2",
        date: "2025-01-14",
        startTime: "10:00",
        endTime: "11:00",
        studentName: "鈴木花子",
        serviceName: "온라인 수업 60분",
        lessonType: "online",
        status: "completed",
        hasReview: false,
        reservationId: "RES002",
      },
      {
        id: "3",
        date: "2025-01-13",
        startTime: "14:00",
        endTime: "14:40",
        studentName: "山田次郎",
        serviceName: "대면 수업 40분",
        lessonType: "face-to-face",
        status: "cancelled",
        hasReview: false,
        reservationId: "RES003",
      },
      {
        id: "4",
        date: "2025-01-12",
        startTime: "16:00",
        endTime: "17:00",
        studentName: "佐藤美咲",
        serviceName: "온라인 수업 60분",
        lessonType: "online",
        status: "completed",
        hasReview: true,
        reviewContent: "문법 설명이 명확했습니다.",
        reviewRating: 4,
        reservationId: "RES004",
      },
    ];
    setLessons(sampleLessons);
    setFilteredLessons(sampleLessons);
  }, []);

  // 필터링 및 검색
  useEffect(() => {
    let filtered = lessons;

    // 검색 필터
    if (searchTerm) {
      filtered = filtered.filter(
        (lesson) =>
          lesson.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lesson.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lesson.reservationId.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // 상태 필터
    if (statusFilter !== "all") {
      filtered = filtered.filter((lesson) => lesson.status === statusFilter);
    }

    // 날짜 필터
    if (dateFilter !== "all") {
      const today = new Date();
      const filterDate = new Date();

      switch (dateFilter) {
        case "today":
          filtered = filtered.filter(
            (lesson) => lesson.date === today.toISOString().split("T")[0],
          );
          break;
        case "week":
          filterDate.setDate(today.getDate() - 7);
          filtered = filtered.filter(
            (lesson) => new Date(lesson.date) >= filterDate,
          );
          break;
        case "month":
          filterDate.setMonth(today.getMonth() - 1);
          filtered = filtered.filter(
            (lesson) => new Date(lesson.date) >= filterDate,
          );
          break;
      }
    }

    setFilteredLessons(filtered);
  }, [lessons, searchTerm, statusFilter, dateFilter]);

  const handleLessonClick = (lesson: LessonHistory) => {
    setSelectedLesson(lesson);
    setShowDetailModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "no-show":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "완료";
      case "cancelled":
        return "취소";
      case "no-show":
        return "미도착";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "no-show":
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getLessonTypeIcon = (type: string) => {
    return type === "online" ? "🌐" : "🏢";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP");
  };

  const formatTime = (time: string) => {
    return time;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ));
  };

  const handleExportHistory = () => {
    // 실제 엑셀 내보내기 로직 구현
    const csvContent = [
      [
        "날짜",
        "시간",
        "학생명",
        "서비스명",
        "수업형태",
        "상태",
        "리뷰여부",
        "예약ID",
      ],
      ...filteredLessons.map((lesson) => [
        formatDate(lesson.date),
        `${lesson.startTime}-${lesson.endTime}`,
        lesson.studentName,
        lesson.serviceName,
        lesson.lessonType === "online" ? "온라인" : "대면",
        getStatusText(lesson.status),
        lesson.hasReview ? "있음" : "없음",
        lesson.reservationId,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `lesson_history_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">수업 이력</h1>
          <p className="text-sm text-gray-600">
            지금까지 진행한 모든 수업의 이력을 확인할 수 있습니다.
          </p>
        </div>
        <button
          onClick={handleExportHistory}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Download className="w-4 h-4" />
          <span>내보내기</span>
        </button>
      </div>

      {/* 필터 및 검색 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              검색
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="학생명, 서비스명, 예약ID"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상태
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체</option>
              <option value="completed">완료</option>
              <option value="cancelled">취소</option>
              <option value="no-show">미도착</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              기간
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체</option>
              <option value="today">오늘</option>
              <option value="week">최근 7일</option>
              <option value="month">최근 30일</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setDateFilter("all");
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              <Filter className="w-4 h-4" />
              <span>초기화</span>
            </button>
          </div>
        </div>
      </div>

      {/* 수업 이력 목록 */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  수업 정보
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  학생
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  리뷰
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLessons.map((lesson) => (
                <tr key={lesson.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {formatDate(lesson.date)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {lesson.startTime} - {lesson.endTime}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {lesson.serviceName}
                        </span>
                      </div>
                      <span className="text-lg">
                        {getLessonTypeIcon(lesson.lessonType)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">
                        {lesson.studentName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(lesson.status)}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lesson.status)}`}
                      >
                        {getStatusText(lesson.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {lesson.hasReview ? (
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {renderStars(lesson.reviewRating || 0)}
                        </div>
                        <button
                          onClick={() => handleLessonClick(lesson)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          보기
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">리뷰 없음</span>
                        <span className="text-xs text-gray-400">
                          작성 유도 메시지
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleLessonClick(lesson)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="상세 보기"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {lesson.memo && (
                        <button
                          className="text-green-600 hover:text-green-900 p-1"
                          title="메모 있음"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLessons.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            해당 조건에 맞는 수업 이력이 없습니다.
          </div>
        )}
      </div>

      {/* 상세 정보 모달 */}
      {showDetailModal && selectedLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">수업 상세 정보</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* 기본 정보 */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">기본 정보</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      날짜
                    </label>
                    <div className="p-2 bg-gray-50 rounded border">
                      {formatDate(selectedLesson.date)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      시간
                    </label>
                    <div className="p-2 bg-gray-50 rounded border">
                      {selectedLesson.startTime} - {selectedLesson.endTime}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      학생명
                    </label>
                    <div className="p-2 bg-gray-50 rounded border">
                      {selectedLesson.studentName}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      서비스명
                    </label>
                    <div className="p-2 bg-gray-50 rounded border">
                      {selectedLesson.serviceName}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      수업 형태
                    </label>
                    <div className="p-2 bg-gray-50 rounded border">
                      {selectedLesson.lessonType === "online"
                        ? "온라인"
                        : "대면"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      상태
                    </label>
                    <div className="p-2 bg-gray-50 rounded border">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedLesson.status)}`}
                      >
                        {getStatusText(selectedLesson.status)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      예약 ID
                    </label>
                    <div className="p-2 bg-gray-50 rounded border font-mono">
                      {selectedLesson.reservationId}
                    </div>
                  </div>
                </div>
              </div>

              {/* 리뷰 정보 */}
              {selectedLesson.hasReview && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">리뷰</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        평점
                      </label>
                      <div className="flex items-center space-x-1">
                        {renderStars(selectedLesson.reviewRating || 0)}
                        <span className="text-sm text-gray-600 ml-2">
                          {selectedLesson.reviewRating}/5점
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        리뷰 내용
                      </label>
                      <div className="p-3 bg-gray-50 rounded border">
                        {selectedLesson.reviewContent}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 메모 */}
              {selectedLesson.memo && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">메모</h4>
                  <div className="p-3 bg-gray-50 rounded border">
                    {selectedLesson.memo}
                  </div>
                </div>
              )}

              {/* 액션 버튼 */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  닫기
                </button>
                {!selectedLesson.hasReview && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    리뷰 작성 유도
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

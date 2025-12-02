"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  Users,
  Calendar,
  MapPin,
  Wifi,
  Edit,
  Trash2,
  Eye,
  Plus,
  Search,
  Home,
} from "lucide-react";
import Link from "next/link";

interface Class {
  id: string;
  title: string;
  studentName: string;
  courseName: string;
  date: string;
  time: string;
  duration: number;
  location: "online" | "offline";
  room?: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  materials: string[];
  notes?: string;
  attendance: boolean;
}

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "scheduled" | "in_progress" | "completed" | "cancelled"
  >("all");
  const [dateFilter, setDateFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    // 실제 API 호출로 대체 - 로그인된 선생님 ID로 필터링
    const teacherId = localStorage.getItem("teacherId") || "T-001";

    setTimeout(() => {
      const mockClasses: Class[] = [
        {
          id: "1",
          title: "한국어 기초 - 김학생",
          studentName: "김학생",
          courseName: "한국어 기초 과정",
          date: "2024-01-16",
          time: "09:00",
          duration: 60,
          location: "online",
          status: "scheduled",
          materials: ["기초 문법 교재", "발음 연습 자료"],
          notes: "첫 수업입니다. 기초 인사말부터 시작할 예정입니다.",
        },
        {
          id: "2",
          title: "한국어 중급 - 이학생",
          studentName: "이학생",
          courseName: "한국어 중급 과정",
          date: "2024-01-16",
          time: "11:00",
          duration: 60,
          location: "offline",
          room: "A-101",
          status: "scheduled",
          materials: ["중급 문법 교재", "회화 연습 자료"],
          attendance: true,
        },
        {
          id: "3",
          title: "한국어 고급 - 박학생",
          studentName: "박학생",
          courseName: "한국어 고급 과정",
          date: "2024-01-15",
          time: "14:00",
          duration: 90,
          location: "online",
          status: "completed",
          materials: ["고급 문법 교재", "작문 연습 자료"],
          notes: "고급 문법 복습 완료. 다음 수업에서 작문 연습 예정.",
          attendance: true,
        },
        {
          id: "4",
          title: "한국어 초급 - 최학생",
          studentName: "최학생",
          courseName: "한국어 초급 과정",
          date: "2024-01-15",
          time: "16:00",
          duration: 60,
          location: "offline",
          room: "B-203",
          status: "completed",
          materials: ["초급 문법 교재"],
          attendance: false,
        },
        {
          id: "5",
          title: "한국어 기초 - 정학생",
          studentName: "정학생",
          courseName: "한국어 기초 과정",
          date: "2024-01-17",
          time: "10:00",
          duration: 60,
          location: "online",
          status: "scheduled",
          materials: ["기초 문법 교재"],
          notes: "개인 사정으로 일정 조정 요청",
        },
      ];

      setClasses(mockClasses);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredClasses = classes.filter((classItem) => {
    const matchesSearch =
      classItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.courseName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || classItem.status === statusFilter;
    const matchesDate = !dateFilter || classItem.date === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
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
      case "scheduled":
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">수업 관리</h1>
            <p className="text-lg text-gray-600">수업 일정 및 진행 상황 관리</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />새 수업 추가
            </button>
            <Link
              href="/teacher/home"
              className="flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Home className="w-5 h-5" />
              선생님 홈
            </Link>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">총 수업</p>
                <p className="text-2xl font-bold text-gray-900">
                  {classes.length}개
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">예정된 수업</p>
                <p className="text-2xl font-bold text-blue-600">
                  {classes.filter((c) => c.status === "scheduled").length}개
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
                <p className="text-sm text-gray-600">완료된 수업</p>
                <p className="text-2xl font-bold text-green-600">
                  {classes.filter((c) => c.status === "completed").length}개
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">출석률</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(
                    (classes.filter((c) => c.attendance).length /
                      classes.filter((c) => c.status === "completed").length) *
                      100,
                  ) || 0}
                  %
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="수업명, 학생명, 코스명 검색..."
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
                    | "scheduled"
                    | "in_progress"
                    | "completed"
                    | "cancelled",
                )
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">전체 상태</option>
              <option value="scheduled">예정</option>
              <option value="in_progress">진행중</option>
              <option value="completed">완료</option>
              <option value="cancelled">취소</option>
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <div className="text-sm text-gray-600">
              총 {filteredClasses.length}개의 수업
            </div>
          </div>
        </div>

        {/* 수업 목록 */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">수업 목록</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredClasses.map((classItem) => (
              <div key={classItem.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {classItem.title}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(classItem.status)}`}
                      >
                        {getStatusText(classItem.status)}
                      </span>
                      <div className="flex items-center gap-1 text-gray-500">
                        {getLocationIcon(classItem.location)}
                        <span className="text-sm">
                          {getLocationText(classItem.location)}
                        </span>
                        {classItem.room && (
                          <span className="text-sm">({classItem.room})</span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600">학생</p>
                        <p className="font-medium text-gray-900">
                          {classItem.studentName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">코스</p>
                        <p className="font-medium text-gray-900">
                          {classItem.courseName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">일시</p>
                        <p className="font-medium text-gray-900">
                          {new Date(classItem.date).toLocaleDateString()}{" "}
                          {classItem.time} ({classItem.duration}분)
                        </p>
                      </div>
                    </div>

                    {classItem.materials.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">학습 자료</p>
                        <div className="flex flex-wrap gap-2">
                          {classItem.materials.map((material, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {material}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {classItem.notes && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">메모</p>
                        <p className="text-sm text-gray-900">
                          {classItem.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 수업 생성 모달 */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  새 수업 추가
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      학생
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="">학생 선택</option>
                      <option value="student1">김학생</option>
                      <option value="student2">이학생</option>
                      <option value="student3">박학생</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      코스
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="">코스 선택</option>
                      <option value="course1">한국어 기초 과정</option>
                      <option value="course2">한국어 초급 과정</option>
                      <option value="course3">한국어 중급 과정</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      날짜
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      시간
                    </label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      소요시간
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="30">30분</option>
                      <option value="60">60분</option>
                      <option value="90">90분</option>
                      <option value="120">120분</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      장소
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="online">온라인</option>
                      <option value="offline">오프라인</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      메모
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="수업 메모"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    // 저장 로직
                    setShowCreateModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

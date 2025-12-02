"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  BookOpen,
  Layers,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react";

interface Course {
  id: string;
  name: string;
  description: string;
  level: string;
  duration: number;
  price: number;
  status: "active" | "inactive" | "draft";
  createdAt: string;
  updatedAt: string;
}

interface Curriculum {
  id: string;
  courseId: string;
  name: string;
  description: string;
  order: number;
  estimatedTime: number;
  type: "lesson" | "practice" | "test" | "review";
}

export default function AdminCoursesCurriculumPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive" | "draft"
  >("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [expandedCourses, setExpandedCourses] = useState<string[]>([]);

  useEffect(() => {
    // 실제 API 호출로 대체
    setTimeout(() => {
      const mockCourses: Course[] = [
        {
          id: "1",
          name: "한국어 기초 과정",
          description: "한국어를 처음 배우는 학생을 위한 기초 과정",
          level: "A-1",
          duration: 40,
          price: 300000,
          status: "active",
          createdAt: "2024-01-01",
          updatedAt: "2024-01-15",
        },
        {
          id: "2",
          name: "한국어 초급 과정",
          description: "기초를 마친 학생을 위한 초급 과정",
          level: "A-2",
          duration: 50,
          price: 350000,
          status: "active",
          createdAt: "2024-01-01",
          updatedAt: "2024-01-10",
        },
        {
          id: "3",
          name: "한국어 중급 과정",
          description: "일상 대화가 가능한 학생을 위한 중급 과정",
          level: "B-1",
          duration: 60,
          price: 400000,
          status: "active",
          createdAt: "2024-01-01",
          updatedAt: "2024-01-05",
        },
      ];

      const mockCurriculums: Curriculum[] = [
        {
          id: "1",
          courseId: "1",
          name: "한글 자음과 모음",
          description: "한글의 기본 자음과 모음 학습",
          order: 1,
          estimatedTime: 60,
          type: "lesson",
        },
        {
          id: "2",
          courseId: "1",
          name: "기본 인사말",
          description: "일상적인 인사말과 표현 학습",
          order: 2,
          estimatedTime: 45,
          type: "lesson",
        },
        {
          id: "3",
          courseId: "1",
          name: "자음/모음 연습",
          description: "학습한 자음과 모음 복습 및 연습",
          order: 3,
          estimatedTime: 30,
          type: "practice",
        },
        {
          id: "4",
          courseId: "2",
          name: "기본 문법 구조",
          description: "한국어 기본 문법 구조 학습",
          order: 1,
          estimatedTime: 90,
          type: "lesson",
        },
        {
          id: "5",
          courseId: "2",
          name: "일상 대화 연습",
          description: "일상적인 대화 상황 연습",
          order: 2,
          estimatedTime: 60,
          type: "practice",
        },
      ];

      setCourses(mockCourses);
      setCurriculums(mockCurriculums);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || course.status === statusFilter;
    const matchesLevel = levelFilter === "all" || course.level === levelFilter;

    return matchesSearch && matchesStatus && matchesLevel;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "활성";
      case "inactive":
        return "비활성";
      case "draft":
        return "초안";
      default:
        return "알 수 없음";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "lesson":
        return "bg-blue-100 text-blue-800";
      case "practice":
        return "bg-green-100 text-green-800";
      case "test":
        return "bg-red-100 text-red-800";
      case "review":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "lesson":
        return "수업";
      case "practice":
        return "연습";
      case "test":
        return "시험";
      case "review":
        return "복습";
      default:
        return "알 수 없음";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR").format(amount);
  };

  const toggleCourseExpansion = (courseId: string) => {
    setExpandedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId],
    );
  };

  const getCourseCurriculums = (courseId: string) => {
    return curriculums
      .filter((curriculum) => curriculum.courseId === courseId)
      .sort((a, b) => a.order - b.order);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            코스/커리큘럼 관리
          </h1>
          <p className="text-lg text-gray-600">
            코스와 커리큘럼을 통합 관리하세요
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />새 코스 추가
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">총 코스 수</p>
              <p className="text-2xl font-bold text-gray-900">
                {courses.length}개
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">활성 코스</p>
              <p className="text-2xl font-bold text-green-600">
                {courses.filter((c) => c.status === "active").length}개
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <Layers className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">총 커리큘럼</p>
              <p className="text-2xl font-bold text-purple-600">
                {curriculums.length}개
              </p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Layers className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">평균 수강료</p>
              <p className="text-2xl font-bold text-yellow-600">
                {formatCurrency(
                  Math.round(
                    courses.reduce((sum, c) => sum + c.price, 0) /
                      courses.length,
                  ),
                )}
                원
              </p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="코스명, 설명 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as "all" | "active" | "inactive" | "draft",
              )
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">전체 상태</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
            <option value="draft">초안</option>
          </select>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">전체 레벨</option>
            <option value="A-1">A-1 (기초)</option>
            <option value="A-2">A-2 (초급)</option>
            <option value="B-1">B-1 (중급)</option>
            <option value="B-2">B-2 (고급)</option>
          </select>

          <div className="text-sm text-gray-600">
            총 {filteredCourses.length}개의 코스
          </div>
        </div>
      </div>

      {/* 코스 및 커리큘럼 목록 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            코스 및 커리큘럼 목록
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredCourses.map((course) => {
            const courseCurriculums = getCourseCurriculums(course.id);
            const isExpanded = expandedCourses.includes(course.id);

            return (
              <div key={course.id}>
                {/* 코스 정보 */}
                <div className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {course.name}
                        </h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {course.level}
                        </span>
                        <span
                          className={`px-2 py-1 text-sm rounded-full ${getStatusColor(course.status)}`}
                        >
                          {getStatusText(course.status)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{course.description}</p>
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span>수강료: {formatCurrency(course.price)}원</span>
                        <span>총 {course.duration}시간</span>
                        <span>커리큘럼 {courseCurriculums.length}개</span>
                        <span>
                          최종 수정:{" "}
                          {new Date(course.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleCourseExpansion(course.id)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => setSelectedCourse(course)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("이 코스를 삭제하시겠습니까?")) {
                            // 삭제 로직
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 커리큘럼 목록 */}
                {isExpanded && (
                  <div className="bg-gray-50 px-6 py-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-semibold text-gray-900">
                        커리큘럼 목록
                      </h4>
                      <button className="text-sm text-blue-600 hover:text-blue-800">
                        + 커리큘럼 추가
                      </button>
                    </div>

                    <div className="space-y-3">
                      {courseCurriculums.map((curriculum) => (
                        <div
                          key={curriculum.id}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border"
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-500 w-8">
                              #{curriculum.order}
                            </span>
                            <div>
                              <h5 className="text-sm font-medium text-gray-900">
                                {curriculum.name}
                              </h5>
                              <p className="text-xs text-gray-500">
                                {curriculum.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(curriculum.type)}`}
                            >
                              {getTypeText(curriculum.type)}
                            </span>
                            <span className="text-sm text-gray-500">
                              {curriculum.estimatedTime}분
                            </span>
                            <div className="flex items-center gap-1">
                              <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                                <Edit className="w-3 h-3" />
                              </button>
                              <button className="p-1 text-red-600 hover:bg-red-100 rounded">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 코스 생성 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                새 코스 추가
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  코스명
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="코스명을 입력하세요"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    레벨
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">레벨 선택</option>
                    <option value="A-1">A-1 (기초)</option>
                    <option value="A-2">A-2 (초급)</option>
                    <option value="B-1">B-1 (중급)</option>
                    <option value="B-2">B-2 (고급)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    상태
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="draft">초안</option>
                    <option value="active">활성</option>
                    <option value="inactive">비활성</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    수강료
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="수강료"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    총 시간
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="총 시간"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="코스에 대한 설명을 입력하세요"
                />
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
  );
}

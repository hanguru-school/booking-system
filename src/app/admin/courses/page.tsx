"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  BookOpen,
  Clock,
  DollarSign,
  Users,
  Edit,
  Trash2,
  Eye,
  XCircle,
  Tag,
} from "lucide-react";

interface Course {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  duration: number;
  maxStudents: number;
  teacherName: string;
  schedule: string;
  level: "beginner" | "intermediate" | "advanced";
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

const AdminCoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showNewCourseModal, setShowNewCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [newCourseData, setNewCourseData] = useState({
    name: "",
    category: "",
    description: "",
    price: 0,
    duration: 60,
    maxStudents: 10,
    teacherName: "",
    schedule: "",
    level: "beginner" as Course["level"],
    status: "active" as Course["status"],
  });

  // Mock data
  useEffect(() => {
    const mockCourses: Course[] = [
      {
        id: "1",
        name: "수학 기초",
        category: "수학",
        description: "기초 수학 개념을 체계적으로 학습하는 과정입니다.",
        price: 50000,
        duration: 60,
        maxStudents: 8,
        teacherName: "김수학",
        schedule: "월,수,금 14:00-15:00",
        level: "beginner",
        status: "active",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-15",
      },
      {
        id: "2",
        name: "영어 회화",
        category: "영어",
        description: "실용적인 영어 회화 능력을 기르는 과정입니다.",
        price: 75000,
        duration: 90,
        maxStudents: 6,
        teacherName: "이영어",
        schedule: "화,목 16:00-17:30",
        level: "intermediate",
        status: "active",
        createdAt: "2024-01-02",
        updatedAt: "2024-01-16",
      },
      {
        id: "3",
        name: "과학 실험",
        category: "과학",
        description:
          "다양한 과학 실험을 통해 과학적 사고력을 키우는 과정입니다.",
        price: 100000,
        duration: 120,
        maxStudents: 4,
        teacherName: "박과학",
        schedule: "토 10:00-12:00",
        level: "advanced",
        status: "active",
        createdAt: "2024-01-03",
        updatedAt: "2024-01-17",
      },
      {
        id: "4",
        name: "국어 문학",
        category: "국어",
        description: "고전 문학을 통해 문학적 감수성을 기르는 과정입니다.",
        price: 60000,
        duration: 60,
        maxStudents: 10,
        teacherName: "최국어",
        schedule: "월,금 15:00-16:00",
        level: "intermediate",
        status: "inactive",
        createdAt: "2024-01-04",
        updatedAt: "2024-01-18",
      },
    ];

    setCourses(mockCourses);
  }, []);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.teacherName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || course.category === categoryFilter;
    const matchesLevel = levelFilter === "all" || course.level === levelFilter;
    const matchesStatus =
      statusFilter === "all" || course.status === statusFilter;

    return matchesSearch && matchesCategory && matchesLevel && matchesStatus;
  });

  const courseStats = {
    total: courses.length,
    active: courses.filter((c) => c.status === "active").length,
    inactive: courses.filter((c) => c.status === "inactive").length,
    categories: [...new Set(courses.map((c) => c.category))].length,
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleCreateCourse = () => {
    if (
      newCourseData.name &&
      newCourseData.category &&
      newCourseData.teacherName
    ) {
      const newCourse: Course = {
        id: Date.now().toString(),
        ...newCourseData,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      };

      setCourses([...courses, newCourse]);
      setShowNewCourseModal(false);
      setNewCourseData({
        name: "",
        category: "",
        description: "",
        price: 0,
        duration: 60,
        maxStudents: 10,
        teacherName: "",
        schedule: "",
        level: "beginner",
        status: "active",
      });
    }
  };

  const handleUpdateCourse = () => {
    if (
      editingCourse &&
      editingCourse.name &&
      editingCourse.category &&
      editingCourse.teacherName
    ) {
      setCourses(
        courses.map((c) =>
          c.id === editingCourse.id
            ? {
                ...editingCourse,
                updatedAt: new Date().toISOString().split("T")[0],
              }
            : c,
        ),
      );
      setEditingCourse(null);
    }
  };

  const handleDeleteCourse = (courseId: string) => {
    setCourses(courses.filter((c) => c.id !== courseId));
    setSelectedCourse(null);
  };

  const categories = [...new Set(courses.map((c) => c.category))];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">코스 관리</h1>
          <p className="text-gray-600">
            코스 정보를 관리하고 새로운 코스를 생성할 수 있습니다.
          </p>
        </div>

        {/* Course Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">전체 코스</p>
                <p className="text-2xl font-bold text-gray-900">
                  {courseStats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">활성 코스</p>
                <p className="text-2xl font-bold text-green-600">
                  {courseStats.active}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">비활성 코스</p>
                <p className="text-2xl font-bold text-red-600">
                  {courseStats.inactive}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Tag className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">카테고리</p>
                <p className="text-2xl font-bold text-purple-600">
                  {courseStats.categories}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="코스명, 설명, 선생님명으로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">전체 카테고리</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">전체 레벨</option>
                  <option value="beginner">초급</option>
                  <option value="intermediate">중급</option>
                  <option value="advanced">고급</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">전체 상태</option>
                  <option value="active">활성</option>
                  <option value="inactive">비활성</option>
                </select>
              </div>

              <button
                onClick={() => setShowNewCourseModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />새 코스
              </button>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3
                      className="text-lg font-semibold text-gray-900 mb-2 cursor-pointer hover:text-blue-600"
                      onClick={() => setSelectedCourse(course)}
                    >
                      {course.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-gray-500">
                        {course.category}
                      </span>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(course.level)}`}
                      >
                        {course.level === "beginner" && "초급"}
                        {course.level === "intermediate" && "중급"}
                        {course.level === "advanced" && "고급"}
                      </span>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(course.status)}`}
                      >
                        {course.status === "active" && "활성"}
                        {course.status === "inactive" && "비활성"}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {course.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-2" />
                    <span>최대 {course.maxStudents}명</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{course.duration}분</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span>{course.price.toLocaleString()}원</span>
                  </div>
                </div>

                <div className="text-sm text-gray-500 mb-4">
                  <p>담당: {course.teacherName}</p>
                  <p>일정: {course.schedule}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedCourse(course)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setEditingCourse(course)}
                      className="text-green-600 hover:text-green-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Course Modal */}
      {showNewCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">새 코스 생성</h2>
              <button
                onClick={() => setShowNewCourseModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    코스명 *
                  </label>
                  <input
                    type="text"
                    value={newCourseData.name}
                    onChange={(e) =>
                      setNewCourseData({
                        ...newCourseData,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="코스명을 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    카테고리 *
                  </label>
                  <input
                    type="text"
                    value={newCourseData.category}
                    onChange={(e) =>
                      setNewCourseData({
                        ...newCourseData,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="카테고리를 입력하세요"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명
                </label>
                <textarea
                  value={newCourseData.description}
                  onChange={(e) =>
                    setNewCourseData({
                      ...newCourseData,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="코스 설명을 입력하세요"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    가격 (원)
                  </label>
                  <input
                    type="number"
                    value={newCourseData.price}
                    onChange={(e) =>
                      setNewCourseData({
                        ...newCourseData,
                        price: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    수업 시간 (분)
                  </label>
                  <input
                    type="number"
                    value={newCourseData.duration}
                    onChange={(e) =>
                      setNewCourseData({
                        ...newCourseData,
                        duration: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="30"
                    max="180"
                    step="30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    최대 학생 수
                  </label>
                  <input
                    type="number"
                    value={newCourseData.maxStudents}
                    onChange={(e) =>
                      setNewCourseData({
                        ...newCourseData,
                        maxStudents: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    max="20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    담당 선생님 *
                  </label>
                  <input
                    type="text"
                    value={newCourseData.teacherName}
                    onChange={(e) =>
                      setNewCourseData({
                        ...newCourseData,
                        teacherName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="선생님명을 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    일정
                  </label>
                  <input
                    type="text"
                    value={newCourseData.schedule}
                    onChange={(e) =>
                      setNewCourseData({
                        ...newCourseData,
                        schedule: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="예: 월,수,금 14:00-15:00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    레벨
                  </label>
                  <select
                    value={newCourseData.level}
                    onChange={(e) =>
                      setNewCourseData({
                        ...newCourseData,
                        level: e.target.value as Course["level"],
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="beginner">초급</option>
                    <option value="intermediate">중급</option>
                    <option value="advanced">고급</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상태
                  </label>
                  <select
                    value={newCourseData.status}
                    onChange={(e) =>
                      setNewCourseData({
                        ...newCourseData,
                        status: e.target.value as Course["status"],
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">활성</option>
                    <option value="inactive">비활성</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowNewCourseModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleCreateCourse}
                  disabled={
                    !newCourseData.name ||
                    !newCourseData.category ||
                    !newCourseData.teacherName
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  코스 생성
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                코스 상세 정보
              </h2>
              <button
                onClick={() => setSelectedCourse(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    기본 정보
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        코스명:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedCourse.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        카테고리:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedCourse.category}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        레벨:
                      </span>
                      <span
                        className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(selectedCourse.level)}`}
                      >
                        {selectedCourse.level === "beginner" && "초급"}
                        {selectedCourse.level === "intermediate" && "중급"}
                        {selectedCourse.level === "advanced" && "고급"}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        상태:
                      </span>
                      <span
                        className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedCourse.status)}`}
                      >
                        {selectedCourse.status === "active" && "활성"}
                        {selectedCourse.status === "inactive" && "비활성"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    수업 정보
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        담당 선생님:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedCourse.teacherName}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        일정:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedCourse.schedule}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        수업 시간:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedCourse.duration}분
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        최대 학생 수:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedCourse.maxStudents}명
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  설명
                </h3>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {selectedCourse.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    가격 정보
                  </h3>
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedCourse.price.toLocaleString()}원
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    생성 정보
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        생성일:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedCourse.createdAt}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        수정일:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedCourse.updatedAt}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setEditingCourse(selectedCourse);
                    setSelectedCourse(null);
                  }}
                  className="px-4 py-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDeleteCourse(selectedCourse.id)}
                  className="px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  삭제
                </button>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {editingCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">코스 수정</h2>
              <button
                onClick={() => setEditingCourse(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    코스명 *
                  </label>
                  <input
                    type="text"
                    value={editingCourse.name}
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    카테고리 *
                  </label>
                  <input
                    type="text"
                    value={editingCourse.category}
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명
                </label>
                <textarea
                  value={editingCourse.description}
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    가격 (원)
                  </label>
                  <input
                    type="number"
                    value={editingCourse.price}
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        price: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    수업 시간 (분)
                  </label>
                  <input
                    type="number"
                    value={editingCourse.duration}
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        duration: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="30"
                    max="180"
                    step="30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    최대 학생 수
                  </label>
                  <input
                    type="number"
                    value={editingCourse.maxStudents}
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        maxStudents: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    max="20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    담당 선생님 *
                  </label>
                  <input
                    type="text"
                    value={editingCourse.teacherName}
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        teacherName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    일정
                  </label>
                  <input
                    type="text"
                    value={editingCourse.schedule}
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        schedule: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    레벨
                  </label>
                  <select
                    value={editingCourse.level}
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        level: e.target.value as Course["level"],
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="beginner">초급</option>
                    <option value="intermediate">중급</option>
                    <option value="advanced">고급</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상태
                  </label>
                  <select
                    value={editingCourse.status}
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        status: e.target.value as Course["status"],
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">활성</option>
                    <option value="inactive">비활성</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setEditingCourse(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleUpdateCourse}
                  disabled={
                    !editingCourse.name ||
                    !editingCourse.category ||
                    !editingCourse.teacherName
                  }
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  수정 완료
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoursesPage;

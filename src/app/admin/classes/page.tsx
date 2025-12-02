"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Users,
  Clock,
  Edit,
  Trash2,
  Eye,
  XCircle,
  User,
  MapPin,
} from "lucide-react";

interface Class {
  id: string;
  name: string;
  courseName: string;
  teacherName: string;
  schedule: string;
  startDate: string;
  endDate: string;
  maxStudents: number;
  currentStudents: number;
  location: string;
  status: "active" | "completed" | "cancelled";
  price: number;
  description: string;
  createdAt: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  grade: string;
  attendance: number;
}

const AdminClassesPage = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [showNewClassModal, setShowNewClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [newClassData, setNewClassData] = useState({
    name: "",
    courseName: "",
    teacherName: "",
    schedule: "",
    startDate: "",
    endDate: "",
    maxStudents: 10,
    location: "",
    price: 0,
    description: "",
    status: "active" as Class["status"],
  });

  // Mock data
  useEffect(() => {
    const mockClasses: Class[] = [
      {
        id: "1",
        name: "수학 기초 A반",
        courseName: "수학 기초",
        teacherName: "김수학",
        schedule: "월,수,금 14:00-15:00",
        startDate: "2024-01-15",
        endDate: "2024-03-15",
        maxStudents: 8,
        currentStudents: 6,
        location: "1층 101호",
        status: "active",
        price: 50000,
        description: "기초 수학 개념을 체계적으로 학습하는 반입니다.",
        createdAt: "2024-01-01",
      },
      {
        id: "2",
        name: "영어 회화 B반",
        courseName: "영어 회화",
        teacherName: "이영어",
        schedule: "화,목 16:00-17:30",
        startDate: "2024-01-16",
        endDate: "2024-03-16",
        maxStudents: 6,
        currentStudents: 6,
        location: "2층 201호",
        status: "active",
        price: 75000,
        description: "실용적인 영어 회화 능력을 기르는 반입니다.",
        createdAt: "2024-01-02",
      },
      {
        id: "3",
        name: "과학 실험 C반",
        courseName: "과학 실험",
        teacherName: "박과학",
        schedule: "토 10:00-12:00",
        startDate: "2024-01-20",
        endDate: "2024-03-20",
        maxStudents: 4,
        currentStudents: 3,
        location: "실험실 301호",
        status: "active",
        price: 100000,
        description: "다양한 과학 실험을 통해 과학적 사고력을 키우는 반입니다.",
        createdAt: "2024-01-03",
      },
      {
        id: "4",
        name: "국어 문학 D반",
        courseName: "국어 문학",
        teacherName: "최국어",
        schedule: "월,금 15:00-16:00",
        startDate: "2024-01-10",
        endDate: "2024-03-10",
        maxStudents: 10,
        currentStudents: 8,
        location: "3층 301호",
        status: "completed",
        price: 60000,
        description: "고전 문학을 통해 문학적 감수성을 기르는 반입니다.",
        createdAt: "2024-01-04",
      },
    ];

    const mockStudents: Student[] = [
      {
        id: "ST001",
        name: "김민수",
        email: "kim@example.com",
        grade: "중2",
        attendance: 85,
      },
      {
        id: "ST002",
        name: "박지영",
        email: "park@example.com",
        grade: "고1",
        attendance: 92,
      },
      {
        id: "ST003",
        name: "이준호",
        email: "lee@example.com",
        grade: "중3",
        attendance: 78,
      },
      {
        id: "ST004",
        name: "정수진",
        email: "jung@example.com",
        grade: "고2",
        attendance: 95,
      },
      {
        id: "ST005",
        name: "최동현",
        email: "choi@example.com",
        grade: "중1",
        attendance: 88,
      },
      {
        id: "ST006",
        name: "한소영",
        email: "han@example.com",
        grade: "고3",
        attendance: 90,
      },
    ];

    setClasses(mockClasses);
    setStudents(mockStudents);
  }, []);

  const filteredClasses = classes.filter((cls) => {
    const matchesSearch =
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.teacherName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || cls.status === statusFilter;
    const matchesCourse =
      courseFilter === "all" || cls.courseName === courseFilter;

    return matchesSearch && matchesStatus && matchesCourse;
  });

  const classStats = {
    total: classes.length,
    active: classes.filter((c) => c.status === "active").length,
    completed: classes.filter((c) => c.status === "completed").length,
    cancelled: classes.filter((c) => c.status === "cancelled").length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getOccupancyColor = (current: number, max: number) => {
    const ratio = current / max;
    if (ratio >= 0.9) return "bg-red-100 text-red-800";
    if (ratio >= 0.7) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const handleCreateClass = () => {
    if (
      newClassData.name &&
      newClassData.courseName &&
      newClassData.teacherName
    ) {
      const newClass: Class = {
        id: Date.now().toString(),
        ...newClassData,
        currentStudents: 0,
        createdAt: new Date().toISOString().split("T")[0],
      };

      setClasses([...classes, newClass]);
      setShowNewClassModal(false);
      setNewClassData({
        name: "",
        courseName: "",
        teacherName: "",
        schedule: "",
        startDate: "",
        endDate: "",
        maxStudents: 10,
        location: "",
        price: 0,
        description: "",
        status: "active",
      });
    }
  };

  const handleUpdateClass = () => {
    if (
      editingClass &&
      editingClass.name &&
      editingClass.courseName &&
      editingClass.teacherName
    ) {
      setClasses(
        classes.map((c) => (c.id === editingClass.id ? editingClass : c)),
      );
      setEditingClass(null);
    }
  };

  const handleDeleteClass = (classId: string) => {
    setClasses(classes.filter((c) => c.id !== classId));
    setSelectedClass(null);
  };

  const courses = [...new Set(classes.map((c) => c.courseName))];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">수업 관리</h1>
          <p className="text-gray-600">
            수업 정보를 관리하고 새로운 수업을 생성할 수 있습니다.
          </p>
        </div>

        {/* Class Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">전체 수업</p>
                <p className="text-2xl font-bold text-gray-900">
                  {classStats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">진행중</p>
                <p className="text-2xl font-bold text-green-600">
                  {classStats.active}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">완료</p>
                <p className="text-2xl font-bold text-blue-600">
                  {classStats.completed}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Users className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">취소</p>
                <p className="text-2xl font-bold text-red-600">
                  {classStats.cancelled}
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
                    placeholder="수업명, 코스명, 선생님명으로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">전체 상태</option>
                  <option value="active">진행중</option>
                  <option value="completed">완료</option>
                  <option value="cancelled">취소</option>
                </select>

                <select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">전체 코스</option>
                  {courses.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setShowNewClassModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />새 수업
              </button>
            </div>
          </div>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => (
            <div
              key={cls.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3
                      className="text-lg font-semibold text-gray-900 mb-2 cursor-pointer hover:text-blue-600"
                      onClick={() => setSelectedClass(cls)}
                    >
                      {cls.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-gray-500">
                        {cls.courseName}
                      </span>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(cls.status)}`}
                      >
                        {cls.status === "active" && "진행중"}
                        {cls.status === "completed" && "완료"}
                        {cls.status === "cancelled" && "취소"}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {cls.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="h-4 w-4 mr-2" />
                    <span>담당: {cls.teacherName}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{cls.schedule}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{cls.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-2" />
                    <span>
                      학생: {cls.currentStudents}/{cls.maxStudents}명
                      <span
                        className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getOccupancyColor(cls.currentStudents, cls.maxStudents)}`}
                      >
                        {Math.round(
                          (cls.currentStudents / cls.maxStudents) * 100,
                        )}
                        %
                      </span>
                    </span>
                  </div>
                </div>

                <div className="text-sm text-gray-500 mb-4">
                  <p>
                    기간: {cls.startDate} ~ {cls.endDate}
                  </p>
                  <p>가격: {cls.price.toLocaleString()}원</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedClass(cls)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setEditingClass(cls)}
                      className="text-green-600 hover:text-green-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClass(cls.id)}
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

      {/* New Class Modal */}
      {showNewClassModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">새 수업 생성</h2>
              <button
                onClick={() => setShowNewClassModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    수업명 *
                  </label>
                  <input
                    type="text"
                    value={newClassData.name}
                    onChange={(e) =>
                      setNewClassData({ ...newClassData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="수업명을 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    코스명 *
                  </label>
                  <input
                    type="text"
                    value={newClassData.courseName}
                    onChange={(e) =>
                      setNewClassData({
                        ...newClassData,
                        courseName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="코스명을 입력하세요"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명
                </label>
                <textarea
                  value={newClassData.description}
                  onChange={(e) =>
                    setNewClassData({
                      ...newClassData,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="수업 설명을 입력하세요"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    담당 선생님 *
                  </label>
                  <input
                    type="text"
                    value={newClassData.teacherName}
                    onChange={(e) =>
                      setNewClassData({
                        ...newClassData,
                        teacherName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="선생님명을 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    수업장소
                  </label>
                  <input
                    type="text"
                    value={newClassData.location}
                    onChange={(e) =>
                      setNewClassData({
                        ...newClassData,
                        location: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="예: 1층 101호"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    일정
                  </label>
                  <input
                    type="text"
                    value={newClassData.schedule}
                    onChange={(e) =>
                      setNewClassData({
                        ...newClassData,
                        schedule: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="예: 월,수,금 14:00-15:00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    최대 학생 수
                  </label>
                  <input
                    type="number"
                    value={newClassData.maxStudents}
                    onChange={(e) =>
                      setNewClassData({
                        ...newClassData,
                        maxStudents: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    max="20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    시작일
                  </label>
                  <input
                    type="date"
                    value={newClassData.startDate}
                    onChange={(e) =>
                      setNewClassData({
                        ...newClassData,
                        startDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    종료일
                  </label>
                  <input
                    type="date"
                    value={newClassData.endDate}
                    onChange={(e) =>
                      setNewClassData({
                        ...newClassData,
                        endDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    가격 (원)
                  </label>
                  <input
                    type="number"
                    value={newClassData.price}
                    onChange={(e) =>
                      setNewClassData({
                        ...newClassData,
                        price: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상태
                </label>
                <select
                  value={newClassData.status}
                  onChange={(e) =>
                    setNewClassData({
                      ...newClassData,
                      status: e.target.value as Class["status"],
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">진행중</option>
                  <option value="completed">완료</option>
                  <option value="cancelled">취소</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowNewClassModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleCreateClass}
                  disabled={
                    !newClassData.name ||
                    !newClassData.courseName ||
                    !newClassData.teacherName
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  수업 생성
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Class Detail Modal */}
      {selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                수업 상세 정보
              </h2>
              <button
                onClick={() => setSelectedClass(null)}
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
                        수업명:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedClass.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        코스:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedClass.courseName}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        담당 선생님:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedClass.teacherName}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        상태:
                      </span>
                      <span
                        className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedClass.status)}`}
                      >
                        {selectedClass.status === "active" && "진행중"}
                        {selectedClass.status === "completed" && "완료"}
                        {selectedClass.status === "cancelled" && "취소"}
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
                        일정:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedClass.schedule}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        수업장소:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedClass.location}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        기간:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedClass.startDate} ~ {selectedClass.endDate}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        가격:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedClass.price.toLocaleString()}원
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
                  {selectedClass.description}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  학생 현황
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        등록 학생:
                      </span>
                      <span className="ml-2 text-lg font-bold text-gray-900">
                        {selectedClass.currentStudents}/
                        {selectedClass.maxStudents}명
                      </span>
                    </div>
                    <span
                      className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getOccupancyColor(selectedClass.currentStudents, selectedClass.maxStudents)}`}
                    >
                      {Math.round(
                        (selectedClass.currentStudents /
                          selectedClass.maxStudents) *
                          100,
                      )}
                      % 등록률
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {students
                      .slice(0, selectedClass.currentStudents)
                      .map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center justify-between bg-white p-3 rounded-lg"
                        >
                          <div>
                            <div className="font-medium text-gray-900">
                              {student.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {student.grade} • {student.email}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {student.attendance}%
                            </div>
                            <div className="text-xs text-gray-500">출석률</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setEditingClass(selectedClass);
                    setSelectedClass(null);
                  }}
                  className="px-4 py-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDeleteClass(selectedClass.id)}
                  className="px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  삭제
                </button>
                <button
                  onClick={() => setSelectedClass(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {editingClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">수업 수정</h2>
              <button
                onClick={() => setEditingClass(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    수업명 *
                  </label>
                  <input
                    type="text"
                    value={editingClass.name}
                    onChange={(e) =>
                      setEditingClass({ ...editingClass, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    코스명 *
                  </label>
                  <input
                    type="text"
                    value={editingClass.courseName}
                    onChange={(e) =>
                      setEditingClass({
                        ...editingClass,
                        courseName: e.target.value,
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
                  value={editingClass.description}
                  onChange={(e) =>
                    setEditingClass({
                      ...editingClass,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    담당 선생님 *
                  </label>
                  <input
                    type="text"
                    value={editingClass.teacherName}
                    onChange={(e) =>
                      setEditingClass({
                        ...editingClass,
                        teacherName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    수업장소
                  </label>
                  <input
                    type="text"
                    value={editingClass.location}
                    onChange={(e) =>
                      setEditingClass({
                        ...editingClass,
                        location: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    일정
                  </label>
                  <input
                    type="text"
                    value={editingClass.schedule}
                    onChange={(e) =>
                      setEditingClass({
                        ...editingClass,
                        schedule: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    최대 학생 수
                  </label>
                  <input
                    type="number"
                    value={editingClass.maxStudents}
                    onChange={(e) =>
                      setEditingClass({
                        ...editingClass,
                        maxStudents: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    max="20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    시작일
                  </label>
                  <input
                    type="date"
                    value={editingClass.startDate}
                    onChange={(e) =>
                      setEditingClass({
                        ...editingClass,
                        startDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    종료일
                  </label>
                  <input
                    type="date"
                    value={editingClass.endDate}
                    onChange={(e) =>
                      setEditingClass({
                        ...editingClass,
                        endDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    가격 (원)
                  </label>
                  <input
                    type="number"
                    value={editingClass.price}
                    onChange={(e) =>
                      setEditingClass({
                        ...editingClass,
                        price: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상태
                </label>
                <select
                  value={editingClass.status}
                  onChange={(e) =>
                    setEditingClass({
                      ...editingClass,
                      status: e.target.value as Class["status"],
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">진행중</option>
                  <option value="completed">완료</option>
                  <option value="cancelled">취소</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setEditingClass(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleUpdateClass}
                  disabled={
                    !editingClass.name ||
                    !editingClass.courseName ||
                    !editingClass.teacherName
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

export default AdminClassesPage;

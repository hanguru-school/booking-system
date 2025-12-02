"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  BookOpen,
  TrendingUp,
  Home,
} from "lucide-react";
import Link from "next/link";

interface Child {
  id: string;
  name: string;
  grade: string;
  age: number;
  avatar: string;
  status: "active" | "inactive";
  enrollmentDate: string;
  currentCourse: string;
  teacher: string;
  attendanceRate: number;
  progress: number;
  lastClass: string;
}

export default function ParentChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    // 실제 API 호출로 대체
    setTimeout(() => {
      const mockChildren: Child[] = [
        {
          id: "1",
          name: "김철수",
          grade: "초등학교 3학년",
          age: 9,
          avatar: "/avatars/child1.jpg",
          status: "active",
          enrollmentDate: "2023-09-01",
          currentCourse: "한국어 기초 과정",
          teacher: "김선생님",
          attendanceRate: 95,
          progress: 78,
          lastClass: "2024-01-15",
        },
        {
          id: "2",
          name: "김영희",
          grade: "초등학교 1학년",
          age: 7,
          avatar: "/avatars/child2.jpg",
          status: "active",
          enrollmentDate: "2024-01-01",
          currentCourse: "한국어 기초 과정",
          teacher: "이선생님",
          attendanceRate: 88,
          progress: 65,
          lastClass: "2024-01-14",
        },
        {
          id: "3",
          name: "박민수",
          grade: "초등학교 5학년",
          age: 11,
          avatar: "/avatars/child3.jpg",
          status: "inactive",
          enrollmentDate: "2023-06-01",
          currentCourse: "한국어 중급 과정",
          teacher: "박선생님",
          attendanceRate: 75,
          progress: 45,
          lastClass: "2024-01-10",
        },
      ];

      setChildren(mockChildren);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredChildren = children.filter((child) => {
    const matchesSearch =
      child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.currentCourse.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || child.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "활성";
      case "inactive":
        return "비활성";
      default:
        return "알 수 없음";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-green-600";
    if (progress >= 60) return "text-yellow-600";
    return "text-red-600";
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">아이 관리</h1>
            <p className="text-lg text-gray-600">
              자녀들의 학습 현황을 관리하세요
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              아이 추가
            </button>
            <Link
              href="/parent/home"
              className="flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Home className="w-5 h-5" />
              홈으로
            </Link>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">총 아이 수</p>
                <p className="text-2xl font-bold text-gray-900">
                  {children.length}명
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">활성 아이</p>
                <p className="text-2xl font-bold text-green-600">
                  {children.filter((c) => c.status === "active").length}명
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">평균 출석률</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(
                    children.reduce((sum, c) => sum + c.attendanceRate, 0) /
                      children.length,
                  )}
                  %
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">평균 진행률</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {Math.round(
                    children.reduce((sum, c) => sum + c.progress, 0) /
                      children.length,
                  )}
                  %
                </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="이름, 학년, 코스 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | "active" | "inactive")
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">전체 상태</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
            </select>

            <div className="text-sm text-gray-600">
              총 {filteredChildren.length}명의 아이
            </div>
          </div>
        </div>

        {/* 아이 목록 */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">아이 목록</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredChildren.map((child) => (
              <div key={child.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {child.name}
                        </h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {child.grade}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(child.status)}`}
                        >
                          {getStatusText(child.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">현재 코스</p>
                          <p className="font-medium text-gray-900">
                            {child.currentCourse}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">담당 선생님</p>
                          <p className="font-medium text-gray-900">
                            {child.teacher}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">등록일</p>
                          <p className="font-medium text-gray-900">
                            {new Date(
                              child.enrollmentDate,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">출석률</p>
                          <p className="font-medium text-gray-900">
                            {child.attendanceRate}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">진행률</p>
                          <p
                            className={`font-medium ${getProgressColor(child.progress)}`}
                          >
                            {child.progress}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">마지막 수업</p>
                          <p className="font-medium text-gray-900">
                            {new Date(child.lastClass).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
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

        {/* 아이 추가 모달 */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  아이 추가
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      이름
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="아이 이름"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      나이
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="나이"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    학년
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">학년 선택</option>
                    <option value="유치원">유치원</option>
                    <option value="초등학교 1학년">초등학교 1학년</option>
                    <option value="초등학교 2학년">초등학교 2학년</option>
                    <option value="초등학교 3학년">초등학교 3학년</option>
                    <option value="초등학교 4학년">초등학교 4학년</option>
                    <option value="초등학교 5학년">초등학교 5학년</option>
                    <option value="초등학교 6학년">초등학교 6학년</option>
                    <option value="중학교 1학년">중학교 1학년</option>
                    <option value="중학교 2학년">중학교 2학년</option>
                    <option value="중학교 3학년">중학교 3학년</option>
                    <option value="고등학교 1학년">고등학교 1학년</option>
                    <option value="고등학교 2학년">고등학교 2학년</option>
                    <option value="고등학교 3학년">고등학교 3학년</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    초기 코스
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">코스 선택</option>
                    <option value="한국어 기초 과정">한국어 기초 과정</option>
                    <option value="한국어 초급 과정">한국어 초급 과정</option>
                    <option value="한국어 중급 과정">한국어 중급 과정</option>
                    <option value="한국어 고급 과정">한국어 고급 과정</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    // 저장 로직
                    setShowAddModal(false);
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

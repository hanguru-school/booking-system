"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, Layers, X } from "lucide-react";

interface Curriculum {
  id: string;
  name: string;
  level: string;
  description: string;
  totalLessons: number;
  duration: number;
  status: "active" | "inactive" | "draft";
  createdAt: string;
  updatedAt: string;
}

interface CurriculumItem {
  id: string;
  curriculumId: string;
  title: string;
  description: string;
  order: number;
  estimatedTime: number;
  type: "lesson" | "practice" | "test" | "review";
}

export default function AdminCurriculumPage() {
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [selectedCurriculum, setSelectedCurriculum] =
    useState<Curriculum | null>(null);
  const [curriculumItems, setCurriculumItems] = useState<CurriculumItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive" | "draft"
  >("all");

  useEffect(() => {
    // 실제 API 호출로 대체
    setTimeout(() => {
      const mockCurriculums: Curriculum[] = [
        {
          id: "1",
          name: "한국어 기초 과정",
          level: "A-1",
          description: "한국어를 처음 배우는 학생을 위한 기초 과정",
          totalLessons: 20,
          duration: 40,
          status: "active",
          createdAt: "2024-01-01",
          updatedAt: "2024-01-15",
        },
        {
          id: "2",
          name: "한국어 초급 과정",
          level: "A-2",
          description: "기초를 마친 학생을 위한 초급 과정",
          totalLessons: 25,
          duration: 50,
          status: "active",
          createdAt: "2024-01-01",
          updatedAt: "2024-01-10",
        },
        {
          id: "3",
          name: "한국어 중급 과정",
          level: "B-1",
          description: "일상 대화가 가능한 학생을 위한 중급 과정",
          totalLessons: 30,
          duration: 60,
          status: "active",
          createdAt: "2024-01-01",
          updatedAt: "2024-01-05",
        },
      ];

      setCurriculums(mockCurriculums);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredCurriculums = curriculums.filter((curriculum) => {
    const matchesSearch =
      curriculum.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curriculum.level.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || curriculum.status === statusFilter;
    return matchesSearch && matchesStatus;
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
          <h1 className="text-3xl font-bold text-gray-900">커리큘럼 관리</h1>
          <p className="text-lg text-gray-600">학습 커리큘럼을 관리하세요</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />새 커리큘럼 추가
        </button>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="커리큘럼 검색..."
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

          <div className="text-sm text-gray-600">
            총 {filteredCurriculums.length}개의 커리큘럼
          </div>
        </div>
      </div>

      {/* 커리큘럼 목록 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">커리큘럼 목록</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredCurriculums.map((curriculum) => (
            <div key={curriculum.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {curriculum.name}
                    </h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {curriculum.level}
                    </span>
                    <span
                      className={`px-2 py-1 text-sm rounded-full ${getStatusColor(curriculum.status)}`}
                    >
                      {getStatusText(curriculum.status)}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{curriculum.description}</p>
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <span>총 {curriculum.totalLessons}강의</span>
                    <span>예상 소요시간: {curriculum.duration}시간</span>
                    <span>
                      최종 수정:{" "}
                      {new Date(curriculum.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedCurriculum(curriculum)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("이 커리큘럼을 삭제하시겠습니까?")) {
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
          ))}
        </div>
      </div>

      {/* 커리큘럼 생성 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                새 커리큘럼 추가
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
                  커리큘럼명
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="커리큘럼명을 입력하세요"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="커리큘럼에 대한 설명을 입력하세요"
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

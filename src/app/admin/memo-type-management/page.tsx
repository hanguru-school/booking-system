"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, Filter } from "lucide-react";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import Navigation from "@/components/common/Navigation";

interface MemoType {
  id: string;
  name: string;
  description: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

function MemoTypeManagementContent() {
  const [memoTypes, setMemoTypes] = useState<MemoType[]>([]);
  const [filteredMemoTypes, setFilteredMemoTypes] = useState<MemoType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMemoType, setEditingMemoType] = useState<MemoType | null>(null);
  const [loading, setLoading] = useState(true);

  // 실제 데이터베이스에서 메모 유형 데이터 로드
  useEffect(() => {
    loadMemoTypes();
  }, []);

  const loadMemoTypes = async () => {
    setLoading(true);
    try {
      // 실제 데이터베이스에서 메모 유형 데이터 로드
      const response = await fetch("/api/admin/memo-types", {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      
      if (data.success && data.memoTypes && data.memoTypes.length > 0) {
        // 실제 데이터를 MemoType 형식으로 변환
        const formattedMemoTypes: MemoType[] = data.memoTypes.map((memoType: any) => ({
          id: memoType.id,
          name: memoType.name,
          description: memoType.description || "",
          color: memoType.color || "#3B82F6",
          isActive: memoType.isActive !== undefined ? memoType.isActive : true,
          createdAt: memoType.createdAt?.split('T')[0] || "",
          updatedAt: memoType.updatedAt?.split('T')[0] || "",
        }));
        setMemoTypes(formattedMemoTypes);
        setFilteredMemoTypes(formattedMemoTypes);
      } else {
        // 데이터가 없으면 빈 배열
        setMemoTypes([]);
        setFilteredMemoTypes([]);
      }
    } catch (error) {
      console.error("메모 유형 목록 로딩 실패:", error);
      setMemoTypes([]);
      setFilteredMemoTypes([]);
    } finally {
      setLoading(false);
    }
  };

  // 검색 및 필터링
  useEffect(() => {
    let filtered = memoTypes;

    // 검색 필터
    if (searchTerm) {
      filtered = filtered.filter(
        (memoType) =>
          memoType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          memoType.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // 상태 필터
    if (statusFilter !== "all") {
      filtered = filtered.filter((memoType) =>
        statusFilter === "active" ? memoType.isActive : !memoType.isActive,
      );
    }

    setFilteredMemoTypes(filtered);
  }, [memoTypes, searchTerm, statusFilter]);

  const handleAddMemoType = () => {
    setEditingMemoType(null);
    setIsModalOpen(true);
  };

  const handleEditMemoType = (memoType: MemoType) => {
    setEditingMemoType(memoType);
    setIsModalOpen(true);
  };

  const handleDeleteMemoType = (id: string) => {
    if (confirm("정말로 이 메모 유형을 삭제하시겠습니까?")) {
      setMemoTypes((prev) => prev.filter((memoType) => memoType.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    setMemoTypes((prev) =>
      prev.map((memoType) =>
        memoType.id === id
          ? { ...memoType, isActive: !memoType.isActive }
          : memoType,
      ),
    );
  };

  const handleSaveMemoType = (
    memoTypeData: Omit<MemoType, "id" | "createdAt" | "updatedAt">,
  ) => {
    if (editingMemoType) {
      // 편집
      setMemoTypes((prev) =>
        prev.map((memoType) =>
          memoType.id === editingMemoType.id
            ? {
                ...memoType,
                ...memoTypeData,
                updatedAt: new Date().toISOString().split("T")[0],
              }
            : memoType,
        ),
      );
    } else {
      // 추가
      const newMemoType: MemoType = {
        id: Date.now().toString(),
        ...memoTypeData,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      };
      setMemoTypes((prev) => [...prev, newMemoType]);
    }
    setIsModalOpen(false);
    setEditingMemoType(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">메모 유형 관리</h1>
          <p className="text-gray-600">학생 메모의 카테고리를 관리합니다.</p>
        </div>
        <button
          onClick={handleAddMemoType}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          메모 유형 추가
        </button>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="메모 유형명 또는 설명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | "active" | "inactive")
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">전체</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
            </select>
          </div>
        </div>
      </div>

      {/* 메모 유형 목록 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  메모 유형
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  설명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  색상
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  생성일
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">메모 유형 목록을 불러오는 중...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredMemoTypes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Plus className="h-16 w-16 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        등록된 메모 유형이 없습니다
                      </h3>
                      <p className="text-gray-600 mb-6">
                        아직 등록된 메모 유형이 없습니다. 새로운 메모 유형을 추가해보세요.
                      </p>
                      <button
                        onClick={() => handleAddMemoType()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        메모 유형 추가하기
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMemoTypes.map((memoType) => (
                <tr key={memoType.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {memoType.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-xs truncate">
                      {memoType.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className="w-6 h-6 rounded-full border border-gray-300"
                        style={{ backgroundColor: memoType.color }}
                      ></div>
                      <span className="ml-2 text-sm text-gray-500">
                        {memoType.color}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        memoType.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {memoType.isActive ? "활성" : "비활성"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {memoType.createdAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleToggleStatus(memoType.id)}
                        className={`px-2 py-1 text-xs rounded ${
                          memoType.isActive
                            ? "text-orange-600 hover:text-orange-900"
                            : "text-green-600 hover:text-green-900"
                        }`}
                      >
                        {memoType.isActive ? "비활성화" : "활성화"}
                      </button>
                      <button
                        onClick={() => handleEditMemoType(memoType)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMemoType(memoType.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredMemoTypes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">메모 유형이 없습니다.</p>
          </div>
        )}
      </div>

      {/* 메모 유형 추가/편집 모달 */}
      {isModalOpen && (
        <MemoTypeModal
          memoType={editingMemoType}
          onSave={handleSaveMemoType}
          onClose={() => {
            setIsModalOpen(false);
            setEditingMemoType(null);
          }}
        />
      )}
    </div>
  );
}

// 메모 유형 모달 컴포넌트
interface MemoTypeModalProps {
  memoType: MemoType | null;
  onSave: (data: Omit<MemoType, "id" | "createdAt" | "updatedAt">) => void;
  onClose: () => void;
}

function MemoTypeModal({ memoType, onSave, onClose }: MemoTypeModalProps) {
  const [formData, setFormData] = useState({
    name: memoType?.name || "",
    description: memoType?.description || "",
    color: memoType?.color || "#3B82F6",
    isActive: memoType?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-lg font-semibold mb-4">
          {memoType ? "메모 유형 편집" : "메모 유형 추가"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              메모 유형명 *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="예: 학습 진도"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="메모 유형에 대한 설명을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              색상
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                className="w-12 h-10 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#3B82F6"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="isActive"
              className="ml-2 block text-sm text-gray-900"
            >
              활성 상태
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {memoType ? "수정" : "추가"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MemoTypeManagementPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN", "MASTER"]}>
      <Navigation>
        <MemoTypeManagementContent />
      </Navigation>
    </ProtectedRoute>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Palette,
  Save,
  X,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

interface MemoType {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function MemoTypeManagementPage() {
  const [memoTypes, setMemoTypes] = useState<MemoType[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMemoType, setSelectedMemoType] = useState<MemoType | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  // 폼 상태
  const [formData, setFormData] = useState({
    name: "",
    color: "#3B82F6",
    isActive: true,
  });

  useEffect(() => {
    fetchMemoTypes();
  }, []);

  const fetchMemoTypes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/memo-types");

      if (response.ok) {
        const data = await response.json();
        setMemoTypes(data);
      } else {
        console.error("메모 유형 데이터 로딩 실패");
      }
    } catch (error) {
      console.error("메모 유형 데이터 로딩 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMemoType = async () => {
    if (!formData.name.trim()) {
      alert("메모 유형 이름을 입력해주세요.");
      return;
    }

    try {
      const response = await fetch("/api/admin/memo-types", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchMemoTypes();
        setShowAddModal(false);
        resetForm();
        alert("메모 유형이 성공적으로 추가되었습니다.");
      } else {
        alert("메모 유형 추가에 실패했습니다.");
      }
    } catch (error) {
      alert("메모 유형 추가 중 오류가 발생했습니다.");
    }
  };

  const handleEditMemoType = async () => {
    if (!selectedMemoType) return;

    if (!formData.name.trim()) {
      alert("메모 유형 이름을 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/memo-types/${selectedMemoType.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      if (response.ok) {
        await fetchMemoTypes();
        setShowEditModal(false);
        setSelectedMemoType(null);
        resetForm();
        alert("메모 유형이 성공적으로 수정되었습니다.");
      } else {
        alert("메모 유형 수정에 실패했습니다.");
      }
    } catch (error) {
      alert("메모 유형 수정 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteMemoType = async () => {
    if (!selectedMemoType) return;

    try {
      const response = await fetch(
        `/api/admin/memo-types/${selectedMemoType.id}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        await fetchMemoTypes();
        setShowDeleteModal(false);
        setSelectedMemoType(null);
        alert("메모 유형이 성공적으로 삭제되었습니다.");
      } else {
        alert("메모 유형 삭제에 실패했습니다.");
      }
    } catch (error) {
      alert("메모 유형 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleToggleActive = async (memoType: MemoType) => {
    try {
      const response = await fetch(
        `/api/admin/memo-types/${memoType.id}/toggle`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isActive: !memoType.isActive,
          }),
        },
      );

      if (response.ok) {
        await fetchMemoTypes();
        alert(
          `메모 유형이 ${!memoType.isActive ? "활성화" : "비활성화"}되었습니다.`,
        );
      } else {
        alert("메모 유형 상태 변경에 실패했습니다.");
      }
    } catch (error) {
      alert("메모 유형 상태 변경 중 오류가 발생했습니다.");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      color: "#3B82F6",
      isActive: true,
    });
  };

  const openEditModal = (memoType: MemoType) => {
    setSelectedMemoType(memoType);
    setFormData({
      name: memoType.name,
      color: memoType.color,
      isActive: memoType.isActive,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (memoType: MemoType) => {
    setSelectedMemoType(memoType);
    setShowDeleteModal(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-semibold">메모 유형 관리</h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>새 메모 유형 추가</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">총 메모 유형</p>
                <p className="text-2xl font-bold">{memoTypes.length}개</p>
              </div>
              <Palette className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">활성 유형</p>
                <p className="text-2xl font-bold">
                  {memoTypes.filter((m) => m.isActive).length}개
                </p>
              </div>
              <Eye className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">비활성 유형</p>
                <p className="text-2xl font-bold">
                  {memoTypes.filter((m) => !m.isActive).length}개
                </p>
              </div>
              <EyeOff className="w-8 h-8 text-gray-600" />
            </div>
          </div>
        </div>

        {/* 메모 유형 목록 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">메모 유형 목록</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      메모 유형
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      색상
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      등록일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {memoTypes.map((memoType) => (
                    <tr key={memoType.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {memoType.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-6 h-6 rounded border border-gray-300"
                            style={{ backgroundColor: memoType.color }}
                          />
                          <span className="text-sm text-gray-500">
                            {memoType.color}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            memoType.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {memoType.isActive ? "활성" : "비활성"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(memoType.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openEditModal(memoType)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(memoType)}
                            className={`p-2 rounded ${
                              memoType.isActive
                                ? "text-yellow-600 hover:bg-yellow-100"
                                : "text-green-600 hover:bg-green-100"
                            }`}
                          >
                            {memoType.isActive ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => openDeleteModal(memoType)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 메모 유형 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">새 메모 유형 추가</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="p-2 text-gray-600 hover:text-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  유형 이름 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 문법 설명, 발음 교정"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  색상
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        color: e.target.value,
                      }))
                    }
                    className="w-12 h-10 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        color: e.target.value,
                      }))
                    }
                    className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isActive"
                  className="ml-2 block text-sm text-gray-900"
                >
                  활성화
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                취소
              </button>
              <button
                onClick={handleAddMemoType}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="w-4 h-4" />
                <span>저장</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 메모 유형 수정 모달 */}
      {showEditModal && selectedMemoType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">메모 유형 수정</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedMemoType(null);
                  resetForm();
                }}
                className="p-2 text-gray-600 hover:text-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  유형 이름 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  색상
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        color: e.target.value,
                      }))
                    }
                    className="w-12 h-10 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        color: e.target.value,
                      }))
                    }
                    className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="editIsActive"
                  className="ml-2 block text-sm text-gray-900"
                >
                  활성화
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedMemoType(null);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                취소
              </button>
              <button
                onClick={handleEditMemoType}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="w-4 h-4" />
                <span>저장</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 메모 유형 삭제 모달 */}
      {showDeleteModal && selectedMemoType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold">메모 유형 삭제</h3>
            </div>

            <p className="text-gray-600 mb-4">
              <strong>{selectedMemoType.name}</strong> 메모 유형을
              삭제하시겠습니까?
            </p>
            <p className="text-sm text-gray-500 mb-4">
              이 작업은 되돌릴 수 없습니다. 해당 유형으로 등록된 메모가 있다면
              삭제할 수 없거나 비활성화로 전환됩니다.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedMemoType(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                취소
              </button>
              <button
                onClick={handleDeleteMemoType}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                <span>삭제</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  Clock,
  CheckCircle,
  XCircle,
  X,
} from "lucide-react";

interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number; // 분 단위
  bufferTime: number; // 분 단위
  isActive: boolean;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function ServiceManagementPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: 60,
    bufferTime: 10,
    isActive: true,
    imageUrl: "",
  });

  // 서비스 목록 로드
  const loadServices = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/services");
      if (response.ok) {
        const data = await response.json();
        setServices(data.services || []);
      }
    } catch (error) {
      console.error("서비스 목록 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      duration: 60,
      bufferTime: 10,
      isActive: true,
      imageUrl: "",
    });
  };

  // 서비스 추가 모달 열기
  const handleAddService = () => {
    resetForm();
    setShowAddModal(true);
  };

  // 서비스 편집 모달 열기
  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
      duration: service.duration,
      bufferTime: service.bufferTime,
      isActive: service.isActive,
      imageUrl: service.imageUrl || "",
    });
    setShowEditModal(true);
  };

  // 서비스 삭제
  const handleDeleteService = async (serviceId: string) => {
    if (!confirm("정말로 이 서비스를 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/services/${serviceId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadServices();
        alert("서비스가 삭제되었습니다.");
      } else {
        alert("서비스 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("서비스 삭제 오류:", error);
      alert("서비스 삭제 중 오류가 발생했습니다.");
    }
  };

  // 서비스 저장 (추가/편집)
  const handleSaveService = async () => {
    if (!formData.name.trim()) {
      alert("서비스 이름을 입력해주세요.");
      return;
    }

    if (formData.duration <= 0) {
      alert("수업 시간은 0보다 커야 합니다.");
      return;
    }

    try {
      const url =
        showEditModal && selectedService
          ? `/api/admin/services/${selectedService.id}`
          : "/api/admin/services";

      const method = showEditModal ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await loadServices();
        setShowAddModal(false);
        setShowEditModal(false);
        resetForm();
        alert(
          showEditModal
            ? "서비스가 수정되었습니다."
            : "서비스가 추가되었습니다.",
        );
      } else {
        alert(
          showEditModal
            ? "서비스 수정에 실패했습니다."
            : "서비스 추가에 실패했습니다.",
        );
      }
    } catch (error) {
      console.error("서비스 저장 오류:", error);
      alert("서비스 저장 중 오류가 발생했습니다.");
    }
  };

  // 이미지 업로드 처리
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (1MB 이하)
    if (file.size > 1024 * 1024) {
      alert("이미지 파일 크기는 1MB 이하여야 합니다.");
      return;
    }

    // 파일 형식 체크
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData((prev) => ({ ...prev, imageUrl: data.imageUrl }));
      } else {
        alert("이미지 업로드에 실패했습니다.");
      }
    } catch (error) {
      console.error("이미지 업로드 오류:", error);
      alert("이미지 업로드 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">서비스 관리</h1>
            <p className="text-lg text-gray-600">
              레슨 서비스 추가, 편집, 삭제
            </p>
          </div>

          <button
            onClick={handleAddService}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />새 서비스 추가
          </button>
        </div>

        {/* 서비스 목록 */}
        <div className="bg-white rounded-lg border">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">로딩 중...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      서비스명
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      설명
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      수업시간
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      버퍼시간
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      상태
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      등록일
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {services.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {service.imageUrl && (
                            <img
                              src={service.imageUrl}
                              alt={service.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                          )}
                          <span className="font-medium text-gray-900">
                            {service.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {service.description || "-"}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span>{service.duration}분</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-600">
                          {service.bufferTime}분
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            service.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {service.isActive ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              활성
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              비활성
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500">
                        {new Date(service.createdAt).toLocaleDateString(
                          "ko-KR",
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditService(service)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteService(service.id)}
                            className="p-1 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {services.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  등록된 서비스가 없습니다.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 서비스 추가/편집 모달 */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">
                {showEditModal ? "서비스 편집" : "새 서비스 추가"}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
                className="p-2 text-gray-600 hover:text-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* 서비스 이름 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  서비스 이름 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="예: 대면 수업 40분"
                />
              </div>

              {/* 서비스 설명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="서비스에 대한 간단한 설명을 입력하세요"
                />
              </div>

              {/* 이미지 업로드 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  서비스 이미지
                </label>
                <div className="flex items-center gap-4">
                  {formData.imageUrl && (
                    <img
                      src={formData.imageUrl}
                      alt="서비스 이미지"
                      className="w-20 h-20 rounded object-cover border"
                    />
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <Upload className="w-4 h-4" />
                      이미지 업로드
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG 형식, 1MB 이하
                    </p>
                  </div>
                </div>
              </div>

              {/* 수업 시간 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  수업 시간 (분) *
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      duration: parseInt(e.target.value) || 0,
                    }))
                  }
                  min="1"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* 버퍼 시간 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  버퍼 시간 (분)
                </label>
                <input
                  type="number"
                  value={formData.bufferTime}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      bufferTime: parseInt(e.target.value) || 0,
                    }))
                  }
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  수업 전후 여유 시간을 설정합니다
                </p>
              </div>

              {/* 활성화 여부 */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    서비스 활성화
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  비활성화된 서비스는 예약에서 선택할 수 없습니다
                </p>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                취소
              </button>
              <button
                onClick={handleSaveService}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {showEditModal ? "수정" : "추가"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

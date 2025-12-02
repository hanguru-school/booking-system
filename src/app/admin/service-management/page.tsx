"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  Eye,
  EyeOff,
  Clock,
  Calendar,
  Image as ImageIcon,
  Save,
  X,
} from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  duration: number; // 분 단위
  bufferTime: number; // 분 단위
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ServiceManagementPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 폼 상태
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageFile: null as File | null,
    duration: 40,
    bufferTime: 10,
    isActive: true,
  });

  // 샘플 데이터 로드
  useEffect(() => {
    const sampleServices: Service[] = [
      {
        id: "1",
        name: "대면 수업 40분",
        description: "일대일 대면 수업으로 집중적인 학습이 가능합니다.",
        imageUrl: "/images/face-to-face.jpg",
        duration: 40,
        bufferTime: 10,
        isActive: true,
        createdAt: "2025-01-01",
        updatedAt: "2025-01-01",
      },
      {
        id: "2",
        name: "온라인 수업 60분",
        description: "Zoom을 통한 온라인 수업으로 편리하게 학습할 수 있습니다.",
        imageUrl: "/images/online.jpg",
        duration: 60,
        bufferTime: 15,
        isActive: true,
        createdAt: "2025-01-01",
        updatedAt: "2025-01-01",
      },
      {
        id: "3",
        name: "그룹 수업 90분",
        description: "다른 학생들과 함께하는 그룹 수업입니다.",
        imageUrl: "/images/group.jpg",
        duration: 90,
        bufferTime: 20,
        isActive: false,
        createdAt: "2025-01-01",
        updatedAt: "2025-01-01",
      },
    ];
    setServices(sampleServices);
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleInputChange("imageFile", file);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      imageFile: null,
      duration: 40,
      bufferTime: 10,
      isActive: true,
    });
    setEditingService(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 실제 API 호출 대신 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (editingService) {
        // 수정
        setServices((prev) =>
          prev.map((service) =>
            service.id === editingService.id
              ? { ...service, ...formData, updatedAt: new Date().toISOString() }
              : service,
          ),
        );
      } else {
        // 추가
        const newService: Service = {
          id: Date.now().toString(),
          ...formData,
          imageUrl: formData.imageFile
            ? URL.createObjectURL(formData.imageFile)
            : "/images/default.jpg",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setServices((prev) => [...prev, newService]);
      }

      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error("서비스 저장 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      imageFile: null,
      duration: service.duration,
      bufferTime: service.bufferTime,
      isActive: service.isActive,
    });
    setShowAddModal(true);
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm("정말로 이 서비스를 삭제하시겠습니까?")) return;

    try {
      // 실제 API 호출 대신 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 500));
      setServices((prev) => prev.filter((service) => service.id !== serviceId));
    } catch (error) {
      console.error("서비스 삭제 실패:", error);
    }
  };

  const toggleServiceStatus = async (serviceId: string) => {
    try {
      setServices((prev) =>
        prev.map((service) =>
          service.id === serviceId
            ? {
                ...service,
                isActive: !service.isActive,
                updatedAt: new Date().toISOString(),
              }
            : service,
        ),
      );
    } catch (error) {
      console.error("서비스 상태 변경 실패:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">서비스 관리</h1>
          <p className="text-sm text-gray-600">
            레슨 서비스를 추가, 편집, 삭제할 수 있습니다.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>서비스 추가</span>
        </button>
      </div>

      {/* 서비스 목록 */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  서비스 정보
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  시간 설정
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  등록일
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                        {service.imageUrl ? (
                          <img
                            src={service.imageUrl}
                            alt={service.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {service.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {service.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {service.duration}분
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          버퍼: {service.bufferTime}분
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleServiceStatus(service.id)}
                      className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
                        service.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {service.isActive ? (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>활성</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span>비활성</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(service.createdAt).toLocaleDateString("ja-JP")}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(service)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="text-red-600 hover:text-red-900 p-1"
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

      {/* 추가/수정 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">
                {editingService ? "서비스 수정" : "새 서비스 추가"}
              </h3>
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

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 서비스 이름 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  서비스 이름 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 대면 수업 40분"
                />
              </div>

              {/* 설명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="서비스에 대한 간단한 설명을 입력하세요"
                />
              </div>

              {/* 이미지 업로드 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  서비스 이미지 *
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    {formData.imageFile ? (
                      <img
                        src={URL.createObjectURL(formData.imageFile)}
                        alt="Preview"
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      required={!editingService}
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>이미지 선택</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG 파일만 가능 (최대 2MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* 시간 설정 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    수업 시간 (분) *
                  </label>
                  <input
                    type="number"
                    required
                    min="10"
                    max="180"
                    value={formData.duration}
                    onChange={(e) =>
                      handleInputChange("duration", parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    버퍼 시간 (분)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={formData.bufferTime}
                    onChange={(e) =>
                      handleInputChange("bufferTime", parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* 활성화 여부 */}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      handleInputChange("isActive", e.target.checked)
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    활성화
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  비활성화된 서비스는 예약 페이지에 표시되지 않습니다.
                </p>
              </div>

              {/* 버튼 */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{editingService ? "수정" : "추가"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

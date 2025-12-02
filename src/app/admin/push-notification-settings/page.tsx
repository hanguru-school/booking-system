"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Send,
  Search,
  Filter,
  Clock,
  Users,
} from "lucide-react";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import Navigation from "@/components/common/Navigation";

interface NotificationType {
  id: string;
  name: string;
  description: string;
  category: "reservation" | "payment" | "reminder" | "announcement" | "custom";
  isActive: boolean;
  template: string;
  variables: string[];
  conditions: NotificationCondition[];
  createdAt: string;
  updatedAt: string;
}

interface NotificationCondition {
  field: string;
  operator: "equals" | "contains" | "greater_than" | "less_than";
  value: string;
}

interface NotificationHistory {
  id: string;
  typeId: string;
  typeName: string;
  message: string;
  recipients: number;
  sentAt: string;
  status: "sent" | "failed" | "pending";
  successCount: number;
  failureCount: number;
}

function PushNotificationSettingsContent() {
  const [notificationTypes, setNotificationTypes] = useState<
    NotificationType[]
  >([]);
  const [notificationHistory, setNotificationHistory] = useState<
    NotificationHistory[]
  >([]);
  const [filteredTypes, setFilteredTypes] = useState<NotificationType[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<NotificationHistory[]>(
    [],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<
    "all" | "reservation" | "payment" | "reminder" | "announcement" | "custom"
  >("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<NotificationType | null>(null);
  const [activeTab, setActiveTab] = useState<"types" | "history">("types");
  const [loading, setLoading] = useState(true);

  // 실제 데이터베이스에서 푸시 알림 데이터 로드
  useEffect(() => {
    loadNotificationData();
  }, []);

  const loadNotificationData = async () => {
    setLoading(true);
    try {
      // 실제 데이터베이스에서 푸시 알림 유형 데이터 로드
      const response = await fetch("/api/admin/push-notifications", {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      
      if (data.success && data.notificationTypes && data.notificationTypes.length > 0) {
        // 실제 데이터를 NotificationType 형식으로 변환
        const formattedTypes: NotificationType[] = data.notificationTypes.map((type: any) => ({
          id: type.id,
          name: type.name,
          description: type.description || "",
          category: type.category || "custom",
          isActive: type.isActive !== undefined ? type.isActive : true,
          template: type.template || "",
          variables: type.variables || [],
          conditions: type.conditions || [],
          createdAt: type.createdAt?.split('T')[0] || "",
          updatedAt: type.updatedAt?.split('T')[0] || "",
        }));
        setNotificationTypes(formattedTypes);
        setFilteredTypes(formattedTypes);
      } else {
        // 데이터가 없으면 빈 배열
        setNotificationTypes([]);
        setFilteredTypes([]);
      }

      // 알림 발송 기록도 빈 배열로 설정 (실제 데이터가 없으므로)
      setNotificationHistory([]);
      setFilteredHistory([]);
    } catch (error) {
      console.error("푸시 알림 데이터 로딩 실패:", error);
      setNotificationTypes([]);
      setFilteredTypes([]);
      setNotificationHistory([]);
      setFilteredHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // 검색 및 필터링
  useEffect(() => {
    let filtered =
      activeTab === "types" ? notificationTypes : notificationHistory;

    if (activeTab === "types") {
      const types = notificationTypes as NotificationType[];

      // 검색 필터
      if (searchTerm) {
        filtered = types.filter(
          (type) =>
            type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            type.description.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      }

      // 카테고리 필터
      if (categoryFilter !== "all") {
        filtered = filtered.filter((type) => type.category === categoryFilter);
      }

      // 상태 필터
      if (statusFilter !== "all") {
        filtered = filtered.filter((type) =>
          statusFilter === "active" ? type.isActive : !type.isActive,
        );
      }

      setFilteredTypes(filtered as NotificationType[]);
    } else {
      const history = notificationHistory as NotificationHistory[];

      // 검색 필터
      if (searchTerm) {
        filtered = history.filter(
          (item) =>
            item.typeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.message.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      }

      setFilteredHistory(filtered as NotificationHistory[]);
    }
  }, [
    notificationTypes,
    notificationHistory,
    searchTerm,
    categoryFilter,
    statusFilter,
    activeTab,
  ]);

  const handleAddNotificationType = () => {
    setEditingType(null);
    setIsModalOpen(true);
  };

  const handleEditNotificationType = (type: NotificationType) => {
    setEditingType(type);
    setIsModalOpen(true);
  };

  const handleDeleteNotificationType = (id: string) => {
    if (confirm("정말로 이 알림 유형을 삭제하시겠습니까?")) {
      setNotificationTypes((prev) => prev.filter((type) => type.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    setNotificationTypes((prev) =>
      prev.map((type) =>
        type.id === id ? { ...type, isActive: !type.isActive } : type,
      ),
    );
  };

  const handleSaveNotificationType = (
    typeData: Omit<NotificationType, "id" | "createdAt" | "updatedAt">,
  ) => {
    if (editingType) {
      // 편집
      setNotificationTypes((prev) =>
        prev.map((type) =>
          type.id === editingType.id
            ? {
                ...type,
                ...typeData,
                updatedAt: new Date().toISOString().split("T")[0],
              }
            : type,
        ),
      );
    } else {
      // 추가
      const newType: NotificationType = {
        id: Date.now().toString(),
        ...typeData,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      };
      setNotificationTypes((prev) => [...prev, newType]);
    }
    setIsModalOpen(false);
    setEditingType(null);
  };

  const handleSendTestNotification = (type: NotificationType) => {
    alert(`테스트 알림이 발송되었습니다: ${type.name}`);
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
          <h1 className="text-2xl font-bold text-gray-900">푸시 알림 관리</h1>
          <p className="text-gray-600">
            알림 유형을 정의하고 발송 이력을 관리합니다.
          </p>
        </div>
        <button
          onClick={handleAddNotificationType}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          알림 유형 추가
        </button>
      </div>

      {/* 탭 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("types")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "types"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            알림 유형
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "history"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            발송 이력
          </button>
        </nav>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={
                  activeTab === "types"
                    ? "알림 유형명 또는 설명으로 검색..."
                    : "알림 유형명 또는 메시지로 검색..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          {activeTab === "types" && (
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">전체 카테고리</option>
                <option value="reservation">예약</option>
                <option value="payment">결제</option>
                <option value="reminder">리마인더</option>
                <option value="announcement">공지사항</option>
                <option value="custom">커스텀</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as "all" | "active" | "inactive",
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">전체 상태</option>
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 알림 유형 목록 */}
      {activeTab === "types" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    알림 유형
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    카테고리
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    템플릿
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    변수
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">알림 유형 목록을 불러오는 중...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredTypes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Send className="h-16 w-16 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          등록된 알림 유형이 없습니다
                        </h3>
                        <p className="text-gray-600 mb-6">
                          아직 등록된 알림 유형이 없습니다. 새로운 알림 유형을 추가해보세요.
                        </p>
                        <button
                          onClick={() => handleAddType()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          알림 유형 추가하기
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTypes.map((type) => (
                  <tr key={type.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {type.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {type.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          type.category === "reservation"
                            ? "bg-blue-100 text-blue-800"
                            : type.category === "payment"
                              ? "bg-green-100 text-green-800"
                              : type.category === "reminder"
                                ? "bg-yellow-100 text-yellow-800"
                                : type.category === "announcement"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {type.category === "reservation"
                          ? "예약"
                          : type.category === "payment"
                            ? "결제"
                            : type.category === "reminder"
                              ? "리마인더"
                              : type.category === "announcement"
                                ? "공지사항"
                                : "커스텀"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          type.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {type.isActive ? "활성" : "비활성"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {type.template}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {type.variables.map((variable, index) => (
                          <span
                            key={index}
                            className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                          >
                            {variable}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleSendTestNotification(type)}
                          className="text-blue-600 hover:text-blue-900"
                          title="테스트 발송"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(type.id)}
                          className={`px-2 py-1 text-xs rounded ${
                            type.isActive
                              ? "text-orange-600 hover:text-orange-900"
                              : "text-green-600 hover:text-green-900"
                          }`}
                        >
                          {type.isActive ? "비활성화" : "활성화"}
                        </button>
                        <button
                          onClick={() => handleEditNotificationType(type)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteNotificationType(type.id)}
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

          {filteredTypes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">알림 유형이 없습니다.</p>
            </div>
          )}
        </div>
      )}

      {/* 발송 이력 */}
      {activeTab === "history" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    알림 유형
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    메시지
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    수신자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    발송 시간
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    결과
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.typeName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {item.message}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">
                          {item.recipients}명
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-1" />
                        {item.sentAt}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.status === "sent"
                            ? "bg-green-100 text-green-800"
                            : item.status === "failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {item.status === "sent"
                          ? "발송 완료"
                          : item.status === "failed"
                            ? "발송 실패"
                            : "발송 중"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        성공: {item.successCount} / 실패: {item.failureCount}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredHistory.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">발송 이력이 없습니다.</p>
            </div>
          )}
        </div>
      )}

      {/* 알림 유형 추가/편집 모달 */}
      {isModalOpen && (
        <NotificationTypeModal
          type={editingType}
          onSave={handleSaveNotificationType}
          onClose={() => {
            setIsModalOpen(false);
            setEditingType(null);
          }}
        />
      )}
    </div>
  );
}

// 알림 유형 모달 컴포넌트
interface NotificationTypeModalProps {
  type: NotificationType | null;
  onSave: (
    data: Omit<NotificationType, "id" | "createdAt" | "updatedAt">,
  ) => void;
  onClose: () => void;
}

function NotificationTypeModal({
  type,
  onSave,
  onClose,
}: NotificationTypeModalProps) {
  const [formData, setFormData] = useState({
    name: type?.name || "",
    description: type?.description || "",
    category: type?.category || ("custom" as any),
    isActive: type?.isActive ?? true,
    template: type?.template || "",
    variables: type?.variables || [],
    conditions: type?.conditions || [],
  });

  const [newVariable, setNewVariable] = useState("");
  const [newCondition, setNewCondition] = useState({
    field: "",
    operator: "equals" as "equals" | "contains" | "greater_than" | "less_than",
    value: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleAddVariable = () => {
    if (newVariable && !formData.variables.includes(newVariable)) {
      setFormData((prev) => ({
        ...prev,
        variables: [...prev.variables, newVariable],
      }));
      setNewVariable("");
    }
  };

  const handleRemoveVariable = (variable: string) => {
    setFormData((prev) => ({
      ...prev,
      variables: prev.variables.filter((v) => v !== variable),
    }));
  };

  const handleAddCondition = () => {
    if (newCondition.field && newCondition.value) {
      setFormData((prev) => ({
        ...prev,
        conditions: [...prev.conditions, { ...newCondition }],
      }));
      setNewCondition({
        field: "",
        operator: "equals",
        value: "",
      });
    }
  };

  const handleRemoveCondition = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">
          {type ? "알림 유형 편집" : "알림 유형 추가"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                알림 유형명 *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="예: 예약 확인 알림"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                카테고리
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as any })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="reservation">예약</option>
                <option value="payment">결제</option>
                <option value="reminder">리마인더</option>
                <option value="announcement">공지사항</option>
                <option value="custom">커스텀</option>
              </select>
            </div>
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
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="알림 유형에 대한 설명을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              메시지 템플릿 *
            </label>
            <textarea
              required
              value={formData.template}
              onChange={(e) =>
                setFormData({ ...formData, template: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="예: 안녕하세요, {student_name}님! {date} {time}에 {service_name} 수업이 예약되었습니다."
            />
            <p className="text-xs text-gray-500 mt-1">
              중괄호 {} 안에 변수를 사용할 수 있습니다. 예: {student_name},{" "}
              {date}, {time}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              변수 관리
            </label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newVariable}
                  onChange={(e) => setNewVariable(e.target.value)}
                  placeholder="새 변수명"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleAddVariable}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  추가
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.variables.map((variable, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                  >
                    {variable}
                    <button
                      type="button"
                      onClick={() => handleRemoveVariable(variable)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              발송 조건
            </label>
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={newCondition.field}
                  onChange={(e) =>
                    setNewCondition({ ...newCondition, field: e.target.value })
                  }
                  placeholder="필드명"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={newCondition.operator}
                  onChange={(e) =>
                    setNewCondition({
                      ...newCondition,
                      operator: e.target.value as any,
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="equals">같음</option>
                  <option value="contains">포함</option>
                  <option value="greater_than">보다 큼</option>
                  <option value="less_than">보다 작음</option>
                </select>
                <input
                  type="text"
                  value={newCondition.value}
                  onChange={(e) =>
                    setNewCondition({ ...newCondition, value: e.target.value })
                  }
                  placeholder="값"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="button"
                onClick={handleAddCondition}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                조건 추가
              </button>
              <div className="space-y-1">
                {formData.conditions.map((condition, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <span className="text-sm">
                      {condition.field} {condition.operator} {condition.value}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCondition(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
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
              {type ? "수정" : "추가"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PushNotificationSettingsPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN", "MASTER"]}>
      <Navigation>
        <PushNotificationSettingsContent />
      </Navigation>
    </ProtectedRoute>
  );
}

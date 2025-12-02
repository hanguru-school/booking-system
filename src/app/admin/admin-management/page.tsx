"use client";

import { useState, useEffect } from "react";
import {
  User,
  Shield,
  Trash2,
  Edit,
  Plus,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import Navigation from "@/components/common/Navigation";

interface Admin {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MASTER";
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  permissions: {
    userManagement: boolean;
    reservationManagement: boolean;
    teacherManagement: boolean;
    studentManagement: boolean;
    paymentManagement: boolean;
    systemSettings: boolean;
  };
  createdAt: string;
  lastLogin?: string;
}

export default function AdminManagementPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN", "MASTER"]}>
      <Navigation userRole="ADMIN">
        <AdminManagementContent />
      </Navigation>
    </ProtectedRoute>
  );
}

function AdminManagementContent() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

  // 관리자 목록 조회
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      console.log("관리자 목록 조회 시작...");
      
      const response = await fetch("/api/admin/admins");
      console.log("API 응답 상태:", response.status);
      
      const data = await response.json();
      console.log("API 응답 데이터:", data);

      if (data.success) {
        console.log("관리자 목록 설정:", data.admins);
        setAdmins(data.admins || []);
      } else {
        // 실제 오류인 경우에만 콘솔 에러 출력
        console.error("관리자 목록 조회 실패:", data.message);
        // API 실패 시 빈 배열로 설정
        setAdmins([]);
      }
    } catch (error) {
      console.error("관리자 목록 조회 오류:", error);
      // 오류 시 빈 배열로 설정
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  // 관리자 삭제
  const deleteAdmin = async (adminId: string) => {
    try {
      const response = await fetch(`/api/admin/admins/${adminId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        // 목록에서 삭제된 관리자 제거
        setAdmins(admins.filter(admin => admin.id !== adminId));
        setShowDeleteModal(false);
        setSelectedAdmin(null);
        alert("관리자가 삭제되었습니다.");
      } else {
        alert(data.error || "관리자 삭제 실패");
      }
    } catch (error) {
      console.error("관리자 삭제 오류:", error);
      alert("관리자 삭제 중 오류가 발생했습니다.");
    }
  };

  // 관리자 상태 변경
  const updateAdminStatus = async (adminId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/admins/${adminId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();

      if (data.success) {
        // 목록에서 해당 관리자 상태 업데이트
        setAdmins(admins.map(admin => 
          admin.id === adminId ? { ...admin, status: status as any } : admin
        ));
        alert("관리자 상태가 변경되었습니다.");
      } else {
        alert(data.error || "상태 변경 실패");
      }
    } catch (error) {
      console.error("상태 변경 오류:", error);
      alert("상태 변경 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // 필터링된 관리자 목록
  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || admin.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 border-green-200";
      case "INACTIVE":
        return "bg-red-100 text-red-800 border-red-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle className="w-4 h-4" />;
      case "INACTIVE":
        return <XCircle className="w-4 h-4" />;
      case "PENDING":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-full overflow-hidden">
          <div className="px-4 sm:px-6 py-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">로딩 중...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full overflow-hidden">
        {/* 헤더 */}
        <div className="px-4 sm:px-6 py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">관리자 관리</h1>
          <p className="text-base sm:text-lg text-gray-600">
            시스템 관리자 계정을 관리하고 권한을 설정하세요
          </p>
        </div>

        {/* 액션 버튼 */}
        <div className="px-4 sm:px-6 mb-6">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>새 관리자 추가</span>
            </button>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="px-4 sm:px-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="관리자 이름 또는 이메일로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:w-auto w-full"
            >
              <option value="all">모든 상태</option>
              <option value="ACTIVE">활성</option>
              <option value="INACTIVE">비활성</option>
              <option value="PENDING">대기</option>
            </select>
          </div>
        </div>

        {/* 관리자 목록 */}
        <div className="px-4 sm:px-6">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {filteredAdmins.length === 0 ? (
              <div className="p-6 sm:p-8 text-center">
                <User className="h-12 sm:h-16 w-12 sm:w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  등록된 관리자가 없습니다
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6">
                  아직 등록된 관리자가 없습니다. 새로운 관리자를 추가해보세요.
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                >
                  <Plus className="h-4 w-4" />
                  새 관리자 추가
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        관리자
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        역할
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상태
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        권한
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        마지막 로그인
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        작업
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAdmins.map((admin) => (
                      <tr key={admin.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {admin.name}
                              </div>
                              <div className="text-sm text-gray-500 truncate">
                                {admin.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Shield className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {admin.role === "MASTER" ? "마스터" : "관리자"}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(admin.status)}`}>
                            {getStatusIcon(admin.status)}
                            <span className="ml-1">
                              {admin.status === "ACTIVE" && "활성"}
                              {admin.status === "INACTIVE" && "비활성"}
                              {admin.status === "PENDING" && "대기"}
                            </span>
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {Object.values(admin.permissions).filter(Boolean).length}개
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : "없음"}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedAdmin(admin);
                                // 편집 모달 열기
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAdmin(admin);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              관리자 삭제 확인
            </h3>
            <p className="text-gray-600 mb-6">
              <strong>{selectedAdmin.name}</strong> 관리자를 삭제하시겠습니까?
              이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedAdmin(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => deleteAdmin(selectedAdmin.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
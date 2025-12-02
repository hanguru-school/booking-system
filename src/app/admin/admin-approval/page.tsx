"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  Calendar,
} from "lucide-react";

interface PendingAdmin {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  admin: {
    kanjiName: string;
    yomigana: string;
    koreanName?: string;
    phone?: string;
  };
}

interface Permissions {
  userManagement: boolean;
  systemSettings: boolean;
  adminApproval: boolean;
  allPermissions: boolean;
}

export default function AdminApprovalPage() {
  const [pendingAdmins, setPendingAdmins] = useState<PendingAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState<PendingAdmin | null>(null);
  const [permissions, setPermissions] = useState<Permissions>({
    userManagement: false,
    systemSettings: false,
    adminApproval: false,
    allPermissions: false,
  });

  // 마스터 관리자 이메일 (실제로는 세션에서 가져와야 함)
  const masterEmail = "master@malmoi.com";

  useEffect(() => {
    fetchPendingAdmins();
  }, []);

  const fetchPendingAdmins = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/auth/approve-admin?approvedBy=${masterEmail}`,
      );
      const data = await response.json();

      if (response.ok) {
        setPendingAdmins(data.pendingAdmins);
      } else {
        setError(
          data.error || "승인 대기 중인 관리자를 불러오는데 실패했습니다.",
        );
      }
    } catch (error) {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAdmin = async () => {
    if (!selectedAdmin) return;

    try {
      const response = await fetch("/api/auth/approve-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminId: selectedAdmin.id,
          permissions,
          approvedBy: masterEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("관리자 계정이 성공적으로 승인되었습니다.");
        setSelectedAdmin(null);
        setPermissions({
          userManagement: false,
          systemSettings: false,
          adminApproval: false,
          allPermissions: false,
        });
        fetchPendingAdmins(); // 목록 새로고침
      } else {
        setError(data.error || "관리자 승인에 실패했습니다.");
      }
    } catch (error) {
      setError("서버 오류가 발생했습니다.");
    }
  };

  const handlePermissionChange = (permission: keyof Permissions) => {
    setPermissions((prev) => ({
      ...prev,
      [permission]: !prev[permission],
    }));
  };

  const handleAllPermissionsChange = (checked: boolean) => {
    setPermissions({
      userManagement: checked,
      systemSettings: checked,
      adminApproval: checked,
      allPermissions: checked,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          {/* 헤더 */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">관리자 승인</h1>
            <p className="mt-1 text-sm text-gray-600">
              승인 대기 중인 관리자 계정을 검토하고 권한을 부여하세요.
            </p>
          </div>

          {/* 메시지 */}
          {successMessage && (
            <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-green-700">{successMessage}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* 승인 대기 중인 관리자 목록 */}
          <div className="px-6 py-4">
            {pendingAdmins.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  승인 대기 중인 관리자가 없습니다
                </h3>
                <p className="text-gray-600">
                  새로운 관리자 계정이 등록되면 여기에 표시됩니다.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingAdmins.map((admin) => (
                  <div
                    key={admin.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <User className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {admin.name}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 mr-1" />
                              {admin.email}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(admin.createdAt).toLocaleDateString(
                                "ko-KR",
                              )}
                            </div>
                          </div>
                          <div className="mt-1 text-sm text-gray-500">
                            한자: {admin.admin.kanjiName} | 요미가나:{" "}
                            {admin.admin.yomigana}
                            {admin.admin.koreanName &&
                              ` | 한글: ${admin.admin.koreanName}`}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedAdmin(admin)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        승인하기
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 승인 모달 */}
        {selectedAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  관리자 승인
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  {selectedAdmin.name}님의 계정을 승인하고 권한을 설정하세요.
                </p>
              </div>

              <div className="px-6 py-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      권한 설정
                    </h3>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={permissions.allPermissions}
                          onChange={(e) =>
                            handleAllPermissionsChange(e.target.checked)
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          모든 권한 부여
                        </span>
                      </label>

                      <div className="ml-6 space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={permissions.userManagement}
                            onChange={() =>
                              handlePermissionChange("userManagement")
                            }
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            사용자 관리
                          </span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={permissions.systemSettings}
                            onChange={() =>
                              handlePermissionChange("systemSettings")
                            }
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            시스템 설정
                          </span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={permissions.adminApproval}
                            onChange={() =>
                              handlePermissionChange("adminApproval")
                            }
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            관리자 승인
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedAdmin(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  취소
                </button>
                <button
                  onClick={handleApproveAdmin}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  승인
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

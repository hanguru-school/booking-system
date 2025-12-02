"use client";

import { useState, useEffect } from "react";
import { Shield, CheckCircle, Save, Loader2, AlertCircle } from "lucide-react";

interface PagePermission {
  id: string;
  name: string;
  path: string;
  requireAuth: boolean;
  requireTagging: boolean;
  requirePassword: boolean;
  roles: string[];
  permissions: string[];
}

export default function PageManagementPage() {
  const [pages, setPages] = useState<PagePermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  // 페이지 권한 설정 (기본값)
  const defaultPages: PagePermission[] = [
    {
      id: "master",
      name: "마스터 페이지",
      path: "/master",
      requireAuth: true,
      requireTagging: false,
      requirePassword: false,
      roles: ["admin", "teacher", "staff"],
      permissions: [],
    },
    {
      id: "master-dashboard",
      name: "대시보드",
      path: "/master/dashboard",
      requireAuth: true,
      requireTagging: false,
      requirePassword: false,
      roles: ["admin", "teacher", "staff"],
      permissions: [],
    },
    {
      id: "master-users",
      name: "사용자 관리",
      path: "/master/users",
      requireAuth: true,
      requireTagging: false,
      requirePassword: false,
      roles: ["admin"],
      permissions: ["user:manage"],
    },
    {
      id: "master-reservations",
      name: "예약 관리",
      path: "/master/reservations",
      requireAuth: true,
      requireTagging: false,
      requirePassword: false,
      roles: ["admin", "teacher", "staff"],
      permissions: ["reservation:manage"],
    },
    {
      id: "master-facilities",
      name: "시설 관리",
      path: "/master/facilities",
      requireAuth: true,
      requireTagging: false,
      requirePassword: false,
      roles: ["admin", "staff"],
      permissions: ["facility:manage"],
    },
    {
      id: "master-reports",
      name: "보고서",
      path: "/master/reports",
      requireAuth: true,
      requireTagging: false,
      requirePassword: false,
      roles: ["admin", "teacher"],
      permissions: ["report:view"],
    },
    {
      id: "master-settings",
      name: "시스템 설정",
      path: "/master/settings",
      requireAuth: true,
      requireTagging: false,
      requirePassword: false,
      roles: ["admin"],
      permissions: ["system:configure"],
    },
    {
      id: "master-security",
      name: "보안 관리",
      path: "/master/security",
      requireAuth: true,
      requireTagging: false,
      requirePassword: false,
      roles: ["admin"],
      permissions: ["security:manage"],
    },
  ];

  useEffect(() => {
    loadPagePermissions();
  }, []);

  const loadPagePermissions = async () => {
    try {
      const response = await fetch("/api/settings/page-permissions");
      const result = await response.json();

      if (result.success) {
        setPages(result.data);
      } else {
        // 기본값 사용
        setPages(defaultPages);
      }
    } catch (error) {
      console.error("페이지 권한 로드 오류:", error);
      setPages(defaultPages);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePagePermission = (
    pageId: string,
    field: keyof PagePermission,
    value: string | boolean | string[],
  ) => {
    setPages((prev) =>
      prev.map((page) =>
        page.id === pageId ? { ...page, [field]: value } : page,
      ),
    );
  };

  const savePagePermissions = async () => {
    try {
      setIsSaving(true);
      setMessage("");

      const response = await fetch("/api/settings/page-permissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pages }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage("페이지 권한이 성공적으로 저장되었습니다");
      } else {
        setMessage("저장에 실패했습니다: " + result.error);
      }
    } catch (error) {
      setMessage("저장 중 오류가 발생했습니다");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>페이지 권한을 로드하는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 rounded-lg p-2">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  페이지 권한 관리
                </h1>
                <p className="text-gray-600">
                  각 페이지의 접근 권한을 설정합니다
                </p>
              </div>
            </div>

            <button
              onClick={savePagePermissions}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>저장 중...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>저장</span>
                </>
              )}
            </button>
          </div>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.includes("성공")
                  ? "bg-green-50 border border-green-200 text-green-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}
            >
              <div className="flex items-center">
                {message.includes("성공") ? (
                  <CheckCircle className="w-5 h-5 mr-2" />
                ) : (
                  <AlertCircle className="w-5 h-5 mr-2" />
                )}
                <span>{message}</span>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    페이지
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    경로
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    인증 필요
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    태깅 필요
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    비밀번호 확인
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    허용 역할
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pages.map((page) => (
                  <tr key={page.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {page.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{page.path}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <input
                        type="checkbox"
                        checked={page.requireAuth}
                        onChange={(e) =>
                          updatePagePermission(
                            page.id,
                            "requireAuth",
                            e.target.checked,
                          )
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <input
                        type="checkbox"
                        checked={page.requireTagging}
                        onChange={(e) =>
                          updatePagePermission(
                            page.id,
                            "requireTagging",
                            e.target.checked,
                          )
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <input
                        type="checkbox"
                        checked={page.requirePassword}
                        onChange={(e) =>
                          updatePagePermission(
                            page.id,
                            "requirePassword",
                            e.target.checked,
                          )
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {page.roles.map((role) => (
                          <span
                            key={role}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              설정 설명
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • <strong>인증 필요</strong>: 로그인이 필요한지 여부
              </li>
              <li>
                • <strong>태깅 필요</strong>: 카드 태깅이 필요한지 여부
              </li>
              <li>
                • <strong>비밀번호 확인</strong>: 페이지 접근 시 비밀번호
                재확인이 필요한지 여부
              </li>
              <li>
                • <strong>허용 역할</strong>: 해당 페이지에 접근할 수 있는
                사용자 역할
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

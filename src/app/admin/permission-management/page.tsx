"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronRight,
  Save,
  Search,
} from "lucide-react";
import HomeButton from "@/components/common/HomeButton";

interface User {
  id: string;
  name: string;
  cardType:
    | "student"
    | "teacher"
    | "staff"
    | "visitor"
    | "admin"
    | "super_admin";
  uid: string;
  assignedTo?: string;
  status: "active" | "inactive";
  lastLogin?: string;
}

interface PagePermission {
  id: string;
  name: string;
  path: string;
  parentId?: string;
  children?: PagePermission[];
  isExpanded?: boolean;
  permissions: {
    read: boolean;
    write: boolean;
    delete: boolean;
    admin: boolean;
  };
}

interface UserPermission {
  userId: string;
  userName: string;
  pagePermissions: { [pageId: string]: PagePermission["permissions"] };
}

export default function PermissionManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  const [pageHierarchy, setPageHierarchy] = useState<PagePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  // 페이지 계층 구조 정의
  const initializePageHierarchy = (): PagePermission[] => [
    {
      id: "admin",
      name: "관리자 대시보드",
      path: "/admin",
      permissions: { read: false, write: false, delete: false, admin: false },
      children: [
        {
          id: "admin-home",
          name: "홈",
          path: "/admin/home",
          parentId: "admin",
          permissions: {
            read: false,
            write: false,
            delete: false,
            admin: false,
          },
        },
        {
          id: "admin-customer",
          name: "학생 관리",
          path: "/admin/customer-management",
          parentId: "admin",
          permissions: {
            read: false,
            write: false,
            delete: false,
            admin: false,
          },
        },
        {
          id: "admin-teacher",
          name: "강사 관리",
          path: "/admin/teacher-management",
          parentId: "admin",
          permissions: {
            read: false,
            write: false,
            delete: false,
            admin: false,
          },
        },
        {
          id: "admin-curriculum",
          name: "커리큘럼 관리",
          path: "/admin/curriculum-management",
          parentId: "admin",
          permissions: {
            read: false,
            write: false,
            delete: false,
            admin: false,
          },
        },
        {
          id: "admin-tagging",
          name: "태깅 관리",
          path: "/admin/tagging-management",
          parentId: "admin",
          permissions: {
            read: false,
            write: false,
            delete: false,
            admin: false,
          },
        },
        {
          id: "admin-service",
          name: "서비스 관리",
          path: "/admin/service-management",
          parentId: "admin",
          permissions: {
            read: false,
            write: false,
            delete: false,
            admin: false,
          },
        },
        {
          id: "admin-reservation",
          name: "예약 관리",
          path: "/admin/reservation-management",
          parentId: "admin",
          permissions: {
            read: false,
            write: false,
            delete: false,
            admin: false,
          },
        },
        {
          id: "admin-system",
          name: "시스템 설정",
          path: "/admin/system-settings",
          parentId: "admin",
          permissions: {
            read: false,
            write: false,
            delete: false,
            admin: false,
          },
        },
      ],
    },
    {
      id: "student",
      name: "학생 포털",
      path: "/student",
      permissions: { read: false, write: false, delete: false, admin: false },
      children: [
        {
          id: "student-home",
          name: "홈",
          path: "/student/home",
          parentId: "student",
          permissions: {
            read: false,
            write: false,
            delete: false,
            admin: false,
          },
        },
        {
          id: "student-reservations",
          name: "예약 관리",
          path: "/student/reservations",
          parentId: "student",
          permissions: {
            read: false,
            write: false,
            delete: false,
            admin: false,
          },
        },
        {
          id: "student-progress",
          name: "학습 진도",
          path: "/student/progress",
          parentId: "student",
          permissions: {
            read: false,
            write: false,
            delete: false,
            admin: false,
          },
        },
      ],
    },
    {
      id: "teacher",
      name: "선생님 포털",
      path: "/teacher",
      permissions: { read: false, write: false, delete: false, admin: false },
      children: [
        {
          id: "teacher-home",
          name: "홈",
          path: "/teacher/home",
          parentId: "teacher",
          permissions: {
            read: false,
            write: false,
            delete: false,
            admin: false,
          },
        },
        {
          id: "teacher-attendance",
          name: "출근 관리",
          path: "/teacher/attendance",
          parentId: "teacher",
          permissions: {
            read: false,
            write: false,
            delete: false,
            admin: false,
          },
        },
        {
          id: "teacher-notes",
          name: "노트 작성",
          path: "/teacher/notes",
          parentId: "teacher",
          permissions: {
            read: false,
            write: false,
            delete: false,
            admin: false,
          },
        },
        {
          id: "teacher-reviews",
          name: "리뷰 확인",
          path: "/teacher/reviews",
          parentId: "teacher",
          permissions: {
            read: false,
            write: false,
            delete: false,
            admin: false,
          },
        },
      ],
    },
    {
      id: "tagging",
      name: "태그 시스템",
      path: "/tagging",
      permissions: { read: false, write: false, delete: false, admin: false },
      children: [
        {
          id: "tagging-home",
          name: "태그 관리",
          path: "/tagging/home",
          parentId: "tagging",
          permissions: {
            read: false,
            write: false,
            delete: false,
            admin: false,
          },
        },
      ],
    },
  ];

  useEffect(() => {
    // 데이터 로딩 시뮬레이션
    const loadData = async () => {
      setLoading(true);

      // 사용자 데이터 로딩
      const mockUsers: User[] = [
        {
          id: "1",
          name: "주용진",
          cardType: "super_admin",
          uid: "ABCD6Y7MZVC1",
          assignedTo: "주용진",
          status: "active",
          lastLogin: "2024-01-15 14:30",
        },
        {
          id: "2",
          name: "김관리자",
          cardType: "admin",
          uid: "EFGH8N9PQRD2",
          assignedTo: "김관리자",
          status: "active",
          lastLogin: "2024-01-15 13:45",
        },
        {
          id: "3",
          name: "박직원",
          cardType: "staff",
          uid: "IJKL0Q1RSTU3",
          assignedTo: "박직원",
          status: "active",
          lastLogin: "2024-01-15 12:20",
        },
        {
          id: "4",
          name: "이선생님",
          cardType: "teacher",
          uid: "MNOP2S3TUVW4",
          assignedTo: "이선생님",
          status: "active",
          lastLogin: "2024-01-15 11:15",
        },
        {
          id: "5",
          name: "최학생",
          cardType: "student",
          uid: "QRST4U5VWXY5",
          assignedTo: "최학생",
          status: "active",
          lastLogin: "2024-01-15 10:30",
        },
      ];

      setUsers(mockUsers);
      setPageHierarchy(initializePageHierarchy());

      // 기본 권한 설정 (최고 관리자는 모든 권한)
      const initialPermissions: UserPermission[] = mockUsers.map((user) => ({
        userId: user.id,
        userName: user.name,
        pagePermissions:
          user.cardType === "super_admin"
            ? Object.fromEntries(
                initializePageHierarchy().flatMap((page) => [
                  [
                    page.id,
                    { read: true, write: true, delete: true, admin: true },
                  ],
                  ...(page.children?.map((child) => [
                    child.id,
                    { read: true, write: true, delete: true, admin: true },
                  ]) || []),
                ]),
              )
            : {},
      }));

      setUserPermissions(initialPermissions);
      setLoading(false);
    };

    loadData();
  }, []);

  // 사용자 선택 토글
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  // 전체 사용자 선택/해제
  const toggleAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user.id));
    }
  };

  // 페이지 확장/축소 토글
  const togglePageExpansion = (pageId: string) => {
    setPageHierarchy((prev) =>
      prev.map((page) =>
        page.id === pageId ? { ...page, isExpanded: !page.isExpanded } : page,
      ),
    );
  };

  // 권한 변경
  const updatePermission = (
    userId: string,
    pageId: string,
    permissionType: keyof PagePermission["permissions"],
    value: boolean,
  ) => {
    setUserPermissions((prev) =>
      prev.map((userPerm) => {
        if (userPerm.userId === userId) {
          const updatedPermissions = {
            ...userPerm.pagePermissions,
            [pageId]: {
              ...userPerm.pagePermissions[pageId],
              [permissionType]: value,
            },
          };
          return { ...userPerm, pagePermissions: updatedPermissions };
        }
        return userPerm;
      }),
    );
  };

  // 상위 페이지 선택 시 모든 하위 페이지 권한 부여
  const selectParentPage = (
    userId: string,
    pageId: string,
    permissionType: keyof PagePermission["permissions"],
    value: boolean,
  ) => {
    const page = pageHierarchy.find((p) => p.id === pageId);
    if (page?.children) {
      // 상위 페이지 권한 업데이트
      updatePermission(userId, pageId, permissionType, value);

      // 모든 하위 페이지 권한 업데이트
      page.children.forEach((child) => {
        updatePermission(userId, child.id, permissionType, value);
      });
    }
  };

  // 일괄 권한 부여
  const batchUpdatePermissions = (
    pageId: string,
    permissionType: keyof PagePermission["permissions"],
    value: boolean,
  ) => {
    selectedUsers.forEach((userId) => {
      updatePermission(userId, pageId, permissionType, value);
    });
  };

  // 필터링된 사용자 목록
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.uid.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || user.cardType === filterType;
    return matchesSearch && matchesFilter;
  });

  // 권한 저장
  const savePermissions = () => {
    console.log("권한 저장:", userPermissions);
    // 실제 API 호출 로직
    alert("권한이 저장되었습니다.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                권한 관리
              </h1>
              <p className="text-gray-600">
                사용자별 페이지 접근 권한을 관리합니다
              </p>
            </div>
            <HomeButton variant="header" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 사용자 목록 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    등록된 사용자
                  </h2>
                  <span className="text-sm text-gray-500">
                    {selectedUsers.length} / {users.length} 선택됨
                  </span>
                </div>

                {/* 검색 및 필터 */}
                <div className="space-y-3 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="사용자 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">모든 타입</option>
                    <option value="super_admin">최고 관리자</option>
                    <option value="admin">관리자</option>
                    <option value="staff">직원</option>
                    <option value="teacher">강사</option>
                    <option value="student">학생</option>
                  </select>
                </div>

                {/* 전체 선택 */}
                <div className="flex items-center mb-3 p-2 bg-gray-50 rounded-lg">
                  <button
                    onClick={toggleAllUsers}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    {selectedUsers.length === users.length ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400" />
                    )}
                    전체 선택
                  </button>
                </div>

                {/* 사용자 목록 */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedUsers.includes(user.id)
                          ? "bg-blue-50 border border-blue-200"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                      onClick={() => toggleUserSelection(user.id)}
                    >
                      <div className="flex items-center gap-2">
                        {selectedUsers.includes(user.id) ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.cardType === "super_admin"
                            ? "최고 관리자"
                            : user.cardType}
                        </div>
                        <div className="text-xs text-gray-400">{user.uid}</div>
                      </div>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          user.status === "active"
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 권한 설정 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    페이지 권한 설정
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={savePermissions}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      저장
                    </button>
                  </div>
                </div>

                {selectedUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>권한을 설정할 사용자를 선택해주세요</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* 선택된 사용자 표시 */}
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-1">
                        선택된 사용자 ({selectedUsers.length}명)
                      </p>
                      <p className="text-xs text-blue-700">
                        {users
                          .filter((u) => selectedUsers.includes(u.id))
                          .map((u) => u.name)
                          .join(", ")}
                      </p>
                    </div>

                    {/* 페이지 권한 목록 */}
                    <div className="space-y-2">
                      {pageHierarchy.map((page) => (
                        <div
                          key={page.id}
                          className="border border-gray-200 rounded-lg"
                        >
                          {/* 상위 페이지 */}
                          <div className="p-4 bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => togglePageExpansion(page.id)}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  {page.isExpanded ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                </button>
                                <span className="font-medium text-gray-900">
                                  {page.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={selectedUsers.every(
                                      (userId) =>
                                        userPermissions.find(
                                          (up) => up.userId === userId,
                                        )?.pagePermissions[page.id]?.read,
                                    )}
                                    onChange={(e) =>
                                      selectedUsers.forEach((userId) =>
                                        selectParentPage(
                                          userId,
                                          page.id,
                                          "read",
                                          e.target.checked,
                                        ),
                                      )
                                    }
                                    className="rounded"
                                  />
                                  읽기
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={selectedUsers.every(
                                      (userId) =>
                                        userPermissions.find(
                                          (up) => up.userId === userId,
                                        )?.pagePermissions[page.id]?.write,
                                    )}
                                    onChange={(e) =>
                                      selectedUsers.forEach((userId) =>
                                        selectParentPage(
                                          userId,
                                          page.id,
                                          "write",
                                          e.target.checked,
                                        ),
                                      )
                                    }
                                    className="rounded"
                                  />
                                  쓰기
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={selectedUsers.every(
                                      (userId) =>
                                        userPermissions.find(
                                          (up) => up.userId === userId,
                                        )?.pagePermissions[page.id]?.delete,
                                    )}
                                    onChange={(e) =>
                                      selectedUsers.forEach((userId) =>
                                        selectParentPage(
                                          userId,
                                          page.id,
                                          "delete",
                                          e.target.checked,
                                        ),
                                      )
                                    }
                                    className="rounded"
                                  />
                                  삭제
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={selectedUsers.every(
                                      (userId) =>
                                        userPermissions.find(
                                          (up) => up.userId === userId,
                                        )?.pagePermissions[page.id]?.admin,
                                    )}
                                    onChange={(e) =>
                                      selectedUsers.forEach((userId) =>
                                        selectParentPage(
                                          userId,
                                          page.id,
                                          "admin",
                                          e.target.checked,
                                        ),
                                      )
                                    }
                                    className="rounded"
                                  />
                                  관리
                                </label>
                              </div>
                            </div>
                          </div>

                          {/* 하위 페이지 */}
                          {page.isExpanded && page.children && (
                            <div className="border-t border-gray-200">
                              {page.children.map((child) => (
                                <div
                                  key={child.id}
                                  className="p-4 border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 ml-6">
                                      <span className="text-gray-700">
                                        {child.name}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <label className="flex items-center gap-2 text-sm">
                                        <input
                                          type="checkbox"
                                          checked={selectedUsers.every(
                                            (userId) =>
                                              userPermissions.find(
                                                (up) => up.userId === userId,
                                              )?.pagePermissions[child.id]
                                                ?.read,
                                          )}
                                          onChange={(e) =>
                                            selectedUsers.forEach((userId) =>
                                              updatePermission(
                                                userId,
                                                child.id,
                                                "read",
                                                e.target.checked,
                                              ),
                                            )
                                          }
                                          className="rounded"
                                        />
                                        읽기
                                      </label>
                                      <label className="flex items-center gap-2 text-sm">
                                        <input
                                          type="checkbox"
                                          checked={selectedUsers.every(
                                            (userId) =>
                                              userPermissions.find(
                                                (up) => up.userId === userId,
                                              )?.pagePermissions[child.id]
                                                ?.write,
                                          )}
                                          onChange={(e) =>
                                            selectedUsers.forEach((userId) =>
                                              updatePermission(
                                                userId,
                                                child.id,
                                                "write",
                                                e.target.checked,
                                              ),
                                            )
                                          }
                                          className="rounded"
                                        />
                                        쓰기
                                      </label>
                                      <label className="flex items-center gap-2 text-sm">
                                        <input
                                          type="checkbox"
                                          checked={selectedUsers.every(
                                            (userId) =>
                                              userPermissions.find(
                                                (up) => up.userId === userId,
                                              )?.pagePermissions[child.id]
                                                ?.delete,
                                          )}
                                          onChange={(e) =>
                                            selectedUsers.forEach((userId) =>
                                              updatePermission(
                                                userId,
                                                child.id,
                                                "delete",
                                                e.target.checked,
                                              ),
                                            )
                                          }
                                          className="rounded"
                                        />
                                        삭제
                                      </label>
                                      <label className="flex items-center gap-2 text-sm">
                                        <input
                                          type="checkbox"
                                          checked={selectedUsers.every(
                                            (userId) =>
                                              userPermissions.find(
                                                (up) => up.userId === userId,
                                              )?.pagePermissions[child.id]
                                                ?.admin,
                                          )}
                                          onChange={(e) =>
                                            selectedUsers.forEach((userId) =>
                                              updatePermission(
                                                userId,
                                                child.id,
                                                "admin",
                                                e.target.checked,
                                              ),
                                            )
                                          }
                                          className="rounded"
                                        />
                                        관리
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

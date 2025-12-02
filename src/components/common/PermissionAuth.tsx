"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";

interface PermissionAuthProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermissions?: string[];
  fallback?: React.ReactNode;
}

export default function PermissionAuth({
  children,
  requiredRole,
  requiredPermissions = [],
  fallback,
}: PermissionAuthProps) {
  const { user, loading } = useAuth();

  // 로딩 중일 때
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 사용자가 로그인하지 않은 경우
  if (!user) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              로그인이 필요합니다
            </h3>
            <p className="text-gray-600">
              이 페이지에 접근하려면 로그인해주세요.
            </p>
          </div>
        </div>
      )
    );
  }

  // 역할 기반 권한 확인
  if (requiredRole && user.role !== requiredRole) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              접근 권한이 없습니다
            </h3>
            <p className="text-gray-600">
              이 페이지에 접근하려면 {requiredRole} 권한이 필요합니다.
            </p>
            <p className="text-sm text-gray-500 mt-1">현재 권한: {user.role}</p>
          </div>
        </div>
      )
    );
  }

  // 특정 권한 확인 (향후 확장 가능)
  if (requiredPermissions.length > 0) {
    // 현재는 기본적인 역할 기반 권한만 확인
    const hasPermission = requiredPermissions.some((permission) => {
      // 관리자는 모든 권한을 가짐
      if (user.role === "admin") return true;

      // 역할별 권한 매핑
      const rolePermissions: Record<string, string[]> = {
        admin: ["*"],
        teacher: ["view_students", "manage_lessons", "view_reports"],
        staff: ["view_reservations", "manage_students"],
        student: ["view_own_data", "make_reservations"],
      };

      const userPermissions = rolePermissions[user.role] || [];
      return (
        userPermissions.includes("*") || userPermissions.includes(permission)
      );
    });

    if (!hasPermission) {
      return (
        fallback || (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                권한이 부족합니다
              </h3>
              <p className="text-gray-600">
                이 기능을 사용하려면 추가 권한이 필요합니다.
              </p>
              <p className="text-sm text-gray-500 mt-1">
                필요한 권한: {requiredPermissions.join(", ")}
              </p>
            </div>
          </div>
        )
      );
    }
  }

  // 권한 확인 통과
  return <>{children}</>;
}

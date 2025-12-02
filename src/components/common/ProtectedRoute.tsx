"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  allowedRoles = [],
  redirectTo,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // 로그인되지 않은 경우
      if (!user) {
        router.push("/auth/login");
        return;
      }

      // 권한이 지정된 경우 권한 확인
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          // 기본 대시보드로 리다이렉트
          const dashboardPath = getDashboardPath(user.role);
          router.push(dashboardPath);
        }
        return;
      }
    }
  }, [user, loading, allowedRoles, redirectTo, router]);

  // 로딩 중일 때
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 로그인되지 않은 경우
  if (!user) {
    return null;
  }

  // 권한이 지정된 경우 권한 확인
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}

// 권한에 따른 대시보드 경로 결정
function getDashboardPath(role: string): string {
  switch (role) {
    case "ADMIN":
    case "MASTER":
      return "/admin";
    case "TEACHER":
      return "/teacher";
    case "STAFF":
      return "/staff";
    case "EMPLOYEE":
      return "/employee";
    case "PARENT":
      return "/parent";
    case "STUDENT":
    default:
      return "/student";
  }
}

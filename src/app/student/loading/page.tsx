"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoadingPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "success" | "error">(
    "checking",
  );

  // 사용자 역할에 따른 리디렉션 경로 결정
  const getRedirectPath = (userRole: string) => {
    switch (userRole.toLowerCase()) {
      case "student":
        return "/student/dashboard";
      case "admin":
        return "/admin/dashboard";
      case "teacher":
        return "/teacher/dashboard";
      case "staff":
        return "/staff/home";
      default:
        return "/student/dashboard"; // 기본값
    }
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // 세션 확인
        const response = await fetch("/api/auth/session");

        if (response.ok) {
          const data = await response.json();

          if (data.user && data.user.id) {
            // 로그인 성공 - 역할에 따른 대시보드로 이동
            setStatus("success");
            const redirectPath = getRedirectPath(data.user.role);
            console.log(
              "사용자 역할:",
              data.user.role,
              "리디렉션 경로:",
              redirectPath,
            );

            setTimeout(() => {
              router.push(redirectPath);
            }, 1000);
          } else {
            // 로그인 실패 - 로그인 페이지로 이동
            setStatus("error");
            setTimeout(() => {
              router.push("/auth/login");
            }, 1000);
          }
        } else {
          // 서버 오류 - 로그인 페이지로 이동
          setStatus("error");
          setTimeout(() => {
            router.push("/auth/login");
          }, 1000);
        }
      } catch (error) {
        console.error("세션 확인 오류:", error);
        setStatus("error");
        setTimeout(() => {
          router.push("/auth/login");
        }, 1000);
      }
    };

    checkAuthStatus();
  }, [router]);

  const getStatusText = () => {
    switch (status) {
      case "checking":
        return "로그인 확인 중입니다";
      case "success":
        return "로그인 확인되었습니다. 대시보드로 이동합니다...";
      case "error":
        return "로그인이 필요합니다. 로그인 페이지로 이동합니다...";
      default:
        return "로그인 확인 중입니다";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          로그인 확인
        </h2>
        <p className="text-gray-600 mb-6">{getStatusText()}</p>
        <div className="flex justify-center">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

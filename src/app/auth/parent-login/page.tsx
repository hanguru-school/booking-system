"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Users,
  Phone,
  CheckCircle,
} from "lucide-react";

export default function ParentLoginPage() {
  const [formData, setFormData] = useState({
    studentId: "",
    parentPhone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 실제 API 호출로 대체
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 임시 로그인 로직
      if (formData.studentId && formData.parentPhone && formData.password) {
        // localStorage에 학부모 로그인 정보 저장
        localStorage.setItem(
          "parentUser",
          JSON.stringify({
            studentId: formData.studentId,
            parentPhone: formData.parentPhone,
            loginTime: new Date().toISOString(),
          }),
        );

        router.push("/parent/dashboard");
      } else {
        setError("모든 필드를 입력해주세요.");
      }
    } catch (err) {
      setError("로그인에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>메인 페이지로 돌아가기</span>
          </Link>

          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                학부모 로그인
              </h1>
              <p className="text-gray-600">자녀의 학습 현황을 확인하세요</p>
            </div>
          </div>
        </div>

        {/* 로그인 폼 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                학생 ID <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.studentId}
                  onChange={(e) =>
                    setFormData({ ...formData, studentId: e.target.value })
                  }
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="학생 ID를 입력하세요"
                  required
                />
                <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                학부모 연락처 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.parentPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, parentPhone: e.target.value })
                  }
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="010-1234-5678"
                  required
                />
                <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="비밀번호를 입력하세요"
                  required
                />
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  로그인
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                아직 계정이 없으신가요?
              </p>
              <Link
                href="/parent/register"
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                학부모 계정 등록하기
              </Link>
            </div>
          </div>
        </div>

        {/* 안내사항 */}
        <div className="mt-6 bg-orange-50 rounded-lg p-4">
          <h3 className="font-medium text-orange-900 mb-2">
            학부모 로그인 안내
          </h3>
          <ul className="text-sm text-orange-800 space-y-1">
            <li>• 자녀의 학생 ID가 필요합니다</li>
            <li>• 등록 시 사용한 학부모 연락처를 입력하세요</li>
            <li>• 자녀의 출석률, 남은 시간, 결제 현황을 확인할 수 있습니다</li>
            <li>• 자세한 학습 내용은 학생 계정으로 로그인하세요</li>
            <li>• 계정 등록 후 승인까지 1-2일이 소요될 수 있습니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

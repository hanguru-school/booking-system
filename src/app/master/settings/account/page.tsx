"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { 
  User, 
  Mail, 
  Lock, 
  Save, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";

interface AccountSettings {
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function MasterAccountPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<AccountSettings>({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (user.role !== "admin") {
      router.push("/");
      return;
    }

    // 현재 사용자 정보 로드
    loadCurrentUser();
  }, [user, router]);

  const loadCurrentUser = async () => {
    try {
      const response = await fetch("/api/admin/profile");
      const result = await response.json();

      if (result.success) {
        setSettings(prev => ({
          ...prev,
          email: result.data.email || "",
        }));
      }
    } catch (error) {
      console.error("사용자 정보 로드 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof AccountSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = () => {
    if (!settings.email) {
      setMessage("이메일을 입력해주세요.");
      return false;
    }

    if (!settings.currentPassword) {
      setMessage("현재 비밀번호를 입력해주세요.");
      return false;
    }

    if (settings.newPassword && settings.newPassword.length < 6) {
      setMessage("새 비밀번호는 최소 6자 이상이어야 합니다.");
      return false;
    }

    if (settings.newPassword && settings.newPassword !== settings.confirmPassword) {
      setMessage("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
      return false;
    }

    return true;
  };

  const saveAccountSettings = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);
      setMessage("");

      const response = await fetch("/api/admin/account-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: settings.email,
          currentPassword: settings.currentPassword,
          newPassword: settings.newPassword,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage("계정 설정이 성공적으로 저장되었습니다.");
        // 비밀번호 필드 초기화
        setSettings(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        setMessage("저장에 실패했습니다: " + result.error);
      }
    } catch (error) {
      setMessage("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>계정 정보를 로드하는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-blue-100 rounded-lg p-2">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                마스터 계정 설정
              </h1>
              <p className="text-gray-600">
                이메일과 비밀번호를 변경할 수 있습니다
              </p>
            </div>
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

          <div className="space-y-6">
            {/* 이메일 설정 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일 주소
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="이메일을 입력하세요"
                />
              </div>
            </div>

            {/* 현재 비밀번호 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                현재 비밀번호
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPasswords.current ? "text" : "password"}
                  value={settings.currentPassword}
                  onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="현재 비밀번호를 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* 새 비밀번호 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                새 비밀번호 (선택사항)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPasswords.new ? "text" : "password"}
                  value={settings.newPassword}
                  onChange={(e) => handleInputChange("newPassword", e.target.value)}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="새 비밀번호를 입력하세요 (최소 6자)"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* 새 비밀번호 확인 */}
            {settings.newPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  새 비밀번호 확인
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={settings.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="새 비밀번호를 다시 입력하세요"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* 저장 버튼 */}
            <div className="flex justify-end">
              <button
                onClick={saveAccountSettings}
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
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
          </div>

          {/* 안내 메시지 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              설정 안내
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 이메일 주소는 로그인에 사용됩니다</li>
              <li>• 새 비밀번호는 최소 6자 이상이어야 합니다</li>
              <li>• 비밀번호 변경 시 현재 비밀번호 확인이 필요합니다</li>
              <li>• 설정 변경 후 즉시 적용됩니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 
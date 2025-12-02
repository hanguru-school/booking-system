"use client";

import { useState } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  Clock,
  MapPin,
  ArrowLeft,
  Save,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

interface LoginSession {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastLogin: string;
  isCurrent: boolean;
}

export default function StudentSecuritySettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [loginSessions] = useState<LoginSession[]>([
    {
      id: "1",
      device: "MacBook Pro (Chrome)",
      location: "서울, 대한민국",
      ip: "192.168.1.100",
      lastLogin: "2024-01-15T14:30:00Z",
      isCurrent: true,
    },
    {
      id: "2",
      device: "iPhone 15 (Safari)",
      location: "서울, 대한민국",
      ip: "192.168.1.101",
      lastLogin: "2024-01-14T09:15:00Z",
      isCurrent: false,
    },
    {
      id: "3",
      device: "Windows PC (Edge)",
      location: "부산, 대한민국",
      ip: "203.241.xxx.xxx",
      lastLogin: "2024-01-12T16:45:00Z",
      isCurrent: false,
    },
  ]);

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (newPassword.length < 8) {
      alert("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    setSaving(true);
    // 실제 API 호출로 대체
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);

    // 폼 초기화
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setTimeout(() => setSaved(false), 3000);
  };

  const handleTwoFactorToggle = async () => {
    setSaving(true);
    // 실제 API 호출로 대체
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setTwoFactorEnabled(!twoFactorEnabled);
    setSaving(false);
  };

  const handleLogoutSession = (sessionId: string) => {
    // 실제 세션 로그아웃 로직
    alert(`세션 ${sessionId}가 로그아웃되었습니다.`);
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ko-KR");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">계정 보안</h1>
            <p className="text-gray-600">
              비밀번호 변경 및 보안 설정을 관리하세요
            </p>
          </div>
          <Link
            href="/student/profile"
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>돌아가기</span>
          </Link>
        </div>

        <div className="space-y-6">
          {/* 비밀번호 변경 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                비밀번호 변경
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  현재 비밀번호
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="현재 비밀번호를 입력하세요"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("current")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  새 비밀번호
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="새 비밀번호를 입력하세요"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("new")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  비밀번호는 8자 이상이어야 합니다
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  새 비밀번호 확인
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="새 비밀번호를 다시 입력하세요"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("confirm")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={handlePasswordChange}
                disabled={
                  saving || !currentPassword || !newPassword || !confirmPassword
                }
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{saving ? "변경 중..." : "비밀번호 변경"}</span>
              </button>
            </div>
          </div>

          {/* 2단계 인증 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Smartphone className="w-6 h-6 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  2단계 인증
                </h2>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={twoFactorEnabled}
                  onChange={handleTwoFactorToggle}
                  disabled={saving}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                />
              </label>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                2단계 인증을 활성화하면 로그인 시 추가 보안 코드가 필요합니다.
              </p>
              {twoFactorEnabled ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">
                    2단계 인증이 활성화되어 있습니다
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">
                    2단계 인증이 비활성화되어 있습니다
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 로그인 세션 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                로그인 세션
              </h2>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                현재 로그인된 기기들을 확인하고 관리할 수 있습니다.
              </p>

              {loginSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {session.device}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {session.location}
                          </span>
                          <span>IP: {session.ip}</span>
                          <span>{formatDate(session.lastLogin)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {session.isCurrent && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        현재 세션
                      </span>
                    )}
                    {!session.isCurrent && (
                      <button
                        onClick={() => handleLogoutSession(session.id)}
                        className="px-3 py-1 text-red-600 hover:bg-red-50 rounded text-sm transition-colors"
                      >
                        로그아웃
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 보안 팁 */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 mb-3">보안 팁</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>
                • 강력한 비밀번호를 사용하세요 (영문, 숫자, 특수문자 조합)
              </li>
              <li>
                • 다른 사이트에서 사용하지 않는 고유한 비밀번호를 사용하세요
              </li>
              <li>• 2단계 인증을 활성화하여 계정을 더욱 안전하게 보호하세요</li>
              <li>
                • 의심스러운 로그인 시도가 있다면 즉시 비밀번호를 변경하세요
              </li>
              <li>• 공용 컴퓨터에서는 로그아웃을 잊지 마세요</li>
            </ul>
          </div>

          {/* 저장 완료 메시지 */}
          {saved && (
            <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>비밀번호가 성공적으로 변경되었습니다</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

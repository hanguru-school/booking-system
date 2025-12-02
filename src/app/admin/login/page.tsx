"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Smartphone, Fingerprint, Eye, EyeOff } from "lucide-react";

interface LoginMethod {
  type: "email" | "passcode" | "biometric";
  label: string;
  icon: React.ReactNode;
  description: string;
  disabled?: boolean;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<
    "email" | "passcode" | "biometric"
  >("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passcode, setPasscode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasLoginHistory, setHasLoginHistory] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  useEffect(() => {
    // 로그인 이력 확인
    const loginHistory = localStorage.getItem("adminLoginHistory");
    if (loginHistory) {
      setHasLoginHistory(true);
      setLoginMethod("passcode");
    }

    // 생체인식 사용 가능 여부 확인
    if (window.PublicKeyCredential) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().then(
        (available) => {
          setIsBiometricAvailable(available);
        },
      );
    }
  }, []);

  const loginMethods: LoginMethod[] = [
    {
      type: "email",
      label: "이메일 로그인",
      icon: <Mail className="w-5 h-5" />,
      description: "이메일과 비밀번호로 로그인",
    },
    {
      type: "passcode",
      label: "패스코드 로그인",
      icon: <Smartphone className="w-5 h-5" />,
      description: "4자리 숫자로 간편 로그인",
      disabled: !hasLoginHistory,
    },
    {
      type: "biometric",
      label: "생체인식 로그인",
      icon: <Fingerprint className="w-5 h-5" />,
      description: "지문 또는 얼굴 인식으로 로그인",
      disabled: !isBiometricAvailable,
    },
  ];

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // 실제 API 호출로 대체
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminLoginHistory", "true");
        router.push("/admin/calendar");
      } else {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      }
    } catch (error) {
      setError("로그인 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasscodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login/passcode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ passcode }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("adminToken", data.token);
        router.push("/admin/calendar");
      } else {
        setError("패스코드가 올바르지 않습니다.");
      }
    } catch (error) {
      setError("로그인 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      // WebAuthn API를 사용한 생체인식 인증
      const response = await fetch("/api/admin/login/biometric", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("adminToken", data.token);
        router.push("/admin/calendar");
      } else {
        setError("생체인식 인증에 실패했습니다.");
      }
    } catch (error) {
      setError("생체인식 로그인 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderLoginForm = () => {
    switch (loginMethod) {
      case "email":
        return (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                이메일
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                비밀번호
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-500" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </button>
          </form>
        );

      case "passcode":
        return (
          <form onSubmit={handlePasscodeLogin} className="space-y-4">
            <div>
              <label
                htmlFor="passcode"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                4자리 패스코드
              </label>
              <input
                type="password"
                id="passcode"
                value={passcode}
                onChange={(e) =>
                  setPasscode(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                maxLength={4}
                pattern="[0-9]{4}"
                className="w-full px-3 py-2 text-center text-2xl tracking-widest border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </button>
          </form>
        );

      case "biometric":
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Fingerprint className="w-16 h-16 mx-auto text-blue-600 mb-4" />
              <p className="text-gray-600 mb-4">생체인식으로 로그인하세요</p>
            </div>
            <button
              onClick={handleBiometricLogin}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "인증 중..." : "생체인식 로그인"}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            관리자 로그인
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            관리자 계정으로 로그인하세요
          </p>
        </div>

        {/* 로그인 방법 선택 */}
        <div className="space-y-3">
          {loginMethods.map((method) => (
            <button
              key={method.type}
              onClick={() => setLoginMethod(method.type)}
              disabled={method.disabled}
              className={`w-full flex items-center p-3 border rounded-lg transition-colors ${
                loginMethod === method.type
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              } ${method.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="flex-shrink-0 mr-3 text-gray-500">
                {method.icon}
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900">{method.label}</div>
                <div className="text-sm text-gray-500">
                  {method.description}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* 로그인 폼 */}
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {renderLoginForm()}

          {loginMethod === "passcode" && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setLoginMethod("email")}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                이메일로 로그인하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

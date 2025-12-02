"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  UserPlus,
  Languages,
  Users,
  GraduationCap,
  Building,
  User,
  Shield,
  Globe,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// 다국어 텍스트 정의
const translations = {
  ja: {
    title: "韓国語教室MalMoi",
    subtitle: "スマートな韓国語学習を始めましょう",
    description: "教室でレッスンを受ける生徒のためのデジタルプラットフォーム",
    emailLabel: "メールアドレスまたは学番",
    emailPlaceholder: "メールアドレスまたは学番を入力してください",
    emailHelp: "メールアドレスまたは学番（例：2501150114）でログインしてください",
    passwordLabel: "パスワード",
    passwordPlaceholder: "パスワードを入力してください",
    loginButton: "ログイン",
    registerButton: "入会申し込み",
    forgotPassword: "パスワードを忘れた方",
    orText: "または",
    loginWith: "でログイン",
    noAccount: "アカウントをお持ちでない方",
    haveAccount: "すでにアカウントをお持ちの方",
    studentLogin: "生徒ログイン",
    parentLogin: "保護者ログイン",
    employeeLogin: "職員ログイン",
    teacherLogin: "先生ログイン",
    adminLogin: "管理者ログイン",
    loginAs: "としてログイン",
    features: {
      title: "生徒のための特別な機能",
      reservation: "簡単なレッスン予約",
      materials: "レッスン資料管理",
      progress: "学習進捗追跡",
      communication: "先生とのコミュニケーション",
    },
    stats: {
      students: "活発な生徒",
      classes: "完了したレッスン",
      satisfaction: "平均満足度",
    },
    benefits: {
      title: "教室で学ぶ生徒たちの特別なメリット",
      subtitle: "このシステムを使うことで得られるメリット",
      items: [
        "24時間いつでも学習可能",
        "個別の学習進捗管理",
        "専門講師による質の高い指導",
        "柔軟なスケジュール調整",
        "豊富な学習リソース",
        "リアルタイムでのフィードバック",
      ],
    },
    cta: {
      title: "今すぐ始めましょう！",
      subtitle: "専門の先生たちと一緒に楽しい韓国語学習",
      button: "ログイン",
    },
  },
  ko: {
    title: "한국어교실MalMoi",
    subtitle: "스마트한 한국어 학습을 시작하세요",
    description: "교실에서 수업을 듣는 학생들을 위한 디지털 플랫폼",
    emailLabel: "이메일 주소 또는 학번",
    emailPlaceholder: "이메일 또는 학번을 입력하세요",
    emailHelp: "이메일 주소 또는 학번(예: 2501150114)으로 로그인하세요",
    passwordLabel: "비밀번호",
    passwordPlaceholder: "비밀번호를 입력하세요",
    loginButton: "로그인",
    registerButton: "입회하기",
    forgotPassword: "비밀번호를 잊으셨나요",
    orText: "또는",
    loginWith: "로 로그인",
    noAccount: "계정이 없으신가요",
    haveAccount: "이미 계정이 있으신가요",
    studentLogin: "학생 로그인",
    parentLogin: "학부모 로그인",
    employeeLogin: "직원 로그인",
    teacherLogin: "선생님 로그인",
    adminLogin: "관리자 로그인",
    loginAs: "으로 로그인",
    features: {
      title: "학생들을 위한 특별한 기능",
      reservation: "간편한 수업 예약",
      materials: "수업 자료 관리",
      progress: "학습 진도 추적",
      communication: "선생님과의 소통",
    },
    stats: {
      students: "활발한 학생들",
      classes: "완료된 수업",
      satisfaction: "평균 만족도",
    },
    benefits: {
      title: "교실에서 수강하는 학생들의 특별한 혜택",
      subtitle: "이 시스템을 쓰면 얻을 수 있는 메리트",
      items: [
        "24시간 언제든지 학습 가능",
        "개별 학습 진도 관리",
        "전문 강사의 질 높은 지도",
        "유연한 스케줄 조정",
        "풍부한 학습 리소스",
        "실시간 피드백",
      ],
    },
    cta: {
      title: "지금 시작해보세요!",
      subtitle: "전문 선생님들과 함께하는 재미있는 한국어 학습",
      button: "로그인",
    },
  },
};

export default function LoginPage() {
  const router = useRouter();
  const { language, toggleLanguage } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [testResult, setTestResult] = useState("");

  const t = translations[language];

  // 컴포넌트 마운트 확인
  useEffect(() => {
    console.log("=== LoginPage 컴포넌트 마운트됨 ===");
    console.log("브라우저:", navigator.userAgent);
    console.log("현재 URL:", window.location.href);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("=== 로그인 버튼 클릭됨 ===");
    
    // 입력 검증
    if (!email || !password) {
      console.log("입력 검증 실패: 이메일 또는 비밀번호가 비어있음");
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    
    console.log("로딩 상태 시작");
    setIsLoading(true);
    setError("");

    try {
      console.log("=== 로그인 API 호출 시작 ===");
      console.log("요청 데이터:", { email: email.substring(0, 3) + "***", hasPassword: !!password });
      
      const apiUrl = "/api/auth/login";
      console.log("API URL:", apiUrl);
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 쿠키를 포함하여 전송
        body: JSON.stringify({ email, password }),
      });

      console.log("=== 응답 받음 ===");
      console.log("응답 상태:", response.status, response.statusText);
      console.log("응답 헤더:", {
        contentType: response.headers.get("content-type"),
        status: response.status,
        statusText: response.statusText
      });
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          errorData = { 
            message: `서버 오류 (${response.status}): ${response.statusText}`,
            error: "SERVER_ERROR"
          };
        }
        console.error("로그인 오류:", errorData);
        setError(errorData.message || errorData.error || "로그인 중 오류가 발생했습니다.");
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      console.log("로그인 성공:", data);
      console.log("응답 헤더:", {
        cookies: response.headers.get("set-cookie"),
        contentType: response.headers.get("content-type")
      });
      
      // API에서 반환한 redirectUrl을 우선 사용
      let redirectUrl = data.redirectUrl;
      
      // 사용자 역할 확인 (쿠키와 응답 데이터 모두 확인)
      const userRole = data.user?.role;
      console.log("로그인 응답 데이터:", {
        success: data.success,
        userRole: userRole,
        isFirstLogin: data.isFirstLogin,
        mustChangePassword: data.mustChangePassword,
        redirectUrl: redirectUrl
      });
      
      // redirectUrl이 없으면 사용자 역할에 따른 기본 리다이렉트
      if (!redirectUrl && data.success && data.user && userRole) {
        switch (userRole) {
          case "ADMIN":
          case "MASTER":
            redirectUrl = "/admin/dashboard";
            break;
          case "TEACHER":
            redirectUrl = "/teacher/dashboard";
            break;
          case "STUDENT":
            redirectUrl = "/student/dashboard";
            break;
          case "PARENT":
            redirectUrl = "/parent/dashboard";
            break;
          case "EMPLOYEE":
            redirectUrl = "/employee/dashboard";
            break;
          case "STAFF":
            redirectUrl = "/staff/dashboard";
            break;
          default:
            redirectUrl = "/admin/dashboard"; // 기본값
        }
      }
      
      // redirectUrl이 여전히 없으면 기본값
      if (!redirectUrl) {
        redirectUrl = "/admin/dashboard";
      }
      
      console.log(`최종 리다이렉트 URL: ${redirectUrl} (사용자 역할: ${userRole})`);
      
      // 쿠키가 설정될 시간을 주기 위해 약간의 딜레이 추가
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 쿠키 확인
      const userCookie = document.cookie.split('; ').find(row => row.startsWith('user='));
      if (userCookie) {
        try {
          const cookieUserData = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
          console.log("쿠키에 저장된 사용자 정보:", cookieUserData);
        } catch (e) {
          console.error("쿠키 파싱 오류:", e);
        }
      }
      
      // 강제로 페이지 이동 (쿠키가 설정된 후)
      window.location.href = redirectUrl;
    } catch (error) {
      console.error("로그인 네트워크 오류:", error);
      let errorMessage = "로그인 중 오류가 발생했습니다.";
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = "서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    router.push("/enrollment");
  };

  const testApiConnection = async () => {
    try {
      setTestResult("테스트 중...");
      
      const response = await fetch("/api/test-simple", {
        method: "GET",
      });
      
      if (response.ok) {
        const data = await response.json();
        setTestResult(`API 연결 성공: ${JSON.stringify(data, null, 2)}`);
      } else {
        setTestResult(`API 연결 실패: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setTestResult(`API 연결 오류: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            {t.subtitle}
          </h2>
          <p className="text-gray-600">{t.description}</p>

          {/* Language Toggle */}
          <div className="mt-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 mx-auto"
            >
              <Languages className="w-4 h-4" />
              {language === "ja" ? "한국어" : "日本語"}
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t.emailLabel}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="text"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t.emailPlaceholder}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {t.emailHelp}
              </p>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t.passwordLabel}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t.passwordPlaceholder}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                onClick={(e) => {
                  console.log("=== 버튼 클릭 이벤트 발생 ===");
                  // form submit은 자동으로 처리되지만, 명시적으로 확인
                }}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <span>{t.loginButton}</span>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="my-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{t.orText}</span>
              </div>
            </div>
          </div>

          {/* Register Button */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">{t.noAccount}</p>
            <button
              onClick={handleRegister}
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <UserPlus className="w-4 h-4" />
              {t.registerButton}
            </button>
          </div>
        </div>

        {/* Quick Login Options */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            {language === "ja" ? "クイックログイン" : "빠른 로그인"}
          </h3>

          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => {
                setEmail("student@example.com");
                setPassword("password123");
              }}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-900">{t.studentLogin}</span>
            </button>

            <button
              onClick={() => {
                setEmail("parent@example.com");
                setPassword("password123");
              }}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <User className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-900">{t.parentLogin}</span>
            </button>

            <button
              onClick={() => {
                setEmail("employee@example.com");
                setPassword("password123");
              }}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Building className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-900">{t.employeeLogin}</span>
            </button>

            <button
              onClick={() => {
                setEmail("teacher@example.com");
                setPassword("password123");
              }}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <GraduationCap className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-gray-900">{t.teacherLogin}</span>
            </button>

            <button
              onClick={() => {
                setEmail("admin@example.com");
                setPassword("password123");
              }}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Shield className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-gray-900">{t.adminLogin}</span>
            </button>
          </div>
        </div>

        {/* Features Preview */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            {t.features.title}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-xs text-gray-600">{t.features.reservation}</p>
            </div>

            <div className="text-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <GraduationCap className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-xs text-gray-600">{t.features.materials}</p>
            </div>

            <div className="text-center">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-xs text-gray-600">{t.features.progress}</p>
            </div>

            <div className="text-center">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Mail className="w-4 h-4 text-orange-600" />
              </div>
              <p className="text-xs text-gray-600">
                {t.features.communication}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 text-center shadow-lg">
            <div className="text-2xl font-bold text-blue-600">500+</div>
            <div className="text-xs text-gray-600">{t.stats.students}</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-lg">
            <div className="text-2xl font-bold text-green-600">1,200+</div>
            <div className="text-xs text-gray-600">{t.stats.classes}</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-lg">
            <div className="text-2xl font-bold text-purple-600">4.9</div>
            <div className="text-xs text-gray-600">{t.stats.satisfaction}</div>
          </div>
        </div>

        {/* Benefits Preview */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            {t.benefits.title}
          </h3>
          <ul className="space-y-3 text-gray-700 text-sm">
            {t.benefits.items.map((item, index) => (
              <li key={index} className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-2">{t.cta.title}</h3>
          <p className="text-lg mb-4">{t.cta.subtitle}</p>
          <button
            onClick={() => router.push("/auth/register")}
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-blue-800 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            {t.cta.button}
          </button>
        </div>

        {/* API 테스트 버튼 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={testApiConnection}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            API 연결 테스트
          </button>
          {testResult && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs">
              <pre className="whitespace-pre-wrap">{testResult}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

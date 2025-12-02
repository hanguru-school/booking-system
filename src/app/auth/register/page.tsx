"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Mail,
  Lock,
  Eye,
  EyeOff,
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
    emailLabel: "メールアドレス",
    emailPlaceholder: "your.email@example.com",
    passwordLabel: "パスワード",
    passwordPlaceholder: "パスワードを入力してください",
    confirmPasswordLabel: "パスワード確認",
    confirmPasswordPlaceholder: "パスワードを再入力してください",
    kanjiNameLabel: "漢字名",
    kanjiNamePlaceholder: "田中太郎",
    yomiganaLabel: "よみがな",
    yomiganaPlaceholder: "たなかたろう",
    koreanNameLabel: "韓国語名（オプション）",
    koreanNamePlaceholder: "김철수",
    phoneLabel: "電話番号（オプション）",
    phonePlaceholder: "090-1234-5678",
    roleLabel: "アカウントタイプ",
    studentRole: "生徒",
    teacherRole: "先生",
    staffRole: "スタッフ",
    parentRole: "保護者",
    adminRole: "管理者",
    registerButton: "入会申し込み",
    loginButton: "ログイン",
    alreadyHaveAccount: "すでにアカウントをお持ちの方",
    noAccount: "アカウントをお持ちでない方",
    features: {
      title: "生徒のための特別な機能",
      reservation: "簡単なレッスン予約",
      materials: "レッスン資料管理",
      progress: "学習進捗追跡",
      communication: "先生とのコミュニケーション",
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
  },
  ko: {
    title: "한국어교실MalMoi",
    subtitle: "스마트한 한국어 학습을 시작하세요",
    description: "교실에서 수업을 듣는 학생들을 위한 디지털 플랫폼",
    emailLabel: "이메일 주소",
    emailPlaceholder: "your.email@example.com",
    passwordLabel: "비밀번호",
    passwordPlaceholder: "비밀번호를 입력하세요",
    confirmPasswordLabel: "비밀번호 확인",
    confirmPasswordPlaceholder: "비밀번호를 다시 입력하세요",
    kanjiNameLabel: "한자 이름",
    kanjiNamePlaceholder: "田中太郎",
    yomiganaLabel: "요미가나",
    yomiganaPlaceholder: "たなかたろう",
    koreanNameLabel: "한국어 이름 (선택사항)",
    koreanNamePlaceholder: "김철수",
    phoneLabel: "전화번호 (선택사항)",
    phonePlaceholder: "090-1234-5678",
    roleLabel: "계정 유형",
    studentRole: "학생",
    teacherRole: "선생님",
    staffRole: "직원",
    parentRole: "학부모",
    adminRole: "관리자",
    registerButton: "입회하기",
    loginButton: "로그인",
    alreadyHaveAccount: "이미 계정이 있으신가요",
    noAccount: "계정이 없으신가요",
    features: {
      title: "학생들을 위한 특별한 기능",
      reservation: "간편한 수업 예약",
      materials: "수업 자료 관리",
      progress: "학습 진도 추적",
      communication: "선생님과의 소통",
    },
    benefits: {
      title: "교실에서 공부하는 학생들의 특별한 혜택",
      subtitle: "이 시스템을 사용하면 얻을 수 있는 혜택",
      items: [
        "24시간 언제든지 학습 가능",
        "개별 학습 진도 관리",
        "전문 강사의 고품질 지도",
        "유연한 스케줄 조정",
        "풍부한 학습 자료",
        "실시간 피드백",
      ],
    },
  },
};

export default function RegisterPage() {
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language as keyof typeof translations];
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    kanjiName: "",
    yomigana: "",
    koreanName: "",
    phone: "",
    role: "STUDENT",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      setIsLoading(false);
      return;
    }

    // 필수 필드 검증
    if (!formData.email || !formData.password || !formData.kanjiName || !formData.yomigana) {
      setError("필수 항목을 모두 입력해주세요.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "회원가입 중 오류가 발생했습니다.");
        return;
      }

      // 성공 시 해당 역할의 페이지로 리다이렉트
      if (data.success && data.user) {
        const userRole = data.user.role;
        let redirectUrl = "/";
        
        switch (userRole) {
          case "ADMIN":
            redirectUrl = "/admin";
            break;
          case "TEACHER":
            redirectUrl = "/teacher";
            break;
          case "STUDENT":
            redirectUrl = "/student";
            break;
          case "PARENT":
            redirectUrl = "/parent";
            break;
          case "STAFF":
            redirectUrl = "/staff";
            break;
          default:
            redirectUrl = "/admin";
        }
        
        console.log(`사용자 역할: ${userRole}, 리다이렉트: ${redirectUrl}`);
        window.location.href = redirectUrl;
      }
    } catch (error) {
      console.error("회원가입 오류:", error);
      setError("회원가입 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
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

        {/* Register Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                {t.roleLabel}
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="STUDENT">{t.studentRole}</option>
                <option value="TEACHER">{t.teacherRole}</option>
                <option value="STAFF">{t.staffRole}</option>
                <option value="PARENT">{t.parentRole}</option>
                <option value="ADMIN">{t.adminRole}</option>
              </select>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t.emailLabel}
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={t.emailPlaceholder}
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t.passwordLabel}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={t.passwordPlaceholder}
                  className="w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                {t.confirmPasswordLabel}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder={t.confirmPasswordPlaceholder}
                  className="w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Kanji Name */}
            <div>
              <label htmlFor="kanjiName" className="block text-sm font-medium text-gray-700 mb-2">
                {t.kanjiNameLabel}
              </label>
              <input
                type="text"
                id="kanjiName"
                name="kanjiName"
                value={formData.kanjiName}
                onChange={handleInputChange}
                placeholder={t.kanjiNamePlaceholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Yomigana */}
            <div>
              <label htmlFor="yomigana" className="block text-sm font-medium text-gray-700 mb-2">
                {t.yomiganaLabel}
              </label>
              <input
                type="text"
                id="yomigana"
                name="yomigana"
                value={formData.yomigana}
                onChange={handleInputChange}
                placeholder={t.yomiganaPlaceholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Korean Name */}
            <div>
              <label htmlFor="koreanName" className="block text-sm font-medium text-gray-700 mb-2">
                {t.koreanNameLabel}
              </label>
              <input
                type="text"
                id="koreanName"
                name="koreanName"
                value={formData.koreanName}
                onChange={handleInputChange}
                placeholder={t.koreanNamePlaceholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                {t.phoneLabel}
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder={t.phonePlaceholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? "처리 중..." : t.registerButton}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {t.alreadyHaveAccount}?{" "}
              <button
                onClick={() => router.push("/auth/login")}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {t.loginButton}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

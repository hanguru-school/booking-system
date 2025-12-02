"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Globe, ArrowLeft, CheckCircle, XCircle } from "lucide-react";

interface Translations {
  title: string;
  subtitle: string;
  description: string;
  lineLoginButton: string;
  lineRegisterButton: string;
  backToLogin: string;
  successMessage: string;
  errorMessage: string;
  loadingMessage: string;
  termsText: string;
  privacyText: string;
  agreeText: string;
}

export default function LineRegisterPage() {
  const [currentLanguage, setCurrentLanguage] = useState<"ko" | "ja">("ko");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const router = useRouter();

  // 번역 텍스트
  const translations: Record<"ko" | "ja", Translations> = {
    ko: {
      title: "LINE으로 입회하기",
      subtitle: "MalMoi 한국어 학습 플랫폼에 오신 것을 환영합니다",
      description:
        "LINE 계정으로 간편하게 입회하고 한국어 학습을 시작하세요.",
      lineLoginButton: "LINE으로 로그인",
      lineRegisterButton: "LINE으로 입회하기",
      backToLogin: "로그인으로 돌아가기",
      successMessage: "입회가 성공적으로 완료되었습니다!",
      errorMessage: "입회 중 오류가 발생했습니다.",
      loadingMessage: "처리 중입니다...",
      termsText: "이용약관",
      privacyText: "개인정보처리방침",
      agreeText: "이용약관 및 개인정보처리방침에 동의합니다",
    },
    ja: {
      title: "LINEで入会申し込み",
      subtitle: "MalMoi韓国語学習プラットフォームへようこそ",
      description:
        "LINEアカウントで簡単に入会申し込みして韓国語学習を始めましょう。",
      lineLoginButton: "LINEでログイン",
      lineRegisterButton: "LINEで入会申し込み",
      backToLogin: "ログインに戻る",
      successMessage: "入会申し込みが正常に完了しました！",
      errorMessage: "入会申し込み中にエラーが発生しました。",
      loadingMessage: "処理中です...",
      termsText: "利用規約",
      privacyText: "プライバシーポリシー",
      agreeText: "利用規約およびプライバシーポリシーに同意します",
    },
  };

  const t = translations[currentLanguage];

  // 언어 전환 함수
  const toggleLanguage = () => {
    setCurrentLanguage(currentLanguage === "ko" ? "ja" : "ko");
  };

  // URL 파라미터에서 메시지 확인
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const successParam = urlParams.get("success");
    const errorParam = urlParams.get("error");
    const messageParam = urlParams.get("message");

    if (successParam && messageParam) {
      setSuccessMessage(decodeURIComponent(messageParam));
      setTimeout(() => setSuccessMessage(""), 5000);
    }

    if (errorParam && messageParam) {
      setErrorMessage(decodeURIComponent(messageParam));
      setTimeout(() => setErrorMessage(""), 5000);
    }
  }, []);

  // LINE 회원가입 처리
  const handleLineRegister = async () => {
    if (!agreedToTerms) {
      setErrorMessage(
        currentLanguage === "ko"
          ? "이용약관에 동의해주세요."
          : "利用規約に同意してください。",
      );
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      // 환경변수 확인
      const clientId = process.env.NEXT_PUBLIC_LINE_CLIENT_ID;
      const redirectUri = process.env.NEXT_PUBLIC_LINE_REDIRECT_URI;

      if (!clientId || !redirectUri) {
        setErrorMessage(
          currentLanguage === "ko"
            ? "LINE 연동 설정이 완료되지 않았습니다. 관리자에게 문의해주세요."
            : "LINE連携の設定が完了していません。管理者にお問い合わせください。",
        );
        setLoading(false);
        return;
      }

      // LINE 로그인 URL로 리다이렉션 (회원가입 모드)
      const lineLoginUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=register_${Math.random().toString(36).substring(7)}&scope=profile%20openid`;

      window.location.href = lineLoginUrl;
    } catch (error) {
      console.error("LINE 회원가입 오류:", error);
      setErrorMessage(t.errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* 언어 전환 버튼 */}
        <div className="absolute top-4 right-4">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title={
              currentLanguage === "ko" ? "日本語に切り替え" : "한국어로 전환"
            }
          >
            <Globe className="w-4 h-4" />
            <span className="text-xs font-medium">
              {currentLanguage === "ko" ? "🇯🇵" : "🇰🇷"}
            </span>
          </button>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {t.title}
          </h2>
          <p className="mt-2 text-sm text-gray-600">{t.subtitle}</p>
          <p className="mt-4 text-sm text-gray-500">{t.description}</p>
        </div>

        {/* 이용약관 동의 */}
        <div className="space-y-4">
          <div className="flex items-start">
            <input
              id="terms"
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
              <span>{t.agreeText}</span>
              <div className="mt-1 space-x-2">
                <Link
                  href="/terms"
                  className="text-blue-600 hover:text-blue-500 underline"
                >
                  {t.termsText}
                </Link>
                <span>•</span>
                <Link
                  href="/privacy"
                  className="text-blue-600 hover:text-blue-500 underline"
                >
                  {t.privacyText}
                </Link>
              </div>
            </label>
          </div>
        </div>

        {/* LINE 회원가입 버튼 */}
        <div>
          <button
            onClick={handleLineRegister}
            disabled={loading || !agreedToTerms}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {t.loadingMessage}
              </div>
            ) : (
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                </svg>
                {t.lineRegisterButton}
              </div>
            )}
          </button>
        </div>

        {/* 기존 로그인 링크 */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            <Link
              href="/auth/login"
              className="font-medium text-gray-600 hover:text-gray-500 flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              {t.backToLogin}
            </Link>
          </p>
        </div>

        {/* 성공 메시지 */}
        {successMessage && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            {successMessage}
          </div>
        )}

        {/* 에러 메시지 */}
        {errorMessage && (
          <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center">
            <XCircle className="w-4 h-4 mr-2" />
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}

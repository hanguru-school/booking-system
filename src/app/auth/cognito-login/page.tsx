"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle, Info } from "lucide-react";
import { createOAuthUrl, validateCognitoConfig } from "@/lib/cognito-provider";

function CognitoLoginContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorDescription, setErrorDescription] = useState("");
  const [configValid, setConfigValid] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case "config_error":
        return "Cognito 설정이 유효하지 않습니다.";
      case "oauth_error":
        return "OAuth 인증 중 오류가 발생했습니다.";
      case "no_code":
        return "인증 코드를 받지 못했습니다.";
      case "token_error":
        return "토큰 교환 중 오류가 발생했습니다.";
      case "no_id_token":
        return "ID 토큰을 받지 못했습니다.";
      case "email_not_verified":
        return "이메일이 인증되지 않았습니다. 이메일을 확인하여 계정을 활성화해주세요.";
      case "callback_error":
        return "콜백 처리 중 오류가 발생했습니다.";
      case "processing":
        return "처리 중입니다. 잠시만 기다려주세요.";
      default:
        return "알 수 없는 오류가 발생했습니다.";
    }
  };

  // URL 파라미터에서 오류 메시지 확인
  useEffect(() => {
    const errorParam = searchParams.get("error");
    const descriptionParam = searchParams.get("description");

    if (errorParam) {
      setError(getErrorMessage(errorParam));
      if (descriptionParam) {
        setErrorDescription(decodeURIComponent(descriptionParam));
      }
    }
  }, [searchParams]);

  // Cognito 설정 검증
  useEffect(() => {
    setConfigValid(validateCognitoConfig());
  }, []);

  const handleCognitoLogin = async () => {
    setIsLoading(true);
    setError("");
    setErrorDescription("");

    try {
      console.log("Cognito 로그인 시작...");

      // 설정 검증
      if (!configValid) {
        setError("Cognito 설정이 유효하지 않습니다.");
        setIsLoading(false);
        return;
      }

      // OAuth URL 생성
      const cognitoUrl = createOAuthUrl();
      console.log("Cognito OAuth URL:", cognitoUrl);

      // Cognito 로그인 페이지로 리다이렉트
      window.location.href = cognitoUrl;
    } catch (error: any) {
      console.error("Cognito 로그인 오류:", error);
      setError(error.message || "Cognito 로그인 중 오류가 발생했습니다.");
      setIsLoading(false);
    }
  };

  const handleDatabaseLogin = () => {
    router.push("/auth/login");
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  const handleRetry = () => {
    setError("");
    setErrorDescription("");
    handleCognitoLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            AWS Cognito 로그인
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            안전하고 안정적인 AWS Cognito 인증을 사용하세요
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {/* 설정 상태 표시 */}
          <div
            className={`p-4 rounded-lg border ${
              configValid
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center">
              {configValid ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              )}
              <span className="text-sm font-medium">
                {configValid ? "Cognito 설정 정상" : "Cognito 설정 오류"}
              </span>
            </div>
          </div>

          {/* 오류 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">{error}</p>
                  {errorDescription && (
                    <p className="mt-1 text-xs text-red-600">
                      {errorDescription}
                    </p>
                  )}
                  <button
                    onClick={handleRetry}
                    className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                  >
                    다시 시도
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 로그인 버튼들 */}
          <div className="space-y-4">
            <button
              onClick={handleCognitoLogin}
              disabled={isLoading || !configValid}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  AWS Cognito로 로그인 중...
                </>
              ) : (
                "AWS Cognito로 로그인"
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-500">
                  또는
                </span>
              </div>
            </div>

            <button
              onClick={handleDatabaseLogin}
              className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              데이터베이스 로그인
            </button>

            <button
              onClick={handleBackToHome}
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-500 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>

        {/* 설정 정보 */}
        <div className="mt-8 bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center mb-3">
            <Info className="h-4 w-4 text-blue-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-900">
              Cognito 설정 정보
            </h3>
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            <div>
              <strong>User Pool:</strong> malmoi-system-pool
            </div>
            <div>
              <strong>User Pool ID:</strong> ap-northeast-1_5R7g8tN40
            </div>
            <div>
              <strong>App Client:</strong> malmoi-system
            </div>
            <div>
              <strong>Client ID:</strong> 4bdn0n9r92huqpcs21e0th1nve
            </div>
            <div>
              <strong>Region:</strong> ap-northeast-1 (Tokyo)
            </div>
            <div>
              <strong>Callback URL:</strong>{" "}
              https://app.hanguru.school/api/auth/callback/cognito
            </div>
            <div>
              <strong>OAuth Scopes:</strong> openid email profile phone
            </div>
          </div>
        </div>

        {/* 문제 해결 가이드 */}
        <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center mb-2">
            <Info className="h-4 w-4 text-blue-500 mr-2" />
            <h3 className="text-sm font-medium text-blue-900">문제 해결</h3>
          </div>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• 브라우저에서 팝업 차단을 해제해주세요</li>
            <li>• 쿠키가 활성화되어 있는지 확인해주세요</li>
            <li>• 네트워크 연결을 확인해주세요</li>
            <li>• AWS Cognito 콘솔에서 설정을 확인해주세요</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function CognitoLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="text-center">
            <Loader2 className="animate-spin h-8 w-8 mx-auto text-blue-600" />
            <p className="mt-2 text-gray-600">로딩 중...</p>
          </div>
        </div>
      }
    >
      <CognitoLoginContent />
    </Suspense>
  );
}

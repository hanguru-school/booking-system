"use client";

import { useState } from "react";
import { User, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react";

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
}

export default function TestTaggingPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const testEmployeeTagging = async () => {
    setIsLoading(true);
    try {
      const mockUid =
        "EMP" + Math.random().toString(36).substr(2, 4).toUpperCase();
      const timestamp = new Date().toISOString();

      const response = await fetch("/api/tagging/employee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: mockUid,
          timestamp: timestamp,
          type: "teacher",
        }),
      });

      const result = await response.json();

      setTestResults((prev) => [
        ...prev,
        {
          success: result.success,
          message: result.message || "테스트 완료",
          data: result,
        },
      ]);
    } catch (error) {
      setTestResults((prev) => [
        ...prev,
        {
          success: false,
          message: "API 호출 중 오류 발생",
          data: error,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const testStudentTagging = async () => {
    setIsLoading(true);
    try {
      const mockUid =
        "STU" + Math.random().toString(36).substr(2, 4).toUpperCase();
      const timestamp = new Date().toISOString();

      const response = await fetch("/api/tagging/student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: mockUid,
          timestamp: timestamp,
        }),
      });

      const result = await response.json();

      setTestResults((prev) => [
        ...prev,
        {
          success: result.success,
          message: result.message || "테스트 완료",
          data: result,
        },
      ]);
    } catch (error) {
      setTestResults((prev) => [
        ...prev,
        {
          success: false,
          message: "API 호출 중 오류 발생",
          data: error,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const testLogsAPI = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/tagging/logs");
      const result = await response.json();

      setTestResults((prev) => [
        ...prev,
        {
          success: result.success,
          message: `로그 조회 완료 (${result.logs?.length || 0}개)`,
          data: result,
        },
      ]);
    } catch (error) {
      setTestResults((prev) => [
        ...prev,
        {
          success: false,
          message: "로그 API 호출 중 오류 발생",
          data: error,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            태깅 API 테스트
          </h1>
          <p className="text-lg text-gray-600">
            태깅 시스템 API를 테스트할 수 있습니다
          </p>
        </div>

        {/* 테스트 버튼들 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={testEmployeeTagging}
            disabled={isLoading}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <User className="w-5 h-5" />
            직원 태깅 테스트
          </button>

          <button
            onClick={testStudentTagging}
            disabled={isLoading}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Clock className="w-5 h-5" />
            학생 태깅 테스트
          </button>

          <button
            onClick={testLogsAPI}
            disabled={isLoading}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="w-5 h-5" />
            로그 API 테스트
          </button>
        </div>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="flex items-center justify-center gap-3 mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-blue-600 font-medium">API 호출 중...</span>
          </div>
        )}

        {/* 결과 표시 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">
              테스트 결과
            </h2>
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              결과 지우기
            </button>
          </div>

          {testResults.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              테스트를 실행하면 결과가 여기에 표시됩니다
            </div>
          ) : (
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.success
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span
                      className={`font-medium ${
                        result.success ? "text-green-800" : "text-red-800"
                      }`}
                    >
                      {result.message}
                    </span>
                  </div>

                  {result.data && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                        상세 데이터 보기
                      </summary>
                      <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

export default function TestCognitoPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const testCognitoLogin = async () => {
    setLoading(true);
    setResult("Cognito 로그인 테스트 중...");

    try {
      const response = await fetch("/api/auth/cognito-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      setResult(
        `Status: ${response.status}\nResponse: ${JSON.stringify(data, null, 2)}`,
      );

      if (data.success) {
        // 로그인 성공 시 역할에 맞는 페이지로 리다이렉트
        const userRole = data.user.role;
        setTimeout(() => {
          switch (userRole) {
            case "STUDENT":
              window.location.href = "/student/home";
              break;
            case "PARENT":
              window.location.href = "/parent/home";
              break;
            case "TEACHER":
              window.location.href = "/teacher/home";
              break;
            case "STAFF":
              window.location.href = "/staff/home";
              break;
            case "ADMIN":
              window.location.href = "/admin/home";
              break;
            default:
              window.location.href = "/student/home";
          }
        }, 2000);
      }
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testCognitoSession = async () => {
    setLoading(true);
    setResult("Cognito 세션 테스트 중...");

    try {
      const response = await fetch("/api/auth/cognito-session");
      const data = await response.json();
      setResult(
        `Status: ${response.status}\nResponse: ${JSON.stringify(data, null, 2)}`,
      );
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Cognito 로그인 테스트</h1>

        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Cognito에 등록된 이메일"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Cognito에 등록된 비밀번호"
            />
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={testCognitoLogin}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "테스트 중..." : "Cognito 로그인 테스트"}
          </button>

          <button
            onClick={testCognitoSession}
            disabled={loading}
            className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? "테스트 중..." : "Cognito 세션 테스트"}
          </button>
        </div>

        <div className="mt-4">
          <h2 className="font-semibold mb-2">결과:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-64">
            {result}
          </pre>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <p>
            <strong>참고:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Cognito User Pool: malmoi-system-pool</li>
            <li>Cognito User Pool ID: ap-northeast-2_5R7g8tN40</li>
            <li>Cognito App Client: malmoi-system</li>
            <li>Cognito Client ID: 66f1hn1q3c8b4fri0o3feifmpd</li>
            <li>Region: ap-northeast-2 (Seoul)</li>
            <li>
              OAuth Callback URL:
              https://app.hanguru.school/api/auth/callback/cognito
            </li>
            <li>OAuth Scopes: email openid phone</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

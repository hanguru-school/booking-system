"use client";

import { useState } from "react";

export default function TestLoginPage() {
  const [email, setEmail] = useState("student@test.com");
  const [password, setPassword] = useState("student1234");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult("로그인 테스트 중...");

    try {
      const response = await fetch("/api/auth/login/", {
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

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">로그인 테스트</h1>

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
            />
          </div>
        </div>

        <button
          onClick={testLogin}
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "테스트 중..." : "로그인 테스트"}
        </button>

        <div className="mt-4">
          <h2 className="font-semibold mb-2">결과:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-64">
            {result}
          </pre>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

export default function TestPage() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setResult("테스트 중...");

    try {
      const response = await fetch("/api/auth/simple-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "hanguru.school@gmail.com",
          password: "Alfl1204!",
        }),
      });

      const data = await response.text();
      setResult(`Status: ${response.status}\nResponse: ${data}`);
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">API 테스트</h1>

        <button
          onClick={testAPI}
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "테스트 중..." : "API 테스트"}
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

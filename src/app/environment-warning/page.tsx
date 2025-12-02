"use client";

import { useEffect } from "react";
import { getProductionUrl } from "@/lib/environment-utils";

export default function EnvironmentWarningPage() {
  useEffect(() => {
    // 5초 후 운영 서버로 리다이렉트
    const timer = setTimeout(() => {
      window.location.href = getProductionUrl();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-red-600 text-white flex items-center justify-center z-50">
      <div className="text-center p-8 max-w-2xl">
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="text-3xl font-bold mb-4">環境警告</h1>
        <div className="text-xl mb-6 leading-relaxed">
          現在の環境はテスト用のため、正式な動作を保証していません。
        </div>
        <div className="text-lg mb-8">
          必ず <strong>https://app.hanguru.school</strong> を使用してください。
        </div>
        <div className="text-sm opacity-75">
          5秒後に自動的に正しい環境にリダイレクトされます...
        </div>
        <div className="mt-8">
          <button
            onClick={() => (window.location.href = getProductionUrl())}
            className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            今すぐ移動
          </button>
        </div>
      </div>
    </div>
  );
}

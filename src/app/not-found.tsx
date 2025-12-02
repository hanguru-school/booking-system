"use client";

import Link from "next/link";
import { Search, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            페이지를 찾을 수 없습니다
          </h1>
          <p className="text-gray-600 mb-6">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            홈으로 돌아가기
          </Link>

          <button
            onClick={() => window.history.back()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            이전 페이지로
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">자주 방문하는 페이지</p>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/student/home"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              학생 홈
            </Link>
            <Link
              href="/parent/home"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              학부모 홈
            </Link>
            <Link
              href="/teacher/home"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              선생님 홈
            </Link>
            <Link
              href="/admin/home"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              관리자 홈
            </Link>
            <Link
              href="/tagging/home"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              태깅 시스템
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

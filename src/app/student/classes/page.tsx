"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function StudentClassesPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/student/home"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>홈으로 돌아가기</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">수업 현황</h1>
        <p className="text-gray-600">수업 정보가 여기에 표시됩니다.</p>
      </div>
    </div>
  );
}

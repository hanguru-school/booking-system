"use client";

import { useState } from "react";
import { Calendar, FileText } from "lucide-react";

export default function YearEndPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">연말 정산</h1>
          <p className="text-lg text-gray-600 mt-2">
            연말 정산에 제출할 수 있는 형식으로 정리하고 관리합니다.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-gray-600">연말 정산 페이지입니다.</p>
        </div>
      </div>
    </div>
  );
}


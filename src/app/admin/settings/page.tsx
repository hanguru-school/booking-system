"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Settings, BookOpen, Clock, Users } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
      {/* 헤더 */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-gray-700" />
            <h1 className="text-2xl font-bold text-gray-900">설정</h1>
        </div>
      </div>

        {/* 설정 메뉴 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 코스 설정 */}
          <Link
            href="/admin/settings/courses"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
                <h2 className="text-lg font-semibold text-gray-900">코스 설정</h2>
                <p className="text-sm text-gray-600 mt-1">
                  예약에 사용할 코스명을 관리합니다
                </p>
            </div>
            </div>
          </Link>

          {/* 수강시간 설정 */}
          <Link
            href="/admin/settings/durations"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">수강시간 설정</h2>
                <p className="text-sm text-gray-600 mt-1">
                  예약에 사용할 수강 시간을 관리합니다
                </p>
              </div>
            </div>
          </Link>

          {/* 수업형태 관리 */}
          <Link
            href="/admin/settings/lesson-types"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
          </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">수업형태 관리</h2>
                <p className="text-sm text-gray-600 mt-1">
                  예약에 사용할 수업형태를 관리합니다
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

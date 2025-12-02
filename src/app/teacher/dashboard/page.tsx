"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface TeacherStats {
  totalClasses: number;
  completedClasses: number;
  upcomingClasses: number;
  totalStudents: number;
}

interface RecentClass {
  id: string;
  date: string;
  time: string;
  student: string;
  subject: string;
  status: "completed" | "upcoming" | "cancelled";
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<TeacherStats>({
    totalClasses: 0,
    completedClasses: 0,
    upcomingClasses: 0,
    totalStudents: 0,
  });
  const [recentClasses, setRecentClasses] = useState<RecentClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 실제 API 호출로 대체 예정
      setStats({
        totalClasses: 45,
        completedClasses: 38,
        upcomingClasses: 7,
        totalStudents: 12,
      });

      setRecentClasses([
        {
          id: "1",
          date: "2025-08-01",
          time: "10:00-11:30",
          student: "김학생",
          subject: "일본어 회화",
          status: "upcoming",
        },
        {
          id: "2",
          date: "2025-07-29",
          time: "14:00-15:30",
          student: "이학생",
          subject: "일본어 문법",
          status: "completed",
        },
        {
          id: "3",
          date: "2025-07-25",
          time: "16:00-17:30",
          student: "박학생",
          subject: "일본어 읽기",
          status: "completed",
        },
      ]);
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            선생님 대시보드
          </h1>
          <p className="text-gray-600">수업 일정과 학생 관리를 확인하세요.</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">📚</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 수업</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalClasses}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">완료된 수업</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.completedClasses}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-2xl">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">예정된 수업</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.upcomingClasses}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 학생</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalStudents}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 빠른 액션 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              수업 일정
            </h3>
            <p className="text-gray-600 mb-4">오늘의 수업 일정을 확인하세요.</p>
            <button
              onClick={() => router.push("/teacher/schedule")}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              일정 보기
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              학생 관리
            </h3>
            <p className="text-gray-600 mb-4">담당 학생들을 관리하세요.</p>
            <button
              onClick={() => router.push("/teacher/students")}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              학생 목록
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              레슨 노트
            </h3>
            <p className="text-gray-600 mb-4">
              수업 노트를 작성하고 관리하세요.
            </p>
            <button
              onClick={() => router.push("/teacher/notes")}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              노트 작성
            </button>
          </div>
        </div>

        {/* 최근 수업 */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">최근 수업</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentClasses.map((classItem) => (
                <div
                  key={classItem.id}
                  className="flex items-center p-4 border border-gray-200 rounded-lg"
                >
                  <div
                    className={`p-2 rounded-lg mr-4 ${
                      classItem.status === "completed"
                        ? "bg-green-100"
                        : classItem.status === "upcoming"
                          ? "bg-blue-100"
                          : "bg-red-100"
                    }`}
                  >
                    <span className="text-lg">
                      {classItem.status === "completed"
                        ? "✅"
                        : classItem.status === "upcoming"
                          ? "📅"
                          : "❌"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {classItem.subject} - {classItem.student}
                    </p>
                    <p className="text-sm text-gray-600">
                      {classItem.date} {classItem.time}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      classItem.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : classItem.status === "upcoming"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {classItem.status === "completed"
                      ? "완료"
                      : classItem.status === "upcoming"
                        ? "예정"
                        : "취소"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

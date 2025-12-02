"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  Star,
  Home,
  Calendar,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

interface PerformanceData {
  overview: {
    totalStudents: number;
    totalClasses: number;
    averageRating: number;
    totalHours: number;
    monthlyGrowth: number;
    attendanceRate: number;
  };
  monthlyStats: {
    month: string;
    students: number;
    classes: number;
    hours: number;
    rating: number;
  }[];
  studentProgress: {
    studentName: string;
    level: string;
    progress: number;
    attendance: number;
    lastClass: string;
  }[];
  ratings: {
    studentName: string;
    rating: number;
    comment: string;
    date: string;
  }[];
}

export default function TeacherPerformancePage() {
  const [performanceData, setPerformanceData] =
    useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "week" | "month" | "quarter" | "year"
  >("month");

  useEffect(() => {
    // 실제 API 호출로 대체
    setTimeout(() => {
      const mockData: PerformanceData = {
        overview: {
          totalStudents: 25,
          totalClasses: 156,
          averageRating: 4.7,
          totalHours: 234,
          monthlyGrowth: 12.5,
          attendanceRate: 94.2,
        },
        monthlyStats: [
          { month: "10월", students: 20, classes: 45, hours: 67, rating: 4.6 },
          { month: "11월", students: 22, classes: 48, hours: 72, rating: 4.7 },
          { month: "12월", students: 24, classes: 52, hours: 78, rating: 4.8 },
          { month: "1월", students: 25, classes: 56, hours: 84, rating: 4.7 },
        ],
        studentProgress: [
          {
            studentName: "김학생",
            level: "A-2",
            progress: 85,
            attendance: 95,
            lastClass: "2024-01-15",
          },
          {
            studentName: "이학생",
            level: "B-1",
            progress: 78,
            attendance: 88,
            lastClass: "2024-01-14",
          },
          {
            studentName: "박학생",
            level: "A-1",
            progress: 92,
            attendance: 98,
            lastClass: "2024-01-13",
          },
          {
            studentName: "최학생",
            level: "B-2",
            progress: 76,
            attendance: 82,
            lastClass: "2024-01-12",
          },
        ],
        ratings: [
          {
            studentName: "김학생",
            rating: 5,
            comment: "매우 좋은 수업이었습니다!",
            date: "2024-01-15",
          },
          {
            studentName: "이학생",
            rating: 4,
            comment: "꼼꼼하게 설명해주셔서 좋았어요.",
            date: "2024-01-14",
          },
          {
            studentName: "박학생",
            rating: 5,
            comment: "재미있고 이해하기 쉬운 수업이었습니다.",
            date: "2024-01-13",
          },
          {
            studentName: "최학생",
            rating: 4,
            comment: "체계적으로 가르쳐주셔서 감사합니다.",
            date: "2024-01-12",
          },
        ],
      };

      setPerformanceData(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("ko-KR").format(num);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!performanceData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            성과 데이터를 찾을 수 없습니다
          </h2>
          <p className="text-gray-600">성과 정보를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">성과 분석</h1>
          <p className="text-gray-600">
            수업 성과와 학생 진행 상황을 확인하세요
          </p>
        </div>
        <Link
          href="/teacher/home"
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          <Home className="w-4 h-4" />
          홈으로
        </Link>
      </div>

      {/* 기간 선택 */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex gap-2">
          {[
            { id: "week", name: "주간" },
            { id: "month", name: "월간" },
            { id: "quarter", name: "분기" },
            { id: "year", name: "연간" },
          ].map((period) => (
            <button
              key={period.id}
              onClick={() => setSelectedPeriod(period.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === period.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {period.name}
            </button>
          ))}
        </div>
      </div>

      {/* 주요 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 평균 평점 */}
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">평균 평점</p>
              <p className="text-3xl font-bold">
                {performanceData.overview.averageRating}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(performanceData.overview.averageRating)
                        ? "fill-current"
                        : "text-yellow-200"
                    }`}
                  />
                ))}
              </div>
            </div>
            <Star className="w-12 h-12 opacity-80" />
          </div>
        </div>

        {/* 총 수업 수 */}
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">총 수업 수</p>
              <p className="text-3xl font-bold">
                {formatNumber(performanceData.overview.totalClasses)}
              </p>
              <p className="text-sm opacity-90 mt-1">이번 달</p>
            </div>
            <Calendar className="w-12 h-12 opacity-80" />
          </div>
        </div>

        {/* 총 학생 수 */}
        <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">총 학생 수</p>
              <p className="text-3xl font-bold">
                {formatNumber(performanceData.overview.totalStudents)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">
                  +{performanceData.overview.monthlyGrowth}%
                </span>
              </div>
            </div>
            <Users className="w-12 h-12 opacity-80" />
          </div>
        </div>

        {/* 출석률 */}
        <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">출석률</p>
              <p className="text-3xl font-bold">
                {performanceData.overview.attendanceRate}%
              </p>
              <p className="text-sm opacity-90 mt-1">평균</p>
            </div>
            <CheckCircle className="w-12 h-12 opacity-80" />
          </div>
        </div>
      </div>

      {/* 월별 통계 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">월별 통계</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  월
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  학생 수
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  수업 수
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  수업 시간
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  평점
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {performanceData.monthlyStats.map((stat) => (
                <tr key={stat.month} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {stat.month}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stat.students}명
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stat.classes}회
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stat.hours}시간
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-gray-900">
                        {stat.rating}
                      </span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(stat.rating)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 학생 진행 상황 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          학생 진행 상황
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {performanceData.studentProgress.map((student) => (
            <div
              key={student.studentName}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">
                  {student.studentName}
                </h3>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {student.level}
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">진행률</span>
                    <span className="font-medium">{student.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${student.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">출석률</span>
                    <span className="font-medium">{student.attendance}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${student.attendance}%` }}
                    ></div>
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  마지막 수업:{" "}
                  {new Date(student.lastClass).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 학생 평가 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          최근 학생 평가
        </h2>
        <div className="space-y-4">
          {performanceData.ratings.map((rating) => (
            <div
              key={rating.studentName}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">
                  {rating.studentName}
                </h3>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < rating.rating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-2">{rating.comment}</p>
              <p className="text-xs text-gray-500">
                {new Date(rating.date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  Users,
  GraduationCap,
  DollarSign,
  TrendingUp,
  Activity,
  Star,
  CheckCircle,
} from "lucide-react";

interface StatisticsData {
  overview: {
    totalStudents: number;
    totalTeachers: number;
    totalRevenue: number;
    activeLessons: number;
    monthlyGrowth: number;
    attendanceRate: number;
  };
  trends: {
    studentGrowth: { month: string; count: number }[];
    revenueGrowth: { month: string; amount: number }[];
    lessonCompletion: { month: string; rate: number }[];
  };
  demographics: {
    ageGroups: { group: string; count: number }[];
    levels: { level: string; count: number }[];
    subjects: { subject: string; count: number }[];
  };
  performance: {
    teacherRatings: { teacher: string; rating: number; students: number }[];
    topStudents: { student: string; attendance: number; progress: number }[];
    popularCourses: { course: string; enrollment: number; rating: number }[];
  };
}

function StatisticsContent() {
  const [stats, setStats] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "week" | "month" | "quarter" | "year"
  >("month");

  useEffect(() => {
    // 실제 데이터 로딩
    const loadStatisticsData = async () => {
      setLoading(true);
      
      try {
        // 실제 데이터베이스에서 통계 데이터 로드
        const response = await fetch("/api/admin/statistics", {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        
        if (data.success && data.statistics) {
          setStats(data.statistics);
        } else {
          // 데이터가 없으면 기본값으로 설정
          setStats({
            overview: {
              totalStudents: 0,
              totalTeachers: 0,
              totalRevenue: 0,
              activeLessons: 0,
              monthlyGrowth: 0,
              attendanceRate: 0,
            },
            trends: {
              studentGrowth: [],
              revenueGrowth: [],
              lessonCompletion: [],
            },
            demographics: {
              ageGroups: [],
              levels: [],
              subjects: [],
            },
            performance: {
              teacherRatings: [],
              topStudents: [],
              popularCourses: [],
            },
          });
        }
      } catch (error) {
        console.error("통계 데이터 로딩 실패:", error);
        // 오류 시 기본값으로 설정
        setStats({
          overview: {
            totalStudents: 0,
            totalTeachers: 0,
            totalRevenue: 0,
            activeLessons: 0,
            monthlyGrowth: 0,
            attendanceRate: 0,
          },
          trends: {
            studentGrowth: [],
            revenueGrowth: [],
            lessonCompletion: [],
          },
          demographics: {
            ageGroups: [],
            levels: [],
            subjects: [],
          },
          performance: {
            teacherRatings: [],
            topStudents: [],
            popularCourses: [],
          },
        });
      } finally {
        setLoading(false);
      }
    };

    loadStatisticsData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR").format(amount);
  };

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

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">통계 및 분석</h1>
          <p className="text-lg text-gray-600">학원 운영 통계를 확인하세요</p>
        </div>
        <select
          value={selectedPeriod}
          onChange={(e) =>
            setSelectedPeriod(
              e.target.value as "week" | "month" | "quarter" | "year",
            )
          }
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="week">주간</option>
          <option value="month">월간</option>
          <option value="quarter">분기</option>
          <option value="year">연간</option>
        </select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 학생 수</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatNumber(stats.overview.totalStudents)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">
              {stats.overview.monthlyGrowth > 0 ? '+' : ''}{stats.overview.monthlyGrowth}%
            </span>
            <span className="text-sm text-gray-500 ml-2">전월 대비</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 강사 수</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatNumber(stats.overview.totalTeachers)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <GraduationCap className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 수익</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(stats.overview.totalRevenue)}원
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">활성 수업</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatNumber(stats.overview.activeLessons)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">출석률</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.overview.attendanceRate}%
              </p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Empty State Message */}
      {stats.overview.totalStudents === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Users className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            아직 통계 데이터가 없습니다
          </h3>
          <p className="text-gray-600 mb-4">
            학생과 강사가 등록되면 통계 데이터가 표시됩니다.
          </p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            학생 등록하기
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminStatisticsPage() {
  return <StatisticsContent />;
}

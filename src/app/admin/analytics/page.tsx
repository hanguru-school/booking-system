"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Star, BookOpen, Target, Download } from "lucide-react";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import Navigation from "@/components/common/Navigation";

interface AnalyticsData {
  bookingStats: {
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    completionRate: number;
    monthlyData: { month: string; bookings: number; completed: number }[];
  };
  reviewStats: {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: { rating: number; count: number }[];
    monthlyTrend: {
      month: string;
      averageRating: number;
      reviewCount: number;
    }[];
  };
  homeworkStats: {
    totalAssigned: number;
    totalSubmitted: number;
    submissionRate: number;
    averageScore: number;
    monthlyData: { month: string; assigned: number; submitted: number }[];
  };
  levelProgression: {
    totalStudents: number;
    studentsWithProgress: number;
    averageTimeToNextLevel: number;
    levelDistribution: { level: string; count: number }[];
  };
  studentActivity: {
    activeStudents: number;
    averageAttendanceRate: number;
    topStudents: {
      name: string;
      attendanceRate: number;
      homeworkRate: number;
    }[];
  };
  teacherStats: {
    totalTeachers: number;
    averageRating: number;
    topTeachers: { name: string; rating: number; studentCount: number }[];
  };
  notificationStats: {
    totalSent: number;
    clickRate: number;
    confirmationRate: number;
    byType: { type: string; sent: number; clicked: number }[];
  };
}

function AnalyticsContent() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );
  const [selectedPeriod, setSelectedPeriod] = useState<
    "week" | "month" | "quarter" | "year"
  >("month");
  const [isLoading, setIsLoading] = useState(true);

  // Mock data initialization
  useEffect(() => {
    const loadAnalyticsData = async () => {
      setIsLoading(true);
      try {
        // 실제 데이터베이스에서 통계 데이터 로드
        const response = await fetch("/api/admin/analytics", {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        
        if (data.success && data.analytics) {
          // 실제 데이터를 AnalyticsData 형식으로 변환
          const formattedData: AnalyticsData = {
            bookingStats: {
              totalBookings: data.analytics.bookingStats?.totalBookings || 0,
              completedBookings: data.analytics.bookingStats?.completedBookings || 0,
              cancelledBookings: data.analytics.bookingStats?.cancelledBookings || 0,
              completionRate: data.analytics.bookingStats?.completionRate || 0,
              monthlyData: data.analytics.bookingStats?.monthlyData || [],
            },
            reviewStats: {
              totalReviews: data.analytics.reviewStats?.totalReviews || 0,
              averageRating: data.analytics.reviewStats?.averageRating || 0,
              ratingDistribution: data.analytics.reviewStats?.ratingDistribution || [],
              monthlyTrend: data.analytics.reviewStats?.monthlyTrend || [],
            },
            homeworkStats: {
              totalAssigned: data.analytics.homeworkStats?.totalAssigned || 0,
              totalSubmitted: data.analytics.homeworkStats?.totalSubmitted || 0,
              submissionRate: data.analytics.homeworkStats?.submissionRate || 0,
              averageScore: data.analytics.homeworkStats?.averageScore || 0,
              monthlyData: data.analytics.homeworkStats?.monthlyData || [],
            },
            levelProgression: {
              totalStudents: data.analytics.levelProgression?.totalStudents || 0,
              studentsWithProgress: data.analytics.levelProgression?.studentsWithProgress || 0,
              averageTimeToNextLevel: data.analytics.levelProgression?.averageTimeToNextLevel || 0,
              levelDistribution: data.analytics.levelProgression?.levelDistribution || [],
            },
            studentActivity: {
              activeStudents: data.analytics.studentActivity?.activeStudents || 0,
              averageAttendanceRate: data.analytics.studentActivity?.averageAttendanceRate || 0,
              topStudents: data.analytics.studentActivity?.topStudents || [],
            },
            teacherStats: {
              totalTeachers: data.analytics.teacherStats?.totalTeachers || 0,
              averageRating: data.analytics.teacherStats?.averageRating || 0,
              topTeachers: data.analytics.teacherStats?.topTeachers || [],
            },
            notificationStats: {
              totalSent: data.analytics.notificationStats?.totalSent || 0,
              clickRate: data.analytics.notificationStats?.clickRate || 0,
              confirmationRate: data.analytics.notificationStats?.confirmationRate || 0,
              byType: data.analytics.notificationStats?.byType || [],
            },
          };
          setAnalyticsData(formattedData);
        } else {
          // 데이터가 없으면 기본값으로 설정
          const emptyData: AnalyticsData = {
            bookingStats: {
              totalBookings: 0,
              completedBookings: 0,
              cancelledBookings: 0,
              completionRate: 0,
              monthlyData: [],
            },
            reviewStats: {
              totalReviews: 0,
              averageRating: 0,
              ratingDistribution: [],
              monthlyTrend: [],
            },
            homeworkStats: {
              totalAssigned: 0,
              totalSubmitted: 0,
              submissionRate: 0,
              averageScore: 0,
              monthlyData: [],
            },
            levelProgression: {
              totalStudents: 0,
              studentsWithProgress: 0,
              averageTimeToNextLevel: 0,
              levelDistribution: [],
            },
            studentActivity: {
              activeStudents: 0,
              averageAttendanceRate: 0,
              topStudents: [],
            },
            teacherStats: {
              totalTeachers: 0,
              averageRating: 0,
              topTeachers: [],
            },
            notificationStats: {
              totalSent: 0,
              clickRate: 0,
              confirmationRate: 0,
              byType: [],
            },
          };
          setAnalyticsData(emptyData);
        }
      } catch (error) {
        console.error("통계 데이터 로딩 실패:", error);
        // 오류 시 기본값으로 설정
        const emptyData: AnalyticsData = {
          bookingStats: {
            totalBookings: 0,
            completedBookings: 0,
            cancelledBookings: 0,
            completionRate: 0,
            monthlyData: [],
          },
          reviewStats: {
            totalReviews: 0,
            averageRating: 0,
            ratingDistribution: [],
            monthlyTrend: [],
          },
          homeworkStats: {
            totalAssigned: 0,
            totalSubmitted: 0,
            submissionRate: 0,
            averageScore: 0,
            monthlyData: [],
          },
          levelProgression: {
            totalStudents: 0,
            studentsWithProgress: 0,
            averageTimeToNextLevel: 0,
            levelDistribution: [],
          },
          studentActivity: {
            activeStudents: 0,
            averageAttendanceRate: 0,
            topStudents: [],
          },
          teacherStats: {
            totalTeachers: 0,
            averageRating: 0,
            topTeachers: [],
          },
          notificationStats: {
            totalSent: 0,
            clickRate: 0,
            confirmationRate: 0,
            byType: [],
          },
        };
        setAnalyticsData(emptyData);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalyticsData();
  }, []);

  const generateReport = () => {
    // Mock report generation
    console.log("Generating analytics report...");
    alert("리포트가 생성되었습니다. 다운로드 폴더를 확인해주세요.");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">분석 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">데이터를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full overflow-hidden">
      <div className="px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                시스템 통계 및 분석
              </h1>
              <p className="text-gray-600">
                전체 시스템의 운영 현황과 성과를 분석합니다.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) =>
                  setSelectedPeriod(
                    e.target.value as "week" | "month" | "quarter" | "year",
                  )
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">주간</option>
                <option value="month">월간</option>
                <option value="quarter">분기</option>
                <option value="year">연간</option>
              </select>
              <button
                onClick={generateReport}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download className="w-4 h-4 mr-2" />
                리포트 생성
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">예약 완료율</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.bookingStats.completionRate}%
                </p>
                <p className="text-sm text-gray-500">
                  {analyticsData.bookingStats.completedBookings} /{" "}
                  {analyticsData.bookingStats.totalBookings}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Star className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">평균 평점</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.reviewStats.averageRating}
                </p>
                <p className="text-sm text-gray-500">
                  총 {analyticsData.reviewStats.totalReviews}개 리뷰
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">숙제 제출율</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.homeworkStats.submissionRate}%
                </p>
                <p className="text-sm text-gray-500">
                  평균 점수: {analyticsData.homeworkStats.averageScore}점
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">레벨 상승률</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(
                    (analyticsData.levelProgression.studentsWithProgress /
                      analyticsData.levelProgression.totalStudents) *
                      100,
                  )}
                  %
                </p>
                <p className="text-sm text-gray-500">
                  평균 {analyticsData.levelProgression.averageTimeToNextLevel}
                  개월
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Booking Trends */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              예약 및 완료 추이
            </h3>
            <div className="space-y-3">
              {analyticsData.bookingStats.monthlyData.map((data, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{data.month}</span>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {data.bookings}건
                      </p>
                      <p className="text-xs text-gray-500">예약</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">
                        {data.completed}건
                      </p>
                      <p className="text-xs text-gray-500">완료</p>
                    </div>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${(data.completed / data.bookings) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Review Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              평점 분포
            </h3>
            <div className="space-y-3">
              {analyticsData.reviewStats.ratingDistribution.map((rating) => (
                <div key={rating.rating} className="flex items-center">
                  <div className="flex items-center w-16">
                    <span className="text-sm font-medium text-gray-900">
                      {rating.rating}점
                    </span>
                    <Star className="w-4 h-4 text-yellow-400 ml-1" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{
                          width: `${(rating.count / analyticsData.reviewStats.totalReviews) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {rating.count}개
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Student and Teacher Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Students */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              우수 학생
            </h3>
            <div className="space-y-4">
              {analyticsData.studentActivity.topStudents.map(
                (student, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {student.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        출석률: {student.attendanceRate}% | 숙제율:{" "}
                        {student.homeworkRate}%
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {index + 1}위
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Top Teachers */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              우수 강사
            </h3>
            <div className="space-y-4">
              {analyticsData.teacherStats.topTeachers.map((teacher, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{teacher.name}</p>
                    <p className="text-sm text-gray-600">
                      학생 수: {teacher.studentCount}명
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="font-medium text-gray-900">
                        {teacher.rating}
                      </span>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {index + 1}위
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notification Analytics */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            알림 효과 분석
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {analyticsData.notificationStats.totalSent}
              </p>
              <p className="text-sm text-gray-600">총 발송</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {analyticsData.notificationStats.clickRate}%
              </p>
              <p className="text-sm text-gray-600">클릭률</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {analyticsData.notificationStats.confirmationRate}%
              </p>
              <p className="text-sm text-gray-600">확인률</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {Math.round(
                  (analyticsData.notificationStats.clickRate *
                    analyticsData.notificationStats.confirmationRate) /
                    100,
                )}
                %
              </p>
              <p className="text-sm text-gray-600">전체 효과</p>
            </div>
          </div>

          <div className="space-y-3">
            {analyticsData.notificationStats.byType.map((type) => (
              <div
                key={type.type}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="font-medium text-gray-900">{type.type}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {type.sent}건 발송
                  </span>
                  <span className="text-sm text-blue-600">
                    {type.clicked}건 클릭
                  </span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(type.clicked / type.sent) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Level Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            레벨별 학생 분포
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {analyticsData.levelProgression.levelDistribution.map((level) => (
              <div
                key={level.level}
                className="text-center p-4 bg-gray-50 rounded-lg"
              >
                <p className="text-2xl font-bold text-gray-900">
                  {level.count}명
                </p>
                <p className="text-sm text-gray-600">{level.level}</p>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(level.count / analyticsData.levelProgression.totalStudents) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN", "MASTER"]}>
      <Navigation>
        <AnalyticsContent />
      </Navigation>
    </ProtectedRoute>
  );
}

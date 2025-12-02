"use client";

import {
  Home,
  RefreshCw,
  Filter,
  Download,
  Users,
  Calendar,
  TrendingUp,
  BarChart3,
  BookOpen,
  Clock,
  MessageSquare,
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

interface AnalyticsData {
  bookingStats: Record<string, unknown>;
  studentStats: Record<string, unknown>[];
  homeworkStats: Record<string, unknown>;
  lessonNoteStats: Record<string, unknown>;
  levelStats: Record<string, unknown>;
  timeAnalysis: Record<string, unknown>;
  reviewStats: Record<string, unknown>;
  automationStats: Record<string, unknown>;
  summary: Record<string, unknown>;
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("month");
  const [showFilterModal, setShowFilterModal] = useState(false);

  // 통계 데이터 조회
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/analytics?type=comprehensive");
      const data = await response.json();

      if (data.success) {
        setAnalyticsData(data.data);
      }
    } catch (error) {
      console.error("통계 데이터 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 데이터 내보내기
  const exportData = async (format: "csv" | "excel" | "json") => {
    try {
      const response = await fetch(
        `/api/analytics?type=comprehensive&format=${format}`,
      );

      if (format === "json") {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `analytics_${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `analytics_${new Date().toISOString().split("T")[0]}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("데이터 내보내기 실패:", error);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading && !analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">통계 데이터를 불러올 수 없습니다</p>
          <button
            onClick={fetchAnalytics}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              통계 및 분석
            </h1>
            <p className="text-lg text-gray-600">
              학습 데이터 기반 통계 분석 및 인사이트
            </p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            메인 페이지로
          </Link>
        </div>

        {/* 액션 버튼 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={fetchAnalytics}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
              데이터 새로고침
            </button>

            <button
              onClick={() => setShowFilterModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Filter className="w-5 h-5" />
              필터 설정
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => exportData("csv")}
                className="flex items-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Download className="w-5 h-5" />
                CSV
              </button>
              <button
                onClick={() => exportData("excel")}
                className="flex items-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Download className="w-5 h-5" />
                Excel
              </button>
              <button
                onClick={() => exportData("json")}
                className="flex items-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Download className="w-5 h-5" />
                JSON
              </button>
            </div>
          </div>
        </div>

        {/* 요약 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">총 학생 수</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.summary.totalStudents}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">총 수업 수</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.summary.totalClasses}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">평균 출석률</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(
                    analyticsData.summary.averageAttendanceRate * 100,
                  )}
                  %
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">활성 학생</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.summary.activeStudents}
                </p>
              </div>
              <Users className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 탭 네비게이션 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                분석 카테고리
              </h2>
              <div className="space-y-2">
                {[
                  { id: "overview", name: "개요", icon: BarChart3 },
                  { id: "booking", name: "예약 통계", icon: Calendar },
                  { id: "student", name: "학생 분석", icon: Users },
                  { id: "homework", name: "숙제 통계", icon: BookOpen },
                  { id: "level", name: "레벨 분석", icon: TrendingUp },
                  { id: "time", name: "시간 패턴", icon: Clock },
                  { id: "review", name: "리뷰 분석", icon: MessageSquare },
                  { id: "automation", name: "자동화 통계", icon: RefreshCw },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 분석 내용 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-6">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <BarChart3 className="w-6 h-6" />
                    전체 개요
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">
                        예약 현황
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">총 예약</span>
                          <span className="font-medium">
                            {analyticsData.bookingStats.totalBookings}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">완료된 수업</span>
                          <span className="font-medium">
                            {analyticsData.bookingStats.completedClasses}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">취소된 예약</span>
                          <span className="font-medium">
                            {analyticsData.bookingStats.cancelledBookings}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">
                        학습 현황
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">숙제 완료율</span>
                          <span className="font-medium">
                            {Math.round(
                              analyticsData.homeworkStats.completionRate * 100,
                            )}
                            %
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">정답률</span>
                          <span className="font-medium">
                            {Math.round(
                              analyticsData.homeworkStats.correctAnswerRate *
                                100,
                            )}
                            %
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">평균 별점</span>
                          <span className="font-medium">
                            {analyticsData.reviewStats.averageRating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "booking" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-6 h-6" />
                    예약 통계
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">
                        예약 현황
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">총 예약 수</span>
                          <span className="font-medium">
                            {analyticsData.bookingStats.totalBookings}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">완료된 수업</span>
                          <span className="font-medium">
                            {analyticsData.bookingStats.completedClasses}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">취소된 예약</span>
                          <span className="font-medium">
                            {analyticsData.bookingStats.cancelledBookings}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">당일 취소</span>
                          <span className="font-medium">
                            {analyticsData.bookingStats.sameDayCancellations}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">미수강</span>
                          <span className="font-medium">
                            {analyticsData.bookingStats.noShowBookings}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">
                        선생님별 수업 수
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(
                          analyticsData.bookingStats.teacherClassCounts,
                        ).map(([teacher, count]) => (
                          <div key={teacher} className="flex justify-between">
                            <span className="text-gray-600">{teacher}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "student" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-6 h-6" />
                    학생 분석
                  </h2>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">학생 ID</th>
                          <th className="text-left py-2">총 수업 시간</th>
                          <th className="text-left py-2">출석률</th>
                          <th className="text-left py-2">레벨</th>
                          <th className="text-left py-2">마지막 수업</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.studentStats.map((student) => (
                          <tr key={student.studentId} className="border-b">
                            <td className="py-2">{student.studentId}</td>
                            <td className="py-2">
                              {student.totalClassHours}분
                            </td>
                            <td className="py-2">
                              {Math.round(student.attendanceRate * 100)}%
                            </td>
                            <td className="py-2">{student.level}</td>
                            <td className="py-2">
                              {student.daysSinceLastClass}일 전
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "homework" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <BookOpen className="w-6 h-6" />
                    숙제 통계
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">
                        전체 현황
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">총 숙제 수</span>
                          <span className="font-medium">
                            {analyticsData.homeworkStats.totalAssignments}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">완료율</span>
                          <span className="font-medium">
                            {Math.round(
                              analyticsData.homeworkStats.completionRate * 100,
                            )}
                            %
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">정답률</span>
                          <span className="font-medium">
                            {Math.round(
                              analyticsData.homeworkStats.correctAnswerRate *
                                100,
                            )}
                            %
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">
                        오답 유형별
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(
                          analyticsData.homeworkStats.errorTypeStats,
                        ).map(([type, count]) => (
                          <div key={type} className="flex justify-between">
                            <span className="text-gray-600">{type}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "level" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6" />
                    레벨 분석
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">
                        레벨별 학생 분포
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(
                          analyticsData.levelStats.levelDistribution,
                        ).map(([level, count]) => (
                          <div key={level} className="flex justify-between">
                            <span className="text-gray-600">{level}</span>
                            <span className="font-medium">{count}명</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">
                        레벨업 평균 시간
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(
                          analyticsData.levelStats.averageLevelUpTime,
                        ).map(([level, days]) => (
                          <div key={level} className="flex justify-between">
                            <span className="text-gray-600">{level}</span>
                            <span className="font-medium">{days}일</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "time" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Clock className="w-6 h-6" />
                    시간 패턴 분석
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">
                        요일별 예약 분포
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(
                          analyticsData.timeAnalysis.weekdayDistribution,
                        ).map(([day, count]) => (
                          <div key={day} className="flex justify-between">
                            <span className="text-gray-600">{day}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">
                        피크 시간대
                      </h3>
                      <div className="space-y-2">
                        {analyticsData.timeAnalysis.peakHours.map(
                          (hour, index) => (
                            <div key={hour} className="flex justify-between">
                              <span className="text-gray-600">
                                {index + 1}위
                              </span>
                              <span className="font-medium">{hour}</span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "review" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-6 h-6" />
                    리뷰 분석
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">
                        리뷰 현황
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">총 리뷰 수</span>
                          <span className="font-medium">
                            {analyticsData.reviewStats.totalReviews}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">평균 별점</span>
                          <span className="font-medium">
                            {analyticsData.reviewStats.averageRating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">
                        별점 분포
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(
                          analyticsData.reviewStats.ratingDistribution,
                        ).map(([rating, count]) => (
                          <div key={rating} className="flex justify-between">
                            <span className="text-gray-600">{rating}점</span>
                            <span className="font-medium">{count}개</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "automation" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <RefreshCw className="w-6 h-6" />
                    자동화 통계
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">
                        자동화 현황
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">총 리마인드</span>
                          <span className="font-medium">
                            {analyticsData.automationStats.totalReminders}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">응답률</span>
                          <span className="font-medium">
                            {Math.round(
                              analyticsData.automationStats
                                .reminderResponseRate * 100,
                            )}
                            %
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">발송 성공률</span>
                          <span className="font-medium">
                            {Math.round(
                              analyticsData.automationStats
                                .messageDeliverySuccess * 100,
                            )}
                            %
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">
                        트리거별 발송
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(
                          analyticsData.automationStats.automationTriggers,
                        ).map(([trigger, count]) => (
                          <div key={trigger} className="flex justify-between">
                            <span className="text-gray-600">{trigger}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 필터 모달 */}
        {showFilterModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                필터 설정
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    기간
                  </label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="week">이번 주</option>
                    <option value="month">이번 달</option>
                    <option value="quarter">이번 분기</option>
                    <option value="year">이번 년도</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    setShowFilterModal(false);
                    fetchAnalytics();
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  적용
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

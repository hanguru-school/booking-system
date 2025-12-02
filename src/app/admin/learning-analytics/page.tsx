"use client";

import {
  Users,
  Calendar,
  CheckCircle,
  Star,
  AlertCircle,
  Search,
  Eye,
  MessageSquare,
} from "lucide-react";
import { useState, useEffect } from "react";
interface OverallStats {
  totalStudents: number;
  activeStudents: number;
  averageLessonsPerStudent: number;
  averageHomeworkCompletion: number;
  averageRating: number;
  totalLessons: number;
  totalHomework: number;
  completedHomework: number;
}

interface StudentProgress {
  studentId: string;
  studentName: string;
  level: string;
  totalLessons: number;
  homeworkCompletion: number;
  averageRating: number;
  studyStreak: number;
  lastLessonDate: string;
  progress: number;
  weakPoints: string[];
}

interface LevelAnalysis {
  level: string;
  studentCount: number;
  averageProgress: number;
  averageRating: number;
  commonWeakPoints: string[];
  recommendedActions: string[];
}

interface MonthlyTrend {
  month: string;
  newStudents: number;
  activeStudents: number;
  totalLessons: number;
  averageRating: number;
  completionRate: number;
}

export default function AdminLearningAnalyticsPage() {
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
  const [levelAnalysis, setLevelAnalysis] = useState<LevelAnalysis[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "students" | "levels" | "trends"
  >("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<
    "all" | "A-1" | "A-2" | "B-1" | "B-2"
  >("all");
  const [sortBy, setSortBy] = useState<
    "name" | "progress" | "rating" | "lessons"
  >("progress");

  useEffect(() => {
    // 실제 API 호출로 대체
    setTimeout(() => {
      const mockOverallStats: OverallStats = {
        totalStudents: 156,
        activeStudents: 134,
        averageLessonsPerStudent: 8.5,
        averageHomeworkCompletion: 78.2,
        averageRating: 4.3,
        totalLessons: 1326,
        totalHomework: 1248,
        completedHomework: 976,
      };

      const mockStudentProgress: StudentProgress[] = [
        {
          studentId: "1",
          studentName: "김학생",
          level: "A-2",
          totalLessons: 12,
          homeworkCompletion: 85,
          averageRating: 4.5,
          studyStreak: 7,
          lastLessonDate: "2024-01-15",
          progress: 65,
          weakPoints: ["자음 발음", "문장 구성"],
        },
        {
          studentId: "2",
          studentName: "이학생",
          level: "B-1",
          totalLessons: 18,
          homeworkCompletion: 92,
          averageRating: 4.2,
          studyStreak: 12,
          lastLessonDate: "2024-01-14",
          progress: 78,
          weakPoints: ["고급 문법"],
        },
        {
          studentId: "3",
          studentName: "박학생",
          level: "A-1",
          totalLessons: 6,
          homeworkCompletion: 70,
          averageRating: 4.0,
          studyStreak: 3,
          lastLessonDate: "2024-01-13",
          progress: 45,
          weakPoints: ["기본 단어", "발음"],
        },
      ];

      const mockLevelAnalysis: LevelAnalysis[] = [
        {
          level: "A-1",
          studentCount: 45,
          averageProgress: 52,
          averageRating: 4.1,
          commonWeakPoints: ["기본 발음", "단어 암기"],
          recommendedActions: ["발음 연습 강화", "단어 카드 활용"],
        },
        {
          level: "A-2",
          studentCount: 38,
          averageProgress: 68,
          averageRating: 4.3,
          commonWeakPoints: ["문장 구성", "조사 사용"],
          recommendedActions: ["문장 만들기 연습", "조사 연습 강화"],
        },
        {
          level: "B-1",
          studentCount: 28,
          averageProgress: 75,
          averageRating: 4.4,
          commonWeakPoints: ["고급 문법", "작문"],
          recommendedActions: ["문법 설명 강화", "작문 연습 추가"],
        },
      ];

      const mockMonthlyTrends: MonthlyTrend[] = [
        {
          month: "7월",
          newStudents: 12,
          activeStudents: 120,
          totalLessons: 156,
          averageRating: 4.2,
          completionRate: 75,
        },
        {
          month: "8월",
          newStudents: 15,
          activeStudents: 125,
          totalLessons: 168,
          averageRating: 4.3,
          completionRate: 78,
        },
        {
          month: "9월",
          newStudents: 18,
          activeStudents: 130,
          totalLessons: 175,
          averageRating: 4.1,
          completionRate: 72,
        },
        {
          month: "10월",
          newStudents: 22,
          activeStudents: 135,
          totalLessons: 182,
          averageRating: 4.4,
          completionRate: 80,
        },
        {
          month: "11월",
          newStudents: 20,
          activeStudents: 140,
          totalLessons: 188,
          averageRating: 4.3,
          completionRate: 78,
        },
        {
          month: "12월",
          newStudents: 25,
          activeStudents: 145,
          totalLessons: 195,
          averageRating: 4.5,
          completionRate: 82,
        },
      ];

      setOverallStats(mockOverallStats);
      setStudentProgress(mockStudentProgress);
      setLevelAnalysis(mockLevelAnalysis);
      setMonthlyTrends(mockMonthlyTrends);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredStudents = studentProgress.filter((student) => {
    const matchesSearch = student.studentName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === "all" || student.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.studentName.localeCompare(b.studentName);
      case "progress":
        return b.progress - a.progress;
      case "rating":
        return b.averageRating - a.averageRating;
      case "lessons":
        return b.totalLessons - a.totalLessons;
      default:
        return 0;
    }
  });

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-green-600";
    if (progress >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressBgColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">학습 분석</h1>
        <p className="text-lg text-gray-600">
          전체 학생의 학습 통계와 성취도를 분석하세요
        </p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white rounded-xl shadow-lg mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              전체 개요
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "students"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              학생별 분석
            </button>
            <button
              onClick={() => setActiveTab("levels")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "levels"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              레벨별 분석
            </button>
            <button
              onClick={() => setActiveTab("trends")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "trends"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              월별 트렌드
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "overview" && overallStats && (
            <div className="space-y-8">
              {/* 주요 통계 카드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-blue-600">전체 학생</div>
                      <div className="text-2xl font-bold text-blue-900">
                        {overallStats.totalStudents}
                      </div>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="mt-2 text-sm text-blue-700">
                    활성 학생: {overallStats.activeStudents}명
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-green-600">총 수업</div>
                      <div className="text-2xl font-bold text-green-900">
                        {overallStats.totalLessons}
                      </div>
                    </div>
                    <Calendar className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="mt-2 text-sm text-green-700">
                    학생당 평균 {overallStats.averageLessonsPerStudent}회
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-purple-600">숙제 완료율</div>
                      <div className="text-2xl font-bold text-purple-900">
                        {overallStats.averageHomeworkCompletion}%
                      </div>
                    </div>
                    <CheckCircle className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="mt-2 text-sm text-purple-700">
                    {overallStats.completedHomework}/
                    {overallStats.totalHomework}개 완료
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-orange-600">평균 만족도</div>
                      <div className="text-2xl font-bold text-orange-900">
                        {overallStats.averageRating}
                      </div>
                    </div>
                    <Star className="w-8 h-8 text-orange-600" />
                  </div>
                  <div className="mt-2 text-sm text-orange-700">
                    총 {overallStats.totalLessons}회 수업 기준
                  </div>
                </div>
              </div>

              {/* 개선점 및 권장사항 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="font-semibold text-yellow-900 mb-4">
                    주요 개선점
                  </h3>
                  <ul className="space-y-2 text-sm text-yellow-800">
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5" />
                      A-1 레벨 학생들의 발음 연습 강화 필요
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5" />
                      숙제 완료율 80% 미만 학생 대상 관리 강화
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5" />
                      B-1 레벨 고급 문법 설명 방법 개선
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 mb-4">
                    권장 조치사항
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5" />
                      발음 연습용 오디오 자료 추가 제작
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5" />
                      숙제 리마인드 시스템 강화
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5" />
                      고급 문법 설명 교재 개발
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === "students" && (
            <div className="space-y-6">
              {/* 필터 및 검색 */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="학생명으로 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <select
                  value={levelFilter}
                  onChange={(e) =>
                    setLevelFilter(
                      e.target.value as "all" | "A-1" | "A-2" | "B-1" | "B-2",
                    )
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">전체 레벨</option>
                  <option value="A-1">A-1</option>
                  <option value="A-2">A-2</option>
                  <option value="B-1">B-1</option>
                  <option value="B-2">B-2</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value as
                        | "progress"
                        | "rating"
                        | "lessons"
                        | "name",
                    )
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="progress">진행도순</option>
                  <option value="rating">별점순</option>
                  <option value="lessons">수업횟수순</option>
                  <option value="name">이름순</option>
                </select>
              </div>

              {/* 학생 목록 */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">
                          학생명
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">
                          레벨
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">
                          진행도
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">
                          수업
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">
                          숙제 완료율
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">
                          평균 별점
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">
                          액션
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedStudents.map((student) => (
                        <tr
                          key={student.studentId}
                          className="border-b border-gray-100"
                        >
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-gray-900">
                                {student.studentName}
                              </div>
                              <div className="text-sm text-gray-600">
                                마지막 수업:{" "}
                                {new Date(
                                  student.lastLessonDate,
                                ).toLocaleDateString("ko-KR")}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                              {student.level}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${getProgressBgColor(student.progress)}`}
                                  style={{ width: `${student.progress}%` }}
                                ></div>
                              </div>
                              <span
                                className={`font-medium ${getProgressColor(student.progress)}`}
                              >
                                {student.progress}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center text-gray-600">
                            {student.totalLessons}회
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`font-medium ${getProgressColor(student.homeworkCompletion)}`}
                            >
                              {student.homeworkCompletion}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="font-medium">
                                {student.averageRating}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                                <MessageSquare className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "levels" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                레벨별 분석
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {levelAnalysis.map((level) => (
                  <div
                    key={level.level}
                    className="bg-white border border-gray-200 rounded-lg p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {level.level}
                      </h4>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                        {level.studentCount}명
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>평균 진행도</span>
                          <span>{level.averageProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${level.averageProgress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">
                          평균 별점: {level.averageRating}
                        </span>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">
                          주요 약점
                        </h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {level.commonWeakPoints.map((point, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <AlertCircle className="w-3 h-3 mt-0.5 text-red-500" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">
                          권장 조치
                        </h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {level.recommendedActions.map((action, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="w-3 h-3 mt-0.5 text-green-500" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "trends" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                월별 트렌드
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {monthlyTrends.map((trend, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-6"
                  >
                    <h4 className="font-semibold text-gray-900 mb-4">
                      {trend.month}
                    </h4>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">신규 학생</span>
                        <span className="font-medium text-green-600">
                          +{trend.newStudents}명
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">활성 학생</span>
                        <span className="font-medium">
                          {trend.activeStudents}명
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">총 수업</span>
                        <span className="font-medium">
                          {trend.totalLessons}회
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">평균 별점</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="font-medium">
                            {trend.averageRating}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">완료율</span>
                        <span className="font-medium">
                          {trend.completionRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  Award,
  CheckCircle,
  AlertCircle,
  Heart,
  Zap,
  Activity,
  BookOpen,
  FileText,
  Mic,
  Headphones,
  PenTool,
  Type,
  Brain,
  Trophy,
  Lightbulb,
  MessageSquare,
  User,
  Target as TargetIcon,
} from "lucide-react";
import Link from "next/link";

interface LearningStats {
  totalStudyTime: number; // 분 단위
  totalClasses: number;
  averageScore: number;
  streakDays: number;
  weeklyProgress: {
    date: string;
    studyTime: number;
    classes: number;
    score: number;
  }[];
  categoryPerformance: {
    vocabulary: number;
    grammar: number;
    writing: number;
    listening: number;
    speaking: number;
    reading: number;
  };
  weakAreas: string[];
  strongAreas: string[];
  recommendations: string[];
  motivationalMessage: string;
  levelProgress: {
    currentLevel: string;
    nextLevel: string;
    progressPercentage: number;
    pointsToNextLevel: number;
  };
}

interface StudyHabit {
  dayOfWeek: string;
  averageStudyTime: number;
  mostActiveTime: string;
  consistency: number; // 0-100
}

export default function StudentLearningStatsPage() {
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [studyHabits, setStudyHabits] = useState<StudyHabit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const fetchLearningStats = async () => {
      try {
        setLoading(true);

        // 실제 API 호출로 대체
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 모의 데이터
        const mockStats: LearningStats = {
          totalStudyTime: 480, // 8시간
          totalClasses: 12,
          averageScore: 82.5,
          streakDays: 7,
          weeklyProgress: [
            { date: "2024-01-15", studyTime: 60, classes: 1, score: 85 },
            { date: "2024-01-16", studyTime: 45, classes: 0, score: 0 },
            { date: "2024-01-17", studyTime: 90, classes: 1, score: 78 },
            { date: "2024-01-18", studyTime: 30, classes: 0, score: 0 },
            { date: "2024-01-19", studyTime: 75, classes: 1, score: 92 },
            { date: "2024-01-20", studyTime: 60, classes: 1, score: 88 },
            { date: "2024-01-21", studyTime: 120, classes: 0, score: 0 },
          ],
          categoryPerformance: {
            vocabulary: 85,
            grammar: 78,
            writing: 72,
            listening: 80,
            speaking: 75,
            reading: 68,
          },
          weakAreas: ["읽기 이해력", "고급 문법", "작문 표현력"],
          strongAreas: ["어휘력", "청해력", "기초 문법"],
          recommendations: [
            "읽기 연습을 더 자주 해보세요. 짧은 기사나 동화를 읽는 것이 도움이 됩니다.",
            "고급 문법을 복습해보세요. 특히 연결어와 시제 표현에 집중하세요.",
            "작문 연습을 늘려보세요. 일기 쓰기나 짧은 에세이를 써보는 것을 추천합니다.",
          ],
          motivationalMessage:
            "정말 열심히 공부하고 계시네요! 특히 어휘력과 청해력이 뛰어납니다. 꾸준한 학습으로 더 큰 성장을 이룰 수 있을 거예요!",
          levelProgress: {
            currentLevel: "초급",
            nextLevel: "중급",
            progressPercentage: 75,
            pointsToNextLevel: 25,
          },
        };

        const mockStudyHabits: StudyHabit[] = [
          {
            dayOfWeek: "월요일",
            averageStudyTime: 45,
            mostActiveTime: "오후 2-4시",
            consistency: 80,
          },
          {
            dayOfWeek: "화요일",
            averageStudyTime: 60,
            mostActiveTime: "오후 7-9시",
            consistency: 90,
          },
          {
            dayOfWeek: "수요일",
            averageStudyTime: 30,
            mostActiveTime: "오전 10-12시",
            consistency: 60,
          },
          {
            dayOfWeek: "목요일",
            averageStudyTime: 75,
            mostActiveTime: "오후 3-5시",
            consistency: 85,
          },
          {
            dayOfWeek: "금요일",
            averageStudyTime: 90,
            mostActiveTime: "오후 6-8시",
            consistency: 95,
          },
          {
            dayOfWeek: "토요일",
            averageStudyTime: 120,
            mostActiveTime: "오전 9-11시",
            consistency: 70,
          },
          {
            dayOfWeek: "일요일",
            averageStudyTime: 60,
            mostActiveTime: "오후 2-4시",
            consistency: 50,
          },
        ];

        setStats(mockStats);
        setStudyHabits(mockStudyHabits);
      } catch (error) {
        console.error("학습 통계 로드 오류:", error);
        setStats(null);
        setStudyHabits([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLearningStats();
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "vocabulary":
        return <BookOpen className="w-5 h-5" />;
      case "grammar":
        return <Type className="w-5 h-5" />;
      case "writing":
        return <PenTool className="w-5 h-5" />;
      case "listening":
        return <Headphones className="w-5 h-5" />;
      case "speaking":
        return <Mic className="w-5 h-5" />;
      case "reading":
        return <FileText className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "vocabulary":
        return "bg-blue-100 text-blue-800";
      case "grammar":
        return "bg-green-100 text-green-800";
      case "writing":
        return "bg-purple-100 text-purple-800";
      case "listening":
        return "bg-orange-100 text-orange-800";
      case "speaking":
        return "bg-red-100 text-red-800";
      case "reading":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case "vocabulary":
        return "어휘";
      case "grammar":
        return "문법";
      case "writing":
        return "작문";
      case "listening":
        return "청해";
      case "speaking":
        return "말하기";
      case "reading":
        return "읽기";
      default:
        return category;
    }
  };

  const getConsistencyColor = (consistency: number) => {
    if (consistency >= 80) return "text-green-600";
    if (consistency >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              학습 데이터가 없습니다
            </h2>
            <p className="text-gray-600 mb-8">
              학습을 시작하면 여기에 분석 결과가 표시됩니다.
            </p>
            <Link
              href="/student/lesson-notes"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              학습 시작하기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">학습 분석</h1>
          <p className="text-lg text-gray-600">
            학습 습관과 경향을 분석하여 개선점을 확인하세요
          </p>
        </div>

        {/* 기간 선택 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">
              분석 기간:
            </span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="week">최근 1주일</option>
              <option value="month">최근 1개월</option>
              <option value="quarter">최근 3개월</option>
              <option value="year">최근 1년</option>
            </select>
          </div>
        </div>

        {/* 주요 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">총 학습시간</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.floor(stats.totalStudyTime / 60)}시간{" "}
                  {stats.totalStudyTime % 60}분
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-green-600">+12% 지난주 대비</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">총 수업 수</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalClasses}회
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-green-600">+2회 지난주 대비</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">평균 점수</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageScore}점
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-green-600">+3점 지난주 대비</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">연속 학습</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.streakDays}일
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Heart className="w-4 h-4 text-red-600" />
              <span className="text-red-600">최고 기록!</span>
            </div>
          </div>
        </div>

        {/* 레벨 진행도 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <TargetIcon className="w-6 h-6 text-blue-600" />
            레벨 진행도
          </h2>

          <div className="flex items-center gap-6 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {stats.levelProgress.currentLevel}
              </div>
              <div className="text-sm text-gray-600">현재 레벨</div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">진행도</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.levelProgress.progressPercentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${stats.levelProgress.progressPercentage}%`,
                  }}
                ></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {stats.levelProgress.nextLevel}
              </div>
              <div className="text-sm text-gray-600">다음 레벨</div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              다음 레벨까지{" "}
              <span className="font-medium text-blue-600">
                {stats.levelProgress.pointsToNextLevel}점
              </span>{" "}
              더 필요합니다
            </p>
          </div>
        </div>

        {/* 영역별 성과 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-green-600" />
            영역별 성과
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(stats.categoryPerformance).map(
              ([category, score]) => (
                <div key={category} className="text-center">
                  <div className="flex items-center justify-center mb-3">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${getCategoryColor(category)}`}
                    >
                      {getCategoryIcon(category)}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {score}점
                  </div>
                  <div className="text-sm text-gray-600">
                    {getCategoryText(category)}
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          score >= 80
                            ? "bg-green-500"
                            : score >= 60
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>

        {/* 학습 습관 분석 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Activity className="w-6 h-6 text-orange-600" />
            학습 습관 분석
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            {studyHabits.map((habit, index) => (
              <div
                key={index}
                className="text-center p-4 border border-gray-200 rounded-lg"
              >
                <div className="text-lg font-semibold text-gray-900 mb-2">
                  {habit.dayOfWeek}
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {habit.averageStudyTime}분
                </div>
                <div className="text-xs text-gray-600 mb-2">평균 학습시간</div>
                <div className="text-xs text-gray-500 mb-2">
                  {habit.mostActiveTime}
                </div>
                <div className="flex items-center justify-center gap-1">
                  <div
                    className={`w-2 h-2 rounded-full ${getConsistencyColor(habit.consistency)}`}
                  ></div>
                  <span
                    className={`text-xs ${getConsistencyColor(habit.consistency)}`}
                  >
                    {habit.consistency}% 일관성
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 강점과 개선점 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 강점 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-600" />
              강점 영역
            </h2>

            <div className="space-y-3">
              {stats.strongAreas.map((area, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-green-50 rounded-lg"
                >
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-900">{area}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 개선점 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Target className="w-6 h-6 text-red-600" />
              개선이 필요한 영역
            </h2>

            <div className="space-y-3">
              {stats.weakAreas.map((area, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-red-50 rounded-lg"
                >
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-gray-900">{area}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 추천사항 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-yellow-600" />
            개선 추천사항
          </h2>

          <div className="space-y-4">
            {stats.recommendations.map((rec, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg"
              >
                <MessageSquare className="w-5 h-5 text-blue-600 mt-1" />
                <p className="text-gray-900">{rec}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 동기부여 메시지 */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-8 h-8 text-pink-600" />
            <h2 className="text-2xl font-semibold text-gray-900">
              응원 메시지
            </h2>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed">
            {stats.motivationalMessage}
          </p>
        </div>

        {/* 네비게이션 */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link
            href="/student/mypage"
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <User className="w-5 h-5" />
            마이페이지
          </Link>
          <Link
            href="/student/lesson-notes"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileText className="w-5 h-5" />
            레슨노트
          </Link>
          <Link
            href="/student/vocabulary"
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            단어장
          </Link>
          <Link
            href="/student/exam-prep"
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Brain className="w-5 h-5" />
            테스트
          </Link>
        </div>
      </div>
    </div>
  );
}

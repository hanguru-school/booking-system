"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  BookOpen,
  Clock,
  Target,
  Star,
  Calendar,
  Book,
  Award,
  ChevronRight,
  Download,
  RefreshCw,
} from "lucide-react";

interface WordStat {
  pos: string; // 품사
  count: number;
  totalWords: number;
  lastStudied: string;
}

interface LearningStat {
  totalWords: number;
  totalTime: number; // 분 단위
  totalLessons: number;
  averageScore: number;
  streakDays: number;
  level: string;
}

interface LearningHistory {
  date: string;
  wordsLearned: number;
  timeSpent: number;
  lessonsCompleted: number;
  score?: number;
}

interface WordList {
  pos: string;
  words: string[];
  reviewStatus: "mastered" | "learning" | "needs_review";
}

export default function StudentStatisticsPage() {
  const [wordStats, setWordStats] = useState<WordStat[]>([]);
  const [learningStats, setLearningStats] = useState<LearningStat | null>(null);
  const [learningHistory, setLearningHistory] = useState<LearningHistory[]>([]);
  const [wordLists, setWordLists] = useState<WordList[]>([]);
  const [selectedPos, setSelectedPos] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">(
    "month",
  );

  // 더미 데이터 로드
  useEffect(() => {
    const mockWordStats: WordStat[] = [
      {
        pos: "명사",
        count: 45,
        totalWords: 150,
        lastStudied: "2024-01-15",
      },
      {
        pos: "동사",
        count: 32,
        totalWords: 120,
        lastStudied: "2024-01-14",
      },
      {
        pos: "형용사",
        count: 28,
        totalWords: 80,
        lastStudied: "2024-01-13",
      },
      {
        pos: "부사",
        count: 15,
        totalWords: 50,
        lastStudied: "2024-01-12",
      },
      {
        pos: "대명사",
        count: 8,
        totalWords: 20,
        lastStudied: "2024-01-11",
      },
    ];

    const mockLearningStats: LearningStat = {
      totalWords: 128,
      totalTime: 480, // 8시간
      totalLessons: 24,
      averageScore: 85,
      streakDays: 7,
      level: "초급 A",
    };

    const mockLearningHistory: LearningHistory[] = [
      {
        date: "2024-01-15",
        wordsLearned: 12,
        timeSpent: 45,
        lessonsCompleted: 2,
        score: 88,
      },
      {
        date: "2024-01-14",
        wordsLearned: 8,
        timeSpent: 30,
        lessonsCompleted: 1,
        score: 85,
      },
      {
        date: "2024-01-13",
        wordsLearned: 15,
        timeSpent: 60,
        lessonsCompleted: 2,
        score: 92,
      },
      {
        date: "2024-01-12",
        wordsLearned: 6,
        timeSpent: 25,
        lessonsCompleted: 1,
        score: 78,
      },
      {
        date: "2024-01-11",
        wordsLearned: 10,
        timeSpent: 40,
        lessonsCompleted: 1,
        score: 82,
      },
      {
        date: "2024-01-10",
        wordsLearned: 0,
        timeSpent: 0,
        lessonsCompleted: 0,
      },
      {
        date: "2024-01-09",
        wordsLearned: 14,
        timeSpent: 55,
        lessonsCompleted: 2,
        score: 90,
      },
    ];

    const mockWordLists: WordList[] = [
      {
        pos: "명사",
        words: [
          "사람",
          "학교",
          "집",
          "친구",
          "가족",
          "음식",
          "시간",
          "날씨",
          "도시",
          "나라",
        ],
        reviewStatus: "mastered",
      },
      {
        pos: "동사",
        words: [
          "가다",
          "오다",
          "먹다",
          "마시다",
          "자다",
          "일어나다",
          "공부하다",
          "만나다",
          "사다",
          "쓰다",
        ],
        reviewStatus: "learning",
      },
      {
        pos: "형용사",
        words: [
          "좋다",
          "나쁘다",
          "크다",
          "작다",
          "많다",
          "적다",
          "빠르다",
          "느리다",
          "따뜻하다",
          "차갑다",
        ],
        reviewStatus: "needs_review",
      },
    ];

    setWordStats(mockWordStats);
    setLearningStats(mockLearningStats);
    setLearningHistory(mockLearningHistory);
    setWordLists(mockWordLists);
  }, []);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`;
  };

  const getReviewStatusColor = (status: string) => {
    switch (status) {
      case "mastered":
        return "bg-green-100 text-green-800";
      case "learning":
        return "bg-blue-100 text-blue-800";
      case "needs_review":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getReviewStatusText = (status: string) => {
    switch (status) {
      case "mastered":
        return "완료";
      case "learning":
        return "학습중";
      case "needs_review":
        return "복습 필요";
      default:
        return "알 수 없음";
    }
  };

  const filteredWordStats =
    selectedPos === "all"
      ? wordStats
      : wordStats.filter((stat) => stat.pos === selectedPos);

  const totalWordsLearned = wordStats.reduce(
    (sum, stat) => sum + stat.count,
    0,
  );
  const totalWordsAvailable = wordStats.reduce(
    (sum, stat) => sum + stat.totalWords,
    0,
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">학습 통계</h1>
          <p className="text-lg text-gray-600">
            나의 학습 현황과 진도를 한눈에 확인하세요
          </p>
        </div>

        {/* 전체 통계 카드 */}
        {learningStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    총 학습 단어
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {learningStats.totalWords}개
                  </p>
                </div>
                <Book className="w-8 h-8 text-blue-600" />
              </div>
              <div className="mt-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Target className="w-4 h-4" />
                  <span>목표: {totalWordsAvailable}개</span>
                </div>
                <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${(learningStats.totalWords / totalWordsAvailable) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    총 학습 시간
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatTime(learningStats.totalTime)}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <div className="mt-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <TrendingUp className="w-4 h-4" />
                  <span>
                    평균:{" "}
                    {Math.round(
                      learningStats.totalTime / learningStats.totalLessons,
                    )}
                    분/수업
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    완료한 수업
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {learningStats.totalLessons}회
                  </p>
                </div>
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
              <div className="mt-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Star className="w-4 h-4" />
                  <span>평균 점수: {learningStats.averageScore}점</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">연속 학습</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {learningStats.streakDays}일
                  </p>
                </div>
                <Award className="w-8 h-8 text-orange-600" />
              </div>
              <div className="mt-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>현재 레벨: {learningStats.level}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 품사별 통계 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 품사별 차트 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                품사별 학습 현황
              </h2>
              <select
                value={selectedPos}
                onChange={(e) => setSelectedPos(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">전체</option>
                {wordStats.map((stat) => (
                  <option key={stat.pos} value={stat.pos}>
                    {stat.pos}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              {filteredWordStats.map((stat) => (
                <div
                  key={stat.pos}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-600 rounded-full" />
                    <span className="font-medium text-gray-900">
                      {stat.pos}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {stat.count}개
                    </p>
                    <p className="text-sm text-gray-500">
                      / {stat.totalWords}개
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* 원형 차트 시뮬레이션 */}
            <div className="mt-6 flex justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90">
                  {filteredWordStats.map((stat, index) => {
                    const percentage = (stat.count / totalWordsLearned) * 100;
                    const circumference = 2 * Math.PI * 60;
                    const strokeDasharray = (percentage / 100) * circumference;
                    const colors = [
                      "#3B82F6",
                      "#10B981",
                      "#F59E0B",
                      "#EF4444",
                      "#8B5CF6",
                    ];

                    return (
                      <circle
                        key={stat.pos}
                        cx="64"
                        cy="64"
                        r="60"
                        fill="none"
                        stroke={colors[index % colors.length]}
                        strokeWidth="12"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={0}
                        className="transition-all duration-300"
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-900">
                    {totalWordsLearned}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 학습 진행도 차트 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                학습 진행도
              </h2>
              <select
                value={timeRange}
                onChange={(e) =>
                  setTimeRange(e.target.value as "week" | "month" | "year")
                }
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value="week">1주일</option>
                <option value="month">1개월</option>
                <option value="year">1년</option>
              </select>
            </div>

            <div className="space-y-4">
              {learningHistory.slice(0, 7).map((day, index) => (
                <div key={day.date} className="flex items-center gap-4">
                  <div className="w-16 text-sm text-gray-500">
                    {new Date(day.date).toLocaleDateString("ko-KR", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {day.wordsLearned}개 단어
                      </span>
                      <span className="text-sm text-gray-500">
                        {day.timeSpent}분
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(day.wordsLearned / 15) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 단어 목록 및 복습 상태 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              단어 목록 및 복습 상태
            </h2>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-2 text-gray-600 border rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4" />
                내보내기
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-gray-600 border rounded-lg hover:bg-gray-50">
                <RefreshCw className="w-4 h-4" />
                새로고침
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wordLists.map((list) => (
              <div key={list.pos} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{list.pos}</h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getReviewStatusColor(list.reviewStatus)}`}
                  >
                    {getReviewStatusText(list.reviewStatus)}
                  </span>
                </div>

                <div className="space-y-2">
                  {list.words.slice(0, 5).map((word, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <span className="text-sm text-gray-700">{word}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                  {list.words.length > 5 && (
                    <div className="text-center">
                      <button className="text-sm text-blue-600 hover:text-blue-700">
                        +{list.words.length - 5}개 더 보기
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 학습 경향 분석 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            학습 경향 분석
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">
                가장 많이 학습한 품사
              </h3>
              <p className="text-lg font-bold text-blue-600">명사</p>
              <p className="text-sm text-gray-500">45개 단어</p>
            </div>

            <div className="text-center p-6 bg-green-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">학습 성장률</h3>
              <p className="text-lg font-bold text-green-600">+15%</p>
              <p className="text-sm text-gray-500">지난 주 대비</p>
            </div>

            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">다음 목표</h3>
              <p className="text-lg font-bold text-purple-600">중급 B</p>
              <p className="text-sm text-gray-500">22개 단어 남음</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

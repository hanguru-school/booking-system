"use client";

import React, { useState, useEffect } from "react";
import {
  Trophy,
  Target,
  TrendingUp,
  BookOpen,
  Star,
  CheckCircle,
  Clock,
  Lightbulb,
} from "lucide-react";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  isEarned: boolean;
  earnedDate?: string;
  requirement: string;
}

interface LearningProgress {
  totalClasses: number;
  totalHomework: number;
  completedHomework: number;
  totalWords: number;
  totalGrammar: number;
  currentLevel: string;
  nextLevel: string;
  progressToNextLevel: number;
  weeklyData: {
    week: string;
    classes: number;
    homework: number;
    words: number;
  }[];
}

interface Recommendation {
  id: string;
  type: "review" | "practice" | "goal" | "reminder";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  actionUrl?: string;
}

interface FeedbackSummary {
  recentFeedback: { date: string; content: string; rating: number }[];
  averageRating: number;
  totalFeedback: number;
  improvementAreas: string[];
}

export default function StudentMotivationPage() {
  const [learningProgress, setLearningProgress] =
    useState<LearningProgress | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [feedbackSummary, setFeedbackSummary] =
    useState<FeedbackSummary | null>(null);
  const [activeTab, setActiveTab] = useState<
    "progress" | "badges" | "recommendations" | "feedback"
  >("progress");
  const [isLoading, setIsLoading] = useState(true);

  // Mock data initialization
  useEffect(() => {
    const initializeData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockProgress: LearningProgress = {
        totalClasses: 24,
        totalHomework: 18,
        completedHomework: 16,
        totalWords: 450,
        totalGrammar: 35,
        currentLevel: "중급",
        nextLevel: "고급",
        progressToNextLevel: 75,
        weeklyData: [
          { week: "1주차", classes: 3, homework: 2, words: 25 },
          { week: "2주차", classes: 3, homework: 3, words: 30 },
          { week: "3주차", classes: 2, homework: 2, words: 20 },
          { week: "4주차", classes: 3, homework: 3, words: 35 },
        ],
      };

      const mockBadges: Badge[] = [
        {
          id: "1",
          name: "첫 수업",
          description: "첫 번째 수업을 완료했습니다!",
          icon: "🎉",
          isEarned: true,
          earnedDate: "2024-01-01",
          requirement: "첫 수업 완료",
        },
        {
          id: "2",
          name: "연속 출석",
          description: "5회 연속으로 수업에 참여했습니다!",
          icon: "🔥",
          isEarned: true,
          earnedDate: "2024-01-15",
          requirement: "5회 연속 출석",
        },
        {
          id: "3",
          name: "숙제 마스터",
          description: "10개의 숙제를 완료했습니다!",
          icon: "📚",
          isEarned: true,
          earnedDate: "2024-01-20",
          requirement: "10개 숙제 완료",
        },
        {
          id: "4",
          name: "단어 수집가",
          description: "100개의 단어를 학습했습니다!",
          icon: "📝",
          isEarned: false,
          requirement: "100개 단어 학습",
        },
        {
          id: "5",
          name: "리뷰 작성자",
          description: "첫 번째 수업 리뷰를 작성했습니다!",
          icon: "⭐",
          isEarned: true,
          earnedDate: "2024-01-10",
          requirement: "리뷰 작성",
        },
        {
          id: "6",
          name: "레벨 업",
          description: "다음 레벨로 상승했습니다!",
          icon: "🚀",
          isEarned: false,
          requirement: "레벨 상승",
        },
      ];

      const mockRecommendations: Recommendation[] = [
        {
          id: "1",
          type: "review",
          title: "복습이 필요한 문법",
          description:
            '조동사 "can"과 "could"의 차이점을 다시 한번 복습해보세요.',
          priority: "high",
          actionUrl: "/student/notes",
        },
        {
          id: "2",
          type: "practice",
          title: "추천 연습 문제",
          description:
            "이번 주 학습한 내용을 바탕으로 한 연습 문제를 풀어보세요.",
          priority: "medium",
          actionUrl: "/student/homework",
        },
        {
          id: "3",
          type: "goal",
          title: "이번 주 목표",
          description:
            "새로운 단어 20개를 학습하고 문법 연습 문제 3개를 완료하세요.",
          priority: "medium",
        },
        {
          id: "4",
          type: "reminder",
          title: "다음 수업 준비",
          description:
            "내일 오후 2시 수업이 있습니다. 오늘 배운 내용을 미리 복습해보세요.",
          priority: "low",
        },
      ];

      const mockFeedback: FeedbackSummary = {
        recentFeedback: [
          {
            date: "2024-01-15",
            content:
              "문법 설명이 매우 명확했습니다. 실습도 충분히 할 수 있어서 좋았습니다.",
            rating: 5,
          },
          {
            date: "2024-01-12",
            content:
              "회화 연습이 재미있었고, 선생님이 친절하게 가르쳐주셨습니다.",
            rating: 5,
          },
          {
            date: "2024-01-08",
            content:
              "단어 학습이 체계적이었고, 예문을 통해 이해하기 쉬웠습니다.",
            rating: 4,
          },
        ],
        averageRating: 4.7,
        totalFeedback: 15,
        improvementAreas: ["발음 연습", "문법 응용", "어휘 확장"],
      };

      setLearningProgress(mockProgress);
      setBadges(mockBadges);
      setRecommendations(mockRecommendations);
      setFeedbackSummary(mockFeedback);
      setIsLoading(false);
    };

    initializeData();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case "review":
        return <BookOpen className="w-5 h-5" />;
      case "practice":
        return <Target className="w-5 h-5" />;
      case "goal":
        return <TrendingUp className="w-5 h-5" />;
      case "reminder":
        return <Clock className="w-5 h-5" />;
      default:
        return <Lightbulb className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">학습 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!learningProgress || !feedbackSummary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">데이터를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            학습 동기부여
          </h1>
          <p className="text-gray-600">당신의 학습 여정을 응원합니다! 🎉</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="grid grid-cols-4">
            <button
              onClick={() => setActiveTab("progress")}
              className={`flex flex-col items-center py-4 px-2 transition-colors ${
                activeTab === "progress"
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <TrendingUp className="w-6 h-6 mb-1" />
              <span className="text-xs">학습 진도</span>
            </button>
            <button
              onClick={() => setActiveTab("badges")}
              className={`flex flex-col items-center py-4 px-2 transition-colors ${
                activeTab === "badges"
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Trophy className="w-6 h-6 mb-1" />
              <span className="text-xs">배지</span>
            </button>
            <button
              onClick={() => setActiveTab("recommendations")}
              className={`flex flex-col items-center py-4 px-2 transition-colors ${
                activeTab === "recommendations"
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Lightbulb className="w-6 h-6 mb-1" />
              <span className="text-xs">추천</span>
            </button>
            <button
              onClick={() => setActiveTab("feedback")}
              className={`flex flex-col items-center py-4 px-2 transition-colors ${
                activeTab === "feedback"
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Star className="w-6 h-6 mb-1" />
              <span className="text-xs">피드백</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {activeTab === "progress" && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                학습 진도 현황
              </h2>

              {/* Level Progress */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">레벨 진행도</h3>
                    <p className="text-blue-100">
                      현재: {learningProgress.currentLevel} → 다음:{" "}
                      {learningProgress.nextLevel}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {learningProgress.progressToNextLevel}%
                    </p>
                    <p className="text-blue-100">완료</p>
                  </div>
                </div>
                <div className="w-full bg-blue-400 rounded-full h-3">
                  <div
                    className="bg-white h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${learningProgress.progressToNextLevel}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {learningProgress.totalClasses}
                  </div>
                  <div className="text-sm text-gray-600">총 수업</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {learningProgress.completedHomework}
                  </div>
                  <div className="text-sm text-gray-600">완료 숙제</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {learningProgress.totalWords}
                  </div>
                  <div className="text-sm text-gray-600">학습 단어</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {learningProgress.totalGrammar}
                  </div>
                  <div className="text-sm text-gray-600">학습 문법</div>
                </div>
              </div>

              {/* Weekly Progress Chart */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  주별 학습 현황
                </h3>
                <div className="space-y-3">
                  {learningProgress.weeklyData.map((week, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium text-gray-900">
                        {week.week}
                      </span>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-sm font-medium text-blue-600">
                            {week.classes}회
                          </p>
                          <p className="text-xs text-gray-500">수업</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-green-600">
                            {week.homework}개
                          </p>
                          <p className="text-xs text-gray-500">숙제</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-purple-600">
                            {week.words}개
                          </p>
                          <p className="text-xs text-gray-500">단어</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "badges" && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                획득한 배지
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      badge.isEarned
                        ? "border-green-200 bg-green-50 hover:bg-green-100"
                        : "border-gray-200 bg-gray-50 opacity-60"
                    }`}
                  >
                    <div className="text-center">
                      <div
                        className={`text-4xl mb-2 ${badge.isEarned ? "" : "grayscale"}`}
                      >
                        {badge.icon}
                      </div>
                      <h3
                        className={`font-semibold mb-1 ${badge.isEarned ? "text-gray-900" : "text-gray-500"}`}
                      >
                        {badge.name}
                      </h3>
                      <p
                        className={`text-sm mb-2 ${badge.isEarned ? "text-gray-600" : "text-gray-400"}`}
                      >
                        {badge.description}
                      </p>
                      {badge.isEarned ? (
                        <div className="text-xs text-green-600">
                          <CheckCircle className="w-3 h-3 inline mr-1" />
                          {badge.earnedDate} 획득
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500">
                          조건: {badge.requirement}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "recommendations" && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                맞춤형 추천
              </h2>

              <div className="space-y-4">
                {recommendations.map((recommendation) => (
                  <div
                    key={recommendation.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div
                          className={`p-2 rounded-lg ${getPriorityColor(recommendation.priority)}`}
                        >
                          {getRecommendationIcon(recommendation.type)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {recommendation.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2">
                            {recommendation.description}
                          </p>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(recommendation.priority)}`}
                          >
                            {recommendation.priority === "high" && "높음"}
                            {recommendation.priority === "medium" && "보통"}
                            {recommendation.priority === "low" && "낮음"}
                          </span>
                        </div>
                      </div>
                      {recommendation.actionUrl && (
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          바로가기 →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "feedback" && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                학습 피드백 요약
              </h2>

              {/* Feedback Overview */}
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-6 text-white mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">전체 평점</h3>
                    <p className="text-yellow-100">
                      총 {feedbackSummary.totalFeedback}개의 피드백
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center">
                      <Star className="w-6 h-6 text-yellow-200 mr-2" />
                      <span className="text-3xl font-bold">
                        {feedbackSummary.averageRating}
                      </span>
                    </div>
                    <p className="text-yellow-100">평균 평점</p>
                  </div>
                </div>
              </div>

              {/* Recent Feedback */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  최근 피드백
                </h3>
                <div className="space-y-3">
                  {feedbackSummary.recentFeedback.map((feedback, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < feedback.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            {feedback.date}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700">{feedback.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Improvement Areas */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  개선 영역
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {feedbackSummary.improvementAreas.map((area, index) => (
                    <div
                      key={index}
                      className="p-3 bg-blue-50 rounded-lg text-center"
                    >
                      <Target className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <p className="text-sm font-medium text-gray-900">
                        {area}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  Star,
  Target,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  BookOpen,
} from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "study" | "attendance" | "score" | "streak" | "special";
  earnedAt: string;
  progress?: number;
  maxProgress?: number;
  completed: boolean;
  rarity: "common" | "rare" | "epic" | "legendary";
  points: number;
}

export default function StudentAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<
    "all" | "study" | "attendance" | "score" | "streak" | "special"
  >("all");

  useEffect(() => {
    // 실제 API 호출로 대체
    setTimeout(() => {
      setAchievements([
        {
          id: "1",
          title: "학습 열정가",
          description: "7일 연속 학습",
          icon: "🔥",
          category: "streak",
          earnedAt: "2024-01-10",
          progress: 7,
          maxProgress: 7,
          completed: true,
          rarity: "common",
          points: 100,
        },
        {
          id: "2",
          title: "테스트 마스터",
          description: "10회 테스트 완료",
          icon: "📝",
          category: "study",
          earnedAt: "2024-01-05",
          progress: 10,
          maxProgress: 10,
          completed: true,
          rarity: "rare",
          points: 150,
        },
        {
          id: "3",
          title: "숙제 완성자",
          description: "20회 숙제 제출",
          icon: "📚",
          category: "study",
          earnedAt: "2023-12-28",
          progress: 20,
          maxProgress: 20,
          completed: true,
          rarity: "common",
          points: 200,
        },
        {
          id: "4",
          title: "완벽 출석",
          description: "한 달 동안 결석 없이 수업 참여",
          icon: "✅",
          category: "attendance",
          earnedAt: "",
          progress: 15,
          maxProgress: 30,
          completed: false,
          rarity: "epic",
          points: 300,
        },
        {
          id: "5",
          title: "고득점 달성",
          description: "평균 점수 90점 이상 유지",
          icon: "🎯",
          category: "score",
          earnedAt: "",
          progress: 85,
          maxProgress: 90,
          completed: false,
          rarity: "rare",
          points: 250,
        },
        {
          id: "6",
          title: "단어 마스터",
          description: "1000개 단어 학습 완료",
          icon: "📖",
          category: "study",
          earnedAt: "",
          progress: 650,
          maxProgress: 1000,
          completed: false,
          rarity: "epic",
          points: 400,
        },
        {
          id: "7",
          title: "연속 우수상",
          description: "3개월 연속 우수 성적",
          icon: "🏆",
          category: "score",
          earnedAt: "",
          progress: 1,
          maxProgress: 3,
          completed: false,
          rarity: "legendary",
          points: 500,
        },
        {
          id: "8",
          title: "첫 수업",
          description: "첫 번째 수업 완료",
          icon: "🎉",
          category: "special",
          earnedAt: "2023-03-15",
          progress: 1,
          maxProgress: 1,
          completed: true,
          rarity: "common",
          points: 50,
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "text-gray-600 bg-gray-100";
      case "rare":
        return "text-blue-600 bg-blue-100";
      case "epic":
        return "text-purple-600 bg-purple-100";
      case "legendary":
        return "text-orange-600 bg-orange-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "study":
        return <BookOpen className="w-4 h-4" />;
      case "attendance":
        return <Calendar className="w-4 h-4" />;
      case "score":
        return <Target className="w-4 h-4" />;
      case "streak":
        return <TrendingUp className="w-4 h-4" />;
      case "special":
        return <Star className="w-4 h-4" />;
      default:
        return <Award className="w-4 h-4" />;
    }
  };

  const filteredAchievements =
    activeCategory === "all"
      ? achievements
      : achievements.filter(
          (achievement) => achievement.category === activeCategory,
        );

  const completedCount = achievements.filter((a) => a.completed).length;
  const totalPoints = achievements
    .filter((a) => a.completed)
    .reduce((sum, a) => sum + a.points, 0);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/student/profile"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>마이페이지로 돌아가기</span>
        </Link>
      </div>

      {/* 성취 요약 */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Award className="w-8 h-8 text-yellow-600" />
          <h1 className="text-2xl font-bold text-gray-900">성취 현황</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {completedCount}/{achievements.length}
            </div>
            <div className="text-sm text-gray-600">달성 성취</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {totalPoints}P
            </div>
            <div className="text-sm text-gray-600">획득 포인트</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {Math.round((completedCount / achievements.length) * 100)}%
            </div>
            <div className="text-sm text-gray-600">달성률</div>
          </div>
        </div>

        {/* 진행률 */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>전체 달성률</span>
            <span>
              {Math.round((completedCount / achievements.length) * 100)}%
            </span>
          </div>
          <div className="bg-gray-200 rounded-full h-3">
            <div
              className="bg-yellow-600 h-3 rounded-full transition-all duration-300"
              style={{
                width: `${(completedCount / achievements.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">카테고리</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", name: "전체", count: achievements.length },
            {
              id: "study",
              name: "학습",
              count: achievements.filter((a) => a.category === "study").length,
            },
            {
              id: "attendance",
              name: "출석",
              count: achievements.filter((a) => a.category === "attendance")
                .length,
            },
            {
              id: "score",
              name: "성적",
              count: achievements.filter((a) => a.category === "score").length,
            },
            {
              id: "streak",
              name: "연속",
              count: achievements.filter((a) => a.category === "streak").length,
            },
            {
              id: "special",
              name: "특별",
              count: achievements.filter((a) => a.category === "special")
                .length,
            },
          ].map((category) => (
            <button
              key={category.id}
              onClick={() =>
                setActiveCategory(
                  category.id as
                    | "all"
                    | "study"
                    | "attendance"
                    | "score"
                    | "streak"
                    | "special",
                )
              }
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === category.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>
      </div>

      {/* 성취 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{achievement.icon}</div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {achievement.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {achievement.description}
                  </p>
                </div>
              </div>
              {achievement.completed ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <Clock className="w-6 h-6 text-gray-400" />
              )}
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {getCategoryIcon(achievement.category)}
                <span className="text-xs text-gray-500">
                  {achievement.category === "study"
                    ? "학습"
                    : achievement.category === "attendance"
                      ? "출석"
                      : achievement.category === "score"
                        ? "성적"
                        : achievement.category === "streak"
                          ? "연속"
                          : "특별"}
                </span>
              </div>
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(achievement.rarity)}`}
              >
                {achievement.rarity === "common"
                  ? "일반"
                  : achievement.rarity === "rare"
                    ? "희귀"
                    : achievement.rarity === "epic"
                      ? "영웅"
                      : "전설"}
              </div>
            </div>

            {achievement.progress !== undefined && (
              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>진행률</span>
                  <span>
                    {achievement.progress}/{achievement.maxProgress}
                  </span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      achievement.completed ? "bg-green-600" : "bg-blue-600"
                    }`}
                    style={{
                      width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {achievement.completed ? (
                  <span>획득일: {achievement.earnedAt}</span>
                ) : (
                  <span>진행 중...</span>
                )}
              </div>
              <div className="text-lg font-bold text-yellow-600">
                +{achievement.points}P
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 성취 통계 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {completedCount}개
          </div>
          <div className="text-sm text-gray-600">달성 성취</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {totalPoints}P
          </div>
          <div className="text-sm text-gray-600">총 포인트</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {achievements.filter((a) => a.rarity === "legendary").length}개
          </div>
          <div className="text-sm text-gray-600">전설 등급</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {achievements.filter((a) => !a.completed).length}개
          </div>
          <div className="text-sm text-gray-600">진행 중</div>
        </div>
      </div>
    </div>
  );
}

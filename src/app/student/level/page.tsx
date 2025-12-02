"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Award,
  Target,
  CheckCircle,
  Clock,
  Star,
  Trophy,
  BarChart3,
  Calendar,
} from "lucide-react";

interface LevelProgress {
  currentLevel: string;
  currentGrade: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  nextLevel: string;
  estimatedCompletion: string;
}

interface CurriculumProgress {
  id: string;
  title: string;
  level: string;
  category: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  lastStudied: string;
  status: "in_progress" | "completed" | "not_started";
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
}

const StudentLevelPage = () => {
  const [levelProgress, setLevelProgress] = useState<LevelProgress | null>(
    null,
  );
  const [curriculumProgress, setCurriculumProgress] = useState<
    CurriculumProgress[]
  >([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data
    setTimeout(() => {
      setLevelProgress({
        currentLevel: "중급",
        currentGrade: "B+",
        progress: 75,
        totalLessons: 120,
        completedLessons: 90,
        nextLevel: "고급",
        estimatedCompletion: "2024-03-15",
      });

      setCurriculumProgress([
        {
          id: "1",
          title: "수학 중급 1단계",
          level: "중급",
          category: "수학",
          progress: 80,
          completedLessons: 20,
          totalLessons: 25,
          lastStudied: "2024-01-15",
          status: "in_progress",
        },
        {
          id: "2",
          title: "영어 중급 1단계",
          level: "중급",
          category: "영어",
          progress: 60,
          completedLessons: 9,
          totalLessons: 15,
          lastStudied: "2024-01-14",
          status: "in_progress",
        },
        {
          id: "3",
          title: "과학 실험 기초",
          level: "중급",
          category: "과학",
          progress: 100,
          completedLessons: 12,
          totalLessons: 12,
          lastStudied: "2024-01-10",
          status: "completed",
        },
        {
          id: "4",
          title: "수학 기초 2단계",
          level: "초급",
          category: "수학",
          progress: 100,
          completedLessons: 20,
          totalLessons: 20,
          lastStudied: "2023-12-20",
          status: "completed",
        },
      ]);

      setAchievements([
        {
          id: "1",
          title: "첫 번째 완료",
          description: "첫 번째 커리큘럼을 완료했습니다",
          icon: "🎯",
          earned: true,
          earnedDate: "2023-12-20",
        },
        {
          id: "2",
          title: "꾸준한 학습자",
          description: "연속 30일 학습을 달성했습니다",
          icon: "🔥",
          earned: true,
          earnedDate: "2024-01-10",
        },
        {
          id: "3",
          title: "중급 도전자",
          description: "중급 레벨에 도달했습니다",
          icon: "⭐",
          earned: true,
          earnedDate: "2024-01-01",
        },
        {
          id: "4",
          title: "완벽한 성취",
          description: "모든 과목에서 A+ 등급을 달성했습니다",
          icon: "🏆",
          earned: false,
        },
        {
          id: "5",
          title: "고급 도전자",
          description: "고급 레벨에 도달했습니다",
          icon: "👑",
          earned: false,
        },
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const getGradeColor = (grade: string) => {
    if (grade.includes("A")) return "text-green-600";
    if (grade.includes("B")) return "text-blue-600";
    if (grade.includes("C")) return "text-yellow-600";
    if (grade.includes("D")) return "text-red-600";
    return "text-gray-600";
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 60) return "bg-blue-500";
    if (progress >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "not_started":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "완료";
      case "in_progress":
        return "진행중";
      case "not_started":
        return "미시작";
      default:
        return "알 수 없음";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!levelProgress) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            레벨 정보를 찾을 수 없습니다
          </h2>
          <p className="text-gray-600">레벨 정보를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">내 레벨</h1>
        <p className="text-gray-600">현재 학습 레벨과 진행 상황을 확인하세요</p>
      </div>

      {/* Current Level Card */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              현재 레벨: {levelProgress.currentLevel}
            </h2>
            <p className="text-blue-100 mb-4">
              꾸준한 학습으로 성장하고 있습니다!
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                <span className="text-lg font-semibold">
                  등급: {levelProgress.currentGrade}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                <span>다음 레벨: {levelProgress.nextLevel}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold mb-2">
              {levelProgress.progress}%
            </div>
            <div className="text-blue-100">전체 진행률</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span>진행률</span>
            <span>
              {levelProgress.completedLessons} / {levelProgress.totalLessons}{" "}
              레슨
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full ${getProgressColor(levelProgress.progress)}`}
              style={{ width: `${levelProgress.progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">완료한 레슨</p>
              <p className="text-2xl font-bold text-gray-900">
                {levelProgress.completedLessons}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">현재 등급</p>
              <p
                className={`text-2xl font-bold ${getGradeColor(levelProgress.currentGrade)}`}
              >
                {levelProgress.currentGrade}
              </p>
            </div>
            <Star className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">예상 완료일</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Date(levelProgress.estimatedCompletion).toLocaleDateString(
                  "ko-KR",
                  { month: "short", day: "numeric" },
                )}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">획득한 업적</p>
              <p className="text-2xl font-bold text-gray-900">
                {achievements.filter((a) => a.earned).length}
              </p>
            </div>
            <Trophy className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Curriculum Progress */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            커리큘럼 진행 상황
          </h3>
          <div className="space-y-4">
            {curriculumProgress.map((curriculum) => (
              <div
                key={curriculum.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">
                    {curriculum.title}
                  </h4>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(curriculum.status)}`}
                  >
                    {getStatusText(curriculum.status)}
                  </span>
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-sm text-gray-600">
                    {curriculum.category}
                  </span>
                  <span className="text-sm text-gray-600">
                    {curriculum.level}
                  </span>
                  <span className="text-sm text-gray-600">
                    {curriculum.completedLessons}/{curriculum.totalLessons} 레슨
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(curriculum.progress)}`}
                      style={{ width: `${curriculum.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {curriculum.progress}%
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  마지막 학습: {curriculum.lastStudied}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">업적</h3>
          <div className="space-y-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  achievement.earned
                    ? "bg-green-50 border-green-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div
                  className={`text-2xl ${achievement.earned ? "" : "opacity-30"}`}
                >
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <h4
                    className={`font-medium ${achievement.earned ? "text-green-900" : "text-gray-500"}`}
                  >
                    {achievement.title}
                  </h4>
                  <p
                    className={`text-sm ${achievement.earned ? "text-green-700" : "text-gray-400"}`}
                  >
                    {achievement.description}
                  </p>
                  {achievement.earned && achievement.earnedDate && (
                    <p className="text-xs text-green-600 mt-1">
                      획득일: {achievement.earnedDate}
                    </p>
                  )}
                </div>
                {achievement.earned && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Level Assessment */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">레벨 평가</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-medium text-blue-900 mb-1">현재 성취도</h4>
            <p className="text-2xl font-bold text-blue-600">
              {levelProgress.progress}%
            </p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-medium text-green-900 mb-1">목표 달성률</h4>
            <p className="text-2xl font-bold text-green-600">85%</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-medium text-purple-900 mb-1">성장 지수</h4>
            <p className="text-2xl font-bold text-purple-600">+12</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-medium text-yellow-900 mb-2">
            다음 레벨 진입 조건
          </h4>
          <div className="space-y-2 text-sm text-yellow-800">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>현재 커리큘럼 90% 이상 완료</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>평균 등급 B+ 이상</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>최소 30일 이상 학습</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLevelPage;

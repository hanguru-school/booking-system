"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  Calendar,
  BookOpen,
  Target,
  CheckCircle,
  Clock,
  Star,
} from "lucide-react";

interface ProgressInfo {
  totalClasses: number;
  completedClasses: number;
  upcomingClasses: number;
  cancelledClasses: number;
  completionRate: number;
  monthlyProgress: number;
  weeklyProgress: number;
  classHistory: Array<{
    id: string;
    date: string;
    subject: string;
    teacher: string;
    duration: number;
    status: "completed" | "upcoming" | "cancelled";
    score?: number;
  }>;
  subjects: Array<{
    name: string;
    completed: number;
    total: number;
    averageScore: number;
  }>;
  goals: Array<{
    id: string;
    title: string;
    target: number;
    current: number;
    unit: string;
    deadline: string;
    completed: boolean;
  }>;
}

export default function StudentProgressPage() {
  const [progressInfo, setProgressInfo] = useState<ProgressInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 실제 API 호출로 대체
    setTimeout(() => {
      setProgressInfo({
        totalClasses: 24,
        completedClasses: 20,
        upcomingClasses: 4,
        cancelledClasses: 2,
        completionRate: 83,
        monthlyProgress: 8,
        weeklyProgress: 2,
        classHistory: [
          {
            id: "1",
            date: "2024-01-15",
            subject: "영어 회화",
            teacher: "김선생님",
            duration: 60,
            status: "completed",
            score: 85,
          },
          {
            id: "2",
            date: "2024-01-12",
            subject: "문법",
            teacher: "이선생님",
            duration: 60,
            status: "completed",
            score: 90,
          },
          {
            id: "3",
            date: "2024-01-10",
            subject: "듣기",
            teacher: "박선생님",
            duration: 60,
            status: "completed",
            score: 78,
          },
          {
            id: "4",
            date: "2024-01-18",
            subject: "영어 회화",
            teacher: "김선생님",
            duration: 60,
            status: "upcoming",
          },
          {
            id: "5",
            date: "2024-01-20",
            subject: "문법",
            teacher: "이선생님",
            duration: 60,
            status: "upcoming",
          },
        ],
        subjects: [
          { name: "영어 회화", completed: 8, total: 10, averageScore: 82 },
          { name: "문법", completed: 6, total: 8, averageScore: 88 },
          { name: "듣기", completed: 4, total: 6, averageScore: 75 },
          { name: "작문", completed: 2, total: 4, averageScore: 85 },
        ],
        goals: [
          {
            id: "1",
            title: "월 12회 수업 완료",
            target: 12,
            current: 8,
            unit: "회",
            deadline: "2024-01-31",
            completed: false,
          },
          {
            id: "2",
            title: "평균 점수 85점 달성",
            target: 85,
            current: 82,
            unit: "점",
            deadline: "2024-01-31",
            completed: false,
          },
          {
            id: "3",
            title: "연속 학습 10일",
            target: 10,
            current: 7,
            unit: "일",
            deadline: "2024-01-25",
            completed: false,
          },
        ],
      });
      setLoading(false);
    }, 1000);
  }, []);

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

  if (!progressInfo) return null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/student/home"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>홈으로 돌아가기</span>
        </Link>
      </div>

      {/* 진행률 요약 */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Award className="w-8 h-8 text-orange-600" />
          <h1 className="text-2xl font-bold text-gray-900">학습 진행률</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {progressInfo.completedClasses}/{progressInfo.totalClasses}
            </div>
            <div className="text-sm text-gray-600">완료/총 수업</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {progressInfo.completionRate}%
            </div>
            <div className="text-sm text-gray-600">완료율</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {progressInfo.upcomingClasses}
            </div>
            <div className="text-sm text-gray-600">예정 수업</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {progressInfo.cancelledClasses}
            </div>
            <div className="text-sm text-gray-600">취소 수업</div>
          </div>
        </div>

        {/* 진행률 바 */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>전체 진행률</span>
            <span>{progressInfo.completionRate}%</span>
          </div>
          <div className="bg-gray-200 rounded-full h-3">
            <div
              className="bg-orange-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressInfo.completionRate}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 과목별 진행률 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            과목별 진행률
          </h2>

          <div className="space-y-4">
            {progressInfo.subjects.map((subject) => (
              <div
                key={subject.name}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{subject.name}</h3>
                  <div className="text-sm text-gray-600">
                    {subject.completed}/{subject.total}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(subject.completed / subject.total) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {subject.averageScore}점
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 학습 목표 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-600" />
            학습 목표
          </h2>

          <div className="space-y-4">
            {progressInfo.goals.map((goal) => (
              <div
                key={goal.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{goal.title}</h3>
                  {goal.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min((goal.current / goal.target) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {goal.current}/{goal.target} {goal.unit}
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  마감일: {goal.deadline}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 수업 히스토리 */}
      <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-green-600" />
          수업 히스토리
        </h2>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {progressInfo.classHistory.map((classItem) => (
            <div
              key={classItem.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    classItem.status === "completed"
                      ? "bg-green-100"
                      : classItem.status === "upcoming"
                        ? "bg-blue-100"
                        : "bg-red-100"
                  }`}
                >
                  {classItem.status === "completed" ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : classItem.status === "upcoming" ? (
                    <Clock className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Star className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {classItem.subject}
                  </div>
                  <div className="text-sm text-gray-600">
                    {classItem.date} • {classItem.teacher}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  {classItem.duration}분
                </div>
                {classItem.score && (
                  <div className="text-sm font-medium text-gray-900">
                    {classItem.score}점
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 통계 카드들 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {progressInfo.completedClasses}회
          </div>
          <div className="text-sm text-gray-600">완료 수업</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {progressInfo.monthlyProgress}회
          </div>
          <div className="text-sm text-gray-600">이번 달 완료</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {progressInfo.weeklyProgress}회
          </div>
          <div className="text-sm text-gray-600">이번 주 완료</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {progressInfo.subjects.length}개
          </div>
          <div className="text-sm text-gray-600">수강 과목</div>
        </div>
      </div>
    </div>
  );
}

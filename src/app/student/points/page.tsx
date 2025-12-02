"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  TrendingUp,
  Gift,
  Calendar,
  Award,
  Clock,
  Target,
} from "lucide-react";

interface PointsInfo {
  totalPoints: number;
  availablePoints: number;
  usedPoints: number;
  studyStreak: number;
  monthlyPoints: number;
  pointsHistory: Array<{
    id: string;
    type: "earned" | "used";
    amount: number;
    description: string;
    date: string;
  }>;
  rewards: Array<{
    id: string;
    title: string;
    description: string;
    pointsRequired: number;
    available: boolean;
    claimed: boolean;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    pointsEarned: number;
    achievedAt: string;
    icon: string;
  }>;
}

export default function StudentPointsPage() {
  const [pointsInfo, setPointsInfo] = useState<PointsInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 실제 API 호출로 대체
    setTimeout(() => {
      setPointsInfo({
        totalPoints: 1250,
        availablePoints: 850,
        usedPoints: 400,
        studyStreak: 7,
        monthlyPoints: 320,
        pointsHistory: [
          {
            id: "1",
            type: "earned",
            amount: 50,
            description: "수업 완료",
            date: "2024-01-15",
          },
          {
            id: "2",
            type: "earned",
            amount: 30,
            description: "숙제 제출",
            date: "2024-01-14",
          },
          {
            id: "3",
            type: "used",
            amount: -100,
            description: "교재 구매",
            date: "2024-01-13",
          },
          {
            id: "4",
            type: "earned",
            amount: 40,
            description: "테스트 완료",
            date: "2024-01-12",
          },
          {
            id: "5",
            type: "earned",
            amount: 25,
            description: "연속 학습",
            date: "2024-01-11",
          },
        ],
        rewards: [
          {
            id: "1",
            title: "무료 수업 1회",
            description: "포인트로 무료 수업을 받을 수 있습니다",
            pointsRequired: 500,
            available: true,
            claimed: false,
          },
          {
            id: "2",
            title: "교재 할인권",
            description: "다음 교재 구매 시 20% 할인",
            pointsRequired: 300,
            available: true,
            claimed: false,
          },
          {
            id: "3",
            title: "특별 레슨",
            description: "1:1 특별 레슨 30분",
            pointsRequired: 800,
            available: false,
            claimed: false,
          },
        ],
        achievements: [
          {
            id: "1",
            title: "학습 열정가",
            description: "7일 연속 학습",
            pointsEarned: 100,
            achievedAt: "2024-01-10",
            icon: "🔥",
          },
          {
            id: "2",
            title: "테스트 마스터",
            description: "10회 테스트 완료",
            pointsEarned: 150,
            achievedAt: "2024-01-05",
            icon: "📝",
          },
          {
            id: "3",
            title: "숙제 완성자",
            description: "20회 숙제 제출",
            pointsEarned: 200,
            achievedAt: "2023-12-28",
            icon: "📚",
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

  if (!pointsInfo) return null;

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

      {/* 포인트 요약 */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Star className="w-8 h-8 text-yellow-600" />
          <h1 className="text-2xl font-bold text-gray-900">포인트 현황</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {pointsInfo.totalPoints}P
            </div>
            <div className="text-sm text-gray-600">총 포인트</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {pointsInfo.availablePoints}P
            </div>
            <div className="text-sm text-gray-600">사용 가능</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {pointsInfo.usedPoints}P
            </div>
            <div className="text-sm text-gray-600">사용 완료</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {pointsInfo.studyStreak}일
            </div>
            <div className="text-sm text-gray-600">연속 학습</div>
          </div>
        </div>

        {/* 포인트 구매 링크 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <Link
            href="/student/purchase"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Gift className="w-4 h-4" />
            포인트 구매하기
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 포인트 히스토리 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            포인트 히스토리
          </h2>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {pointsInfo.pointsHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.type === "earned" ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    {item.type === "earned" ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <Gift className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {item.description}
                    </div>
                    <div className="text-sm text-gray-600">{item.date}</div>
                  </div>
                </div>
                <div
                  className={`font-bold ${
                    item.type === "earned" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {item.type === "earned" ? "+" : ""}
                  {item.amount}P
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 보상 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Gift className="w-6 h-6 text-purple-600" />
            포인트 보상
          </h2>

          <div className="space-y-4">
            {pointsInfo.rewards.map((reward) => (
              <div
                key={reward.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{reward.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {reward.pointsRequired}P
                    </span>
                    {reward.claimed ? (
                      <Award className="w-5 h-5 text-green-600" />
                    ) : reward.available ? (
                      <Target className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {reward.description}
                </p>
                <button
                  className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    reward.claimed
                      ? "bg-green-100 text-green-700 cursor-default"
                      : reward.available
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                  disabled={!reward.available || reward.claimed}
                >
                  {reward.claimed
                    ? "사용 완료"
                    : reward.available
                      ? "교환하기"
                      : "포인트 부족"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 성취 */}
      <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-6 h-6 text-orange-600" />
          포인트 성취
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pointsInfo.achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="border border-gray-200 rounded-lg p-4 text-center"
            >
              <div className="text-3xl mb-2">{achievement.icon}</div>
              <h3 className="font-medium text-gray-900 mb-1">
                {achievement.title}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {achievement.description}
              </p>
              <div className="text-lg font-bold text-yellow-600">
                +{achievement.pointsEarned}P
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {achievement.achievedAt}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 통계 카드들 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {pointsInfo.studyStreak}일
          </div>
          <div className="text-sm text-gray-600">연속 학습</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {pointsInfo.monthlyPoints}
          </div>
          <div className="text-sm text-gray-600">이번 달 획득</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {pointsInfo.achievements.length}
          </div>
          <div className="text-sm text-gray-600">달성 성취</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {pointsInfo.rewards.length}
          </div>
          <div className="text-sm text-gray-600">사용 가능 보상</div>
        </div>
      </div>
    </div>
  );
}

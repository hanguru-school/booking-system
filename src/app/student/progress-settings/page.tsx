"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  Target,
  BookOpen,
  Calendar,
  Save,
  Award,
} from "lucide-react";

interface ProgressSettings {
  level: string;
  targetClasses: number;
  currentClasses: number;
  targetWords: number;
  currentWords: number;
  targetHours: number;
  currentHours: number;
  targetScore: number;
  currentScore: number;
  weeklyGoal: number;
  monthlyGoal: number;
  autoProgress: boolean;
  notifications: boolean;
}

export default function StudentProgressSettingsPage() {
  const [settings, setSettings] = useState<ProgressSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 실제 API 호출로 대체
    setTimeout(() => {
      setSettings({
        level: "중급 B",
        targetClasses: 24,
        currentClasses: 20,
        targetWords: 500,
        currentWords: 320,
        targetHours: 48,
        currentHours: 36,
        targetScore: 85,
        currentScore: 82,
        weeklyGoal: 3,
        monthlyGoal: 12,
        autoProgress: true,
        notifications: true,
      });
      setLoading(false);
    }, 1000);
  }, []);

  const handleSave = () => {
    // 실제 API 호출로 대체
    console.log("진행도 설정 저장:", settings);
    alert("진행도 설정이 저장되었습니다.");
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.round((current / target) * 100);
  };

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

  if (!settings) return null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/student/profile"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>마이페이지로 돌아가기</span>
          </Link>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save className="w-4 h-4" />
          저장
        </button>
      </div>

      {/* 현재 레벨 정보 */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">학습 진행도 설정</h1>
        </div>
        <div className="text-lg text-gray-600 mb-6">
          현재 레벨:{" "}
          <span className="font-semibold text-blue-600">{settings.level}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 수업 목표 설정 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-green-600" />
            수업 목표 설정
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                총 수업 목표
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={settings.targetClasses}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      targetClasses: parseInt(e.target.value) || 0,
                    })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-sm text-gray-600">회</span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                현재: {settings.currentClasses}회 / 목표:{" "}
                {settings.targetClasses}회
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>진행률</span>
                  <span>
                    {calculateProgress(
                      settings.currentClasses,
                      settings.targetClasses,
                    )}
                    %
                  </span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${calculateProgress(settings.currentClasses, settings.targetClasses)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                주간 목표
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={settings.weeklyGoal}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      weeklyGoal: parseInt(e.target.value) || 0,
                    })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-sm text-gray-600">회/주</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                월간 목표
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={settings.monthlyGoal}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      monthlyGoal: parseInt(e.target.value) || 0,
                    })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-sm text-gray-600">회/월</span>
              </div>
            </div>
          </div>
        </div>

        {/* 학습 목표 설정 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-600" />
            학습 목표 설정
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                단어 목표
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={settings.targetWords}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      targetWords: parseInt(e.target.value) || 0,
                    })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-sm text-gray-600">개</span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                현재: {settings.currentWords}개 / 목표: {settings.targetWords}개
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>진행률</span>
                  <span>
                    {calculateProgress(
                      settings.currentWords,
                      settings.targetWords,
                    )}
                    %
                  </span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${calculateProgress(settings.currentWords, settings.targetWords)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                학습 시간 목표
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={settings.targetHours}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      targetHours: parseInt(e.target.value) || 0,
                    })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-sm text-gray-600">시간</span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                현재: {settings.currentHours}시간 / 목표: {settings.targetHours}
                시간
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>진행률</span>
                  <span>
                    {calculateProgress(
                      settings.currentHours,
                      settings.targetHours,
                    )}
                    %
                  </span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${calculateProgress(settings.currentHours, settings.targetHours)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                목표 점수
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={settings.targetScore}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      targetScore: parseInt(e.target.value) || 0,
                    })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-sm text-gray-600">점</span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                현재: {settings.currentScore}점 / 목표: {settings.targetScore}점
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 자동 진행 설정 */}
      <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-6 h-6 text-red-600" />
          자동 진행 설정
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium text-gray-900">
                  자동 진행도 업데이트
                </div>
                <div className="text-sm text-gray-600">
                  수업 완료 시 자동으로 진행도를 업데이트합니다
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoProgress}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    autoProgress: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium text-gray-900">목표 달성 알림</div>
                <div className="text-sm text-gray-600">
                  목표 달성 시 알림을 받습니다
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* 현재 진행도 요약 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {calculateProgress(settings.currentClasses, settings.targetClasses)}
            %
          </div>
          <div className="text-sm text-gray-600">수업 진행도</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {calculateProgress(settings.currentWords, settings.targetWords)}%
          </div>
          <div className="text-sm text-gray-600">단어 진행도</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {calculateProgress(settings.currentHours, settings.targetHours)}%
          </div>
          <div className="text-sm text-gray-600">시간 진행도</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {settings.currentScore}점
          </div>
          <div className="text-sm text-gray-600">현재 점수</div>
        </div>
      </div>
    </div>
  );
}

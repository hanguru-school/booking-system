"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Play,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

interface TimeInfo {
  totalHours: number;
  remainingHours: number;
  usedHours: number;
  monthlyHours: number;
  nextExpiry: string;
  timeHistory: Array<{
    id: string;
    type: "used" | "added";
    hours: number;
    description: string;
    date: string;
  }>;
  upcomingClasses: Array<{
    id: string;
    date: string;
    time: string;
    duration: number;
    teacher: string;
    subject: string;
  }>;
  packages: Array<{
    id: string;
    name: string;
    hours: number;
    price: number;
    expiryDate: string;
    status: "active" | "expired" | "upcoming";
  }>;
}

export default function StudentTimePage() {
  const [timeInfo, setTimeInfo] = useState<TimeInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 실제 API 호출로 대체
    setTimeout(() => {
      setTimeInfo({
        totalHours: 20,
        remainingHours: 8,
        usedHours: 12,
        monthlyHours: 4,
        nextExpiry: "2024-02-15",
        timeHistory: [
          {
            id: "1",
            type: "used",
            hours: -1,
            description: "영어 회화 수업",
            date: "2024-01-15",
          },
          {
            id: "2",
            type: "used",
            hours: -1,
            description: "문법 수업",
            date: "2024-01-12",
          },
          {
            id: "3",
            type: "added",
            hours: 10,
            description: "패키지 구매",
            date: "2024-01-10",
          },
          {
            id: "4",
            type: "used",
            hours: -1,
            description: "회화 수업",
            date: "2024-01-08",
          },
          {
            id: "5",
            type: "used",
            hours: -1,
            description: "듣기 수업",
            date: "2024-01-05",
          },
        ],
        upcomingClasses: [
          {
            id: "1",
            date: "2024-01-18",
            time: "14:00",
            duration: 60,
            teacher: "김선생님",
            subject: "영어 회화",
          },
          {
            id: "2",
            date: "2024-01-20",
            time: "16:00",
            duration: 60,
            teacher: "이선생님",
            subject: "문법",
          },
          {
            id: "3",
            date: "2024-01-22",
            time: "15:00",
            duration: 60,
            teacher: "박선생님",
            subject: "듣기",
          },
        ],
        packages: [
          {
            id: "1",
            name: "기본 패키지",
            hours: 10,
            price: 200000,
            expiryDate: "2024-02-15",
            status: "active",
          },
          {
            id: "2",
            name: "프리미엄 패키지",
            hours: 20,
            price: 350000,
            expiryDate: "2024-03-15",
            status: "upcoming",
          },
          {
            id: "3",
            name: "스탠다드 패키지",
            hours: 5,
            price: 100000,
            expiryDate: "2024-01-10",
            status: "expired",
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

  if (!timeInfo) return null;

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

      {/* 시간 요약 */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-8 h-8 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-900">수업 시간 현황</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {timeInfo.remainingHours}시간
            </div>
            <div className="text-sm text-gray-600">남은 시간</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {timeInfo.usedHours}시간
            </div>
            <div className="text-sm text-gray-600">사용 완료</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {timeInfo.totalHours}시간
            </div>
            <div className="text-sm text-gray-600">총 시간</div>
          </div>
        </div>

        {/* 진행률 */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>시간 사용률</span>
            <span>
              {Math.round((timeInfo.usedHours / timeInfo.totalHours) * 100)}%
            </span>
          </div>
          <div className="bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-600 h-3 rounded-full transition-all duration-300"
              style={{
                width: `${(timeInfo.usedHours / timeInfo.totalHours) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* 시간 구매 링크 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <Link
            href="/student/purchase"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Clock className="w-4 h-4" />
            수업 시간 구매하기
          </Link>
        </div>

        {/* 만료일 알림 */}
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              다음 만료일: {timeInfo.nextExpiry} (약{" "}
              {Math.ceil(
                (new Date(timeInfo.nextExpiry).getTime() -
                  new Date().getTime()) /
                  (1000 * 60 * 60 * 24),
              )}
              일 남음)
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 시간 히스토리 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            시간 사용 내역
          </h2>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {timeInfo.timeHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.type === "added" ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    {item.type === "added" ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <Play className="w-4 h-4 text-red-600" />
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
                    item.type === "added" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {item.type === "added" ? "+" : ""}
                  {item.hours}시간
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 예정된 수업 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-purple-600" />
            예정된 수업
          </h2>

          <div className="space-y-3">
            {timeInfo.upcomingClasses.map((classItem) => (
              <div
                key={classItem.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">
                    {classItem.subject}
                  </h3>
                  <div className="text-sm text-gray-600">
                    {classItem.duration}분
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    {classItem.date} {classItem.time}
                  </span>
                  <span>{classItem.teacher}</span>
                </div>
                <div className="mt-2 flex gap-2">
                  <button className="flex-1 py-1 px-3 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors">
                    수업 시작
                  </button>
                  <button className="flex-1 py-1 px-3 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition-colors">
                    상세보기
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 패키지 정보 */}
      <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-orange-600" />
          수업 패키지
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {timeInfo.packages.map((pkg) => (
            <div key={pkg.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{pkg.name}</h3>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    pkg.status === "active"
                      ? "bg-green-100 text-green-700"
                      : pkg.status === "upcoming"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {pkg.status === "active"
                    ? "활성"
                    : pkg.status === "upcoming"
                      ? "예정"
                      : "만료"}
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div>수업 시간: {pkg.hours}시간</div>
                <div>가격: {pkg.price.toLocaleString()}원</div>
                <div>만료일: {pkg.expiryDate}</div>
              </div>
              {pkg.status === "active" && (
                <button className="w-full mt-3 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                  패키지 사용
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 통계 카드들 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {timeInfo.remainingHours}시간
          </div>
          <div className="text-sm text-gray-600">사용 가능</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {timeInfo.monthlyHours}시간
          </div>
          <div className="text-sm text-gray-600">이번 달 사용</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {timeInfo.upcomingClasses.length}회
          </div>
          <div className="text-sm text-gray-600">예정 수업</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {timeInfo.packages.filter((p) => p.status === "active").length}개
          </div>
          <div className="text-sm text-gray-600">활성 패키지</div>
        </div>
      </div>
    </div>
  );
}

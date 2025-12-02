"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  BookOpen,
  CreditCard,
  Star,
  TrendingUp,
  Bell,
  User,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye,
  Activity,
  DollarSign,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";

interface ParentStats {
  totalChildren: number;
  totalTeachers: number;
  totalPayments: number;
  activeLessons: number;
  pendingReviews: number;
  systemHealth: "good" | "warning" | "error";
  monthlyGrowth: number;
  attendanceRate: number;
}

interface RecentActivity {
  id: string;
  type: "lesson" | "payment" | "review" | "system" | "student" | "teacher";
  title: string;
  description: string;
  timestamp: string;
  status: "success" | "warning" | "error" | "info";
  icon: any;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: any;
  color: string;
  bgColor: string;
}

export default function ParentHome() {
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("language") || "ko";
    }
    return "ko";
  });

  const [stats, setStats] = useState<ParentStats>({
    totalChildren: 0,
    totalTeachers: 0,
    totalPayments: 0,
    activeLessons: 0,
    pendingReviews: 0,
    systemHealth: "good",
    monthlyGrowth: 0,
    attendanceRate: 0,
  });

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // 시뮬레이션된 로딩 시간
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 통계 데이터 로드
        setStats({
          totalChildren: 3,
          totalTeachers: 8,
          totalPayments: 450000,
          activeLessons: 12,
          pendingReviews: 2,
          systemHealth: "good" as const,
          monthlyGrowth: 8.5,
          attendanceRate: 96.2,
        });

        // 최근 활동 데이터 로드
        setRecentActivities([
          {
            id: "1",
            type: "lesson",
            title: "수업 완료",
            description: "김선생님의 영어 수업이 완료되었습니다.",
            timestamp: "2분 전",
            status: "success",
            icon: BookOpen,
          },
          {
            id: "2",
            type: "payment",
            title: "결제 완료",
            description: "이번 달 수강료 결제가 완료되었습니다.",
            timestamp: "15분 전",
            status: "success",
            icon: CreditCard,
          },
          {
            id: "3",
            type: "student",
            title: "출석 확인",
            description: "아이의 오늘 출석이 확인되었습니다.",
            timestamp: "1시간 전",
            status: "info",
            icon: User,
          },
          {
            id: "4",
            type: "review",
            title: "리뷰 작성",
            description: "박선생님에 대한 리뷰를 작성했습니다.",
            timestamp: "2시간 전",
            status: "success",
            icon: Star,
          },
          {
            id: "5",
            type: "system",
            title: "알림 수신",
            description: "새로운 공지사항이 등록되었습니다.",
            timestamp: "3시간 전",
            status: "info",
            icon: Bell,
          },
        ]);

        setLoading(false);
      } catch (error) {
        console.error("대시보드 데이터 로드 실패:", error);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const quickActions: QuickAction[] = [
    {
      id: "1",
      title: "아이 정보 확인",
      description: "아이의 학습 현황과 성적을 확인하세요",
      href: "/parent/children",
      icon: User,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      id: "2",
      title: "수업 일정",
      description: "이번 주 수업 일정을 확인하세요",
      href: "/parent/schedule",
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      id: "3",
      title: "결제 내역",
      description: "수강료 결제 내역을 확인하세요",
      href: "/parent/payments",
      icon: CreditCard,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      id: "4",
      title: "선생님 리뷰",
      description: "선생님에 대한 리뷰를 작성하세요",
      href: "/parent/reviews",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Eye className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-100";
      case "warning":
        return "text-yellow-600 bg-yellow-100";
      case "error":
        return "text-red-600 bg-red-100";
      default:
        return "text-blue-600 bg-blue-100";
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("ko-KR");
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString("ko-KR");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>학부모 대시보드를 로드하는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <div>
              <div className="text-sm text-gray-500">학부모</div>
              <div className="text-lg font-semibold text-gray-900">
                김부모님
              </div>
            </div>
          </div>

          {/* 알림 아이콘 */}
          <div className="relative">
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <div className="w-5 h-5 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="p-4 sm:p-6 lg:p-8">
        {/* 환영 메시지 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            안녕하세요, 김부모님!
          </h1>
          <p className="text-gray-600">
            오늘도 아이들의 학습 현황을 확인해보세요.
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/parent/children" className="block">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 cursor-pointer group">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">등록된 아이</p>
                  <p className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {formatNumber(stats.totalChildren)}명
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/parent/teachers" className="block">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 cursor-pointer group">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <GraduationCap className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">담당 선생님</p>
                  <p className="text-2xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                    {formatNumber(stats.totalTeachers)}명
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/parent/payments" className="block">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 cursor-pointer group">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">이번 달 결제</p>
                  <p className="text-2xl font-bold text-gray-900 group-hover:text-yellow-600 transition-colors">
                    {formatCurrency(stats.totalPayments)}원
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/parent/schedule" className="block">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 cursor-pointer group">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">진행 중 수업</p>
                  <p className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                    {stats.activeLessons}개
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* 추가 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/parent/reports" className="block">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 cursor-pointer group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">학습 성장률</p>
                  <p className="text-2xl font-bold text-green-600 group-hover:text-green-700 transition-colors">
                    +{stats.monthlyGrowth}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600 group-hover:text-green-700 transition-colors" />
              </div>
            </div>
          </Link>

          <Link href="/parent/children" className="block">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 cursor-pointer group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">평균 출석률</p>
                  <p className="text-2xl font-bold text-blue-600 group-hover:text-blue-700 transition-colors">
                    {stats.attendanceRate}%
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-600 group-hover:text-blue-700 transition-colors" />
              </div>
            </div>
          </Link>

          <Link href="/parent/reviews" className="block">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 cursor-pointer group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">작성할 리뷰</p>
                  <p className="text-2xl font-bold text-orange-600 group-hover:text-orange-700 transition-colors">
                    {stats.pendingReviews}개
                  </p>
                </div>
                <Star className="w-8 h-8 text-orange-600 group-hover:text-orange-700 transition-colors" />
              </div>
            </div>
          </Link>
        </div>

        {/* 빠른 액션 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            빠른 액션
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link key={action.id} href={action.href} className="block">
                <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group">
                  <div
                    className={`p-2 rounded-lg ${action.bgColor} w-fit mb-3 group-hover:scale-110 transition-transform`}
                  >
                    <action.icon className={`w-6 h-6 ${action.color}`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 최근 활동 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">최근 활동</h2>
            <Link
              href="/parent/activities"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
            >
              모두 보기
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow-md">
            <div className="divide-y divide-gray-200">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}
                    >
                      {getStatusIcon(activity.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 시스템 상태 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            시스템 상태
          </h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    stats.systemHealth === "good"
                      ? "bg-green-500"
                      : stats.systemHealth === "warning"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                ></div>
                <span className="text-sm font-medium text-gray-900">
                  시스템 상태:{" "}
                  {stats.systemHealth === "good"
                    ? "정상"
                    : stats.systemHealth === "warning"
                      ? "주의"
                      : "오류"}
                </span>
              </div>
              <span className="text-sm text-gray-500">실시간 모니터링</span>
            </div>
          </div>
        </div>

        {/* 이번 주 일정 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            이번 주 일정
          </h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">영어 수업</p>
                    <p className="text-sm text-gray-600">김선생님</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    월요일 14:00
                  </p>
                  <p className="text-xs text-gray-500">1시간</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">수학 수업</p>
                    <p className="text-sm text-gray-600">박선생님</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    수요일 16:00
                  </p>
                  <p className="text-xs text-gray-500">1시간</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">과학 실험</p>
                    <p className="text-sm text-gray-600">이선생님</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    금요일 15:00
                  </p>
                  <p className="text-xs text-gray-500">1.5시간</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

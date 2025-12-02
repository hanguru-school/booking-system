"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  Calendar,
  MessageSquare,
  Users,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Plus,
  ChevronRight,
  Shield,
  FileText,
  Phone,
  User,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface WorkLog {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  workTitle: string;
  workContent: string;
  workType: "reservation" | "message" | "consultation" | "other";
  duration: number;
}

interface StaffStats {
  todayWorkHours: number;
  weeklyWorkHours: number;
  monthlyWorkHours: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
}

interface StaffPermissions {
  canViewReservations: boolean;
  canEditReservations: boolean;
  canViewMessages: boolean;
  canSendMessages: boolean;
  canViewReports: boolean;
  canManageStudents: boolean;
}

export default function StaffHomePage() {
  const { user, logout } = useAuth();
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [stats, setStats] = useState<StaffStats | null>(null);
  const [permissions, setPermissions] = useState<StaffPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [attendanceStatus, setAttendanceStatus] = useState<
    "not_checked" | "checked_in" | "checked_out"
  >("not_checked");
  const [attendanceTime, setAttendanceTime] = useState<string>("");

  useEffect(() => {
    // 실제 API 호출로 대체
    setTimeout(() => {
      setWorkLogs([
        {
          id: "1",
          date: "2024-01-15",
          startTime: "09:00",
          endTime: "10:30",
          workTitle: "예약 관리",
          workContent: "학생 예약 변경 및 취소 처리",
          workType: "reservation",
          duration: 90,
        },
        {
          id: "2",
          date: "2024-01-15",
          startTime: "11:00",
          endTime: "12:00",
          workTitle: "상담 대응",
          workContent: "학부모 상담 및 문의 응답",
          workType: "consultation",
          duration: 60,
        },
        {
          id: "3",
          date: "2024-01-15",
          startTime: "14:00",
          endTime: "15:00",
          workTitle: "메시지 발송",
          workContent: "수업 리마인드 메시지 발송",
          workType: "message",
          duration: 60,
        },
      ]);

      setStats({
        todayWorkHours: 4.5,
        weeklyWorkHours: 32,
        monthlyWorkHours: 140,
        totalTasks: 15,
        completedTasks: 12,
        pendingTasks: 3,
      });

      setPermissions({
        canViewReservations: true,
        canEditReservations: false,
        canViewMessages: true,
        canSendMessages: true,
        canViewReports: false,
        canManageStudents: false,
      });

      // 오늘 날짜 확인
      const today = new Date().toISOString().split("T")[0];
      const storedAttendance = localStorage.getItem(
        `attendance_${today}_${user?.id}`,
      );

      if (storedAttendance) {
        const attendanceData = JSON.parse(storedAttendance);
        setAttendanceStatus(attendanceData.status);
        setAttendanceTime(attendanceData.time);
      } else {
        setAttendanceStatus("not_checked");
      }

      setLoading(false);
    }, 1000);
  }, [user?.id]);

  const handleAttendance = () => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const currentTime = now.toTimeString().split(" ")[0];

    if (attendanceStatus === "not_checked") {
      // 출근 처리
      const attendanceData = {
        status: "checked_in",
        time: currentTime,
        date: today,
      };
      localStorage.setItem(
        `attendance_${today}_${user?.id}`,
        JSON.stringify(attendanceData),
      );
      setAttendanceStatus("checked_in");
      setAttendanceTime(currentTime);
    } else if (attendanceStatus === "checked_in") {
      // 퇴근 처리
      const attendanceData = {
        status: "checked_out",
        time: currentTime,
        date: today,
      };
      localStorage.setItem(
        `attendance_${today}_${user?.id}`,
        JSON.stringify(attendanceData),
      );
      setAttendanceStatus("checked_out");
    }
  };

  const getWorkTypeColor = (type: string) => {
    switch (type) {
      case "reservation":
        return "bg-blue-100 text-blue-800";
      case "message":
        return "bg-green-100 text-green-800";
      case "consultation":
        return "bg-purple-100 text-purple-800";
      case "other":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getWorkTypeText = (type: string) => {
    switch (type) {
      case "reservation":
        return "예약관리";
      case "message":
        return "메시지발송";
      case "consultation":
        return "상담대응";
      case "other":
        return "기타";
      default:
        return "알 수 없음";
    }
  };

  // 권한 확인
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-red-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            로그인이 필요합니다
          </h2>
          <p className="text-gray-600 mb-6">
            직원 대시보드에 접근하려면 로그인이 필요합니다.
          </p>
          <Link
            href="/auth/login"
            className="block w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

  // 직원 권한 확인
  if (user.role !== "staff") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-red-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            접근 권한 없음
          </h2>
          <p className="text-gray-600 mb-6">
            직원 대시보드에 접근할 권한이 없습니다.
            <br />
            현재 권한:{" "}
            {user.role === "admin"
              ? "관리자"
              : user.role === "teacher"
                ? "강사"
                : user.role === "student"
                  ? "학생"
                  : user.role}
          </p>
          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              메인으로 돌아가기
            </Link>
            <button
              onClick={logout}
              className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* 환영 메시지 */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              안녕하세요, {user.name}님! 👋
            </h1>
            <p className="text-lg text-gray-600">
              오늘도 효율적인 업무 되세요!
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* 현재 사용자 정보 */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-purple-600" />
                <div className="text-sm">
                  <div className="font-medium text-purple-900">
                    {user.name} (직원)
                  </div>
                  <div className="text-purple-700">
                    {user.email} • {user.department}
                  </div>
                </div>
              </div>
            </div>

            {/* 로그아웃 버튼 */}
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          </div>
        </div>
      </div>

      {/* 근태 상태 */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                attendanceStatus === "checked_in"
                  ? "bg-green-100 text-green-600"
                  : attendanceStatus === "checked_out"
                    ? "bg-gray-100 text-gray-600"
                    : "bg-yellow-100 text-yellow-600"
              }`}
            >
              {attendanceStatus === "checked_in" ? (
                <CheckCircle className="w-6 h-6" />
              ) : attendanceStatus === "checked_out" ? (
                <Clock className="w-6 h-6" />
              ) : (
                <AlertCircle className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {attendanceStatus === "checked_in"
                  ? "출근 완료"
                  : attendanceStatus === "checked_out"
                    ? "퇴근 완료"
                    : "출근 대기"}
              </h3>
              <p className="text-sm text-gray-600">
                {attendanceStatus === "checked_in"
                  ? `출근 시간: ${attendanceTime}`
                  : attendanceStatus === "checked_out"
                    ? "수고하셨습니다!"
                    : "출근하기 버튼을 눌러주세요"}
              </p>
            </div>
          </div>
          <button
            onClick={handleAttendance}
            className={`px-4 py-2 rounded-lg transition-colors ${
              attendanceStatus === "checked_in"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {attendanceStatus === "checked_in" ? "퇴근하기" : "출근하기"}
          </button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">오늘 근무시간</div>
              <div className="text-2xl font-bold text-gray-900">
                {stats?.todayWorkHours}시간
              </div>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
          <div className="mt-2 text-sm text-gray-500">
            이번 주 {stats?.weeklyWorkHours}시간
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">완료된 업무</div>
              <div className="text-2xl font-bold text-green-600">
                {stats?.completedTasks}건
              </div>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div className="mt-2 text-sm text-gray-500">
            총 {stats?.totalTasks}건 중
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">대기 업무</div>
              <div className="text-2xl font-bold text-yellow-600">
                {stats?.pendingTasks}건
              </div>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
          <div className="mt-2 text-sm text-gray-500">처리 필요</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">이번 달 근무</div>
              <div className="text-2xl font-bold text-purple-600">
                {stats?.monthlyWorkHours}시간
              </div>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
          <div className="mt-2 text-sm text-gray-500">월간 목표 달성</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 오늘의 업무 기록 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              오늘의 업무 기록
            </h2>
            <Link
              href="/staff/work-log"
              className="flex items-center text-sm text-blue-600 hover:text-blue-700"
            >
              전체보기
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {workLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>오늘 기록된 업무가 없습니다</p>
            </div>
          ) : (
            <div className="space-y-4">
              {workLogs.map((work) => (
                <div
                  key={work.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {work.startTime}
                      </div>
                      <div className="text-xs text-gray-500">
                        {work.duration}분
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {work.workTitle}
                      </div>
                      <div className="text-sm text-gray-600">
                        {work.workContent}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getWorkTypeColor(work.workType)}`}
                        >
                          {getWorkTypeText(work.workType)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-gray-500">{work.endTime}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6">
            <Link
              href="/staff/work-log/new"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              업무 기록 추가
            </Link>
          </div>
        </div>

        {/* 권한 정보 및 빠른 액션 */}
        <div className="space-y-6">
          {/* 권한 정보 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              권한 정보
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">
                    예약 관리
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {permissions?.canEditReservations ? "편집 가능" : "열람만"}
                  </span>
                  <Shield className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">
                    메시지 발송
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {permissions?.canSendMessages ? "가능" : "불가"}
                  </span>
                  <Shield className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-900">
                    학생 관리
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {permissions?.canManageStudents ? "가능" : "불가"}
                  </span>
                  <Shield className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* 빠른 액션 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              빠른 액션
            </h2>
            <div className="space-y-3">
              {permissions?.canViewReservations && (
                <Link
                  href="/staff/reservations"
                  className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-blue-900">예약 관리</div>
                    <div className="text-sm text-blue-700">
                      예약 확인 및 관리
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-blue-600 ml-auto" />
                </Link>
              )}

              {permissions?.canSendMessages && (
                <Link
                  href="/staff/messages"
                  className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium text-green-900">
                      메시지 발송
                    </div>
                    <div className="text-sm text-green-700">
                      학생 및 학부모 연락
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-green-600 ml-auto" />
                </Link>
              )}

              <Link
                href="/staff/work-log/new"
                className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <FileText className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="font-medium text-purple-900">업무 기록</div>
                  <div className="text-sm text-purple-700">업무 내용 기록</div>
                </div>
                <ChevronRight className="w-4 h-4 text-purple-600 ml-auto" />
              </Link>

              <Link
                href="/staff/attendance"
                className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <Clock className="w-5 h-5 text-orange-600" />
                <div>
                  <div className="font-medium text-orange-900">근태 확인</div>
                  <div className="text-sm text-orange-700">출근/퇴근 기록</div>
                </div>
                <ChevronRight className="w-4 h-4 text-orange-600 ml-auto" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 알림 및 공지사항 */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          알림 및 공지사항 📢
        </h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-gray-900">업무 권한 변경</h3>
              <p className="text-sm text-gray-600">
                예약 편집 권한이 제한되었습니다. 관리자에게 문의하세요.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
            <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-gray-900">메시지 발송 완료</h3>
              <p className="text-sm text-gray-600">
                오늘 예정된 수업 리마인드 메시지가 모두 발송되었습니다.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
            <Phone className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-gray-900">상담 요청</h3>
              <p className="text-sm text-gray-600">
                새로운 상담 요청이 2건 접수되었습니다. 확인 후 응답해주세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

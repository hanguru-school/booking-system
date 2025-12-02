"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  TrendingUp,
  Award,
  Star,
  Users,
  FileText,
  Edit,
  Eye,
} from "lucide-react";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import Navigation from "@/components/common/Navigation";

interface TeacherStats {
  currentLevel: string;
  averageScore: number;
  completedClasses: number;
  totalClasses: number;
  points: number;
  studyStreak: number;
  upcomingClasses: number;
  totalStudents: number;
  monthlyClasses: number;
  completedLessons: number;
}

interface RecentNote {
  id: string;
  studentName: string;
  subject: string;
  date: string;
  content: string;
}

interface RecentReservation {
  id: string;
  studentName: string;
  date: string;
  time: string;
  subject: string;
  status: "confirmed" | "pending" | "cancelled";
}

export default function TeacherHomePage() {
  return (
    <ProtectedRoute allowedRoles={["TEACHER"]}>
      <div className="min-h-screen bg-gray-50">
        <Navigation userRole="TEACHER" />
        <TeacherHomeContent />
      </div>
    </ProtectedRoute>
  );
}

function TeacherHomeContent() {
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [recentNotes, setRecentNotes] = useState<RecentNote[]>([]);
  const [recentReservations, setRecentReservations] = useState<
    RecentReservation[]
  >([]);
  const [loading, setLoading] = useState(true);

  // 랜덤 환영 메시지
  const welcomeMessages = [
    "오늘도 좋은 수업 되세요!",
    "학생들과 함께하는 즐거운 하루 되세요!",
    "열정적인 수업으로 학생들을 이끌어주세요!",
    "오늘도 학생들의 성장을 도와주세요!",
    "좋은 수업으로 학생들에게 영감을 주세요!",
    "오늘도 학생들과 함께 배우는 시간 되세요!",
    "열심히 가르쳐주셔서 감사합니다!",
    "학생들의 미래를 밝혀주시는 선생님!",
    "오늘도 훌륭한 수업 부탁드립니다!",
    "학생들과 함께하는 특별한 시간 되세요!",
  ];

  const [welcomeMessage] = useState(
    () => welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)],
  );

  useEffect(() => {
    // 실제 API 호출로 대체 - 로그인된 선생님 ID로 필터링
    const teacherId = localStorage.getItem("teacherId") || "T-001"; // 실제로는 인증 시스템에서 가져옴

    setTimeout(() => {
      setStats({
        currentLevel: "고급",
        averageScore: 85,
        completedClasses: 45,
        totalClasses: 50,
        points: 1250,
        studyStreak: 12,
        upcomingClasses: 5,
        totalStudents: 25,
        monthlyClasses: 20,
        completedLessons: 180,
      });

      // 본인의 수업노트만 표시
      setRecentNotes([
        {
          id: "1",
          studentName: "김학생",
          subject: "문법",
          date: "2024-01-15",
          content: "기본 문법 구조 학습 완료",
        },
        {
          id: "2",
          studentName: "이학생",
          subject: "회화",
          date: "2024-01-14",
          content: "일상 대화 연습 및 발음 교정",
        },
      ]);

      // 본인의 예약만 표시
      setRecentReservations([
        {
          id: "1",
          studentName: "박학생",
          date: "2024-01-16",
          time: "14:00",
          subject: "문법",
          status: "confirmed",
        },
        {
          id: "2",
          studentName: "최학생",
          date: "2024-01-16",
          time: "16:00",
          subject: "회화",
          status: "confirmed",
        },
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          선생님 대시보드
        </h1>
        <p className="text-lg text-gray-600">{welcomeMessage}</p>
      </div>

      {/* 주요 기능 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Award className="w-6 h-6 text-blue-600" />
          주요 기능
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/teacher/lesson-editor"
            className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Edit className="w-8 h-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-900 text-center">
              수업 노트 작성
            </span>
          </Link>

          <Link
            href="/teacher/today-classes"
            className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Eye className="w-8 h-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-900 text-center">
              오늘의 수업 확인
            </span>
          </Link>

          <Link
            href="/teacher/notes"
            className="flex flex-col items-center justify-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <FileText className="w-8 h-8 text-orange-600 mb-2" />
            <span className="text-sm font-medium text-gray-900 text-center">
              수업 노트 관리
            </span>
          </Link>

          <Link
            href="/teacher/schedule"
            className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <Calendar className="w-8 h-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-900 text-center">
              일정 관리
            </span>
          </Link>
        </div>
      </div>

      {/* 통계 카드들 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">이번달 수업</div>
              <div className="text-2xl font-bold text-gray-900">
                {stats?.monthlyClasses}회
              </div>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
          <div className="mt-2 text-sm text-gray-500">
            완료 {stats?.completedClasses}회 / 예정 {stats?.upcomingClasses}회
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">총 학생 수</div>
              <div className="text-2xl font-bold text-gray-900">
                {stats?.totalStudents}명
              </div>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
          <div className="mt-2 text-sm text-gray-500">활성 학생 관리</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">평균 점수</div>
              <div className="text-2xl font-bold text-gray-900">
                {stats?.averageScore}%
              </div>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
          <div className="mt-2 text-sm text-gray-500">학생 성과 지표</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">포인트</div>
              <div className="text-2xl font-bold text-gray-900">
                {stats?.points}
              </div>
            </div>
            <Star className="w-8 h-8 text-yellow-600" />
          </div>
          <div className="mt-2 text-sm text-gray-500">누적 포인트</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 수업 노트 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              최근 수업 노트
            </h3>
            <Link
              href="/teacher/notes"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              전체보기 →
            </Link>
          </div>
          <div className="space-y-3">
            {recentNotes.map((note) => (
              <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">
                    {note.studentName}
                  </span>
                  <span className="text-sm text-gray-500">{note.date}</span>
                </div>
                <div className="text-sm text-gray-600 mb-1">{note.subject}</div>
                <p className="text-sm text-gray-700 line-clamp-2">
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 오늘의 예약 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">오늘의 예약</h3>
            <Link
              href="/teacher/reservations"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              전체보기 →
            </Link>
          </div>
          <div className="space-y-3">
            {recentReservations.map((reservation) => (
              <div key={reservation.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">
                    {reservation.studentName}
                  </span>
                  <span className="text-sm text-gray-500">
                    {reservation.time}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {reservation.subject}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      reservation.status === "confirmed"
                        ? "bg-green-500"
                        : reservation.status === "pending"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                  ></div>
                  <span className="text-xs text-gray-500">
                    {reservation.status === "confirmed"
                      ? "확정"
                      : reservation.status === "pending"
                        ? "대기"
                        : "취소"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

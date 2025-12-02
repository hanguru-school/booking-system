"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  User,
  BookOpen,
  ArrowLeft,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface TodayClass {
  id: string;
  studentName: string;
  time: string;
  subject: string;
  duration: number;
  status: "completed" | "upcoming" | "cancelled";
  noteId?: string;
}

export default function TodayClassesPage() {
  const [todayClasses, setTodayClasses] = useState<TodayClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    // Mock data - 실제로는 API에서 가져옴
    setTimeout(() => {
      const mockClasses: TodayClass[] = [
        {
          id: "1",
          studentName: "김학생",
          time: "09:00",
          subject: "문법",
          duration: 60,
          status: "completed",
          noteId: "note1",
        },
        {
          id: "2",
          studentName: "이학생",
          time: "11:00",
          subject: "회화",
          duration: 60,
          status: "upcoming",
        },
        {
          id: "3",
          studentName: "박학생",
          time: "14:00",
          subject: "독해",
          duration: 60,
          status: "upcoming",
        },
        {
          id: "4",
          studentName: "최학생",
          time: "16:00",
          subject: "듣기",
          duration: 60,
          status: "upcoming",
        },
      ];
      setTodayClasses(mockClasses);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "완료";
      case "upcoming":
        return "예정";
      case "cancelled":
        return "취소";
      default:
        return "알 수 없음";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "upcoming":
        return <Clock className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/teacher/home"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>뒤로가기</span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">오늘의 수업</h1>
            <p className="text-gray-600">{formatDate(selectedDate)}</p>
          </div>
        </div>
      </div>

      {/* 수업 목록 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">수업 일정</h2>
          <div className="text-sm text-gray-600">
            총 {todayClasses.length}개 수업
          </div>
        </div>

        {todayClasses.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              오늘 수업이 없습니다
            </h3>
            <p className="text-gray-600">
              오늘은 수업이 예정되어 있지 않습니다.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {todayClasses.map((classItem) => (
              <div
                key={classItem.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {classItem.studentName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {classItem.subject}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {classItem.time}
                      </div>
                      <div className="text-sm text-gray-600">
                        {classItem.duration}분
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(classItem.status)}`}
                    >
                      {getStatusIcon(classItem.status)}
                      {getStatusText(classItem.status)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BookOpen className="w-4 h-4" />
                    <span>{classItem.subject} 수업</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {classItem.status === "completed" && classItem.noteId ? (
                      <Link
                        href={`/teacher/lesson-editor?noteId=${classItem.noteId}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        노트 보기
                      </Link>
                    ) : classItem.status === "upcoming" ? (
                      <Link
                        href={`/teacher/lesson-editor?student=${classItem.studentName}&time=${classItem.time}&subject=${classItem.subject}`}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        노트 작성
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">완료된 수업</div>
              <div className="text-2xl font-bold text-green-600">
                {todayClasses.filter((c) => c.status === "completed").length}
              </div>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">예정된 수업</div>
              <div className="text-2xl font-bold text-blue-600">
                {todayClasses.filter((c) => c.status === "upcoming").length}
              </div>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">총 수업 시간</div>
              <div className="text-2xl font-bold text-purple-600">
                {todayClasses.reduce((total, c) => total + c.duration, 0)}분
              </div>
            </div>
            <Calendar className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BookOpen, Calendar, Clock, User, Edit } from "lucide-react";

interface Lesson {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  startTime: string;
  endTime: string;
  teacherName: string;
  courseName: string;
  status: string;
  notes?: string;
}

function StudentLessonsContent() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get('studentId');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessons();
  }, [studentId]);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const url = studentId 
        ? `/api/admin/reservations?studentId=${studentId}`
        : '/api/admin/reservations';
      
      const response = await fetch(url, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.reservations) {
          setLessons(data.reservations.map((r: any) => ({
            id: r.id,
            studentId: r.studentId,
            studentName: r.studentName,
            date: r.date,
            startTime: r.time || r.startTime,
            endTime: r.endTime,
            teacherName: r.teacherName || '미배정',
            courseName: r.courseName || r.serviceName,
            status: r.status,
            notes: r.notes,
          })));
        }
      }
    } catch (error) {
      console.error('수업 정보 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">수업 정보</h1>
          <p className="text-lg text-gray-600 mt-2">
            학생의 전체 수업 이력을 상세히 열람하고 관리합니다.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {lessons.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">수업 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {lessons.map((lesson) => (
                <div key={lesson.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-gray-900">
                          {formatDate(lesson.date)}
                        </span>
                        <Clock className="w-4 h-4 text-gray-400 ml-2" />
                        <span className="text-sm text-gray-600">
                          {lesson.startTime} - {lesson.endTime}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div>
                          <span className="text-sm text-gray-500">학생:</span>
                          <span className="ml-2 text-sm font-medium">{lesson.studentName}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">선생님:</span>
                          <span className="ml-2 text-sm font-medium">{lesson.teacherName}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">코스:</span>
                          <span className="ml-2 text-sm font-medium">{lesson.courseName}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">상태:</span>
                          <span className={`ml-2 text-sm px-2 py-1 rounded ${
                            lesson.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            lesson.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {lesson.status === 'COMPLETED' ? '완료' :
                             lesson.status === 'CANCELLED' ? '취소' : '예정'}
                          </span>
                        </div>
                      </div>
                      {lesson.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <p className="text-sm text-gray-700">{lesson.notes}</p>
                        </div>
                      )}
                    </div>
                    <button className="ml-4 text-blue-600 hover:text-blue-900">
                      <Edit className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudentLessonsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <StudentLessonsContent />
    </Suspense>
  );
}


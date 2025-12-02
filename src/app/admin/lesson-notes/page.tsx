"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Eye,
  Calendar,
  User,
  Clock,
  FileText,
} from "lucide-react";
import Link from "next/link";

interface LessonNote {
  id: string;
  title: string;
  content: string;
  date: string;
  teacher: {
    name: string;
  } | null;
  reservationId: string | null;
  createdAt: string;
}

function AdminLessonNotesContent() {
  const searchParams = useSearchParams();
  const reservationId = searchParams.get('reservationId');
  const studentId = searchParams.get('studentId');
  
  const [lessonNotes, setLessonNotes] = useState<LessonNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [reservationInfo, setReservationInfo] = useState<any>(null);
  const [studentInfo, setStudentInfo] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 예약 정보 조회
        if (reservationId) {
          const reservationResponse = await fetch(`/api/admin/reservations/${reservationId}`, {
            credentials: 'include',
          });
          if (reservationResponse.ok) {
            const reservationData = await reservationResponse.json();
            setReservationInfo(reservationData.reservation);
            
            // 예약에 연결된 레슨노트 조회
            if (reservationData.reservation?.lessonNotes) {
              setLessonNotes(reservationData.reservation.lessonNotes);
            } else {
              // 예약 ID로 레슨노트 조회
              const notesResponse = await fetch(`/api/admin/lesson-notes?reservationId=${reservationId}`, {
                credentials: 'include',
              });
              if (notesResponse.ok) {
                const notesData = await notesResponse.json();
                setLessonNotes(notesData.notes || []);
              }
            }
          }
        } else if (studentId) {
          // 학생 ID로 레슨노트 조회
          const notesResponse = await fetch(`/api/admin/lesson-notes?studentId=${studentId}`, {
            credentials: 'include',
          });
          if (notesResponse.ok) {
            const notesData = await notesResponse.json();
            setLessonNotes(notesData.notes || []);
          }
          
          // 학생 정보 조회
          const studentResponse = await fetch(`/api/admin/students/${studentId}`, {
            credentials: 'include',
          });
          if (studentResponse.ok) {
            const studentData = await studentResponse.json();
            if (studentData.success) {
              setStudentInfo(studentData.student);
            }
          }
        }
      } catch (error) {
        console.error('레슨노트 조회 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [reservationId, studentId]);

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
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <Link
            href="/admin/students"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            학생 관리로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">레슨노트</h1>
          {reservationInfo && (
            <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">예약일:</span>
                  <p className="font-medium text-gray-900">
                    {reservationInfo.date ? new Date(reservationInfo.date).toLocaleDateString('ko-KR') : '-'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">시간:</span>
                  <p className="font-medium text-gray-900">
                    {reservationInfo.startTime 
                      ? new Date(reservationInfo.startTime).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        })
                      : '-'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">학생:</span>
                  <p className="font-medium text-gray-900">
                    {reservationInfo.student?.kanjiName || reservationInfo.student?.name || '-'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">강사:</span>
                  <p className="font-medium text-gray-900">
                    {reservationInfo.teacher?.kanjiName || reservationInfo.teacher?.name || '-'}
                  </p>
                </div>
              </div>
            </div>
          )}
          {studentInfo && !reservationInfo && (
            <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
              <div className="text-sm">
                <span className="text-gray-500">학생:</span>
                <span className="font-medium text-gray-900 ml-2">
                  {studentInfo.kanjiName || studentInfo.name || '-'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 레슨노트 목록 */}
        <div className="bg-white rounded-lg shadow-sm">
          {lessonNotes.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">레슨노트가 없습니다.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {lessonNotes.map((note) => (
                <div key={note.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {note.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        {note.date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(note.date).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit'
                              })}
                            </span>
                          </div>
                        )}
                        {note.teacher && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{note.teacher.name}</span>
                          </div>
                        )}
                        {note.createdAt && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {new Date(note.createdAt).toLocaleString('ko-KR')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="prose max-w-none">
                    <div 
                      className="text-gray-700 whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: note.content }}
                    />
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

export default function AdminLessonNotesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <AdminLessonNotesContent />
    </Suspense>
  );
}


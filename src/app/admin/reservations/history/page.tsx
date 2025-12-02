"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  MapPin,
  FileText,
  Eye,
} from "lucide-react";
import Link from "next/link";

interface Reservation {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  location: string;
  status: string;
  lessonType: string;
  notes?: string;
  teacher?: {
    id: string;
    name: string;
  } | null;
}

function ReservationHistoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const studentId = searchParams.get('studentId');
  
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!studentId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // 학생 정보 조회
        const studentResponse = await fetch(`/api/admin/students/${studentId}`, {
          credentials: 'include',
        });
        
        if (studentResponse.ok) {
          const studentData = await studentResponse.json();
          if (studentData.success && studentData.student) {
            setStudentInfo(studentData.student);
            
            // 예약 목록을 최신순으로 정렬
            const reservations = (studentData.student.reservations || []).sort((a: any, b: any) => {
              const dateA = a.date ? new Date(a.date).getTime() : 0;
              const dateB = b.date ? new Date(b.date).getTime() : 0;
              return dateB - dateA;
            });
            setReservations(reservations);
          }
        }
      } catch (error) {
        console.error('예약 이력 조회 오류:', error);
        setReservations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

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
          <h1 className="text-3xl font-bold text-gray-900">예약 이력</h1>
          {studentInfo && (
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

        {/* 예약 목록 */}
        <div className="bg-white rounded-lg shadow-sm">
          {reservations.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">예약 이력이 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">년월일</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">시분</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">수강시간</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">형식</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">담당선생님</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">수강여부</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">비고</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">레슨노트</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">상세보기</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reservations.map((reservation) => {
                    const dateStr = reservation.date 
                      ? new Date(reservation.date).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        })
                      : '-';
                    
                    let timeStr = '-';
                    if (reservation.startTime) {
                      try {
                        const startTime = new Date(reservation.startTime);
                        if (!isNaN(startTime.getTime())) {
                          timeStr = startTime.toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                          });
                        } else if (typeof reservation.startTime === 'string') {
                          timeStr = reservation.startTime;
                        }
                      } catch {
                        timeStr = reservation.startTime || '-';
                      }
                    }
                    
                    const durationStr = reservation.duration 
                      ? `${reservation.duration}분`
                      : '-';
                    
                    const locationStr = reservation.location === 'ONLINE' 
                      ? '온라인'
                      : reservation.location === 'OFFLINE'
                      ? '대면'
                      : reservation.location || '-';
                    
                    const teacherStr = reservation.teacher?.name || '미설정';
                    
                    const statusStr = reservation.status === 'ATTENDED' 
                      ? '완료'
                      : reservation.status === 'CANCELLED'
                      ? '취소'
                      : reservation.status === 'PENDING'
                      ? '대기'
                      : reservation.status === 'CONFIRMED'
                      ? '확정'
                      : reservation.status === 'NO_SHOW'
                      ? '불참'
                      : reservation.status || '-';
                    
                    const statusColor = reservation.status === 'ATTENDED' 
                      ? 'bg-green-100 text-green-800'
                      : reservation.status === 'CANCELLED'
                      ? 'bg-red-100 text-red-800'
                      : reservation.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : reservation.status === 'CONFIRMED'
                      ? 'bg-blue-100 text-blue-800'
                      : reservation.status === 'NO_SHOW'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-gray-100 text-gray-800';
                    
                    const notesStr = reservation.notes || '-';
                    
                    return (
                      <tr key={reservation.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                          {dateStr}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                          {timeStr}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                          {durationStr}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                          {locationStr}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                          {teacherStr}
                        </td>
                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                            {statusStr}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate" title={notesStr}>
                          {notesStr}
                        </td>
                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          {reservation.id && (
                            <button
                              onClick={() => {
                                window.open(`/admin/lesson-notes?reservationId=${reservation.id}&studentId=${studentId}`, '_blank');
                              }}
                              className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              이동
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          <Link
                            href={`/admin/reservations/${reservation.id}`}
                            className="px-3 py-1 bg-gray-600 text-white text-xs rounded-lg hover:bg-gray-700 transition-colors inline-block"
                          >
                            보기
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReservationHistoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <ReservationHistoryContent />
    </Suspense>
  );
}




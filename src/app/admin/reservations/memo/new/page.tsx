"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X } from "lucide-react";

interface Reservation {
  id: string;
  date: string;
  startTime: string;
  studentName: string;
  teacherId?: string;
}

interface Teacher {
  id: string;
  name: string;
  kanjiName?: string;
}

interface Staff {
  id: string;
  name: string;
  kanjiName?: string;
}

export default function NewMemoPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    reservationId: "",
    relatedTeacherId: "",
    relatedStaffId: "",
    content: "",
    memoType: "class",
    isPublic: false,
  });

  useEffect(() => {
    fetchReservations();
    fetchTeachers();
    fetchStaff();
  }, [formData.date]);

  const fetchReservations = async () => {
    try {
      const response = await fetch('/api/reservations/list', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.reservations) {
          const dateReservations = data.reservations
            .filter((r: any) => {
              const resDate = r.date ? new Date(r.date).toISOString().split('T')[0] : '';
              return resDate === formData.date;
            })
            .map((r: any) => ({
              id: r.id,
              date: r.date,
              startTime: r.startTime,
              studentName: r.studentName || '알 수 없음',
              teacherId: r.teacherId,
            }));
          setReservations(dateReservations);
        }
      }
    } catch (error) {
      console.error('예약 목록 로드 오류:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/admin/teachers');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.teachers) {
          setTeachers(data.teachers.map((t: any) => ({
            id: t.id,
            name: t.kanjiName || t.name || '알 수 없음',
            kanjiName: t.kanjiName,
          })));
        }
      }
    } catch (error) {
      console.error('선생님 목록 로드 오류:', error);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/admin/staff');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.staff) {
          setStaff(data.staff.map((s: any) => ({
            id: s.id,
            name: s.kanjiName || s.name || '알 수 없음',
            kanjiName: s.kanjiName,
          })));
        }
      }
    } catch (error) {
      // API가 없을 수 있으므로 무시
      console.error('직원 목록 로드 오류:', error);
    }
  };

  const getMemoTypeColor = (type: string) => {
    switch (type) {
      case "class":
        return "bg-sky-100 text-sky-800 border-sky-300";
      case "staff":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "schedule":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "admin":
        return "bg-green-100 text-green-800 border-green-300";
      case "personal":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.content) {
      alert('내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/memos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          date: formData.date,
          time: formData.time,
          reservationId: formData.reservationId || null,
          relatedTeacherId: formData.relatedTeacherId || null,
          relatedStaffId: formData.relatedStaffId || null,
          content: formData.content,
          memoType: formData.memoType,
          isPublic: formData.isPublic,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('메모가 성공적으로 생성되었습니다.');
        router.push('/admin/reservations');
      } else {
        alert(data.message || '메모 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('메모 생성 오류:', error);
      alert('메모 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">새 메모 추가</h1>
          </div>
        </div>

        {/* 폼 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 날짜 및 시간 선택 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  날짜 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value, reservationId: "" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  시간 <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            {/* 메모 유형 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                메모 유형 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "class", label: "수업관련", color: "bg-sky-100 text-sky-800 border-sky-300" },
                  { value: "staff", label: "직원 관련", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
                  { value: "schedule", label: "일정관련", color: "bg-purple-100 text-purple-800 border-purple-300" },
                  { value: "admin", label: "관리자 업무", color: "bg-green-100 text-green-800 border-green-300" },
                  { value: "personal", label: "개인메모", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, memoType: type.value, reservationId: "", relatedTeacherId: "", relatedStaffId: "" });
                    }}
                    className={`px-4 py-3 border-2 rounded-lg font-medium transition-all ${
                      formData.memoType === type.value
                        ? `${type.color} border-current`
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 수업 관련 예약 선택 */}
            {formData.memoType === "class" && reservations.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  관련 예약 (선택사항)
                </label>
                <select
                  value={formData.reservationId}
                  onChange={(e) => setFormData({ ...formData, reservationId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">예약을 선택하세요 (선택사항)</option>
                  {reservations.map((reservation) => (
                    <option key={reservation.id} value={reservation.id}>
                      {new Date(reservation.startTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} - {reservation.studentName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 직원 관련 직원 선택 */}
            {formData.memoType === "staff" && staff.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  관련 직원 (선택사항)
                </label>
                <select
                  value={formData.relatedStaffId}
                  onChange={(e) => setFormData({ ...formData, relatedStaffId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">직원을 선택하세요 (선택사항)</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 일정관련 선생님/직원 선택 */}
            {formData.memoType === "schedule" && (
              <div className="grid grid-cols-2 gap-4">
                {teachers.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      관련 선생님 (선택사항)
                    </label>
                    <select
                      value={formData.relatedTeacherId}
                      onChange={(e) => setFormData({ ...formData, relatedTeacherId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">선생님을 선택하세요</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {staff.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      관련 직원 (선택사항)
                    </label>
                    <select
                      value={formData.relatedStaffId}
                      onChange={(e) => setFormData({ ...formData, relatedStaffId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">직원을 선택하세요</option>
                      {staff.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* 내용 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="메모 내용을 입력하세요"
                required
              />
            </div>

            {/* 공개 여부 */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor="isPublic" className="text-sm font-medium text-gray-700 cursor-pointer">
                공개 (관련 직원과 함께 열람 가능)
              </label>
              <div className="text-xs text-gray-500 ml-auto">
                {formData.memoType === "class" && "관리자와 해당 수업 담당자"}
                {formData.memoType === "staff" && "해당 직원과 관리자"}
                {formData.memoType === "schedule" && "해당 선생님/직원과 관리자"}
                {formData.memoType === "admin" && "모든 관리자"}
                {formData.memoType === "personal" && "작성자만"}
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
                취소
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {loading ? '저장 중...' : '저장'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

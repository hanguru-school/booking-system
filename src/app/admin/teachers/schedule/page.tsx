"use client";

import { useState, useEffect } from "react";
import { Clock, Save, Calendar, User, Plus, X } from "lucide-react";

interface Teacher {
  id: string;
  name: string;
}

interface ScheduleSlot {
  dayOfWeek: number; // 0 = 일요일, 1 = 월요일, ..., 6 = 토요일
  startTime: string; // HH:MM 형식
  endTime: string; // HH:MM 형식
}

interface TeacherSchedule {
  teacherId: string;
  teacherName: string;
  weeklySchedule: ScheduleSlot[];
  specificDates: {
    date: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }[];
}

const daysOfWeek = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

export default function TeacherSchedulePage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [schedules, setSchedules] = useState<TeacherSchedule[]>([]);
  const [currentSchedule, setCurrentSchedule] = useState<TeacherSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (selectedTeacher) {
      fetchSchedule(selectedTeacher);
    }
  }, [selectedTeacher]);

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/admin/teachers', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.teachers) {
          setTeachers(data.teachers.map((t: any) => ({
            id: t.id,
            name: t.name,
          })));
        }
      }
    } catch (error) {
      console.error('선생님 목록 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedule = async (teacherId: string) => {
    try {
      const response = await fetch(`/api/admin/teachers/${teacherId}/schedule`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.schedule) {
          setCurrentSchedule(data.schedule);
        } else {
          // 스케줄이 없으면 새로 생성
          const teacher = teachers.find(t => t.id === teacherId);
          setCurrentSchedule({
            teacherId,
            teacherName: teacher?.name || '',
            weeklySchedule: [],
            specificDates: [],
          });
        }
      }
    } catch (error) {
      console.error('스케줄 로드 오류:', error);
      const teacher = teachers.find(t => t.id === teacherId);
      setCurrentSchedule({
        teacherId,
        teacherName: teacher?.name || '',
        weeklySchedule: [],
        specificDates: [],
      });
    }
  };

  const addWeeklySlot = () => {
    if (!currentSchedule) return;
    setCurrentSchedule({
      ...currentSchedule,
      weeklySchedule: [
        ...currentSchedule.weeklySchedule,
        { dayOfWeek: 0, startTime: '09:00', endTime: '18:00' },
      ],
    });
  };

  const removeWeeklySlot = (index: number) => {
    if (!currentSchedule) return;
    setCurrentSchedule({
      ...currentSchedule,
      weeklySchedule: currentSchedule.weeklySchedule.filter((_, i) => i !== index),
    });
  };

  const updateWeeklySlot = (index: number, field: keyof ScheduleSlot, value: any) => {
    if (!currentSchedule) return;
    const updated = [...currentSchedule.weeklySchedule];
    updated[index] = { ...updated[index], [field]: value };
    setCurrentSchedule({
      ...currentSchedule,
      weeklySchedule: updated,
    });
  };

  const handleSave = async () => {
    if (!currentSchedule || !selectedTeacher) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/admin/teachers/${selectedTeacher}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(currentSchedule),
      });

      if (response.ok) {
        alert('업무시간이 저장되었습니다.');
      } else {
        alert('업무시간 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('업무시간 저장 오류:', error);
      alert('업무시간 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
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
          <h1 className="text-3xl font-bold text-gray-900">선생님 업무시간</h1>
          <p className="text-lg text-gray-600 mt-2">
            각 선생님들의 출근 가능 일시를 일별 요일별 등으로 설정 가능합니다.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              선생님 선택
            </label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">선생님을 선택하세요</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedTeacher && currentSchedule && (
          <div className="space-y-6">
            {/* 주간 스케줄 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">요일별 업무시간</h2>
                </div>
                <button
                  onClick={addWeeklySlot}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-5 h-5" />
                  시간 추가
                </button>
              </div>

              {currentSchedule.weeklySchedule.length === 0 ? (
                <p className="text-gray-500 text-center py-8">등록된 업무시간이 없습니다.</p>
              ) : (
                <div className="space-y-3">
                  {currentSchedule.weeklySchedule.map((slot, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                      <select
                        value={slot.dayOfWeek}
                        onChange={(e) => updateWeeklySlot(index, 'dayOfWeek', parseInt(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {daysOfWeek.map((day, idx) => (
                          <option key={idx} value={idx}>
                            {day}
                          </option>
                        ))}
                      </select>
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => updateWeeklySlot(index, 'startTime', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-500">~</span>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => updateWeeklySlot(index, 'endTime', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => removeWeeklySlot(index)}
                        className="ml-auto text-red-600 hover:text-red-900"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 저장 버튼 */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {saving ? '저장 중...' : '업무시간 저장'}
              </button>
            </div>
          </div>
        )}

        {!selectedTeacher && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">선생님을 선택하면 업무시간을 설정할 수 있습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}



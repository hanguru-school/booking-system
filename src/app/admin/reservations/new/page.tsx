"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X, Search } from "lucide-react";

interface Student {
  id: string;
  name: string;
  kanjiName?: string;
  studentId?: string;
}

interface Teacher {
  id: string;
  name: string;
  kanjiName?: string;
}

export default function NewReservationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [durations, setDurations] = useState<number[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const studentDropdownRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    studentId: "",
    courseName: "",
    teacherId: "",
    date: new Date().toISOString().split('T')[0],
    hour: "09",
    minute: "00",
    duration: 60,
    notes: "",
    location: "OFFLINE",
  });

  // 학생 검색 필터링 (검색어가 없으면 모든 학생 표시, 있으면 필터링)
  const filteredStudents = useMemo(() => {
    // 검색어가 없거나 공백만 있으면 모든 학생 반환
    if (!studentSearch || !studentSearch.trim()) {
      return students;
    }
    // 검색어가 있으면 필터링
    const searchLower = studentSearch.trim().toLowerCase();
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchLower) ||
        student.kanjiName?.toLowerCase().includes(searchLower) ||
        student.studentId?.toLowerCase().includes(searchLower) ||
        student.name.includes(searchLower) ||
        student.kanjiName?.includes(searchLower) ||
        student.studentId?.includes(searchLower)
    );
  }, [students, studentSearch]);

  // 시간 옵션 생성 (00 ~ 23)
  const hourOptions = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  }, []);

  // 분 옵션 생성 (5분 단위: 00, 05, 10, ..., 55)
  const minuteOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));
  }, []);

  // 선택 가능한 시간인지 확인
  const isTimeAvailable = useCallback((hour: string, minute: string) => {
    const timeStr = `${hour}:${minute}`;
    return !bookedTimes.includes(timeStr);
  }, [bookedTimes]);

  useEffect(() => {
    fetchStudents();
    fetchTeachers();
    fetchCourses();
    fetchDurations();
  }, []);

  useEffect(() => {
    // 날짜나 선생님이 변경되면 예약된 시간 조회
    if (formData.date) {
      fetchBookedTimes();
    }
  }, [formData.date, formData.teacherId]);

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (studentDropdownRef.current && !studentDropdownRef.current.contains(event.target as Node)) {
        setShowStudentDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/admin/students', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.students) {
          setStudents(data.students.map((s: any) => ({
            id: s.id,
            name: s.kanjiName || s.name || '알 수 없음',
            kanjiName: s.kanjiName,
            studentId: s.studentId,
          })));
        }
      }
    } catch (error) {
      console.error('학생 목록 로드 오류:', error);
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

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/admin/settings/courses', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.courses) {
          setCourses(data.courses || []);
        }
      }
    } catch (error) {
      console.error('코스 목록 로드 오류:', error);
    }
  };

  const fetchDurations = async () => {
    try {
      const response = await fetch('/api/admin/settings/durations', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.durations) {
          setDurations(data.durations || []);
          // 기본값 설정
          if (data.durations && data.durations.length > 0) {
            setFormData(prev => ({ ...prev, duration: data.durations[0] }));
          }
        }
      }
    } catch (error) {
      console.error('수강시간 목록 로드 오류:', error);
    }
  };

  const fetchBookedTimes = async () => {
    try {
      const params = new URLSearchParams({ date: formData.date });
      if (formData.teacherId) {
        params.append('teacherId', formData.teacherId);
      }
      const response = await fetch(`/api/admin/reservations/available-times?${params}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const booked = data.bookedTimes || [];
          setBookedTimes(booked);
          // 현재 선택된 시간이 예약된 시간이면 첫 번째 가능한 시간으로 변경
          const currentTime = `${formData.hour}:${formData.minute}`;
          if (booked.includes(currentTime)) {
            // 예약 가능한 시간 찾기
            let found = false;
            for (let hour = 0; hour < 24 && !found; hour++) {
              for (let minute = 0; minute < 60 && !found; minute += 5) {
                const timeStr = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
                if (!booked.includes(timeStr)) {
                  setFormData(prev => ({ 
                    ...prev, 
                    hour: String(hour).padStart(2, "0"),
                    minute: String(minute).padStart(2, "0")
                  }));
                  found = true;
                }
              }
            }
            if (!found) {
              setFormData(prev => ({ 
                ...prev, 
                hour: "",
                minute: ""
              }));
            }
          }
        }
      }
    } catch (error) {
      console.error('예약된 시간 조회 오류:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.studentId || !formData.courseName || !formData.date || !formData.hour || !formData.minute) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    const timeStr = `${formData.hour}:${formData.minute}`;
    
    if (bookedTimes.includes(timeStr)) {
      alert('이미 예약된 시간입니다. 다른 시간을 선택해주세요.');
      return;
    }

    setLoading(true);
    try {
      const selectedTeacher = teachers.find(t => t.id === formData.teacherId);
      const response = await fetch('/api/admin/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          studentId: formData.studentId,
          courseName: formData.courseName,
          teacherName: selectedTeacher?.name || '',
          date: formData.date,
          time: timeStr,
          duration: formData.duration,
          notes: formData.notes,
          location: formData.location,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('예약이 성공적으로 생성되었습니다.');
        router.push('/admin/reservations');
      } else {
        alert(data.message || '예약 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('예약 생성 오류:', error);
      alert('예약 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const selectedStudent = students.find(s => s.id === formData.studentId);

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
            <h1 className="text-2xl font-bold text-gray-900">새 예약 추가</h1>
          </div>
        </div>

        {/* 폼 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 학생 선택 (검색 가능) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                학생 <span className="text-red-500">*</span>
              </label>
              <div className="relative" ref={studentDropdownRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={selectedStudent ? `${selectedStudent.name} ${selectedStudent.studentId ? `(${selectedStudent.studentId})` : ''}` : studentSearch}
                    onChange={(e) => {
                      const value = e.target.value;
                      setStudentSearch(value);
                      setShowStudentDropdown(true);
                      // 선택된 학생이 있으면 검색어 입력 시 선택 해제
                      if (value && selectedStudent) {
                        setFormData({ ...formData, studentId: "" });
                      }
                    }}
                    onFocus={() => {
                      setShowStudentDropdown(true);
                      // 포커스 시 선택된 학생이 있으면 검색어 초기화
                      if (selectedStudent) {
                        setStudentSearch("");
                        setFormData({ ...formData, studentId: "" });
                      }
                    }}
                    placeholder="학생 검색 (이름, 한자명, 학번) - 입력하지 않으면 전체 표시"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                {showStudentDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredStudents.length > 0 ? (
                      <>
                        <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-200 bg-gray-50">
                          {studentSearch.trim() 
                            ? `${filteredStudents.length}명의 학생이 검색되었습니다.` 
                            : `전체 ${filteredStudents.length}명의 학생`}
                        </div>
                        {filteredStudents.map((student) => (
                          <div
                            key={student.id}
                            onClick={() => {
                              setFormData({ ...formData, studentId: student.id });
                              setStudentSearch("");
                              setShowStudentDropdown(false);
                            }}
                            className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">{student.name}</div>
                            {student.kanjiName && student.kanjiName !== student.name && (
                              <div className="text-xs text-gray-500">한자명: {student.kanjiName}</div>
                            )}
                            {student.studentId && (
                              <div className="text-sm text-gray-500">학번: {student.studentId}</div>
                            )}
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="px-4 py-8 text-center text-gray-500">
                        검색 결과가 없습니다.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 코스명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                코스명 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.courseName}
                onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">코스를 선택하세요</option>
                {courses.map((course) => {
                  const courseName = typeof course === 'string' ? course : course.name;
                  const courseId = typeof course === 'string' ? course : (course.id || course.name);
                  return (
                    <option key={courseId} value={courseName}>
                      {courseName}
                    </option>
                  );
                })}
              </select>
              {courses.length === 0 && (
                <p className="mt-1 text-sm text-gray-500">
                  코스가 없습니다. <a href="/admin/settings/courses" className="text-blue-600 hover:underline">설정</a>에서 코스를 추가하세요.
                </p>
              )}
            </div>

            {/* 선생님 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                선생님
              </label>
              <select
                value={formData.teacherId}
                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">선생님을 선택하세요 (선택사항)</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 날짜 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                날짜 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* 시간 (시간과 분 따로 선택) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시간 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">시</label>
                  <select
                    value={formData.hour}
                    onChange={(e) => setFormData({ ...formData, hour: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !formData.hour ? 'border-gray-300' : 
                      isTimeAvailable(formData.hour, formData.minute) ? 'border-green-300' : 'border-red-300'
                    }`}
                    required
                  >
                    <option value="">시간</option>
                    {hourOptions.map((hour) => (
                      <option key={hour} value={hour}>
                        {hour}시
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">분</label>
                  <select
                    value={formData.minute}
                    onChange={(e) => setFormData({ ...formData, minute: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !formData.minute ? 'border-gray-300' : 
                      isTimeAvailable(formData.hour, formData.minute) ? 'border-green-300' : 'border-red-300'
                    }`}
                    required
                  >
                    <option value="">분</option>
                    {minuteOptions.map((minute) => (
                      <option key={minute} value={minute}>
                        {minute}분
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {formData.hour && formData.minute && !isTimeAvailable(formData.hour, formData.minute) && (
                <p className="mt-2 text-sm text-red-500">
                  이 시간은 이미 예약되어 있습니다. 다른 시간을 선택해주세요.
                </p>
              )}
            </div>

            {/* 수강 시간 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                수강 시간 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">수강 시간을 선택하세요</option>
                {durations.map((duration, index) => (
                  <option key={index} value={duration}>
                    {duration}분
                  </option>
                ))}
              </select>
              {durations.length === 0 && (
                <p className="mt-1 text-sm text-gray-500">
                  수강시간이 없습니다. <a href="/admin/settings/durations" className="text-blue-600 hover:underline">설정</a>에서 수강시간을 추가하세요.
                </p>
              )}
            </div>

            {/* 수업 형식 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                수업 형식
              </label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="OFFLINE">대면</option>
                <option value="ONLINE">온라인</option>
              </select>
            </div>

            {/* 메모 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                메모
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예약 관련 메모를 입력하세요"
              />
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
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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


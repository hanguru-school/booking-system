"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  FileText,
  X,
  Clock,
  User,
  MapPin,
} from "lucide-react";

interface Reservation {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  studentName: string;
  teacherName: string;
  status: string;
  location: string;
}

interface Memo {
  id: string;
  date: string;
  time: string;
  content: string;
  memoType: string;
  isPublic: boolean;
  authorName: string;
  reservationId?: string;
  relatedTeacherId?: string;
  relatedStaffId?: string;
}

const AdminReservationsContent = () => {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [activeTab, setActiveTab] = useState<"schedule" | "overview">("schedule");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMemoModal, setShowMemoModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [memoFormData, setMemoFormData] = useState({
    date: '',
    time: '',
    content: '',
    memoType: 'class',
    isPublic: false,
    reservationId: '',
    relatedTeacherId: '',
    relatedStaffId: '',
  });
  const [savingMemo, setSavingMemo] = useState(false);
  const [memoReservations, setMemoReservations] = useState<Reservation[]>([]);
  const [memoTeachers, setMemoTeachers] = useState<any[]>([]);
  const [memoStaff, setMemoStaff] = useState<any[]>([]);

  useEffect(() => {
    // 병렬로 데이터 가져오기
    const loadData = async () => {
        setLoading(true);
      try {
        // 예약과 메모를 병렬로 가져오기
        const [reservationsResponse, memosResponse] = await Promise.all([
          fetch('/api/reservations/list', {
          credentials: 'include',
          }),
          fetch('/api/admin/memos', {
            credentials: 'include',
          }),
        ]);

        // 예약 데이터 처리
        if (reservationsResponse.ok) {
        const reservationsData = await reservationsResponse.json();
          if (reservationsData.success && reservationsData.reservations) {
            const mappedReservations = reservationsData.reservations.map((res: any) => {
              // API에서 이미 로컬 시간으로 변환된 날짜/시간 사용
              // 또는 ISO 형식이 있으면 사용
              let date = res.date;
              let startTime = res.startTime;
              let endTime = res.endTime;
              
              // ISO 형식이 있으면 로컬 시간으로 변환
              if (res.dateISO) {
                const dateObj = new Date(res.dateISO);
                date = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
              }
              
              if (res.startTimeISO) {
                const timeObj = new Date(res.startTimeISO);
                startTime = `${String(timeObj.getHours()).padStart(2, '0')}:${String(timeObj.getMinutes()).padStart(2, '0')}`;
              }
              
              if (res.endTimeISO) {
                const timeObj = new Date(res.endTimeISO);
                endTime = `${String(timeObj.getHours()).padStart(2, '0')}:${String(timeObj.getMinutes()).padStart(2, '0')}`;
              }
              
              return {
                id: res.id,
                date: date,
                startTime: startTime,
                endTime: endTime,
                studentName: res.studentName || '알 수 없음',
                teacherName: res.teacherName || '미설정',
                status: res.status || 'pending',
                location: res.location || 'ONLINE',
              };
            });
            setReservations(mappedReservations);
          } else {
            setReservations([]);
          }
        } else {
          setReservations([]);
        }

        // 메모 데이터 처리
        if (memosResponse.ok) {
          const memosData = await memosResponse.json();
          if (memosData.success && memosData.memos) {
            setMemos(memosData.memos);
        } else {
            setMemos([]);
          }
        } else {
          setMemos([]);
        }
      } catch (error) {
        console.error('데이터 로드 오류:', error);
          setReservations([]);
        setMemos([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentDate]);

  const fetchMemoRelatedData = async (date: string) => {
    try {
      // 병렬로 모든 데이터 가져오기 (최적화)
      const [resResponse, teachersResponse, staffResponse] = await Promise.all([
        fetch('/api/reservations/list', { credentials: 'include' }),
        fetch('/api/admin/teachers', { credentials: 'include' }),
        fetch('/api/admin/staff', { credentials: 'include' }).catch(() => null), // staff API가 없을 수 있음
      ]);

      // 예약 목록 처리
      if (resResponse.ok) {
        const resData = await resResponse.json();
        if (resData.success && resData.reservations) {
          const dateReservations = resData.reservations
            .filter((r: any) => {
              const resDate = r.date ? new Date(r.date).toISOString().split('T')[0] : '';
              return resDate === date;
            })
            .map((r: any) => ({
              id: r.id,
              date: r.date,
              startTime: r.startTime,
              studentName: r.studentName || '알 수 없음',
            }));
          setMemoReservations(dateReservations);
        }
      }

      // 선생님 목록 처리
      if (teachersResponse.ok) {
        const teachersData = await teachersResponse.json();
        if (teachersData.success && teachersData.teachers) {
          setMemoTeachers(teachersData.teachers.map((t: any) => ({
            id: t.id,
            name: t.kanjiName || t.name || '알 수 없음',
          })));
        }
      }

      // 직원 목록 처리
      if (staffResponse && staffResponse.ok) {
        const staffData = await staffResponse.json();
        if (staffData.success && staffData.staff) {
          setMemoStaff(staffData.staff.map((s: any) => ({
            id: s.id,
            name: s.kanjiName || s.name || '알 수 없음',
          })));
        }
      }
    } catch (error) {
      console.error('관련 데이터 로드 오류:', error);
    }
  };

  const handleSaveMemo = async () => {
    if (!selectedMemo) return;

    setSavingMemo(true);
    try {
      const response = await fetch(`/api/admin/memos/${selectedMemo.id}`, {
        method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        credentials: 'include',
        body: JSON.stringify({
          date: memoFormData.date,
          time: memoFormData.time,
          reservationId: memoFormData.reservationId || null,
          relatedTeacherId: memoFormData.relatedTeacherId || null,
          relatedStaffId: memoFormData.relatedStaffId || null,
          content: memoFormData.content,
          memoType: memoFormData.memoType,
          isPublic: memoFormData.isPublic,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // 메모 목록 업데이트
        const updatedMemos = memos.map(m => 
          m.id === selectedMemo.id 
            ? {
                ...m,
                date: memoFormData.date,
                time: memoFormData.time,
                content: memoFormData.content,
                memoType: memoFormData.memoType,
                isPublic: memoFormData.isPublic,
                reservationId: memoFormData.reservationId || undefined,
                relatedTeacherId: memoFormData.relatedTeacherId || undefined,
                relatedStaffId: memoFormData.relatedStaffId || undefined,
              }
            : m
        );
        setMemos(updatedMemos);
        
        // 선택된 메모도 업데이트
        setSelectedMemo({
          ...selectedMemo,
          date: memoFormData.date,
          time: memoFormData.time,
          content: memoFormData.content,
          memoType: memoFormData.memoType,
          isPublic: memoFormData.isPublic,
        });

        setIsEditingMemo(false);
        alert('메모가 성공적으로 수정되었습니다.');
        } else {
        alert(data.message || '메모 수정에 실패했습니다.');
        }
      } catch (error) {
      console.error('메모 수정 오류:', error);
      alert('메모 수정 중 오류가 발생했습니다.');
      } finally {
      setSavingMemo(false);
    }
  };

  // 날짜 계산 메모이제이션
  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // 월요일을 시작으로 하기 위해 조정 (0=일요일 -> 1=월요일)
    const adjustedStartingDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    
    const days = [];
    
    // 이전 달의 마지막 날들
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = adjustedStartingDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonth.getDate() - i),
        isCurrentMonth: false,
      });
    }
    
    // 현재 달의 날들
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }
    
    // 다음 달의 첫 날들 (총 42개 셀을 채우기 위해)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }
    
    return days;
  }, [currentDate]);

  const getDaysInMonth = useCallback(() => daysInMonth, [daysInMonth]);

  // 주간 날짜 계산 메모이제이션
  const daysInWeek = useMemo(() => {
    const currentDay = currentDate.getDay();
    // 월요일을 시작으로 하기 위해 조정 (0=일요일 -> 1=월요일)
    const adjustedDay = currentDay === 0 ? 6 : currentDay - 1;
    const monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() - adjustedDay);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      days.push({
        date: day,
        isCurrentMonth: day.getMonth() === currentDate.getMonth(),
      });
    }
    
    return days;
  }, [currentDate]);

  const getDaysInWeek = useCallback(() => daysInWeek, [daysInWeek]);

  // 예약 필터링 메모이제이션 (날짜 비교 개선)
  const reservationsByDate = useMemo(() => {
    const map = new Map<string, Reservation[]>();
    reservations.forEach(res => {
      if (res.date) {
        // 날짜 문자열이 이미 YYYY-MM-DD 형식인 경우 그대로 사용
        let dateStr: string;
        if (typeof res.date === 'string' && res.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // 이미 올바른 형식
          dateStr = res.date;
        } else {
          // Date 객체나 다른 형식인 경우 파싱
          let dateObj: Date;
          if (typeof res.date === 'string') {
            // YYYY-MM-DD 형식으로 파싱 (시간대 변환 없이)
            const [year, month, day] = res.date.split('-').map(Number);
            dateObj = new Date(year, month - 1, day);
          } else {
            dateObj = new Date(res.date);
          }
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const day = String(dateObj.getDate()).padStart(2, '0');
          dateStr = `${year}-${month}-${day}`;
        }
        
        if (!map.has(dateStr)) {
          map.set(dateStr, []);
        }
        map.get(dateStr)!.push(res);
      }
    });
    return map;
  }, [reservations]);

  const getReservationsForDate = useCallback((date: Date) => {
    // 날짜를 로컬 시간대 기준으로 올바르게 포맷팅
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return reservationsByDate.get(dateStr) || [];
  }, [reservationsByDate]);

  // 메모 필터링 및 정렬 메모이제이션
  const memosByDate = useMemo(() => {
    const map = new Map<string, Memo[]>();
    memos.forEach(memo => {
      if (memo.date) {
        const memoDate = new Date(memo.date);
        const dateKey = `${memoDate.getFullYear()}-${memoDate.getMonth()}-${memoDate.getDate()}`;
        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }
        map.get(dateKey)!.push(memo);
      }
    });
    
    // 각 날짜별로 시간순 정렬
    map.forEach((memoList, key) => {
      memoList.sort((a, b) => {
        try {
          const timeA = a.time || '';
          const timeB = b.time || '';
          
          if (timeA.includes(':') && timeB.includes(':')) {
            const [hoursA, minutesA] = timeA.split(':').map(Number);
            const [hoursB, minutesB] = timeB.split(':').map(Number);
            return (hoursA * 60 + minutesA) - (hoursB * 60 + minutesB);
          }
          
          const dateA = new Date(timeA).getTime();
          const dateB = new Date(timeB).getTime();
          if (!isNaN(dateA) && !isNaN(dateB)) {
            return dateA - dateB;
          }
          
          return timeA.localeCompare(timeB);
        } catch {
          return 0;
        }
      });
    });
    
    return map;
  }, [memos]);

  const getMemosForDate = useCallback((date: Date) => {
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return memosByDate.get(dateKey) || [];
  }, [memosByDate]);

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

  const goToPreviousMonth = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (viewMode === 'week') {
      // 주별 보기: 이전 주로 이동
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 7);
      setCurrentDate(newDate);
    } else {
      // 일별 보기: 이전 날로 이동
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 1);
      setCurrentDate(newDate);
    }
  };

  const goToNextMonth = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (viewMode === 'week') {
      // 주별 보기: 다음 주로 이동
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 7);
      setCurrentDate(newDate);
    } else {
      // 일별 보기: 다음 날로 이동
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 1);
      setCurrentDate(newDate);
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setViewMode('day');
  };

  // 날짜 포맷팅 메모이제이션
  const formattedDate = useMemo(() => {
    if (viewMode === 'month') {
      return `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`;
    } else if (viewMode === 'week') {
      const startDate = daysInWeek[0].date;
      const endDate = daysInWeek[6].date;
      if (startDate.getMonth() === endDate.getMonth()) {
        return `${startDate.getFullYear()}년 ${startDate.getMonth() + 1}월 ${startDate.getDate()}일 - ${endDate.getDate()}일`;
      } else {
        return `${startDate.getFullYear()}년 ${startDate.getMonth() + 1}월 ${startDate.getDate()}일 - ${endDate.getMonth() + 1}월 ${endDate.getDate()}일`;
      }
    } else {
      return `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월 ${currentDate.getDate()}일`;
    }
  }, [currentDate, viewMode, daysInWeek]);

  // 시간 포맷팅 메모이제이션 (로컬 시간대 기준, 정확한 시간 표시)
  const formatTime = useCallback((timeStr: string) => {
    if (!timeStr) return '';
    try {
      // 이미 HH:MM 형식인 경우 (API에서 이미 변환된 경우)
      if (timeStr.match(/^\d{2}:\d{2}$/)) {
        return timeStr;
      }
      
      // ISO 문자열인 경우
      if (timeStr.includes('T') || timeStr.includes('Z')) {
        const time = new Date(timeStr);
        if (isNaN(time.getTime())) {
          return timeStr;
        }
        // 로컬 시간대의 시, 분을 직접 사용
        const hours = String(time.getHours()).padStart(2, '0');
        const minutes = String(time.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
      }
      
      // 다른 형식 시도
      const time = new Date(timeStr);
      if (!isNaN(time.getTime())) {
        const hours = String(time.getHours()).padStart(2, '0');
        const minutes = String(time.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
      }
      
      return timeStr;
    } catch {
      return timeStr;
    }
  }, []);

  const weekDays = useMemo(() => ['월', '화', '수', '목', '금', '토', '일'], []);

  return (
    <div className="p-2 sm:p-4 md:p-6 bg-gray-50 min-h-screen overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        {/* 탭 */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-gray-200 gap-2 sm:gap-0">
            <div className="flex w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('schedule')}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 font-medium text-xs sm:text-sm ${
                  activeTab === 'schedule'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                예약 일정
              </button>
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 font-medium text-xs sm:text-sm ${
                  activeTab === 'overview'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                개요
              </button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => router.push('/admin/reservations/new')}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">예약 추가</span>
                <span className="sm:hidden">추가</span>
              </button>
              <button
                onClick={() => router.push('/admin/reservations/memo/new')}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm font-medium"
              >
                <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">메모 추가</span>
                <span className="sm:hidden">메모</span>
              </button>
            </div>
          </div>
        </div>

        {activeTab === 'schedule' && (
          <div className="bg-white rounded-lg shadow-sm">
            {/* 캘린더 네비게이션 */}
            <div className="p-2 sm:p-4 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
              <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-start">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 min-w-[120px] sm:min-w-[140px] text-center">
                  {formattedDate}
                </h2>
                <button
                  onClick={goToNextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 rounded-lg p-1 w-full sm:w-auto justify-center">
                <button
                  onClick={goToToday}
                  className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'day'
                      ? 'bg-blue-600 text-white'
                      : 'text-blue-600 hover:bg-white'
                  }`}
                >
                  오늘
                </button>
                <div className="w-px h-4 sm:h-6 bg-gray-300"></div>
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-2 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'month'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-white'
                  }`}
                >
                  월별
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-2 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'week'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-white'
                  }`}
                >
                  주별
                </button>
              </div>
            </div>

            {/* 캘린더 */}
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">로딩 중...</p>
              </div>
            ) : (
              <div className="p-2 sm:p-4 overflow-x-auto">
                {/* 캘린더 그리드 */}
                {viewMode === 'day' ? (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* 날짜 헤더 */}
                    <div className="bg-gray-50 p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {formattedDate}
                      </h3>
                    </div>
                    
                    {/* 예약 및 메모 목록 */}
                    <div className="p-4">
                      {(() => {
                        const dayReservations = getReservationsForDate(currentDate);
                        const dayMemos = getMemosForDate(currentDate);
                        
                        // 예약과 메모를 시간순으로 합치기 (이미 정렬된 메모 사용)
                        const allItems = [
                          ...dayReservations
                            .slice()
                            .sort((a, b) => {
                              try {
                                const timeA = a.startTime ? new Date(a.startTime).getTime() : 0;
                                const timeB = b.startTime ? new Date(b.startTime).getTime() : 0;
                                if (!isNaN(timeA) && !isNaN(timeB)) {
                                  return timeA - timeB;
                                }
                                if (typeof a.startTime === 'string' && typeof b.startTime === 'string') {
                                  return a.startTime.localeCompare(b.startTime);
                                }
                                return 0;
                              } catch {
                                return 0;
                              }
                            })
                            .map(r => ({ type: 'reservation' as const, item: r, time: r.startTime })),
                          ...dayMemos.map(m => ({ type: 'memo' as const, item: m, time: m.time }))
                        ].sort((a, b) => {
                          try {
                            const timeA = a.time || '';
                            const timeB = b.time || '';
                            
                            if (timeA.includes(':') && timeB.includes(':')) {
                              const [hoursA, minutesA] = timeA.split(':').map(Number);
                              const [hoursB, minutesB] = timeB.split(':').map(Number);
                              return (hoursA * 60 + minutesA) - (hoursB * 60 + minutesB);
                            }
                            
                            const dateA = new Date(timeA).getTime();
                            const dateB = new Date(timeB).getTime();
                            if (!isNaN(dateA) && !isNaN(dateB)) {
                              return dateA - dateB;
                            }
                            
                            return timeA.localeCompare(timeB);
                          } catch {
                            return 0;
                          }
                        });

                        if (allItems.length === 0) {
    return (
                            <div className="text-center py-12">
                              <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                              <p className="text-sm font-medium text-gray-900 mb-1">
                                이 날짜에 등록된 예약이나 메모가 없습니다
                              </p>
      </div>
    );
  }

  return (
                          <div className="space-y-3">
                            {allItems.map(({ type, item }) => {
                              if (type === 'reservation') {
                                const reservation = item as Reservation;
                                return (
                              <div
                                key={reservation.id}
                                className="bg-blue-50 border border-blue-200 rounded-lg p-4 cursor-pointer hover:bg-blue-100 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedReservation(reservation);
                                  setShowReservationModal(true);
                                }}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <span className="text-lg font-semibold text-blue-700">
                                        {formatTime(reservation.startTime)}
                                      </span>
                                      {reservation.endTime && (
                                        <>
                                          <span className="text-gray-400">-</span>
                                          <span className="text-sm text-gray-600">
                                            {formatTime(reservation.endTime)}
                                          </span>
                                        </>
                                      )}
        </div>
                                    <div className="text-base font-medium text-gray-900 mb-1">
                                      {reservation.studentName}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {reservation.teacherName}
                                    </div>
                                    {reservation.location && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        {reservation.location === 'ONLINE' ? '온라인' : '대면'}
                                      </div>
                                    )}
              </div>
              <div className="ml-4">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      reservation.status === 'ATTENDED' || reservation.status === 'attended'
                                        ? 'bg-green-100 text-green-800'
                                        : reservation.status === 'CANCELLED' || reservation.status === 'cancelled'
                                        ? 'bg-red-100 text-red-800'
                                        : reservation.status === 'CONFIRMED' || reservation.status === 'confirmed'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {reservation.status === 'ATTENDED' || reservation.status === 'attended' ? '완료' :
                                       reservation.status === 'CANCELLED' || reservation.status === 'cancelled' ? '취소' :
                                       reservation.status === 'CONFIRMED' || reservation.status === 'confirmed' ? '확정' :
                                       '대기'}
                                    </span>
              </div>
            </div>
          </div>
                                );
                              } else {
                                const memo = item as Memo;
                                return (
                                  <div
                                    key={memo.id}
                                    className={`border rounded-lg p-4 cursor-pointer hover:opacity-80 transition-colors ${getMemoTypeColor(memo.memoType)}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // 이미 로드된 데이터를 사용 (API 호출 없이)
                                      setSelectedMemo(memo);
                                      setShowMemoModal(true);
                                      setIsEditingMemo(false);
                                    }}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                          <FileText className="w-4 h-4" />
                                          <span className="text-sm font-semibold">
                                            {formatTime(memo.time)} 메모
                                          </span>
                                          <span className="text-xs opacity-75">
                                            {memo.authorName}
                                          </span>
              </div>
                                        <div className="text-sm text-gray-700">
                                          {memo.content}
              </div>
            </div>
          </div>
              </div>
                                );
                              }
                            })}
              </div>
                        );
                      })()}
            </div>
          </div>
                ) : viewMode === 'month' ? (
                  <>
                    {/* 요일 헤더 */}
                    <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2 min-w-[600px] sm:min-w-0">
                      {weekDays.map((day) => (
                        <div
                          key={day}
                          className="p-1 sm:p-2 text-center text-xs sm:text-sm font-medium text-gray-600"
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-0.5 sm:gap-1 min-w-[600px] sm:min-w-0">
                    {daysInMonth.map((day, index) => {
                      const dayReservations = getReservationsForDate(day.date);
                      const dayMemos = getMemosForDate(day.date);
                      const isToday =
                        day.date.toDateString() === new Date().toDateString();

                      // 일정 개수에 따라 높이 계산 (최소 100px, 각 항목당 약 30px)
                      const totalItems = dayReservations.length + dayMemos.length;
                      const dynamicHeight = Math.max(100, 60 + (totalItems * 30));

                      return (
                        <div
                          key={index}
                          className={`border border-gray-200 p-1 sm:p-2 ${
                            day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                          } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                          style={{ minHeight: `${Math.max(80, dynamicHeight)}px` }}
                        >
                          <div
                            className={`text-xs sm:text-sm font-medium mb-1 cursor-pointer hover:text-blue-600 transition-colors ${
                              day.isCurrentMonth
                                ? isToday
                                  ? 'text-blue-600'
                                  : 'text-gray-900'
                                : 'text-gray-400'
                            }`}
                            onClick={() => {
                              setCurrentDate(day.date);
                              setViewMode('day');
                            }}
                          >
                            {day.date.getDate()}
              </div>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {dayReservations.length === 0 && dayMemos.length === 0 ? (
                              <div className="text-xs text-gray-400">예약 없음</div>
                            ) : (
                              <>
                                {dayReservations.map((reservation) => (
                                  <div
                                    key={reservation.id}
                                    className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate cursor-pointer hover:bg-blue-200"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedReservation(reservation);
                                      setShowReservationModal(true);
                                    }}
                                    title={`${reservation.studentName} - ${formatTime(reservation.startTime)}`}
                                  >
                                    {formatTime(reservation.startTime)} {reservation.studentName}
              </div>
                                ))}
                                {dayMemos.map((memo) => (
                                  <div
                                    key={memo.id}
                                    className={`text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 border ${getMemoTypeColor(memo.memoType)}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedMemo(memo);
                                      setShowMemoModal(true);
                                    }}
                                    title={`${memo.content.substring(0, 50)}...`}
                                  >
                                    <FileText className="w-3 h-3 inline mr-1" />
                                    {formatTime(memo.time)} 메모
            </div>
                                ))}
                              </>
                            )}
        </div>
                </div>
                      );
                    })}
                    </div>
                  </>
                ) : (
                  <>
                    {/* 요일 헤더 */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {weekDays.map((day) => (
                        <div
                          key={day}
                          className="p-2 text-center text-sm font-medium text-gray-600"
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                    {daysInWeek.map((day, index) => {
                      const dayReservations = getReservationsForDate(day.date);
                      const dayMemos = getMemosForDate(day.date);
                      const isToday =
                        day.date.toDateString() === new Date().toDateString();

                      return (
                        <div
                          key={index}
                          className={`min-h-[400px] border border-gray-200 p-3 ${
                            day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                          } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                        >
                          <div
                            className={`text-sm font-medium mb-2 cursor-pointer hover:text-blue-600 transition-colors ${
                              day.isCurrentMonth
                                ? isToday
                                  ? 'text-blue-600'
                                  : 'text-gray-900'
                                : 'text-gray-400'
                            }`}
                            onClick={() => {
                              setCurrentDate(day.date);
                              setViewMode('day');
                            }}
                          >
                            {day.date.getMonth() + 1}/{day.date.getDate()}
              </div>
                          <div className="space-y-1">
                            {dayReservations.length === 0 && dayMemos.length === 0 ? (
                              <div className="text-xs text-gray-400 text-center py-4">
                                예약 없음
                              </div>
                            ) : (
                              <>
                                {dayReservations.map((reservation) => (
                                  <div
                                    key={reservation.id}
                                    className="text-xs p-2 bg-blue-100 text-blue-800 rounded cursor-pointer hover:bg-blue-200 mb-1"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedReservation(reservation);
                                      setShowReservationModal(true);
                                    }}
                                    title={`${reservation.studentName} - ${formatTime(reservation.startTime)}`}
                                  >
                                    <div className="font-medium">
                                      {formatTime(reservation.startTime)}
                                    </div>
                                    <div className="truncate">{reservation.studentName}</div>
                                  </div>
                                ))}
                                {dayMemos.map((memo) => (
                              <div
                                key={memo.id}
                                className={`text-xs p-2 rounded cursor-pointer hover:opacity-80 mb-1 border ${getMemoTypeColor(memo.memoType)}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // 이미 로드된 데이터를 사용 (API 호출 없이)
                                  setSelectedMemo(memo);
                                  setShowMemoModal(true);
                                  setIsEditingMemo(false);
                                }}
                                    title={`${memo.content.substring(0, 50)}...`}
                                  >
                                    <div className="font-medium flex items-center gap-1">
                                      <FileText className="w-3 h-3" />
                                      {formatTime(memo.time)} 메모
                                    </div>
                                    <div className="truncate text-[10px] mt-1">{memo.content.substring(0, 30)}...</div>
                                  </div>
                                ))}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    </div>
                  </>
                )}

                {/* 예약이 없을 때 하단 메시지 */}
                {reservations.length === 0 && (
                  <div className="mt-6 p-6 text-center border-t border-gray-200">
                    <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      등록된 예약이 없습니다
                    </p>
                    <p className="text-xs text-gray-600 mb-4">
                      아직 등록된 예약이 없습니다. 새로운 예약을 생성해보세요.
                    </p>
                <button
                      onClick={() => router.push('/admin/reservations/manage')}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                      예약 관리로 이동
                </button>
              </div>
                )}
            </div>
            )}
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-600">개요 탭 내용</p>
          </div>
        )}
        </div>

      {/* 메모 상세 모달 */}
      {showMemoModal && selectedMemo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => {
          if (!isEditingMemo) {
            setShowMemoModal(false);
            setIsEditingMemo(false);
          }
        }}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className={`w-6 h-6 ${getMemoTypeColor(selectedMemo.memoType).split(' ')[1]}`} />
                  <h2 className="text-xl font-bold text-gray-900">{isEditingMemo ? '메모 수정' : '메모 상세'}</h2>
                </div>
            <button
                  onClick={() => {
                    setShowMemoModal(false);
                    setIsEditingMemo(false);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
            </button>
          </div>
                            </div>
            {!isEditingMemo ? (
              <>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
                      <div className="p-2 bg-gray-50 rounded border">
                        {selectedMemo.date ? new Date(selectedMemo.date).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'long'
                        }) : '없음'}
                          </div>
                            </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">시간</label>
                      <div className="p-2 bg-gray-50 rounded border">
                        {formatTime(selectedMemo.time)}
                            </div>
                          </div>
                        </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">메모 유형</label>
                    <div className={`p-2 rounded border inline-block ${getMemoTypeColor(selectedMemo.memoType)}`}>
                      {selectedMemo.memoType === "class" ? "수업관련" :
                       selectedMemo.memoType === "staff" ? "직원 관련" :
                       selectedMemo.memoType === "schedule" ? "일정관련" :
                       selectedMemo.memoType === "admin" ? "관리자 업무" :
                       selectedMemo.memoType === "personal" ? "개인메모" : selectedMemo.memoType}
                        </div>
                        </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">작성자</label>
                    <div className="p-2 bg-gray-50 rounded border">
                      {selectedMemo.authorName}
                        </div>
                        </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">공개 여부</label>
                    <div className="p-2 bg-gray-50 rounded border">
                      {selectedMemo.isPublic ? "공개" : "비공개"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
                    <div className="p-4 bg-gray-50 rounded border min-h-[150px] whitespace-pre-wrap">
                      {selectedMemo.content}
                    </div>
                  </div>
                  {selectedMemo.reservationId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">관련 예약</label>
                      <button
                        onClick={() => {
                          setShowMemoModal(false);
                          router.push(`/admin/reservations/${selectedMemo.reservationId}`);
                        }}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        예약 상세 보기
                      </button>
                        </div>
                  )}
                </div>
                <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                          <button
                    onClick={async () => {
                      // 편집 모드로 전환 - 최신 데이터 가져오기
                      try {
                        const response = await fetch(`/api/admin/memos/${selectedMemo.id}`, {
                          credentials: 'include',
                        });
                        
                        if (response.ok) {
                          const data = await response.json();
                          if (data.success && data.memo) {
                            const memo = data.memo;
                            setMemoFormData({
                              date: memo.date || new Date().toISOString().split('T')[0],
                              time: memo.time || new Date().toTimeString().slice(0, 5),
                              content: memo.content || '',
                              memoType: memo.memoType || 'class',
                              isPublic: memo.isPublic || false,
                              reservationId: memo.reservationId || '',
                              relatedTeacherId: memo.relatedTeacherId || '',
                              relatedStaffId: memo.relatedStaffId || '',
                            });
                            setIsEditingMemo(true);
                            // 예약, 선생님, 직원 목록 불러오기
                            fetchMemoRelatedData(memo.date || new Date().toISOString().split('T')[0]);
                          } else {
                            // API 실패 시 기존 데이터 사용
                            setMemoFormData({
                              date: selectedMemo.date || new Date().toISOString().split('T')[0],
                              time: selectedMemo.time || new Date().toTimeString().slice(0, 5),
                              content: selectedMemo.content || '',
                              memoType: selectedMemo.memoType || 'class',
                              isPublic: selectedMemo.isPublic || false,
                              reservationId: selectedMemo.reservationId || '',
                              relatedTeacherId: (selectedMemo as any).relatedTeacherId || '',
                              relatedStaffId: (selectedMemo as any).relatedStaffId || '',
                            });
                            setIsEditingMemo(true);
                            fetchMemoRelatedData(selectedMemo.date || new Date().toISOString().split('T')[0]);
                          }
                        } else {
                          // API 실패 시 기존 데이터 사용
                          setMemoFormData({
                            date: selectedMemo.date || new Date().toISOString().split('T')[0],
                            time: selectedMemo.time || new Date().toTimeString().slice(0, 5),
                            content: selectedMemo.content || '',
                            memoType: selectedMemo.memoType || 'class',
                            isPublic: selectedMemo.isPublic || false,
                            reservationId: selectedMemo.reservationId || '',
                            relatedTeacherId: (selectedMemo as any).relatedTeacherId || '',
                            relatedStaffId: (selectedMemo as any).relatedStaffId || '',
                          });
                          setIsEditingMemo(true);
                          fetchMemoRelatedData(selectedMemo.date || new Date().toISOString().split('T')[0]);
                        }
                      } catch (error) {
                        console.error('메모 데이터 로드 오류:', error);
                        // 오류 발생 시 기존 데이터 사용
                        setMemoFormData({
                          date: selectedMemo.date || new Date().toISOString().split('T')[0],
                          time: selectedMemo.time || new Date().toTimeString().slice(0, 5),
                          content: selectedMemo.content || '',
                          memoType: selectedMemo.memoType || 'class',
                          isPublic: selectedMemo.isPublic || false,
                          reservationId: selectedMemo.reservationId || '',
                          relatedTeacherId: (selectedMemo as any).relatedTeacherId || '',
                          relatedStaffId: (selectedMemo as any).relatedStaffId || '',
                        });
                        setIsEditingMemo(true);
                        fetchMemoRelatedData(selectedMemo.date || new Date().toISOString().split('T')[0]);
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    수정
                          </button>
                          <button
                    onClick={() => setShowMemoModal(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                          >
                    닫기
                          </button>
                        </div>
              </>
            ) : (
              <>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">날짜 <span className="text-red-500">*</span></label>
                      <input
                        type="date"
                        value={memoFormData.date}
                        onChange={(e) => {
                          setMemoFormData({ ...memoFormData, date: e.target.value, reservationId: '' });
                          fetchMemoRelatedData(e.target.value);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
            </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">시간 <span className="text-red-500">*</span></label>
                      <input
                        type="time"
                        value={memoFormData.time}
                        onChange={(e) => setMemoFormData({ ...memoFormData, time: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
          </div>
      </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">메모 유형 <span className="text-red-500">*</span></label>
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
                          onClick={() => setMemoFormData({ ...memoFormData, memoType: type.value, reservationId: '', relatedTeacherId: '', relatedStaffId: '' })}
                          className={`px-4 py-2 border-2 rounded-lg font-medium transition-all ${
                            memoFormData.memoType === type.value
                              ? `${type.color} border-current`
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {type.label}
              </button>
                      ))}
                    </div>
                  </div>
                  {memoFormData.memoType === "class" && memoReservations.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">관련 예약 (선택사항)</label>
                      <select
                        value={memoFormData.reservationId}
                        onChange={(e) => setMemoFormData({ ...memoFormData, reservationId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">예약을 선택하세요 (선택사항)</option>
                        {memoReservations.map((reservation) => (
                          <option key={reservation.id} value={reservation.id}>
                            {formatTime(reservation.startTime)} - {reservation.studentName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {memoFormData.memoType === "staff" && memoStaff.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">관련 직원 (선택사항)</label>
                      <select
                        value={memoFormData.relatedStaffId}
                        onChange={(e) => setMemoFormData({ ...memoFormData, relatedStaffId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">직원을 선택하세요 (선택사항)</option>
                        {memoStaff.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {memoFormData.memoType === "schedule" && (
                    <div className="grid grid-cols-2 gap-4">
                      {memoTeachers.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">관련 선생님 (선택사항)</label>
                          <select
                            value={memoFormData.relatedTeacherId}
                            onChange={(e) => setMemoFormData({ ...memoFormData, relatedTeacherId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">선생님을 선택하세요</option>
                            {memoTeachers.map((teacher) => (
                              <option key={teacher.id} value={teacher.id}>
                                {teacher.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      {memoStaff.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">관련 직원 (선택사항)</label>
                          <select
                            value={memoFormData.relatedStaffId}
                            onChange={(e) => setMemoFormData({ ...memoFormData, relatedStaffId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">직원을 선택하세요</option>
                            {memoStaff.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">내용 <span className="text-red-500">*</span></label>
                    <textarea
                      value={memoFormData.content}
                      onChange={(e) => setMemoFormData({ ...memoFormData, content: e.target.value })}
                      rows={10}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="메모 내용을 입력하세요"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="memoIsPublic"
                      checked={memoFormData.isPublic}
                      onChange={(e) => setMemoFormData({ ...memoFormData, isPublic: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="memoIsPublic" className="text-sm font-medium text-gray-700 cursor-pointer">
                      공개 (관련 직원과 함께 열람 가능)
                    </label>
                  </div>
                </div>
                <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                      setIsEditingMemo(false);
                      setMemoFormData({
                        date: '',
                        time: '',
                        content: '',
                        memoType: 'class',
                        isPublic: false,
                        reservationId: '',
                        relatedTeacherId: '',
                        relatedStaffId: '',
                      });
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSaveMemo}
                    disabled={savingMemo || !memoFormData.content || !memoFormData.date || !memoFormData.time}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingMemo ? '저장 중...' : '저장'}
              </button>
            </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 예약 상세 모달 */}
      {showReservationModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowReservationModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">예약 상세</h2>
                </div>
              <button
                  onClick={() => setShowReservationModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
                  <div className="p-2 bg-gray-50 rounded border">
                    {(() => {
                      if (!selectedReservation.date) return '없음';
                      // 날짜 문자열을 올바르게 파싱
                      let dateObj: Date;
                      if (typeof selectedReservation.date === 'string') {
                        if (selectedReservation.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                          // YYYY-MM-DD 형식
                          const [year, month, day] = selectedReservation.date.split('-').map(Number);
                          dateObj = new Date(year, month - 1, day);
                        } else {
                          dateObj = new Date(selectedReservation.date);
                        }
                      } else {
                        dateObj = new Date(selectedReservation.date);
                      }
                      return dateObj.toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'long'
                      });
                    })()}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">시간</label>
                  <div className="p-2 bg-gray-50 rounded border">
                    {formatTime(selectedReservation.startTime)}
                    {selectedReservation.endTime && ` - ${formatTime(selectedReservation.endTime)}`}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">학생</label>
                  <div className="p-2 bg-gray-50 rounded border">
                    {selectedReservation.studentName}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">선생님</label>
                  <div className="p-2 bg-gray-50 rounded border">
                    {selectedReservation.teacherName}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                  <div className="p-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      selectedReservation.status === 'ATTENDED' || selectedReservation.status === 'attended'
                        ? 'bg-green-100 text-green-800'
                        : selectedReservation.status === 'CANCELLED' || selectedReservation.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : selectedReservation.status === 'CONFIRMED' || selectedReservation.status === 'confirmed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedReservation.status === 'ATTENDED' || selectedReservation.status === 'attended' ? '완료' :
                       selectedReservation.status === 'CANCELLED' || selectedReservation.status === 'cancelled' ? '취소' :
                       selectedReservation.status === 'CONFIRMED' || selectedReservation.status === 'confirmed' ? '확정' :
                       '대기'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">수업 형식</label>
                  <div className="p-2 bg-gray-50 rounded border">
                    {selectedReservation.location === 'ONLINE' ? '온라인' : '대면'}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowReservationModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                닫기
              </button>
              <button
                onClick={() => {
                  setShowReservationModal(false);
                  router.push(`/admin/reservations/${selectedReservation.id}?edit=true`);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                수정
              </button>
              <button
                onClick={() => {
                  setShowReservationModal(false);
                  router.push(`/admin/reservations/${selectedReservation.id}`);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                상세 페이지 보기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function AdminReservationsPage() {
  return <AdminReservationsContent />;
}

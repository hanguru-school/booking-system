"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Search,
  User,
  Edit,
  Trash2,
  Eye,
  GraduationCap,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Key,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  level: string;
  course: string;
  teacher: string;
  enrollmentDate: string;
  status: "active" | "inactive" | "graduated" | "suspended";
  attendanceRate: number;
  remainingHours: number;
  lastAttendance: string;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive" | "graduated" | "suspended"
  >("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Student>>({});
  const studentListRef = useRef<HTMLDivElement>(null);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedStudentReservations, setSelectedStudentReservations] = useState<any[]>([]);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/students', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setStudents(data.students || []);
        } else {
          setStudents([]);
        }
      } catch (error) {
        console.error('학생 목록 조회 오류:', error);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phone.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || student.status === statusFilter;
    const matchesLevel = levelFilter === "all" || student.level === levelFilter;

    return matchesSearch && matchesStatus && matchesLevel;
  });

  // 정렬 함수
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // 정렬된 학생 목록
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (!sortField) return 0;

    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'level':
        aValue = a.level || '';
        bValue = b.level || '';
        break;
      case 'attendanceRate':
        aValue = a.attendanceRate != null && !isNaN(a.attendanceRate) ? a.attendanceRate : 0;
        bValue = b.attendanceRate != null && !isNaN(b.attendanceRate) ? b.attendanceRate : 0;
        break;
      case 'remainingHours':
        aValue = a.remainingHours != null && !isNaN(a.remainingHours) ? a.remainingHours : 0;
        bValue = b.remainingHours != null && !isNaN(b.remainingHours) ? b.remainingHours : 0;
        break;
      case 'status':
        aValue = a.status || '';
        bValue = b.status || '';
        break;
      case 'enrollmentDate':
        aValue = a.enrollmentDate ? new Date(a.enrollmentDate).getTime() : 0;
        bValue = b.enrollmentDate ? new Date(b.enrollmentDate).getTime() : 0;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // 예약 이력 보기
  const handleViewReservations = async (student: Student) => {
    try {
      setSelectedStudent(student);
      setShowReservationModal(true);
      
      const response = await fetch(`/api/admin/students/${student.id}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        console.error('예약 이력 조회 실패:', response.status, response.statusText);
        setSelectedStudentReservations([]);
        return;
      }
      
      const data = await response.json();
      
      if (data.success && data.student) {
        // 예약 목록을 최신순으로 정렬 (날짜 내림차순)
        const reservations = (data.student.reservations || []).sort((a: any, b: any) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return dateB - dateA; // 최신이 위로
        });
        setSelectedStudentReservations(reservations);
        
        // 모달이 열린 후 스크롤을 중간으로 이동 (최신 레슨이 화면 중간에 오도록)
        setTimeout(() => {
          const modalContent = document.querySelector('[data-reservation-modal]');
          if (modalContent && reservations.length > 0) {
            // 첫 번째 행(가장 최근 레슨)의 위치를 찾아서 중간으로 스크롤
            const firstRow = modalContent.querySelector('tbody tr:first-child');
            if (firstRow) {
              const rowTop = (firstRow as HTMLElement).offsetTop;
              const clientHeight = modalContent.clientHeight;
              modalContent.scrollTop = Math.max(0, rowTop - clientHeight / 2 + 100);
            }
          }
        }, 200);
      } else {
        // 데이터가 없어도 모달은 열림
        setSelectedStudentReservations([]);
      }
    } catch (error) {
      console.error('예약 이력 조회 오류:', error);
      // 오류가 발생해도 모달은 열고 빈 목록 표시
      setSelectedStudentReservations([]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "graduated":
        return "bg-blue-100 text-blue-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "활성";
      case "inactive":
        return "비활성";
      case "graduated":
        return "졸업";
      case "suspended":
        return "정지";
      default:
        return "알 수 없음";
    }
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return "text-green-600";
    if (rate >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  const [detailedStudent, setDetailedStudent] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'contact' | 'academic' | 'reservations' | 'payments' | 'agreements'>('basic');
  const [selectedAgreement, setSelectedAgreement] = useState<any>(null);
  const [showAgreementModal, setShowAgreementModal] = useState(false);

  const handleViewStudent = async (student: Student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
    setLoadingDetail(true);
    setActiveTab('basic');
    
    try {
      const response = await fetch(`/api/admin/students/${student.id}`, {
        credentials: 'include',
      });
      
      console.log('API 응답 상태:', response.status);
      
      let data: any = null;
      try {
        const responseText = await response.text();
        if (responseText && responseText.trim()) {
          try {
            data = JSON.parse(responseText);
            console.log('API 응답 데이터:', data);
          } catch (parseError) {
            console.error('JSON 파싱 오류:', parseError);
            console.error('응답 본문:', responseText);
            // JSON 파싱 실패해도 계속 진행 (data는 null로 유지)
          }
        }
      } catch (error) {
        console.error('응답 읽기 오류:', error);
        // 응답 읽기 실패해도 계속 진행 (data는 null로 유지)
      }
      
      if (response.ok) {
        if (data && typeof data === 'object' && data.success && data.student) {
          setDetailedStudent(data.student);
        } else {
          // 성공 응답이지만 데이터 형식이 올바르지 않은 경우
          const errorMsg = (data && typeof data === 'object') 
            ? (data.error || data.details || '알 수 없는 오류')
            : '응답 데이터 형식 오류';
          console.warn('학생 상세 정보 조회: 데이터 형식 오류', errorMsg);
          // 에러가 발생해도 모달은 유지하고 기본 정보만 표시
          setDetailedStudent(null);
        }
      } else {
        // HTTP 에러 응답인 경우
        const errorMessage = (data && typeof data === 'object' && data.error) 
          ? data.error 
          : `HTTP ${response.status}: ${response.statusText}`;
        console.warn('학생 상세 정보 조회 실패:', errorMessage);
        // 에러가 발생해도 모달은 유지하고 기본 정보만 표시
        setDetailedStudent(null);
      }
    } catch (error) {
      console.error('학생 상세 정보 조회 오류:', error);
      // 에러가 발생해도 모달은 유지하고 기본 정보만 표시
      setDetailedStudent(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    const studentAny = student as any;
    setEditFormData({
      name: student.name,
      email: student.email,
      phone: student.phone,
      level: student.level,
      course: student.course,
      teacher: student.teacher,
      status: student.status,
      // 긴급연락처 정보 (미성년자가 아닌 경우만)
      emergencyContactNameKanji: studentAny.emergencyContactNameKanji || '',
      emergencyContactNameYomigana: studentAny.emergencyContactNameYomigana || '',
      emergencyContactPhone: studentAny.emergencyContactPhone || '',
      emergencyContactRelation: studentAny.emergencyContactRelation || '',
      emergencyContactEmail: studentAny.emergencyContactEmail || '',
      isMinor: studentAny.isMinor || false,
    });
    setShowEditModal(true);
  };

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`정말로 "${studentName}" 학생을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/students/${studentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setStudents(students.filter(s => s.id !== studentId));
        alert('학생이 삭제되었습니다.');
      } else {
        const errorData = await response.json();
        alert(`삭제 실패: ${errorData.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('학생 삭제 오류:', error);
      alert('학생 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedStudent) return;

    try {
      // course와 teacher는 예약 정보이므로 제외하고 전송
      const { course, teacher, ...updateData } = editFormData;
      const updateDataAny = updateData as any;
      
      const response = await fetch(`/api/admin/students/${selectedStudent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          kanjiName: updateData.name,
          phone: updateData.phone,
          level: updateData.level,
          status: updateData.status?.toUpperCase(),
          email: updateData.email,
          // 긴급연락처 정보 (미성년자가 아닌 경우만)
          ...(!updateDataAny.isMinor && {
            emergencyContactNameKanji: updateDataAny.emergencyContactNameKanji || null,
            emergencyContactNameYomigana: updateDataAny.emergencyContactNameYomigana || null,
            emergencyContactPhone: updateDataAny.emergencyContactPhone || null,
            emergencyContactRelation: updateDataAny.emergencyContactRelation || null,
            emergencyContactEmail: updateDataAny.emergencyContactEmail || null,
          }),
        }),
      });

      if (response.ok) {
        // 학생 목록 다시 불러오기
        const fetchResponse = await fetch('/api/admin/students', {
          credentials: 'include',
        });
        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          setStudents(data.students || []);
        }
        setShowEditModal(false);
        setSelectedStudent(null);
        setEditFormData({});
        alert('학생 정보가 수정되었습니다.');
      } else {
        const errorData = await response.json();
        alert(`수정 실패: ${errorData.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('학생 수정 오류:', error);
      alert('학생 정보 수정 중 오류가 발생했습니다.');
    }
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">학생 관리</h1>
          <p className="text-lg text-gray-600">학생 정보를 관리하세요</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />새 학생 등록
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <button
          onClick={() => {
            setStatusFilter("all");
            setLevelFilter("all");
            setSearchTerm("");
            // 스크롤을 목록으로 이동
            setTimeout(() => {
              const element = document.getElementById("student-list");
              if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }, 100);
          }}
          className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-all cursor-pointer text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">총 학생 수</p>
              <p className="text-2xl font-bold text-gray-900">
                {students.length}명
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </button>

        <button
          onClick={() => {
            setStatusFilter("active");
            setLevelFilter("all");
            setSearchTerm("");
            setTimeout(() => {
              const element = document.getElementById("student-list");
              if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }, 100);
          }}
          className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-all cursor-pointer text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">활성 학생</p>
              <p className="text-2xl font-bold text-green-600">
                {students.filter((s) => s.status === "active").length}명
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </button>

        <button
          onClick={() => {
            setStatusFilter("graduated");
            setLevelFilter("all");
            setSearchTerm("");
            setTimeout(() => {
              const element = document.getElementById("student-list");
              if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }, 100);
          }}
          className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-all cursor-pointer text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">졸업생</p>
              <p className="text-2xl font-bold text-blue-600">
                {students.filter((s) => s.status === "graduated").length}명
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </button>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">평균 출석률</p>
              <p className="text-2xl font-bold text-purple-600">
                {(() => {
                  const validStudents = students.filter(
                    (s) => s.attendanceRate != null && !isNaN(s.attendanceRate)
                  );
                  if (validStudents.length === 0) {
                    return '없음';
                  }
                  const avgRate = Math.round(
                    validStudents.reduce((sum, s) => sum + (s.attendanceRate || 0), 0) /
                      validStudents.length
                  );
                  return isNaN(avgRate) ? '없음' : `${avgRate}%`;
                })()}
              </p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="이름, 이메일, 전화번호 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as
                  | "all"
                  | "active"
                  | "inactive"
                  | "graduated"
                  | "suspended",
              )
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">전체 상태</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
            <option value="graduated">졸업</option>
            <option value="suspended">정지</option>
          </select>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">전체 레벨</option>
            <option value="A-1 (기초)">A-1 (기초)</option>
            <option value="A-2 (초급)">A-2 (초급)</option>
            <option value="B-1 (중급)">B-1 (중급)</option>
            <option value="B-2 (고급)">B-2 (고급)</option>
          </select>

          <div className="text-sm text-gray-600">
            총 {filteredStudents.length}명의 학생
          </div>
        </div>
      </div>

      {/* 학생 목록 */}
      <div id="student-list" className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">학생 목록</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  학생 정보
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('level')}
                >
                  <div className="flex items-center gap-2">
                    레벨
                    {sortField === 'level' && (
                      <span className="text-blue-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('attendanceRate')}
                >
                  <div className="flex items-center gap-2">
                    출석률
                    {sortField === 'attendanceRate' && (
                      <span className="text-blue-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('remainingHours')}
                >
                  <div className="flex items-center gap-2">
                    남은 시간
                    {sortField === 'remainingHours' && (
                      <span className="text-blue-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-2">
                    상태
                    {sortField === 'status' && (
                      <span className="text-blue-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('enrollmentDate')}
                >
                  <div className="flex items-center gap-2">
                    등록일
                    {sortField === 'enrollmentDate' && (
                      <span className="text-blue-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  예약정보
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    등록된 학생이 없습니다.
                  </td>
                </tr>
              ) : (
                sortedStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {student.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {student.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {student.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {student.level || '미등록'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className={`text-sm font-medium ${
                        student.attendanceRate != null && !isNaN(student.attendanceRate)
                          ? getAttendanceColor(student.attendanceRate)
                          : 'text-gray-500'
                      }`}
                    >
                      {student.attendanceRate != null && !isNaN(student.attendanceRate)
                        ? `${student.attendanceRate}%`
                        : '0%'}
                    </div>
                    <div className="text-sm text-gray-500">
                      마지막:{" "}
                      {student.lastAttendance && student.lastAttendance !== 'Invalid Date'
                        ? (() => {
                            const date = new Date(student.lastAttendance);
                            return isNaN(date.getTime()) ? '없음' : date.toLocaleDateString();
                          })()
                        : '없음'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {student.remainingHours != null && !isNaN(student.remainingHours)
                        ? `${student.remainingHours}시간`
                        : '구매 안함'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}
                    >
                      {getStatusText(student.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {student.enrollmentDate && student.enrollmentDate !== 'Invalid Date'
                        ? (() => {
                            const date = new Date(student.enrollmentDate);
                            return isNaN(date.getTime()) ? '없음' : date.toLocaleDateString('ko-KR');
                          })()
                        : '없음'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleViewReservations(student)}
                      className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      보기
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewStudent(student)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                        title="상세 보기"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditStudent(student)}
                        className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                        title="수정"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student.id, student.name)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 학생 등록 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                새 학생 등록
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <AlertCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이름
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="학생 이름"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이메일
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="이메일 주소"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    전화번호
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="전화번호"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    레벨
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">레벨 선택</option>
                    <option value="A-1 (기초)">A-1 (기초)</option>
                    <option value="A-2 (초급)">A-2 (초급)</option>
                    <option value="B-1 (중급)">B-1 (중급)</option>
                    <option value="B-2 (고급)">B-2 (고급)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    코스
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">코스 선택</option>
                    <option value="한국어 기초 과정">한국어 기초 과정</option>
                    <option value="한국어 초급 과정">한국어 초급 과정</option>
                    <option value="한국어 중급 과정">한국어 중급 과정</option>
                    <option value="한국어 고급 과정">한국어 고급 과정</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    담당 강사
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">강사 선택</option>
                    <option value="김선생님">김선생님</option>
                    <option value="이선생님">이선생님</option>
                    <option value="박선생님">박선생님</option>
                    <option value="최선생님">최선생님</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={() => {
                  // 저장 로직
                  setShowCreateModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 학생 상세 보기 모달 */}
      {showViewModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 my-auto flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
              <h3 className="text-xl font-semibold text-gray-900">
                학생 상세 정보 - {detailedStudent?.kanjiName || detailedStudent?.name || selectedStudent.name || '이름 없음'}
              </h3>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedStudent(null);
                  setDetailedStudent(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <AlertCircle className="w-5 h-5" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="ml-3 text-sm text-gray-600">학생 정보를 불러오는 중...</p>
              </div>
            ) : detailedStudent ? (
              <>
                {/* 탭 메뉴 */}
                <div className="border-b border-gray-200 mb-4 flex-shrink-0">
                  <nav className="flex space-x-4">
                    {[
                      { id: 'basic', label: '기본 정보' },
                      { id: 'contact', label: '연락처 정보' },
                      { id: 'academic', label: '학업 정보' },
                      { id: 'reservations', label: '예약 내역' },
                      { id: 'payments', label: '결제 내역' },
                      { id: 'agreements', label: '동의서' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`py-2 px-4 border-b-2 font-medium text-sm ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* 탭 내용 */}
                <div className="flex-1 overflow-y-auto min-h-0 pr-2">
                  {activeTab === 'basic' && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">개인 정보</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">학번</label>
                            <p className="text-sm text-gray-900">{detailedStudent.studentId || '미등록'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">생년월일</label>
                            <p className="text-sm text-gray-900">
                              {detailedStudent.birthDate
                                ? new Date(detailedStudent.birthDate).toLocaleDateString()
                                : '없음'}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">미성년자 여부</label>
                            <p className="text-sm text-gray-900">{detailedStudent.isMinor ? '예' : '아니오'}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">입회 정보</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">입회일시</label>
                            <p className="text-sm text-gray-900">
                              {detailedStudent.registrationDate
                                ? new Date(detailedStudent.registrationDate).toLocaleString('ko-KR', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : (detailedStudent.joinDate
                                  ? new Date(detailedStudent.joinDate).toLocaleString('ko-KR', {
                                      year: 'numeric',
                                      month: '2-digit',
                                      day: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })
                                  : (detailedStudent.createdAt
                                    ? new Date(detailedStudent.createdAt).toLocaleString('ko-KR', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })
                                    : '없음'))}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">레벨</label>
                            <p className="text-sm text-gray-900">{detailedStudent.level || '미등록'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">수강기간</label>
                            <p className="text-sm text-gray-900">
                              {(() => {
                                const startDate = detailedStudent.registrationDate 
                                  ? new Date(detailedStudent.registrationDate)
                                  : (detailedStudent.joinDate 
                                    ? new Date(detailedStudent.joinDate)
                                    : (detailedStudent.createdAt ? new Date(detailedStudent.createdAt) : null));
                                
                                if (!startDate) return '없음';
                                
                                const today = new Date();
                                const diffTime = today.getTime() - startDate.getTime();
                                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                                const diffMonths = Math.floor(diffDays / 30);
                                const diffYears = Math.floor(diffMonths / 12);
                                
                                let period = '';
                                if (diffYears > 0) {
                                  period += `${diffYears}년 `;
                                }
                                if (diffMonths % 12 > 0) {
                                  period += `${diffMonths % 12}개월`;
                                }
                                if (diffYears === 0 && diffMonths === 0) {
                                  period = `${diffDays}일`;
                                }
                                
                                return period || '1일 미만';
                              })()}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">입회 상태</label>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              detailedStudent.enrollmentStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              detailedStudent.enrollmentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {detailedStudent.enrollmentStatus === 'COMPLETED' ? '완료' :
                               detailedStudent.enrollmentStatus === 'PENDING' ? '대기' :
                               detailedStudent.enrollmentStatus || '미등록'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">주소 정보</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">우편번호</label>
                            <p className="text-sm text-gray-900">{detailedStudent.postalCode || '없음'}</p>
                          </div>
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
                            <p className="text-sm text-gray-900">{detailedStudent.address || '없음'}</p>
                          </div>
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">상세 주소</label>
                            <p className="text-sm text-gray-900">{detailedStudent.addressDetail || '없음'}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">시스템 정보</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">등록일</label>
                            <p className="text-sm text-gray-900">
                              {detailedStudent.registrationDate
                                ? new Date(detailedStudent.registrationDate).toLocaleDateString()
                                : '없음'}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">가입일</label>
                            <p className="text-sm text-gray-900">
                              {detailedStudent.joinDate
                                ? new Date(detailedStudent.joinDate).toLocaleDateString()
                                : '없음'}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">생성일</label>
                            <p className="text-sm text-gray-900">
                              {detailedStudent.createdAt
                                ? new Date(detailedStudent.createdAt).toLocaleDateString()
                                : '없음'}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">수정일</label>
                            <p className="text-sm text-gray-900">
                              {detailedStudent.updatedAt
                                ? new Date(detailedStudent.updatedAt).toLocaleDateString()
                                : '없음'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'contact' && (
                    <div className="space-y-6">
                      {/* 학생 이름 정보 */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-md font-semibold text-gray-900 mb-3">이름 정보</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">한자</label>
                            <p className="text-sm font-medium text-gray-900">
                              {detailedStudent.kanjiName 
                                ? detailedStudent.kanjiName 
                                : (detailedStudent.name ? detailedStudent.name : '없음')}
                            </p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">후리가나</label>
                            <p className="text-sm font-medium text-gray-900">{detailedStudent.yomigana || '없음'}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">한글</label>
                            <p className="text-sm font-medium text-gray-900">{detailedStudent.koreanName || '없음'}</p>
                          </div>
                        </div>
                      </div>

                      {/* 학생 연락처 정보 */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-md font-semibold text-gray-900 mb-3">연락처 정보</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">이메일</label>
                            <p className="text-sm font-medium text-gray-900">{detailedStudent.email || '없음'}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">전화번호</label>
                            <p className="text-sm font-medium text-gray-900">{detailedStudent.phone || '없음'}</p>
                          </div>
                        </div>
                      </div>

                      {/* 보호자/긴급연락처 정보 */}
                      {detailedStudent.isMinor ? (
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-md font-semibold text-gray-900">보호자 정보</h4>
                            {detailedStudent.parents && Array.isArray(detailedStudent.parents) && detailedStudent.parents.length > 0 && (
                              <button
                                onClick={() => {
                                  const parent = detailedStudent.parents[0];
                                  if (parent?.id) {
                                    window.open(`/admin/parents/${parent.id}`, '_blank');
                                  }
                                }}
                                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                              >
                                <Users className="w-4 h-4" />
                                학부모 정보 보기
                              </button>
                            )}
                          </div>
                          <div className="space-y-4">
                            <div className="bg-white rounded p-3">
                              <label className="block text-xs font-medium text-gray-500 mb-2">이름</label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <span className="text-xs text-gray-400">한자</span>
                                  <p className="text-sm font-medium text-gray-900">{detailedStudent.parentNameKanji || '없음'}</p>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-400">후리가나</span>
                                  <p className="text-sm font-medium text-gray-900">{detailedStudent.parentNameYomigana || '없음'}</p>
                                </div>
                              </div>
                            </div>
                            <div className="bg-white rounded p-3">
                              <label className="block text-xs font-medium text-gray-500 mb-2">연락처</label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <span className="text-xs text-gray-400">전화번호</span>
                                  <p className="text-sm font-medium text-gray-900">{detailedStudent.parentPhone || '없음'}</p>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-400">관계</span>
                                  <p className="text-sm font-medium text-gray-900">{detailedStudent.parentRelation || '없음'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="text-md font-semibold text-gray-900 mb-3">긴급연락처 정보</h4>
                          <div className="space-y-4">
                            <div className="bg-white rounded p-3">
                              <label className="block text-xs font-medium text-gray-500 mb-2">이름</label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <span className="text-xs text-gray-400">한자</span>
                                  <p className="text-sm font-medium text-gray-900">{detailedStudent.emergencyContactNameKanji || '없음'}</p>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-400">후리가나</span>
                                  <p className="text-sm font-medium text-gray-900">{detailedStudent.emergencyContactNameYomigana || '없음'}</p>
                                </div>
                              </div>
                            </div>
                            <div className="bg-white rounded p-3">
                              <label className="block text-xs font-medium text-gray-500 mb-2">연락처</label>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                  <span className="text-xs text-gray-400">전화번호</span>
                                  <p className="text-sm font-medium text-gray-900">{detailedStudent.emergencyContactPhone || '없음'}</p>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-400">이메일</span>
                                  <p className="text-sm font-medium text-gray-900">{detailedStudent.emergencyContactEmail || '없음'}</p>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-400">관계</span>
                                  <p className="text-sm font-medium text-gray-900">{detailedStudent.emergencyContactRelation || '없음'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'academic' && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">학업 정보</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">레벨</label>
                            <p className="text-sm text-gray-900">{detailedStudent.level || '미등록'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">포인트</label>
                            <p className="text-sm text-gray-900">{detailedStudent.points || 0}P</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(detailedStudent.status)}`}>
                              {getStatusText(detailedStudent.status)}
                            </span>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">입회 상태</label>
                            <p className="text-sm text-gray-900">{detailedStudent.enrollmentStatus || '없음'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">규정 동의 여부</label>
                            <p className="text-sm text-gray-900">{detailedStudent.rulesAgreed ? '동의함' : '동의 안함'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">규정 동의일</label>
                            <p className="text-sm text-gray-900">
                              {detailedStudent.rulesAgreedAt
                                ? new Date(detailedStudent.rulesAgreedAt).toLocaleDateString()
                                : '없음'}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">첫 로그인 여부</label>
                            <p className="text-sm text-gray-900">{detailedStudent.isFirstLogin ? '예' : '아니오'}</p>
                          </div>
                        </div>
                      </div>

                      {detailedStudent.lessonNotes && detailedStudent.lessonNotes.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">최근 수업 노트</h4>
                          <div className="space-y-3">
                            {detailedStudent.lessonNotes.slice(0, 5).map((note: any) => (
                              <div key={note.id} className="border border-gray-200 rounded-lg p-3">
                                <div className="flex justify-between items-start mb-2">
                                  <p className="text-sm font-medium text-gray-900">
                                    {note.date ? new Date(note.date).toLocaleDateString() : '날짜 없음'}
                                  </p>
                                  {note.teacher && (
                                    <p className="text-xs text-gray-500">{note.teacher.name}</p>
                                  )}
                                </div>
                                <p className="text-sm text-gray-700 line-clamp-2">{note.content || '내용 없음'}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'reservations' && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">
                          예약 내역 ({detailedStudent.reservations?.length || 0}건)
                        </h4>
                        <Link
                          href={`/admin/students/lessons?studentId=${detailedStudent.id}`}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          전체 보기
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                      {detailedStudent.reservations && detailedStudent.reservations.length > 0 ? (
                        <div className="space-y-3">
                          {detailedStudent.reservations.map((reservation: any) => (
                            <div key={reservation.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">날짜</label>
                                  <p className="text-sm text-gray-900">
                                    {new Date(reservation.date).toLocaleDateString()}
                                  </p>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">시간</label>
                                  <p className="text-sm text-gray-900">
                                    {new Date(reservation.startTime).toLocaleTimeString()} - {new Date(reservation.endTime).toLocaleTimeString()}
                                  </p>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">수업 유형</label>
                                  <p className="text-sm text-gray-900">{reservation.lessonType || '없음'}</p>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">강사</label>
                                  <p className="text-sm text-gray-900">{reservation.teacher?.name || '미지정'}</p>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">상태</label>
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    reservation.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                    reservation.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {reservation.status}
                                  </span>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">가격</label>
                                  <p className="text-sm text-gray-900">{reservation.price ? `¥${reservation.price.toLocaleString()}` : '없음'}</p>
                                </div>
                              </div>
                              {reservation.notes && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <label className="block text-xs font-medium text-gray-500 mb-1">메모</label>
                                  <p className="text-sm text-gray-700">{reservation.notes}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-8">예약 내역이 없습니다.</p>
                      )}
                    </div>
                  )}

                  {activeTab === 'payments' && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">
                          결제 내역 ({detailedStudent.payments?.length || 0}건)
                        </h4>
                        <Link
                          href={`/admin/students/payments?studentId=${detailedStudent.id}`}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          전체 보기
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                      {detailedStudent.payments && detailedStudent.payments.length > 0 ? (
                        <div className="space-y-3">
                          {detailedStudent.payments.map((payment: any) => (
                            <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">금액</label>
                                  <p className="text-sm font-semibold text-gray-900">
                                    ¥{payment.amount?.toLocaleString() || '0'}
                                  </p>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">결제 방법</label>
                                  <p className="text-sm text-gray-900">{payment.method || '없음'}</p>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">상태</label>
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    payment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                    payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {payment.status}
                                  </span>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">결제일</label>
                                  <p className="text-sm text-gray-900">
                                    {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : '없음'}
                                  </p>
                                </div>
                                {payment.description && (
                                  <div className="col-span-2">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">설명</label>
                                    <p className="text-sm text-gray-700">{payment.description}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-8">결제 내역이 없습니다.</p>
                      )}
                    </div>
                  )}

                  {activeTab === 'agreements' && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        동의서 ({(() => {
                          let count = detailedStudent.agreements?.length || 0;
                          if (detailedStudent.rulesAgreed) {
                            count += 1; // 규정 동의서
                          }
                          if (detailedStudent.agreementData || detailedStudent.signatureData) {
                            count += 1; // 입회 동의서
                          }
                          return count;
                        })()}건)
                      </h4>
                      
                      {/* 입회 시 저장된 동의서 */}
                      <div className="mb-6 space-y-3">
                        {/* 규정 동의서 */}
                        {detailedStudent.rulesAgreed && (
                          <div>
                            <h5 className="text-md font-semibold text-gray-800 mb-3">입회 시 동의서</h5>
                            <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors bg-blue-50">
                              <div className="grid grid-cols-2 gap-4 mb-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">동의서 유형</label>
                                  <p className="text-sm font-medium text-gray-900">규정 동의서 (입회 시 저장)</p>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">완료 여부</label>
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    완료
                                  </span>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">동의일</label>
                                  <p className="text-sm text-gray-900">
                                    {detailedStudent.rulesAgreedAt
                                      ? new Date(detailedStudent.rulesAgreedAt).toLocaleString('ko-KR', {
                                          year: 'numeric',
                                          month: '2-digit',
                                          day: '2-digit',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })
                                      : (detailedStudent.registrationDate
                                        ? new Date(detailedStudent.registrationDate).toLocaleString('ko-KR', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })
                                        : '없음')}
                                  </p>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">저장 위치</label>
                                  <p className="text-sm text-gray-900">학생 정보 (입회 시)</p>
                                </div>
                              </div>
                              <div className="mt-4 flex justify-end">
                                <button
                                  onClick={() => {
                                    try {
                                      // 규정 동의서 데이터 구성 - 안전한 접근
                                      let rulesAgreementData: any = null;
                                      if (detailedStudent.agreementData) {
                                        if (typeof detailedStudent.agreementData === 'object' && detailedStudent.agreementData !== null) {
                                          // agreementData가 객체인 경우
                                          if ('agreementData' in detailedStudent.agreementData) {
                                            rulesAgreementData = (detailedStudent.agreementData as any).agreementData;
                                          } else {
                                            rulesAgreementData = detailedStudent.agreementData;
                                          }
                                        } else if (typeof detailedStudent.agreementData === 'string') {
                                          try {
                                            const parsed = JSON.parse(detailedStudent.agreementData);
                                            rulesAgreementData = parsed.agreementData || parsed;
                                          } catch {
                                            rulesAgreementData = detailedStudent.agreementData;
                                          }
                                        }
                                      }

                                      // agreedRules 안전하게 추출
                                      let agreedRules: string[] = [];
                                      if (detailedStudent.agreementData) {
                                        if (typeof detailedStudent.agreementData === 'object' && detailedStudent.agreementData !== null) {
                                          if (Array.isArray((detailedStudent.agreementData as any).agreedRules)) {
                                            agreedRules = (detailedStudent.agreementData as any).agreedRules;
                                          }
                                        } else if (typeof detailedStudent.agreementData === 'string') {
                                          try {
                                            const parsed = JSON.parse(detailedStudent.agreementData);
                                            if (Array.isArray(parsed.agreedRules)) {
                                              agreedRules = parsed.agreedRules;
                                            }
                                          } catch {
                                            // 파싱 실패 시 빈 배열 유지
                                          }
                                        }
                                      }

                                      setSelectedAgreement({
                                        id: 'rules-original',
                                        agreementType: 'RULES_AGREEMENT',
                                        studentData: detailedStudent,
                                        agreementData: rulesAgreementData,
                                        signatureData: detailedStudent.signatureData || null,
                                        agreedItems: agreedRules,
                                        isCompleted: true,
                                        completedAt: detailedStudent.rulesAgreedAt || detailedStudent.registrationDate || detailedStudent.createdAt || new Date(),
                                        createdAt: detailedStudent.rulesAgreedAt || detailedStudent.registrationDate || detailedStudent.createdAt || new Date(),
                                      });
                                      setShowAgreementModal(true);
                                    } catch (error) {
                                      console.error('규정 동의서 데이터 로드 오류:', error);
                                      alert('동의서 데이터를 불러오는 중 오류가 발생했습니다.');
                                    }
                                  }}
                                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  동의서 보기
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 입회 동의서 */}
                        {(detailedStudent.agreementData || detailedStudent.signatureData) && (
                          <div>
                            {!detailedStudent.rulesAgreed && <h5 className="text-md font-semibold text-gray-800 mb-3">입회 시 동의서</h5>}
                            <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors bg-blue-50">
                              <div className="grid grid-cols-2 gap-4 mb-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">동의서 유형</label>
                                  <p className="text-sm font-medium text-gray-900">입회 동의서 (입회 시 저장)</p>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">완료 여부</label>
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    완료
                                  </span>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">동의일</label>
                                  <p className="text-sm text-gray-900">
                                    {detailedStudent.registrationDate
                                      ? new Date(detailedStudent.registrationDate).toLocaleString('ko-KR', {
                                          year: 'numeric',
                                          month: '2-digit',
                                          day: '2-digit',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })
                                      : (detailedStudent.createdAt
                                        ? new Date(detailedStudent.createdAt).toLocaleString('ko-KR', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })
                                        : '없음')}
                                  </p>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">저장 위치</label>
                                  <p className="text-sm text-gray-900">학생 정보 (입회 시)</p>
                                </div>
                              </div>
                              <div className="mt-4 flex justify-end">
                                <button
                                  onClick={() => {
                                    try {
                                      // 입회 동의서 데이터 안전하게 구성
                                      let agreementData: any = detailedStudent.agreementData;
                                      
                                      // agreementData가 문자열인 경우 파싱 시도
                                      if (typeof agreementData === 'string') {
                                        try {
                                          agreementData = JSON.parse(agreementData);
                                        } catch {
                                          // 파싱 실패 시 원본 문자열 유지
                                        }
                                      }

                                      // agreedItems 안전하게 추출
                                      let agreedItems: string[] = [];
                                      if (agreementData) {
                                        if (typeof agreementData === 'object' && agreementData !== null) {
                                          if (Array.isArray(agreementData.agreedRules)) {
                                            agreedItems = agreementData.agreedRules;
                                          } else if (agreementData.enrollmentFormData) {
                                            // enrollmentFormData가 있으면 빈 배열
                                            agreedItems = [];
                                          }
                                        }
                                      }

                                      setSelectedAgreement({
                                        id: 'enrollment-original',
                                        agreementType: 'ENROLLMENT_AGREEMENT',
                                        studentData: detailedStudent,
                                        agreementData: agreementData,
                                        signatureData: detailedStudent.signatureData || null,
                                        agreedItems: agreedItems,
                                        isCompleted: true,
                                        completedAt: detailedStudent.registrationDate || detailedStudent.createdAt || new Date(),
                                        createdAt: detailedStudent.registrationDate || detailedStudent.createdAt || new Date(),
                                      });
                                      setShowAgreementModal(true);
                                    } catch (error) {
                                      console.error('입회 동의서 데이터 로드 오류:', error);
                                      alert('동의서 데이터를 불러오는 중 오류가 발생했습니다.');
                                    }
                                  }}
                                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  동의서 보기
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Agreement 테이블에 저장된 동의서 */}
                      {detailedStudent.agreements && Array.isArray(detailedStudent.agreements) && detailedStudent.agreements.length > 0 ? (
                        <div>
                          <h5 className="text-md font-semibold text-gray-800 mb-3">저장된 동의서</h5>
                          <div className="space-y-3">
                            {detailedStudent.agreements.map((agreement: any) => (
                            <div key={agreement.id || Math.random()} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">동의서 유형</label>
                                  <p className="text-sm font-medium text-gray-900">
                                    {agreement.agreementType === 'RULES_AGREEMENT' ? '규정 동의서' :
                                     agreement.agreementType === 'ENROLLMENT_AGREEMENT' ? '입회 동의서' :
                                     agreement.agreementType || '알 수 없음'}
                                  </p>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">완료 여부</label>
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    agreement.isCompleted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {agreement.isCompleted ? '완료' : '미완료'}
                                  </span>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">완료일</label>
                                  <p className="text-sm text-gray-900">
                                    {agreement.completedAt
                                      ? (() => {
                                          try {
                                            return new Date(agreement.completedAt).toLocaleDateString('ko-KR');
                                          } catch {
                                            return '날짜 형식 오류';
                                          }
                                        })()
                                      : '없음'}
                                  </p>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">생성일</label>
                                  <p className="text-sm text-gray-900">
                                    {agreement.createdAt
                                      ? (() => {
                                          try {
                                            return new Date(agreement.createdAt).toLocaleString('ko-KR', {
                                              year: 'numeric',
                                              month: '2-digit',
                                              day: '2-digit',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            });
                                          } catch {
                                            return '날짜 형식 오류';
                                          }
                                        })()
                                      : '없음'}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-4 flex justify-end">
                                <button
                                  onClick={() => {
                                    try {
                                      // Agreement 데이터 안전하게 처리
                                      const safeAgreement = {
                                        id: agreement.id || 'unknown',
                                        agreementType: agreement.agreementType || 'UNKNOWN',
                                        studentData: agreement.studentData || null,
                                        agreementData: agreement.agreementData || null,
                                        signatureData: agreement.signatureData || null,
                                        agreedItems: Array.isArray(agreement.agreedItems) ? agreement.agreedItems : [],
                                        isCompleted: agreement.isCompleted || false,
                                        completedAt: agreement.completedAt || null,
                                        createdAt: agreement.createdAt || new Date(),
                                      };
                                      setSelectedAgreement(safeAgreement);
                                      setShowAgreementModal(true);
                                    } catch (error) {
                                      console.error('동의서 데이터 로드 오류:', error);
                                      alert('동의서 데이터를 불러오는 중 오류가 발생했습니다.');
                                    }
                                  }}
                                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  동의서 보기
                                </button>
                              </div>
                            </div>
                          ))}
                          </div>
                        </div>
                      ) : null}
                      
                      {/* 동의서가 하나도 없는 경우 */}
                      {(!detailedStudent.agreements || detailedStudent.agreements.length === 0) && 
                       !detailedStudent.agreementData && 
                       !detailedStudent.signatureData && (
                        <p className="text-sm text-gray-500 text-center py-8">동의서가 없습니다.</p>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-4 overflow-y-auto min-h-0">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800">
                    상세 정보를 불러올 수 없습니다. 기본 정보만 표시됩니다.
                  </p>
                </div>
                {/* 학생 이름 정보 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">이름 정보</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">한자</label>
                      <p className="text-sm font-medium text-gray-900">{(selectedStudent as any).kanjiName || selectedStudent.name || '없음'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">후리가나</label>
                      <p className="text-sm font-medium text-gray-900">{(selectedStudent as any).yomigana || '없음'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">한글</label>
                      <p className="text-sm font-medium text-gray-900">{(selectedStudent as any).koreanName || '없음'}</p>
                    </div>
                  </div>
                </div>

                {/* 학생 연락처 정보 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">연락처 정보</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">이메일</label>
                      <p className="text-sm font-medium text-gray-900">{selectedStudent.email || '없음'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">전화번호</label>
                      <p className="text-sm font-medium text-gray-900">{selectedStudent.phone || '없음'}</p>
                    </div>
                  </div>
                </div>

                {/* 학업 정보 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">학업 정보</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">레벨</label>
                      <p className="text-sm font-medium text-gray-900">{selectedStudent.level || '미등록'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">코스</label>
                      <p className="text-sm font-medium text-gray-900">{selectedStudent.course || '미등록'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">강사</label>
                      <p className="text-sm font-medium text-gray-900">{selectedStudent.teacher || '미등록'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">상태</label>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedStudent.status)}`}>
                        {getStatusText(selectedStudent.status)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">출석률</label>
                      <p className={`text-sm font-medium ${
                        selectedStudent.attendanceRate != null && !isNaN(selectedStudent.attendanceRate)
                          ? getAttendanceColor(selectedStudent.attendanceRate)
                          : 'text-gray-500'
                      }`}>
                        {selectedStudent.attendanceRate != null && !isNaN(selectedStudent.attendanceRate)
                          ? `${selectedStudent.attendanceRate}%`
                          : '0%'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">남은 시간</label>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedStudent.remainingHours != null && !isNaN(selectedStudent.remainingHours)
                          ? `${selectedStudent.remainingHours}시간`
                          : '구매 안함'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 긴급연락처/보호자 정보 */}
                {(selectedStudent as any).isMinor ? (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-md font-semibold text-gray-900">보호자 정보</h4>
                      {detailedStudent?.parents && Array.isArray(detailedStudent.parents) && detailedStudent.parents.length > 0 && (
                        <button
                          onClick={() => {
                            const parent = detailedStudent.parents[0];
                            if (parent?.id) {
                              window.open(`/admin/parents/${parent.id}`, '_blank');
                            }
                          }}
                          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <Users className="w-4 h-4" />
                          학부모 정보 보기
                        </button>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white rounded p-3">
                        <label className="block text-xs font-medium text-gray-500 mb-2">이름</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <span className="text-xs text-gray-400">한자</span>
                            <p className="text-sm font-medium text-gray-900">{(selectedStudent as any).parentNameKanji || '없음'}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-400">후리가나</span>
                            <p className="text-sm font-medium text-gray-900">{(selectedStudent as any).parentNameYomigana || '없음'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded p-3">
                        <label className="block text-xs font-medium text-gray-500 mb-2">연락처</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <span className="text-xs text-gray-400">전화번호</span>
                            <p className="text-sm font-medium text-gray-900">{(selectedStudent as any).parentPhone || '없음'}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-400">관계</span>
                            <p className="text-sm font-medium text-gray-900">{(selectedStudent as any).parentRelation || '없음'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="text-md font-semibold text-gray-900 mb-3">긴급연락처 정보</h4>
                    <div className="space-y-4">
                      <div className="bg-white rounded p-3">
                        <label className="block text-xs font-medium text-gray-500 mb-2">이름</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <span className="text-xs text-gray-400">한자</span>
                            <p className="text-sm font-medium text-gray-900">{(selectedStudent as any).emergencyContactNameKanji || '없음'}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-400">후리가나</span>
                            <p className="text-sm font-medium text-gray-900">{(selectedStudent as any).emergencyContactNameYomigana || '없음'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded p-3">
                        <label className="block text-xs font-medium text-gray-500 mb-2">연락처</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <span className="text-xs text-gray-400">전화번호</span>
                            <p className="text-sm font-medium text-gray-900">{(selectedStudent as any).emergencyContactPhone || '없음'}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-400">이메일</span>
                            <p className="text-sm font-medium text-gray-900">{(selectedStudent as any).emergencyContactEmail || '없음'}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-400">관계</span>
                            <p className="text-sm font-medium text-gray-900">{(selectedStudent as any).emergencyContactRelation || '없음'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 flex-shrink-0">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedStudent(null);
                  setDetailedStudent(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                닫기
              </button>
              {selectedStudent && (
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditStudent(selectedStudent);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  수정하기
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 동의서 상세 보기 모달 */}
      {showAgreementModal && selectedAgreement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] overflow-y-auto py-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 my-auto flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedAgreement.agreementType === 'RULES_AGREEMENT' ? '규정 동의서' :
                 selectedAgreement.agreementType === 'ENROLLMENT_AGREEMENT' ? '입회 동의서' :
                 '동의서'} 상세
              </h3>
              <button
                onClick={() => {
                  setShowAgreementModal(false);
                  setSelectedAgreement(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <AlertCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 pr-2 space-y-6">
              {/* 동의서 기본 정보 */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">동의서 정보</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">동의서 유형</label>
                    <p className="text-sm text-gray-900">
                      {selectedAgreement.agreementType === 'RULES_AGREEMENT' ? '규정 동의서' :
                       selectedAgreement.agreementType === 'ENROLLMENT_AGREEMENT' ? '입회 동의서' :
                       selectedAgreement.agreementType}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">완료 여부</label>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      selectedAgreement.isCompleted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedAgreement.isCompleted ? '완료' : '미완료'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">완료일</label>
                    <p className="text-sm text-gray-900">
                      {selectedAgreement.completedAt
                        ? new Date(selectedAgreement.completedAt).toLocaleString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : '없음'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">생성일</label>
                    <p className="text-sm text-gray-900">
                      {selectedAgreement.createdAt
                        ? new Date(selectedAgreement.createdAt).toLocaleString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : '없음'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 동의한 항목 */}
              {selectedAgreement.agreedItems && Array.isArray(selectedAgreement.agreedItems) && selectedAgreement.agreedItems.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">동의한 항목</h4>
                  <div className="space-y-2">
                    {selectedAgreement.agreedItems.map((item: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <p className="text-sm text-gray-900">{item || `항목 ${index + 1}`}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 서명 */}
              {selectedAgreement.signatureData && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">서명</h4>
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    {(() => {
                      try {
                        const sigData = selectedAgreement.signatureData;
                        let imageSrc = '';
                        
                        if (typeof sigData === 'string') {
                          if (sigData.startsWith('data:')) {
                            imageSrc = sigData;
                          } else {
                            // base64 데이터로 간주
                            imageSrc = `data:image/png;base64,${sigData}`;
                          }
                        } else {
                          // 객체인 경우 문자열로 변환 시도
                          imageSrc = String(sigData);
                        }

                        return (
                          <img
                            src={imageSrc}
                            alt="서명"
                            className="max-w-full h-auto border border-gray-300 bg-white"
                            style={{ maxHeight: '200px' }}
                            onError={(e) => {
                              console.error('서명 이미지 로드 실패:', imageSrc.substring(0, 50));
                              (e.target as HTMLImageElement).style.display = 'none';
                              const errorDiv = document.createElement('div');
                              errorDiv.className = 'text-sm text-red-600 p-2';
                              errorDiv.textContent = '서명 이미지를 불러올 수 없습니다.';
                              (e.target as HTMLImageElement).parentElement?.appendChild(errorDiv);
                            }}
                          />
                        );
                      } catch (error) {
                        console.error('서명 데이터 처리 오류:', error);
                        return (
                          <div className="text-sm text-red-600 p-2">
                            서명 데이터를 표시할 수 없습니다.
                          </div>
                        );
                      }
                    })()}
                  </div>
                </div>
              )}

              {/* 동의서 데이터 (JSON 형식으로 표시) */}
              {selectedAgreement.agreementData && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">동의서 내용</h4>
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                      {(() => {
                        try {
                          const data = selectedAgreement.agreementData;
                          if (typeof data === 'string') {
                            // 문자열인 경우, JSON인지 확인 후 포맷팅
                            try {
                              const parsed = JSON.parse(data);
                              return JSON.stringify(parsed, null, 2);
                            } catch {
                              // JSON이 아니면 그대로 표시
                              return data;
                            }
                          } else if (typeof data === 'object' && data !== null) {
                            return JSON.stringify(data, null, 2);
                          } else {
                            return String(data);
                          }
                        } catch (error) {
                          console.error('동의서 데이터 표시 오류:', error);
                          return '동의서 데이터를 표시할 수 없습니다.';
                        }
                      })()}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 flex-shrink-0">
              <button
                onClick={() => {
                  setShowAgreementModal(false);
                  setSelectedAgreement(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 예약 이력 모달 */}
      {showReservationModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-5xl mx-4 my-auto max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedStudent.name} - 예약 이력
              </h3>
              <button
                onClick={() => {
                  setShowReservationModal(false);
                  setSelectedStudentReservations([]);
                  setSelectedStudent(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <AlertCircle className="w-5 h-5" />
              </button>
            </div>

            <div 
              data-reservation-modal
              className="flex-1 overflow-y-auto min-h-0 pr-2"
            >
              {selectedStudentReservations.length === 0 ? (
                <p className="text-center text-gray-500 py-12">이력 없음</p>
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
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedStudentReservations.map((reservation: any) => {
                        // 날짜 포맷팅
                        const dateStr = reservation.date 
                          ? new Date(reservation.date).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit'
                            })
                          : '-';
                        
                        // 시간 포맷팅
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
                              // 문자열 형식인 경우
                              timeStr = reservation.startTime;
                            }
                          } catch {
                            timeStr = reservation.startTime || '-';
                          }
                        }
                        
                        // 수강시간 (duration 분)
                        const durationStr = reservation.duration 
                          ? `${reservation.duration}분`
                          : '-';
                        
                        // 형식 (ONLINE -> 온라인, OFFLINE -> 대면)
                        const locationStr = reservation.location === 'ONLINE' 
                          ? '온라인'
                          : reservation.location === 'OFFLINE'
                          ? '대면'
                          : reservation.location || '-';
                        
                        // 담당선생님
                        const teacherStr = reservation.teacher?.name || '미설정';
                        
                        // 수강여부
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
                        
                        // 비고
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
                                    // 레슨노트 페이지로 이동 (예약 ID 포함)
                                    window.open(`/admin/lesson-notes?reservationId=${reservation.id}&studentId=${selectedStudent.id}`, '_blank');
                                  }}
                                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  이동
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 flex-shrink-0">
              <button
                onClick={() => {
                  setShowReservationModal(false);
                  setSelectedStudentReservations([]);
                  setSelectedStudent(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 학생 수정 모달 */}
      {showEditModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">학생 정보 수정</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedStudent(null);
                  setEditFormData({});
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <AlertCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                  <input
                    type="text"
                    value={editFormData.name || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                  <input
                    type="email"
                    value={editFormData.email || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                  <input
                    type="tel"
                    value={editFormData.phone || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">레벨</label>
                  <input
                    type="text"
                    value={editFormData.level || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">코스</label>
                  <input
                    type="text"
                    value={editFormData.course || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">코스는 예약 정보에서 관리됩니다.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">강사</label>
                  <input
                    type="text"
                    value={editFormData.teacher || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">강사는 예약 정보에서 관리됩니다.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                  <select
                    value={editFormData.status || 'active'}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as Student['status'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">활성</option>
                    <option value="inactive">비활성</option>
                    <option value="graduated">졸업</option>
                    <option value="suspended">정지</option>
                  </select>
                </div>
              </div>

              {/* 긴급연락처 정보 (미성년자가 아닌 경우만 표시) */}
              {!editFormData.isMinor && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">긴급연락처 정보</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">긴급연락처 이름 (한자)</label>
                      <input
                        type="text"
                        value={(editFormData as any).emergencyContactNameKanji || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, emergencyContactNameKanji: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">긴급연락처 이름 (후리가나)</label>
                      <input
                        type="text"
                        value={(editFormData as any).emergencyContactNameYomigana || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, emergencyContactNameYomigana: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">긴급연락처 전화번호</label>
                      <input
                        type="tel"
                        value={(editFormData as any).emergencyContactPhone || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, emergencyContactPhone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">긴급연락처 관계</label>
                      <input
                        type="text"
                        value={(editFormData as any).emergencyContactRelation || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, emergencyContactRelation: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">긴급연락처 이메일</label>
                      <input
                        type="email"
                        value={(editFormData as any).emergencyContactEmail || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, emergencyContactEmail: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">※ 미성년자의 경우 학부모 정보는 학부모 계정에서 관리됩니다.</p>
                </div>
              )}

              {/* 미성년자인 경우 학부모 정보 안내 */}
              {editFormData.isMinor && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800 mb-3">
                      이 학생은 미성년자입니다. 학부모 정보는 학부모 계정에서 관리됩니다.
                    </p>
                    {(selectedStudent as any)?.parents && Array.isArray((selectedStudent as any).parents) && (selectedStudent as any).parents.length > 0 && (
                      <button
                        onClick={() => {
                          const parent = (selectedStudent as any).parents[0];
                          if (parent?.id) {
                            window.open(`/admin/parents/${parent.id}`, '_blank');
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        학부모 정보 보기
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={async () => {
                  if (!selectedStudent?.email) {
                    alert('이메일이 등록되지 않은 학생입니다.');
                    return;
                  }
                  
                  if (!confirm(`${selectedStudent.name} 학생의 이메일(${selectedStudent.email})로 임시 패스워드를 전송하시겠습니까?`)) {
                    return;
                  }

                  try {
                    const url = `/api/admin/students/${selectedStudent.id}/reset-password`;
                    console.log('패스워드 재설정 요청 URL:', url);
                    
                    const response = await fetch(url, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      credentials: 'include',
                    });

                    console.log('패스워드 재설정 응답 상태:', response.status, response.statusText);
                    console.log('패스워드 재설정 응답 헤더:', Object.fromEntries(response.headers.entries()));

                    // 응답이 JSON인지 확인
                    const contentType = response.headers.get('content-type');
                    if (!contentType || !contentType.includes('application/json')) {
                      const text = await response.text();
                      console.error('JSON이 아닌 응답:', text);
                      alert(`❌ 패스워드 재설정 실패: 서버 응답 오류 (${response.status})\n\n${text.substring(0, 200)}`);
                      return;
                    }

                    const data = await response.json();

                    if (!response.ok) {
                      console.error('패스워드 재설정 API 오류:', data);
                      alert(`❌ 패스워드 재설정 실패: ${data.error || '알 수 없는 오류'}`);
                      return;
                    }

                    if (data.success) {
                      if (data.emailSent) {
                        alert(`✅ 패스워드 재설정 완료!\n\n임시 패스워드가 ${selectedStudent.email || '학생 이메일'}로 전송되었습니다.\n\n임시 패스워드: ${data.temporaryPassword}\n\n(개발/테스트용으로 화면에 표시됩니다)`);
                      } else if (data.emailError) {
                        alert(`⚠️ 패스워드는 재설정되었지만 이메일 전송에 실패했습니다.\n\n임시 패스워드: ${data.temporaryPassword}\n\n이메일 오류: ${data.emailError}\n\n수동으로 학생에게 전달해주세요.`);
                      } else {
                        alert(`✅ 패스워드 재설정 완료!\n\n임시 패스워드: ${data.temporaryPassword}\n\n(이메일이 등록되지 않아 화면에 표시됩니다)`);
                      }
                    } else {
                      alert(`❌ 패스워드 재설정 실패: ${data.error || '알 수 없는 오류'}`);
                    }
                  } catch (error) {
                    console.error('패스워드 재설정 오류:', error);
                    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
                    alert(`❌ 패스워드 재설정 중 오류가 발생했습니다.\n\n${errorMessage}`);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                <Key className="w-4 h-4" />
                패스워드 재설정
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedStudent(null);
                    setEditFormData({});
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

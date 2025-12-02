"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  GraduationCap,
  Search,
  Edit3,
  Trash2,
  Eye,
  Star,
  UserPlus,
  Clock,
  CheckCircle,
  XCircle,
  User,
} from "lucide-react";

interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  experience: number;
  joinDate: string;
  totalStudents: number;
  totalLessons: number;
  averageRating: number;
  salary: number;
  status: "active" | "inactive" | "suspended";
  specialization: string[];
  lastLessonDate: string;
  notes?: string;
}

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showTeacherModal, setShowTeacherModal] = useState(false);

  const loadTeachers = useCallback(async () => {
    try {
      // 실제 데이터베이스에서 선생님 데이터 로드
      const response = await fetch("/api/admin/teachers", {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      
      if (data.success && data.teachers && data.teachers.length > 0) {
        // 실제 데이터를 Teacher 형식으로 변환
        const formattedTeachers: Teacher[] = data.teachers.map((teacher: any) => ({
          id: teacher.id,
          name: teacher.name,
          email: teacher.email || "",
          phone: teacher.phone || "",
          subject: teacher.subject || "미정",
          experience: teacher.experience || 0,
          joinDate: teacher.createdAt?.split('T')[0] || "",
          totalStudents: 0, // 실제 데이터가 없으므로 기본값
          totalLessons: 0, // 실제 데이터가 없으므로 기본값
          averageRating: 0, // 실제 데이터가 없으므로 기본값
          salary: 0, // 실제 데이터가 없으므로 기본값
          status: "active" as "active" | "inactive" | "suspended", // 기본값으로 active 설정
          specialization: [], // 실제 데이터가 없으므로 빈 배열
          lastLessonDate: "", // 실제 데이터가 없으므로 빈 문자열
          notes: teacher.notes || "",
        }));
        setTeachers(formattedTeachers);
      } else {
        // 데이터가 없으면 빈 배열
        setTeachers([]);
      }
    } catch (error) {
      console.error("선생님 목록 로딩 실패:", error);
      setTeachers([]);
    }
  }, []);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  const filterAndSortTeachers = useMemo(() => {
    const filtered = teachers.filter((teacher) => {
      const matchesSearch =
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.phone.includes(searchTerm);
      const matchesSubject =
        filterSubject === "all" || teacher.subject === filterSubject;
      const matchesStatus =
        filterStatus === "all" || teacher.status === filterStatus;
      return matchesSearch && matchesSubject && matchesStatus;
    });

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "joinDate":
          return (
            new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime()
          );
        case "averageRating":
          return b.averageRating - a.averageRating;
        case "totalStudents":
          return b.totalStudents - a.totalStudents;
        case "salary":
          return b.salary - a.salary;
        default:
          return 0;
      }
    });

    return filtered;
  }, [teachers, searchTerm, filterSubject, filterStatus, sortBy]);

  useEffect(() => {
    setFilteredTeachers(filterAndSortTeachers);
  }, [filterAndSortTeachers]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "inactive":
        return "text-gray-600 bg-gray-100";
      case "suspended":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  }, []);

  const getStatusText = useCallback((status: string) => {
    switch (status) {
      case "active":
        return "활성";
      case "inactive":
        return "비활성";
      case "suspended":
        return "정지";
      default:
        return "미정";
    }
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />;
      case "inactive":
        return <Clock className="w-4 h-4" />;
      case "suspended":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  }, []);

  const formatCurrency = useCallback((amount: number) => {
    return amount.toLocaleString("ko-KR") + "원";
  }, []);

  const handleDeleteTeacher = useCallback((teacherId: string) => {
    if (confirm("정말로 이 선생님을 삭제하시겠습니까?")) {
      setTeachers(prev => prev.filter((teacher) => teacher.id !== teacherId));
    }
  }, []);

  const stats = useMemo(() => ({
    total: teachers.length,
    active: teachers.filter((t) => t.status === "active").length,
    inactive: teachers.filter((t) => t.status === "inactive").length,
    suspended: teachers.filter((t) => t.status === "suspended").length,
  }), [teachers]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">선생님 관리</h1>
            <p className="text-sm text-gray-600">
              전체 선생님 정보를 관리하세요
            </p>
          </div>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <UserPlus className="w-4 h-4 mr-2" />새 선생님 등록
          </button>
        </div>
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <button
            onClick={() => {
              setFilterStatus("all");
              setFilterSubject("all");
              setSearchTerm("");
              setTimeout(() => {
                const element = document.getElementById("teacher-list");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }, 100);
            }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer text-left"
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <GraduationCap className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">전체 선생님</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}명
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setFilterStatus("active");
              setFilterSubject("all");
              setSearchTerm("");
              setTimeout(() => {
                const element = document.getElementById("teacher-list");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }, 100);
            }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer text-left"
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">활성 선생님</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.active}명
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setFilterStatus("inactive");
              setFilterSubject("all");
              setSearchTerm("");
              setTimeout(() => {
                const element = document.getElementById("teacher-list");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }, 100);
            }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer text-left"
          >
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Clock className="w-6 h-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">비활성 선생님</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.inactive}명
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setFilterStatus("suspended");
              setFilterSubject("all");
              setSearchTerm("");
              setTimeout(() => {
                const element = document.getElementById("teacher-list");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }, 100);
            }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer text-left"
          >
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">정지 선생님</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.suspended}명
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="선생님명, 이메일, 전화번호로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">모든 과목</option>
              <option value="한국어 문법">한국어 문법</option>
              <option value="한국어 회화">한국어 회화</option>
              <option value="한국어 작문">한국어 작문</option>
              <option value="한국어 발음">한국어 발음</option>
              <option value="한국어 문화">한국어 문화</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">모든 상태</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
              <option value="suspended">정지</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">이름순</option>
              <option value="joinDate">입사일순</option>
              <option value="averageRating">평점순</option>
              <option value="totalStudents">담당학생순</option>
              <option value="salary">급여순</option>
            </select>
          </div>
        </div>

        {/* 선생님 목록 */}
        <div id="teacher-list" className="bg-white rounded-xl shadow-lg">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">선생님 목록</h2>
          </div>
          <div className="overflow-x-auto max-w-full">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    선생님 정보
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    과목
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    경력
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    담당 학생
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    총 수업
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    평점
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    급여
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <GraduationCap className="h-16 w-16 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          등록된 선생님이 없습니다
                        </h3>
                        <p className="text-gray-600 mb-6">
                          아직 등록된 선생님이 없습니다. 새로운 선생님을 등록해보세요.
                        </p>
                        <button
                          onClick={() => setShowTeacherModal(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <UserPlus className="h-4 w-4" />
                          선생님 추가하기
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {teacher.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {teacher.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {teacher.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {teacher.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {teacher.experience}년
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {teacher.totalStudents}명
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {teacher.totalLessons}회
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm text-gray-900">
                          {teacher.averageRating}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(teacher.salary)}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(teacher.status)}`}
                      >
                        {getStatusIcon(teacher.status)}
                        <span className="ml-1">
                          {getStatusText(teacher.status)}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedTeacher(teacher);
                            setShowTeacherModal(true);
                          }}
                          className="p-1 text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-green-600 hover:text-green-900">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTeacher(teacher.id)}
                          className="p-1 text-red-600 hover:text-red-900"
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
      </div>

      {/* 선생님 상세 모달 */}
      {showTeacherModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  선생님 상세 정보
                </h2>
                <button
                  onClick={() => setShowTeacherModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedTeacher.name}
                  </h3>
                  <p className="text-gray-600">{selectedTeacher.email}</p>
                  <p className="text-gray-600">{selectedTeacher.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    기본 정보
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">과목:</span>
                      <span>{selectedTeacher.subject}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">경력:</span>
                      <span>{selectedTeacher.experience}년</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">입사일:</span>
                      <span>{selectedTeacher.joinDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">상태:</span>
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedTeacher.status)}`}
                      >
                        {getStatusIcon(selectedTeacher.status)}
                        <span className="ml-1">
                          {getStatusText(selectedTeacher.status)}
                        </span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">급여:</span>
                      <span>{formatCurrency(selectedTeacher.salary)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    업무 현황
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">담당 학생:</span>
                      <span>{selectedTeacher.totalStudents}명</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">총 수업:</span>
                      <span>{selectedTeacher.totalLessons}회</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">평균 평점:</span>
                      <div className="flex items-center">
                        <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                        <span>{selectedTeacher.averageRating}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">마지막 수업:</span>
                      <span>{selectedTeacher.lastLessonDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  전문 분야
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTeacher.specialization.map((spec, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {selectedTeacher.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    메모
                  </h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {selectedTeacher.notes}
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowTeacherModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  닫기
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  수정하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

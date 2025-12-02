"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  User,
  BookOpen,
  MapPin,
  ArrowLeft,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  Search,
} from "lucide-react";
import Link from "next/link";

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  level: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  subjects: string[];
  rating: number;
  status: "active" | "inactive";
}

interface Subject {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  level: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
  teacherId?: string;
}

interface Reservation {
  id: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  notes?: string;
  price: number;
  status: "upcoming" | "completed" | "cancelled" | "confirmed";
  studentId: string;
  teacherId: string;
  subjectId: string;
}

export default function AdminEditReservationPage() {
  const params = useParams();
  const router = useRouter();
  const reservationId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // 원본 예약 데이터
  const [originalReservation, setOriginalReservation] =
    useState<Reservation | null>(null);

  // 폼 데이터
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // 데이터
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedStudentData, setSelectedStudentData] =
    useState<Student | null>(null);
  const [selectedTeacherData, setSelectedTeacherData] =
    useState<Teacher | null>(null);
  const [selectedSubjectData, setSelectedSubjectData] =
    useState<Subject | null>(null);

  // 검색
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [teacherSearchTerm, setTeacherSearchTerm] = useState("");

  // 날짜 관련
  const [minDate, setMinDate] = useState<string>("");
  const [maxDate, setMaxDate] = useState<string>("");

  useEffect(() => {
    // 최소 날짜 (오늘), 최대 날짜 (3개월 후)
    const today = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(today.getMonth() + 3);

    setMinDate(today.toISOString().split("T")[0]);
    setMaxDate(threeMonthsLater.toISOString().split("T")[0]);

    // 데이터 로드
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // 실제 API 호출로 대체
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockReservation: Reservation = {
        id: reservationId,
        date: "2024-01-15",
        time: "14:00",
        duration: 60,
        location: "온라인",
        notes: "일상 대화 연습을 하고 싶습니다.",
        price: 30000,
        status: "confirmed",
        studentId: "1",
        teacherId: "1",
        subjectId: "1",
      };

      const mockStudents: Student[] = [
        {
          id: "1",
          name: "김학생",
          email: "student1@example.com",
          phone: "010-1234-5678",
          level: "중급 B",
        },
        {
          id: "2",
          name: "이학생",
          email: "student2@example.com",
          phone: "010-2345-6789",
          level: "초급 A",
        },
        {
          id: "3",
          name: "박학생",
          email: "student3@example.com",
          phone: "010-3456-7890",
          level: "고급 C",
        },
        {
          id: "4",
          name: "최학생",
          email: "student4@example.com",
          phone: "010-4567-8901",
          level: "중급 A",
        },
        {
          id: "5",
          name: "정학생",
          email: "student5@example.com",
          phone: "010-5678-9012",
          level: "초급 B",
        },
      ];

      const mockTeachers: Teacher[] = [
        {
          id: "1",
          name: "김선생님",
          email: "teacher1@example.com",
          phone: "010-9876-5432",
          subjects: ["한국어 회화", "문법", "작문"],
          rating: 4.8,
          status: "active",
        },
        {
          id: "2",
          name: "이선생님",
          email: "teacher2@example.com",
          phone: "010-8765-4321",
          subjects: ["한국어 회화", "리스닝", "발음"],
          rating: 4.9,
          status: "active",
        },
        {
          id: "3",
          name: "박선생님",
          email: "teacher3@example.com",
          phone: "010-7654-3210",
          subjects: ["문법", "작문", "시험준비"],
          rating: 4.7,
          status: "active",
        },
      ];

      const mockSubjects: Subject[] = [
        {
          id: "1",
          name: "한국어 회화",
          description: "일상 대화와 실용적인 한국어 표현 학습",
          duration: 60,
          price: 30000,
          level: "초급~고급",
        },
        {
          id: "2",
          name: "문법",
          description: "체계적인 한국어 문법 학습",
          duration: 60,
          price: 30000,
          level: "초급~고급",
        },
        {
          id: "3",
          name: "작문",
          description: "한국어 작문 능력 향상",
          duration: 60,
          price: 35000,
          level: "중급~고급",
        },
        {
          id: "4",
          name: "리스닝",
          description: "한국어 듣기 능력 향상",
          duration: 45,
          price: 25000,
          level: "초급~고급",
        },
        {
          id: "5",
          name: "발음",
          description: "정확한 한국어 발음 교정",
          duration: 45,
          price: 25000,
          level: "초급~중급",
        },
        {
          id: "6",
          name: "시험준비",
          description: "TOPIK, KLPT 등 한국어 시험 준비",
          duration: 90,
          price: 40000,
          level: "중급~고급",
        },
      ];

      setOriginalReservation(mockReservation);
      setStudents(mockStudents);
      setTeachers(mockTeachers);
      setSubjects(mockSubjects);

      // 폼 데이터 초기화
      setSelectedStudent(mockReservation.studentId);
      setSelectedTeacher(mockReservation.teacherId);
      setSelectedSubject(mockReservation.subjectId);
      setSelectedDate(mockReservation.date);
      setSelectedTime(mockReservation.time);
      setSelectedLocation(mockReservation.location);
      setSelectedStatus(mockReservation.status);
      setNotes(mockReservation.notes || "");

      setLoading(false);
    } catch (error) {
      console.error("데이터 로드 실패:", error);
      setError("데이터를 불러오는데 실패했습니다.");
      setLoading(false);
    }
  };

  // 학생 선택 시
  useEffect(() => {
    if (selectedStudent) {
      const student = students.find((s) => s.id === selectedStudent);
      setSelectedStudentData(student || null);
    }
  }, [selectedStudent, students]);

  // 선생님 선택 시
  useEffect(() => {
    if (selectedTeacher) {
      const teacher = teachers.find((t) => t.id === selectedTeacher);
      setSelectedTeacherData(teacher || null);
      setSelectedLocation(teacher?.status === "active" ? "온라인" : "오프라인");
    }
  }, [selectedTeacher, teachers]);

  // 과목 선택 시
  useEffect(() => {
    if (selectedSubject) {
      const subject = subjects.find((s) => s.id === selectedSubject);
      setSelectedSubjectData(subject || null);
    }
  }, [selectedSubject, subjects]);

  // 날짜 선택 시 가능한 시간대 로드
  useEffect(() => {
    if (selectedDate && selectedTeacherData) {
      loadAvailableTimeSlots();
    }
  }, [selectedDate, selectedTeacherData]);

  const loadAvailableTimeSlots = async () => {
    try {
      // 실제 API 호출로 대체
      await new Promise((resolve) => setTimeout(resolve, 500));

      const dayOfWeek = new Date(selectedDate).toLocaleDateString("ko-KR", {
        weekday: "short",
      });
      const isAvailableDay = selectedTeacherData?.status === "active";

      if (!isAvailableDay) {
        setAvailableTimeSlots([]);
        return;
      }

      // 선택된 날짜의 가능한 시간대 생성
      const slots: TimeSlot[] = [
        "09:00",
        "10:00",
        "11:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
      ].map((time) => ({
        time,
        available: Math.random() > 0.3, // 70% 확률로 가능
      }));

      setAvailableTimeSlots(slots);
    } catch (error) {
      console.error("시간대 로드 실패:", error);
      setAvailableTimeSlots([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !selectedStudent ||
      !selectedTeacher ||
      !selectedSubject ||
      !selectedDate ||
      !selectedTime
    ) {
      setError("모든 필수 항목을 선택해주세요.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // 실제 API 호출로 대체
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const updatedReservation = {
        id: reservationId,
        studentId: selectedStudent,
        teacherId: selectedTeacher,
        subjectId: selectedSubject,
        date: selectedDate,
        time: selectedTime,
        location: selectedLocation,
        status: selectedStatus,
        notes: notes.trim() || undefined,
        duration: selectedSubjectData?.duration || 60,
        price: selectedSubjectData?.price || 30000,
      };

      console.log("수정된 예약 데이터:", updatedReservation);

      // 성공 처리
      setSuccess(true);
      setTimeout(() => {
        router.push(`/admin/reservations/${reservationId}`);
      }, 2000);
    } catch (error) {
      console.error("예약 수정 실패:", error);
      setError("예약 수정 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };

  const getDayOfWeek = (date: string) => {
    return new Date(date).toLocaleDateString("ko-KR", { weekday: "long" });
  };

  const hasChanges = () => {
    if (!originalReservation) return false;

    return (
      selectedStudent !== originalReservation.studentId ||
      selectedTeacher !== originalReservation.teacherId ||
      selectedSubject !== originalReservation.subjectId ||
      selectedDate !== originalReservation.date ||
      selectedTime !== originalReservation.time ||
      selectedLocation !== originalReservation.location ||
      selectedStatus !== originalReservation.status ||
      notes !== (originalReservation.notes || "")
    );
  };

  // 필터링된 학생/선생님 목록 (검색어가 없으면 모든 학생 표시)
  const filteredStudents = useMemo(() => {
    // 검색어가 없거나 공백만 있으면 모든 학생 반환
    if (!studentSearchTerm || !studentSearchTerm.trim()) {
      return students;
    }
    // 검색어가 있으면 필터링
    const searchLower = studentSearchTerm.trim().toLowerCase();
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower) ||
        student.name.includes(searchLower) ||
        student.email.includes(searchLower)
    );
  }, [students, studentSearchTerm]);

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(teacherSearchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(teacherSearchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">예약 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              수정이 완료되었습니다!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              예약이 성공적으로 수정되었습니다. 예약 상세 페이지로 이동합니다.
            </p>
            <div className="animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!originalReservation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              예약을 찾을 수 없습니다
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              요청하신 예약 정보를 찾을 수 없습니다.
            </p>
            <Link
              href="/admin/reservations"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              예약 목록으로
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">예약 수정</h1>
            <p className="text-lg text-gray-600">예약 정보를 수정하세요</p>
          </div>
          <Link
            href={`/admin/reservations/${reservationId}`}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            예약 상세로
          </Link>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* 수정 폼 */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 학생 선택 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              학생 선택
            </h2>

            {/* 학생 검색 */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="학생 이름이나 이메일로 검색... (입력하지 않으면 전체 표시)"
                  value={studentSearchTerm}
                  onChange={(e) => setStudentSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {filteredStudents.length > 0 ? (
              <>
                <div className="mb-2 text-sm text-gray-500">
                  {studentSearchTerm.trim() 
                    ? `${filteredStudents.length}명의 학생이 검색되었습니다.` 
                    : `전체 ${filteredStudents.length}명의 학생`}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredStudents.map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => setSelectedStudent(student.id)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        selectedStudent === student.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {student.name}
                        </h3>
                        <span className="text-sm text-blue-600">
                          {student.level}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>{student.email}</div>
                        <div>{student.phone}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                검색 결과가 없습니다.
              </div>
            )}
          </div>

          {/* 선생님 선택 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-green-600" />
              선생님 선택
            </h2>

            {/* 선생님 검색 */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="선생님 이름이나 이메일로 검색..."
                  value={teacherSearchTerm}
                  onChange={(e) => setTeacherSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTeachers.map((teacher) => (
                <button
                  key={teacher.id}
                  type="button"
                  onClick={() => setSelectedTeacher(teacher.id)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedTeacher === teacher.id
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {teacher.name}
                    </h3>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm text-gray-600">
                        {teacher.rating}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <div>{teacher.email}</div>
                    <div>{teacher.phone}</div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {teacher.subjects.join(", ")}
                  </div>
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        teacher.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {teacher.status === "active" ? "활성" : "비활성"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 과목 선택 */}
          {selectedTeacher && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                과목 선택
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subjects
                  .filter((subject) =>
                    selectedTeacherData?.subjects.includes(subject.name),
                  )
                  .map((subject) => (
                    <button
                      key={subject.id}
                      type="button"
                      onClick={() => setSelectedSubject(subject.id)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        selectedSubject === subject.id
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {subject.name}
                        </h3>
                        <span className="text-sm font-medium text-purple-600">
                          {subject.price.toLocaleString()}원
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {subject.description}
                      </p>
                      <div className="text-xs text-gray-500">
                        <div>수업시간: {subject.duration}분</div>
                        <div>레벨: {subject.level}</div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* 날짜 및 시간 선택 */}
          {selectedSubject && (
            <>
              {/* 날짜 선택 */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  날짜 선택
                </h2>
                <div className="max-w-md">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={minDate}
                    max={maxDate}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  {selectedDate && (
                    <p className="text-sm text-gray-600 mt-2">
                      선택된 날짜: {selectedDate} ({getDayOfWeek(selectedDate)})
                    </p>
                  )}
                </div>
              </div>

              {/* 시간 선택 */}
              {selectedDate && availableTimeSlots.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-red-600" />
                    시간 선택
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {availableTimeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className={`p-3 border-2 rounded-lg text-center transition-all ${
                          selectedTime === slot.time
                            ? "border-red-500 bg-red-50 text-red-700"
                            : slot.available
                              ? "border-gray-200 hover:border-gray-300 text-gray-900"
                              : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <div className="font-medium">{slot.time}</div>
                        <div className="text-xs">
                          {slot.available ? "가능" : "불가"}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* 추가 설정 */}
          {selectedTime && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                추가 설정
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 장소 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    수업 장소
                  </label>
                  <div className="flex gap-3">
                    {["오프라인", "온라인"].map((location) => (
                      <button
                        key={location}
                        type="button"
                        onClick={() => setSelectedLocation(location)}
                        className={`px-4 py-2 border-2 rounded-lg transition-all ${
                          selectedLocation === location
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {location}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 상태 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    예약 상태
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="upcoming">예정</option>
                    <option value="confirmed">확정</option>
                    <option value="completed">완료</option>
                    <option value="cancelled">취소</option>
                  </select>
                </div>
              </div>

              {/* 메모 */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  메모 (선택사항)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="예약에 대한 특별한 메모나 요청사항을 입력하세요."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* 수정 요약 */}
          {selectedStudent &&
            selectedTeacher &&
            selectedSubject &&
            selectedDate &&
            selectedTime && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  수정 요약
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">학생</div>
                    <div className="font-medium text-gray-900">
                      {selectedStudentData?.name}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">선생님</div>
                    <div className="font-medium text-gray-900">
                      {selectedTeacherData?.name}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">과목</div>
                    <div className="font-medium text-gray-900">
                      {selectedSubjectData?.name}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">날짜</div>
                    <div className="font-medium text-gray-900">
                      {selectedDate} ({getDayOfWeek(selectedDate)})
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">시간</div>
                    <div className="font-medium text-gray-900">
                      {selectedTime}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">상태</div>
                    <div className="font-medium text-gray-900">
                      {selectedStatus}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">수업시간</div>
                    <div className="font-medium text-gray-900">
                      {selectedSubjectData?.duration}분
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">수강료</div>
                    <div className="font-medium text-gray-900">
                      {selectedSubjectData?.price.toLocaleString()}원
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">장소</div>
                    <div className="font-medium text-gray-900">
                      {selectedLocation}
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* 제출 버튼 */}
          {selectedStudent &&
            selectedTeacher &&
            selectedSubject &&
            selectedDate &&
            selectedTime && (
              <div className="flex justify-end gap-4">
                <Link
                  href={`/admin/reservations/${reservationId}`}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </Link>
                <button
                  type="submit"
                  disabled={saving || !hasChanges()}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      수정 중...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      수정하기
                    </>
                  )}
                </button>
              </div>
            )}
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Home,
  Search,
  Save,
  Mic,
  Play,
  Pause,
  AlertCircle,
  X,
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  level: string;
  lastLessonDate: string;
  nextLessonDate?: string;
  hasUpcomingClass: boolean;
  hasTodayLesson?: boolean;
  lessonTime?: string;
}

interface LessonNote {
  id: string;
  studentId: string;
  studentName: string;
  lessonDate: string;
  lessonTime: string;
  title: string;
  content: string;
  audioUrl?: string;
  attachments: string[];
  curriculumItems: string[];
  review: string;
  homework: string;
  isCompleted: boolean;
  createdAt: string;
}

interface CurriculumItem {
  id: string;
  title: string;
  category: string;
  status: "not_started" | "in_progress" | "completed" | "review_needed";
  explanationCount: number;
  lastExplained?: string;
}

interface Curriculum {
  id: string;
  level: number;
  items: CurriculumItem[];
}

interface LearningAnalysis {
  frequentlyExplained: string[];
  notExplainedRecently: string[];
  missingItems: string[];
  studentProgress: number;
  weakPoints: string[];
  recommendations: string[];
}

export default function TeacherLessonNotesPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [lessonNote, setLessonNote] = useState<LessonNote | null>(null);
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showTodayOnly, setShowTodayOnly] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [showSessionTimeout, setShowSessionTimeout] = useState(false);
  const [showStudentSelector, setShowStudentSelector] = useState(false);

  // 학생 목록 조회
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const teacherId = localStorage.getItem("teacherId") || "T-001"; // 실제로는 인증 시스템에서 가져옴
      const response = await fetch(
        `/api/teacher/students?teacherId=${teacherId}`,
      );
      const data = await response.json();

      if (data.success) {
        setStudents(data.students);
        // 당일 수업 학생 자동 선택
        const todayStudent = data.students.find(
          (s: Student) => s.hasTodayLesson,
        );
        if (todayStudent) {
          setSelectedStudent(todayStudent);
        }
      }
    } catch (error) {
      console.error("학생 목록 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 레슨 노트 조회
  const fetchLessonNote = async (studentId: string) => {
    try {
      const teacherId = localStorage.getItem("teacherId") || "T-001";
      const response = await fetch(
        `/api/teacher/lesson-notes/${studentId}?teacherId=${teacherId}`,
      );
      const data = await response.json();

      if (data.success) {
        setLessonNote(data.note);
      }
    } catch (error) {
      console.error("레슨 노트 조회 실패:", error);
    }
  };

  // 커리큘럼 조회
  const fetchCurriculum = async (level: string) => {
    try {
      const response = await fetch(`/api/teacher/curriculum/${level}`);
      const data = await response.json();

      if (data.success) {
        setCurriculum(data.curriculum);
      }
    } catch (error) {
      console.error("커리큘럼 조회 실패:", error);
    }
  };

  // 학생 선택 시 노트와 커리큘럼 로드
  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    fetchLessonNote(student.id);
    fetchCurriculum(student.level);
  };

  // 노트 저장
  const saveLessonNote = async () => {
    if (!lessonNote) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/teacher/lesson-notes/${lessonNote.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(lessonNote),
        },
      );

      const data = await response.json();

      if (data.success) {
        alert("노트가 저장되었습니다");
      } else {
        alert("노트 저장 실패");
      }
    } catch (error) {
      alert("노트 저장 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  // 음성 녹음 시작/중지
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // 실제 구현에서는 Web Audio API 사용
  };

  // 필터링된 학생 목록
  const filteredStudents = students.filter((student) => {
    if (searchTerm) {
      return student.name.toLowerCase().includes(searchTerm.toLowerCase());
    }
    if (showTodayOnly) {
      return student.hasTodayLesson;
    }
    return true;
  });

  // 수업 시간 경과 확인 (10분 간격)
  useEffect(() => {
    if (selectedStudent?.lessonTime) {
      const lessonTime = new Date(selectedStudent.lessonTime);
      const now = new Date();
      const timeDiff = now.getTime() - lessonTime.getTime();
      const minutesDiff = Math.floor(timeDiff / (1000 * 60));

      if (minutesDiff > 10 && minutesDiff % 10 === 0) {
        setShowSessionTimeout(true);
      }
    }
  }, [selectedStudent]);

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">레슨 노트</h1>
            <p className="text-lg text-gray-600">
              학생별 수업 기록 및 커리큘럼 관리
            </p>
          </div>
          <Link
            href="/teacher/home"
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            선생님 홈
          </Link>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="학생 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="todayOnly"
                checked={showTodayOnly}
                onChange={(e) => setShowTodayOnly(e.target.checked)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="todayOnly" className="text-sm text-gray-700">
                오늘 수업 학생만
              </label>
            </div>

            <div className="text-sm text-gray-600">
              총 {filteredStudents.length}명의 학생
            </div>

            <button
              onClick={() => setShowStudentSelector(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              테스트용 수업 선택
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 좌측: 학생 목록 및 노트 */}
          <div className="space-y-6">
            {/* 학생 목록 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                학생 목록
              </h2>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">
                    학생 목록을 불러오는 중...
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => handleStudentSelect(student)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedStudent?.id === student.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {student.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            레벨 {student.level}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            마지막 수업:{" "}
                            {new Date(
                              student.lastLessonDate,
                            ).toLocaleDateString()}
                          </p>
                          {student.hasTodayLesson && (
                            <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              오늘 수업
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 레슨 노트 */}
            {selectedStudent && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedStudent.name}의 레슨 노트
                  </h2>
                  <button
                    onClick={saveLessonNote}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    저장
                  </button>
                </div>

                {lessonNote ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        수업 제목
                      </label>
                      <input
                        type="text"
                        value={lessonNote.title}
                        onChange={(e) =>
                          setLessonNote({
                            ...lessonNote,
                            title: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        수업 내용
                      </label>
                      <textarea
                        value={lessonNote.content}
                        onChange={(e) =>
                          setLessonNote({
                            ...lessonNote,
                            content: e.target.value,
                          })
                        }
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        복습 사항
                      </label>
                      <textarea
                        value={lessonNote.review}
                        onChange={(e) =>
                          setLessonNote({
                            ...lessonNote,
                            review: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        숙제
                      </label>
                      <textarea
                        value={lessonNote.homework}
                        onChange={(e) =>
                          setLessonNote({
                            ...lessonNote,
                            homework: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* 음성 녹음 */}
                    <div className="flex items-center gap-4">
                      <button
                        onClick={toggleRecording}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                          isRecording
                            ? "bg-red-600 text-white hover:bg-red-700"
                            : "bg-gray-600 text-white hover:bg-gray-700"
                        }`}
                      >
                        {isRecording ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Mic className="w-4 h-4" />
                        )}
                        {isRecording ? "녹음 중지" : "음성 녹음"}
                      </button>

                      {lessonNote.audioUrl && (
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                          <Play className="w-4 h-4" />
                          재생
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    학생을 선택하면 레슨 노트가 표시됩니다
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 우측: 커리큘럼 및 분석 */}
          <div className="space-y-6">
            {/* 커리큘럼 */}
            {selectedStudent && curriculum && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  커리큘럼
                </h2>

                <div className="space-y-3">
                  {curriculum.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {item.title}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            item.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : item.status === "in_progress"
                                ? "bg-blue-100 text-blue-800"
                                : item.status === "review_needed"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {item.status === "completed"
                            ? "완료"
                            : item.status === "in_progress"
                              ? "진행중"
                              : item.status === "review_needed"
                                ? "복습 필요"
                                : "시작 전"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.category}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>설명 횟수: {item.explanationCount}회</span>
                        {item.lastExplained && (
                          <span>
                            마지막 설명:{" "}
                            {new Date(item.lastExplained).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 학습 분석 */}
            {selectedStudent && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  학습 분석
                </h2>

                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">
                      자주 설명한 항목
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {["기본 문법", "발음 연습", "회화 패턴"].map(
                        (item, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {item}
                          </span>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h3 className="font-semibold text-yellow-900 mb-2">
                      최근 설명하지 않은 항목
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {["고급 문법", "작문 연습"].map((item, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">
                      추천 사항
                    </h3>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• 고급 문법 복습 필요</li>
                      <li>• 작문 연습 강화</li>
                      <li>• 발음 교정 지속</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 세션 타임아웃 알림 */}
        {showSessionTimeout && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md mx-4">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  수업 시간 알림
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                수업이 10분 이상 진행되었습니다. 학생의 집중도를 확인해주세요.
              </p>
              <button
                onClick={() => setShowSessionTimeout(false)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                확인
              </button>
            </div>
          </div>
        )}

        {/* 학생 선택 모달 */}
        {showStudentSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl mx-4 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  학생 선택
                </h3>
                <button
                  onClick={() => setShowStudentSelector(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => {
                      handleStudentSelect(student);
                      setShowStudentSelector(false);
                    }}
                    className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {student.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          레벨 {student.level}
                        </p>
                      </div>
                      {student.hasTodayLesson && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          오늘 수업
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

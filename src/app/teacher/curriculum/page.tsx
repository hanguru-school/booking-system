"use client";

import {
  Play,
  Pause,
  ChevronRight,
  User,
  MessageSquare,
  Edit,
  BookOpen,
  Target,
  Search,
  Clock,
  FileText,
  Calendar,
  CheckCircle,
  Eye,
} from "lucide-react";
import { useState, useEffect } from "react";
interface Student {
  id: string;
  name: string;
  level: string;
  currentLesson: string;
  lastLessonDate: string;
  hasUpcomingClass: boolean;
  nextClassTime?: string;
}

interface CurriculumItem {
  id: string;
  category: string;
  title: string;
  description: string;
  status: "not_started" | "in_progress" | "completed" | "review_needed";
  explanationCount: number;
  lastExplained?: string;
  tags: string[];
  estimatedTime: number;
  isRequired: boolean;
}

interface Level {
  id: string;
  name: string;
  description: string;
  mainGoals: string[];
  requiredSentences: string[];
  requiredWords: string[];
  curriculumItems: CurriculumItem[];
}

export default function TeacherCurriculumPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStudentSelector, setShowStudentSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "not_started" | "in_progress" | "completed" | "review_needed"
  >("all");
  const [isClassInProgress, setIsClassInProgress] = useState(false);
  const [classTimer, setClassTimer] = useState<number>(0);

  useEffect(() => {
    // 실제 API 호출로 대체
    setTimeout(() => {
      const mockStudents: Student[] = [
        {
          id: "1",
          name: "김학생",
          level: "A-2",
          currentLesson: "한글 읽기 기초",
          lastLessonDate: "2024-01-14",
          hasUpcomingClass: true,
          nextClassTime: "14:00",
        },
        {
          id: "2",
          name: "이학생",
          level: "B-1",
          currentLesson: "조사 사용법",
          lastLessonDate: "2024-01-13",
          hasUpcomingClass: false,
        },
        {
          id: "3",
          name: "박학생",
          level: "A-1",
          currentLesson: "숫자 배우기",
          lastLessonDate: "2024-01-15",
          hasUpcomingClass: true,
          nextClassTime: "16:00",
        },
      ];

      const mockLevel: Level = {
        id: "1",
        name: "A-2",
        description: "한글 읽기 기초 단계",
        mainGoals: [
          "한글 자음과 모음 완전히 익히기",
          "기본 단어 읽기 연습",
          "간단한 문장 구성하기",
        ],
        requiredSentences: ["안녕하세요", "감사합니다", "이름이 뭐예요?"],
        requiredWords: ["사람", "학교", "집", "친구", "선생님"],
        curriculumItems: [
          {
            id: "1",
            category: "한글 읽기",
            title: "자음과 모음 복습",
            description: "기본 자음 14개, 모음 10개를 완전히 익히고 발음 연습",
            status: "completed",
            explanationCount: 3,
            lastExplained: "2024-01-10",
            tags: ["발음", "기초"],
            estimatedTime: 15,
            isRequired: true,
          },
          {
            id: "2",
            category: "단어 학습",
            title: "기본 단어 20개",
            description: "일상생활에서 자주 사용하는 기본 단어 학습",
            status: "in_progress",
            explanationCount: 1,
            lastExplained: "2024-01-12",
            tags: ["단어", "일상"],
            estimatedTime: 20,
            isRequired: true,
          },
          {
            id: "3",
            category: "문장 구성",
            title: "간단한 문장 만들기",
            description: "학습한 단어를 활용하여 기본 문장 구성 연습",
            status: "not_started",
            explanationCount: 0,
            tags: ["문법", "구성"],
            estimatedTime: 25,
            isRequired: true,
          },
          {
            id: "4",
            category: "회화 연습",
            title: "인사말과 자기소개",
            description: "기본적인 인사말과 자기소개 문장 연습",
            status: "not_started",
            explanationCount: 0,
            tags: ["회화", "인사"],
            estimatedTime: 30,
            isRequired: false,
          },
        ],
      };

      setStudents(mockStudents);
      setCurrentLevel(mockLevel);
      setLoading(false);
    }, 1000);
  }, []);

  // 수업 타이머
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isClassInProgress) {
      interval = setInterval(() => {
        setClassTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isClassInProgress]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "not_started":
        return "bg-gray-100 text-gray-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "review_needed":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "not_started":
        return "미시작";
      case "in_progress":
        return "진행중";
      case "completed":
        return "완료";
      case "review_needed":
        return "복습 필요";
      default:
        return "알 수 없음";
    }
  };

  const handleItemClick = (item: CurriculumItem) => {
    // 커리큘럼 항목 클릭 시 상세 설명 모달 또는 페이지로 이동
    console.log("커리큘럼 항목 클릭:", item);
  };

  const handleStatusChange = (itemId: string, newStatus: string) => {
    // 상태 변경 로직
    console.log("상태 변경:", itemId, newStatus);
  };

  const filteredItems =
    currentLevel?.curriculumItems.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    }) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            커리큘럼 관리
          </h1>
          <p className="text-lg text-gray-600">
            학생별 커리큘럼을 확인하고 수업을 진행하세요
          </p>
        </div>

        {/* 수업 진행 상태 */}
        <div className="flex items-center gap-4">
          {isClassInProgress && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg">
              <Play className="w-4 h-4" />
              <span className="font-medium">수업 진행중</span>
              <span className="text-sm">{formatTime(classTimer)}</span>
            </div>
          )}

          <button
            onClick={() => setIsClassInProgress(!isClassInProgress)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isClassInProgress
                ? "bg-gray-600 text-white hover:bg-gray-700"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {isClassInProgress ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isClassInProgress ? "수업 종료" : "수업 시작"}
          </button>
        </div>
      </div>

      {/* 학생 선택 */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">학생 선택</h2>
          <button
            onClick={() => setShowStudentSelector(!showStudentSelector)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {selectedStudent ? "학생 변경" : "학생 선택"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {selectedStudent ? (
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedStudent.name}
                </h3>
                <p className="text-sm text-gray-600">
                  레벨: {selectedStudent.level} | 현재 수업:{" "}
                  {selectedStudent.currentLesson}
                </p>
                {selectedStudent.hasUpcomingClass && (
                  <p className="text-sm text-blue-600">
                    다음 수업: {selectedStudent.nextClassTime}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg">
                <MessageSquare className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>수업을 진행할 학생을 선택해주세요</p>
          </div>
        )}
      </div>

      {/* 학생 선택 모달 */}
      {showStudentSelector && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              학생 선택
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {students.map((student) => (
                <button
                  key={student.id}
                  onClick={() => {
                    setSelectedStudent(student);
                    setShowStudentSelector(false);
                  }}
                  className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="text-left">
                    <div className="font-medium text-gray-900">
                      {student.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      레벨: {student.level}
                    </div>
                  </div>
                  {student.hasUpcomingClass && (
                    <div className="text-sm text-blue-600">
                      {student.nextClassTime}
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowStudentSelector(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                취소
              </button>
              <button
                onClick={() => {
                  setSelectedStudent(null);
                  setShowStudentSelector(false);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                학생 없음
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedStudent && currentLevel && (
        <>
          {/* 레벨 정보 */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              레벨 정보: {currentLevel.name}
            </h2>
            <p className="text-gray-600 mb-4">{currentLevel.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">주요 목표</h3>
                <ul className="space-y-1">
                  {currentLevel.mainGoals.map((goal, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <Target className="w-4 h-4 text-blue-600 mt-0.5" />
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">필수 문장</h3>
                <ul className="space-y-1">
                  {currentLevel.requiredSentences.map((sentence, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      • {sentence}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 커리큘럼 항목 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                커리큘럼 항목
              </h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="항목 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value as
                        | "all"
                        | "not_started"
                        | "in_progress"
                        | "completed"
                        | "review_needed",
                    )
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">전체 상태</option>
                  <option value="not_started">미시작</option>
                  <option value="in_progress">진행중</option>
                  <option value="completed">완료</option>
                  <option value="review_needed">복습 필요</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-gray-900">
                          {item.title}
                        </h3>
                        {item.isRequired && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            필수
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                        >
                          {getStatusText(item.status)}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-2">
                        {item.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{item.estimatedTime}분</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          <span>설명 {item.explanationCount}회</span>
                        </div>
                        {item.lastExplained && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>마지막: {item.lastExplained}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-1 mt-2">
                        {item.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(item.id, "completed");
                        }}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(item.id, "in_progress");
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

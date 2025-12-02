"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpenCheck,
  Calendar,
  Clock,
  User,
  AlertCircle,
  Search,
  Upload,
  CheckCircle,
  Eye,
  GraduationCap,
  BookMarked,
  Target,
  BarChart3,
  Award,
} from "lucide-react";
import Link from "next/link";

interface Homework {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: "pending" | "submitted" | "completed" | "overdue";
  courseName: string;
  teacherName: string;
  lessonId: string;
  lessonDate: string;
  type: "text" | "image" | "file" | "audio" | "mixed" | "audio_recording";
  questions: HomeworkQuestion[];
  submittedAt?: string;
  score?: number;
  feedback?: string;
  difficulty: "easy" | "medium" | "hard";
}

interface HomeworkQuestion {
  id: string;
  type: "multiple_choice" | "text" | "file_upload" | "audio_recording";
  question: string;
  options?: string[];
  answer?: string;
  isCorrect?: boolean;
  feedback?: string;
}

interface HomeworkStats {
  totalAssigned: number;
  completed: number;
  pending: number;
  overdue: number;
  averageScore: number;
  weakAreas: string[];
  recentProgress: {
    date: string;
    score: number;
  }[];
}

export default function StudentHomeworkPage() {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [stats, setStats] = useState<HomeworkStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(
    null,
  );
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 필터 상태
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchHomework = async () => {
      try {
        setLoading(true);

        // 실제 API 호출로 대체
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 모의 데이터
        const mockHomework: Homework[] = [
          {
            id: "1",
            title: "조사 연습 문제",
            description:
              '주격 조사 "이/가"와 목적격 조사 "을/를"을 올바르게 사용하는 연습을 해보세요.',
            dueDate: "2024-01-20",
            status: "pending",
            courseName: "기초 한국어",
            teacherName: "김선생님",
            lessonId: "lesson-1",
            lessonDate: "2024-01-15",
            type: "text",
            difficulty: "medium",
            questions: [
              {
                id: "q1",
                type: "multiple_choice",
                question:
                  '다음 중 올바른 조사를 선택하세요: "저는 학생( )입니다."',
                options: ["이", "가", "을", "를"],
                answer: "가",
              },
              {
                id: "q2",
                type: "text",
                question:
                  '다음 문장을 완성하세요: "저는 한국어( ) 공부합니다."',
                answer: "를",
              },
            ],
          },
          {
            id: "2",
            title: "자기소개 문장 만들기",
            description:
              "자기소개 표현을 사용하여 3문장 이상의 자기소개를 작성해보세요.",
            dueDate: "2024-01-18",
            status: "submitted",
            courseName: "실용 한국어",
            teacherName: "박선생님",
            lessonId: "lesson-2",
            lessonDate: "2024-01-10",
            type: "text",
            difficulty: "easy",
            questions: [
              {
                id: "q1",
                type: "text",
                question: "자기소개를 작성해주세요 (3문장 이상)",
                answer:
                  "안녕하세요. 저는 마리아입니다. 저는 스페인에서 왔습니다. 한국어를 배우고 싶어서 이 학교에 다니고 있습니다.",
              },
            ],
            submittedAt: "2024-01-16T10:30:00Z",
            score: 85,
          },
          {
            id: "3",
            title: "발음 연습 - 녹음 제출",
            description: "다음 단어들의 발음을 녹음하여 제출해주세요.",
            dueDate: "2024-01-22",
            status: "overdue",
            courseName: "발음 교정",
            teacherName: "이선생님",
            lessonId: "lesson-3",
            lessonDate: "2024-01-12",
            type: "audio_recording",
            difficulty: "hard",
            questions: [
              {
                id: "q1",
                type: "audio_recording",
                question:
                  "다음 단어들을 발음해주세요: 안녕하세요, 감사합니다, 미안합니다",
              },
            ],
          },
        ];

        setHomework(mockHomework);

        // 통계 데이터
        setStats({
          totalAssigned: 3,
          completed: 1,
          pending: 1,
          overdue: 1,
          averageScore: 85,
          weakAreas: ["발음", "조사 사용"],
          recentProgress: [
            { date: "2024-01-16", score: 85 },
            { date: "2024-01-10", score: 78 },
            { date: "2024-01-05", score: 92 },
          ],
        });
      } catch (error) {
        console.error("숙제 로드 오류:", error);
        setHomework([]);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHomework();
  }, []);

  // 필터링된 숙제 목록
  const getFilteredHomework = () => {
    let filtered = homework;

    // 상태 필터
    if (statusFilter !== "all") {
      filtered = filtered.filter((hw) => hw.status === statusFilter);
    }

    // 검색어 필터
    if (searchTerm) {
      filtered = filtered.filter(
        (hw) =>
          hw.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hw.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hw.courseName.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return filtered.sort((a, b) => {
      // 우선순위: overdue > pending > submitted > completed
      const priority = { overdue: 0, pending: 1, submitted: 2, completed: 3 };
      return priority[a.status] - priority[b.status];
    });
  };

  const handleSubmitHomework = async () => {
    if (!selectedHomework) return;

    try {
      setSubmitting(true);
      // 실제 제출 API 호출
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 상태 업데이트
      setHomework((prev) =>
        prev.map((hw) =>
          hw.id === selectedHomework.id
            ? {
                ...hw,
                status: "submitted",
                submittedAt: new Date().toISOString(),
              }
            : hw,
        ),
      );

      setShowSubmitModal(false);
      setSelectedHomework(null);
    } catch (error) {
      console.error("숙제 제출 오류:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "완료";
      case "submitted":
        return "제출됨";
      case "pending":
        return "미완료";
      case "overdue":
        return "기한 초과";
      default:
        return "알 수 없음";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  const filteredHomework = getFilteredHomework();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            숙제 확인 및 제출
          </h1>
          <p className="text-lg text-gray-600">
            수업별 숙제를 확인하고 제출하세요
          </p>
        </div>

        {/* 통계 요약 */}
        {stats && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              숙제 현황
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpenCheck className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600">총 숙제</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.totalAssigned}개
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">완료</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.completed}개
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm text-gray-600">미완료</span>
                </div>
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.pending}개
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-gray-600">기한 초과</span>
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {stats.overdue}개
                </div>
              </div>
            </div>

            {/* 평균 점수 */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-purple-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    평균 점수
                  </h3>
                  <p className="text-gray-600">{stats.averageScore}점</p>
                </div>
              </div>
            </div>

            {/* 취약 영역 */}
            {stats.weakAreas.length > 0 && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">
                    개선이 필요한 영역
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {stats.weakAreas.map((area, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 필터 및 검색 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* 검색 */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="숙제 제목, 내용 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 필터 */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">전체 상태</option>
              <option value="pending">미완료</option>
              <option value="submitted">제출됨</option>
              <option value="completed">완료</option>
              <option value="overdue">기한 초과</option>
            </select>
          </div>
        </div>

        {/* 숙제 목록 */}
        <div className="space-y-6">
          {filteredHomework.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <BookOpenCheck className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                숙제가 없습니다
              </h2>
              <p className="text-gray-600">
                새로운 숙제가 할당되면 여기에 표시됩니다.
              </p>
            </div>
          ) : (
            filteredHomework.map((hw) => (
              <div key={hw.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {hw.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {hw.teacherName}
                      </span>
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-4 h-4" />
                        {hw.courseName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(hw.lessonDate).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(hw.status)}`}
                      >
                        {getStatusText(hw.status)}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(hw.difficulty)}`}
                      >
                        {hw.difficulty === "easy"
                          ? "쉬움"
                          : hw.difficulty === "medium"
                            ? "보통"
                            : "어려움"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 mb-1">마감일</div>
                    <div
                      className={`text-sm font-medium ${
                        new Date(hw.dueDate) < new Date()
                          ? "text-red-600"
                          : "text-gray-900"
                      }`}
                    >
                      {new Date(hw.dueDate).toLocaleDateString("ko-KR")}
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{hw.description}</p>

                {/* 문제 수 표시 */}
                <div className="mb-4">
                  <span className="text-sm text-gray-600">
                    {hw.questions.length}개 문제
                  </span>
                </div>

                {/* 점수 표시 (제출된 경우) */}
                {hw.score !== undefined && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        점수: {hw.score}점
                      </span>
                    </div>
                    {hw.feedback && (
                      <p className="text-sm text-blue-700 mt-1">
                        {hw.feedback}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        setSelectedHomework(hw);
                        // 상세 페이지로 이동하거나 모달 표시
                      }}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      상세보기
                    </button>
                    {hw.status === "pending" && (
                      <button
                        onClick={() => {
                          setSelectedHomework(hw);
                          setShowSubmitModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        제출하기
                      </button>
                    )}
                  </div>
                  {hw.submittedAt && (
                    <div className="text-sm text-gray-500">
                      제출일:{" "}
                      {new Date(hw.submittedAt).toLocaleDateString("ko-KR")}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* 네비게이션 */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link
            href="/student/mypage"
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <User className="w-5 h-5" />
            마이페이지
          </Link>
          <Link
            href="/student/lesson-notes"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {/* <FileText className="w-5 h-5" /> */}
            레슨노트
          </Link>
          <Link
            href="/student/vocabulary"
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <BookMarked className="w-5 h-5" />
            단어장
          </Link>
        </div>
      </div>

      {/* 제출 모달 */}
      {showSubmitModal && selectedHomework && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              숙제 제출
            </h3>
            <p className="text-gray-600 mb-6">
              "{selectedHomework.title}" 숙제를 제출하시겠습니까?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleSubmitHomework}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? "제출 중..." : "제출"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

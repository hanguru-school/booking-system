"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Search,
  Play,
  Eye,
  FileText,
  BarChart3,
  Award,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mic,
  Headphones,
  PenTool,
  Type,
  Trophy,
} from "lucide-react";
import Link from "next/link";

interface Test {
  id: string;
  title: string;
  description: string;
  category:
    | "vocabulary"
    | "grammar"
    | "writing"
    | "listening"
    | "speaking"
    | "reading";
  difficulty: "easy" | "medium" | "hard";
  duration: number; // 분 단위
  questionCount: number;
  status: "not_started" | "in_progress" | "completed";
  score?: number;
  completedAt?: string;
  estimatedTime: number; // 분 단위
  tags: string[];
}

interface TestResult {
  id: string;
  testId: string;
  testTitle: string;
  score: number;
  maxScore: number;
  completedAt: string;
  category: string;
  difficulty: string;
  timeSpent: number; // 분 단위
  accuracy: number; // 정확도 퍼센트
  weakAreas: string[];
  recommendations: string[];
}

interface TestStats {
  totalTests: number;
  completedTests: number;
  averageScore: number;
  totalStudyTime: number; // 분 단위
  categoryPerformance: {
    vocabulary: number;
    grammar: number;
    writing: number;
    listening: number;
    speaking: number;
    reading: number;
  };
  recentProgress: {
    date: string;
    score: number;
    category: string;
  }[];
}

export default function StudentExamPrepPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [stats, setStats] = useState<TestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [showTestModal, setShowTestModal] = useState(false);

  // 필터 상태
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);

        // 실제 API 호출로 대체
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 모의 데이터
        const mockTests: Test[] = [
          {
            id: "1",
            title: "기초 어휘 테스트",
            description:
              "일상생활에서 자주 사용하는 기본 어휘들을 테스트합니다.",
            category: "vocabulary",
            difficulty: "easy",
            duration: 15,
            questionCount: 20,
            status: "completed",
            score: 85,
            completedAt: "2024-01-20T10:30:00Z",
            estimatedTime: 15,
            tags: ["기초", "어휘", "일상생활"],
          },
          {
            id: "2",
            title: "문법 기초 테스트",
            description: "조사와 기본 문법 규칙을 테스트합니다.",
            category: "grammar",
            difficulty: "medium",
            duration: 20,
            questionCount: 25,
            status: "in_progress",
            estimatedTime: 20,
            tags: ["문법", "조사", "기초"],
          },
          {
            id: "3",
            title: "청해 연습 테스트",
            description: "한국어 발음을 듣고 이해하는 능력을 테스트합니다.",
            category: "listening",
            difficulty: "medium",
            duration: 25,
            questionCount: 15,
            status: "not_started",
            estimatedTime: 25,
            tags: ["청해", "발음", "이해력"],
          },
          {
            id: "4",
            title: "작문 기초 테스트",
            description: "간단한 문장을 작성하는 능력을 테스트합니다.",
            category: "writing",
            difficulty: "hard",
            duration: 30,
            questionCount: 10,
            status: "not_started",
            estimatedTime: 30,
            tags: ["작문", "문장 작성", "표현력"],
          },
          {
            id: "5",
            title: "발음 테스트",
            description: "한국어 발음을 정확하게 하는 능력을 테스트합니다.",
            category: "speaking",
            difficulty: "medium",
            duration: 20,
            questionCount: 12,
            status: "completed",
            score: 78,
            completedAt: "2024-01-18T14:20:00Z",
            estimatedTime: 20,
            tags: ["발음", "말하기", "정확도"],
          },
        ];

        const mockResults: TestResult[] = [
          {
            id: "1",
            testId: "1",
            testTitle: "기초 어휘 테스트",
            score: 85,
            maxScore: 100,
            completedAt: "2024-01-20T10:30:00Z",
            category: "vocabulary",
            difficulty: "easy",
            timeSpent: 12,
            accuracy: 85,
            weakAreas: ["비즈니스 어휘", "고급 표현"],
            recommendations: [
              "일상 어휘는 잘 알고 있습니다. 비즈니스 어휘를 더 학습해보세요.",
            ],
          },
          {
            id: "2",
            testId: "5",
            testTitle: "발음 테스트",
            score: 78,
            maxScore: 100,
            completedAt: "2024-01-18T14:20:00Z",
            category: "speaking",
            difficulty: "medium",
            timeSpent: 18,
            accuracy: 78,
            weakAreas: ["자음 발음", "억양"],
            recommendations: [
              "자음 발음 연습이 필요합니다. 특히 ㅅ, ㅈ, ㅊ 발음을 더 연습해보세요.",
            ],
          },
        ];

        setTests(mockTests);
        setResults(mockResults);

        // 통계 데이터
        setStats({
          totalTests: 5,
          completedTests: 2,
          averageScore: 81.5,
          totalStudyTime: 30,
          categoryPerformance: {
            vocabulary: 85,
            grammar: 0,
            writing: 0,
            listening: 0,
            speaking: 78,
            reading: 0,
          },
          recentProgress: [
            { date: "2024-01-20", score: 85, category: "vocabulary" },
            { date: "2024-01-18", score: 78, category: "speaking" },
          ],
        });
      } catch (error) {
        console.error("테스트 로드 오류:", error);
        setTests([]);
        setResults([]);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  // 필터링된 테스트 목록
  const getFilteredTests = () => {
    let filtered = tests;

    // 카테고리 필터
    if (categoryFilter !== "all") {
      filtered = filtered.filter((test) => test.category === categoryFilter);
    }

    // 난이도 필터
    if (difficultyFilter !== "all") {
      filtered = filtered.filter(
        (test) => test.difficulty === difficultyFilter,
      );
    }

    // 상태 필터
    if (statusFilter !== "all") {
      filtered = filtered.filter((test) => test.status === statusFilter);
    }

    // 검색어 필터
    if (searchTerm) {
      filtered = filtered.filter(
        (test) =>
          test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          test.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          test.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      );
    }

    return filtered.sort((a, b) => {
      // 우선순위: in_progress > not_started > completed
      const priority = { in_progress: 0, not_started: 1, completed: 2 };
      return priority[a.status] - priority[b.status];
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "vocabulary":
        return <BookOpen className="w-5 h-5" />;
      case "grammar":
        return <Type className="w-5 h-5" />;
      case "writing":
        return <PenTool className="w-5 h-5" />;
      case "listening":
        return <Headphones className="w-5 h-5" />;
      case "speaking":
        return <Mic className="w-5 h-5" />;
      case "reading":
        return <FileText className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "vocabulary":
        return "bg-blue-100 text-blue-800";
      case "grammar":
        return "bg-green-100 text-green-800";
      case "writing":
        return "bg-purple-100 text-purple-800";
      case "listening":
        return "bg-orange-100 text-orange-800";
      case "speaking":
        return "bg-red-100 text-red-800";
      case "reading":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case "vocabulary":
        return "어휘";
      case "grammar":
        return "문법";
      case "writing":
        return "작문";
      case "listening":
        return "청해";
      case "speaking":
        return "말하기";
      case "reading":
        return "읽기";
      default:
        return category;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "not_started":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "완료";
      case "in_progress":
        return "진행 중";
      case "not_started":
        return "미시작";
      default:
        return "알 수 없음";
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

  const filteredTests = getFilteredTests();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            자가 진단 테스트
          </h1>
          <p className="text-lg text-gray-600">
            한국어 실력을 자가 진단하고 개선점을 확인하세요
          </p>
        </div>

        {/* 통계 요약 */}
        {stats && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              테스트 현황
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600">총 테스트</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.totalTests}개
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">완료</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.completedTests}개
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-600">평균 점수</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {stats.averageScore}점
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span className="text-sm text-gray-600">총 학습시간</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {stats.totalStudyTime}분
                </div>
              </div>
            </div>

            {/* 영역별 성과 */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                영역별 성과
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {Object.entries(stats.categoryPerformance).map(
                  ([category, score]) => (
                    <div key={category} className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        {getCategoryIcon(category)}
                      </div>
                      <div className="text-lg font-bold text-gray-900 mb-1">
                        {score}점
                      </div>
                      <div className="text-xs text-gray-600">
                        {getCategoryText(category)}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
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
                  placeholder="테스트 제목, 설명 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 필터들 */}
            <div className="flex flex-wrap gap-4">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">전체 영역</option>
                <option value="vocabulary">어휘</option>
                <option value="grammar">문법</option>
                <option value="writing">작문</option>
                <option value="listening">청해</option>
                <option value="speaking">말하기</option>
                <option value="reading">읽기</option>
              </select>

              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">전체 난이도</option>
                <option value="easy">쉬움</option>
                <option value="medium">보통</option>
                <option value="hard">어려움</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">전체 상태</option>
                <option value="not_started">미시작</option>
                <option value="in_progress">진행 중</option>
                <option value="completed">완료</option>
              </select>
            </div>
          </div>
        </div>

        {/* 테스트 목록 */}
        <div className="space-y-6">
          {filteredTests.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                검색 결과가 없습니다
              </h2>
              <p className="text-gray-600">
                다른 검색어나 필터 조건을 시도해보세요.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTests.map((test) => (
                <div
                  key={test.id}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {test.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(test.category)}`}
                        >
                          {getCategoryText(test.category)}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(test.difficulty)}`}
                        >
                          {test.difficulty === "easy"
                            ? "쉬움"
                            : test.difficulty === "medium"
                              ? "보통"
                              : "어려움"}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}
                        >
                          {getStatusText(test.status)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(test.category)}
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4 line-clamp-2">
                    {test.description}
                  </p>

                  {/* 테스트 정보 */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-600">문제 수:</span>
                      <span className="ml-2 font-medium">
                        {test.questionCount}개
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">소요시간:</span>
                      <span className="ml-2 font-medium">
                        {test.duration}분
                      </span>
                    </div>
                  </div>

                  {/* 점수 표시 (완료된 경우) */}
                  {test.score !== undefined && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                          점수: {test.score}점
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 태그 */}
                  {test.tags.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {test.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedTest(test);
                          setShowTestModal(true);
                        }}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        상세보기
                      </button>
                    </div>

                    {/* 테스트 시작/계속 버튼 */}
                    {test.status === "not_started" && (
                      <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Play className="w-4 h-4" />
                        시작하기
                      </button>
                    )}
                    {test.status === "in_progress" && (
                      <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        <Clock className="w-4 h-4" />
                        계속하기
                      </button>
                    )}
                    {test.status === "completed" && (
                      <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                        <Eye className="w-4 h-4" />
                        결과보기
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 최근 결과 */}
        {results.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-600" />
              최근 테스트 결과
            </h2>

            <div className="space-y-4">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">
                      {result.testTitle}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(result.category)}`}
                      >
                        {getCategoryText(result.category)}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(result.difficulty)}`}
                      >
                        {result.difficulty === "easy"
                          ? "쉬움"
                          : result.difficulty === "medium"
                            ? "보통"
                            : "어려움"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <span className="text-sm text-gray-600">점수:</span>
                      <div className="text-lg font-bold text-blue-600">
                        {result.score}/{result.maxScore}점
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">정확도:</span>
                      <div className="text-lg font-bold text-green-600">
                        {result.accuracy}%
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">소요시간:</span>
                      <div className="text-lg font-bold text-orange-600">
                        {result.timeSpent}분
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">완료일:</span>
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(result.completedAt).toLocaleDateString(
                          "ko-KR",
                        )}
                      </div>
                    </div>
                  </div>

                  {result.weakAreas.length > 0 && (
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-700">
                        개선이 필요한 영역:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {result.weakAreas.map((area, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.recommendations.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        추천사항:
                      </span>
                      <div className="mt-1">
                        {result.recommendations.map((rec, index) => (
                          <p key={index} className="text-sm text-gray-600">
                            {rec}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

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
            <FileText className="w-5 h-5" />
            레슨노트
          </Link>
          <Link
            href="/student/vocabulary"
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            단어장
          </Link>
        </div>
      </div>

      {/* 테스트 상세 모달 */}
      {showTestModal && selectedTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold text-gray-900">
                {selectedTest.title}
              </h3>
              <button
                onClick={() => setShowTestModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">설명</h4>
                <p className="text-gray-700">{selectedTest.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    테스트 정보
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">영역:</span>
                      <span className="ml-2">
                        {getCategoryText(selectedTest.category)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">난이도:</span>
                      <span className="ml-2">
                        {selectedTest.difficulty === "easy"
                          ? "쉬움"
                          : selectedTest.difficulty === "medium"
                            ? "보통"
                            : "어려움"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">문제 수:</span>
                      <span className="ml-2">
                        {selectedTest.questionCount}개
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">예상 소요시간:</span>
                      <span className="ml-2">{selectedTest.duration}분</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">태그</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTest.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {selectedTest.score !== undefined && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">
                    테스트 결과
                  </h4>
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedTest.score}점
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    완료일:{" "}
                    {selectedTest.completedAt &&
                      new Date(selectedTest.completedAt).toLocaleDateString(
                        "ko-KR",
                      )}
                  </p>
                </div>
              )}

              <div className="flex gap-4 pt-4 border-t border-gray-200">
                {selectedTest.status === "not_started" && (
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    테스트 시작
                  </button>
                )}
                {selectedTest.status === "in_progress" && (
                  <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    테스트 계속
                  </button>
                )}
                {selectedTest.status === "completed" && (
                  <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    결과 보기
                  </button>
                )}
                <button
                  onClick={() => setShowTestModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Users,
  CheckCircle,
  AlertCircle,
  Search,
  MessageSquare,
  ChevronRight,
  Settings,
  Tag,
  Hash,
  Zap,
  TrendingUp,
  AlertTriangle,
  Square,
  X,
} from "lucide-react";

interface GrammarItem {
  id: string;
  type: "grammar" | "vocabulary" | "expression";
  content: string;
  category: "completed" | "frequent" | "unexplained";
  explanationCount: number;
  lastExplained?: string;
  level: string;
  subLevel: string;
  isRequired: boolean;
  isHighlighted: boolean;
  relatedExamples: string[];
  explanationHistory: {
    date: string;
    lessonId: string;
    teacherNotes: string;
  }[];
  homeworkMistakes: number;
  difficulty: "easy" | "medium" | "hard";
}

interface Student {
  id: string;
  name: string;
  level: string;
  subLevel: string;
  progress: number;
  grammarProgress: number;
  vocabularyProgress: number;
  expressionProgress: number;
}

interface LessonNote {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  content: string;
  extractedItems: GrammarItem[];
  teacherNotes: string;
}

export default function GrammarClassificationPage() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [grammarItems, setGrammarItems] = useState<GrammarItem[]>([]);
  const [lessonNotes, setLessonNotes] = useState<LessonNote[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [activeTab, setActiveTab] = useState<
    "completed" | "frequent" | "unexplained"
  >("unexplained");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<
    "all" | "grammar" | "vocabulary" | "expression"
  >("all");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GrammarItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoExtractMode, setAutoExtractMode] = useState(true);

  // Mock data initialization
  useEffect(() => {
    const initializeData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockStudents: Student[] = [
        {
          id: "STU001",
          name: "김학생",
          level: "A",
          subLevel: "2",
          progress: 75,
          grammarProgress: 70,
          vocabularyProgress: 80,
          expressionProgress: 75,
        },
        {
          id: "STU002",
          name: "이학생",
          level: "B",
          subLevel: "1",
          progress: 60,
          grammarProgress: 65,
          vocabularyProgress: 55,
          expressionProgress: 60,
        },
      ];

      const mockGrammarItems: GrammarItem[] = [
        {
          id: "GRAM001",
          type: "grammar",
          content: "~습니다/~습니다",
          category: "completed",
          explanationCount: 3,
          lastExplained: "2024-01-15",
          level: "A",
          subLevel: "1",
          isRequired: true,
          isHighlighted: false,
          relatedExamples: [
            "안녕하세요. 만나서 반갑습니다.",
            "저는 한국어를 배우고 있습니다.",
            "수업이 재미있습니다.",
          ],
          explanationHistory: [
            {
              date: "2024-01-15",
              lessonId: "LESSON001",
              teacherNotes: "기본 인사말에서 설명 완료",
            },
            {
              date: "2024-01-10",
              lessonId: "LESSON002",
              teacherNotes: "자기소개에서 복습",
            },
          ],
          homeworkMistakes: 1,
          difficulty: "easy",
        },
        {
          id: "VOCAB001",
          type: "vocabulary",
          content: "반갑다",
          category: "frequent",
          explanationCount: 5,
          lastExplained: "2024-01-14",
          level: "A",
          subLevel: "1",
          isRequired: true,
          isHighlighted: true,
          relatedExamples: [
            "만나서 반갑습니다.",
            "정말 반가워요!",
            "반갑게 만나다",
          ],
          explanationHistory: [
            {
              date: "2024-01-14",
              lessonId: "LESSON003",
              teacherNotes: "자주 사용되는 표현으로 강조",
            },
          ],
          homeworkMistakes: 3,
          difficulty: "medium",
        },
        {
          id: "EXPR001",
          type: "expression",
          content: "~아/어서",
          category: "unexplained",
          explanationCount: 0,
          level: "A",
          subLevel: "2",
          isRequired: true,
          isHighlighted: true,
          relatedExamples: [
            "바빠서 늦었어요.",
            "아파서 병원에 갔어요.",
            "재미있어서 계속 보고 싶어요.",
          ],
          explanationHistory: [],
          homeworkMistakes: 0,
          difficulty: "medium",
        },
        {
          id: "GRAM002",
          type: "grammar",
          content: "~고 싶다",
          category: "unexplained",
          explanationCount: 0,
          level: "A",
          subLevel: "2",
          isRequired: true,
          isHighlighted: true,
          relatedExamples: [
            "한국에 가고 싶어요.",
            "한국어를 배우고 싶습니다.",
            "친구를 만나고 싶어요.",
          ],
          explanationHistory: [],
          homeworkMistakes: 0,
          difficulty: "medium",
        },
      ];

      const mockLessonNotes: LessonNote[] = [
        {
          id: "LESSON001",
          studentId: "STU001",
          studentName: "김학생",
          date: "2024-01-15",
          content:
            "안녕하세요. 만나서 반갑습니다. 저는 한국어를 배우고 있습니다.",
          extractedItems: [mockGrammarItems[0], mockGrammarItems[1]],
          teacherNotes: "기본 인사말과 자기소개 문법 설명 완료",
        },
      ];

      setStudents(mockStudents);
      setGrammarItems(mockGrammarItems);
      setLessonNotes(mockLessonNotes);
      setIsLoading(false);
    };

    initializeData();
  }, []);

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
  };

  const handleItemClick = (item: GrammarItem) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleCategoryChange = (
    itemId: string,
    newCategory: "completed" | "frequent" | "unexplained",
  ) => {
    setGrammarItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              category: newCategory,
              explanationCount:
                newCategory === "completed"
                  ? item.explanationCount + 1
                  : item.explanationCount,
            }
          : item,
      ),
    );
  };

  const getFilteredItems = () => {
    let filtered = grammarItems;

    // Tab filtering
    filtered = filtered.filter((item) => item.category === activeTab);

    // Search filtering
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.relatedExamples.some((example) =>
            example.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      );
    }

    // Type filtering
    if (selectedType !== "all") {
      filtered = filtered.filter((item) => item.type === selectedType);
    }

    // Level filtering
    if (selectedLevel) {
      filtered = filtered.filter((item) => item.level === selectedLevel);
    }

    return filtered;
  };

  const getCategoryStats = () => {
    const completed = grammarItems.filter(
      (item) => item.category === "completed",
    ).length;
    const frequent = grammarItems.filter(
      (item) => item.category === "frequent",
    ).length;
    const unexplained = grammarItems.filter(
      (item) => item.category === "unexplained",
    ).length;

    return { completed, frequent, unexplained };
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case "grammar":
        return <Hash className="w-4 h-4" />;
      case "vocabulary":
        return <BookOpen className="w-4 h-4" />;
      case "expression":
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Tag className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "frequent":
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case "unexplained":
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default:
        return <Square className="w-4 h-4" />;
    }
  };

  const stats = getCategoryStats();
  const filteredItems = getFilteredItems();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">문법 분류 시스템을 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                문법/단어/용법 분류 시스템
              </h1>
              <p className="mt-2 text-gray-600">
                자동 추출 및 분류 기반 학습 흐름 관리
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setAutoExtractMode(!autoExtractMode)}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  autoExtractMode
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                <Zap className="w-4 h-4 mr-2" />
                자동 추출 {autoExtractMode ? "ON" : "OFF"}
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Student Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                학생 선택
              </h2>
              <div className="space-y-3">
                {students.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => handleStudentSelect(student)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedStudent?.id === student.id
                        ? "bg-blue-50 border-blue-200 border-2"
                        : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {student.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          레벨 {student.level}-{student.subLevel}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">진행률</div>
                        <div className="text-sm font-medium text-blue-600">
                          {student.progress}%
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>문법</span>
                        <span className="text-green-600">
                          {student.grammarProgress}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>단어</span>
                        <span className="text-blue-600">
                          {student.vocabularyProgress}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>표현</span>
                        <span className="text-purple-600">
                          {student.expressionProgress}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedStudent ? (
              <div className="space-y-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                          설명 완료
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.completed}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center">
                      <TrendingUp className="w-8 h-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                          자주 언급됨
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.frequent}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center">
                      <AlertTriangle className="w-8 h-8 text-orange-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                          미설명
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.unexplained}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex flex-wrap gap-4">
                    {/* Search */}
                    <div className="flex-1 min-w-64">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="문법/단어/표현 검색..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Type Filter */}
                    <select
                      value={selectedType}
                      onChange={(e) =>
                        setSelectedType(
                          e.target.value as
                            | "all"
                            | "grammar"
                            | "vocabulary"
                            | "expression",
                        )
                      }
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">전체</option>
                      <option value="grammar">문법</option>
                      <option value="vocabulary">단어</option>
                      <option value="expression">표현</option>
                    </select>

                    {/* Level Filter */}
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">전체 레벨</option>
                      <option value="A">A 레벨</option>
                      <option value="B">B 레벨</option>
                      <option value="C">C 레벨</option>
                    </select>
                  </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                      <button
                        onClick={() => setActiveTab("unexplained")}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === "unexplained"
                            ? "border-orange-500 text-orange-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        미설명 ({stats.unexplained})
                      </button>
                      <button
                        onClick={() => setActiveTab("frequent")}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === "frequent"
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        자주 언급됨 ({stats.frequent})
                      </button>
                      <button
                        onClick={() => setActiveTab("completed")}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === "completed"
                            ? "border-green-500 text-green-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        설명 완료 ({stats.completed})
                      </button>
                    </nav>
                  </div>

                  {/* Items List */}
                  <div className="p-6">
                    {filteredItems.length === 0 ? (
                      <div className="text-center py-12">
                        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">
                          해당 조건의 항목이 없습니다.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredItems.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleItemClick(item)}
                            className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                              item.isHighlighted
                                ? "bg-yellow-50 border-yellow-200"
                                : "bg-white border-gray-200"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  {getItemIcon(item.type)}
                                  <span className="font-medium text-gray-900">
                                    {item.content}
                                  </span>
                                  {item.isRequired && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      필수
                                    </span>
                                  )}
                                  {item.isHighlighted && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                      주의
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                  <span>
                                    레벨 {item.level}-{item.subLevel}
                                  </span>
                                  <span>난이도: {item.difficulty}</span>
                                  {item.explanationCount > 0 && (
                                    <span className="flex items-center">
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      {item.explanationCount}회 설명
                                    </span>
                                  )}
                                  {item.homeworkMistakes > 0 && (
                                    <span className="flex items-center text-orange-600">
                                      <AlertTriangle className="w-4 h-4 mr-1" />
                                      {item.homeworkMistakes}회 오답
                                    </span>
                                  )}
                                </div>

                                <div className="text-sm text-gray-500">
                                  예문: {item.relatedExamples[0]}
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <select
                                  value={item.category}
                                  onChange={(e) =>
                                    handleCategoryChange(
                                      item.id,
                                      e.target.value as
                                        | "completed"
                                        | "frequent"
                                        | "unexplained",
                                    )
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-xs border border-gray-300 rounded px-2 py-1"
                                >
                                  <option value="unexplained">미설명</option>
                                  <option value="frequent">자주 언급</option>
                                  <option value="completed">완료</option>
                                </select>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  학생을 선택해주세요
                </h3>
                <p className="text-gray-500">
                  왼쪽에서 학생을 선택하면 문법 분류 현황을 확인할 수 있습니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getItemIcon(selectedItem.type)}
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedItem.content}
                  </h2>
                  {getCategoryIcon(selectedItem.category)}
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">레벨</p>
                  <p className="font-medium">
                    {selectedItem.level}-{selectedItem.subLevel}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">난이도</p>
                  <p className="font-medium">{selectedItem.difficulty}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">설명 횟수</p>
                  <p className="font-medium">
                    {selectedItem.explanationCount}회
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">오답 횟수</p>
                  <p className="font-medium">
                    {selectedItem.homeworkMistakes}회
                  </p>
                </div>
              </div>

              {/* Related Examples */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  관련 예문
                </h3>
                <div className="space-y-2">
                  {selectedItem.relatedExamples.map((example, index) => (
                    <div key={index} className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-gray-900">{example}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanation History */}
              {selectedItem.explanationHistory.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    설명 이력
                  </h3>
                  <div className="space-y-3">
                    {selectedItem.explanationHistory.map((history, index) => (
                      <div key={index} className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            {history.date}
                          </span>
                          <span className="text-xs text-gray-500">
                            레슨 {history.lessonId}
                          </span>
                        </div>
                        <p className="text-gray-700">{history.teacherNotes}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  닫기
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
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

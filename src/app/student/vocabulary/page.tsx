"use client";

import React, { useState, useEffect } from "react";
import {
  BookMarked,
  Search,
  Play,
  Volume2,
  Eye,
  FileText,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Clock,
  BookOpen,
  User,
  Calendar,
} from "lucide-react";
import Link from "next/link";

interface Vocabulary {
  id: string;
  word: string;
  meaning: string;
  partOfSpeech: string;
  example: string;
  pronunciation: string;
  dateAdded: string;
  lessonId: string;
  lessonTitle: string;
  reviewStatus: "new" | "learning" | "reviewed" | "mastered";
  reviewCount: number;
  lastReviewed?: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  audioUrl?: string;
}

interface VocabularyStats {
  totalWords: number;
  masteredWords: number;
  learningWords: number;
  newWords: number;
  averageReviewCount: number;
  recentProgress: {
    date: string;
    wordsLearned: number;
  }[];
  partOfSpeechDistribution: {
    noun: number;
    verb: number;
    adjective: number;
    adverb: number;
    other: number;
  };
}

export default function StudentVocabularyPage() {
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [stats, setStats] = useState<VocabularyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWord, setSelectedWord] = useState<Vocabulary | null>(null);
  const [showWordModal, setShowWordModal] = useState(false);

  // 필터 상태
  const [partOfSpeechFilter, setPartOfSpeechFilter] = useState("all");
  const [reviewStatusFilter, setReviewStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchVocabulary = async () => {
      try {
        setLoading(true);

        // 실제 API 호출로 대체
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 모의 데이터
        const mockVocabulary: Vocabulary[] = [
          {
            id: "1",
            word: "안녕하세요",
            meaning: "Hello (formal)",
            partOfSpeech: "인사말",
            example: "안녕하세요, 저는 마리아입니다.",
            pronunciation: "annyeonghaseyo",
            dateAdded: "2024-01-15",
            lessonId: "lesson-1",
            lessonTitle: "기초 인사말",
            reviewStatus: "mastered",
            reviewCount: 5,
            lastReviewed: "2024-01-20",
            difficulty: "easy",
            tags: ["인사", "기초"],
            audioUrl: "/audio/annyeonghaseyo.mp3",
          },
          {
            id: "2",
            word: "감사합니다",
            meaning: "Thank you (formal)",
            partOfSpeech: "인사말",
            example: "도와주셔서 감사합니다.",
            pronunciation: "gamsahamnida",
            dateAdded: "2024-01-15",
            lessonId: "lesson-1",
            lessonTitle: "기초 인사말",
            reviewStatus: "reviewed",
            reviewCount: 3,
            lastReviewed: "2024-01-18",
            difficulty: "easy",
            tags: ["인사", "기초"],
            audioUrl: "/audio/gamsahamnida.mp3",
          },
          {
            id: "3",
            word: "학생",
            meaning: "Student",
            partOfSpeech: "명사",
            example: "저는 한국어 학생입니다.",
            pronunciation: "haksaeng",
            dateAdded: "2024-01-10",
            lessonId: "lesson-2",
            lessonTitle: "자기소개",
            reviewStatus: "learning",
            reviewCount: 2,
            lastReviewed: "2024-01-16",
            difficulty: "medium",
            tags: ["직업", "자기소개"],
          },
          {
            id: "4",
            word: "공부하다",
            meaning: "To study",
            partOfSpeech: "동사",
            example: "한국어를 공부하고 있습니다.",
            pronunciation: "gongbuhada",
            dateAdded: "2024-01-12",
            lessonId: "lesson-3",
            lessonTitle: "일상 활동",
            reviewStatus: "new",
            reviewCount: 0,
            difficulty: "medium",
            tags: ["학습", "활동"],
          },
          {
            id: "5",
            word: "좋다",
            meaning: "Good",
            partOfSpeech: "형용사",
            example: "한국어가 좋습니다.",
            pronunciation: "jota",
            dateAdded: "2024-01-14",
            lessonId: "lesson-4",
            lessonTitle: "감정 표현",
            reviewStatus: "learning",
            reviewCount: 1,
            lastReviewed: "2024-01-17",
            difficulty: "easy",
            tags: ["감정", "기초"],
          },
        ];

        setVocabulary(mockVocabulary);

        // 통계 데이터
        setStats({
          totalWords: 5,
          masteredWords: 1,
          learningWords: 2,
          newWords: 1,
          averageReviewCount: 2.2,
          recentProgress: [
            { date: "2024-01-20", wordsLearned: 2 },
            { date: "2024-01-18", wordsLearned: 1 },
            { date: "2024-01-16", wordsLearned: 1 },
          ],
          partOfSpeechDistribution: {
            noun: 1,
            verb: 1,
            adjective: 1,
            adverb: 0,
            other: 2,
          },
        });
      } catch (error) {
        console.error("단어장 로드 오류:", error);
        setVocabulary([]);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchVocabulary();
  }, []);

  // 필터링된 단어 목록
  const getFilteredVocabulary = () => {
    let filtered = vocabulary;

    // 품사 필터
    if (partOfSpeechFilter !== "all") {
      filtered = filtered.filter(
        (vocab) => vocab.partOfSpeech === partOfSpeechFilter,
      );
    }

    // 복습 상태 필터
    if (reviewStatusFilter !== "all") {
      filtered = filtered.filter(
        (vocab) => vocab.reviewStatus === reviewStatusFilter,
      );
    }

    // 검색어 필터
    if (searchTerm) {
      filtered = filtered.filter(
        (vocab) =>
          vocab.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vocab.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vocab.example.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // 정렬
    switch (sortBy) {
      case "recent":
        return filtered.sort(
          (a, b) =>
            new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(),
        );
      case "frequency":
        return filtered.sort((a, b) => b.reviewCount - a.reviewCount);
      case "difficulty":
        const difficultyOrder = { easy: 0, medium: 1, hard: 2 };
        return filtered.sort(
          (a, b) =>
            difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty],
        );
      case "alphabetical":
        return filtered.sort((a, b) => a.word.localeCompare(b.word));
      default:
        return filtered;
    }
  };

  const handleReviewStatusChange = async (
    wordId: string,
    newStatus: string,
  ) => {
    try {
      // 실제 API 호출로 대체
      await new Promise((resolve) => setTimeout(resolve, 500));

      setVocabulary((prev) =>
        prev.map((word) =>
          word.id === wordId
            ? {
                ...word,
                reviewStatus: newStatus as any,
                reviewCount: word.reviewCount + 1,
                lastReviewed: new Date().toISOString(),
              }
            : word,
        ),
      );
    } catch (error) {
      console.error("복습 상태 변경 오류:", error);
    }
  };

  const getReviewStatusColor = (status: string) => {
    switch (status) {
      case "mastered":
        return "bg-green-100 text-green-800";
      case "reviewed":
        return "bg-blue-100 text-blue-800";
      case "learning":
        return "bg-yellow-100 text-yellow-800";
      case "new":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getReviewStatusText = (status: string) => {
    switch (status) {
      case "mastered":
        return "외웠어요";
      case "reviewed":
        return "복습 완료";
      case "learning":
        return "학습 중";
      case "new":
        return "새로운 단어";
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

  const filteredVocabulary = getFilteredVocabulary();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">복습 단어장</h1>
          <p className="text-lg text-gray-600">
            학습한 단어들을 정리하고 복습하세요
          </p>
        </div>

        {/* 통계 요약 */}
        {stats && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              단어장 현황
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookMarked className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600">총 단어</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.totalWords}개
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">외운 단어</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.masteredWords}개
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm text-gray-600">학습 중</span>
                </div>
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.learningWords}개
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-600">새로운 단어</span>
                </div>
                <div className="text-2xl font-bold text-gray-600">
                  {stats.newWords}개
                </div>
              </div>
            </div>

            {/* 품사별 분포 */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                품사별 분포
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {stats.partOfSpeechDistribution.noun}
                  </div>
                  <div className="text-sm text-gray-600">명사</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {stats.partOfSpeechDistribution.verb}
                  </div>
                  <div className="text-sm text-gray-600">동사</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600 mb-1">
                    {stats.partOfSpeechDistribution.adjective}
                  </div>
                  <div className="text-sm text-gray-600">형용사</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {stats.partOfSpeechDistribution.adverb}
                  </div>
                  <div className="text-sm text-gray-600">부사</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600 mb-1">
                    {stats.partOfSpeechDistribution.other}
                  </div>
                  <div className="text-sm text-gray-600">기타</div>
                </div>
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
                  placeholder="단어, 뜻, 예문 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 필터들 */}
            <div className="flex flex-wrap gap-4">
              <select
                value={partOfSpeechFilter}
                onChange={(e) => setPartOfSpeechFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">전체 품사</option>
                <option value="명사">명사</option>
                <option value="동사">동사</option>
                <option value="형용사">형용사</option>
                <option value="부사">부사</option>
                <option value="인사말">인사말</option>
              </select>

              <select
                value={reviewStatusFilter}
                onChange={(e) => setReviewStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">전체 상태</option>
                <option value="new">새로운 단어</option>
                <option value="learning">학습 중</option>
                <option value="reviewed">복습 완료</option>
                <option value="mastered">외운 단어</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="recent">최신순</option>
                <option value="frequency">복습 빈도순</option>
                <option value="difficulty">난이도순</option>
                <option value="alphabetical">가나다순</option>
              </select>
            </div>
          </div>
        </div>

        {/* 단어 목록 */}
        <div className="space-y-6">
          {filteredVocabulary.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <BookMarked className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                검색 결과가 없습니다
              </h2>
              <p className="text-gray-600">
                다른 검색어나 필터 조건을 시도해보세요.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVocabulary.map((word) => (
                <div
                  key={word.id}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {word.word}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(word.difficulty)}`}
                        >
                          {word.difficulty === "easy"
                            ? "쉬움"
                            : word.difficulty === "medium"
                              ? "보통"
                              : "어려움"}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {word.partOfSpeech}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {word.audioUrl && (
                        <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                          <Volume2 className="w-4 h-4" />
                          <span className="text-xs">발음</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-700 font-medium mb-2">
                      {word.meaning}
                    </p>
                    <p className="text-sm text-gray-600 italic">
                      "{word.example}"
                    </p>
                  </div>

                  {/* 복습 상태 */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getReviewStatusColor(word.reviewStatus)}`}
                      >
                        {getReviewStatusText(word.reviewStatus)}
                      </span>
                      <span className="text-xs text-gray-500">
                        복습 {word.reviewCount}회
                      </span>
                    </div>
                    {word.lastReviewed && (
                      <p className="text-xs text-gray-500">
                        마지막 복습:{" "}
                        {new Date(word.lastReviewed).toLocaleDateString(
                          "ko-KR",
                        )}
                      </p>
                    )}
                  </div>

                  {/* 태그 */}
                  {word.tags.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {word.tags.map((tag, index) => (
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

                  {/* 출처 */}
                  <div className="mb-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {word.lessonTitle}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(word.dateAdded).toLocaleDateString("ko-KR")}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedWord(word);
                          setShowWordModal(true);
                        }}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        상세보기
                      </button>
                      {word.audioUrl && (
                        <button className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm">
                          <Play className="w-4 h-4" />
                          예문 듣기
                        </button>
                      )}
                    </div>

                    {/* 복습 상태 변경 버튼 */}
                    <div className="flex items-center gap-1">
                      {word.reviewStatus !== "mastered" && (
                        <button
                          onClick={() =>
                            handleReviewStatusChange(word.id, "mastered")
                          }
                          className="p-1 text-green-600 hover:text-green-700"
                          title="외웠어요"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {word.reviewStatus !== "reviewed" && (
                        <button
                          onClick={() =>
                            handleReviewStatusChange(word.id, "reviewed")
                          }
                          className="p-1 text-blue-600 hover:text-blue-700"
                          title="복습 완료"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      {word.reviewStatus !== "learning" && (
                        <button
                          onClick={() =>
                            handleReviewStatusChange(word.id, "learning")
                          }
                          className="p-1 text-yellow-600 hover:text-yellow-700"
                          title="학습 중"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
            <FileText className="w-5 h-5" />
            레슨노트
          </Link>
          <Link
            href="/student/homework"
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <BookMarked className="w-5 h-5" />
            숙제
          </Link>
        </div>
      </div>

      {/* 단어 상세 모달 */}
      {showWordModal && selectedWord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold text-gray-900">
                {selectedWord.word}
              </h3>
              <button
                onClick={() => setShowWordModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">뜻</h4>
                <p className="text-gray-700">{selectedWord.meaning}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">예문</h4>
                <p className="text-gray-700 italic">"{selectedWord.example}"</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">발음</h4>
                <p className="text-gray-700">{selectedWord.pronunciation}</p>
                {selectedWord.audioUrl && (
                  <button className="flex items-center gap-2 mt-2 text-blue-600 hover:text-blue-700">
                    <Play className="w-4 h-4" />
                    발음 듣기
                  </button>
                )}
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">학습 정보</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">품사:</span>
                    <span className="ml-2">{selectedWord.partOfSpeech}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">난이도:</span>
                    <span className="ml-2">
                      {selectedWord.difficulty === "easy"
                        ? "쉬움"
                        : selectedWord.difficulty === "medium"
                          ? "보통"
                          : "어려움"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">복습 횟수:</span>
                    <span className="ml-2">{selectedWord.reviewCount}회</span>
                  </div>
                  <div>
                    <span className="text-gray-600">출처:</span>
                    <span className="ml-2">{selectedWord.lessonTitle}</span>
                  </div>
                </div>
              </div>

              {selectedWord.tags.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">태그</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedWord.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

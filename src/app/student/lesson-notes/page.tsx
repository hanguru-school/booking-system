"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Calendar,
  Clock,
  User,
  FileText,
  Search,
  Play,
  Volume2,
  Eye,
  GraduationCap,
  BookMarked,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

interface LessonNote {
  id: string;
  title: string;
  content: string;
  date: string;
  teacherName: string;
  duration: number;
  status: "completed" | "scheduled" | "cancelled";
  courseName: string;
  level: "beginner" | "intermediate" | "advanced";
  type: "online" | "offline";
  words: string[];
  hasAudio: boolean;
  hasMaterials: boolean;
  summary: string;
}

export default function StudentLessonNotesPage() {
  const [notes, setNotes] = useState<LessonNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasCompletedClasses, setHasCompletedClasses] = useState(false);

  // 필터 상태
  const [periodFilter, setPeriodFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchLessonNotes = async () => {
      try {
        setLoading(true);

        // 실제 API 호출로 대체
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 모의 데이터
        const mockNotes: LessonNote[] = [
          {
            id: "1",
            title: "기초 문법 - 조사 학습",
            content:
              '오늘은 한국어 조사에 대해 배웠습니다. 주격 조사 "이/가", 목적격 조사 "을/를"을 중심으로 학습했습니다.',
            date: "2024-01-15",
            teacherName: "김선생님",
            duration: 60,
            status: "completed",
            courseName: "기초 한국어",
            level: "beginner",
            type: "online",
            words: ["이/가", "을/를", "조사", "주격", "목적격"],
            hasAudio: true,
            hasMaterials: true,
            summary:
              "조사 사용법을 잘 이해하고 있으며, 실습에서도 적극적으로 참여했습니다.",
          },
          {
            id: "2",
            title: "일상 회화 - 자기소개",
            content:
              '자기소개 표현을 배우고 실제로 연습해보았습니다. "안녕하세요, 저는 ~입니다" 패턴을 익혔습니다.',
            date: "2024-01-10",
            teacherName: "박선생님",
            duration: 60,
            status: "completed",
            courseName: "실용 한국어",
            level: "beginner",
            type: "offline",
            words: ["안녕하세요", "저는", "입니다", "만나서", "반갑습니다"],
            hasAudio: false,
            hasMaterials: true,
            summary:
              "자기소개 표현을 자연스럽게 구사하고 있으며, 발음도 정확합니다.",
          },
        ];

        setNotes(mockNotes);
        setHasCompletedClasses(mockNotes.length > 0);
      } catch (error) {
        console.error("레슨 노트 로드 오류:", error);
        setNotes([]);
        setHasCompletedClasses(false);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonNotes();
  }, []);

  // 필터링된 노트 목록
  const getFilteredNotes = () => {
    let filtered = notes;

    // 기간 필터
    if (periodFilter !== "all") {
      const now = new Date();
      const cutoffDate = new Date();

      switch (periodFilter) {
        case "7days":
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case "30days":
          cutoffDate.setDate(now.getDate() - 30);
          break;
        case "3months":
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
      }

      filtered = filtered.filter((note) => new Date(note.date) >= cutoffDate);
    }

    // 레벨 필터
    if (levelFilter !== "all") {
      filtered = filtered.filter((note) => note.level === levelFilter);
    }

    // 수업 유형 필터
    if (typeFilter !== "all") {
      filtered = filtered.filter((note) => note.type === typeFilter);
    }

    // 검색어 필터
    if (searchTerm) {
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.words.some((word) =>
            word.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      );
    }

    return filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
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

  if (!hasCompletedClasses) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">레슨 노트</h1>
            <p className="text-lg text-gray-600">
              수업 내용과 학습 노트를 확인하세요
            </p>
          </div>

          {/* 빈 상태 */}
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              아직 수업을 하지 않았습니다
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              첫 번째 수업을 완료하면 여기에 레슨 노트가 표시됩니다. 수업 내용과
              학습 포인트를 다시 확인할 수 있어요.
            </p>

            <div className="space-y-4">
              <Link
                href="/student/reservations/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Calendar className="w-5 h-5" />첫 수업 예약하기
              </Link>

              <div className="text-sm text-gray-500">
                또는{" "}
                <Link
                  href="/student/reservations"
                  className="text-blue-600 hover:underline"
                >
                  예약 관리
                </Link>
                에서 기존 예약을 확인하세요
              </div>
            </div>
          </div>

          {/* 레슨 노트 기능 설명 */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                수업 내용
              </h3>
              <p className="text-gray-600 text-sm">
                선생님이 작성한 수업 내용과 학습 포인트를 확인할 수 있습니다.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                개인 피드백
              </h3>
              <p className="text-gray-600 text-sm">
                선생님이 개인적으로 작성한 피드백과 개선점을 확인하세요.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                학습 기록
              </h3>
              <p className="text-gray-600 text-sm">
                언제든지 과거 수업 내용을 다시 확인하여 복습할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredNotes = getFilteredNotes();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">레슨 노트</h1>
          <p className="text-lg text-gray-600">
            수업 내용과 학습 노트를 확인하세요
          </p>
        </div>

        {/* 필터 및 검색 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* 검색 */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="노트 제목, 내용, 단어 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 필터들 */}
            <div className="flex flex-wrap gap-4">
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">전체 기간</option>
                <option value="7days">최근 7일</option>
                <option value="30days">최근 30일</option>
                <option value="3months">최근 3개월</option>
              </select>

              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">전체 레벨</option>
                <option value="beginner">초급</option>
                <option value="intermediate">중급</option>
                <option value="advanced">고급</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">전체 유형</option>
                <option value="online">온라인</option>
                <option value="offline">대면</option>
              </select>
            </div>
          </div>
        </div>

        {/* 레슨 노트 목록 */}
        <div className="space-y-6">
          {filteredNotes.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                검색 결과가 없습니다
              </h2>
              <p className="text-gray-600">
                다른 검색어나 필터 조건을 시도해보세요.
              </p>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div key={note.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {note.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {note.teacherName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(note.date).toLocaleDateString("ko-KR")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {note.duration}분
                      </span>
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-4 h-4" />
                        {note.courseName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          note.level === "beginner"
                            ? "bg-blue-100 text-blue-800"
                            : note.level === "intermediate"
                              ? "bg-green-100 text-green-800"
                              : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {note.level === "beginner"
                          ? "초급"
                          : note.level === "intermediate"
                            ? "중급"
                            : "고급"}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          note.type === "online"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-indigo-100 text-indigo-800"
                        }`}
                      >
                        {note.type === "online" ? "온라인" : "대면"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {note.hasAudio && (
                      <div className="flex items-center gap-1 text-blue-600">
                        <Volume2 className="w-4 h-4" />
                        <span className="text-xs">음성</span>
                      </div>
                    )}
                    {note.hasMaterials && (
                      <div className="flex items-center gap-1 text-green-600">
                        <BookMarked className="w-4 h-4" />
                        <span className="text-xs">자료</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 학습 경향 분석 메모 */}
                {note.summary && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        학습 경향 분석
                      </span>
                    </div>
                    <p className="text-sm text-blue-700">{note.summary}</p>
                  </div>
                )}

                <div className="prose max-w-none mb-4">
                  <p className="text-gray-700 leading-relaxed line-clamp-3">
                    {note.content}
                  </p>
                </div>

                {/* 학습한 단어들 */}
                {note.words.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      학습한 단어
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {note.words.map((word, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/student/lesson-notes/${note.id}`}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      상세보기
                    </Link>
                    {note.hasAudio && (
                      <button className="flex items-center gap-2 text-green-600 hover:text-green-700 text-sm">
                        <Play className="w-4 h-4" />
                        음성 재생
                      </button>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(note.date).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
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
            href="/student/vocabulary"
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <BookMarked className="w-5 h-5" />
            단어장
          </Link>
          <Link
            href="/student/homework"
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FileText className="w-5 h-5" />
            숙제
          </Link>
        </div>
      </div>
    </div>
  );
}

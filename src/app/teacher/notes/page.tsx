"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  FileText,
  Calendar,
  Clock,
  User,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface LessonNote {
  id: string;
  studentName: string;
  subject: string;
  date: string;
  time: string;
  content: string;
  evaluation: {
    participation: number;
    understanding: number;
    pronunciation: number;
    grammar: number;
    vocabulary: number;
    comments: string;
  };
  status: "draft" | "completed";
  createdAt: string;
}

export default function TeacherNotesPage() {
  const [notes, setNotes] = useState<LessonNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "draft" | "completed"
  >("all");

  useEffect(() => {
    // 실제 API 호출로 대체
    setTimeout(() => {
      setNotes([
        {
          id: "1",
          studentName: "김학생",
          subject: "문법",
          date: "2024-01-15",
          time: "14:00-15:00",
          content: "기본 문법 구조 학습 완료. 학생이 이해도가 높아짐.",
          evaluation: {
            participation: 4,
            understanding: 4,
            pronunciation: 3,
            grammar: 4,
            vocabulary: 3,
            comments:
              "전반적으로 좋은 수업이었습니다. 발음 부분에서 더 연습이 필요합니다.",
          },
          status: "completed",
          createdAt: "2024-01-15T14:00:00Z",
        },
        {
          id: "2",
          studentName: "이학생",
          subject: "회화",
          date: "2024-01-14",
          time: "16:00-17:00",
          content: "일상 대화 연습 및 발음 교정. 학생의 자신감이 향상됨.",
          evaluation: {
            participation: 5,
            understanding: 4,
            pronunciation: 4,
            grammar: 3,
            vocabulary: 4,
            comments:
              "매우 적극적인 참여를 보여주었습니다. 문법 부분에서 약간의 보완이 필요합니다.",
          },
          status: "completed",
          createdAt: "2024-01-14T16:00:00Z",
        },
        {
          id: "3",
          studentName: "박학생",
          subject: "독해",
          date: "2024-01-13",
          time: "15:00-16:00",
          content: "중급 독해 지문 분석 및 이해. 학생이 어려워하는 부분 발견.",
          evaluation: {
            participation: 3,
            understanding: 3,
            pronunciation: 4,
            grammar: 3,
            vocabulary: 2,
            comments:
              "독해 부분에서 어려움을 겪고 있습니다. 어휘력 향상이 필요합니다.",
          },
          status: "draft",
          createdAt: "2024-01-13T15:00:00Z",
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || note.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleDeleteNote = (noteId: string) => {
    if (confirm("정말로 이 수업 노트를 삭제하시겠습니까?")) {
      setNotes(notes.filter((note) => note.id !== noteId));
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-12 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/teacher/home"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>선생님 홈으로 돌아가기</span>
          </Link>
        </div>
        <Link
          href="/teacher/lesson-editor"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />새 수업 노트 작성
        </Link>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="학생명 또는 과목으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as "all" | "draft" | "completed")
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">전체</option>
              <option value="draft">임시저장</option>
              <option value="completed">완료</option>
            </select>
          </div>
        </div>
      </div>

      {/* 수업 노트 목록 */}
      <div className="space-y-4">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              수업 노트가 없습니다
            </h3>
            <p className="text-gray-600 mb-4">
              새로운 수업 노트를 작성해보세요
            </p>
            <Link
              href="/teacher/lesson-editor"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              수업 노트 작성하기
            </Link>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div key={note.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {note.studentName}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {note.subject}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {note.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {note.time}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {note.status === "completed" && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      완료
                    </span>
                  )}
                  {note.status === "draft" && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      임시저장
                    </span>
                  )}
                  <Link
                    href={`/teacher/lesson-editor?id=${note.id}`}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="편집"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">수업 내용</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {note.content}
                </p>
              </div>

              {note.status === "completed" && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">평가</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                    <div className="text-center">
                      <div className="text-sm text-gray-600">참여도</div>
                      <div className="text-lg font-semibold text-blue-600">
                        {note.evaluation.participation}/5
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">이해도</div>
                      <div className="text-lg font-semibold text-green-600">
                        {note.evaluation.understanding}/5
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">발음</div>
                      <div className="text-lg font-semibold text-purple-600">
                        {note.evaluation.pronunciation}/5
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">문법</div>
                      <div className="text-lg font-semibold text-orange-600">
                        {note.evaluation.grammar}/5
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">어휘</div>
                      <div className="text-lg font-semibold text-red-600">
                        {note.evaluation.vocabulary}/5
                      </div>
                    </div>
                  </div>
                  {note.evaluation.comments && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-sm font-medium text-blue-900 mb-1">
                        코멘트
                      </div>
                      <div className="text-sm text-blue-800">
                        {note.evaluation.comments}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 통계 */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {notes.length}
          </div>
          <div className="text-sm text-gray-600">총 수업 노트</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {notes.filter((note) => note.status === "completed").length}
          </div>
          <div className="text-sm text-gray-600">완료된 노트</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {notes.filter((note) => note.status === "draft").length}
          </div>
          <div className="text-sm text-gray-600">임시저장 노트</div>
        </div>
      </div>
    </div>
  );
}

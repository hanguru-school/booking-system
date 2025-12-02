"use client";

import { useState, useEffect } from "react";
import { Search, Play, Calendar, Clock, User, BookOpen } from "lucide-react";
import Link from "next/link";

interface LessonNote {
  id: string;
  title: string;
  teacherName: string;
  date: string;
  duration: string;
  description: string;
  audioUrl?: string;
  score?: number;
}

export default function LessonNotesPage() {
  const [notes, setNotes] = useState<LessonNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    // 실제 레슨 노트 데이터를 가져오는 로직
    const fetchNotes = async () => {
      try {
        setLoading(true);

        // 실제 API 호출
        const response = await fetch("/api/lesson-notes/student");
        if (!response.ok) {
          throw new Error("Failed to fetch lesson notes");
        }
        const data = await response.json();
        setNotes(data.notes || []);
      } catch (error) {
        console.error("레슨 노트 로드 오류:", error);
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterType === "all" ||
      (filterType === "recent" &&
        new Date(note.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (filterType === "completed" && note.score !== undefined);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">레슨 노트</h1>
          <p className="text-gray-600">수업 내용과 학습 자료를 확인하세요</p>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="노트 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">전체</option>
              <option value="recent">최근 7일</option>
              <option value="completed">완료된 수업</option>
            </select>
          </div>
        </div>

        {/* 레슨 노트 목록 */}
        {notes.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              아직 레슨 노트가 없습니다
            </h3>
            <p className="text-gray-600 mb-6">
              첫 번째 수업을 예약하고 레슨 노트를 받아보세요
            </p>
            <Link
              href="/student/reservations/new"
              className="inline-flex items-center px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Calendar className="w-5 h-5 mr-2" />
              수업 예약하기
            </Link>
          </div>
        )}
        {filteredNotes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              레슨 노트가 없습니다
            </h3>
            <p className="text-gray-600">
              {searchTerm || filterType !== "all"
                ? "검색 조건에 맞는 레슨 노트가 없습니다."
                : "아직 수업을 받지 않았습니다. 첫 번째 수업을 예약해보세요!"}
            </p>
            {!searchTerm && filterType === "all" && (
              <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                수업 예약하기
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredNotes.map((note) => (
              <div key={note.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {note.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{note.teacherName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{note.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{note.duration}</span>
                      </div>
                    </div>
                  </div>
                  {note.score && (
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {note.score}점
                    </div>
                  )}
                </div>

                <p className="text-gray-700 mb-4">{note.description}</p>

                <div className="flex items-center gap-4">
                  {note.audioUrl && (
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                      <Play className="w-4 h-4" />
                      음성
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

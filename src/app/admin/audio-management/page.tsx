"use client";

import React, { useState, useEffect } from "react";
import {
  Upload,
  Play,
  Pause,
  Move,
  FileAudio,
  Search,
  Eye,
  Download,
} from "lucide-react";

interface AudioFile {
  id: string;
  url: string;
  title: string;
  duration: number;
  uploadedBy: string;
  uploadedAt: string;
  lessonNoteId?: string;
  position?: number;
  fileSize: number;
}

interface LessonNote {
  id: string;
  title: string;
  studentName: string;
  date: string;
}

export default function AdminAudioManagementPage() {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [lessonNotes, setLessonNotes] = useState<LessonNote[]>([]);
  const [selectedAudio, setSelectedAudio] = useState<AudioFile | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "attached" | "unattached"
  >("all");

  // 더미 데이터 로드
  useEffect(() => {
    const mockAudioFiles: AudioFile[] = [
      {
        id: "1",
        url: "/audio/lesson1-intro.mp3",
        title: "인사말 연습",
        duration: 120,
        uploadedBy: "관리자",
        uploadedAt: "2024-01-15T10:00:00Z",
        lessonNoteId: "note1",
        position: 1,
        fileSize: 2048576, // 2MB
      },
      {
        id: "2",
        url: "/audio/lesson1-selfintro.mp3",
        title: "자기소개 연습",
        duration: 180,
        uploadedBy: "관리자",
        uploadedAt: "2024-01-15T10:05:00Z",
        lessonNoteId: "note1",
        position: 2,
        fileSize: 3072000, // 3MB
      },
      {
        id: "3",
        url: "/audio/lesson2-numbers.mp3",
        title: "숫자 발음 연습",
        duration: 90,
        uploadedBy: "관리자",
        uploadedAt: "2024-01-14T14:30:00Z",
        lessonNoteId: "note2",
        position: 1,
        fileSize: 1536000, // 1.5MB
      },
      {
        id: "4",
        url: "/audio/unattached-audio.mp3",
        title: "미첨부 음성 파일",
        duration: 150,
        uploadedBy: "관리자",
        uploadedAt: "2024-01-13T09:00:00Z",
        fileSize: 2560000, // 2.5MB
      },
    ];

    const mockLessonNotes: LessonNote[] = [
      {
        id: "note1",
        title: "기본 인사말과 자기소개",
        studentName: "김학생",
        date: "2024-01-15",
      },
      {
        id: "note2",
        title: "숫자와 시간 표현",
        studentName: "이학생",
        date: "2024-01-14",
      },
      {
        id: "note3",
        title: "음식 주문하기",
        studentName: "박학생",
        date: "2024-01-13",
      },
    ];

    setAudioFiles(mockAudioFiles);
    setLessonNotes(mockLessonNotes);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(1)}MB`;
  };

  const handlePlayAudio = (audio: AudioFile) => {
    setSelectedAudio(audio);
    setIsPlaying(true);
  };

  const handleUploadAudio = (file: File) => {
    // 실제 업로드 로직
    const newAudio: AudioFile = {
      id: Date.now().toString(),
      url: URL.createObjectURL(file),
      title: file.name.replace(".mp3", ""),
      duration: 0, // 실제로는 파일에서 추출
      uploadedBy: "관리자",
      uploadedAt: new Date().toISOString(),
      fileSize: file.size,
    };

    setAudioFiles([newAudio, ...audioFiles]);
    setShowUploadModal(false);
  };

  const handleMoveAudio = (
    audioId: string,
    targetNoteId: string,
    position: number,
  ) => {
    setAudioFiles(
      audioFiles.map((audio) =>
        audio.id === audioId
          ? { ...audio, lessonNoteId: targetNoteId, position }
          : audio,
      ),
    );
    setShowMoveModal(false);
  };

  const filteredAudioFiles = audioFiles.filter((audio) => {
    const matchesSearch = audio.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === "all" ||
      (filterType === "attached" && audio.lessonNoteId) ||
      (filterType === "unattached" && !audio.lessonNoteId);

    return matchesSearch && matchesFilter;
  });

  const getLessonNoteTitle = (noteId?: string) => {
    if (!noteId) return "미첨부";
    const note = lessonNotes.find((n) => n.id === noteId);
    return note ? `${note.title} (${note.studentName})` : "알 수 없음";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">음성 파일 관리</h1>
            <p className="text-lg text-gray-600">
              레슨 노트에 첨부된 음성 파일을 관리하세요
            </p>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="w-5 h-5" />
            음성 파일 업로드
          </button>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="음성 파일 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(
                  e.target.value as "all" | "attached" | "unattached",
                )
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체</option>
              <option value="attached">첨부됨</option>
              <option value="unattached">미첨부</option>
            </select>
          </div>
        </div>

        {/* 음성 파일 목록 */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">
                    파일명
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">
                    길이
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">
                    크기
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">
                    첨부된 노트
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">
                    업로드일
                  </th>
                  <th className="text-center py-4 px-6 font-medium text-gray-900">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAudioFiles.map((audio) => (
                  <tr
                    key={audio.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <FileAudio className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {audio.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            업로드: {audio.uploadedBy}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {formatDuration(audio.duration)}
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {formatFileSize(audio.fileSize)}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          audio.lessonNoteId
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {getLessonNoteTitle(audio.lessonNoteId)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {new Date(audio.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handlePlayAudio(audio)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                          title="재생"
                        >
                          <Play className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedAudio(audio);
                            setShowMoveModal(true);
                          }}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                          title="위치 변경"
                        >
                          <Move className="w-4 h-4" />
                        </button>

                        <button
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                          title="다운로드"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        <button
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                          title="상세보기"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 음성 플레이어 (하단 고정) */}
        {selectedAudio && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </button>
                <div>
                  <p className="font-medium">{selectedAudio.title}</p>
                  <p className="text-sm text-gray-500">
                    {formatDuration(selectedAudio.duration)} •{" "}
                    {formatFileSize(selectedAudio.fileSize)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  {getLessonNoteTitle(selectedAudio.lessonNoteId)}
                </span>
                <button
                  onClick={() => setSelectedAudio(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 업로드 모달 */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                음성 파일 업로드
              </h3>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-2">
                    MP3 파일을 드래그하거나 클릭하여 업로드
                  </p>
                  <input
                    type="file"
                    accept=".mp3"
                    onChange={(e) =>
                      e.target.files?.[0] &&
                      handleUploadAudio(e.target.files[0])
                    }
                    className="hidden"
                    id="audio-upload"
                  />
                  <label
                    htmlFor="audio-upload"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700"
                  >
                    파일 선택
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 위치 변경 모달 */}
        {showMoveModal && selectedAudio && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                음성 파일 위치 변경
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    레슨 노트 선택
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">미첨부</option>
                    {lessonNotes.map((note) => (
                      <option key={note.id} value={note.id}>
                        {note.title} ({note.studentName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    위치 (순서)
                  </label>
                  <input
                    type="number"
                    min="1"
                    defaultValue={selectedAudio.position || 1}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowMoveModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  취소
                </button>
                <button
                  onClick={() => handleMoveAudio(selectedAudio.id, "note1", 1)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  변경
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Edit,
  Eye,
  Download,
  User,
  Star,
  X,
  Mic,
  MicOff,
  Trash2,
} from "lucide-react";

interface StudentNote {
  id: string;
  studentName: string;
  teacherName: string;
  date: string;
  subject: string;
  content: string;
  todayLesson: string;
  nextLesson: string;
  homework: {
    hasHomework: boolean;
    teacherHomework: string;
    studentHomework: string;
  };
  evaluation: {
    participation: number;
    understanding: number;
    pronunciation: number;
    grammar: number;
    vocabulary: number;
    speaking: number;
    listening: number;
    reading: number;
    writing: number;
    comments: string;
    participationComment: string;
    understandingComment: string;
    pronunciationComment: string;
    grammarComment: string;
    vocabularyComment: string;
    speakingComment: string;
    listeningComment: string;
    readingComment: string;
    writingComment: string;
  };
  audioFiles?: AudioFile[];
}

interface AudioFile {
  id: string;
  name: string;
  url: string;
  duration: number;
  transcript: string;
}

export default function AdminStudentNotesPage() {
  const [notes, setNotes] = useState<StudentNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<StudentNote | null>(null);
  const [editingNote, setEditingNote] = useState<StudentNote | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [currentAudioFile, setCurrentAudioFile] = useState<AudioFile | null>(
    null,
  );
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Mock data - 실제로는 API에서 가져옴
    setTimeout(() => {
      const mockNotes: StudentNote[] = [
        {
          id: "1",
          studentName: "김학생",
          teacherName: "이선생님",
          date: "2024-01-16",
          subject: "문법",
          content:
            "<h2>오늘의 수업 내용</h2><p>안녕하세요! 오늘은 한국어 기초 문법을 배워보겠습니다.</p><h3>1. 인사말</h3><ul><li>안녕하세요 - Hello</li><li>안녕히 가세요 - Goodbye</li><li>감사합니다 - Thank you</li></ul>",
          todayLesson: "기초 문법 - 인사말과 자기소개",
          nextLesson: "기초 문법 - 숫자와 시간 표현",
          homework: {
            hasHomework: true,
            teacherHomework: "다음 수업 준비물 준비",
            studentHomework: "인사말 연습하기",
          },
          evaluation: {
            participation: 4,
            understanding: 4,
            pronunciation: 3,
            grammar: 4,
            vocabulary: 3,
            speaking: 4,
            listening: 3,
            reading: 4,
            writing: 3,
            comments:
              "전반적으로 좋은 수업이었습니다. 발음 부분에서 더 연습이 필요합니다.",
            participationComment: "적극적으로 참여했습니다.",
            understandingComment: "개념을 잘 이해했습니다.",
            pronunciationComment: "발음 교정이 필요합니다.",
            grammarComment: "문법 규칙을 잘 적용했습니다.",
            vocabularyComment: "새로운 단어를 잘 기억했습니다.",
            speakingComment: "자연스럽게 대화했습니다.",
            listeningComment: "듣기 이해도가 좋습니다.",
            readingComment: "읽기 속도가 개선되었습니다.",
            writingComment: "문장 구성이 좋습니다.",
          },
          audioFiles: [
            {
              id: "1",
              name: "수업 내용 1",
              url: "/audio/lesson1.mp3",
              duration: 120,
              transcript: "오늘은 한국어 기초 문법을 배워보겠습니다.",
            },
            {
              id: "2",
              name: "수업 내용 2",
              url: "/audio/lesson2.mp3",
              duration: 180,
              transcript: "인사말과 자기소개에 대해 학습했습니다.",
            },
          ],
        },
        {
          id: "2",
          studentName: "이학생",
          teacherName: "박선생님",
          date: "2024-01-16",
          subject: "회화",
          content:
            "<h2>오늘의 수업 내용</h2><p>일상 대화 연습을 진행했습니다.</p><h3>1. 자기소개</h3><p>저는 [이름]입니다. 만나서 반갑습니다.</p>",
          todayLesson: "일상 대화 - 자기소개",
          nextLesson: "일상 대화 - 취미 이야기",
          homework: {
            hasHomework: false,
            teacherHomework: "",
            studentHomework: "",
          },
          evaluation: {
            participation: 5,
            understanding: 4,
            pronunciation: 4,
            grammar: 3,
            vocabulary: 4,
            speaking: 5,
            listening: 4,
            reading: 3,
            writing: 3,
            comments: "회화 능력이 뛰어납니다. 문법 기초를 더 다져야 합니다.",
            participationComment: "매우 적극적으로 참여했습니다.",
            understandingComment: "대화 내용을 잘 이해했습니다.",
            pronunciationComment: "발음이 매우 좋습니다.",
            grammarComment: "문법 오류가 있습니다.",
            vocabularyComment: "어휘 사용이 자연스럽습니다.",
            speakingComment: "자연스러운 대화가 가능합니다.",
            listeningComment: "듣기 능력이 우수합니다.",
            readingComment: "읽기 속도가 느립니다.",
            writingComment: "쓰기 연습이 필요합니다.",
          },
          audioFiles: [],
        },
      ];
      setNotes(mockNotes);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStudent =
      !selectedStudent || note.studentName === selectedStudent;
    const matchesTeacher =
      !selectedTeacher || note.teacherName === selectedTeacher;
    const matchesDate = !selectedDate || note.date === selectedDate;

    return matchesSearch && matchesStudent && matchesTeacher && matchesDate;
  });

  const students = [...new Set(notes.map((note) => note.studentName))];
  const teachers = [...new Set(notes.map((note) => note.teacherName))];
  const dates = [...new Set(notes.map((note) => note.date))];

  const openNoteModal = (note: StudentNote) => {
    setSelectedNote(note);
    setEditingNote({ ...note });
    setAudioFiles(note.audioFiles || []);
    setShowNoteModal(true);
  };

  const saveNote = async () => {
    if (!editingNote) return;

    try {
      // 실제 API 호출로 대체
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const updatedNote = {
        ...editingNote,
        audioFiles: audioFiles,
      };

      setNotes((prev) =>
        prev.map((note) => (note.id === updatedNote.id ? updatedNote : note)),
      );

      setShowNoteModal(false);
      alert("노트가 저장되었습니다.");
    } catch (error) {
      alert("저장에 실패했습니다.");
    }
  };

  const getAverageScore = (evaluation: StudentNote["evaluation"]) => {
    const scores = [
      evaluation.participation,
      evaluation.understanding,
      evaluation.pronunciation,
      evaluation.grammar,
      evaluation.vocabulary,
      evaluation.speaking,
      evaluation.listening,
      evaluation.reading,
      evaluation.writing,
    ];
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  // 음성 녹음 시작
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        const audioUrl = URL.createObjectURL(audioBlob);

        const newAudioFile: AudioFile = {
          id: Date.now().toString(),
          name: `음성 녹음 ${audioFiles.length + 1}`,
          url: audioUrl,
          duration: Math.round(audioBlob.size / 1000), // 간단한 duration 계산
          transcript: "",
        };

        setAudioFiles((prev) => [...prev, newAudioFile]);
        setCurrentAudioFile(newAudioFile);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("음성 녹음을 시작할 수 없습니다:", error);
      alert("마이크 권한이 필요합니다.");
    }
  };

  // 음성 녹음 중지
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  // 음성 파일 삭제
  const deleteAudioFile = (audioId: string) => {
    setAudioFiles((prev) => prev.filter((audio) => audio.id !== audioId));
  };

  // 음성 파일 이름 변경
  const updateAudioFileName = (audioId: string, name: string) => {
    setAudioFiles((prev) =>
      prev.map((audio) => (audio.id === audioId ? { ...audio, name } : audio)),
    );
  };

  // 음성 파일 트랜스크립트 업데이트
  const updateAudioTranscript = (audioId: string, transcript: string) => {
    setAudioFiles((prev) =>
      prev.map((audio) =>
        audio.id === audioId ? { ...audio, transcript } : audio,
      ),
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/home"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>뒤로가기</span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">학생 노트 관리</h1>
            <p className="text-gray-600">모든 학생의 수업 노트를 관리합니다</p>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">모든 학생</option>
            {students.map((student) => (
              <option key={student} value={student}>
                {student}
              </option>
            ))}
          </select>

          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">모든 선생님</option>
            {teachers.map((teacher) => (
              <option key={teacher} value={teacher}>
                {teacher}
              </option>
            ))}
          </select>

          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">모든 날짜</option>
            {dates.map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedStudent("");
              setSelectedTeacher("");
              setSelectedDate("");
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            필터 초기화
          </button>
        </div>
      </div>

      {/* 노트 목록 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            수업 노트 목록 ({filteredNotes.length}개)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  학생
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  선생님
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  날짜
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  과목
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  평균 점수
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  숙제
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  음성 파일
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredNotes.map((note) => (
                <tr key={note.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {note.studentName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {note.teacherName}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {note.date}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {note.subject}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm text-gray-900">
                        {getAverageScore(note.evaluation)}/5
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        note.homework.hasHomework
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {note.homework.hasHomework ? "있음" : "없음"}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {note.audioFiles?.length || 0}개
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openNoteModal(note)}
                        className="text-blue-600 hover:text-blue-900"
                        title="편집"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedNote(note);
                          setShowNoteModal(true);
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="보기"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          const printWindow = window.open("", "_blank");
                          if (printWindow) {
                            printWindow.document.write(`
                              <html>
                                <head>
                                  <title>수업 노트 - ${note.studentName}</title>
                                  <style>
                                    body { font-family: Arial, sans-serif; margin: 20px; }
                                    .header { text-align: center; margin-bottom: 30px; }
                                    .content { line-height: 1.6; }
                                    @media print {
                                      body { margin: 1cm; }
                                    }
                                  </style>
                                </head>
                                <body>
                                  <div class="header">
                                    <h1>수업 노트</h1>
                                    <p>${note.date}</p>
                                  </div>
                                  <div class="content">
                                    ${note.content}
                                  </div>
                                </body>
                              </html>
                            `);
                            printWindow.document.close();
                            printWindow.print();
                          }
                        }}
                        className="text-purple-600 hover:text-purple-900"
                        title="인쇄"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 노트 모달 */}
      {showNoteModal && (selectedNote || editingNote) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingNote ? "노트 편집" : "노트 보기"}
              </h3>
              <button
                onClick={() => {
                  setShowNoteModal(false);
                  setSelectedNote(null);
                  setEditingNote(null);
                  setAudioFiles([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {editingNote ? (
              <div className="space-y-6">
                {/* 음성 파일 관리 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">
                      음성 파일 관리
                    </h4>
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        isRecording
                          ? "bg-red-600 text-white hover:bg-red-700"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="w-4 h-4" />
                          녹음 중지
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4" />
                          음성 녹음
                        </>
                      )}
                    </button>
                  </div>

                  {audioFiles.length > 0 && (
                    <div className="space-y-3">
                      {audioFiles.map((audio) => (
                        <div
                          key={audio.id}
                          className="bg-white rounded-lg p-3 border"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <input
                              type="text"
                              value={audio.name}
                              onChange={(e) =>
                                updateAudioFileName(audio.id, e.target.value)
                              }
                              className="font-medium text-gray-900 bg-transparent border-none focus:ring-0"
                            />
                            <button
                              onClick={() => deleteAudioFile(audio.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center gap-4 mb-2">
                            <audio controls className="flex-1">
                              <source src={audio.url} type="audio/wav" />
                            </audio>
                            <span className="text-sm text-gray-500">
                              {Math.floor(audio.duration / 60)}:
                              {(audio.duration % 60)
                                .toString()
                                .padStart(2, "0")}
                            </span>
                          </div>
                          <textarea
                            value={audio.transcript}
                            onChange={(e) =>
                              updateAudioTranscript(audio.id, e.target.value)
                            }
                            placeholder="음성 내용을 텍스트로 입력하세요..."
                            className="w-full h-20 p-2 border border-gray-300 rounded resize-none text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 편집 가능한 내용 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    수업 내용
                  </label>
                  <textarea
                    value={editingNote.content.replace(/<[^>]*>/g, "")}
                    onChange={(e) =>
                      setEditingNote({
                        ...editingNote,
                        content: e.target.value,
                      })
                    }
                    className="w-full h-32 p-2 border border-gray-300 rounded resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      오늘 낸 레슨
                    </label>
                    <textarea
                      value={editingNote.todayLesson}
                      onChange={(e) =>
                        setEditingNote({
                          ...editingNote,
                          todayLesson: e.target.value,
                        })
                      }
                      className="w-full h-20 p-2 border border-gray-300 rounded resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      다음 레슨
                    </label>
                    <textarea
                      value={editingNote.nextLesson}
                      onChange={(e) =>
                        setEditingNote({
                          ...editingNote,
                          nextLesson: e.target.value,
                        })
                      }
                      className="w-full h-20 p-2 border border-gray-300 rounded resize-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    전체 평가 코멘트
                  </label>
                  <textarea
                    value={editingNote.evaluation.comments}
                    onChange={(e) =>
                      setEditingNote({
                        ...editingNote,
                        evaluation: {
                          ...editingNote.evaluation,
                          comments: e.target.value,
                        },
                      })
                    }
                    className="w-full h-20 p-2 border border-gray-300 rounded resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={saveNote}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => {
                      setEditingNote(null);
                      setSelectedNote(selectedNote);
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    보기 모드로
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 읽기 전용 내용 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      학생:
                    </span>
                    <p className="text-gray-900">{selectedNote?.studentName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      선생님:
                    </span>
                    <p className="text-gray-900">{selectedNote?.teacherName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      날짜:
                    </span>
                    <p className="text-gray-900">{selectedNote?.date}</p>
                  </div>
                </div>

                {/* 음성 파일 목록 */}
                {selectedNote?.audioFiles &&
                  selectedNote.audioFiles.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        음성 파일
                      </h4>
                      <div className="space-y-3">
                        {selectedNote.audioFiles.map((audio) => (
                          <div
                            key={audio.id}
                            className="bg-gray-50 rounded-lg p-3"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900">
                                {audio.name}
                              </span>
                              <span className="text-sm text-gray-500">
                                {Math.floor(audio.duration / 60)}:
                                {(audio.duration % 60)
                                  .toString()
                                  .padStart(2, "0")}
                              </span>
                            </div>
                            <audio controls className="w-full mb-2">
                              <source src={audio.url} type="audio/wav" />
                            </audio>
                            {audio.transcript && (
                              <div>
                                <span className="text-sm font-medium text-gray-700">
                                  트랜스크립트:
                                </span>
                                <p className="text-sm text-gray-700 mt-1">
                                  {audio.transcript}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">수업 내용</h4>
                  <div
                    className="p-4 bg-gray-50 rounded-lg"
                    dangerouslySetInnerHTML={{
                      __html: selectedNote?.content || "",
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      오늘 낸 레슨
                    </h4>
                    <p className="text-gray-700">{selectedNote?.todayLesson}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      다음 레슨
                    </h4>
                    <p className="text-gray-700">{selectedNote?.nextLesson}</p>
                  </div>
                </div>

                {selectedNote?.homework.hasHomework && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">숙제</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          선생님 숙제:
                        </span>
                        <p className="text-gray-700">
                          {selectedNote.homework.teacherHomework}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          학생 숙제:
                        </span>
                        <p className="text-gray-700">
                          {selectedNote.homework.studentHomework}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">수업 평가</h4>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {[
                      { key: "participation", label: "참여도" },
                      { key: "understanding", label: "이해도" },
                      { key: "pronunciation", label: "발음" },
                      { key: "grammar", label: "문법" },
                      { key: "vocabulary", label: "어휘" },
                      { key: "speaking", label: "회화" },
                      { key: "listening", label: "듣기" },
                      { key: "reading", label: "읽기" },
                      { key: "writing", label: "쓰기" },
                    ].map((item) => (
                      <div key={item.key} className="text-center">
                        <div className="text-sm text-gray-600">
                          {item.label}
                        </div>
                        <div className="flex justify-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                (selectedNote?.evaluation[
                                  item.key as keyof typeof selectedNote.evaluation
                                ] as number) >= star
                                  ? "text-yellow-500 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">
                      전체 평가 코멘트
                    </h5>
                    <p className="text-gray-700">
                      {selectedNote?.evaluation.comments}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setEditingNote({ ...selectedNote! });
                      setSelectedNote(null);
                      setAudioFiles(selectedNote?.audioFiles || []);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    편집
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

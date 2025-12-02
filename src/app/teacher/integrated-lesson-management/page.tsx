"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Target,
  CheckCircle,
  Play,
  Pause,
  Plus,
  Search,
  Filter,
  Download,
  Clock,
  BarChart3,
  Settings,
  Save,
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  level: string;
  subLevel: string;
  lastClass: string;
  progress: number;
  homeworkCompletion: number;
}

interface LessonNote {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  content: string;
  audioUrl?: string;
  materials: Material[];
  homework: Homework[];
  teacherNotes: string;
  isCompleted: boolean;
}

interface Material {
  id: string;
  title: string;
  type: "text" | "image" | "audio" | "video";
  content: string;
  url?: string;
  level: string;
  subLevel: string;
  isChecked: boolean;
  isUsedInClass: boolean;
  viewDate?: string;
  teacherNotes?: string;
  linkedHomework?: string[];
}

interface Homework {
  id: string;
  title: string;
  type: "quiz" | "writing" | "listening" | "speaking" | "reading";
  content: string;
  materialId?: string;
  isCompleted: boolean;
  completionDate?: string;
  score?: number;
  feedback?: string;
}

interface Curriculum {
  id: string;
  level: string;
  subLevel: string;
  title: string;
  description: string;
  grammar: string[];
  vocabulary: string[];
  expressions: string[];
  goals: string[];
  materials: Material[];
  explanationCount: number;
  isCompleted: boolean;
  lastExplained?: string;
}

interface LevelStructure {
  mainLevel: string;
  subLevels: {
    id: string;
    number: number;
    title: string;
    description: string;
    grammar: string[];
    vocabulary: string[];
    expressions: string[];
    goals: string[];
    explanationCount: number;
    isCompleted: boolean;
  }[];
}

export default function IntegratedLessonManagementPage() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [lessonNotes, setLessonNotes] = useState<LessonNote[]>([]);
  const [curriculum, setCurriculum] = useState<Curriculum[]>([]);
  const [levelStructure, setLevelStructure] = useState<LevelStructure[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [activeTab, setActiveTab] = useState<"notes" | "curriculum" | "levels">(
    "notes",
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showHomeworkModal, setShowHomeworkModal] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

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
          lastClass: "2024-01-15",
          progress: 75,
          homeworkCompletion: 85,
        },
        {
          id: "STU002",
          name: "이학생",
          level: "B",
          subLevel: "1",
          lastClass: "2024-01-14",
          progress: 60,
          homeworkCompletion: 70,
        },
        {
          id: "STU003",
          name: "박학생",
          level: "A",
          subLevel: "3",
          lastClass: "2024-01-13",
          progress: 90,
          homeworkCompletion: 95,
        },
      ];

      const mockMaterials: Material[] = [
        {
          id: "MAT001",
          title: "기본 인사말",
          type: "text",
          content: "안녕하세요, 만나서 반갑습니다.",
          level: "A",
          subLevel: "1",
          isChecked: true,
          isUsedInClass: true,
          viewDate: "2024-01-15",
          teacherNotes: "발음에 주의 필요",
        },
        {
          id: "MAT002",
          title: "자기소개",
          type: "audio",
          content: "저는 한국어를 배우고 있습니다.",
          url: "/audio/self-intro.mp3",
          level: "A",
          subLevel: "1",
          isChecked: true,
          isUsedInClass: false,
        },
        {
          id: "MAT003",
          title: "일상 대화",
          type: "text",
          content: "오늘 날씨가 좋네요.",
          level: "A",
          subLevel: "2",
          isChecked: false,
          isUsedInClass: false,
        },
      ];

      const mockLessonNotes: LessonNote[] = [
        {
          id: "NOTE001",
          studentId: "STU001",
          studentName: "김학생",
          date: "2024-01-15",
          content:
            "기본 인사말과 자기소개를 학습했습니다. 발음이 많이 개선되었습니다.",
          audioUrl: "/audio/lesson-001.mp3",
          materials: [mockMaterials[0], mockMaterials[1]],
          homework: [],
          teacherNotes: "다음 수업에서는 일상 대화로 확장 예정",
          isCompleted: true,
        },
      ];

      const mockCurriculum: Curriculum[] = [
        {
          id: "CUR001",
          level: "A",
          subLevel: "1",
          title: "기본 인사말과 자기소개",
          description: "한국어의 기본적인 인사말과 자기소개 방법을 학습합니다.",
          grammar: ["입니다/입니다", "저는 ~입니다"],
          vocabulary: ["안녕하세요", "만나서 반갑습니다", "저는", "학생"],
          expressions: [
            "안녕하세요",
            "만나서 반갑습니다",
            "저는 한국어를 배우고 있습니다",
          ],
          goals: ["기본 인사말을 할 수 있다", "자기소개를 할 수 있다"],
          materials: [mockMaterials[0], mockMaterials[1]],
          explanationCount: 2,
          isCompleted: true,
          lastExplained: "2024-01-15",
        },
      ];

      const mockLevelStructure: LevelStructure[] = [
        {
          mainLevel: "A",
          subLevels: [
            {
              id: "A1",
              number: 1,
              title: "기본 인사말과 자기소개",
              description: "한국어의 기본적인 인사말과 자기소개",
              grammar: ["입니다/입니다", "저는 ~입니다"],
              vocabulary: ["안녕하세요", "만나서 반갑습니다"],
              expressions: ["안녕하세요", "만나서 반갑습니다"],
              goals: ["기본 인사말을 할 수 있다"],
              explanationCount: 2,
              isCompleted: true,
            },
            {
              id: "A2",
              number: 2,
              title: "일상 대화",
              description: "일상적인 대화 표현",
              grammar: ["~네요", "~아요/어요"],
              vocabulary: ["날씨", "좋다", "나쁘다"],
              expressions: ["오늘 날씨가 좋네요"],
              goals: ["일상적인 대화를 할 수 있다"],
              explanationCount: 1,
              isCompleted: false,
            },
          ],
        },
      ];

      setLessonNotes(mockLessonNotes);
      setCurriculum(mockCurriculum);
      setLevelStructure(mockLevelStructure);
      setMaterials(mockMaterials);
      setIsLoading(false);
    };

    initializeData();
  }, []);

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
  };

  const handleMaterialCheck = (materialId: string) => {
    setMaterials((prev) =>
      prev.map((material) =>
        material.id === materialId
          ? { ...material, isChecked: !material.isUsedInClass }
          : material,
      ),
    );
  };

  const handleAudioPlay = (audioUrl: string) => {
    setCurrentAudio(audioUrl);
    setIsPlaying(true);
    // Mock audio playback
    setTimeout(() => setIsPlaying(false), 5000);
  };

  const handlePlaybackSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
  };

  const getFilteredStudents = () => {
    if (!searchTerm) return [];
    return []; // Mock filtered students
  };

  const getRecommendedContent = () => {
    if (!selectedStudent) return [];
    return curriculum.filter((cur) => cur.level === selectedStudent.level);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            통합 레슨 관리 시스템을 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                통합 레슨 관리 시스템
              </h1>
              <p className="text-gray-600">
                레슨노트, 커리큘럼, 레벨관리 통합 인터페이스
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                저장
              </button>
              <button className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                <Settings className="w-4 h-4 mr-2" />
                설정
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Split Screen */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          {/* Left Panel - Lesson Notes */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-blue-600 text-white px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">레슨노트</h2>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-blue-700 rounded">
                    <Plus className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-blue-700 rounded">
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto h-full">
              {selectedStudent ? (
                <div>
                  {/* Student Info */}
                  <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {selectedStudent.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          레벨: {selectedStudent.level}-
                          {selectedStudent.subLevel} | 진행도:{" "}
                          {selectedStudent.progress}%
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">숙제 완료율</div>
                        <div className="text-lg font-bold text-blue-600">
                          {selectedStudent.homeworkCompletion}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Notes */}
                  <div className="space-y-4">
                    {lessonNotes
                      .filter((note) => note.studentId === selectedStudent.id)
                      .map((note) => (
                        <div key={note.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">
                                {note.date}
                              </span>
                              {note.isCompleted && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                            {note.audioUrl && (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() =>
                                    handleAudioPlay(note.audioUrl!)
                                  }
                                  className="p-1 hover:bg-gray-100 rounded"
                                >
                                  {isPlaying &&
                                  currentAudio === note.audioUrl ? (
                                    <Pause className="w-4 h-4" />
                                  ) : (
                                    <Play className="w-4 h-4" />
                                  )}
                                </button>
                                <select
                                  value={playbackSpeed}
                                  onChange={(e) =>
                                    handlePlaybackSpeedChange(
                                      Number(e.target.value),
                                    )
                                  }
                                  className="text-xs border rounded px-1"
                                >
                                  <option value={0.5}>0.5x</option>
                                  <option value={0.75}>0.75x</option>
                                  <option value={1}>1x</option>
                                </select>
                              </div>
                            )}
                          </div>

                          <div className="text-gray-700 mb-3">
                            {note.content}
                          </div>

                          {/* Materials Used */}
                          {note.materials.length > 0 && (
                            <div className="mb-3">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">
                                사용된 자료
                              </h4>
                              <div className="space-y-2">
                                {note.materials.map((material) => (
                                  <div
                                    key={material.id}
                                    className="flex items-center space-x-2 text-sm"
                                  >
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>{material.title}</span>
                                    {material.teacherNotes && (
                                      <span className="text-blue-600">💬</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Teacher Notes */}
                          {note.teacherNotes && (
                            <div className="bg-yellow-50 rounded p-3">
                              <h4 className="text-sm font-medium text-gray-900 mb-1">
                                선생님 메모
                              </h4>
                              <p className="text-sm text-gray-700">
                                {note.teacherNotes}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  학생을 선택해주세요
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Curriculum/Levels */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-green-600 text-white px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setActiveTab("curriculum")}
                    className={`px-3 py-1 rounded ${activeTab === "curriculum" ? "bg-green-700" : "hover:bg-green-700"}`}
                  >
                    커리큘럼
                  </button>
                  <button
                    onClick={() => setActiveTab("levels")}
                    className={`px-3 py-1 rounded ${activeTab === "levels" ? "bg-green-700" : "hover:bg-green-700"}`}
                  >
                    레벨관리
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-green-700 rounded">
                    <Filter className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-green-700 rounded">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto h-full">
              {activeTab === "curriculum" ? (
                <div>
                  {/* Student Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      학생 선택
                    </label>
                    <div className="flex items-center space-x-2">
                      <select
                        value={selectedStudent?.id || ""}
                        onChange={(e) => {
                          const student = e.target.value
                            ? [
                                {
                                  id: "STU001",
                                  name: "김학생",
                                  level: "A",
                                  subLevel: "2",
                                  lastClass: "2024-01-15",
                                  progress: 75,
                                  homeworkCompletion: 85,
                                },
                              ].find((s) => s.id === e.target.value)
                            : null;
                          setSelectedStudent(student || null);
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">학생 선택</option>
                        <option value="STU001">김학생 (A-2)</option>
                        <option value="STU002">이학생 (B-1)</option>
                        <option value="STU003">박학생 (A-3)</option>
                      </select>
                      <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                        학생 없음
                      </button>
                    </div>
                  </div>

                  {/* Recommended Content */}
                  {selectedStudent && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {selectedStudent.name}님 추천 콘텐츠
                      </h3>
                      <div className="space-y-4">
                        {getRecommendedContent().map((cur) => (
                          <div key={cur.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-gray-900">
                                {cur.title}
                              </h4>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">
                                  설명 {cur.explanationCount}회
                                </span>
                                {cur.isCompleted && (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                )}
                              </div>
                            </div>

                            <p className="text-sm text-gray-600 mb-3">
                              {cur.description}
                            </p>

                            {/* Grammar */}
                            <div className="mb-3">
                              <h5 className="text-sm font-medium text-gray-900 mb-1">
                                문법
                              </h5>
                              <div className="flex flex-wrap gap-1">
                                {cur.grammar.map((grammar, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                                  >
                                    {grammar}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Vocabulary */}
                            <div className="mb-3">
                              <h5 className="text-sm font-medium text-gray-900 mb-1">
                                단어
                              </h5>
                              <div className="flex flex-wrap gap-1">
                                {cur.vocabulary.map((word, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                                  >
                                    {word}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Materials */}
                            <div>
                              <h5 className="text-sm font-medium text-gray-900 mb-1">
                                자료
                              </h5>
                              <div className="space-y-1">
                                {cur.materials.map((material) => (
                                  <div
                                    key={material.id}
                                    className="flex items-center space-x-2 text-sm"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={material.isChecked}
                                      onChange={() =>
                                        handleMaterialCheck(material.id)
                                      }
                                      className="rounded"
                                    />
                                    <span>{material.title}</span>
                                    {material.isUsedInClass && (
                                      <span className="text-blue-600 text-xs">
                                        수업 사용
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All Curriculum */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      전체 커리큘럼
                    </h3>
                    <div className="space-y-3">
                      {curriculum.map((cur) => (
                        <div key={cur.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {cur.title}
                              </h4>
                              <p className="text-sm text-gray-600">
                                레벨 {cur.level}-{cur.subLevel}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">
                                설명 {cur.explanationCount}회
                              </span>
                              {cur.isCompleted && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Level Management */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      레벨 구조 관리
                    </h3>
                    <div className="space-y-4">
                      {levelStructure.map((level) => (
                        <div
                          key={level.mainLevel}
                          className="border rounded-lg p-4"
                        >
                          <h4 className="font-semibold text-gray-900 mb-3">
                            레벨 {level.mainLevel}
                          </h4>
                          <div className="space-y-3">
                            {level.subLevels.map((subLevel) => (
                              <div
                                key={subLevel.id}
                                className="bg-gray-50 rounded-lg p-3"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-medium text-gray-900">
                                    {level.mainLevel}-{subLevel.number}:{" "}
                                    {subLevel.title}
                                  </h5>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-500">
                                      설명 {subLevel.explanationCount}회
                                    </span>
                                    {subLevel.isCompleted && (
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                    )}
                                  </div>
                                </div>

                                <p className="text-sm text-gray-600 mb-2">
                                  {subLevel.description}
                                </p>

                                {/* Grammar */}
                                <div className="mb-2">
                                  <span className="text-xs font-medium text-gray-700">
                                    문법:
                                  </span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {subLevel.grammar.map((grammar, index) => (
                                      <span
                                        key={index}
                                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                                      >
                                        {grammar}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                {/* Vocabulary */}
                                <div className="mb-2">
                                  <span className="text-xs font-medium text-gray-700">
                                    단어:
                                  </span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {subLevel.vocabulary.map((word, index) => (
                                      <span
                                        key={index}
                                        className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                                      >
                                        {word}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                {/* Goals */}
                                <div>
                                  <span className="text-xs font-medium text-gray-700">
                                    목표:
                                  </span>
                                  <ul className="text-xs text-gray-600 mt-1 space-y-1">
                                    {subLevel.goals.map((goal, index) => (
                                      <li
                                        key={index}
                                        className="flex items-start space-x-1"
                                      >
                                        <span className="text-blue-500 mt-0.5">
                                          •
                                        </span>
                                        <span>{goal}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Panel - Quick Actions */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <BookOpen className="w-4 h-4 mr-2" />
                자료 관리
              </button>
              <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Target className="w-4 h-4 mr-2" />
                숙제 연동
              </button>
              <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                <BarChart3 className="w-4 h-4 mr-2" />
                진도 분석
              </button>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>수업 종료 후 10분 단위 알림 설정됨</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

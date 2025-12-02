"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  CheckCircle,
  Clock,
  User,
  ChevronRight,
  X,
  AlertCircle,
  Target,
  MessageSquare,
  Eye,
} from "lucide-react";
import {
  AddLevelModal,
  AddSubLevelModal,
  AddItemModal,
  StudentSelectorModal,
} from "@/components/curriculum/CurriculumModals";

interface CurriculumLevel {
  id: string;
  name: string;
  description: string;
  objectives: string[];
  vocabulary: string[];
  expressions: string[];
  subLevels: CurriculumSubLevel[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CurriculumSubLevel {
  id: string;
  name: string;
  description: string;
  items: CurriculumItem[];
  order: number;
  parentLevelId: string;
}

interface CurriculumItem {
  id: string;
  title: string;
  description: string;
  examples: string[];
  status: "not_taught" | "completed" | "continued" | "skipped";
  explanationCount: number;
  lastExplainedAt?: Date;
  notes: string;
  order: number;
  parentSubLevelId: string;
}

interface Student {
  id: string;
  name: string;
  level: string;
  currentLesson?: {
    startTime: Date;
    endTime: Date;
    teacherId: string;
  };
}

interface TeachingSession {
  id: string;
  studentId: string;
  levelId: string;
  startTime: Date;
  endTime?: Date;
  itemsCompleted: string[];
  notes: string;
  teacherId: string;
}

export default function CurriculumCompositionPage() {
  const [levels, setLevels] = useState<CurriculumLevel[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedSubLevel, setSelectedSubLevel] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [currentSession, setCurrentSession] = useState<TeachingSession | null>(
    null,
  );
  const [showAddLevel, setShowAddLevel] = useState(false);
  const [showAddSubLevel, setShowAddSubLevel] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showStudentSelector, setShowStudentSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionTime, setSessionTime] = useState<Date>(new Date());
  const [showTimeWarning, setShowTimeWarning] = useState(false);

  // Mock data initialization
  useEffect(() => {
    initializeMockData();
    const timer = setInterval(() => {
      setSessionTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const initializeMockData = () => {
    const mockLevels: CurriculumLevel[] = [
      {
        id: "level-a",
        name: "A 레벨 (초급)",
        description: "기초적인 한국어 학습을 위한 커리큘럼",
        objectives: ["한글 자모음 익히기", "기본 인사말 학습", "숫자 읽기"],
        vocabulary: [
          "안녕하세요",
          "감사합니다",
          "죄송합니다",
          "하나",
          "둘",
          "셋",
        ],
        expressions: ["안녕하세요", "감사합니다", "죄송합니다"],
        subLevels: [
          {
            id: "a-1",
            name: "A-1 (한글 기초)",
            description: "한글 자모음과 기본 발음 학습",
            items: [
              {
                id: "a-1-1",
                title: "한글 자모음 익히기",
                description:
                  "ㄱ, ㄴ, ㄷ, ㄹ, ㅁ, ㅂ, ㅅ, ㅇ, ㅈ, ㅊ, ㅋ, ㅌ, ㅍ, ㅎ 자음과 ㅏ, ㅑ, ㅓ, ㅕ, ㅗ, ㅛ, ㅜ, ㅠ, ㅡ, ㅣ 모음 학습",
                examples: [
                  "가, 나, 다, 라, 마, 바, 사, 아, 자, 차, 카, 타, 파, 하",
                ],
                status: "not_taught",
                explanationCount: 0,
                notes: "",
                order: 1,
                parentSubLevelId: "a-1",
              },
            ],
            order: 1,
            parentLevelId: "level-a",
          },
        ],
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const mockStudents: Student[] = [
      {
        id: "student1",
        name: "김학생",
        level: "A",
        currentLesson: {
          startTime: new Date(Date.now() - 30 * 60 * 1000),
          endTime: new Date(Date.now() + 30 * 60 * 1000),
          teacherId: "teacher1",
        },
      },
    ];

    setLevels(mockLevels);
    setStudents(mockStudents);
    if (mockLevels.length > 0) {
      setSelectedLevel(mockLevels[0].id);
      if (mockLevels[0].subLevels.length > 0) {
        setSelectedSubLevel(mockLevels[0].subLevels[0].id);
      }
    }
  };

  const getCurrentStudents = () => {
    const now = new Date();
    return students.filter((student) => {
      if (!student.currentLesson) return false;
      const startTime = new Date(student.currentLesson.startTime);
      const endTime = new Date(student.currentLesson.endTime);
      return now >= startTime && now <= endTime;
    });
  };

  const handleItemStatusChange = (
    itemId: string,
    status: CurriculumItem["status"],
  ) => {
    setLevels((prevLevels) =>
      prevLevels.map((level) => ({
        ...level,
        subLevels: level.subLevels.map((subLevel) => ({
          ...subLevel,
          items: subLevel.items.map((item) => {
            if (item.id === itemId) {
              return {
                ...item,
                status,
                explanationCount:
                  status === "completed"
                    ? item.explanationCount + 1
                    : item.explanationCount,
                lastExplainedAt:
                  status === "completed" ? new Date() : item.lastExplainedAt,
              };
            }
            return item;
          }),
        })),
      })),
    );
  };

  const addLevel = (
    levelData: Omit<CurriculumLevel, "id" | "createdAt" | "updatedAt">,
  ) => {
    const newLevel: CurriculumLevel = {
      ...levelData,
      id: `level-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setLevels((prev) => [...prev, newLevel]);
    setShowAddLevel(false);
  };

  const addSubLevel = (
    subLevelData: Omit<CurriculumSubLevel, "id" | "parentLevelId">,
  ) => {
    const newSubLevel: CurriculumSubLevel = {
      ...subLevelData,
      id: `${selectedLevel}-${Date.now()}`,
      parentLevelId: selectedLevel,
    };
    setLevels((prev) =>
      prev.map((level) =>
        level.id === selectedLevel
          ? { ...level, subLevels: [...level.subLevels, newSubLevel] }
          : level,
      ),
    );
    setShowAddSubLevel(false);
  };

  const addItem = (
    itemData: Omit<CurriculumItem, "id" | "parentSubLevelId">,
  ) => {
    const newItem: CurriculumItem = {
      ...itemData,
      id: `${selectedSubLevel}-${Date.now()}`,
      parentSubLevelId: selectedSubLevel,
    };
    setLevels((prev) =>
      prev.map((level) => ({
        ...level,
        subLevels: level.subLevels.map((subLevel) =>
          subLevel.id === selectedSubLevel
            ? { ...subLevel, items: [...subLevel.items, newItem] }
            : subLevel,
        ),
      })),
    );
    setShowAddItem(false);
  };

  const selectedLevelData = levels.find((level) => level.id === selectedLevel);
  const selectedSubLevelData = selectedLevelData?.subLevels.find(
    (sub) => sub.id === selectedSubLevel,
  );
  const currentStudents = getCurrentStudents();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">커리큘럼 구성</h1>
            <p className="text-gray-600 mt-2">
              교육 콘텐츠 관리 및 수업 진행 지원
            </p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <button
              onClick={() => setShowAddLevel(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>레벨 추가</span>
            </button>
            <button
              onClick={() => setShowStudentSelector(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <User className="w-4 h-4" />
              <span>학생 선택</span>
            </button>
          </div>
        </div>

        {/* Student Selection */}
        {selectedStudent && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-blue-500" />
                <span className="font-medium">
                  선택된 학생:{" "}
                  {students.find((s) => s.id === selectedStudent)?.name}
                </span>
                <span className="text-sm text-gray-500">
                  레벨: {students.find((s) => s.id === selectedStudent)?.level}
                </span>
              </div>
              <button
                onClick={() => setSelectedStudent("")}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Time Warning */}
        {showTimeWarning && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="font-medium text-yellow-800">
                  이 학생의 수업은 종료되었습니다. 계속 진행하시겠습니까?
                </p>
                <p className="text-sm text-yellow-600 mt-1">
                  10분마다 확인 메시지가 표시됩니다.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Level Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                레벨 목록
              </h2>
              <div className="space-y-2">
                {levels.map((level) => (
                  <div key={level.id} className="space-y-2">
                    <button
                      onClick={() => {
                        setSelectedLevel(level.id);
                        if (level.subLevels.length > 0) {
                          setSelectedSubLevel(level.subLevels[0].id);
                        }
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedLevel === level.id
                          ? "bg-blue-50 border border-blue-200 text-blue-700"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{level.name}</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {level.description}
                      </p>
                    </button>

                    {selectedLevel === level.id && (
                      <div className="ml-4 space-y-1">
                        {level.subLevels.map((subLevel) => (
                          <button
                            key={subLevel.id}
                            onClick={() => setSelectedSubLevel(subLevel.id)}
                            className={`w-full text-left p-2 rounded transition-colors ${
                              selectedSubLevel === subLevel.id
                                ? "bg-blue-100 text-blue-700"
                                : "hover:bg-gray-100 text-gray-600"
                            }`}
                          >
                            <span className="text-sm">{subLevel.name}</span>
                          </button>
                        ))}
                        <button
                          onClick={() => setShowAddSubLevel(true)}
                          className="w-full text-left p-2 rounded text-blue-600 hover:bg-blue-50 text-sm flex items-center"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          소분류 추가
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedLevelData && selectedSubLevelData ? (
              <div className="space-y-6">
                {/* Level Information */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedLevelData.name} - {selectedSubLevelData.name}
                    </h2>
                    <button
                      onClick={() => setShowAddItem(true)}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>항목 추가</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-medium text-blue-900 mb-2">
                        학습 목표
                      </h3>
                      <ul className="text-sm text-blue-700 space-y-1">
                        {selectedLevelData.objectives.map(
                          (objective, index) => (
                            <li key={index} className="flex items-start">
                              <Target className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                              {objective}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-medium text-green-900 mb-2">
                        필수 어휘
                      </h3>
                      <div className="text-sm text-green-700">
                        {selectedLevelData.vocabulary.join(", ")}
                      </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="font-medium text-purple-900 mb-2">
                        기본 표현
                      </h3>
                      <ul className="text-sm text-purple-700 space-y-1">
                        {selectedLevelData.expressions.map(
                          (expression, index) => (
                            <li key={index} className="flex items-start">
                              <MessageSquare className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                              {expression}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Curriculum Items */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    학습 항목
                  </h3>
                  <div className="space-y-4">
                    {selectedSubLevelData.items.map((item) => (
                      <div
                        key={item.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            {item.status === "completed" ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : item.status === "continued" ? (
                              <Clock className="w-5 h-5 text-yellow-500" />
                            ) : (
                              <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                            )}
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {item.title}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {item.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : item.status === "continued"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {item.status === "completed"
                                ? "설명 완료"
                                : item.status === "continued"
                                  ? "다음 시간에 계속"
                                  : "미설명"}
                            </span>
                            {item.explanationCount > 0 && (
                              <span className="text-xs text-gray-500">
                                {item.explanationCount}회 설명
                              </span>
                            )}
                          </div>
                        </div>

                        {item.examples.length > 0 && (
                          <div className="bg-gray-50 p-3 rounded-lg mb-3">
                            <h5 className="font-medium text-gray-700 mb-2">
                              예시
                            </h5>
                            <div className="text-sm text-gray-600">
                              {item.examples.join(", ")}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                handleItemStatusChange(item.id, "completed")
                              }
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                            >
                              설명 완료
                            </button>
                            <button
                              onClick={() =>
                                handleItemStatusChange(item.id, "continued")
                              }
                              className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
                            >
                              다음 시간에 계속
                            </button>
                            <button
                              onClick={() =>
                                handleItemStatusChange(item.id, "skipped")
                              }
                              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                            >
                              미설명
                            </button>
                          </div>
                          <button className="text-blue-600 hover:text-blue-800 text-sm">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">레벨을 선택해주세요</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Level Modal */}
      {showAddLevel && (
        <AddLevelModal
          onClose={() => setShowAddLevel(false)}
          onAdd={addLevel}
        />
      )}

      {/* Add SubLevel Modal */}
      {showAddSubLevel && (
        <AddSubLevelModal
          onClose={() => setShowAddSubLevel(false)}
          onAdd={addSubLevel}
        />
      )}

      {/* Add Item Modal */}
      {showAddItem && (
        <AddItemModal onClose={() => setShowAddItem(false)} onAdd={addItem} />
      )}

      {/* Student Selector Modal */}
      {showStudentSelector && (
        <StudentSelectorModal
          students={currentStudents}
          allStudents={students}
          selectedStudent={selectedStudent}
          onSelect={setSelectedStudent}
          onClose={() => setShowStudentSelector(false)}
        />
      )}
    </div>
  );
}

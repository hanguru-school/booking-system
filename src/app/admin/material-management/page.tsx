"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Image,
  Volume2,
  Video,
  Plus,
  Search,
  Filter,
  Upload,
  CheckCircle,
  Eye,
  Edit,
  MessageSquare,
  Target,
  ChevronRight,
  Play,
  Pause,
} from "lucide-react";

interface Material {
  id: string;
  title: string;
  type: "text" | "image" | "audio" | "video";
  content: string;
  url?: string;
  level: string;
  subLevel: string;
  pages: MaterialPage[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  teacherNotes?: string;
  linkedHomework?: string[];
  viewCount: number;
  usageCount: number;
}

interface MaterialPage {
  id: string;
  pageNumber: number;
  title: string;
  content: string;
  url?: string;
  isChecked: boolean;
  viewDate?: string;
  isUsedInClass: boolean;
  teacherNotes?: string;
  linkedHomework?: string[];
  studentProgress: StudentProgress[];
}

interface StudentProgress {
  studentId: string;
  studentName: string;
  isViewed: boolean;
  viewDate?: string;
  isCompleted: boolean;
  completionDate?: string;
  homeworkCompleted: boolean;
  homeworkScore?: number;
}

interface Homework {
  id: string;
  title: string;
  type: "quiz" | "writing" | "listening" | "speaking" | "reading";
  content: string;
  materialId: string;
  pageId?: string;
  isActive: boolean;
  completionRate: number;
  averageScore: number;
}

interface Student {
  id: string;
  name: string;
  level: string;
  subLevel: string;
  materials: string[];
}

export default function MaterialManagementPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null,
  );
  const [selectedPage, setSelectedPage] = useState<MaterialPage | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showHomeworkModal, setShowHomeworkModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterType, setFilterType] = useState("");
  const [activeTab, setActiveTab] = useState<
    "materials" | "progress" | "homework"
  >("materials");
  const [isLoading, setIsLoading] = useState(true);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

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
          materials: ["MAT001", "MAT002"],
        },
        {
          id: "STU002",
          name: "이학생",
          level: "B",
          subLevel: "1",
          materials: ["MAT001"],
        },
        {
          id: "STU003",
          name: "박학생",
          level: "A",
          subLevel: "3",
          materials: ["MAT001", "MAT002", "MAT003"],
        },
      ];

      const mockMaterials: Material[] = [
        {
          id: "MAT001",
          title: "기본 인사말과 자기소개",
          type: "text",
          content: "한국어의 기본적인 인사말과 자기소개 방법을 학습합니다.",
          level: "A",
          subLevel: "1",
          pages: [
            {
              id: "PAGE001",
              pageNumber: 1,
              title: "기본 인사말",
              content: "안녕하세요, 만나서 반갑습니다.",
              isChecked: true,
              viewDate: "2024-01-15",
              isUsedInClass: true,
              teacherNotes: "발음에 주의 필요",
              linkedHomework: ["HW001"],
              studentProgress: [
                {
                  studentId: "STU001",
                  studentName: "김학생",
                  isViewed: true,
                  viewDate: "2024-01-15",
                  isCompleted: true,
                  completionDate: "2024-01-15",
                  homeworkCompleted: true,
                  homeworkScore: 85,
                },
                {
                  studentId: "STU002",
                  studentName: "이학생",
                  isViewed: true,
                  viewDate: "2024-01-14",
                  isCompleted: false,
                  homeworkCompleted: false,
                },
              ],
            },
            {
              id: "PAGE002",
              pageNumber: 2,
              title: "자기소개",
              content: "저는 한국어를 배우고 있습니다.",
              url: "/audio/self-intro.mp3",
              isChecked: true,
              viewDate: "2024-01-15",
              isUsedInClass: false,
              teacherNotes: "음성 파일과 함께 학습",
              linkedHomework: ["HW002"],
              studentProgress: [
                {
                  studentId: "STU001",
                  studentName: "김학생",
                  isViewed: true,
                  viewDate: "2024-01-15",
                  isCompleted: true,
                  completionDate: "2024-01-15",
                  homeworkCompleted: true,
                  homeworkScore: 90,
                },
              ],
            },
          ],
          isActive: true,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-15",
          teacherNotes: "전체적으로 발음과 억양에 주의가 필요합니다.",
          linkedHomework: ["HW001", "HW002"],
          viewCount: 15,
          usageCount: 8,
        },
        {
          id: "MAT002",
          title: "일상 대화",
          type: "text",
          content: "일상적인 대화 표현을 학습합니다.",
          level: "A",
          subLevel: "2",
          pages: [
            {
              id: "PAGE003",
              pageNumber: 1,
              title: "날씨에 대한 대화",
              content: "오늘 날씨가 좋네요.",
              isChecked: false,
              isUsedInClass: false,
              studentProgress: [],
            },
          ],
          isActive: true,
          createdAt: "2024-01-10",
          updatedAt: "2024-01-10",
          viewCount: 5,
          usageCount: 2,
        },
      ];

      const mockHomework: Homework[] = [
        {
          id: "HW001",
          title: "기본 인사말 연습",
          type: "speaking",
          content: "기본 인사말을 연습해보세요.",
          materialId: "MAT001",
          pageId: "PAGE001",
          isActive: true,
          completionRate: 75,
          averageScore: 82,
        },
        {
          id: "HW002",
          title: "자기소개 작성",
          type: "writing",
          content: "자기소개를 작성해보세요.",
          materialId: "MAT001",
          pageId: "PAGE002",
          isActive: true,
          completionRate: 60,
          averageScore: 78,
        },
      ];

      setMaterials(mockMaterials);
      setStudents(mockStudents);
      setHomework(mockHomework);
      setIsLoading(false);
    };

    initializeData();
  }, []);

  const handleMaterialCheck = (materialId: string, pageId: string) => {
    setMaterials((prev) =>
      prev.map((material) =>
        material.id === materialId
          ? {
              ...material,
              pages: material.pages.map((page) =>
                page.id === pageId
                  ? { ...page, isChecked: !page.isChecked }
                  : page,
              ),
            }
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

  const getFilteredMaterials = () => {
    let filtered = materials;

    if (searchTerm) {
      filtered = filtered.filter(
        (material) =>
          material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          material.content.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (filterLevel) {
      filtered = filtered.filter((material) => material.level === filterLevel);
    }

    if (filterType) {
      filtered = filtered.filter((material) => material.type === filterType);
    }

    return filtered;
  };

  const getMaterialProgress = (material: Material) => {
    const totalPages = material.pages.length;
    const checkedPages = material.pages.filter((page) => page.isChecked).length;
    return totalPages > 0 ? Math.round((checkedPages / totalPages) * 100) : 0;
  };

  const getStudentProgress = (material: Material) => {
    const totalStudents = students.filter((student) =>
      student.materials.includes(material.id),
    ).length;

    if (totalStudents === 0) return 0;

    const completedStudents = material.pages.reduce((total, page) => {
      return (
        total +
        page.studentProgress.filter((progress) => progress.isCompleted).length
      );
    }, 0);

    return Math.round(
      (completedStudents / (totalStudents * material.pages.length)) * 100,
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">자료 관리 시스템을 불러오는 중...</p>
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
                자료 관리 시스템
              </h1>
              <p className="text-gray-600">
                자료 진도 확인 및 메모 관리, 숙제 자동 연동
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                자료 추가
              </button>
              <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Upload className="w-4 h-4 mr-2" />
                일괄 업로드
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("materials")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "materials"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                자료 관리
              </button>
              <button
                onClick={() => setActiveTab("progress")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "progress"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                진도 확인
              </button>
              <button
                onClick={() => setActiveTab("homework")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "homework"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                숙제 연동
              </button>
            </nav>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                검색
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="자료 제목 또는 내용 검색"
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                레벨
              </label>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">전체 레벨</option>
                <option value="A">A 레벨</option>
                <option value="B">B 레벨</option>
                <option value="C">C 레벨</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                유형
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">전체 유형</option>
                <option value="text">텍스트</option>
                <option value="image">이미지</option>
                <option value="audio">오디오</option>
                <option value="video">비디오</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                <Filter className="w-4 h-4 mr-2 inline" />
                필터 적용
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {activeTab === "materials" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Materials List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    자료 목록
                  </h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {getFilteredMaterials().map((material) => (
                    <div
                      key={material.id}
                      className="p-6 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedMaterial(material)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {material.type === "text" && (
                              <FileText className="w-4 h-4 text-blue-500" />
                            )}
                            {material.type === "image" && (
                              <Image className="w-4 h-4 text-green-500" />
                            )}
                            {material.type === "audio" && (
                              <Volume2 className="w-4 h-4 text-purple-500" />
                            )}
                            {material.type === "video" && (
                              <Video className="w-4 h-4 text-red-500" />
                            )}
                            <h3 className="font-medium text-gray-900">
                              {material.title}
                            </h3>
                            {material.teacherNotes && (
                              <MessageSquare className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {material.content}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>
                              레벨 {material.level}-{material.subLevel}
                            </span>
                            <span>페이지 {material.pages.length}개</span>
                            <span>조회 {material.viewCount}회</span>
                            <span>사용 {material.usageCount}회</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {getMaterialProgress(material)}%
                            </div>
                            <div className="text-xs text-gray-500">진도율</div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Material Detail */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    자료 상세
                  </h2>
                </div>
                <div className="p-6">
                  {selectedMaterial ? (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4">
                        {selectedMaterial.title}
                      </h3>

                      {/* Pages */}
                      <div className="space-y-3 mb-6">
                        <h4 className="text-sm font-medium text-gray-700">
                          페이지 목록
                        </h4>
                        {selectedMaterial.pages.map((page) => (
                          <div key={page.id} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={page.isChecked}
                                  onChange={() =>
                                    handleMaterialCheck(
                                      selectedMaterial.id,
                                      page.id,
                                    )
                                  }
                                  className="rounded"
                                />
                                <span className="text-sm font-medium">
                                  {page.title}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                {page.isUsedInClass && (
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    수업 사용
                                  </span>
                                )}
                                {page.teacherNotes && (
                                  <MessageSquare className="w-4 h-4 text-yellow-500" />
                                )}
                                {page.url && (
                                  <button
                                    onClick={() => handleAudioPlay(page.url!)}
                                    className="p-1 hover:bg-gray-100 rounded"
                                  >
                                    {isPlaying && currentAudio === page.url ? (
                                      <Pause className="w-4 h-4" />
                                    ) : (
                                      <Play className="w-4 h-4" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-gray-600">
                              {page.content}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Teacher Notes */}
                      {selectedMaterial.teacherNotes && (
                        <div className="mb-6">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            선생님 메모
                          </h4>
                          <div className="bg-yellow-50 rounded-lg p-3">
                            <p className="text-sm text-gray-700">
                              {selectedMaterial.teacherNotes}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="space-y-2">
                        <button
                          onClick={() => setShowEditModal(true)}
                          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          수정
                        </button>
                        <button
                          onClick={() => setShowNoteModal(true)}
                          className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          메모 추가
                        </button>
                        <button
                          onClick={() => setShowHomeworkModal(true)}
                          className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                          <Target className="w-4 h-4 mr-2" />
                          숙제 연동
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      자료를 선택해주세요
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "progress" && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              학생별 자료 진도
            </h2>
            <div className="space-y-6">
              {materials.map((material) => (
                <div key={material.id} className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">
                      {material.title}
                    </h3>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {getStudentProgress(material)}%
                      </div>
                      <div className="text-xs text-gray-500">학생 완료율</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {students
                      .filter((student) =>
                        student.materials.includes(material.id),
                      )
                      .map((student) => (
                        <div
                          key={student.id}
                          className="bg-gray-50 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {student.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                레벨 {student.level}-{student.subLevel}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">
                                {material.pages.reduce((total, page) => {
                                  const progress = page.studentProgress.find(
                                    (p) => p.studentId === student.id,
                                  );
                                  return (
                                    total + (progress?.isCompleted ? 1 : 0)
                                  );
                                }, 0)}{" "}
                                / {material.pages.length}
                              </div>
                              <div className="text-xs text-gray-500">
                                완료 페이지
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {material.pages.map((page) => {
                              const progress = page.studentProgress.find(
                                (p) => p.studentId === student.id,
                              );
                              return (
                                <div
                                  key={page.id}
                                  className="flex items-center justify-between text-sm"
                                >
                                  <span className="text-gray-700">
                                    {page.title}
                                  </span>
                                  <div className="flex items-center space-x-2">
                                    {progress?.isViewed && (
                                      <Eye className="w-4 h-4 text-blue-500" />
                                    )}
                                    {progress?.isCompleted && (
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                    )}
                                    {progress?.homeworkCompleted && (
                                      <Target className="w-4 h-4 text-purple-500" />
                                    )}
                                    {progress?.homeworkScore && (
                                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        {progress.homeworkScore}점
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "homework" && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              자료 기반 숙제 연동
            </h2>
            <div className="space-y-6">
              {homework.map((hw) => {
                const material = materials.find((m) => m.id === hw.materialId);
                return (
                  <div key={hw.id} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {hw.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          📘 {material?.title} | {hw.type} 유형
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {hw.completionRate}%
                        </div>
                        <div className="text-xs text-gray-500">완료율</div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        숙제 내용
                      </h4>
                      <p className="text-sm text-gray-600">{hw.content}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>평균 점수: {hw.averageScore}점</span>
                        <span>연동 자료: {material?.title}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                          수정
                        </button>
                        <button className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add Material Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                자료 추가
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    제목
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="자료 제목을 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    유형
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="text">텍스트</option>
                    <option value="image">이미지</option>
                    <option value="audio">오디오</option>
                    <option value="video">비디오</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    레벨
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                    </select>
                    <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    내용
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="자료 내용을 입력하세요"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  취소
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  추가
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

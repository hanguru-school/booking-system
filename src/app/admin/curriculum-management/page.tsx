"use client";

import { Plus, Search, FileText, Target, Edit, Eye, X } from "lucide-react";
import { useState, useEffect } from "react";
interface Curriculum {
  id: string;
  level: string;
  name: string;
  description: string;
  mainGoals: string[];
  requiredSentences: string[];
  requiredWords: string[];
  isActive: boolean;
  itemCount: number;
  studentCount: number;
  createdAt: string;
}

interface CurriculumItem {
  id: string;
  category: string;
  title: string;
  description: string;
  tags: string[];
  estimatedTime: number;
  isRequired: boolean;
  order: number;
  isActive: boolean;
}

export default function AdminCurriculumManagementPage() {
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [selectedCurriculum, setSelectedCurriculum] =
    useState<Curriculum | null>(null);
  const [curriculumItems, setCurriculumItems] = useState<CurriculumItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  // 폼 상태
  const [formData, setFormData] = useState({
    level: "",
    name: "",
    description: "",
    mainGoals: [""],
    requiredSentences: [""],
    requiredWords: [""],
  });

  const [itemFormData, setItemFormData] = useState({
    category: "",
    title: "",
    description: "",
    tags: [""],
    estimatedTime: 30,
    isRequired: true,
    order: 1,
  });

  useEffect(() => {
    // 실제 API 호출로 대체
    setTimeout(() => {
      const mockCurriculums: Curriculum[] = [
        {
          id: "1",
          level: "A-1",
          name: "한글 기초",
          description: "한글 자음과 모음의 기본 학습",
          mainGoals: [
            "한글 자음 14개 완전히 익히기",
            "한글 모음 10개 완전히 익히기",
          ],
          requiredSentences: ["안녕하세요", "감사합니다"],
          requiredWords: ["사람", "학교", "집"],
          isActive: true,
          itemCount: 8,
          studentCount: 12,
          createdAt: "2024-01-01",
        },
        {
          id: "2",
          level: "A-2",
          name: "한글 읽기",
          description: "기본 단어와 문장 읽기 연습",
          mainGoals: ["기본 단어 읽기", "간단한 문장 구성"],
          requiredSentences: ["이름이 뭐예요?", "어디에 살아요?"],
          requiredWords: ["친구", "선생님", "학생"],
          isActive: true,
          itemCount: 12,
          studentCount: 8,
          createdAt: "2024-01-01",
        },
        {
          id: "3",
          level: "B-1",
          name: "기본 문법",
          description: "조사와 기본 문법 학습",
          mainGoals: ["조사 사용법 익히기", "기본 문장 만들기"],
          requiredSentences: ["저는 학생입니다", "한국어를 공부합니다"],
          requiredWords: ["공부", "일", "시간"],
          isActive: false,
          itemCount: 15,
          studentCount: 5,
          createdAt: "2024-01-01",
        },
      ];

      setCurriculums(mockCurriculums);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (selectedCurriculum) {
      // 실제 API 호출로 대체
      const mockItems: CurriculumItem[] = [
        {
          id: "1",
          category: "한글 읽기",
          title: "자음과 모음 복습",
          description: "기본 자음 14개, 모음 10개를 완전히 익히고 발음 연습",
          tags: ["발음", "기초"],
          estimatedTime: 15,
          isRequired: true,
          order: 1,
          isActive: true,
        },
        {
          id: "2",
          category: "단어 학습",
          title: "기본 단어 20개",
          description: "일상생활에서 자주 사용하는 기본 단어 학습",
          tags: ["단어", "일상"],
          estimatedTime: 20,
          isRequired: true,
          order: 2,
          isActive: true,
        },
      ];
      setCurriculumItems(mockItems);
    }
  }, [selectedCurriculum]);

  const filteredCurriculums = curriculums.filter((curriculum) => {
    const matchesSearch =
      curriculum.level.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curriculum.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curriculum.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && curriculum.isActive) ||
      (statusFilter === "inactive" && !curriculum.isActive);

    return matchesSearch && matchesStatus;
  });

  const handleCreateCurriculum = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 실제 API 호출로 대체
      const newCurriculum: Curriculum = {
        id: Date.now().toString(),
        level: formData.level,
        name: formData.name,
        description: formData.description,
        mainGoals: formData.mainGoals.filter((goal) => goal.trim()),
        requiredSentences: formData.requiredSentences.filter((sentence) =>
          sentence.trim(),
        ),
        requiredWords: formData.requiredWords.filter((word) => word.trim()),
        isActive: true,
        itemCount: 0,
        studentCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
      };

      setCurriculums([...curriculums, newCurriculum]);
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error("커리큘럼 생성 오류:", error);
    }
  };

  const handleUpdateCurriculum = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCurriculum) return;

    try {
      // 실제 API 호출로 대체
      const updatedCurriculums = curriculums.map((curriculum) =>
        curriculum.id === selectedCurriculum.id
          ? {
              ...curriculum,
              level: formData.level,
              name: formData.name,
              description: formData.description,
              mainGoals: formData.mainGoals.filter((goal) => goal.trim()),
              requiredSentences: formData.requiredSentences.filter((sentence) =>
                sentence.trim(),
              ),
              requiredWords: formData.requiredWords.filter((word) =>
                word.trim(),
              ),
            }
          : curriculum,
      );

      setCurriculums(updatedCurriculums);
      setShowEditModal(false);
      resetForm();
    } catch (error) {
      console.error("커리큘럼 수정 오류:", error);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 실제 API 호출로 대체
      const newItem: CurriculumItem = {
        id: Date.now().toString(),
        category: itemFormData.category,
        title: itemFormData.title,
        description: itemFormData.description,
        tags: itemFormData.tags.filter((tag) => tag.trim()),
        estimatedTime: itemFormData.estimatedTime,
        isRequired: itemFormData.isRequired,
        order: curriculumItems.length + 1,
        isActive: true,
      };

      setCurriculumItems([...curriculumItems, newItem]);
      setShowItemModal(false);
      resetItemForm();
    } catch (error) {
      console.error("학습 항목 생성 오류:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      level: "",
      name: "",
      description: "",
      mainGoals: [""],
      requiredSentences: [""],
      requiredWords: [""],
    });
  };

  const resetItemForm = () => {
    setItemFormData({
      category: "",
      title: "",
      description: "",
      tags: [""],
      estimatedTime: 30,
      isRequired: true,
      order: 1,
    });
  };

  const openEditModal = (curriculum: Curriculum) => {
    setSelectedCurriculum(curriculum);
    setFormData({
      level: curriculum.level,
      name: curriculum.name,
      description: curriculum.description,
      mainGoals: [...curriculum.mainGoals, ""],
      requiredSentences: [...curriculum.requiredSentences, ""],
      requiredWords: [...curriculum.requiredWords, ""],
    });
    setShowEditModal(true);
  };

  const addArrayField = (
    field: "mainGoals" | "requiredSentences" | "requiredWords",
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayField = (
    field: "mainGoals" | "requiredSentences" | "requiredWords",
    index: number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const updateArrayField = (
    field: "mainGoals" | "requiredSentences" | "requiredWords",
    index: number,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            커리큘럼 관리
          </h1>
          <p className="text-lg text-gray-600">
            레벨별 커리큘럼과 학습 항목을 관리하세요
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />새 커리큘럼 생성
        </button>
      </div>

      {/* 필터 및 검색 */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="레벨, 이름, 설명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | "active" | "inactive")
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">전체 상태</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
          </select>
        </div>
      </div>

      {/* 커리큘럼 목록 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCurriculums.map((curriculum) => (
          <div
            key={curriculum.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {curriculum.level}
                  </h3>
                  <p className="text-lg font-medium text-gray-700">
                    {curriculum.name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      curriculum.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {curriculum.isActive ? "활성" : "비활성"}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 mb-4">{curriculum.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-600">학습 항목</span>
                  <span className="font-medium">{curriculum.itemCount}개</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600">수강 학생</span>
                  <span className="font-medium">
                    {curriculum.studentCount}명
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedCurriculum(curriculum);
                    setShowItemModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  항목 추가
                </button>
                <button
                  onClick={() => openEditModal(curriculum)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 커리큘럼 생성 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              새 커리큘럼 생성
            </h3>

            <form onSubmit={handleCreateCurriculum}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    레벨
                  </label>
                  <input
                    type="text"
                    value={formData.level}
                    onChange={(e) =>
                      setFormData({ ...formData, level: e.target.value })
                    }
                    placeholder="예: A-1, B-2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    이름
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="커리큘럼 이름"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  설명
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="커리큘럼에 대한 설명"
                  className="w-full h-20 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              {/* 주요 목표 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  주요 목표
                </label>
                {formData.mainGoals.map((goal, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={goal}
                      onChange={(e) =>
                        updateArrayField("mainGoals", index, e.target.value)
                      }
                      placeholder="학습 목표"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayField("mainGoals", index)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField("mainGoals")}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  + 목표 추가
                </button>
              </div>

              {/* 필수 문장 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  필수 문장
                </label>
                {formData.requiredSentences.map((sentence, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={sentence}
                      onChange={(e) =>
                        updateArrayField(
                          "requiredSentences",
                          index,
                          e.target.value,
                        )
                      }
                      placeholder="필수 문장"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        removeArrayField("requiredSentences", index)
                      }
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField("requiredSentences")}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  + 문장 추가
                </button>
              </div>

              {/* 필수 단어 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  필수 단어
                </label>
                {formData.requiredWords.map((word, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={word}
                      onChange={(e) =>
                        updateArrayField("requiredWords", index, e.target.value)
                      }
                      placeholder="필수 단어"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayField("requiredWords", index)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField("requiredWords")}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  + 단어 추가
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  생성
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 학습 항목 추가 모달 */}
      {showItemModal && selectedCurriculum && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedCurriculum.level} - 학습 항목 추가
            </h3>

            <form onSubmit={handleCreateItem}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    카테고리
                  </label>
                  <input
                    type="text"
                    value={itemFormData.category}
                    onChange={(e) =>
                      setItemFormData({
                        ...itemFormData,
                        category: e.target.value,
                      })
                    }
                    placeholder="예: 한글 읽기, 문법, 회화"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    제목
                  </label>
                  <input
                    type="text"
                    value={itemFormData.title}
                    onChange={(e) =>
                      setItemFormData({
                        ...itemFormData,
                        title: e.target.value,
                      })
                    }
                    placeholder="학습 항목 제목"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  설명
                </label>
                <textarea
                  value={itemFormData.description}
                  onChange={(e) =>
                    setItemFormData({
                      ...itemFormData,
                      description: e.target.value,
                    })
                  }
                  placeholder="학습 항목에 대한 상세 설명"
                  className="w-full h-20 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    예상 시간 (분)
                  </label>
                  <input
                    type="number"
                    value={itemFormData.estimatedTime}
                    onChange={(e) =>
                      setItemFormData({
                        ...itemFormData,
                        estimatedTime: parseInt(e.target.value),
                      })
                    }
                    min="5"
                    max="120"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isRequired"
                    checked={itemFormData.isRequired}
                    onChange={(e) =>
                      setItemFormData({
                        ...itemFormData,
                        isRequired: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="isRequired"
                    className="text-sm font-medium text-gray-900"
                  >
                    필수 학습 항목
                  </label>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  태그
                </label>
                {itemFormData.tags.map((tag, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => {
                        const newTags = [...itemFormData.tags];
                        newTags[index] = e.target.value;
                        setItemFormData({ ...itemFormData, tags: newTags });
                      }}
                      placeholder="태그"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newTags = itemFormData.tags.filter(
                          (_, i) => i !== index,
                        );
                        setItemFormData({ ...itemFormData, tags: newTags });
                      }}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setItemFormData({
                      ...itemFormData,
                      tags: [...itemFormData.tags, ""],
                    })
                  }
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  + 태그 추가
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowItemModal(false);
                    resetItemForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  추가
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

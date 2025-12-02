"use client";

import { useState, useEffect } from "react";
import {
  Folder,
  FileText,
  Video,
  Image,
  Download,
  Upload,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Home,
} from "lucide-react";
import Link from "next/link";

interface Material {
  id: string;
  title: string;
  description: string;
  type: "document" | "video" | "image" | "audio" | "other";
  category: string;
  level: string;
  fileSize: string;
  uploadDate: string;
  downloadCount: number;
  isPublic: boolean;
  tags: string[];
}

export default function TeacherMaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<
    "all" | "document" | "video" | "image" | "audio" | "other"
  >("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    // 실제 API 호출로 대체
    setTimeout(() => {
      const mockMaterials: Material[] = [
        {
          id: "1",
          title: "한국어 기초 문법 교재",
          description: "한국어를 처음 배우는 학생을 위한 기초 문법 교재",
          type: "document",
          category: "문법",
          level: "A-1",
          fileSize: "2.5MB",
          uploadDate: "2024-01-10",
          downloadCount: 45,
          isPublic: true,
          tags: ["기초", "문법", "교재"],
        },
        {
          id: "2",
          title: "발음 연습 비디오",
          description: "한국어 자음과 모음 발음 연습을 위한 비디오 자료",
          type: "video",
          category: "발음",
          level: "A-1",
          fileSize: "15.2MB",
          uploadDate: "2024-01-08",
          downloadCount: 32,
          isPublic: true,
          tags: ["발음", "비디오", "연습"],
        },
        {
          id: "3",
          title: "일상 회화 패턴",
          description: "일상적인 대화에서 사용하는 기본 패턴 모음",
          type: "document",
          category: "회화",
          level: "A-2",
          fileSize: "1.8MB",
          uploadDate: "2024-01-05",
          downloadCount: 28,
          isPublic: true,
          tags: ["회화", "패턴", "일상"],
        },
        {
          id: "4",
          title: "중급 문법 연습문제",
          description: "중급 문법 학습을 위한 연습문제 모음",
          type: "document",
          category: "문법",
          level: "B-1",
          fileSize: "3.1MB",
          uploadDate: "2024-01-03",
          downloadCount: 19,
          isPublic: false,
          tags: ["중급", "문법", "연습문제"],
        },
        {
          id: "5",
          title: "한국 문화 소개 이미지",
          description: "한국 문화를 소개하는 이미지 자료 모음",
          type: "image",
          category: "문화",
          level: "A-2",
          fileSize: "8.7MB",
          uploadDate: "2024-01-01",
          downloadCount: 56,
          isPublic: true,
          tags: ["문화", "이미지", "소개"],
        },
      ];

      setMaterials(mockMaterials);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesType = typeFilter === "all" || material.type === typeFilter;
    const matchesCategory =
      categoryFilter === "all" || material.category === categoryFilter;

    return matchesSearch && matchesType && matchesCategory;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "document":
        return <FileText className="w-5 h-5" />;
      case "video":
        return <Video className="w-5 h-5" />;
      case "image":
        return <Image className="w-5 h-5" />;
      case "audio":
        return <Video className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "document":
        return "bg-blue-100 text-blue-800";
      case "video":
        return "bg-red-100 text-red-800";
      case "image":
        return "bg-green-100 text-green-800";
      case "audio":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "document":
        return "문서";
      case "video":
        return "비디오";
      case "image":
        return "이미지";
      case "audio":
        return "오디오";
      default:
        return "기타";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">학습 자료</h1>
            <p className="text-lg text-gray-600">
              수업에 필요한 학습 자료를 관리하세요
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-5 h-5" />
              자료 업로드
            </button>
            <Link
              href="/teacher/home"
              className="flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Home className="w-5 h-5" />
              선생님 홈
            </Link>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">총 자료</p>
                <p className="text-2xl font-bold text-gray-900">
                  {materials.length}개
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Folder className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">문서</p>
                <p className="text-2xl font-bold text-blue-600">
                  {materials.filter((m) => m.type === "document").length}개
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">비디오</p>
                <p className="text-2xl font-bold text-red-600">
                  {materials.filter((m) => m.type === "video").length}개
                </p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <Video className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">총 다운로드</p>
                <p className="text-2xl font-bold text-green-600">
                  {materials.reduce((sum, m) => sum + m.downloadCount, 0)}회
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Download className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="자료명, 설명, 태그 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(
                  e.target.value as
                    | "all"
                    | "document"
                    | "video"
                    | "image"
                    | "audio"
                    | "other",
                )
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">전체 유형</option>
              <option value="document">문서</option>
              <option value="video">비디오</option>
              <option value="image">이미지</option>
              <option value="audio">오디오</option>
              <option value="other">기타</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">전체 카테고리</option>
              <option value="문법">문법</option>
              <option value="회화">회화</option>
              <option value="발음">발음</option>
              <option value="문화">문화</option>
            </select>

            <div className="text-sm text-gray-600">
              총 {filteredMaterials.length}개의 자료
            </div>
          </div>
        </div>

        {/* 자료 목록 */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">자료 목록</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredMaterials.map((material) => (
              <div key={material.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className={`p-3 rounded-lg ${getTypeColor(material.type)}`}
                    >
                      {getTypeIcon(material.type)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {material.title}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(material.type)}`}
                        >
                          {getTypeText(material.type)}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                          {material.level}
                        </span>
                        {material.isPublic ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            공개
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            비공개
                          </span>
                        )}
                      </div>

                      <p className="text-gray-600 mb-2">
                        {material.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                        <span>카테고리: {material.category}</span>
                        <span>크기: {material.fileSize}</span>
                        <span>
                          업로드:{" "}
                          {new Date(material.uploadDate).toLocaleDateString()}
                        </span>
                        <span>다운로드: {material.downloadCount}회</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {material.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 자료 업로드 모달 */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  자료 업로드
                </h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    자료명
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="자료명을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    설명
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="자료에 대한 설명을 입력하세요"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      카테고리
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="">카테고리 선택</option>
                      <option value="문법">문법</option>
                      <option value="회화">회화</option>
                      <option value="발음">발음</option>
                      <option value="문화">문화</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      레벨
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="">레벨 선택</option>
                      <option value="A-1">A-1 (기초)</option>
                      <option value="A-2">A-2 (초급)</option>
                      <option value="B-1">B-1 (중급)</option>
                      <option value="B-2">B-2 (고급)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    파일 선택
                  </label>
                  <input
                    type="file"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isPublic" className="text-sm text-gray-700">
                    공개 자료로 설정
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    // 업로드 로직
                    setShowUploadModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  업로드
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

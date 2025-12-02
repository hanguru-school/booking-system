"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  Star,
  MessageSquare,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  FileText,
  Video,
  Building,
  MapPin,
} from "lucide-react";

interface ClassHistory {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  studentName: string;
  courseName: string;
  location: string;
  duration: number;
  notes?: string;
  review?: {
    rating: number;
    content: string;
    date: string;
    studentResponse?: string;
  };
  materials?: string[];
  zoomLink?: string;
}

export default function TeacherHistoryPage() {
  const [classes, setClasses] = useState<ClassHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "with-review" | "without-review"
  >("all");
  const [selectedClass, setSelectedClass] = useState<ClassHistory | null>(null);
  const [showClassModal, setShowClassModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    loadClassHistory();
  }, []);

  const loadClassHistory = async () => {
    try {
      setLoading(true);
      // 실제 API 호출로 대체
      const mockClasses: ClassHistory[] = [
        {
          id: "1",
          date: "2024-01-15",
          startTime: "09:00",
          endTime: "09:40",
          studentName: "김학생",
          courseName: "초급 회화",
          location: "온라인",
          duration: 40,
          notes: "일상 대화 연습, 발음 개선 필요",
          review: {
            rating: 5,
            content:
              "매우 만족스러운 수업이었습니다. 선생님이 친절하고 이해하기 쉽게 설명해주셔서 좋았습니다.",
            date: "2024-01-15",
            studentResponse: "감사합니다! 다음 수업도 기대하겠습니다.",
          },
          zoomLink: "https://zoom.us/j/123456789",
        },
        {
          id: "2",
          date: "2024-01-14",
          startTime: "10:00",
          endTime: "10:40",
          studentName: "이학생",
          courseName: "중급 문법",
          location: "대면",
          duration: 40,
          notes: "문법 설명 후 실습, 숙제 확인",
          review: {
            rating: 4,
            content: "문법 설명이 명확했고, 실습도 충분히 했습니다.",
            date: "2024-01-14",
          },
        },
        {
          id: "3",
          date: "2024-01-13",
          startTime: "14:00",
          endTime: "14:40",
          studentName: "박학생",
          courseName: "고급 토론",
          location: "온라인",
          duration: 40,
          notes: "토론 주제: 환경 문제, 학생이 주도적으로 진행",
          materials: ["환경문제_토론자료.pdf", "토론_가이드라인.docx"],
        },
        {
          id: "4",
          date: "2024-01-12",
          startTime: "15:00",
          endTime: "15:40",
          studentName: "최학생",
          courseName: "초급 회화",
          location: "대면",
          duration: 40,
          notes: "기본 인사말과 자기소개 연습",
        },
      ];
      setClasses(mockClasses);
    } catch (error) {
      console.error("수업 이력 로드 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredClasses = () => {
    let filtered = classes;

    // 검색 필터
    if (searchTerm) {
      filtered = filtered.filter(
        (classItem) =>
          classItem.studentName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          classItem.courseName.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // 리뷰 필터
    if (statusFilter === "with-review") {
      filtered = filtered.filter((classItem) => classItem.review);
    } else if (statusFilter === "without-review") {
      filtered = filtered.filter((classItem) => !classItem.review);
    }

    return filtered;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  const formatTime = (time: string) => {
    return time;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ));
  };

  const filteredClasses = getFilteredClasses();
  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClasses = filteredClasses.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">수업 이력을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">수업 이력</h1>
            <p className="text-lg text-gray-600">
              완료된 수업 이력과 학생 리뷰를 확인하세요
            </p>
          </div>
        </div>

        {/* 필터 및 검색 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 검색 */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="학생 이름, 과목명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 리뷰 필터 */}
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as "all" | "with-review" | "without-review",
                )
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">전체 수업</option>
              <option value="with-review">리뷰 있는 수업</option>
              <option value="without-review">리뷰 없는 수업</option>
            </select>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {classes.length}
                </div>
                <div className="text-sm text-gray-600">총 수업 수</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {classes.filter((c) => c.review).length}
                </div>
                <div className="text-sm text-gray-600">리뷰 있는 수업</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <ThumbsUp className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {
                    classes.filter((c) => c.review && c.review.rating >= 4)
                      .length
                  }
                </div>
                <div className="text-sm text-gray-600">만족도 높은 수업</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {classes.reduce((total, c) => total + c.duration, 0)}분
                </div>
                <div className="text-sm text-gray-600">총 수업 시간</div>
              </div>
            </div>
          </div>
        </div>

        {/* 수업 이력 목록 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            수업 이력 ({filteredClasses.length}개)
          </h2>

          {currentClasses.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                수업 이력이 없습니다
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all"
                  ? "검색 조건에 맞는 수업이 없습니다."
                  : "완료된 수업이 없습니다."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentClasses.map((classItem) => (
                <div
                  key={classItem.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-gray-900">
                            {formatDate(classItem.date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-green-600" />
                          <span className="text-gray-700">
                            {formatTime(classItem.startTime)} -{" "}
                            {formatTime(classItem.endTime)} (
                            {classItem.duration}분)
                          </span>
                        </div>
                        {classItem.review && (
                          <div className="flex items-center gap-1">
                            {renderStars(classItem.review.rating)}
                            <span className="text-sm text-gray-600">
                              ({classItem.review.rating}/5)
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-purple-600" />
                          <span className="text-sm text-gray-600">학생:</span>
                          <span className="font-medium text-gray-900">
                            {classItem.studentName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-orange-600" />
                          <span className="text-sm text-gray-600">수업:</span>
                          <span className="font-medium text-gray-900">
                            {classItem.courseName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {classItem.location === "온라인" ? (
                            <Video className="w-4 h-4 text-green-600" />
                          ) : (
                            <Building className="w-4 h-4 text-green-600" />
                          )}
                          <span className="text-sm text-gray-600">방식:</span>
                          <span className="font-medium text-gray-900">
                            {classItem.location}
                          </span>
                        </div>
                      </div>

                      {classItem.notes && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            {classItem.notes}
                          </p>
                        </div>
                      )}

                      {/* 리뷰 표시 */}
                      {classItem.review && (
                        <div className="border-t border-gray-200 pt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-gray-900">
                              학생 리뷰
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatDate(classItem.review.date)}
                            </span>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              {renderStars(classItem.review.rating)}
                            </div>
                            <p className="text-sm text-gray-700 mb-2">
                              {classItem.review.content}
                            </p>
                            {classItem.review.studentResponse && (
                              <div className="border-t border-blue-200 pt-2 mt-2">
                                <p className="text-xs text-gray-500 mb-1">
                                  선생님 답변:
                                </p>
                                <p className="text-sm text-gray-700">
                                  {classItem.review.studentResponse}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 자료 표시 */}
                      {classItem.materials &&
                        classItem.materials.length > 0 && (
                          <div className="mt-4">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="w-4 h-4 text-green-600" />
                              <span className="font-medium text-gray-900">
                                수업 자료
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {classItem.materials.map((material, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs"
                                >
                                  {material}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedClass(classItem);
                          setShowClassModal(true);
                        }}
                        className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        상세보기
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span className="text-sm text-gray-600">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* 수업 상세 모달 */}
        {showClassModal && selectedClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  수업 상세 정보
                </h3>
                <button
                  onClick={() => setShowClassModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <div className="w-5 h-5">×</div>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="text-sm text-gray-600">수업 날짜</div>
                      <div className="font-medium text-gray-900">
                        {formatDate(selectedClass.date)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="text-sm text-gray-600">수업 시간</div>
                      <div className="font-medium text-gray-900">
                        {formatTime(selectedClass.startTime)} -{" "}
                        {formatTime(selectedClass.endTime)} (
                        {selectedClass.duration}분)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="text-sm text-gray-600">학생</div>
                      <div className="font-medium text-gray-900">
                        {selectedClass.studentName}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-orange-600" />
                    <div>
                      <div className="text-sm text-gray-600">수업</div>
                      <div className="font-medium text-gray-900">
                        {selectedClass.courseName}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedClass.notes && (
                  <div>
                    <div className="text-sm text-gray-600 mb-2">수업 노트</div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        {selectedClass.notes}
                      </p>
                    </div>
                  </div>
                )}

                {selectedClass.review && (
                  <div>
                    <div className="text-sm text-gray-600 mb-2">학생 리뷰</div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        {renderStars(selectedClass.review.rating)}
                        <span className="text-sm text-gray-600">
                          ({selectedClass.review.rating}/5)
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {selectedClass.review.content}
                      </p>
                      {selectedClass.review.studentResponse && (
                        <div className="border-t border-blue-200 pt-2 mt-2">
                          <p className="text-xs text-gray-500 mb-1">
                            선생님 답변:
                          </p>
                          <p className="text-sm text-gray-700">
                            {selectedClass.review.studentResponse}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedClass.materials &&
                  selectedClass.materials.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-600 mb-2">
                        수업 자료
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedClass.materials.map((material, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm"
                          >
                            {material}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowClassModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

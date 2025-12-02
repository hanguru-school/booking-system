"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  Search,
  MessageSquare,
  User,
  Send,
  CheckCircle,
} from "lucide-react";

interface Review {
  id: string;
  lessonId: string;
  studentId: string;
  teacherId: string;
  rating: number;
  comment: string;
  categories: {
    teaching: number;
    materials: number;
    communication: number;
    overall: number;
  };
  isPublic: boolean;
  isGoogleReview: boolean;
  createdAt: Date;
  adminResponse?: string;
  adminResponseDate?: Date;
  teacherResponse?: string;
  teacherResponseDate?: Date;
}

interface Lesson {
  id: string;
  title: string;
  teacherId: string;
  studentId: string;
  date: Date;
  duration: number;
  type: "online" | "offline";
  status: "completed" | "cancelled" | "no-show";
}

interface Student {
  id: string;
  name: string;
  level: string;
  email: string;
}

export default function TeacherReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState("");

  // Mock teacher ID - 실제 구현에서는 로그인된 선생님 ID 사용
  const currentTeacherId = "teacher1";

  useEffect(() => {
    initializeMockData();
  }, []);

  const initializeMockData = () => {
    const mockStudents: Student[] = [
      {
        id: "student1",
        name: "김학생",
        level: "A",
        email: "student1@example.com",
      },
      {
        id: "student2",
        name: "이학생",
        level: "B",
        email: "student2@example.com",
      },
      {
        id: "student3",
        name: "박학생",
        level: "C",
        email: "student3@example.com",
      },
    ];

    const mockLessons: Lesson[] = [
      {
        id: "lesson1",
        title: "중급 회화 수업",
        teacherId: "teacher1",
        studentId: "student1",
        date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        duration: 60,
        type: "online",
        status: "completed",
      },
      {
        id: "lesson2",
        title: "기초 문법 수업",
        teacherId: "teacher1",
        studentId: "student2",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        duration: 60,
        type: "offline",
        status: "completed",
      },
      {
        id: "lesson3",
        title: "고급 읽기 수업",
        teacherId: "teacher2", // 다른 선생님 수업
        studentId: "student3",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        duration: 90,
        type: "online",
        status: "completed",
      },
    ];

    const mockReviews: Review[] = [
      {
        id: "review1",
        lessonId: "lesson1",
        studentId: "student1",
        teacherId: "teacher1",
        rating: 5,
        comment:
          "매우 유익한 수업이었습니다. 선생님이 설명을 잘 해주셔서 이해하기 쉬웠어요.",
        categories: {
          teaching: 5,
          materials: 4,
          communication: 5,
          overall: 5,
        },
        isPublic: true,
        isGoogleReview: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        adminResponse:
          "좋은 피드백 감사합니다. 더 나은 수업을 위해 노력하겠습니다.",
        adminResponseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        teacherResponse:
          "열심히 공부하시는 모습이 보기 좋았습니다. 다음 수업에서도 좋은 성과 기대합니다!",
        teacherResponseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: "review2",
        lessonId: "lesson2",
        studentId: "student2",
        teacherId: "teacher1",
        rating: 4,
        comment: "기초부터 차근차근 설명해주셔서 좋았습니다.",
        categories: {
          teaching: 4,
          materials: 5,
          communication: 4,
          overall: 4,
        },
        isPublic: false,
        isGoogleReview: false,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
    ];

    setStudents(mockStudents);
    setLessons(mockLessons);
    setReviews(mockReviews);
  };

  // 현재 선생님의 리뷰만 필터링
  const teacherReviews = reviews.filter(
    (review) => review.teacherId === currentTeacherId,
  );

  const getStudentName = (studentId: string) => {
    return students.find((s) => s.id === studentId)?.name || "Unknown";
  };

  const getLessonTitle = (lessonId: string) => {
    return lessons.find((l) => l.id === lessonId)?.title || "Unknown";
  };

  const filteredReviews = teacherReviews.filter((review) => {
    const lesson = lessons.find((l) => l.id === review.lessonId);
    const student = students.find((s) => s.id === review.studentId);

    const matchesSearch =
      searchTerm === "" ||
      student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRating =
      selectedRating === 0 || review.rating === selectedRating;

    return matchesSearch && matchesRating;
  });

  const handleTeacherResponse = async () => {
    if (!selectedReview || !responseText.trim()) return;

    setLoading(true);

    // 실제 구현에서는 API 호출
    setReviews((prev) =>
      prev.map((review) =>
        review.id === selectedReview.id
          ? {
              ...review,
              teacherResponse: responseText,
              teacherResponseDate: new Date(),
            }
          : review,
      ),
    );

    setShowResponseModal(false);
    setSelectedReview(null);
    setResponseText("");
    setLoading(false);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const getAverageRating = () => {
    if (teacherReviews.length === 0) return 0;
    const total = teacherReviews.reduce(
      (sum, review) => sum + review.rating,
      0,
    );
    return (total / teacherReviews.length).toFixed(1);
  };

  const getReviewStats = () => {
    const total = teacherReviews.length;
    const publicReviews = teacherReviews.filter((r) => r.isPublic).length;
    const googleReviews = teacherReviews.filter((r) => r.isGoogleReview).length;
    const respondedReviews = teacherReviews.filter(
      (r) => r.teacherResponse,
    ).length;

    return { total, publicReviews, googleReviews, respondedReviews };
  };

  const stats = getReviewStats();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            내 수업 리뷰
          </h1>
          <p className="text-gray-600">
            학생들이 남긴 수업 피드백을 확인하고 답변할 수 있습니다
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">총 리뷰</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Star className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">평균 평점</p>
                <p className="text-2xl font-bold text-gray-900">
                  {getAverageRating()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Google 리뷰</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.googleReviews}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">답변 완료</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.respondedReviews}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="학생명, 수업명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={0}>모든 평점</option>
              <option value={5}>5점</option>
              <option value={4}>4점</option>
              <option value={3}>3점</option>
              <option value={2}>2점</option>
              <option value={1}>1점</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">리뷰 목록</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredReviews.map((review) => {
              const lesson = lessons.find((l) => l.id === review.lessonId);
              const student = students.find((s) => s.id === review.studentId);

              return (
                <div key={review.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="font-medium text-gray-900">
                          {lesson?.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-500">
                            {review.rating}/5
                          </span>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          학생: {student?.name} (레벨 {student?.level})
                        </p>
                        <p>수업일: {lesson?.date.toLocaleDateString()}</p>
                        <p>작성일: {review.createdAt.toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {review.isGoogleReview && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Google 리뷰 반영
                        </span>
                      )}

                      {!review.teacherResponse && (
                        <button
                          onClick={() => {
                            setSelectedReview(review);
                            setShowResponseModal(true);
                          }}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center space-x-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>답변</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="mb-4">
                    <p className="text-gray-700">{review.comment}</p>
                  </div>

                  {/* Category Ratings */}
                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">수업 진행:</span>
                      <div className="flex">
                        {renderStars(review.categories.teaching)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">교재/자료:</span>
                      <div className="flex">
                        {renderStars(review.categories.materials)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">소통:</span>
                      <div className="flex">
                        {renderStars(review.categories.communication)}
                      </div>
                    </div>
                  </div>

                  {/* Admin Response */}
                  {review.adminResponse && (
                    <div className="bg-green-50 p-3 rounded-lg mb-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-green-700">
                          관리자 답변
                        </span>
                      </div>
                      <p className="text-sm text-green-800">
                        {review.adminResponse}
                      </p>
                      {review.adminResponseDate && (
                        <p className="text-xs text-green-600 mt-1">
                          {review.adminResponseDate.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Teacher Response */}
                  {review.teacherResponse && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-blue-700">
                          내 답변
                        </span>
                      </div>
                      <p className="text-sm text-blue-800">
                        {review.teacherResponse}
                      </p>
                      {review.teacherResponseDate && (
                        <p className="text-xs text-blue-600 mt-1">
                          {review.teacherResponseDate.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredReviews.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              조건에 맞는 리뷰가 없습니다.
            </div>
          )}
        </div>
      </div>

      {/* Response Modal */}
      {showResponseModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">학생에게 답변하기</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                답변 내용
              </label>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                rows={4}
                placeholder="학생에게 답변할 내용을 작성해주세요..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowResponseModal(false);
                  setSelectedReview(null);
                  setResponseText("");
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleTeacherResponse}
                disabled={loading || !responseText.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>답변 등록</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

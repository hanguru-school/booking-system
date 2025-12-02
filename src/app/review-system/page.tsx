"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  MessageSquare,
  CheckCircle,
  Search,
  X,
  Smile,
  Frown,
  Meh,
  ChevronRight,
} from "lucide-react";

interface Review {
  id: string;
  lessonId: string;
  studentName: string;
  teacherName: string;
  rating: number;
  comment: string;
  checklist: string[];
  createdAt: string;
  response?: string;
  sentiment: "positive" | "neutral" | "negative";
}

export default function ReviewSystemPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const checklistOptions = [
    "재미있었어요",
    "이해하기 쉬웠어요",
    "숙제가 어려웠어요",
    "선생님이 친절해요",
    "수업 속도가 적당해요",
  ];

  useEffect(() => {
    const mockReviews: Review[] = [
      {
        id: "REVIEW001",
        lessonId: "LESSON001",
        studentName: "김학생",
        teacherName: "박선생님",
        rating: 5,
        comment:
          "정말 재미있고 유익한 수업이었습니다. 선생님이 친절하게 설명해주셔서 이해하기 쉬웠어요.",
        checklist: ["재미있었어요", "이해하기 쉬웠어요", "선생님이 친절해요"],
        createdAt: "2024-01-15T18:00:00Z",
        sentiment: "positive",
      },
      {
        id: "REVIEW002",
        lessonId: "LESSON002",
        studentName: "이학생",
        teacherName: "박선생님",
        rating: 4,
        comment:
          "수업은 좋았지만 숙제가 조금 어려웠어요. 더 많은 연습이 필요할 것 같습니다.",
        checklist: ["수업 속도가 적당해요", "숙제가 어려웠어요"],
        createdAt: "2024-01-14T17:30:00Z",
        sentiment: "neutral",
      },
    ];

    setReviews(mockReviews);
  }, []);

  const handleReviewClick = (review: Review) => {
    setSelectedReview(review);
    setShowModal(true);
  };

  const getFilteredReviews = () => {
    let filtered = reviews;

    if (filterRating !== null) {
      filtered = filtered.filter((review) => review.rating === filterRating);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (review) =>
          review.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.comment.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <Smile className="w-4 h-4 text-green-600" />;
      case "negative":
        return <Frown className="w-4 h-4 text-red-600" />;
      default:
        return <Meh className="w-4 h-4 text-yellow-600" />;
    }
  };

  const filteredReviews = getFilteredReviews();
  const averageRating = getAverageRating();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                리뷰 및 응원 시스템
              </h1>
              <p className="mt-2 text-gray-600">
                학생 피드백 관리 및 학습 동기 부여
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">평균 평점</p>
                <p className="text-2xl font-bold text-gray-900">
                  {averageRating}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <MessageSquare className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 리뷰</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reviews.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <Smile className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">긍정적 리뷰</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reviews.filter((r) => r.sentiment === "positive").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">응답률</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reviews.length > 0
                    ? Math.round(
                        (reviews.filter((r) => r.response).length /
                          reviews.length) *
                          100,
                      )
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="학생명, 선생님명, 내용 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">평점:</span>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() =>
                      setFilterRating(filterRating === rating ? null : rating)
                    }
                    className={`p-1 rounded ${
                      filterRating === rating
                        ? "bg-blue-100 text-blue-600"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <Star className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">리뷰 목록</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredReviews.length === 0 ? (
              <div className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">리뷰가 없습니다.</p>
              </div>
            ) : (
              filteredReviews.map((review) => (
                <div
                  key={review.id}
                  onClick={() => handleReviewClick(review)}
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex items-center space-x-1">
                          {renderStars(review.rating)}
                        </div>
                        {getSentimentIcon(review.sentiment)}
                        {!review.response && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            응답 대기
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                        <span>학생: {review.studentName}</span>
                        <span>선생님: {review.teacherName}</span>
                        <span>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-gray-700 mb-3 line-clamp-2">
                        {review.comment}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {review.checklist.map((item) => (
                          <span
                            key={item}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Review Detail Modal */}
      {showModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    {renderStars(selectedReview.rating)}
                  </div>
                  {getSentimentIcon(selectedReview.sentiment)}
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">학생</p>
                  <p className="font-medium">{selectedReview.studentName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">선생님</p>
                  <p className="font-medium">{selectedReview.teacherName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">작성일</p>
                  <p className="font-medium">
                    {new Date(selectedReview.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">상태</p>
                  <p className="font-medium">
                    {selectedReview.response ? "응답 완료" : "응답 대기"}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  리뷰 내용
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedReview.comment}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  체크리스트
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedReview.checklist.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {selectedReview.response && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    응답
                  </h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-gray-700">{selectedReview.response}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  닫기
                </button>
                {!selectedReview.response && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    응답하기
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

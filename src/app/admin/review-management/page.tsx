"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Star,
  MessageSquare,
  ThumbsUp,
  AlertTriangle,
  User,
  Calendar,
  Eye,
  Reply,
} from "lucide-react";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import Navigation from "@/components/common/Navigation";

interface Review {
  id: string;
  authorName: string;
  authorUid: string;
  classDate: string;
  courseName: string;
  teacherName: string;
  reviewDate: string;
  rating: number;
  content: string;
  replyStatus: "no_reply" | "replied";
  adminReply?: string;
  replyDate?: string;
  isLiked: boolean;
  isFlagged: boolean;
  flaggedReason?: string;
}

function ReviewManagementContent() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  // 필터 상태
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [teacherFilter, setTeacherFilter] = useState<string>("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // 답변 입력
  const [replyContent, setReplyContent] = useState("");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      // 실제 데이터베이스에서 리뷰 데이터 로드
      const response = await fetch("/api/admin/reviews", {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      
      if (data.success && data.reviews && data.reviews.length > 0) {
        // 실제 데이터를 Review 형식으로 변환
        const formattedReviews: Review[] = data.reviews.map((review: any) => ({
          id: review.id,
          authorName: review.authorName || "",
          authorUid: review.authorUid || "",
          classDate: review.classDate || "",
          courseName: review.courseName || "",
          teacherName: review.teacherName || "",
          reviewDate: review.reviewDate || "",
          rating: review.rating || 0,
          content: review.content || "",
          replyStatus: review.replyStatus || "no_reply",
          adminReply: review.adminReply || "",
          replyDate: review.replyDate || "",
          isLiked: review.isLiked || false,
          isFlagged: review.isFlagged || false,
          flaggedReason: review.flaggedReason || "",
        }));
        setReviews(formattedReviews);
      } else {
        // 데이터가 없으면 빈 배열
        setReviews([]);
      }
    } catch (error) {
      console.error("리뷰 목록 로딩 실패:", error);
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReview) return;

    try {
      const response = await fetch(
        `/api/admin/reviews/${selectedReview.id}/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reply: replyContent }),
        },
      );

      if (response.ok) {
        await fetchReviews();
        setShowReplyModal(false);
        setSelectedReview(null);
        setReplyContent("");
        alert("답변이 등록되었습니다.");
      } else {
        alert("답변 등록에 실패했습니다.");
      }
    } catch (error) {
      alert("답변 등록 중 오류가 발생했습니다.");
    }
  };

  const handleLikeToggle = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}/like`, {
        method: "PUT",
      });

      if (response.ok) {
        await fetchReviews();
      } else {
        alert("좋아요 상태 변경에 실패했습니다.");
      }
    } catch (error) {
      alert("좋아요 상태 변경 중 오류가 발생했습니다.");
    }
  };

  const handleFlagToggle = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}/flag`, {
        method: "PUT",
      });

      if (response.ok) {
        await fetchReviews();
      } else {
        alert("플래그 상태 변경에 실패했습니다.");
      }
    } catch (error) {
      alert("플래그 상태 변경 중 오류가 발생했습니다.");
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ));
  };

  const getReplyStatusColor = (status: Review["replyStatus"]) => {
    switch (status) {
      case "replied":
        return "bg-green-100 text-green-800";
      case "no_reply":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getReplyStatusText = (status: Review["replyStatus"]) => {
    switch (status) {
      case "replied":
        return "답변완료";
      case "no_reply":
        return "미답변";
      default:
        return "알 수 없음";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.authorUid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRating =
      ratingFilter === "all" || review.rating.toString() === ratingFilter;
    const matchesStatus =
      statusFilter === "all" || review.replyStatus === statusFilter;
    const matchesTeacher =
      teacherFilter === "all" || review.teacherName === teacherFilter;
    const matchesCourse =
      courseFilter === "all" || review.courseName === courseFilter;

    let matchesDate = true;
    if (dateFilter !== "all") {
      const reviewDate = new Date(review.reviewDate);
      const now = new Date();
      const diffDays = Math.floor(
        (now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      switch (dateFilter) {
        case "today":
          matchesDate = diffDays === 0;
          break;
        case "week":
          matchesDate = diffDays <= 7;
          break;
        case "month":
          matchesDate = diffDays <= 30;
          break;
      }
    }

    return (
      matchesSearch &&
      matchesRating &&
      matchesStatus &&
      matchesTeacher &&
      matchesCourse &&
      matchesDate
    );
  });

  const teachers = Array.from(
    new Set(reviews.map((review) => review.teacherName)),
  );
  const courses = Array.from(
    new Set(reviews.map((review) => review.courseName)),
  );
  const noReplyCount = reviews.filter(
    (r) => r.replyStatus === "no_reply",
  ).length;

  return (
    <div className="max-w-full overflow-hidden">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">리뷰 관리</h1>
        <p className="text-gray-600">학생 리뷰를 확인하고 답변을 관리합니다.</p>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">총 리뷰</p>
              <p className="text-2xl font-bold">{reviews.length}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">미답변</p>
              <p className="text-2xl font-bold text-yellow-600">
                {noReplyCount}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">평균 평점</p>
              <p className="text-2xl font-bold text-green-600">
                {(
                  reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                ).toFixed(1)}
              </p>
            </div>
            <Star className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">좋아요</p>
              <p className="text-2xl font-bold text-purple-600">
                {reviews.filter((r) => r.isLiked).length}
              </p>
            </div>
            <ThumbsUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="작성자, 내용 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체 평점</option>
              <option value="5">5점</option>
              <option value="4">4점</option>
              <option value="3">3점</option>
              <option value="2">2점</option>
              <option value="1">1점</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체 상태</option>
              <option value="no_reply">미답변</option>
              <option value="replied">답변완료</option>
            </select>

            <select
              value={teacherFilter}
              onChange={(e) => setTeacherFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체 선생님</option>
              {teachers.map((teacher) => (
                <option key={teacher} value={teacher}>
                  {teacher}
                </option>
              ))}
            </select>

            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체 코스</option>
              {courses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체 기간</option>
              <option value="today">오늘</option>
              <option value="week">최근 7일</option>
              <option value="month">최근 30일</option>
            </select>
          </div>
        </div>
      </div>

      {/* 리뷰 목록 */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">
            리뷰 목록 ({filteredReviews.length}개)
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              리뷰가 없습니다
            </h3>
            <p className="text-gray-600">검색 조건을 변경해보세요.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredReviews.map((review) => (
              <div key={review.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center space-x-1">
                        {getRatingStars(review.rating)}
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getReplyStatusColor(review.replyStatus)}`}
                      >
                        {getReplyStatusText(review.replyStatus)}
                      </span>
                      {review.isFlagged && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          플래그됨
                        </span>
                      )}
                    </div>

                    <div className="mb-3">
                      <p className="text-gray-900 line-clamp-2">
                        {review.content}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>
                          {review.authorName} ({review.authorUid})
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>수업: {formatDate(review.classDate)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>리뷰: {formatDate(review.reviewDate)}</span>
                      </div>
                      <div className="text-sm">
                        {review.courseName} • {review.teacherName}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedReview(review);
                        setShowDetailModal(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {review.replyStatus === "no_reply" && (
                      <button
                        onClick={() => {
                          setSelectedReview(review);
                          setReplyContent("");
                          setShowReplyModal(true);
                        }}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                      >
                        <Reply className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleLikeToggle(review.id)}
                      className={`p-2 rounded-lg ${
                        review.isLiked
                          ? "text-purple-600 bg-purple-100"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleFlagToggle(review.id)}
                      className={`p-2 rounded-lg ${
                        review.isFlagged
                          ? "text-red-600 bg-red-100"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 리뷰 상세 보기 모달 */}
      {showDetailModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">리뷰 상세</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    작성자
                  </label>
                  <div className="p-2 bg-gray-50 rounded border">
                    {selectedReview.authorName} ({selectedReview.authorUid})
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    평점
                  </label>
                  <div className="p-2 bg-gray-50 rounded border">
                    <div className="flex items-center space-x-1">
                      {getRatingStars(selectedReview.rating)}
                      <span className="ml-2 text-sm text-gray-600">
                        ({selectedReview.rating}/5)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    수업 정보
                  </label>
                  <div className="p-2 bg-gray-50 rounded border">
                    {selectedReview.courseName} • {selectedReview.teacherName}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    수업일
                  </label>
                  <div className="p-2 bg-gray-50 rounded border">
                    {formatDate(selectedReview.classDate)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  리뷰 내용
                </label>
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {selectedReview.content}
                  </p>
                </div>
              </div>

              {selectedReview.adminReply && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    관리자 답변
                  </label>
                  <div className="p-3 bg-blue-50 rounded border">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {selectedReview.adminReply}
                    </p>
                    <div className="text-xs text-gray-500 mt-2">
                      답변일:{" "}
                      {selectedReview.replyDate &&
                        formatDate(selectedReview.replyDate)}
                    </div>
                  </div>
                </div>
              )}

              {selectedReview.isFlagged && selectedReview.flaggedReason && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    플래그 사유
                  </label>
                  <div className="p-2 bg-red-50 rounded border">
                    <p className="text-red-800">
                      {selectedReview.flaggedReason}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                {selectedReview.replyStatus === "no_reply" && (
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setReplyContent("");
                      setShowReplyModal(true);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    답변하기
                  </button>
                )}
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 답변 작성 모달 */}
      {showReplyModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">답변 작성</h3>
            <form onSubmit={handleReplySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  원본 리뷰
                </label>
                <div className="p-3 bg-gray-50 rounded border mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex items-center space-x-1">
                      {getRatingStars(selectedReview.rating)}
                    </div>
                    <span className="text-sm text-gray-600">
                      by {selectedReview.authorName}
                    </span>
                  </div>
                  <p className="text-gray-900">{selectedReview.content}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  답변 내용
                </label>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="답변 내용을 입력하세요..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowReplyModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  답변 등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReviewManagementPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN", "MASTER"]}>
      <Navigation>
        <ReviewManagementContent />
      </Navigation>
    </ProtectedRoute>
  );
}

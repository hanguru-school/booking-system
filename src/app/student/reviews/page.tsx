"use client";

import { useState, useEffect } from "react";
import {
  Star,
  Send,
  Calendar,
  Clock,
  User,
  BookOpen,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface LessonInfo {
  id: string;
  date: string;
  time: string;
  teacherName: string;
  courseName: string;
  duration: number;
  status: "completed" | "cancelled";
}

interface Review {
  id: string;
  lessonId: string;
  rating: number;
  content: string;
  createdAt: string;
  teacherResponse?: string;
}

export default function StudentReviewPage() {
  const [lessonInfo, setLessonInfo] = useState<LessonInfo | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // URL 파라미터에서 수업 ID 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const lessonId = urlParams.get("lessonId");

    if (!lessonId) {
      setError("수업 정보를 찾을 수 없습니다.");
      setLoading(false);
      return;
    }

    // 실제 API 호출로 대체
    setTimeout(() => {
      const mockLessonInfo: LessonInfo = {
        id: lessonId,
        date: "2024-01-15",
        time: "14:00",
        teacherName: "김선생님",
        courseName: "영어 회화",
        duration: 60,
        status: "completed",
      };

      setLessonInfo(mockLessonInfo);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError("별점을 선택해주세요.");
      return;
    }

    if (content.trim().length < 10) {
      setError("리뷰 내용을 10자 이상 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 실제 API 호출로 대체
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const review: Review = {
        id: "1",
        lessonId: lessonInfo!.id,
        rating,
        content,
        createdAt: new Date().toISOString(),
      };

      console.log("리뷰 제출:", review);
      setIsSubmitted(true);
    } catch (error) {
      setError("리뷰 제출 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    setError(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !lessonInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">오류 발생</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/student/home"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            리뷰 제출 완료!
          </h1>
          <p className="text-gray-600 mb-6">
            소중한 의견을 남겨주셔서 감사합니다. 선생님께서 확인 후 답변을 드릴
            예정입니다.
          </p>
          <div className="space-y-4">
            <Link
              href="/student/home"
              className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              홈으로 돌아가기
            </Link>
            <Link
              href="/student/reservations"
              className="block w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              다음 수업 예약하기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">
        {/* 헤더 */}
        <div className="mb-8">
          <Link
            href="/student/home"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            홈으로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            수업 리뷰 작성
          </h1>
          <p className="text-lg text-gray-600">
            오늘 수업은 어떠셨나요? 소중한 의견을 들려주세요.
          </p>
        </div>

        {/* 수업 정보 */}
        {lessonInfo && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              수업 정보
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">수업 날짜</div>
                  <div className="font-medium text-gray-900">
                    {lessonInfo.date}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">수업 시간</div>
                  <div className="font-medium text-gray-900">
                    {lessonInfo.time} ({lessonInfo.duration}분)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">담당 선생님</div>
                  <div className="font-medium text-gray-900">
                    {lessonInfo.teacherName}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">수업 과목</div>
                  <div className="font-medium text-gray-900">
                    {lessonInfo.courseName}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 리뷰 작성 폼 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit}>
            {/* 별점 선택 */}
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-900 mb-4">
                오늘 수업에 대한 만족도를 평가해주세요
              </label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    className={`p-2 rounded-lg transition-colors ${
                      rating >= star
                        ? "text-yellow-400 hover:text-yellow-500"
                        : "text-gray-300 hover:text-gray-400"
                    }`}
                  >
                    <Star className="w-8 h-8 fill-current" />
                  </button>
                ))}
              </div>
              <div className="text-center mt-2 text-sm text-gray-600">
                {rating === 0 && "별점을 선택해주세요"}
                {rating === 1 && "매우 불만족"}
                {rating === 2 && "불만족"}
                {rating === 3 && "보통"}
                {rating === 4 && "만족"}
                {rating === 5 && "매우 만족"}
              </div>
            </div>

            {/* 리뷰 내용 */}
            <div className="mb-6">
              <label
                htmlFor="content"
                className="block text-lg font-medium text-gray-900 mb-4"
              >
                수업에 대한 의견을 자유롭게 작성해주세요
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setError(null);
                }}
                placeholder="오늘 수업에서 좋았던 점, 개선하고 싶은 점, 선생님께 전하고 싶은 말 등을 자유롭게 작성해주세요..."
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2">
                <div className="text-sm text-gray-500">
                  최소 10자 이상 입력해주세요
                </div>
                <div className="text-sm text-gray-500">
                  {content.length}/500
                </div>
              </div>
            </div>

            {/* 오류 메시지 */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-800">{error}</span>
                </div>
              </div>
            )}

            {/* 제출 버튼 */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setRating(0);
                  setContent("");
                  setError(null);
                }}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                다시 작성
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    제출 중...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    리뷰 제출
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 안내 사항 */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">
            리뷰 작성 안내
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• 리뷰는 수업 완료 후 한 번만 작성할 수 있습니다.</li>
            <li>• 작성한 리뷰는 수정할 수 없습니다.</li>
            <li>• 선생님께서 확인 후 답변을 드릴 수 있습니다.</li>
            <li>• 건설적인 의견은 수업 개선에 반영됩니다.</li>
            <li>• 부적절한 내용은 관리자 검토 후 삭제될 수 있습니다.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  Send,
  User,
  MessageSquare,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  teacherName: string;
  date: Date;
  duration: number;
  type: "online" | "offline";
  status: "completed" | "cancelled" | "no-show";
}

interface Feedback {
  id: string;
  lessonId: string;
  studentId: string;
  rating: number;
  comment: string;
  categories: {
    teaching: number;
    materials: number;
    communication: number;
    overall: number;
  };
  isPublic: boolean;
  createdAt: Date;
  teacherResponse?: string;
  responseDate?: Date;
}

export default function StudentFeedbackPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<string>("");
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<Partial<Feedback>>({
    rating: 0,
    comment: "",
    categories: {
      teaching: 0,
      materials: 0,
      communication: 0,
      overall: 0,
    },
    isPublic: false,
  });

  useEffect(() => {
    initializeMockData();
  }, []);

  const initializeMockData = () => {
    const mockLessons: Lesson[] = [
      {
        id: "lesson1",
        title: "중급 회화 수업",
        teacherName: "박선생님",
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1일 전
        duration: 60,
        type: "online",
        status: "completed",
      },
      {
        id: "lesson2",
        title: "기초 문법 수업",
        teacherName: "김선생님",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3일 전
        duration: 60,
        type: "offline",
        status: "completed",
      },
      {
        id: "lesson3",
        title: "고급 읽기 수업",
        teacherName: "이선생님",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7일 전
        duration: 90,
        type: "online",
        status: "completed",
      },
    ];

    const mockFeedbacks: Feedback[] = [
      {
        id: "feedback1",
        lessonId: "lesson2",
        studentId: "student1",
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
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        teacherResponse:
          "열심히 공부하시는 모습이 보기 좋았습니다. 다음 수업에서도 좋은 성과 기대합니다!",
        responseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ];

    setLessons(mockLessons);
    setFeedbacks(mockFeedbacks);
  };

  const getLessonsWithoutFeedback = () => {
    const feedbackLessonIds = feedbacks.map((f) => f.lessonId);
    return lessons.filter((lesson) => !feedbackLessonIds.includes(lesson.id));
  };

  const handleRatingChange = (rating: number) => {
    setCurrentFeedback((prev) => ({
      ...prev,
      rating,
      categories: {
        ...prev.categories!,
        overall: rating,
      },
    }));
  };

  const handleCategoryRatingChange = (
    category: keyof Feedback["categories"],
    rating: number,
  ) => {
    setCurrentFeedback((prev) => ({
      ...prev,
      categories: {
        ...prev.categories!,
        [category]: rating,
      },
    }));
  };

  const handleSubmitFeedback = async () => {
    if (!selectedLesson || currentFeedback.rating === 0) {
      alert("별점을 선택해주세요.");
      return;
    }

    setLoading(true);

    // 실제 구현에서는 API 호출
    const newFeedback: Feedback = {
      id: `feedback-${Date.now()}`,
      lessonId: selectedLesson,
      studentId: "student1",
      rating: currentFeedback.rating!,
      comment: currentFeedback.comment!,
      categories: currentFeedback.categories!,
      isPublic: currentFeedback.isPublic!,
      createdAt: new Date(),
    };

    setFeedbacks((prev) => [...prev, newFeedback]);
    setShowFeedbackForm(false);
    setCurrentFeedback({
      rating: 0,
      comment: "",
      categories: {
        teaching: 0,
        materials: 0,
        communication: 0,
        overall: 0,
      },
      isPublic: false,
    });
    setSelectedLesson("");
    setLoading(false);
  };

  const renderStars = (
    rating: number,
    onRatingChange?: (rating: number) => void,
  ) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onRatingChange?.(star)}
            className={`text-2xl transition-colors ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            } hover:text-yellow-400`}
          >
            <Star className="w-6 h-6 fill-current" />
          </button>
        ))}
      </div>
    );
  };

  const lessonsWithoutFeedback = getLessonsWithoutFeedback();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">수업 피드백</h1>
          <p className="text-gray-600">
            완료된 수업에 대한 피드백을 작성해주세요
          </p>
        </div>

        {/* Feedback Statistics */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            피드백 현황
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-600">총 수업 수</span>
                <span className="text-2xl font-bold text-blue-700">
                  {lessons.length}
                </span>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600">피드백 작성 완료</span>
                <span className="text-2xl font-bold text-green-700">
                  {feedbacks.length}
                </span>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-yellow-600">미작성 수업</span>
                <span className="text-2xl font-bold text-yellow-700">
                  {lessonsWithoutFeedback.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Form */}
        {showFeedbackForm && selectedLesson && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                피드백 작성
              </h2>
              <button
                onClick={() => setShowFeedbackForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {(() => {
              const lesson = lessons.find((l) => l.id === selectedLesson);
              if (!lesson) return null;

              return (
                <div className="space-y-6">
                  {/* Lesson Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">
                      {lesson.title}
                    </h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>선생님: {lesson.teacherName}</p>
                      <p>날짜: {lesson.date.toLocaleDateString()}</p>
                      <p>시간: {lesson.duration}분</p>
                      <p>
                        유형: {lesson.type === "online" ? "온라인" : "대면"}
                      </p>
                    </div>
                  </div>

                  {/* Overall Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      전체 만족도
                    </label>
                    {renderStars(
                      currentFeedback.rating || 0,
                      handleRatingChange,
                    )}
                  </div>

                  {/* Category Ratings */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        수업 진행
                      </label>
                      {renderStars(
                        currentFeedback.categories?.teaching || 0,
                        (rating) =>
                          handleCategoryRatingChange("teaching", rating),
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        교재/자료
                      </label>
                      {renderStars(
                        currentFeedback.categories?.materials || 0,
                        (rating) =>
                          handleCategoryRatingChange("materials", rating),
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        소통
                      </label>
                      {renderStars(
                        currentFeedback.categories?.communication || 0,
                        (rating) =>
                          handleCategoryRatingChange("communication", rating),
                      )}
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      추가 의견 (선택사항)
                    </label>
                    <textarea
                      value={currentFeedback.comment || ""}
                      onChange={(e) =>
                        setCurrentFeedback((prev) => ({
                          ...prev,
                          comment: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                      rows={4}
                      placeholder="수업에 대한 의견이나 개선사항을 자유롭게 작성해주세요..."
                    />
                  </div>

                  {/* Public Review Option */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="public-review"
                      checked={currentFeedback.isPublic || false}
                      onChange={(e) =>
                        setCurrentFeedback((prev) => ({
                          ...prev,
                          isPublic: e.target.checked,
                        }))
                      }
                      className="rounded border-gray-300"
                    />
                    <label
                      htmlFor="public-review"
                      className="text-sm text-gray-700"
                    >
                      Google 리뷰에도 반영 (익명 처리)
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowFeedbackForm(false)}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleSubmitFeedback}
                      disabled={loading || currentFeedback.rating === 0}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center space-x-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>피드백 제출</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Lessons Without Feedback */}
        {lessonsWithoutFeedback.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-yellow-500" />
              피드백 미작성 수업
            </h2>
            <div className="space-y-3">
              {lessonsWithoutFeedback.map((lesson) => (
                <div
                  key={lesson.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {lesson.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {lesson.teacherName} •{" "}
                        {lesson.date.toLocaleDateString()} • {lesson.duration}분
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedLesson(lesson.id);
                        setShowFeedbackForm(true);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      피드백 작성
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Previous Feedbacks */}
        {feedbacks.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
              작성한 피드백
            </h2>
            <div className="space-y-4">
              {feedbacks.map((feedback) => {
                const lesson = lessons.find((l) => l.id === feedback.lessonId);
                if (!lesson) return null;

                return (
                  <div
                    key={feedback.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {lesson.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {lesson.teacherName} •{" "}
                          {lesson.date.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {renderStars(feedback.rating)}
                        <span className="text-sm text-gray-500">
                          {feedback.rating}/5
                        </span>
                      </div>
                    </div>

                    {feedback.comment && (
                      <div className="mb-3">
                        <p className="text-gray-700">{feedback.comment}</p>
                      </div>
                    )}

                    {/* Category Ratings */}
                    <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                      <div>
                        <span className="text-gray-500">수업 진행:</span>
                        <div className="flex">
                          {renderStars(feedback.categories.teaching)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">교재/자료:</span>
                        <div className="flex">
                          {renderStars(feedback.categories.materials)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">소통:</span>
                        <div className="flex">
                          {renderStars(feedback.categories.communication)}
                        </div>
                      </div>
                    </div>

                    {/* Teacher Response */}
                    {feedback.teacherResponse && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <User className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium text-blue-700">
                            선생님 답변
                          </span>
                        </div>
                        <p className="text-sm text-blue-800">
                          {feedback.teacherResponse}
                        </p>
                        {feedback.responseDate && (
                          <p className="text-xs text-blue-600 mt-1">
                            {feedback.responseDate.toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                      <span>
                        작성일: {feedback.createdAt.toLocaleDateString()}
                      </span>
                      {feedback.isPublic && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                          Google 리뷰 반영
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

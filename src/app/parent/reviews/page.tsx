"use client";

import { useState } from "react";
import { Star, Search, Calendar, User, MessageSquare } from "lucide-react";

// Mock data for teacher reviews
const mockReviews = [
  {
    id: 1,
    teacherName: "김영희",
    subject: "수학",
    childName: "김민수",
    rating: 5,
    review:
      "아이가 수학을 정말 재미있게 배우고 있어요. 선생님이 설명을 아주 잘 해주시고, 아이의 수준에 맞춰서 가르쳐주셔서 감사합니다.",
    date: "2024-01-15",
    childGrade: "초등 3학년",
    classType: "개별 수업",
  },
  {
    id: 2,
    teacherName: "박철수",
    subject: "영어",
    childName: "김민수",
    rating: 4,
    review:
      "영어 발음 교정을 정말 잘 해주시고, 아이가 자신감을 갖고 영어를 말할 수 있게 도와주셨어요.",
    date: "2024-01-10",
    childGrade: "초등 3학년",
    classType: "그룹 수업",
  },
  {
    id: 3,
    teacherName: "이미영",
    subject: "과학",
    childName: "김민수",
    rating: 5,
    review:
      "실험을 통한 학습이 아이에게 큰 도움이 되었어요. 복잡한 개념도 쉽게 이해할 수 있게 설명해주셨습니다.",
    date: "2024-01-05",
    childGrade: "초등 3학년",
    classType: "개별 수업",
  },
  {
    id: 4,
    teacherName: "최동욱",
    subject: "국어",
    childName: "김민수",
    rating: 4,
    review:
      "독해력 향상에 많은 도움을 주셨고, 아이가 책 읽기를 좋아하게 되었어요.",
    date: "2023-12-20",
    childGrade: "초등 3학년",
    classType: "그룹 수업",
  },
  {
    id: 5,
    teacherName: "정수진",
    subject: "음악",
    childName: "김민수",
    rating: 5,
    review:
      "아이가 피아노를 정말 좋아하게 되었어요. 선생님이 아이의 관심을 잘 끌어주시고 격려해주셔서 감사합니다.",
    date: "2023-12-15",
    childGrade: "초등 3학년",
    classType: "개별 수업",
  },
];

export default function TeacherReviewsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("전체");
  const [selectedRating, setSelectedRating] = useState("전체");

  const subjects = ["전체", "수학", "영어", "과학", "국어", "음악"];
  const ratings = ["전체", "5점", "4점", "3점", "2점", "1점"];

  const filteredReviews = mockReviews.filter((review) => {
    const matchesSearch =
      review.teacherName.includes(searchTerm) ||
      review.subject.includes(searchTerm) ||
      review.childName.includes(searchTerm);
    const matchesSubject =
      selectedSubject === "전체" || review.subject === selectedSubject;
    const matchesRating =
      selectedRating === "전체" ||
      (selectedRating === "5점" && review.rating === 5) ||
      (selectedRating === "4점" && review.rating === 4) ||
      (selectedRating === "3점" && review.rating === 3) ||
      (selectedRating === "2점" && review.rating === 2) ||
      (selectedRating === "1점" && review.rating === 1);

    return matchesSearch && matchesSubject && matchesRating;
  });

  const averageRating =
    mockReviews.reduce((acc, review) => acc + review.rating, 0) /
    mockReviews.length;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">선생님 리뷰</h1>
        <p className="text-gray-600">
          아이들이 받은 수업에 대한 리뷰를 확인하세요
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Star className="w-8 h-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">평균 평점</p>
              <p className="text-2xl font-bold text-gray-900">
                {averageRating.toFixed(1)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <User className="w-8 h-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 리뷰 수</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockReviews.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <MessageSquare className="w-8 h-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">이번 달 리뷰</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">최근 리뷰</p>
              <p className="text-2xl font-bold text-gray-900">2024-01-15</p>
            </div>
          </div>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="선생님 이름, 과목, 아이 이름으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {ratings.map((rating) => (
                <option key={rating} value={rating}>
                  {rating}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 리뷰 목록 */}
      <div className="space-y-6">
        {filteredReviews.map((review) => (
          <div
            key={review.id}
            className="bg-white p-6 rounded-lg shadow-sm border"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {review.teacherName} 선생님
                </h3>
                <p className="text-sm text-gray-600">
                  {review.subject} • {review.childGrade} • {review.classType}
                </p>
              </div>
              <div className="flex items-center">
                <div className="flex items-center mr-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < review.rating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">{review.date}</span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-700 leading-relaxed">{review.review}</p>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>아이: {review.childName}</span>
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {review.date}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">검색 조건에 맞는 리뷰가 없습니다.</p>
        </div>
      )}
    </div>
  );
}

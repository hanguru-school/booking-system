"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  FileText,
  User,
  Calendar,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";

interface LINEUser {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

interface UserData {
  uid: string;
  name: string;
  role: "student" | "teacher" | "admin";
  lineUserId?: string;
  isLinked: boolean;
}

export default function LINEIntegrationPage() {
  const [lineUser, setLineUser] = useState<LINEUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLinked, setIsLinked] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "notes" | "homework" | "mypage" | "booking"
  >("mypage");

  // Mock LINE LIFF initialization
  useEffect(() => {
    const initializeLIFF = async () => {
      try {
        // Simulate LINE LIFF initialization
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock LINE user data
        const mockLineUser: LINEUser = {
          userId: "U1234567890abcdef",
          displayName: "김학생",
          pictureUrl: "https://via.placeholder.com/150",
          statusMessage: "열심히 공부중입니다!",
        };

        setLineUser(mockLineUser);

        // Check if user is linked
        const mockUserData: UserData = {
          uid: "STU001",
          name: "김학생",
          role: "student",
          lineUserId: "U1234567890abcdef",
          isLinked: true,
        };

        setUserData(mockUserData);
        setIsLinked(true);
        setIsLoading(false);
      } catch (error) {
        console.error("LINE LIFF initialization failed:", error);
        setIsLoading(false);
      }
    };

    initializeLIFF();
  }, []);

  const handleTabChange = (
    tab: "notes" | "homework" | "mypage" | "booking",
  ) => {
    setActiveTab(tab);
  };

  const handleLogout = () => {
    // Simulate logout
    setLineUser(null);
    setUserData(null);
    setIsLinked(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">LINE 연동 중...</p>
        </div>
      </div>
    );
  }

  if (!lineUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              LINE 연동 오류
            </h1>
            <p className="text-gray-600 mb-6">LINE 앱에서 접속해주세요.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {lineUser.pictureUrl && (
                <img
                  src={lineUser.pictureUrl}
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <h1 className="font-semibold text-gray-800">
                  {lineUser.displayName}
                </h1>
                <p className="text-sm text-gray-500">
                  {isLinked ? "연동됨" : "미연동"}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-gray-600"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        {!isLinked ? (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                계정 연동 필요
              </h2>
              <p className="text-gray-600 mb-4">
                LINE 계정과 교실 계정을 연동해주세요.
              </p>
              <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                연동하기
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-lg mb-6">
              <div className="grid grid-cols-4">
                <button
                  onClick={() => handleTabChange("notes")}
                  className={`flex flex-col items-center py-4 px-2 transition-colors ${
                    activeTab === "notes"
                      ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <BookOpen className="w-6 h-6 mb-1" />
                  <span className="text-xs">노트 보기</span>
                </button>
                <button
                  onClick={() => handleTabChange("homework")}
                  className={`flex flex-col items-center py-4 px-2 transition-colors ${
                    activeTab === "homework"
                      ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <FileText className="w-6 h-6 mb-1" />
                  <span className="text-xs">숙제 하기</span>
                </button>
                <button
                  onClick={() => handleTabChange("mypage")}
                  className={`flex flex-col items-center py-4 px-2 transition-colors ${
                    activeTab === "mypage"
                      ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <User className="w-6 h-6 mb-1" />
                  <span className="text-xs">마이페이지</span>
                </button>
                <button
                  onClick={() => handleTabChange("booking")}
                  className={`flex flex-col items-center py-4 px-2 transition-colors ${
                    activeTab === "booking"
                      ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Calendar className="w-6 h-6 mb-1" />
                  <span className="text-xs">예약 하기</span>
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              {activeTab === "notes" && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    노트 보기
                  </h2>
                  <div className="space-y-3">
                    <div className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                      <h3 className="font-semibold text-gray-800">
                        기초 문법 노트
                      </h3>
                      <p className="text-sm text-gray-600">
                        2024년 1월 15일 수업
                      </p>
                    </div>
                    <div className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                      <h3 className="font-semibold text-gray-800">
                        회화 표현 노트
                      </h3>
                      <p className="text-sm text-gray-600">
                        2024년 1월 12일 수업
                      </p>
                    </div>
                    <div className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                      <h3 className="font-semibold text-gray-800">
                        단어 정리 노트
                      </h3>
                      <p className="text-sm text-gray-600">
                        2024년 1월 10일 수업
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "homework" && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    숙제 하기
                  </h2>
                  <div className="space-y-3">
                    <div className="border rounded-lg p-3 bg-yellow-50">
                      <h3 className="font-semibold text-gray-800">
                        문법 연습 문제
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        마감: 2024년 1월 20일
                      </p>
                      <button className="bg-blue-500 text-white px-4 py-1 rounded text-sm hover:bg-blue-600">
                        시작하기
                      </button>
                    </div>
                    <div className="border rounded-lg p-3 bg-green-50">
                      <h3 className="font-semibold text-gray-800">회화 연습</h3>
                      <p className="text-sm text-gray-600 mb-2">완료됨</p>
                      <span className="text-green-600 text-sm">
                        ✓ 제출 완료
                      </span>
                    </div>
                    <div className="border rounded-lg p-3">
                      <h3 className="font-semibold text-gray-800">
                        단어 테스트
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        마감: 2024년 1월 25일
                      </p>
                      <button className="bg-blue-500 text-white px-4 py-1 rounded text-sm hover:bg-blue-600">
                        시작하기
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "mypage" && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    마이페이지
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-800 mb-2">
                        학습 현황
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">총 수업 수</p>
                          <p className="font-semibold text-blue-600">24회</p>
                        </div>
                        <div>
                          <p className="text-gray-600">출석률</p>
                          <p className="font-semibold text-blue-600">95%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">완료 숙제</p>
                          <p className="font-semibold text-blue-600">18개</p>
                        </div>
                        <div>
                          <p className="text-gray-600">현재 레벨</p>
                          <p className="font-semibold text-blue-600">중급</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-800">최근 활동</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>1월 15일 수업 참여</span>
                          <span className="text-green-600">✓</span>
                        </div>
                        <div className="flex justify-between">
                          <span>문법 숙제 제출</span>
                          <span className="text-green-600">✓</span>
                        </div>
                        <div className="flex justify-between">
                          <span>수업 리뷰 작성</span>
                          <span className="text-green-600">✓</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "booking" && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    예약 하기
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-800 mb-2">
                        다음 예약
                      </h3>
                      <p className="text-sm text-gray-600">
                        1월 18일 (목) 오후 2:00
                      </p>
                      <p className="text-sm text-gray-600">
                        김선생님 - 중급 문법
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-800">
                        예약 가능 시간
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        <button className="border rounded-lg p-3 text-sm hover:bg-blue-50">
                          <p className="font-semibold">1월 20일 (토)</p>
                          <p className="text-gray-600">오후 3:00</p>
                        </button>
                        <button className="border rounded-lg p-3 text-sm hover:bg-blue-50">
                          <p className="font-semibold">1월 22일 (월)</p>
                          <p className="text-gray-600">오후 4:00</p>
                        </button>
                        <button className="border rounded-lg p-3 text-sm hover:bg-blue-50">
                          <p className="font-semibold">1월 24일 (수)</p>
                          <p className="text-gray-600">오후 2:00</p>
                        </button>
                        <button className="border rounded-lg p-3 text-sm hover:bg-blue-50">
                          <p className="font-semibold">1월 25일 (목)</p>
                          <p className="text-gray-600">오후 5:00</p>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

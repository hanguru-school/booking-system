"use client";

import { useState } from "react";
import {
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Home,
  Calendar,
  TrendingUp,
  Bus,
} from "lucide-react";
import Link from "next/link";

interface EmployeeTaggingResult {
  success: boolean;
  employee?: {
    id: string;
    name: string;
    role: "teacher" | "staff";
    uid: string;
  };
  eventType: "attendance" | "checkout" | "re_attendance";
  message: string;
  todaySchedule?: {
    lessons: Array<{
      studentName: string;
      serviceName: string;
      time: string;
    }>;
    totalLessons: number;
  };
  transportationAllowance?: {
    eligible: boolean;
    amount: number;
    reason: string;
  };
}

export default function EmployeeTaggingPage() {
  const [isTagging, setIsTagging] = useState(false);
  const [currentResult, setCurrentResult] =
    useState<EmployeeTaggingResult | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [employeeType, setEmployeeType] = useState<"teacher" | "staff">(
    "teacher",
  );

  // 직원 태깅 처리
  const handleEmployeeTagging = async () => {
    setIsTagging(true);
    setCurrentResult(null);
    setShowSchedule(false);

    try {
      // NFC/FeliCa 리더 연결 시뮬레이션
      setTimeout(async () => {
        const mockUid =
          "EMP" + Math.random().toString(36).substr(2, 4).toUpperCase();
        const timestamp = new Date().toISOString();

        const response = await fetch("/api/tagging/employee", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uid: mockUid,
            timestamp: timestamp,
            type: employeeType,
          }),
        });

        const result = await response.json();
        setCurrentResult(result);
        setIsTagging(false);
      }, 2000);
    } catch (error) {
      setCurrentResult({
        success: false,
        eventType: "attendance",
        message: "태그 처리 중 오류가 발생했습니다",
      });
      setIsTagging(false);
    }
  };

  // 이벤트 타입에 따른 메시지 생성
  const getEventMessage = (eventType: string) => {
    switch (eventType) {
      case "attendance":
        return "출근이 확인되었습니다!";
      case "checkout":
        return "퇴근이 확인되었습니다!";
      case "re_attendance":
        return "재출근이 확인되었습니다!";
      default:
        return "태그 처리 완료";
    }
  };

  // 이벤트 타입에 따른 아이콘
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "attendance":
        return <TrendingUp className="w-8 h-8 text-green-600" />;
      case "checkout":
        return <Clock className="w-8 h-8 text-blue-600" />;
      case "re_attendance":
        return <AlertCircle className="w-8 h-8 text-yellow-600" />;
      default:
        return <CheckCircle className="w-8 h-8 text-green-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            직원 출퇴근 태깅
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            NFC/FeliCa 카드를 리더기에 태그해주세요
          </p>

          {/* 메인 페이지 이동 버튼 */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-lg"
          >
            <Home className="w-5 h-5" />
            메인 페이지로
          </Link>
        </div>

        {/* 직원 타입 선택 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
            직원 타입 선택
          </h2>
          <div className="flex gap-4">
            <button
              onClick={() => setEmployeeType("teacher")}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-lg transition-colors ${
                employeeType === "teacher"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <User className="w-5 h-5" />
              선생님
            </button>
            <button
              onClick={() => setEmployeeType("staff")}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-lg transition-colors ${
                employeeType === "staff"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <User className="w-5 h-5" />
              사무직원
            </button>
          </div>
        </div>

        {/* 태그 시작 버튼 */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            {employeeType === "teacher" ? "선생님" : "사무직원"} 태그 시작
          </h2>
          <button
            onClick={handleEmployeeTagging}
            disabled={isTagging}
            className="w-full flex items-center justify-center gap-3 px-8 py-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
          >
            {isTagging ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                태그 중...
              </>
            ) : (
              <>
                <User className="w-8 h-8" />
                {employeeType === "teacher" ? "선생님" : "사무직원"} 태그하기
              </>
            )}
          </button>

          <p className="text-sm text-gray-500 mt-4 text-center">
            {employeeType === "teacher" ? "선생님" : "사무직원"}의 NFC/FeliCa
            카드를 리더기에 태그해주세요
          </p>
        </div>

        {/* 태깅 결과 */}
        {currentResult && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              태깅 결과
            </h2>
            <div
              className={`p-6 rounded-lg border-2 ${
                currentResult.success
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                {getEventIcon(currentResult.eventType)}
                <span className="text-xl font-semibold">
                  {getEventMessage(currentResult.eventType)}
                </span>
              </div>

              {currentResult.employee && (
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <User className="w-5 h-5 text-gray-600" />
                    <span className="text-lg font-medium">
                      {currentResult.employee.name}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {currentResult.employee.role === "teacher"
                      ? "선생님"
                      : "사무직원"}
                  </div>
                </div>
              )}

              {currentResult.transportationAllowance && (
                <div className="text-center mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Bus className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-800">
                      교통비 정보
                    </span>
                  </div>
                  <div className="text-sm text-blue-700">
                    {currentResult.transportationAllowance.eligible
                      ? `교통비 ${currentResult.transportationAllowance.amount.toLocaleString()}원 지급 가능`
                      : currentResult.transportationAllowance.reason}
                  </div>
                </div>
              )}

              <div className="text-center text-gray-600 mb-4">
                {currentResult.message}
              </div>

              {/* 오늘 수업 일정 표시 옵션 */}
              {currentResult.eventType === "attendance" &&
                currentResult.employee?.role === "teacher" &&
                currentResult.todaySchedule && (
                  <div className="text-center">
                    <button
                      onClick={() => setShowSchedule(!showSchedule)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                      오늘 수업 일정 {showSchedule ? "숨기기" : "보기"}
                    </button>
                  </div>
                )}
            </div>
          </div>
        )}

        {/* 오늘 수업 일정 */}
        {showSchedule && currentResult?.todaySchedule && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
              오늘의 수업 일정
            </h3>
            <div className="space-y-3">
              {currentResult.todaySchedule.lessons.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  오늘 예정된 수업이 없습니다
                </div>
              ) : (
                currentResult.todaySchedule.lessons.map((lesson, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {lesson.studentName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {lesson.serviceName}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">{lesson.time}</div>
                  </div>
                ))
              )}
              <div className="text-center pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-600">
                  총 {currentResult.todaySchedule.totalLessons}개 수업
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 관리자 링크 */}
        <div className="mt-8 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tagging/student"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <User className="w-5 h-5" />
              학생 태깅
            </Link>
            <Link
              href="/admin/tagging/logs"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Calendar className="w-5 h-5" />
              태깅 이력
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

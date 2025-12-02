"use client";

import {
  Home,
  User,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Clock,
  MoreHorizontal,
  MessageSquare,
  ShoppingCart,
  Calendar,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { hardwareReaderManager } from "@/lib/hardware-reader";

interface StudentTaggingResult {
  success: boolean;
  student?: {
    id: string;
    name: string;
    level: number;
    points: number;
  };
  reservation?: {
    id: string;
    serviceName: string;
    teacherName: string;
    date: string;
    time: string;
    status: string;
  };
  eventType:
    | "attendance"
    | "manual_attendance"
    | "no_reservation"
    | "already_registered"
    | "other";
  message: string;
  pointsEarned?: number;
  canManualAttendance?: boolean;
}

export default function StudentTaggingPage() {
  const [isTagging, setIsTagging] = useState(false);
  const [currentResult, setCurrentResult] =
    useState<StudentTaggingResult | null>(null);
  const [showManualAttendance, setShowManualAttendance] = useState(false);
  const [showOtherOptions, setShowOtherOptions] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedOtherType, setSelectedOtherType] = useState<
    "consultation" | "materials" | "other"
  >("consultation");
  const [otherNotes, setOtherNotes] = useState("");

  // 실제 카드 UID 읽기 함수
  const readRealCardUID = async (): Promise<string> => {
    try {
      // 실제 하드웨어 리더 사용
      console.log("실제 하드웨어 리더 연결 시도...");

      const connected = await hardwareReaderManager.connect();
      if (!connected) {
        throw new Error(
          "하드웨어 리더 연결에 실패했습니다. 리더가 연결되어 있는지 확인해주세요.",
        );
      }

      console.log("하드웨어 리더 연결 성공, 학생 카드 읽기 대기 중...");

      // 실제 카드 UID 읽기
      const realUID = await hardwareReaderManager.readUID();

      console.log("실제 학생 카드에서 읽은 UID:", realUID);
      return realUID;
    } catch (error) {
      console.error("실제 카드 읽기 오류:", error);
      throw error;
    }
  };

  // 학생 태깅 처리
  const handleStudentTagging = async () => {
    setIsTagging(true);
    setCurrentResult(null);
    setShowManualAttendance(false);
    setShowOtherOptions(false);

    try {
      // 실제 카드 UID 읽기
      const realUid = await readRealCardUID();
      const timestamp = new Date().toISOString();

      console.log("읽은 실제 카드 UID:", realUid);

      const response = await fetch("/api/tagging/student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: realUid,
          timestamp: timestamp,
        }),
      });

      const result = await response.json();
      setCurrentResult(result);

      // 예약이 없는 경우 수동 출석 등록 옵션 표시
      if (result.eventType === "no_reservation") {
        setShowManualAttendance(true);
      }

      setIsTagging(false);
    } catch (error) {
      console.error("카드 읽기 오류:", error);
      setCurrentResult({
        success: false,
        eventType: "no_reservation",
        message:
          error instanceof Error ? error.message : "카드 읽기에 실패했습니다",
      });
      setIsTagging(false);
    }
  };

  // 수동 출석 등록
  const handleManualAttendance = async () => {
    if (!selectedService || !selectedTime) {
      alert("서비스와 시간을 선택해주세요");
      return;
    }

    try {
      setIsTagging(true);
      const response = await fetch("/api/tagging/student/manual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: selectedService,
          time: selectedTime,
          date: new Date().toISOString().split("T")[0],
        }),
      });

      const result = await response.json();

      if (result.success) {
        setCurrentResult({
          success: true,
          student: result.student,
          eventType: "manual_attendance",
          message: "수동 출석이 등록되었습니다",
          pointsEarned: result.pointsEarned,
        });
        setShowManualAttendance(false);
      } else {
        setCurrentResult({
          success: false,
          eventType: "no_reservation",
          message: result.error || "수동 출석 등록 실패",
        });
      }
    } catch (error) {
      setCurrentResult({
        success: false,
        eventType: "no_reservation",
        message: "수동 출석 등록 중 오류 발생",
      });
    } finally {
      setIsTagging(false);
    }
  };

  // 기타 태깅 처리
  const handleOtherTagging = async () => {
    if (!currentResult?.student) return;

    try {
      setIsTagging(true);
      const response = await fetch("/api/tagging/student/other", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: currentResult?.student?.id || "UNKNOWN",
          type: selectedOtherType,
          notes: otherNotes,
          timestamp: new Date().toISOString(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setCurrentResult({
          success: true,
          student: currentResult.student,
          eventType: "other",
          message: result.message,
        });
        setShowOtherOptions(false);
      } else {
        setCurrentResult({
          success: false,
          eventType: "other",
          message: result.error || "기타 태깅 처리 실패",
        });
      }
    } catch (error) {
      setCurrentResult({
        success: false,
        eventType: "other",
        message: "기타 태깅 처리 중 오류 발생",
      });
    } finally {
      setIsTagging(false);
    }
  };

  // 이벤트 타입에 따른 메시지 생성
  const getEventMessage = (eventType: string) => {
    switch (eventType) {
      case "attendance":
        return "출석이 확인되었습니다!";
      case "manual_attendance":
        return "수동 출석이 등록되었습니다!";
      case "no_reservation":
        return "本日の予約がありません。出席を記録しますか？ (오늘 예약이 없습니다. 출석을 기록하시겠습니까?)";
      case "already_registered":
        return "すでに本日の記録があります (이미 오늘의 기록이 있습니다)";
      case "other":
        return "기타 사항이 기록되었습니다";
      default:
        return "태그 처리 완료";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            학생 출석 태깅
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

        {/* 태그 시작 버튼 */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            학생 태그 시작
          </h2>

          {/* 실제 카드 읽기 안내 */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-medium mb-1">
              실제 카드 읽기:
            </p>
            <p className="text-xs text-blue-600">
              버튼을 클릭하면 실제 NFC/FeliCa 카드를 읽어옵니다
            </p>
          </div>
          <button
            onClick={handleStudentTagging}
            disabled={isTagging}
            className="w-full flex items-center justify-center gap-3 px-8 py-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
          >
            {isTagging ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                태그 중...
              </>
            ) : (
              <>
                <User className="w-8 h-8" />
                학생 태그하기
              </>
            )}
          </button>

          <p className="text-sm text-gray-500 mt-4 text-center">
            학생의 NFC/FeliCa 카드를 리더기에 태그해주세요
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
                  : "bg-yellow-50 border-yellow-200"
              }`}
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                {currentResult.success ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-yellow-600" />
                )}
                <span className="text-xl font-semibold">
                  {getEventMessage(currentResult.eventType)}
                </span>
              </div>

              {currentResult.student && (
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <User className="w-5 h-5 text-gray-600" />
                    <span className="text-lg font-medium">
                      {currentResult.student.name}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    레벨 {currentResult.student.level} | 포인트{" "}
                    {currentResult.student.points}점
                  </div>
                  {currentResult.pointsEarned && (
                    <div className="text-sm text-green-600 mt-1">
                      +{currentResult.pointsEarned}포인트 적립
                    </div>
                  )}
                </div>
              )}

              {currentResult.reservation && (
                <div className="text-center mb-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>{currentResult.reservation.serviceName}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <User className="w-4 h-4" />
                      <span>
                        선생님: {currentResult.reservation.teacherName}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>시간: {currentResult.reservation.time}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-center text-gray-600">
                {currentResult.message}
              </div>

              {/* 기타 선택 옵션 */}
              {currentResult.eventType === "no_reservation" && (
                <div className="mt-4 flex gap-2 justify-center">
                  <button
                    onClick={() => setShowOtherOptions(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                    기타
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 수동 출석 등록 */}
        {showManualAttendance && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              수동 출석 등록
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  서비스 선택
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">서비스 선택</option>
                  <option value="service1">기초 한국어</option>
                  <option value="service2">중급 한국어</option>
                  <option value="service3">고급 한국어</option>
                  <option value="service4">회화 연습</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  시간 선택
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">시간 선택</option>
                  <option value="09:00">09:00</option>
                  <option value="10:00">10:00</option>
                  <option value="11:00">11:00</option>
                  <option value="14:00">14:00</option>
                  <option value="15:00">15:00</option>
                  <option value="16:00">16:00</option>
                  <option value="17:00">17:00</option>
                  <option value="18:00">18:00</option>
                </select>
              </div>

              <button
                onClick={handleManualAttendance}
                disabled={isTagging || !selectedService || !selectedTime}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-5 h-5" />
                {isTagging ? "등록 중..." : "수동 출석 등록"}
              </button>
            </div>
          </div>
        )}

        {/* 기타 선택 팝업 */}
        {showOtherOptions && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              기타 선택
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  선택 항목
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="otherType"
                      value="consultation"
                      checked={selectedOtherType === "consultation"}
                      onChange={(e) =>
                        setSelectedOtherType(
                          e.target.value as
                            | "consultation"
                            | "materials"
                            | "other",
                        )
                      }
                      className="text-green-600 focus:ring-green-500"
                    />
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    <span>상담</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="otherType"
                      value="materials"
                      checked={selectedOtherType === "materials"}
                      onChange={(e) =>
                        setSelectedOtherType(
                          e.target.value as
                            | "consultation"
                            | "materials"
                            | "other",
                        )
                      }
                      className="text-green-600 focus:ring-green-500"
                    />
                    <ShoppingCart className="w-5 h-5 text-purple-600" />
                    <span>교재 구매</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="otherType"
                      value="other"
                      checked={selectedOtherType === "other"}
                      onChange={(e) =>
                        setSelectedOtherType(
                          e.target.value as
                            | "consultation"
                            | "materials"
                            | "other",
                        )
                      }
                      className="text-green-600 focus:ring-green-500"
                    />
                    <MoreHorizontal className="w-5 h-5 text-gray-600" />
                    <span>기타</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  메모 (선택사항)
                </label>
                <textarea
                  value={otherNotes}
                  onChange={(e) => setOtherNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="추가 메모를 입력하세요..."
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowOtherOptions(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleOtherTagging}
                  disabled={isTagging}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  {isTagging ? "처리 중..." : "기타 기록"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 관리자 링크 */}
        <div className="mt-8 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tagging/employee"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <User className="w-5 h-5" />
              직원 태깅
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

"use client";

import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Clock,
  Smartphone,
  Tablet,
  Monitor,
} from "lucide-react";

interface TaggingResult {
  success: boolean;
  message: string;
  action:
    | "attendance"
    | "consultation"
    | "purchase"
    | "other"
    | "checkout"
    | "already_tagged";
  data?: any;
  showPopup?: boolean;
  popupType?:
    | "attendance_confirm"
    | "no_reservation"
    | "checkout_confirm"
    | "multiple_tag"
    | "registration";
}

interface TabletTaggingInterfaceProps {
  deviceType: "ipad" | "mac";
  location: string;
}

export default function TabletTaggingInterface({
  deviceType,
  location,
}: TabletTaggingInterfaceProps) {
  const [isWaiting, setIsWaiting] = useState(false);
  const [taggingResult, setTaggingResult] = useState<TaggingResult | null>(
    null,
  );
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState<string>("");
  const [popupData, setPopupData] = useState<any>(null);

  // NFC/FeliCa 읽기 시뮬레이션
  const simulateTagging = async (uid: string) => {
    setIsWaiting(true);

    try {
      const response = await fetch("/api/tagging/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid,
          deviceType,
          location,
        }),
      });

      const result: TaggingResult = await response.json();
      setTaggingResult(result);

      if (result.showPopup) {
        setPopupType(result.popupType || "");
        setPopupData(result.data);
        setShowPopup(true);
      }
    } catch (error) {
      console.error("Tagging error:", error);
      setTaggingResult({
        success: false,
        message: "태깅 처리 중 오류가 발생했습니다.",
        action: "other",
      });
    } finally {
      setIsWaiting(false);
    }
  };

  const handleAttendanceConfirm = async () => {
    if (!popupData?.reservation?.id) return;

    try {
      const response = await fetch("/api/tagging/confirm-attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: popupData.uid,
          reservationId: popupData.reservation.id,
          points: 10,
        }),
      });

      const result = await response.json();
      setTaggingResult(result);
      setShowPopup(false);
    } catch (error) {
      console.error("Attendance confirmation error:", error);
    }
  };

  const handleNoReservationAttendance = async () => {
    try {
      const response = await fetch("/api/tagging/confirm-attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: popupData?.uid,
          points: 5,
        }),
      });

      const result = await response.json();
      setTaggingResult(result);
      setShowPopup(false);
    } catch (error) {
      console.error("Attendance confirmation error:", error);
    }
  };

  const handleCheckoutConfirm = async () => {
    // 퇴근 처리 로직
    setShowPopup(false);
    setTaggingResult({
      success: true,
      message: "퇴근이 확인되었습니다.",
      action: "checkout",
    });
  };

  const handleRegistration = () => {
    // UID 등록 페이지로 이동
    window.open(`/tagging/register?uid=${popupData?.uid}`, "_blank");
    setShowPopup(false);
  };

  const getDeviceIcon = () => {
    switch (deviceType) {
      case "ipad":
        return <Tablet className="w-8 h-8" />;
      case "mac":
        return <Monitor className="w-8 h-8" />;
      default:
        return <Smartphone className="w-8 h-8" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            {getDeviceIcon()}
            <h1 className="text-3xl font-bold text-gray-900">
              UID 태깅 시스템
            </h1>
          </div>
          <p className="text-gray-600">
            {deviceType === "ipad" ? "iPad" : "Mac"} - {location}
          </p>
        </div>

        {/* 태깅 대기 화면 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center">
            {isWaiting ? (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-lg text-gray-600">태깅 처리 중...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Smartphone className="w-12 h-12 text-blue-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  카드 또는 스마트폰을 태깅하세요
                </h2>
                <p className="text-gray-600">
                  IC카드나 스마트폰을 기기에 가져다 대면 자동으로 처리됩니다
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 테스트 버튼 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            테스트 태깅
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => simulateTagging("student_001")}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <User className="w-6 h-6 text-blue-600 mb-2" />
              <div className="text-sm font-medium">학생 태깅</div>
            </button>
            <button
              onClick={() => simulateTagging("staff_001")}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Clock className="w-6 h-6 text-green-600 mb-2" />
              <div className="text-sm font-medium">직원 태깅</div>
            </button>
            <button
              onClick={() => simulateTagging("new_uid_001")}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <AlertCircle className="w-6 h-6 text-orange-600 mb-2" />
              <div className="text-sm font-medium">신규 UID</div>
            </button>
            <button
              onClick={() => simulateTagging("already_tagged_001")}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <XCircle className="w-6 h-6 text-red-600 mb-2" />
              <div className="text-sm font-medium">중복 태깅</div>
            </button>
          </div>
        </div>

        {/* 결과 표시 */}
        {taggingResult && (
          <div
            className={`bg-white rounded-2xl shadow-xl p-8 ${
              taggingResult.success
                ? "border-l-4 border-green-500"
                : "border-l-4 border-red-500"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              {taggingResult.success ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
              <h3 className="text-lg font-semibold text-gray-900">
                {taggingResult.success ? "성공" : "오류"}
              </h3>
            </div>
            <p className="text-gray-700">{taggingResult.message}</p>
            {taggingResult.data && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <pre className="text-sm text-gray-600">
                  {JSON.stringify(taggingResult.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 팝업 */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {popupType === "attendance_confirm" && "출석 확인"}
              {popupType === "no_reservation" && "예약 없음"}
              {popupType === "checkout_confirm" && "퇴근 확인"}
              {popupType === "registration" && "UID 등록"}
            </h3>

            <p className="text-gray-700 mb-6">
              {popupType === "attendance_confirm" && "出席を確認 / その他"}
              {popupType === "no_reservation" &&
                "本日の予約がありません。出席を記録しますか？"}
              {popupType === "checkout_confirm" && "퇴근하시겠습니까?"}
              {popupType === "registration" &&
                "새로운 UID가 등록되었습니다. 사용자 정보를 입력해주세요."}
            </p>

            <div className="flex gap-3">
              {popupType === "attendance_confirm" && (
                <>
                  <button
                    onClick={handleAttendanceConfirm}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                  >
                    출석 확인
                  </button>
                  <button
                    onClick={() => setShowPopup(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                  >
                    기타
                  </button>
                </>
              )}

              {popupType === "no_reservation" && (
                <>
                  <button
                    onClick={handleNoReservationAttendance}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                  >
                    출석 기록
                  </button>
                  <button
                    onClick={() => setShowPopup(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                  >
                    취소
                  </button>
                </>
              )}

              {popupType === "checkout_confirm" && (
                <>
                  <button
                    onClick={handleCheckoutConfirm}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                  >
                    퇴근
                  </button>
                  <button
                    onClick={() => setShowPopup(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                  >
                    취소
                  </button>
                </>
              )}

              {popupType === "registration" && (
                <>
                  <button
                    onClick={handleRegistration}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                  >
                    등록하기
                  </button>
                  <button
                    onClick={() => setShowPopup(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                  >
                    나중에
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

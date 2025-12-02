"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Smartphone,
  ArrowLeft,
  Home,
} from "lucide-react";
import { useRouter } from "next/navigation";

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

interface MobileTaggingInterfaceProps {
  uid: string;
  deviceType: "smartphone";
  location: string;
}

export default function MobileTaggingInterface({
  uid,
  deviceType,
  location,
}: MobileTaggingInterfaceProps) {
  const router = useRouter();
  const [isWaiting, setIsWaiting] = useState(false);
  const [taggingResult, setTaggingResult] = useState<TaggingResult | null>(
    null,
  );
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState<string>("");
  const [popupData, setPopupData] = useState<any>(null);

  // 자동 태깅 처리
  useEffect(() => {
    if (uid) {
      processTagging();
    }
  }, [uid]);

  const processTagging = async () => {
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
          uid,
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
          uid,
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
    router.push(`/tagging/register?uid=${uid}`);
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={handleGoHome}
            className="flex items-center gap-2 text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>홈으로</span>
          </button>
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-600" />
            <span className="font-medium">태깅 시스템</span>
          </div>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="p-4">
        {/* 태깅 대기 화면 */}
        {isWaiting && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">태깅 처리 중...</p>
            </div>
          </div>
        )}

        {/* 결과 표시 */}
        {taggingResult && !isWaiting && (
          <div
            className={`bg-white rounded-2xl shadow-xl p-6 mb-4 ${
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
            <p className="text-gray-700 mb-4">{taggingResult.message}</p>

            {taggingResult.data && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">상세 정보</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  {taggingResult.data.user && (
                    <div>사용자: {taggingResult.data.user.name}</div>
                  )}
                  {taggingResult.data.reservation && (
                    <div>예약: {taggingResult.data.reservation.date}</div>
                  )}
                  {taggingResult.data.pointsEarned && (
                    <div>포인트: +{taggingResult.data.pointsEarned}점</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* UID 정보 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">UID 정보</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">UID:</span>
              <span className="font-mono text-gray-900">{uid}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">위치:</span>
              <span className="text-gray-900">{location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">시간:</span>
              <span className="text-gray-900">
                {new Date().toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="space-y-3">
          <button
            onClick={handleGoHome}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            <Home className="w-5 h-5 inline mr-2" />
            홈으로 돌아가기
          </button>

          {taggingResult?.success && (
            <button
              onClick={() => setTaggingResult(null)}
              className="w-full bg-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-400 transition-colors"
            >
              다시 태깅하기
            </button>
          )}
        </div>
      </div>

      {/* 팝업 */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
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

            <div className="space-y-3">
              {popupType === "attendance_confirm" && (
                <>
                  <button
                    onClick={handleAttendanceConfirm}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700"
                  >
                    출석 확인
                  </button>
                  <button
                    onClick={() => setShowPopup(false)}
                    className="w-full bg-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-400"
                  >
                    기타
                  </button>
                </>
              )}

              {popupType === "no_reservation" && (
                <>
                  <button
                    onClick={handleNoReservationAttendance}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700"
                  >
                    출석 기록
                  </button>
                  <button
                    onClick={() => setShowPopup(false)}
                    className="w-full bg-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-400"
                  >
                    취소
                  </button>
                </>
              )}

              {popupType === "checkout_confirm" && (
                <>
                  <button
                    onClick={handleCheckoutConfirm}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-green-700"
                  >
                    퇴근
                  </button>
                  <button
                    onClick={() => setShowPopup(false)}
                    className="w-full bg-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-400"
                  >
                    취소
                  </button>
                </>
              )}

              {popupType === "registration" && (
                <>
                  <button
                    onClick={handleRegistration}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700"
                  >
                    등록하기
                  </button>
                  <button
                    onClick={() => setShowPopup(false)}
                    className="w-full bg-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-400"
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

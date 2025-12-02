"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle,
  Calendar,
  Clock,
  User,
  Video,
  MapPin,
  Download,
  Share2,
  ArrowRight,
  Copy,
  Loader2,
} from "lucide-react";

interface Reservation {
  id: string;
  courseName: string;
  duration: number;
  date: string;
  time: string;
  type: "online" | "offline";
  price: number;
  reservationCode: string;
  studentName: string;
  studentEmail: string;
}

function ReservationConfirmPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reservationId = searchParams.get("reservationId");

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (reservationId) {
      fetchReservationDetails();
    }
  }, [reservationId]);

  const fetchReservationDetails = async () => {
    try {
      const response = await fetch(
        `/api/reservation/japanese/details?reservationId=${reservationId}`,
      );
      const result = await response.json();

      if (result.success) {
        setReservation(result.reservation);
      } else {
        setError(result.error || "予約詳細の取得に失敗しました");
      }
    } catch (error) {
      setError("サーバーエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCalendar = () => {
    if (!reservation) return;

    const event = {
      summary: `韓国語レッスン - ${reservation.courseName}`,
      description: `予約コード: ${reservation.reservationCode}\n学生: ${reservation.studentName}`,
      start: {
        dateTime: `${reservation.date}T${reservation.time}:00`,
        timeZone: "Asia/Tokyo",
      },
      end: {
        dateTime: `${reservation.date}T${reservation.time}:00`,
        timeZone: "Asia/Tokyo",
      },
    };

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.summary)}&dates=${event.start.dateTime}/${event.end.dateTime}&details=${encodeURIComponent(event.description)}`;
    window.open(calendarUrl, "_blank");
  };

  const handleCopyReservationCode = async () => {
    if (!reservation) return;

    try {
      await navigator.clipboard.writeText(reservation.reservationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleShare = async () => {
    if (!reservation) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "韓国語レッスン予約",
          text: `韓国語レッスンの予約が完了しました。予約コード: ${reservation.reservationCode}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Share failed:", error);
      }
    } else {
      // 폴백: 클립보드에 복사
      handleCopyReservationCode();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">予約詳細を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            エラーが発生しました
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "予約が見つかりません"}
          </p>
          <button
            onClick={() => router.push("/reservation/japanese")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* 성공 메시지 */}
        <div className="text-center mb-8">
          <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            予約が完了しました！
          </h1>
          <p className="text-gray-600">
            予約の詳細は以下の通りです。確認メールも送信されました。
          </p>
        </div>

        {/* 예약 상세 정보 */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">予約詳細</h2>

          <div className="space-y-6">
            {/* 예약 코드 */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">
                    予約コード
                  </p>
                  <p className="text-2xl font-bold text-blue-900 font-mono">
                    {reservation.reservationCode}
                  </p>
                </div>
                <button
                  onClick={handleCopyReservationCode}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copied ? "コピー済み" : "コピー"}</span>
                </button>
              </div>
            </div>

            {/* 코스 정보 */}
            <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
              <div className="bg-blue-100 rounded-full p-3">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">コース</p>
                <p className="text-lg font-semibold text-gray-900">
                  {reservation.courseName} ({reservation.duration}分)
                </p>
              </div>
            </div>

            {/* 날짜 */}
            <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
              <div className="bg-green-100 rounded-full p-3">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">日付</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDate(reservation.date)}
                </p>
              </div>
            </div>

            {/* 시간 */}
            <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
              <div className="bg-purple-100 rounded-full p-3">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">時間</p>
                <p className="text-lg font-semibold text-gray-900">
                  {reservation.time}
                </p>
              </div>
            </div>

            {/* 수업 타입 */}
            <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
              <div className="bg-orange-100 rounded-full p-3">
                {reservation.type === "online" ? (
                  <Video className="w-6 h-6 text-orange-600" />
                ) : (
                  <MapPin className="w-6 h-6 text-orange-600" />
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">レッスン形式</p>
                <p className="text-lg font-semibold text-gray-900">
                  {reservation.type === "online" ? "オンライン" : "対面"}
                </p>
              </div>
            </div>

            {/* 가격 */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-lg font-medium text-gray-900">料金</span>
              <span className="text-2xl font-bold text-blue-600">
                ¥{reservation.price.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={handleAddToCalendar}
            className="flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>カレンダーに追加</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span>共有</span>
          </button>

          <button
            onClick={() => router.push("/reservation/japanese/mypage")}
            className="flex items-center justify-center space-x-2 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <span>すべての予約を確認</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* 추가 정보 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">
            重要なお知らせ
          </h3>
          <ul className="space-y-2 text-sm text-yellow-700">
            <li>
              • レッスン開始10分前にZoomリンクが送信されます（オンラインの場合）
            </li>
            <li>• 対面レッスンの場合は、教室の場所を事前にご確認ください</li>
            <li>• キャンセルはレッスン開始24時間前まで可能です</li>
            <li>• ご質問がございましたら、お気軽にお問い合わせください</li>
          </ul>
        </div>

        {/* 하단 버튼 */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push("/reservation/japanese")}
            className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReservationConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      }
    >
      <ReservationConfirmPageContent />
    </Suspense>
  );
}

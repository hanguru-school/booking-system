"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  Clock,
  CreditCard,
  ShoppingCart,
  CheckCircle,
} from "lucide-react";

interface PurchaseOption {
  id: string;
  type: "points" | "time";
  name: string;
  amount: number;
  price: number;
  originalPrice?: number;
  discount?: number;
  popular?: boolean;
  description: string;
}

export default function StudentPurchasePage() {
  const [purchaseOptions, setPurchaseOptions] = useState<PurchaseOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    // 실제 API 호출로 대체
    setTimeout(() => {
      setCurrentPoints(150);
      setCurrentTime(12);

      setPurchaseOptions([
        // 포인트 옵션
        {
          id: "points-100",
          type: "points",
          name: "100 포인트",
          amount: 100,
          price: 100, // 1엔 = 1포인트
          description: "기본 포인트 패키지",
        },
        {
          id: "points-500",
          type: "points",
          name: "500 포인트",
          amount: 500,
          price: 500,
          originalPrice: 550,
          discount: 10,
          popular: true,
          description: "인기 포인트 패키지 (10% 할인)",
        },
        {
          id: "points-1000",
          type: "points",
          name: "1000 포인트",
          amount: 1000,
          price: 1000,
          originalPrice: 1200,
          discount: 17,
          description: "대용량 포인트 패키지 (17% 할인)",
        },
        // 시간 옵션
        {
          id: "time-10",
          type: "time",
          name: "10시간",
          amount: 10,
          price: 21600, // 360불 = 21,600원
          description: "기본 시간 패키지",
        },
        {
          id: "time-20",
          type: "time",
          name: "20시간",
          amount: 20,
          price: 43200,
          originalPrice: 48000,
          discount: 10,
          popular: true,
          description: "인기 시간 패키지 (10% 할인)",
        },
        {
          id: "time-40",
          type: "time",
          name: "40시간",
          amount: 40,
          price: 86400,
          originalPrice: 96000,
          discount: 10,
          description: "대용량 시간 패키지 (10% 할인)",
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handlePurchase = (optionId: string) => {
    const option = purchaseOptions.find((opt) => opt.id === optionId);
    if (!option) return;

    // 실제 결제 로직으로 대체
    alert(
      `${option.name} 구매를 진행합니다.\n가격: ${option.price.toLocaleString()}원`,
    );
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString() + "원";
  };

  const formatPoints = (points: number) => {
    return points.toLocaleString() + "P";
  };

  const formatTime = (hours: number) => {
    return hours + "시간";
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/student/home"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>홈으로 돌아가기</span>
        </Link>
      </div>

      {/* 현재 보유량 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Star className="w-8 h-8 text-yellow-600" />
            <h2 className="text-xl font-semibold text-gray-900">현재 포인트</h2>
          </div>
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {formatPoints(currentPoints)}
          </div>
          <p className="text-sm text-gray-600">1엔 = 1포인트</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-8 h-8 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              현재 수업 시간
            </h2>
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {formatTime(currentTime)}
          </div>
          <p className="text-sm text-gray-600">360불 = 21,600원</p>
        </div>
      </div>

      {/* 포인트 구매 섹션 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <Star className="w-6 h-6 text-yellow-600" />
          포인트 구매
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {purchaseOptions
            .filter((option) => option.type === "points")
            .map((option) => (
              <div
                key={option.id}
                className={`bg-white rounded-xl shadow-lg p-6 border-2 transition-all cursor-pointer ${
                  selectedOption === option.id
                    ? "border-blue-500 shadow-xl"
                    : "border-gray-200 hover:border-gray-300"
                } ${option.popular ? "ring-2 ring-yellow-400" : ""}`}
                onClick={() => setSelectedOption(option.id)}
              >
                {option.popular && (
                  <div className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full inline-block mb-3">
                    인기
                  </div>
                )}

                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {option.name}
                </h3>

                <div className="mb-4">
                  {option.originalPrice ? (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-blue-600">
                        {formatPrice(option.price)}
                      </span>
                      <span className="text-lg text-gray-400 line-through">
                        {formatPrice(option.originalPrice)}
                      </span>
                      <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-1 rounded">
                        {option.discount}% 할인
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-blue-600">
                      {formatPrice(option.price)}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  {option.description}
                </p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePurchase(option.id);
                  }}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  구매하기
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* 시간 구매 섹션 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <Clock className="w-6 h-6 text-blue-600" />
          수업 시간 구매
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {purchaseOptions
            .filter((option) => option.type === "time")
            .map((option) => (
              <div
                key={option.id}
                className={`bg-white rounded-xl shadow-lg p-6 border-2 transition-all cursor-pointer ${
                  selectedOption === option.id
                    ? "border-blue-500 shadow-xl"
                    : "border-gray-200 hover:border-gray-300"
                } ${option.popular ? "ring-2 ring-yellow-400" : ""}`}
                onClick={() => setSelectedOption(option.id)}
              >
                {option.popular && (
                  <div className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full inline-block mb-3">
                    인기
                  </div>
                )}

                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {option.name}
                </h3>

                <div className="mb-4">
                  {option.originalPrice ? (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-blue-600">
                        {formatPrice(option.price)}
                      </span>
                      <span className="text-lg text-gray-400 line-through">
                        {formatPrice(option.originalPrice)}
                      </span>
                      <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-1 rounded">
                        {option.discount}% 할인
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-blue-600">
                      {formatPrice(option.price)}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  {option.description}
                </p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePurchase(option.id);
                  }}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  구매하기
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* 구매 안내 */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          구매 안내
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-blue-900 mb-2">포인트 구매</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 1엔 = 1포인트로 계산됩니다</li>
              <li>• 포인트는 성취 달성, 보상 등에 사용됩니다</li>
              <li>• 구매한 포인트는 즉시 적립됩니다</li>
              <li>• 포인트는 환불되지 않습니다</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-2">수업 시간 구매</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 360불 = 21,600원으로 계산됩니다</li>
              <li>• 구매한 시간은 수업 예약에 사용됩니다</li>
              <li>• 시간은 구매일로부터 1년간 유효합니다</li>
              <li>• 미사용 시간은 환불되지 않습니다</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 결제 수단 안내 */}
      <div className="bg-gray-50 rounded-xl p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          결제 수단
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-white rounded-lg">
            <div className="text-2xl mb-2">💳</div>
            <div className="text-sm font-medium">신용카드</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg">
            <div className="text-2xl mb-2">🏦</div>
            <div className="text-sm font-medium">계좌이체</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg">
            <div className="text-2xl mb-2">📱</div>
            <div className="text-sm font-medium">모바일결제</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg">
            <div className="text-2xl mb-2">💰</div>
            <div className="text-sm font-medium">현금결제</div>
          </div>
        </div>
      </div>
    </div>
  );
}

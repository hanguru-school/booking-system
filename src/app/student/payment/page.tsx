"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Coins,
  Clock,
  CheckCircle,
  AlertCircle,
  ShoppingCart,
  Star,
} from "lucide-react";

interface PaymentPlan {
  id: string;
  name: string;
  hours: number;
  price: number;
  originalPrice?: number;
  discount?: number;
  points: number;
  popular?: boolean;
  description: string;
}

interface PaymentRule {
  id: string;
  name: string;
  type: "percentage" | "fixed";
  value: number;
  minAmount?: number;
  maxAmount?: number;
  isActive: boolean;
}

const PaymentPage = () => {
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  const [paymentRules, setPaymentRules] = useState<PaymentRule[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data
    const mockPaymentPlans: PaymentPlan[] = [
      {
        id: "1",
        name: "기본 패키지",
        hours: 10,
        price: 150000,
        points: 7500,
        description: "10시간 수업 + 기본 포인트 적립",
      },
      {
        id: "2",
        name: "인기 패키지",
        hours: 20,
        price: 280000,
        originalPrice: 300000,
        discount: 7,
        points: 14000,
        popular: true,
        description: "20시간 수업 + 보너스 포인트 적립",
      },
      {
        id: "3",
        name: "프리미엄 패키지",
        hours: 40,
        price: 500000,
        originalPrice: 600000,
        discount: 17,
        points: 25000,
        description: "40시간 수업 + 최대 포인트 적립",
      },
      {
        id: "4",
        name: "단일 수업",
        hours: 1,
        price: 20000,
        points: 1000,
        description: "1시간 단일 수업",
      },
    ];

    const mockPaymentRules: PaymentRule[] = [
      {
        id: "1",
        name: "기본 적립률",
        type: "percentage",
        value: 5,
        minAmount: 10000,
        maxAmount: 0,
        isActive: true,
      },
      {
        id: "2",
        name: "고액 결제 보너스",
        type: "fixed",
        value: 500,
        minAmount: 100000,
        maxAmount: 0,
        isActive: true,
      },
      {
        id: "3",
        name: "첫 결제 보너스",
        type: "fixed",
        value: 1000,
        minAmount: 0,
        maxAmount: 0,
        isActive: true,
      },
    ];

    setPaymentPlans(mockPaymentPlans);
    setPaymentRules(mockPaymentRules);
    setLoading(false);
  }, []);

  const calculatePoints = (price: number): number => {
    let totalPoints = 0;

    // 기본 적립률 적용
    const basicRule = paymentRules.find((rule) => rule.name === "기본 적립률");
    if (basicRule && basicRule.isActive) {
      totalPoints += Math.floor(price * (basicRule.value / 100));
    }

    // 고액 결제 보너스
    const bonusRule = paymentRules.find(
      (rule) => rule.name === "고액 결제 보너스",
    );
    if (
      bonusRule &&
      bonusRule.isActive &&
      price >= (bonusRule.minAmount || 0)
    ) {
      totalPoints += bonusRule.value;
    }

    // 첫 결제 보너스 (실제로는 사용자 정보를 확인해야 함)
    const firstPaymentRule = paymentRules.find(
      (rule) => rule.name === "첫 결제 보너스",
    );
    if (firstPaymentRule && firstPaymentRule.isActive) {
      totalPoints += firstPaymentRule.value;
    }

    return totalPoints;
  };

  const handleSelectPlan = (plan: PaymentPlan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePayment = () => {
    if (selectedPlan) {
      // 교실에서 결제 안내
      alert(
        "인터넷 결제 시스템은 현재 준비 중입니다.\n결제는 교실에서 직접 해주시기 바랍니다.",
      );
      setShowPaymentModal(false);
      setSelectedPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">수업 결제</h1>
        <p className="text-gray-600">
          원하는 수업 패키지를 선택하고 결제하세요
        </p>
      </div>

      {/* 포인트 적립 안내 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Coins className="w-5 h-5 text-blue-600" />
          포인트 적립 안내
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {paymentRules
            .filter((rule) => rule.isActive)
            .map((rule) => (
              <div key={rule.id} className="bg-white p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-yellow-600" />
                  <h3 className="font-medium text-gray-900">{rule.name}</h3>
                </div>
                <p className="text-sm text-gray-600">
                  {rule.type === "percentage"
                    ? `결제 금액의 ${rule.value}% 적립`
                    : `${rule.value}P 적립`}
                  {rule.minAmount && rule.minAmount > 0 && (
                    <span className="block text-xs text-gray-500 mt-1">
                      최소 {rule.minAmount.toLocaleString()}원 이상
                    </span>
                  )}
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* 결제 패키지 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {paymentPlans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-lg shadow-sm border p-6 relative ${
              plan.popular ? "ring-2 ring-blue-500" : ""
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                  인기
                </span>
              </div>
            )}

            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {plan.name}
              </h3>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">{plan.hours}시간</span>
              </div>
              <p className="text-sm text-gray-500">{plan.description}</p>
            </div>

            <div className="text-center mb-4">
              {plan.originalPrice && plan.discount ? (
                <div className="mb-2">
                  <span className="text-lg line-through text-gray-400">
                    {plan.originalPrice.toLocaleString()}원
                  </span>
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                    {plan.discount}% 할인
                  </span>
                </div>
              ) : null}
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {plan.price.toLocaleString()}원
              </div>
              <div className="flex items-center justify-center gap-1 text-sm text-green-600">
                <Coins className="w-4 h-4" />
                <span>{plan.points}P 적립</span>
              </div>
            </div>

            <button
              onClick={() => handleSelectPlan(plan)}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                plan.popular
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-100 text-gray-900 hover:bg-gray-200"
              }`}
            >
              선택하기
            </button>
          </div>
        ))}
      </div>

      {/* 결제 모달 */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              결제 정보
            </h3>

            <div className="space-y-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  {selectedPlan.name}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">수업 시간:</span>
                    <span className="font-medium">
                      {selectedPlan.hours}시간
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">결제 금액:</span>
                    <span className="font-medium">
                      {selectedPlan.price.toLocaleString()}원
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">적립 포인트:</span>
                    <span className="font-medium text-green-600">
                      {selectedPlan.points}P
                    </span>
                  </div>
                  {selectedPlan.originalPrice && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">할인 금액:</span>
                      <span className="font-medium text-red-600">
                        -
                        {(
                          selectedPlan.originalPrice - selectedPlan.price
                        ).toLocaleString()}
                        원
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  결제 방법
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-blue-600"
                    />
                    <CreditCard className="w-4 h-4" />
                    <span>신용카드</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="transfer"
                      checked={paymentMethod === "transfer"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-blue-600"
                    />
                    <ShoppingCart className="w-4 h-4" />
                    <span>계좌이체</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePayment}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                결제하기
              </button>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedPlan(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 결제 안내 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">결제 안내</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
            <span>결제 완료 후 즉시 수업 예약이 가능합니다.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
            <span>포인트는 결제 완료 후 자동으로 적립됩니다.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
            <span>수업 시간은 구매일로부터 1년간 유효합니다.</span>
          </div>
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
            <span>환불은 구매일로부터 7일 이내에만 가능합니다.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;

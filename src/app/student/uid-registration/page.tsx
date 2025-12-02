"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard, Plus, Trash2 } from "lucide-react";

interface UIDCard {
  id: string;
  uid: string;
  cardType: string;
  registeredAt: string;
  isActive: boolean;
}

export default function StudentUIDRegistrationPage() {
  const [cards, setCards] = useState<UIDCard[]>([
    {
      id: "1",
      uid: "1234567890",
      cardType: "학생증",
      registeredAt: "2024-01-15",
      isActive: true,
    },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUID, setNewUID] = useState("");
  const [newCardType, setNewCardType] = useState("");

  const handleAddCard = () => {
    if (newUID.trim() && newCardType.trim()) {
      const newCard: UIDCard = {
        id: Date.now().toString(),
        uid: newUID.trim(),
        cardType: newCardType.trim(),
        registeredAt: new Date().toISOString().split("T")[0],
        isActive: true,
      };
      setCards([...cards, newCard]);
      setNewUID("");
      setNewCardType("");
      setShowAddForm(false);
    }
  };

  const handleRemoveCard = (id: string) => {
    setCards(cards.filter((card) => card.id !== id));
  };

  const handleToggleActive = (id: string) => {
    setCards(
      cards.map((card) =>
        card.id === id ? { ...card, isActive: !card.isActive } : card,
      ),
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
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

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">UID 등록</h1>
        <p className="text-gray-600">
          학생증이나 카드의 UID를 등록하여 출입 관리에 활용하세요
        </p>
      </div>

      {/* 등록된 카드 목록 */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">등록된 카드</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />새 카드 등록
          </button>
        </div>

        {cards.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>등록된 카드가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cards.map((card) => (
              <div
                key={card.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <CreditCard className="w-8 h-8 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {card.cardType}
                    </div>
                    <div className="text-sm text-gray-600">UID: {card.uid}</div>
                    <div className="text-xs text-gray-500">
                      등록일: {card.registeredAt}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleActive(card.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      card.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {card.isActive ? "활성" : "비활성"}
                  </button>
                  <button
                    onClick={() => handleRemoveCard(card.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 새 카드 등록 폼 */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            새 카드 등록
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카드 종류
              </label>
              <select
                value={newCardType}
                onChange={(e) => setNewCardType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">카드 종류를 선택하세요</option>
                <option value="학생증">학생증</option>
                <option value="교통카드">교통카드</option>
                <option value="신분증">신분증</option>
                <option value="기타">기타</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                UID 번호
              </label>
              <input
                type="text"
                value={newUID}
                onChange={(e) => setNewUID(e.target.value)}
                placeholder="카드의 UID 번호를 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddCard}
                disabled={!newUID.trim() || !newCardType.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                등록하기
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 사용 안내 */}
      <div className="mt-8 bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          UID 등록 안내
        </h3>
        <div className="space-y-3 text-blue-800">
          <p className="text-sm">
            • UID는 카드의 고유 식별 번호로, 출입 관리 시스템에서 사용됩니다.
          </p>
          <p className="text-sm">
            • 학생증, 교통카드, 신분증 등 다양한 카드를 등록할 수 있습니다.
          </p>
          <p className="text-sm">
            • 등록된 카드로 학교 출입 시 자동으로 출석이 기록됩니다.
          </p>
          <p className="text-sm">
            • 카드를 분실한 경우 즉시 비활성화하여 보안을 유지하세요.
          </p>
        </div>
      </div>
    </div>
  );
}

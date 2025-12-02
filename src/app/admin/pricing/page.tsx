"use client";

import { useState, useEffect } from "react";
import { Save, Star, Clock } from "lucide-react";

interface PricingSettings {
  pointsRate: number; // 1엔 = ?포인트
  timeRate: number; // 360불 = ?원
  pointPackages: Array<{
    id: string;
    name: string;
    amount: number;
    price: number;
    originalPrice?: number;
    discount?: number;
    popular: boolean;
    active: boolean;
  }>;
  timePackages: Array<{
    id: string;
    name: string;
    amount: number;
    price: number;
    originalPrice?: number;
    discount?: number;
    popular: boolean;
    active: boolean;
  }>;
}

export default function AdminPricingPage() {
  const [settings, setSettings] = useState<PricingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // 실제 API 호출로 대체
    setTimeout(() => {
      setSettings({
        pointsRate: 1, // 1엔 = 1포인트
        timeRate: 21600, // 360불 = 21,600원
        pointPackages: [
          {
            id: "points-100",
            name: "100 포인트",
            amount: 100,
            price: 100,
            popular: false,
            active: true,
          },
          {
            id: "points-500",
            name: "500 포인트",
            amount: 500,
            price: 500,
            originalPrice: 550,
            discount: 10,
            popular: true,
            active: true,
          },
          {
            id: "points-1000",
            name: "1000 포인트",
            amount: 1000,
            price: 1000,
            originalPrice: 1200,
            discount: 17,
            popular: false,
            active: true,
          },
        ],
        timePackages: [
          {
            id: "time-10",
            name: "10시간",
            amount: 10,
            price: 21600,
            popular: false,
            active: true,
          },
          {
            id: "time-20",
            name: "20시간",
            amount: 20,
            price: 43200,
            originalPrice: 48000,
            discount: 10,
            popular: true,
            active: true,
          },
          {
            id: "time-40",
            name: "40시간",
            amount: 40,
            price: 86400,
            originalPrice: 96000,
            discount: 10,
            popular: false,
            active: true,
          },
        ],
      });
      setLoading(false);
    }, 1000);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // 실제 API 호출로 대체
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("가격 설정이 저장되었습니다.");
    } catch (error) {
      alert("저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const updatePointsRate = (rate: number) => {
    if (!settings) return;
    setSettings({
      ...settings,
      pointsRate: rate,
    });
  };

  const updateTimeRate = (rate: number) => {
    if (!settings) return;
    setSettings({
      ...settings,
      timeRate: rate,
    });
  };

  const updatePointPackage = (
    id: string,
    field: string,
    value: string | number | boolean | undefined,
  ) => {
    if (!settings) return;
    setSettings({
      ...settings,
      pointPackages: settings.pointPackages.map((pkg) =>
        pkg.id === id ? { ...pkg, [field]: value } : pkg,
      ),
    });
  };

  const updateTimePackage = (
    id: string,
    field: string,
    value: string | number | boolean | undefined,
  ) => {
    if (!settings) return;
    setSettings({
      ...settings,
      timePackages: settings.timePackages.map((pkg) =>
        pkg.id === id ? { ...pkg, [field]: value } : pkg,
      ),
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">가격 설정</h1>
          <p className="text-gray-600 mt-2">
            포인트 및 수업 시간 가격을 관리합니다
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? "저장 중..." : "저장"}
        </button>
      </div>

      {/* 환율 설정 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Star className="w-6 h-6 text-yellow-600" />
            <h2 className="text-xl font-semibold text-gray-900">포인트 환율</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                1엔 = ?포인트
              </label>
              <input
                type="number"
                value={settings.pointsRate}
                onChange={(e) =>
                  updatePointsRate(parseInt(e.target.value) || 1)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
              />
            </div>
            <div className="text-sm text-gray-600">
              현재 설정: 1엔 = {settings.pointsRate}포인트
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">시간 환율</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                360불 = ?원
              </label>
              <input
                type="number"
                value={settings.timeRate}
                onChange={(e) =>
                  updateTimeRate(parseInt(e.target.value) || 21600)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
              />
            </div>
            <div className="text-sm text-gray-600">
              현재 설정: 360불 = {settings.timeRate.toLocaleString()}원
            </div>
          </div>
        </div>
      </div>

      {/* 포인트 패키지 관리 */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Star className="w-6 h-6 text-yellow-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            포인트 패키지 관리
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  패키지명
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  포인트
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  가격 (엔)
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  할인가
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  할인율
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  인기
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  활성
                </th>
              </tr>
            </thead>
            <tbody>
              {settings.pointPackages.map((pkg) => (
                <tr key={pkg.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={pkg.name}
                      onChange={(e) =>
                        updatePointPackage(pkg.id, "name", e.target.value)
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      value={pkg.amount}
                      onChange={(e) =>
                        updatePointPackage(
                          pkg.id,
                          "amount",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      value={pkg.price}
                      onChange={(e) =>
                        updatePointPackage(
                          pkg.id,
                          "price",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      value={pkg.originalPrice || ""}
                      onChange={(e) =>
                        updatePointPackage(
                          pkg.id,
                          "originalPrice",
                          e.target.value ? parseInt(e.target.value) : undefined,
                        )
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="할인가 없음"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      value={pkg.discount || ""}
                      onChange={(e) =>
                        updatePointPackage(
                          pkg.id,
                          "discount",
                          e.target.value ? parseInt(e.target.value) : undefined,
                        )
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pkg.popular}
                        onChange={(e) =>
                          updatePointPackage(
                            pkg.id,
                            "popular",
                            e.target.checked,
                          )
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </td>
                  <td className="py-3 px-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pkg.active}
                        onChange={(e) =>
                          updatePointPackage(pkg.id, "active", e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 시간 패키지 관리 */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            시간 패키지 관리
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  패키지명
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  시간
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  가격 (원)
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  할인가
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  할인율
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  인기
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  활성
                </th>
              </tr>
            </thead>
            <tbody>
              {settings.timePackages.map((pkg) => (
                <tr key={pkg.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={pkg.name}
                      onChange={(e) =>
                        updateTimePackage(pkg.id, "name", e.target.value)
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      value={pkg.amount}
                      onChange={(e) =>
                        updateTimePackage(
                          pkg.id,
                          "amount",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      value={pkg.price}
                      onChange={(e) =>
                        updateTimePackage(
                          pkg.id,
                          "price",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      value={pkg.originalPrice || ""}
                      onChange={(e) =>
                        updateTimePackage(
                          pkg.id,
                          "originalPrice",
                          e.target.value ? parseInt(e.target.value) : undefined,
                        )
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="할인가 없음"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      value={pkg.discount || ""}
                      onChange={(e) =>
                        updateTimePackage(
                          pkg.id,
                          "discount",
                          e.target.value ? parseInt(e.target.value) : undefined,
                        )
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pkg.popular}
                        onChange={(e) =>
                          updateTimePackage(pkg.id, "popular", e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </td>
                  <td className="py-3 px-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pkg.active}
                        onChange={(e) =>
                          updateTimePackage(pkg.id, "active", e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {settings.pointPackages.length}개
          </div>
          <div className="text-sm text-gray-600">포인트 패키지</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {settings.timePackages.length}개
          </div>
          <div className="text-sm text-gray-600">시간 패키지</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {settings.pointPackages.filter((p) => p.active).length}개
          </div>
          <div className="text-sm text-gray-600">활성 포인트</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {settings.timePackages.filter((p) => p.active).length}개
          </div>
          <div className="text-sm text-gray-600">활성 시간</div>
        </div>
      </div>
    </div>
  );
}

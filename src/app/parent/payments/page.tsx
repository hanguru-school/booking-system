"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  DollarSign,
  CheckCircle,
  Search,
  Download,
  Eye,
  Home,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

interface Payment {
  id: string;
  childName: string;
  courseName: string;
  amount: number;
  method: "card" | "bank_transfer" | "cash" | "online";
  status: "completed" | "pending" | "failed" | "refunded";
  date: string;
  dueDate: string;
  description: string;
  receiptNumber: string;
}

export default function ParentPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "completed" | "pending" | "failed" | "refunded"
  >("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [childFilter, setChildFilter] = useState("all");

  useEffect(() => {
    // 실제 API 호출로 대체
    setTimeout(() => {
      const mockPayments: Payment[] = [
        {
          id: "1",
          childName: "김철수",
          courseName: "한국어 기초 과정",
          amount: 300000,
          method: "card",
          status: "completed",
          date: "2024-01-15",
          dueDate: "2024-01-15",
          description: "2024년 1월 수강료",
          receiptNumber: "RCP-2024-001",
        },
        {
          id: "2",
          childName: "김영희",
          courseName: "한국어 기초 과정",
          amount: 300000,
          method: "bank_transfer",
          status: "completed",
          date: "2024-01-14",
          dueDate: "2024-01-15",
          description: "2024년 1월 수강료",
          receiptNumber: "RCP-2024-002",
        },
        {
          id: "3",
          childName: "김철수",
          courseName: "한국어 기초 과정",
          amount: 300000,
          method: "card",
          status: "pending",
          date: "2024-02-15",
          dueDate: "2024-02-15",
          description: "2024년 2월 수강료",
          receiptNumber: "RCP-2024-003",
        },
        {
          id: "4",
          childName: "김영희",
          courseName: "한국어 기초 과정",
          amount: 300000,
          method: "card",
          status: "failed",
          date: "2024-02-14",
          dueDate: "2024-02-15",
          description: "2024년 2월 수강료",
          receiptNumber: "RCP-2024-004",
        },
        {
          id: "5",
          childName: "김철수",
          courseName: "한국어 기초 과정",
          amount: 300000,
          method: "card",
          status: "refunded",
          date: "2023-12-15",
          dueDate: "2023-12-15",
          description: "2023년 12월 수강료 (환불)",
          receiptNumber: "RCP-2023-005",
        },
      ];

      setPayments(mockPayments);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || payment.status === statusFilter;
    const matchesMethod =
      methodFilter === "all" || payment.method === methodFilter;
    const matchesChild =
      childFilter === "all" || payment.childName === childFilter;

    return matchesSearch && matchesStatus && matchesMethod && matchesChild;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "완료";
      case "pending":
        return "대기중";
      case "failed":
        return "실패";
      case "refunded":
        return "환불";
      default:
        return "알 수 없음";
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "card":
        return "bg-purple-100 text-purple-800";
      case "bank_transfer":
        return "bg-blue-100 text-blue-800";
      case "cash":
        return "bg-green-100 text-green-800";
      case "online":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getMethodText = (method: string) => {
    switch (method) {
      case "card":
        return "카드";
      case "bank_transfer":
        return "계좌이체";
      case "cash":
        return "현금";
      case "online":
        return "온라인";
      default:
        return "알 수 없음";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR").format(amount);
  };

  const getTotalAmount = () => {
    return payments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  const getCompletedAmount = () => {
    return payments
      .filter((payment) => payment.status === "completed")
      .reduce((sum, payment) => sum + payment.amount, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">결제 내역</h1>
            <p className="text-lg text-gray-600">
              자녀들의 수강료 결제 내역을 확인하세요
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Download className="w-5 h-5" />
              내역 다운로드
            </button>
            <Link
              href="/parent/home"
              className="flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Home className="w-5 h-5" />
              홈으로
            </Link>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">총 결제 금액</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(getTotalAmount())}원
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">완료된 결제</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(getCompletedAmount())}원
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">총 결제 건수</p>
                <p className="text-2xl font-bold text-purple-600">
                  {payments.length}건
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">완료율</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {Math.round(
                    (payments.filter((p) => p.status === "completed").length /
                      payments.length) *
                      100,
                  )}
                  %
                </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="아이 이름, 코스명, 설명 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as
                    | "all"
                    | "completed"
                    | "pending"
                    | "failed"
                    | "refunded",
                )
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">전체 상태</option>
              <option value="completed">완료</option>
              <option value="pending">대기중</option>
              <option value="failed">실패</option>
              <option value="refunded">환불</option>
            </select>

            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">전체 방법</option>
              <option value="card">카드</option>
              <option value="bank_transfer">계좌이체</option>
              <option value="cash">현금</option>
              <option value="online">온라인</option>
            </select>

            <select
              value={childFilter}
              onChange={(e) => setChildFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">전체 아이</option>
              <option value="김철수">김철수</option>
              <option value="김영희">김영희</option>
            </select>

            <div className="text-sm text-gray-600">
              총 {filteredPayments.length}건의 결제
            </div>
          </div>
        </div>

        {/* 결제 내역 목록 */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">결제 내역</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    결제 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    아이/코스
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    금액
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    결제 방법
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    날짜
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.description}
                        </div>
                        <div className="text-sm text-gray-500">
                          영수증: {payment.receiptNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.childName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.courseName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount)}원
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getMethodColor(payment.method)}`}
                      >
                        {getMethodText(payment.method)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}
                      >
                        {getStatusText(payment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900">
                          {new Date(payment.date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          마감: {new Date(payment.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-green-600 hover:bg-green-100 rounded">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

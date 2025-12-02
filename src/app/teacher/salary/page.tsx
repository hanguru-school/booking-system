"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  Calendar,
  Clock,
  User,
  TrendingUp,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  Car,
  Gift,
  Award,
} from "lucide-react";

interface SalaryItem {
  id: string;
  date: string;
  studentName: string;
  courseName: string;
  duration: number;
  baseSalary: number;
  bonus: number;
  transportationFee: number;
  points: number;
  totalAmount: number;
  status: "paid" | "pending" | "processing";
  paymentDate?: string;
  notes?: string;
}

interface SalarySummary {
  totalClasses: number;
  totalHours: number;
  totalBaseSalary: number;
  totalBonus: number;
  totalTransportationFee: number;
  totalPoints: number;
  totalAmount: number;
  averagePerClass: number;
  averagePerHour: number;
}

export default function TeacherSalaryPage() {
  const [salaryItems, setSalaryItems] = useState<SalaryItem[]>([]);
  const [summary, setSummary] = useState<SalarySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "paid" | "pending" | "processing"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    loadSalaryData();
  }, [selectedMonth]);

  const loadSalaryData = async () => {
    try {
      setLoading(true);
      // 실제 API 호출로 대체
      const mockSalaryItems: SalaryItem[] = [
        {
          id: "1",
          date: "2024-01-15",
          studentName: "김학생",
          courseName: "초급 회화",
          duration: 40,
          baseSalary: 30000,
          bonus: 5000,
          transportationFee: 2000,
          points: 100,
          totalAmount: 37000,
          status: "paid",
          paymentDate: "2024-01-20",
          notes: "정시 수업, 학생 만족도 높음",
        },
        {
          id: "2",
          date: "2024-01-15",
          studentName: "이학생",
          courseName: "중급 문법",
          duration: 40,
          baseSalary: 35000,
          bonus: 3000,
          transportationFee: 0,
          points: 80,
          totalAmount: 38000,
          status: "paid",
          paymentDate: "2024-01-20",
        },
        {
          id: "3",
          date: "2024-01-16",
          studentName: "박학생",
          courseName: "고급 토론",
          duration: 40,
          baseSalary: 40000,
          bonus: 8000,
          transportationFee: 2000,
          points: 150,
          totalAmount: 50000,
          status: "pending",
        },
        {
          id: "4",
          date: "2024-01-17",
          studentName: "최학생",
          courseName: "초급 회화",
          duration: 40,
          baseSalary: 30000,
          bonus: 2000,
          transportationFee: 0,
          points: 60,
          totalAmount: 32000,
          status: "processing",
        },
      ];
      setSalaryItems(mockSalaryItems);

      // 급여 요약 계산
      const summaryData: SalarySummary = {
        totalClasses: mockSalaryItems.length,
        totalHours:
          mockSalaryItems.reduce((sum, item) => sum + item.duration, 0) / 60,
        totalBaseSalary: mockSalaryItems.reduce(
          (sum, item) => sum + item.baseSalary,
          0,
        ),
        totalBonus: mockSalaryItems.reduce((sum, item) => sum + item.bonus, 0),
        totalTransportationFee: mockSalaryItems.reduce(
          (sum, item) => sum + item.transportationFee,
          0,
        ),
        totalPoints: mockSalaryItems.reduce(
          (sum, item) => sum + item.points,
          0,
        ),
        totalAmount: mockSalaryItems.reduce(
          (sum, item) => sum + item.totalAmount,
          0,
        ),
        averagePerClass:
          mockSalaryItems.reduce((sum, item) => sum + item.totalAmount, 0) /
          mockSalaryItems.length,
        averagePerHour:
          mockSalaryItems.reduce((sum, item) => sum + item.totalAmount, 0) /
          (mockSalaryItems.reduce((sum, item) => sum + item.duration, 0) / 60),
      };
      setSummary(summaryData);
    } catch (error) {
      console.error("급여 데이터 로드 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredItems = () => {
    let filtered = salaryItems;

    // 검색 필터
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.courseName.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // 상태 필터
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    return filtered;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "지급완료";
      case "pending":
        return "지급대기";
      case "processing":
        return "처리중";
      default:
        return "알 수 없음";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("ko-KR");
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`;
  };

  const filteredItems = getFilteredItems();
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">급여 내역을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">급여 내역</h1>
            <p className="text-lg text-gray-600">
              수업별 급여와 보너스를 확인하세요
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Download className="w-4 h-4" />
              급여명세서 다운로드
            </button>
          </div>
        </div>

        {/* 급여 요약 카드 */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {summary.totalClasses}
                  </div>
                  <div className="text-sm text-gray-600">총 수업 수</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {summary.totalHours.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">총 수업 시간</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(summary.totalAmount)}원
                  </div>
                  <div className="text-sm text-gray-600">총 급여</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(summary.averagePerClass)}원
                  </div>
                  <div className="text-sm text-gray-600">수업당 평균</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 상세 내역 카드 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            상세 내역
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">기본급</span>
              </div>
              <div className="text-lg font-bold text-blue-600">
                {summary ? formatCurrency(summary.totalBaseSalary) : "0"}원
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">보너스</span>
              </div>
              <div className="text-lg font-bold text-green-600">
                {summary ? formatCurrency(summary.totalBonus) : "0"}원
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Car className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-gray-600">교통비</span>
              </div>
              <div className="text-lg font-bold text-purple-600">
                {summary ? formatCurrency(summary.totalTransportationFee) : "0"}
                원
              </div>
            </div>
          </div>
        </div>

        {/* 필터 및 검색 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 검색 */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="학생 이름, 과목명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 상태 필터 */}
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as "all" | "paid" | "pending" | "processing",
                )
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">전체 상태</option>
              <option value="paid">지급완료</option>
              <option value="pending">지급대기</option>
              <option value="processing">처리중</option>
            </select>
          </div>
        </div>

        {/* 급여 내역 목록 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            급여 내역 ({filteredItems.length}개)
          </h2>

          {currentItems.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                급여 내역이 없습니다
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all"
                  ? "검색 조건에 맞는 급여 내역이 없습니다."
                  : "이번 달 급여 내역이 없습니다."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentItems.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-gray-900">
                            {formatDate(item.date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-green-600" />
                          <span className="text-gray-700">
                            {formatDuration(item.duration)}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                        >
                          {getStatusText(item.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-purple-600" />
                          <span className="text-sm text-gray-600">학생:</span>
                          <span className="font-medium text-gray-900">
                            {item.studentName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-orange-600" />
                          <span className="text-sm text-gray-600">수업:</span>
                          <span className="font-medium text-gray-900">
                            {item.courseName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Gift className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-600">포인트:</span>
                          <span className="font-medium text-gray-900">
                            {item.points}P
                          </span>
                        </div>
                      </div>

                      {/* 급여 상세 내역 */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="text-sm text-gray-600">기본급</div>
                          <div className="font-medium text-gray-900">
                            {formatCurrency(item.baseSalary)}원
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">보너스</div>
                          <div className="font-medium text-green-600">
                            {formatCurrency(item.bonus)}원
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">교통비</div>
                          <div className="font-medium text-purple-600">
                            {formatCurrency(item.transportationFee)}원
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">총액</div>
                          <div className="font-bold text-blue-600">
                            {formatCurrency(item.totalAmount)}원
                          </div>
                        </div>
                      </div>

                      {item.notes && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-700">{item.notes}</p>
                        </div>
                      )}

                      {item.paymentDate && (
                        <div className="mt-3 text-sm text-gray-500">
                          지급일: {formatDate(item.paymentDate)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span className="text-sm text-gray-600">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

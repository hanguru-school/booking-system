"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  Calendar,
  Clock,
  TrendingUp,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface SalaryDetail {
  id: string;
  lessonId: string;
  lessonDate: string;
  lessonTime: string;
  serviceName: string;
  studentName: string;
  baseAmount: number;
  bonusAmount: number;
  transportationFee: number;
  totalAmount: number;
  status: "confirmed" | "pending" | "paid";
  notes?: string;
}

interface MonthlySalary {
  year: number;
  month: number;
  totalLessons: number;
  totalHours: number;
  baseSalary: number;
  bonusSalary: number;
  transportationFees: number;
  points: number;
  totalSalary: number;
  status: "confirmed" | "pending" | "paid";
  paidAt?: string;
}

export default function EmployeeSalaryPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthlySalary, setMonthlySalary] = useState<MonthlySalary | null>(
    null,
  );
  const [salaryDetails, setSalaryDetails] = useState<SalaryDetail[]>([]);
  const [loading, setLoading] = useState(true);

  // 샘플 데이터
  useEffect(() => {
    setTimeout(() => {
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      const sampleMonthlySalary: MonthlySalary = {
        year: currentYear,
        month: currentMonth,
        totalLessons: 24,
        totalHours: 48,
        baseSalary: 480000,
        bonusSalary: 24000,
        transportationFees: 12000,
        points: 120,
        totalSalary: 516000,
        status: "confirmed",
        paidAt: "2024-01-31",
      };

      const sampleSalaryDetails: SalaryDetail[] = [
        {
          id: "1",
          lessonId: "L001",
          lessonDate: "2024-01-15",
          lessonTime: "14:00-16:00",
          serviceName: "영어회화",
          studentName: "김학생",
          baseAmount: 20000,
          bonusAmount: 1000,
          transportationFee: 500,
          totalAmount: 21500,
          status: "confirmed",
        },
        {
          id: "2",
          lessonId: "L002",
          lessonDate: "2024-01-16",
          lessonTime: "15:00-17:00",
          serviceName: "수학",
          studentName: "이학생",
          baseAmount: 20000,
          bonusAmount: 1000,
          transportationFee: 500,
          totalAmount: 21500,
          status: "confirmed",
        },
        {
          id: "3",
          lessonId: "L003",
          lessonDate: "2024-01-17",
          lessonTime: "16:00-18:00",
          serviceName: "과학",
          studentName: "박학생",
          baseAmount: 20000,
          bonusAmount: 1000,
          transportationFee: 500,
          totalAmount: 21500,
          status: "confirmed",
        },
        {
          id: "4",
          lessonId: "L004",
          lessonDate: "2024-01-18",
          lessonTime: "14:00-16:00",
          serviceName: "영어회화",
          studentName: "최학생",
          baseAmount: 20000,
          bonusAmount: 1000,
          transportationFee: 500,
          totalAmount: 21500,
          status: "confirmed",
        },
        {
          id: "5",
          lessonId: "L005",
          lessonDate: "2024-01-19",
          lessonTime: "15:00-17:00",
          serviceName: "수학",
          studentName: "정학생",
          baseAmount: 20000,
          bonusAmount: 1000,
          transportationFee: 500,
          totalAmount: 21500,
          status: "confirmed",
        },
      ];

      setMonthlySalary(sampleMonthlySalary);
      setSalaryDetails(sampleSalaryDetails);
      setLoading(false);
    }, 1000);
  }, [currentDate]);

  const handlePreviousMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR").format(amount);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "확정";
      case "pending":
        return "대기";
      case "paid":
        return "지급완료";
      default:
        return "알 수 없음";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">급여 내역</h1>
          <p className="text-gray-600">
            월별 급여 정보와 수업별 상세 내역을 확인할 수 있습니다.
          </p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Download className="w-4 h-4 mr-2" />
          급여명세서 다운로드
        </button>
      </div>

      {/* 월 선택 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePreviousMonth}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-4">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
            </h2>
          </div>
          <button
            onClick={handleNextMonth}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 월별 급여 요약 */}
      {monthlySalary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">총 수업</p>
                <p className="text-2xl font-bold text-gray-900">
                  {monthlySalary.totalLessons}회
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              총 {monthlySalary.totalHours}시간
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">기본급</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(monthlySalary.baseSalary)}원
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              시간당{" "}
              {formatCurrency(
                monthlySalary.baseSalary / monthlySalary.totalHours,
              )}
              원
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">보너스</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(monthlySalary.bonusSalary)}원
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              교통비 {formatCurrency(monthlySalary.transportationFees)}원
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">총 급여</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(monthlySalary.totalSalary)}원
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(monthlySalary.status)}`}
              >
                {getStatusText(monthlySalary.status)}
              </span>
              <span className="text-sm text-gray-500">
                포인트 {monthlySalary.points}P
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 급여 상세 내역 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            수업별 급여 상세
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  수업일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  수업 정보
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  기본급
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  보너스
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  교통비
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  총액
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salaryDetails.map((detail) => (
                <tr key={detail.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {detail.lessonDate}
                    </div>
                    <div className="text-sm text-gray-500">
                      {detail.lessonTime}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {detail.serviceName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {detail.studentName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(detail.baseAmount)}원
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(detail.bonusAmount)}원
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(detail.transportationFee)}원
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(detail.totalAmount)}원
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(detail.status)}`}
                    >
                      {getStatusText(detail.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {salaryDetails.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">해당 월의 급여 내역이 없습니다.</p>
          </div>
        )}
      </div>

      {/* 급여 지급 정보 */}
      {monthlySalary && monthlySalary.status === "paid" && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            지급 정보
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">지급일</p>
              <p className="text-lg font-medium text-gray-900">
                {monthlySalary.paidAt}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">지급 방법</p>
              <p className="text-lg font-medium text-gray-900">계좌이체</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

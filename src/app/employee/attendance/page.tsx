"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Plus,
} from "lucide-react";

interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  totalHours?: number;
  transportationFee: number;
  status: "confirmed" | "pending" | "rejected";
  notes?: string;
  location?: string;
}

interface MonthlyReport {
  year: number;
  month: number;
  totalDays: number;
  totalHours: number;
  totalTransportationFee: number;
  averageHoursPerDay: number;
  status: "pending" | "submitted" | "confirmed";
  submittedAt?: string;
  confirmedAt?: string;
}

export default function EmployeeAttendancePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isCheckOutModalOpen, setIsCheckOutModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(
    null,
  );

  // 샘플 데이터
  useEffect(() => {
    setTimeout(() => {
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      const sampleMonthlyReport: MonthlyReport = {
        year: currentYear,
        month: currentMonth,
        totalDays: 22,
        totalHours: 176,
        totalTransportationFee: 11000,
        averageHoursPerDay: 8,
        status: "submitted",
        submittedAt: "2024-01-31 23:59",
        confirmedAt: "2024-02-01 10:30",
      };

      const sampleAttendanceRecords: AttendanceRecord[] = [
        {
          id: "1",
          date: "2024-01-15",
          checkIn: "09:00",
          checkOut: "18:00",
          totalHours: 9,
          transportationFee: 500,
          status: "confirmed",
          location: "강남역 3번 출구",
        },
        {
          id: "2",
          date: "2024-01-16",
          checkIn: "08:30",
          checkOut: "17:30",
          totalHours: 9,
          transportationFee: 500,
          status: "confirmed",
          location: "강남역 3번 출구",
        },
        {
          id: "3",
          date: "2024-01-17",
          checkIn: "09:15",
          checkOut: "18:15",
          totalHours: 9,
          transportationFee: 500,
          status: "confirmed",
          location: "강남역 3번 출구",
        },
        {
          id: "4",
          date: "2024-01-18",
          checkIn: "08:45",
          checkOut: "17:45",
          totalHours: 9,
          transportationFee: 500,
          status: "confirmed",
          location: "강남역 3번 출구",
        },
        {
          id: "5",
          date: "2024-01-19",
          checkIn: "09:00",
          checkOut: "18:00",
          totalHours: 9,
          transportationFee: 500,
          status: "confirmed",
          location: "강남역 3번 출구",
        },
        {
          id: "6",
          date: "2024-01-22",
          checkIn: "08:30",
          checkOut: "17:30",
          totalHours: 9,
          transportationFee: 500,
          status: "confirmed",
          location: "강남역 3번 출구",
        },
        {
          id: "7",
          date: "2024-01-23",
          checkIn: "09:00",
          checkOut: "18:00",
          totalHours: 9,
          transportationFee: 500,
          status: "confirmed",
          location: "강남역 3번 출구",
        },
        {
          id: "8",
          date: "2024-01-24",
          checkIn: "08:45",
          checkOut: "17:45",
          totalHours: 9,
          transportationFee: 500,
          status: "confirmed",
          location: "강남역 3번 출구",
        },
        {
          id: "9",
          date: "2024-01-25",
          checkIn: "09:15",
          checkOut: "18:15",
          totalHours: 9,
          transportationFee: 500,
          status: "confirmed",
          location: "강남역 3번 출구",
        },
        {
          id: "10",
          date: "2024-01-26",
          checkIn: "08:30",
          checkOut: "17:30",
          totalHours: 9,
          transportationFee: 500,
          status: "confirmed",
          location: "강남역 3번 출구",
        },
      ];

      setMonthlyReport(sampleMonthlyReport);
      setAttendanceRecords(sampleAttendanceRecords);
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

  const handleCheckIn = () => {
    const today = new Date().toISOString().split("T")[0];
    const now = new Date().toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      date: today,
      checkIn: now,
      transportationFee: 500,
      status: "pending",
      location: "강남역 3번 출구",
    };

    setAttendanceRecords((prev) => [newRecord, ...prev]);
    setIsCheckInModalOpen(false);
  };

  const handleCheckOut = (recordId: string) => {
    const now = new Date().toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    setAttendanceRecords((prev) =>
      prev.map((record) =>
        record.id === recordId
          ? {
              ...record,
              checkOut: now,
              totalHours: 9, // 실제로는 계산 필요
            }
          : record,
      ),
    );
    setIsCheckOutModalOpen(false);
    setSelectedRecord(null);
  };

  const handleSubmitMonthlyReport = () => {
    if (monthlyReport) {
      setMonthlyReport((prev) =>
        prev
          ? {
              ...prev,
              status: "submitted",
              submittedAt: new Date().toISOString(),
            }
          : null,
      );
      alert("월별 근태 보고가 제출되었습니다.");
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "확정";
      case "pending":
        return "대기";
      case "rejected":
        return "반려";
      case "submitted":
        return "제출완료";
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
      case "rejected":
        return "bg-red-100 text-red-800";
      case "submitted":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <AlertCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
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
          <h1 className="text-2xl font-bold text-gray-900">
            근태 확인 및 보고
          </h1>
          <p className="text-gray-600">
            출근/퇴근 기록과 월별 근태 보고를 관리합니다.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsCheckInModalOpen(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            출근 체크
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            근태명세서 다운로드
          </button>
        </div>
      </div>

      {/* 월 선택 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePreviousMonth}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            ←
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
            →
          </button>
        </div>
      </div>

      {/* 월별 근태 요약 */}
      {monthlyReport && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">총 근무일</p>
                <p className="text-2xl font-bold text-gray-900">
                  {monthlyReport.totalDays}일
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              평균 {monthlyReport.averageHoursPerDay}시간/일
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">총 근무시간</p>
                <p className="text-2xl font-bold text-gray-900">
                  {monthlyReport.totalHours}시간
                </p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              일평균{" "}
              {Math.round(monthlyReport.totalHours / monthlyReport.totalDays)}
              시간
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">교통비</p>
                <p className="text-2xl font-bold text-gray-900">
                  {monthlyReport.totalTransportationFee.toLocaleString()}원
                </p>
              </div>
              <MapPin className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              일평균{" "}
              {Math.round(
                monthlyReport.totalTransportationFee / monthlyReport.totalDays,
              )}
              원
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">보고 상태</p>
                <div className="flex items-center mt-1">
                  <span
                    className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(monthlyReport.status)}`}
                  >
                    {getStatusIcon(monthlyReport.status)}
                    <span className="ml-1">
                      {getStatusText(monthlyReport.status)}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            {monthlyReport.status === "pending" && (
              <button
                onClick={handleSubmitMonthlyReport}
                className="mt-2 w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                월별 보고 제출
              </button>
            )}
          </div>
        </div>
      )}

      {/* 근태 기록 목록 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            일별 근태 기록
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  날짜
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  출근시간
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  퇴근시간
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  근무시간
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  교통비
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {record.date}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {record.checkIn}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {record.checkOut || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {record.totalHours ? `${record.totalHours}시간` : "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {record.transportationFee.toLocaleString()}원
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}
                    >
                      {getStatusIcon(record.status)}
                      <span className="ml-1">
                        {getStatusText(record.status)}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {!record.checkOut && (
                      <button
                        onClick={() => {
                          setSelectedRecord(record);
                          setIsCheckOutModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        퇴근 체크
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {attendanceRecords.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">해당 월의 근태 기록이 없습니다.</p>
          </div>
        )}
      </div>

      {/* 출근 체크 모달 */}
      {isCheckInModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-4">출근 체크</h2>

            <div className="space-y-4">
              <div className="text-center">
                <Clock className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  현재 시간으로 출근을 체크하시겠습니까?
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date().toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setIsCheckInModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleCheckIn}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  출근 체크
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 퇴근 체크 모달 */}
      {isCheckOutModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-4">퇴근 체크</h2>

            <div className="space-y-4">
              <div className="text-center">
                <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  현재 시간으로 퇴근을 체크하시겠습니까?
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">
                    출근시간: {selectedRecord.checkIn}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date().toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setIsCheckOutModalOpen(false);
                    setSelectedRecord(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={() => handleCheckOut(selectedRecord.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  퇴근 체크
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

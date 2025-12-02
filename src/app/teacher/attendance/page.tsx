"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Download,
  User,
  Building,
  Car,
  FileText,
} from "lucide-react";

interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string;
  checkOut: string;
  workHours: number;
  status: "normal" | "late" | "early_leave" | "absent" | "overtime";
  location: "office" | "remote" | "field";
  notes?: string;
  managerApproval: "pending" | "approved" | "rejected";
  employeeConfirmation: "pending" | "confirmed" | "disputed";
  finalStatus: "pending" | "approved" | "rejected";
  managerNotes?: string;
  employeeNotes?: string;
}

interface MonthlyReport {
  month: string;
  totalWorkDays: number;
  totalWorkHours: number;
  averageWorkHours: number;
  lateDays: number;
  earlyLeaveDays: number;
  absentDays: number;
  overtimeHours: number;
  status:
    | "draft"
    | "submitted"
    | "manager_review"
    | "employee_review"
    | "finalized";
  submittedDate?: string;
  managerReviewDate?: string;
  employeeReviewDate?: string;
  finalizationDate?: string;
}

export default function TeacherAttendancePage() {
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(
    null,
  );
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    loadAttendanceData();
  }, [selectedMonth]);

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      // 실제 API 호출로 대체
      const mockRecords: AttendanceRecord[] = [
        {
          id: "1",
          date: "2024-01-15",
          checkIn: "09:00",
          checkOut: "18:00",
          workHours: 9,
          status: "normal",
          location: "office",
          managerApproval: "approved",
          employeeConfirmation: "confirmed",
          finalStatus: "approved",
        },
        {
          id: "2",
          date: "2024-01-16",
          checkIn: "09:15",
          checkOut: "18:00",
          workHours: 8.75,
          status: "late",
          location: "office",
          notes: "지하철 지연으로 인한 지각",
          managerApproval: "approved",
          employeeConfirmation: "confirmed",
          finalStatus: "approved",
          managerNotes: "교통 상황 고려하여 승인",
        },
        {
          id: "3",
          date: "2024-01-17",
          checkIn: "09:00",
          checkOut: "19:30",
          workHours: 10.5,
          status: "overtime",
          location: "office",
          notes: "수업 준비 및 학생 상담",
          managerApproval: "approved",
          employeeConfirmation: "confirmed",
          finalStatus: "approved",
        },
        {
          id: "4",
          date: "2024-01-18",
          checkIn: "09:00",
          checkOut: "17:00",
          workHours: 8,
          status: "early_leave",
          location: "office",
          notes: "개인 사정으로 조퇴",
          managerApproval: "pending",
          employeeConfirmation: "pending",
          finalStatus: "pending",
        },
      ];
      setAttendanceRecords(mockRecords);

      const mockReport: MonthlyReport = {
        month: "2024-01",
        totalWorkDays: 22,
        totalWorkHours: 176,
        averageWorkHours: 8,
        lateDays: 2,
        earlyLeaveDays: 1,
        absentDays: 0,
        overtimeHours: 12,
        status: "manager_review",
        submittedDate: "2024-01-31",
        managerReviewDate: "2024-02-02",
      };
      setMonthlyReport(mockReport);
    } catch (error) {
      console.error("근태 데이터 로드 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "bg-green-100 text-green-800";
      case "late":
        return "bg-yellow-100 text-yellow-800";
      case "early_leave":
        return "bg-orange-100 text-orange-800";
      case "absent":
        return "bg-red-100 text-red-800";
      case "overtime":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "normal":
        return "정상";
      case "late":
        return "지각";
      case "early_leave":
        return "조퇴";
      case "absent":
        return "결근";
      case "overtime":
        return "초과근무";
      default:
        return "알 수 없음";
    }
  };

  const getApprovalColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getApprovalText = (status: string) => {
    switch (status) {
      case "approved":
        return "승인";
      case "pending":
        return "대기";
      case "rejected":
        return "반려";
      default:
        return "알 수 없음";
    }
  };

  const getReportStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "manager_review":
        return "bg-yellow-100 text-yellow-800";
      case "employee_review":
        return "bg-orange-100 text-orange-800";
      case "finalized":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getReportStatusText = (status: string) => {
    switch (status) {
      case "draft":
        return "작성중";
      case "submitted":
        return "제출됨";
      case "manager_review":
        return "관리자 검토";
      case "employee_review":
        return "직원 확인";
      case "finalized":
        return "최종 확정";
      default:
        return "알 수 없음";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  const formatTime = (time: string) => {
    return time;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">근태 데이터를 불러오는 중...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              근태 확인 및 보고
            </h1>
            <p className="text-lg text-gray-600">
              근태 기록을 확인하고 월별 보고를 관리하세요
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4" />
              근태명세서 다운로드
            </button>
          </div>
        </div>

        {/* 월별 보고 요약 */}
        {monthlyReport && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                월별 근태 보고
              </h2>
              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getReportStatusColor(monthlyReport.status)}`}
                >
                  {getReportStatusText(monthlyReport.status)}
                </span>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  보고서 보기
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {monthlyReport.totalWorkDays}일
                </div>
                <div className="text-sm text-gray-600">총 근무일</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {monthlyReport.totalWorkHours}시간
                </div>
                <div className="text-sm text-gray-600">총 근무시간</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {monthlyReport.averageWorkHours}시간
                </div>
                <div className="text-sm text-gray-600">일평균 근무시간</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {monthlyReport.overtimeHours}시간
                </div>
                <div className="text-sm text-gray-600">초과근무시간</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-gray-600">지각</span>
                </div>
                <div className="text-lg font-bold text-red-600">
                  {monthlyReport.lateDays}일
                </div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-gray-600">조퇴</span>
                </div>
                <div className="text-lg font-bold text-orange-600">
                  {monthlyReport.earlyLeaveDays}일
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">결근</span>
                </div>
                <div className="text-lg font-bold text-gray-600">
                  {monthlyReport.absentDays}일
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 근태 기록 목록 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            근태 기록 ({attendanceRecords.length}일)
          </h2>

          {attendanceRecords.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                근태 기록이 없습니다
              </h3>
              <p className="text-gray-600">이번 달 근태 기록이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {attendanceRecords.map((record) => (
                <div
                  key={record.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-gray-900">
                            {formatDate(record.date)}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}
                        >
                          {getStatusText(record.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-600">출근:</span>
                          <span className="font-medium text-gray-900">
                            {formatTime(record.checkIn)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-red-600" />
                          <span className="text-sm text-gray-600">퇴근:</span>
                          <span className="font-medium text-gray-900">
                            {formatTime(record.checkOut)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-purple-600" />
                          <span className="text-sm text-gray-600">
                            근무시간:
                          </span>
                          <span className="font-medium text-gray-900">
                            {record.workHours}시간
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-600">
                            관리자 승인:
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getApprovalColor(record.managerApproval)}`}
                          >
                            {getApprovalText(record.managerApproval)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-600">
                            직원 확인:
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getApprovalColor(record.employeeConfirmation)}`}
                          >
                            {getApprovalText(record.employeeConfirmation)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-orange-600" />
                          <span className="text-sm text-gray-600">
                            최종 상태:
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getApprovalColor(record.finalStatus)}`}
                          >
                            {getApprovalText(record.finalStatus)}
                          </span>
                        </div>
                      </div>

                      {record.notes && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            {record.notes}
                          </p>
                        </div>
                      )}

                      {record.managerNotes && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">
                            관리자 메모:
                          </p>
                          <p className="text-sm text-gray-700">
                            {record.managerNotes}
                          </p>
                        </div>
                      )}

                      {record.employeeNotes && (
                        <div className="mb-4 p-3 bg-green-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">
                            직원 메모:
                          </p>
                          <p className="text-sm text-gray-700">
                            {record.employeeNotes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedRecord(record);
                          setShowRecordModal(true);
                        }}
                        className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        상세보기
                      </button>
                      {record.finalStatus === "pending" && (
                        <button className="flex items-center gap-1 px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                          <CheckCircle className="w-4 h-4" />
                          확인
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 근태 기록 상세 모달 */}
        {showRecordModal && selectedRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  근태 기록 상세
                </h3>
                <button
                  onClick={() => setShowRecordModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <div className="w-5 h-5">×</div>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="text-sm text-gray-600">근무일</div>
                      <div className="font-medium text-gray-900">
                        {formatDate(selectedRecord.date)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="text-sm text-gray-600">근무시간</div>
                      <div className="font-medium text-gray-900">
                        {formatTime(selectedRecord.checkIn)} -{" "}
                        {formatTime(selectedRecord.checkOut)} (
                        {selectedRecord.workHours}시간)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="text-sm text-gray-600">근무 상태</div>
                      <div
                        className={`font-medium ${getStatusColor(selectedRecord.status)}`}
                      >
                        {getStatusText(selectedRecord.status)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Car className="w-5 h-5 text-orange-600" />
                    <div>
                      <div className="text-sm text-gray-600">근무 장소</div>
                      <div className="font-medium text-gray-900">
                        {selectedRecord.location === "office"
                          ? "사무실"
                          : selectedRecord.location === "remote"
                            ? "재택근무"
                            : "외근"}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedRecord.notes && (
                  <div>
                    <div className="text-sm text-gray-600 mb-2">비고</div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        {selectedRecord.notes}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-2">
                      관리자 승인
                    </div>
                    <div
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${getApprovalColor(selectedRecord.managerApproval)}`}
                    >
                      {getApprovalText(selectedRecord.managerApproval)}
                    </div>
                    {selectedRecord.managerNotes && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-gray-700">
                        {selectedRecord.managerNotes}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-2">직원 확인</div>
                    <div
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${getApprovalColor(selectedRecord.employeeConfirmation)}`}
                    >
                      {getApprovalText(selectedRecord.employeeConfirmation)}
                    </div>
                    {selectedRecord.employeeNotes && (
                      <div className="mt-2 p-2 bg-green-50 rounded text-xs text-gray-700">
                        {selectedRecord.employeeNotes}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-2">최종 상태</div>
                    <div
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${getApprovalColor(selectedRecord.finalStatus)}`}
                    >
                      {getApprovalText(selectedRecord.finalStatus)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowRecordModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  닫기
                </button>
                {selectedRecord.finalStatus === "pending" && (
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    확인 완료
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 월별 보고서 모달 */}
        {showReportModal && monthlyReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  월별 근태 보고서
                </h3>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <div className="w-5 h-5">×</div>
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">
                    2024년 1월 근태 요약
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">총 근무일</div>
                      <div className="font-bold text-gray-900">
                        {monthlyReport.totalWorkDays}일
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">총 근무시간</div>
                      <div className="font-bold text-gray-900">
                        {monthlyReport.totalWorkHours}시간
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">
                        일평균 근무시간
                      </div>
                      <div className="font-bold text-gray-900">
                        {monthlyReport.averageWorkHours}시간
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">초과근무시간</div>
                      <div className="font-bold text-gray-900">
                        {monthlyReport.overtimeHours}시간
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-medium text-red-900 mb-2">이상 근태</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-red-600">지각</div>
                      <div className="font-bold text-red-900">
                        {monthlyReport.lateDays}일
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-red-600">조퇴</div>
                      <div className="font-bold text-red-900">
                        {monthlyReport.earlyLeaveDays}일
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-red-600">결근</div>
                      <div className="font-bold text-red-900">
                        {monthlyReport.absentDays}일
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">
                    보고서 상태
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-600">현재 상태</span>
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${getReportStatusColor(monthlyReport.status)}`}
                      >
                        {getReportStatusText(monthlyReport.status)}
                      </span>
                    </div>
                    {monthlyReport.submittedDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-600">제출일</span>
                        <span className="text-sm text-gray-700">
                          {formatDate(monthlyReport.submittedDate)}
                        </span>
                      </div>
                    )}
                    {monthlyReport.managerReviewDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-600">
                          관리자 검토일
                        </span>
                        <span className="text-sm text-gray-700">
                          {formatDate(monthlyReport.managerReviewDate)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  닫기
                </button>
                {monthlyReport.status === "manager_review" && (
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    확인 완료
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

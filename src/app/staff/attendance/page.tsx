"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  CheckCircle,
  TrendingUp,
  Download,
} from "lucide-react";

interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string;
  checkOut: string;
  workHours: number;
  status: "present" | "absent" | "late" | "early_leave";
  notes: string;
}

const AttendancePage = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>(
    [],
  );
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [stats, setStats] = useState({
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    totalWorkHours: 0,
    averageWorkHours: 0,
  });

  useEffect(() => {
    // Mock data
    const mockData: AttendanceRecord[] = [
      {
        id: "1",
        date: "2024-01-15",
        checkIn: "09:00",
        checkOut: "18:00",
        workHours: 9,
        status: "present",
        notes: "",
      },
      {
        id: "2",
        date: "2024-01-14",
        checkIn: "09:15",
        checkOut: "18:00",
        workHours: 8.75,
        status: "late",
        notes: "교통 지연",
      },
      {
        id: "3",
        date: "2024-01-13",
        checkIn: "09:00",
        checkOut: "17:30",
        workHours: 8.5,
        status: "early_leave",
        notes: "개인 사정",
      },
      {
        id: "4",
        date: "2024-01-12",
        checkIn: "09:00",
        checkOut: "18:00",
        workHours: 9,
        status: "present",
        notes: "",
      },
      {
        id: "5",
        date: "2024-01-11",
        checkIn: "09:00",
        checkOut: "18:00",
        workHours: 9,
        status: "present",
        notes: "",
      },
    ];
    setAttendanceRecords(mockData);
    setFilteredRecords(mockData);

    // 통계 계산
    const totalDays = mockData.length;
    const presentDays = mockData.filter((r) => r.status === "present").length;
    const absentDays = mockData.filter((r) => r.status === "absent").length;
    const lateDays = mockData.filter((r) => r.status === "late").length;
    const totalWorkHours = mockData.reduce((sum, r) => sum + r.workHours, 0);
    const averageWorkHours = totalDays > 0 ? totalWorkHours / totalDays : 0;

    setStats({
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      totalWorkHours,
      averageWorkHours,
    });
  }, []);

  useEffect(() => {
    let filtered = attendanceRecords;

    if (selectedMonth) {
      filtered = filtered.filter((record) =>
        record.date.startsWith(selectedMonth),
      );
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((record) => record.status === selectedStatus);
    }

    setFilteredRecords(filtered);
  }, [attendanceRecords, selectedMonth, selectedStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800";
      case "absent":
        return "bg-red-100 text-red-800";
      case "late":
        return "bg-yellow-100 text-yellow-800";
      case "early_leave":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "present":
        return "정상출근";
      case "absent":
        return "결근";
      case "late":
        return "지각";
      case "early_leave":
        return "조퇴";
      default:
        return "알 수 없음";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">근태 확인</h1>
          <p className="text-gray-600">출근/퇴근 기록을 확인하고 관리하세요</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Download className="w-4 h-4" />
          근태표 다운로드
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">총 근무일</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalDays}일
              </p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">정상출근</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.presentDays}일
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">지각/조퇴</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.lateDays}일
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">평균 근무시간</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.averageWorkHours.toFixed(1)}시간
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              월 선택
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상태
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">전체</option>
              <option value="present">정상출근</option>
              <option value="late">지각</option>
              <option value="early_leave">조퇴</option>
              <option value="absent">결근</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedMonth("");
                setSelectedStatus("all");
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              필터 초기화
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
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
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  비고
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(record.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.checkIn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.checkOut}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.workHours}시간
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}
                    >
                      {getStatusText(record.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {record.notes || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          월간 근태 요약
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.presentDays}
            </div>
            <div className="text-sm text-gray-600">정상출근</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.lateDays}
            </div>
            <div className="text-sm text-gray-600">지각/조퇴</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.absentDays}
            </div>
            <div className="text-sm text-gray-600">결근</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;

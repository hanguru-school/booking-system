"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";

interface WorkLog {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  workTitle: string;
  workContent: string;
  workType: "reservation" | "message" | "consultation" | "other";
  duration: number;
  status: "completed" | "in_progress" | "pending";
}

const WorkLogPage = () => {
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<WorkLog[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWorkLog, setNewWorkLog] = useState({
    workTitle: "",
    workContent: "",
    workType: "other" as const,
    startTime: new Date().toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    endTime: new Date().toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  });

  useEffect(() => {
    // Mock data
    const mockData: WorkLog[] = [
      {
        id: "1",
        date: "2024-01-15",
        startTime: "09:00",
        endTime: "10:30",
        workTitle: "예약 관리",
        workContent: "학생 예약 변경 및 취소 처리",
        workType: "reservation",
        duration: 90,
        status: "completed",
      },
      {
        id: "2",
        date: "2024-01-15",
        startTime: "11:00",
        endTime: "12:00",
        workTitle: "상담 대응",
        workContent: "학부모 상담 및 문의 응답",
        workType: "consultation",
        duration: 60,
        status: "completed",
      },
      {
        id: "3",
        date: "2024-01-15",
        startTime: "14:00",
        endTime: "15:00",
        workTitle: "메시지 발송",
        workContent: "수업 리마인드 메시지 발송",
        workType: "message",
        duration: 60,
        status: "in_progress",
      },
    ];
    setWorkLogs(mockData);
    setFilteredLogs(mockData);
  }, []);

  useEffect(() => {
    let filtered = workLogs;

    if (selectedDate) {
      filtered = filtered.filter((log) => log.date === selectedDate);
    }

    if (selectedType !== "all") {
      filtered = filtered.filter((log) => log.workType === selectedType);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.workTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.workContent.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredLogs(filtered);
  }, [workLogs, selectedDate, selectedType, searchTerm]);

  const handleAddWorkLog = () => {
    if (newWorkLog.workTitle && newWorkLog.startTime && newWorkLog.endTime) {
      const start = new Date(`2000-01-01T${newWorkLog.startTime}`);
      const end = new Date(`2000-01-01T${newWorkLog.endTime}`);
      const duration = Math.round(
        (end.getTime() - start.getTime()) / (1000 * 60),
      );

      const workLog: WorkLog = {
        id: Date.now().toString(),
        date: new Date().toISOString().split("T")[0],
        startTime: newWorkLog.startTime,
        endTime: newWorkLog.endTime,
        workTitle: newWorkLog.workTitle,
        workContent: newWorkLog.workContent,
        workType: newWorkLog.workType,
        duration,
        status: "completed",
      };

      setWorkLogs((prev) => [workLog, ...prev]);
      setNewWorkLog({
        workTitle: "",
        workContent: "",
        workType: "other",
        startTime: new Date().toLocaleTimeString("ja-JP", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        endTime: new Date().toLocaleTimeString("ja-JP", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
      setShowAddModal(false);
    }
  };

  const getWorkTypeColor = (type: string) => {
    switch (type) {
      case "reservation":
        return "bg-blue-100 text-blue-800";
      case "message":
        return "bg-green-100 text-green-800";
      case "consultation":
        return "bg-purple-100 text-purple-800";
      case "other":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getWorkTypeText = (type: string) => {
    switch (type) {
      case "reservation":
        return "예약관리";
      case "message":
        return "메시지발송";
      case "consultation":
        return "상담대응";
      case "other":
        return "기타";
      default:
        return "알 수 없음";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "완료";
      case "in_progress":
        return "진행중";
      case "pending":
        return "대기";
      default:
        return "알 수 없음";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">업무 기록</h1>
          <p className="text-gray-600">일일 업무 내용을 기록하고 관리하세요</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          업무 기록 추가
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              날짜
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              업무 유형
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">전체</option>
              <option value="reservation">예약관리</option>
              <option value="message">메시지발송</option>
              <option value="consultation">상담대응</option>
              <option value="other">기타</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              검색
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="업무 제목 또는 내용 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedDate("");
                setSelectedType("all");
                setSearchTerm("");
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              필터 초기화
            </button>
          </div>
        </div>
      </div>

      {/* Work Logs Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  날짜
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  시간
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  업무 제목
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  업무 내용
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  유형
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  소요시간
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.startTime} - {log.endTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {log.workTitle}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {log.workContent}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getWorkTypeColor(log.workType)}`}
                    >
                      {getWorkTypeText(log.workType)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.duration}분
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(log.status)}`}
                    >
                      {getStatusText(log.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Work Log Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              업무 기록 추가
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  업무 제목
                </label>
                <input
                  type="text"
                  value={newWorkLog.workTitle}
                  onChange={(e) =>
                    setNewWorkLog((prev) => ({
                      ...prev,
                      workTitle: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="업무 제목을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  업무 내용
                </label>
                <textarea
                  value={newWorkLog.workContent}
                  onChange={(e) =>
                    setNewWorkLog((prev) => ({
                      ...prev,
                      workContent: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="업무 내용을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  업무 유형
                </label>
                <select
                  value={newWorkLog.workType}
                  onChange={(e) =>
                    setNewWorkLog((prev) => ({
                      ...prev,
                      workType: e.target.value as any,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="reservation">예약관리</option>
                  <option value="message">메시지발송</option>
                  <option value="consultation">상담대응</option>
                  <option value="other">기타</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    시작 시간
                  </label>
                  <input
                    type="time"
                    value={newWorkLog.startTime}
                    onChange={(e) =>
                      setNewWorkLog((prev) => ({
                        ...prev,
                        startTime: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    종료 시간
                  </label>
                  <input
                    type="time"
                    value={newWorkLog.endTime}
                    onChange={(e) =>
                      setNewWorkLog((prev) => ({
                        ...prev,
                        endTime: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddWorkLog}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                추가
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkLogPage;

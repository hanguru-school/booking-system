"use client";

import { useState, useEffect } from "react";
import {
  Database,
  Users,
  Calendar,
  MessageSquare,
  Settings,
  FileText,
  Activity,
  Search,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

interface DataStats {
  students: number;
  teachers: number;
  reservations: number;
  inquiries: number;
  trialLessons: number;
  payments: number;
}

export default function DataManagementPage() {
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "students"
    | "teachers"
    | "reservations"
    | "inquiries"
    | "trial-lessons"
    | "payments"
    | "agreements"
    | "settings"
    | "logs"
  >("overview");
  const [stats, setStats] = useState<DataStats>({
    students: 0,
    teachers: 0,
    reservations: 0,
    inquiries: 0,
    trialLessons: 0,
    payments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStats();
    if (activeTab !== "overview") {
      fetchData();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      // 실제 API 호출로 대체
      const response = await fetch("/api/admin/stats");
      if (response.ok) {
        const result = await response.json();
        setStats(result.stats || stats);
      }
    } catch (error) {
      console.error("통계 조회 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = "";
      switch (activeTab) {
        case "students":
          endpoint = "/api/admin/students";
          break;
        case "teachers":
          endpoint = "/api/admin/teachers";
          break;
        case "reservations":
          endpoint = "/api/admin/reservations";
          break;
        case "inquiries":
          endpoint = "/api/contact/submit";
          break;
        case "trial-lessons":
          endpoint = "/api/trial-lesson/request";
          break;
        case "payments":
          endpoint = "/api/admin/payments";
          break;
        case "agreements":
          endpoint = "/api/agreements/save?studentId=&agreementType=";
          break;
        case "settings":
          endpoint = "/api/system/settings";
          break;
        case "logs":
          endpoint = "/api/admin/activity-logs";
          break;
      }

      if (endpoint) {
        const response = await fetch(endpoint);
        if (response.ok) {
          const result = await response.json();
          if (result.students) setData(result.students);
          else if (result.teachers) setData(result.teachers);
          else if (result.reservations) setData(result.reservations);
          else if (result.inquiries) setData(result.inquiries);
          else if (result.trialLessons) setData(result.trialLessons);
          else if (result.payments) setData(result.payments);
          else if (result.agreements) setData(result.agreements);
          else if (result.settings) setData(result.settings);
          else if (result.logs) setData(result.logs);
        }
      }
    } catch (error) {
      console.error("데이터 조회 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "overview", label: "개요", icon: Database },
    { id: "students", label: "학생", icon: Users },
    { id: "teachers", label: "선생님", icon: Users },
    { id: "reservations", label: "예약", icon: Calendar },
    { id: "inquiries", label: "문의사항", icon: MessageSquare },
    { id: "trial-lessons", label: "체험레슨", icon: Calendar },
    { id: "payments", label: "결제", icon: FileText },
    { id: "agreements", label: "동의서", icon: FileText },
    { id: "settings", label: "시스템 설정", icon: Settings },
    { id: "logs", label: "활동 로그", icon: Activity },
  ];

  const filteredData = data.filter((item) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return JSON.stringify(item).toLowerCase().includes(searchLower);
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            데이터 관리
          </h1>
          <p className="text-gray-600">
            시스템의 모든 데이터를 조회, 수정, 삭제할 수 있습니다.
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* 개요 탭 */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">학생</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.students}
                  </p>
                </div>
                <Users className="w-12 h-12 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">선생님</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.teachers}
                  </p>
                </div>
                <Users className="w-12 h-12 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">예약</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.reservations}
                  </p>
                </div>
                <Calendar className="w-12 h-12 text-purple-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">문의사항</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.inquiries}
                  </p>
                </div>
                <MessageSquare className="w-12 h-12 text-orange-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    체험레슨 신청
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.trialLessons}
                  </p>
                </div>
                <Calendar className="w-12 h-12 text-pink-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">결제</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.payments}
                  </p>
                </div>
                <FileText className="w-12 h-12 text-indigo-500" />
              </div>
            </div>
          </div>
        )}

        {/* 데이터 목록 탭 */}
        {activeTab !== "overview" && (
          <div className="bg-white rounded-lg shadow-sm">
            {/* 검색 및 액션 바 */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="ml-4">
                  <button
                    onClick={fetchData}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    새로고침
                  </button>
                </div>
              </div>
            </div>

            {/* 데이터 테이블 */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <p className="mt-4 text-gray-600">로딩 중...</p>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  데이터가 없습니다.
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        정보
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상태
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        생성일
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        작업
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.map((item, index) => {
                      // 동의서 탭인 경우 특별한 렌더링
                      if (activeTab === "agreements") {
                        return (
                          <tr key={item.id || index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.id?.substring(0, 8) || "-"}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <div>
                                <div className="font-medium">
                                  {item.student?.kanjiName || "-"}
                                  {item.student?.studentId && ` (${item.student.studentId})`}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {item.agreementType === "RULES_AGREEMENT" ? "규정 동의서" : "입회 동의서"}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {item.isCompleted ? (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                  완료
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                                  미완료
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.createdAt
                                ? new Date(item.createdAt).toLocaleDateString("ko-KR")
                                : "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => {
                                    // 동의서 상세 보기 모달 열기
                                    const modal = document.createElement('div');
                                    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                                    modal.innerHTML = `
                                      <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                        <h2 class="text-xl font-bold mb-4">동의서 상세</h2>
                                        <div class="space-y-4">
                                          <div>
                                            <label class="font-semibold">학생:</label>
                                            <p>${item.student?.kanjiName || "-"} (${item.student?.studentId || "-"})</p>
                                          </div>
                                          <div>
                                            <label class="font-semibold">동의서 유형:</label>
                                            <p>${item.agreementType === "RULES_AGREEMENT" ? "규정 동의서" : "입회 동의서"}</p>
                                          </div>
                                          <div>
                                            <label class="font-semibold">동의 항목:</label>
                                            <p>${item.agreedItems?.join(", ") || "-"}</p>
                                          </div>
                                          <div>
                                            <label class="font-semibold">서명:</label>
                                            ${item.signatureData ? `<img src="${item.signatureData}" alt="서명" class="mt-2 border rounded" style="max-width: 300px;" />` : "<p>없음</p>"}
                                          </div>
                                          <div>
                                            <label class="font-semibold">생성일:</label>
                                            <p>${item.createdAt ? new Date(item.createdAt).toLocaleString("ko-KR") : "-"}</p>
                                          </div>
                                        </div>
                                        <button onclick="this.closest('.fixed').remove()" class="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">닫기</button>
                                      </div>
                                    `;
                                    document.body.appendChild(modal);
                                  }}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="보기"
                                >
                                  <Eye className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                      
                      // 기본 렌더링
                      return (
                        <tr key={item.id || index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.id?.substring(0, 8) || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {item.name ||
                              item.kanjiName ||
                              item.title ||
                              item.subject ||
                              item.key ||
                              "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.status && (
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  item.status === "ACTIVE" ||
                                  item.status === "COMPLETED" ||
                                  item.status === "RESOLVED"
                                    ? "bg-green-100 text-green-800"
                                    : item.status === "PENDING"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {item.status}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString("ko-KR")
                              : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                className="text-blue-600 hover:text-blue-900"
                                title="보기"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                              <button
                                className="text-green-600 hover:text-green-900"
                                title="수정"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              <button
                                className="text-red-600 hover:text-red-900"
                                title="삭제"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


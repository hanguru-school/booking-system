"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  FileText,
  Download,
  Eye,
  Trash2,
  Calendar,
  User,
  XCircle,
} from "lucide-react";

interface Report {
  id: string;
  title: string;
  type:
    | "student"
    | "teacher"
    | "financial"
    | "course"
    | "attendance"
    | "custom";
  status: "draft" | "published" | "archived";
  author: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  dataRange: string;
  format: "pdf" | "excel" | "csv";
  size: string;
  downloadCount: number;
}

interface ReportTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  category: string;
  isDefault: boolean;
}

const AdminReportsPage = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showNewReportModal, setShowNewReportModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [newReportData, setNewReportData] = useState({
    title: "",
    type: "student" as Report["type"],
    description: "",
    dataRange: "",
    format: "pdf" as Report["format"],
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [reportsResponse, templatesResponse] = await Promise.all([
          fetch('/api/admin/reports', { credentials: 'include' }).catch(() => ({ ok: false })),
          fetch('/api/admin/report-templates', { credentials: 'include' }).catch(() => ({ ok: false })),
        ]);

        const reportsData = reportsResponse.ok ? await reportsResponse.json() : { reports: [] };
        const templatesData = templatesResponse.ok ? await templatesResponse.json() : { templates: [] };

        setReports(reportsData.reports || []);
        setTemplates(templatesData.templates || []);
      } catch (error) {
        console.error('리포트 데이터 로딩 실패:', error);
        setReports([]);
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || report.type === typeFilter;
    const matchesStatus =
      statusFilter === "all" || report.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const reportStats = {
    total: reports.length,
    published: reports.filter((r) => r.status === "published").length,
    draft: reports.filter((r) => r.status === "draft").length,
    archived: reports.filter((r) => r.status === "archived").length,
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "student":
        return "bg-blue-100 text-blue-800";
      case "teacher":
        return "bg-green-100 text-green-800";
      case "financial":
        return "bg-purple-100 text-purple-800";
      case "course":
        return "bg-orange-100 text-orange-800";
      case "attendance":
        return "bg-red-100 text-red-800";
      case "custom":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "pdf":
        return <FileText className="h-4 w-4 text-red-500" />;
      case "excel":
        return <FileText className="h-4 w-4 text-green-500" />;
      case "csv":
        return <FileText className="h-4 w-4 text-blue-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleCreateReport = () => {
    if (newReportData.title && newReportData.type) {
      const newReport: Report = {
        id: Date.now().toString(),
        ...newReportData,
        status: "draft",
        author: "현재 관리자",
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
        size: "0KB",
        downloadCount: 0,
      };

      setReports([...reports, newReport]);
      setShowNewReportModal(false);
      setNewReportData({
        title: "",
        type: "student",
        description: "",
        dataRange: "",
        format: "pdf",
      });
    }
  };

  const handleDeleteReport = (reportId: string) => {
    setReports(reports.filter((r) => r.id !== reportId));
    setSelectedReport(null);
  };

  const handleDownloadReport = (report: Report) => {
    // Mock download functionality
    console.log(`Downloading report: ${report.title}`);
    setReports(
      reports.map((r) =>
        r.id === report.id ? { ...r, downloadCount: r.downloadCount + 1 } : r,
      ),
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">보고서 관리</h1>
          <p className="text-gray-600">보고서를 생성하고 관리할 수 있습니다.</p>
        </div>

        {/* Report Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">전체 보고서</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reportStats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  발행된 보고서
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {reportStats.published}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">초안</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {reportStats.draft}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FileText className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  보관된 보고서
                </p>
                <p className="text-2xl font-bold text-gray-600">
                  {reportStats.archived}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="보고서명, 설명, 작성자로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">전체 유형</option>
                  <option value="student">학생</option>
                  <option value="teacher">선생님</option>
                  <option value="financial">재무</option>
                  <option value="course">코스</option>
                  <option value="attendance">출석</option>
                  <option value="custom">커스텀</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">전체 상태</option>
                  <option value="published">발행됨</option>
                  <option value="draft">초안</option>
                  <option value="archived">보관됨</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowTemplateModal(true)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  템플릿
                </button>
                <button
                  onClick={() => setShowNewReportModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />새 보고서
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              등록된 보고서가 없습니다.
            </div>
          ) : (
            filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3
                      className="text-lg font-semibold text-gray-900 mb-2 cursor-pointer hover:text-blue-600"
                      onClick={() => setSelectedReport(report)}
                    >
                      {report.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(report.type)}`}
                      >
                        {report.type === "student" && "학생"}
                        {report.type === "teacher" && "선생님"}
                        {report.type === "financial" && "재무"}
                        {report.type === "course" && "코스"}
                        {report.type === "attendance" && "출석"}
                        {report.type === "custom" && "커스텀"}
                      </span>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}
                      >
                        {report.status === "published" && "발행됨"}
                        {report.status === "draft" && "초안"}
                        {report.status === "archived" && "보관됨"}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {report.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="h-4 w-4 mr-2" />
                    <span>작성자: {report.author}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>생성일: {report.createdAt}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>데이터 범위: {report.dataRange}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    {getFormatIcon(report.format)}
                    <span className="text-sm text-gray-500">{report.size}</span>
                    <span className="text-sm text-gray-500">
                      • 다운로드 {report.downloadCount}회
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDownloadReport(report)}
                      className="text-green-600 hover:text-green-900"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            ))
          )}
        </div>
      </div>

      {/* New Report Modal */}
      {showNewReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                새 보고서 생성
              </h2>
              <button
                onClick={() => setShowNewReportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  보고서명 *
                </label>
                <input
                  type="text"
                  value={newReportData.title}
                  onChange={(e) =>
                    setNewReportData({
                      ...newReportData,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="보고서명을 입력하세요"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    보고서 유형 *
                  </label>
                  <select
                    value={newReportData.type}
                    onChange={(e) =>
                      setNewReportData({
                        ...newReportData,
                        type: e.target.value as Report["type"],
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="student">학생</option>
                    <option value="teacher">선생님</option>
                    <option value="financial">재무</option>
                    <option value="course">코스</option>
                    <option value="attendance">출석</option>
                    <option value="custom">커스텀</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    출력 형식
                  </label>
                  <select
                    value={newReportData.format}
                    onChange={(e) =>
                      setNewReportData({
                        ...newReportData,
                        format: e.target.value as Report["format"],
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명
                </label>
                <textarea
                  value={newReportData.description}
                  onChange={(e) =>
                    setNewReportData({
                      ...newReportData,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="보고서 설명을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  데이터 범위
                </label>
                <input
                  type="text"
                  value={newReportData.dataRange}
                  onChange={(e) =>
                    setNewReportData({
                      ...newReportData,
                      dataRange: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="예: 2024-01-01 ~ 2024-01-31"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowNewReportModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleCreateReport}
                  disabled={!newReportData.title || !newReportData.type}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  보고서 생성
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">보고서 템플릿</h2>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {templates.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  등록된 템플릿이 없습니다.
                </div>
              ) : (
                templates.map((template) => (
                <div
                  key={template.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {template.name}
                    </h3>
                    {template.isDefault && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        기본
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {template.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {template.category}
                    </span>
                    <button
                      onClick={() => {
                        setNewReportData({
                          title: template.name,
                          type: template.type as Report["type"],
                          description: template.description,
                          dataRange: "",
                          format: "pdf",
                        });
                        setShowTemplateModal(false);
                        setShowNewReportModal(true);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      사용하기
                    </button>
                  </div>
                </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                보고서 상세 정보
              </h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    기본 정보
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        제목:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedReport.title}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        유형:
                      </span>
                      <span
                        className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(selectedReport.type)}`}
                      >
                        {selectedReport.type === "student" && "학생"}
                        {selectedReport.type === "teacher" && "선생님"}
                        {selectedReport.type === "financial" && "재무"}
                        {selectedReport.type === "course" && "코스"}
                        {selectedReport.type === "attendance" && "출석"}
                        {selectedReport.type === "custom" && "커스텀"}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        상태:
                      </span>
                      <span
                        className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedReport.status)}`}
                      >
                        {selectedReport.status === "published" && "발행됨"}
                        {selectedReport.status === "draft" && "초안"}
                        {selectedReport.status === "archived" && "보관됨"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    파일 정보
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        형식:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedReport.format.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        크기:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedReport.size}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        다운로드:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedReport.downloadCount}회
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  설명
                </h3>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {selectedReport.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    작성 정보
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        작성자:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedReport.author}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        생성일:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedReport.createdAt}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        수정일:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedReport.updatedAt}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    데이터 정보
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        데이터 범위:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedReport.dataRange}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleDownloadReport(selectedReport)}
                  className="px-4 py-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  다운로드
                </button>
                <button
                  onClick={() => handleDeleteReport(selectedReport.id)}
                  className="px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  삭제
                </button>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReportsPage;

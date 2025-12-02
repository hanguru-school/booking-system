"use client";

import React, { useState, useEffect } from "react";
import {
  Play,
  CheckCircle,
  XCircle,
  BarChart3,
  RefreshCw,
  Settings,
  Bug,
  Activity,
  Users,
  Database,
  FileText,
  Zap,
} from "lucide-react";
import {
  testingFramework,
  TestScenario,
  TestResult,
  ErrorReport,
} from "@/lib/testing-framework";

export default function TestingPage() {
  const [scenarios, setScenarios] = useState<TestScenario[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [errorReports, setErrorReports] = useState<ErrorReport[]>([]);
  const [statistics, setStatistics] = useState<{
    totalScenarios: number;
    passedScenarios: number;
    failedScenarios: number;
    blockedScenarios: number;
    successRate: number;
    averageExecutionTime: number;
    errorCount: number;
    criticalErrors: number;
  } | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<string>("");
  const [selectedEnvironment, setSelectedEnvironment] =
    useState<string>("staging");
  const [selectedUser, setSelectedUser] = useState<string>("test-master");
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [filters, setFilters] = useState({
    category: "",
    priority: "",
    status: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // 실제 구현에서는 API에서 데이터 로드
    const mockScenarios: TestScenario[] = [
      {
        id: "unit-reservation",
        name: "예약 등록/취소/변경 테스트",
        description: "예약 시스템의 기본 기능 테스트",
        category: "unit",
        priority: "high",
        status: "passed",
        steps: [],
        expectedResults: [],
        createdAt: new Date(),
        executedAt: new Date(),
      },
      {
        id: "role-student-flow",
        name: "학생 전체 흐름 테스트",
        description: "LINE → 로그인 → 예약 → 태깅 → 수업 → 리뷰 → 마이페이지",
        category: "role",
        priority: "high",
        status: "passed",
        steps: [],
        expectedResults: [],
        createdAt: new Date(),
        executedAt: new Date(),
      },
      {
        id: "device-compatibility",
        name: "장치별 호환성 테스트",
        description: "PC/Mac/iPad/iPhone/Android 호환성 테스트",
        category: "device",
        priority: "high",
        status: "failed",
        steps: [],
        expectedResults: [],
        createdAt: new Date(),
        executedAt: new Date(),
      },
    ];

    const mockResults: TestResult[] = [
      {
        id: "result1",
        scenarioId: "unit-reservation",
        environmentId: "staging",
        userId: "test-master",
        status: "passed",
        executionTime: 2500,
        errorLogs: [],
        screenshots: [],
        createdAt: new Date(),
      },
      {
        id: "result2",
        scenarioId: "role-student-flow",
        environmentId: "staging",
        userId: "test-student",
        status: "passed",
        executionTime: 4500,
        errorLogs: [],
        screenshots: [],
        createdAt: new Date(),
      },
    ];

    const mockErrorReports: ErrorReport[] = [
      {
        id: "error1",
        userId: "student1",
        userRole: "student",
        page: "/student/reservations",
        action: "예약 등록",
        errorMessage: "예약 시간이 중복되었습니다.",
        userAgent: "Mozilla/5.0...",
        timestamp: new Date(),
        status: "new",
        priority: "medium",
      },
    ];

    setScenarios(mockScenarios);
    setResults(mockResults);
    setErrorReports(mockErrorReports);
    setStatistics(testingFramework.getTestStatistics());
  };

  const runTest = async () => {
    if (!selectedScenario) return;

    setIsRunning(true);
    try {
      const result = await testingFramework.executeScenario(
        selectedScenario,
        selectedEnvironment,
        selectedUser,
      );
      console.log("Test completed:", result);
      loadData(); // 데이터 새로고침
    } catch (error) {
      console.error("Test failed:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    try {
      await testingFramework.runAutomatedTests();
      loadData();
    } catch (error) {
      console.error("Automated tests failed:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "passed":
        return "text-green-600 bg-green-100";
      case "failed":
        return "text-red-600 bg-red-100";
      case "running":
        return "text-blue-600 bg-blue-100";
      case "blocked":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "unit":
        return <FileText className="w-4 h-4" />;
      case "role":
        return <Users className="w-4 h-4" />;
      case "device":
        return <Settings className="w-4 h-4" />;
      case "integration":
        return <Database className="w-4 h-4" />;
      case "notification":
        return <Zap className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              테스트 및 검증 관리
            </h1>
            <p className="text-gray-600 mt-2">
              시스템 테스트 시나리오 및 검증 결과 관리
            </p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>전체 테스트 실행</span>
            </button>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>새로고침</span>
            </button>
          </div>
        </div>

        {/* 통계 카드 */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">성공률</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistics.successRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    통과된 테스트
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistics.passedScenarios}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <XCircle className="w-8 h-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    실패한 테스트
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistics.failedScenarios}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <Bug className="w-8 h-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    에러 리포트
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistics.errorCount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "overview", name: "개요", icon: BarChart3 },
                { id: "scenarios", name: "테스트 시나리오", icon: FileText },
                { id: "results", name: "테스트 결과", icon: CheckCircle },
                { id: "errors", name: "에러 리포트", icon: Bug },
                { id: "health", name: "시스템 상태", icon: Activity },
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="space-y-8">
          {/* 개요 탭 */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 테스트 실행 패널 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  테스트 실행
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      테스트 시나리오
                    </label>
                    <select
                      value={selectedScenario}
                      onChange={(e) => setSelectedScenario(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">시나리오 선택</option>
                      {scenarios.map((scenario) => (
                        <option key={scenario.id} value={scenario.id}>
                          {scenario.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      테스트 환경
                    </label>
                    <select
                      value={selectedEnvironment}
                      onChange={(e) => setSelectedEnvironment(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="staging">스테이징</option>
                      <option value="production">운영</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      테스트 사용자
                    </label>
                    <select
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="test-master">테스트 마스터</option>
                      <option value="test-teacher">테스트 선생님</option>
                      <option value="test-staff">테스트 사무직원</option>
                      <option value="test-student">테스트 학생</option>
                    </select>
                  </div>

                  <button
                    onClick={runTest}
                    disabled={!selectedScenario || isRunning}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
                  >
                    {isRunning ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>실행 중...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>테스트 실행</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 최근 테스트 결과 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  최근 테스트 결과
                </h3>

                <div className="space-y-3">
                  {results.slice(0, 5).map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {
                            scenarios.find((s) => s.id === result.scenarioId)
                              ?.name
                          }
                        </p>
                        <p className="text-sm text-gray-600">
                          {result.executionTime}ms •{" "}
                          {result.createdAt.toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(result.status)}`}
                      >
                        {result.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 테스트 시나리오 탭 */}
          {activeTab === "scenarios" && (
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">
                    테스트 시나리오
                  </h2>
                  <div className="flex space-x-3">
                    <select
                      value={filters.category}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      className="px-3 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="">전체 카테고리</option>
                      <option value="unit">단위 테스트</option>
                      <option value="role">역할별 테스트</option>
                      <option value="device">장치별 테스트</option>
                      <option value="integration">통합 테스트</option>
                      <option value="notification">알림 테스트</option>
                    </select>
                    <select
                      value={filters.priority}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          priority: e.target.value,
                        }))
                      }
                      className="px-3 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="">전체 우선순위</option>
                      <option value="high">높음</option>
                      <option value="medium">보통</option>
                      <option value="low">낮음</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  {scenarios.map((scenario) => (
                    <div
                      key={scenario.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getCategoryIcon(scenario.category)}
                          <div>
                            <h3 className="font-medium text-gray-800">
                              {scenario.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {scenario.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(scenario.priority)}`}
                          >
                            {scenario.priority}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getStatusColor(scenario.status)}`}
                          >
                            {scenario.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>
                          생성일: {scenario.createdAt.toLocaleDateString()}
                        </span>
                        {scenario.executedAt && (
                          <span>
                            실행일: {scenario.executedAt.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 테스트 결과 탭 */}
          {activeTab === "results" && (
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  테스트 결과
                </h2>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          시나리오
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          환경
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          사용자
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          상태
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          실행 시간
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          실행일
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {results.map((result) => (
                        <tr key={result.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {
                              scenarios.find((s) => s.id === result.scenarioId)
                                ?.name
                            }
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {result.environmentId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {result.userId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${getStatusColor(result.status)}`}
                            >
                              {result.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {result.executionTime}ms
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {result.createdAt.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 에러 리포트 탭 */}
          {activeTab === "errors" && (
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  에러 리포트
                </h2>

                <div className="space-y-4">
                  {errorReports.map((report) => (
                    <div
                      key={report.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-800">
                            {report.errorMessage}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {report.page} • {report.action} • {report.userRole}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(report.priority)}`}
                          >
                            {report.priority}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getStatusColor(report.status)}`}
                          >
                            {report.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>사용자: {report.userId}</span>
                        <span>{report.timestamp.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 시스템 상태 탭 */}
          {activeTab === "health" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  스테이징 환경
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">API 서버</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600">정상</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">데이터베이스</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600">정상</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">알림 서비스</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600">정상</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">태깅 시스템</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600">정상</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  운영 환경
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">API 서버</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600">정상</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">데이터베이스</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600">정상</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">알림 서비스</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600">정상</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">태깅 시스템</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600">정상</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

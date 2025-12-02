"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Play,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Zap,
  BarChart3,
  TestTube,
  Database,
  Wifi,
} from "lucide-react";
import { taggingSystem } from "@/lib/tagging-system";

interface TestResult {
  id: string;
  name: string;
  status: "pending" | "running" | "passed" | "failed";
  duration?: number;
  error?: string;
  details?: Record<string, unknown>;
}

interface PerformanceMetrics {
  averageProcessingTime: number;
  successRate: number;
  totalTests: number;
  cacheHitRate: number;
  queueSize: number;
}

export default function TaggingSystemTestPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [performanceMetrics, setPerformanceMetrics] =
    useState<PerformanceMetrics>({
      averageProcessingTime: 0,
      successRate: 100,
      totalTests: 0,
      cacheHitRate: 0,
      queueSize: 0,
    });
  const [autoRun, setAutoRun] = useState(false);
  const [testInterval, setTestInterval] = useState(5000);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);

  // 테스트 시나리오 정의
  const testScenarios = [
    {
      id: "basic-tagging",
      name: "기본 태깅 테스트",
      description: "일반적인 UID 태깅 처리 테스트",
      run: async (): Promise<TestResult> => {
        const startTime = Date.now();
        const uid =
          "TEST" + Math.random().toString(36).substr(2, 8).toUpperCase();

        try {
          const result = await taggingSystem.processTagging(
            uid,
            "test-device-1",
            "felica",
            { signalStrength: 85 },
          );

          return {
            id: "basic-tagging",
            name: "기본 태깅 테스트",
            status: result.success ? "passed" : "failed",
            duration: Date.now() - startTime,
            details: { uid, result },
          };
        } catch (error) {
          return {
            id: "basic-tagging",
            name: "기본 태깅 테스트",
            status: "failed",
            duration: Date.now() - startTime,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
    },
    {
      id: "user-authentication",
      name: "사용자 인증 테스트",
      description: "UID 기반 사용자 조회 및 인증 테스트",
      run: async (): Promise<TestResult> => {
        const startTime = Date.now();

        try {
          // 등록된 UID로 테스트
          const registeredUid = "STUDENT1234";
          const user = await taggingSystem.findUserByUID(registeredUid);

          // 등록되지 않은 UID로 테스트
          const unregisteredUid =
            "UNKNOWN" + Math.random().toString(36).substr(2, 8).toUpperCase();
          const unknownUser =
            await taggingSystem.findUserByUID(unregisteredUid);

          return {
            id: "user-authentication",
            name: "사용자 인증 테스트",
            status: user && !unknownUser ? "passed" : "failed",
            duration: Date.now() - startTime,
            details: {
              registeredUser: user,
              unknownUser: unknownUser,
            },
          };
        } catch (error) {
          return {
            id: "user-authentication",
            name: "사용자 인증 테스트",
            status: "failed",
            duration: Date.now() - startTime,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
    },
    {
      id: "device-management",
      name: "디바이스 관리 테스트",
      description: "태깅 디바이스 상태 및 연결 테스트",
      run: async (): Promise<TestResult> => {
        const startTime = Date.now();

        try {
          const devices = taggingSystem.getDevices();
          const activeDevices = devices.filter((d) => d.isActive);
          const connectedDevices = devices.filter(
            (d) => d.connectionStatus === "connected",
          );

          return {
            id: "device-management",
            name: "디바이스 관리 테스트",
            status: devices.length > 0 ? "passed" : "failed",
            duration: Date.now() - startTime,
            details: {
              totalDevices: devices.length,
              activeDevices: activeDevices.length,
              connectedDevices: connectedDevices.length,
            },
          };
        } catch (error) {
          return {
            id: "device-management",
            name: "디바이스 관리 테스트",
            status: "failed",
            duration: Date.now() - startTime,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
    },
    {
      id: "performance-test",
      name: "성능 테스트",
      description: "동시 태깅 처리 및 응답 시간 테스트",
      run: async (): Promise<TestResult> => {
        const startTime = Date.now();

        try {
          const concurrentTests = 10;
          const promises = Array.from({ length: concurrentTests }, (_, i) => {
            const uid = "PERF" + i.toString().padStart(3, "0");
            return taggingSystem.processTagging(uid, "perf-device", "nfc", {
              signalStrength: Math.floor(Math.random() * 100) + 1,
            });
          });

          const results = await Promise.all(promises);
          const successCount = results.filter((r) => r.success).length;
          const avgProcessingTime =
            results.reduce((sum, r) => sum + (r.processingTime || 0), 0) /
            results.length;

          return {
            id: "performance-test",
            name: "성능 테스트",
            status: successCount >= concurrentTests * 0.8 ? "passed" : "failed",
            duration: Date.now() - startTime,
            details: {
              concurrentTests,
              successCount,
              successRate: (successCount / concurrentTests) * 100,
              averageProcessingTime: avgProcessingTime,
            },
          };
        } catch (error) {
          return {
            id: "performance-test",
            name: "성능 테스트",
            status: "failed",
            duration: Date.now() - startTime,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
    },
    {
      id: "error-handling",
      name: "오류 처리 테스트",
      description: "잘못된 입력 및 예외 상황 처리 테스트",
      run: async (): Promise<TestResult> => {
        const startTime = Date.now();

        try {
          const errorTests = [
            // 빈 UID
            taggingSystem.processTagging("", "test-device", "felica"),
            // 잘못된 디바이스 ID
            taggingSystem.processTagging("TEST123", "invalid-device", "felica"),
            // 잘못된 태깅 방법
            taggingSystem.processTagging(
              "TEST123",
              "test-device",
              "invalid" as "felica" | "nfc" | "qr",
            ),
          ];

          const results = await Promise.allSettled(errorTests);
          const errorCount = results.filter(
            (r) => r.status === "rejected",
          ).length;

          return {
            id: "error-handling",
            name: "오류 처리 테스트",
            status: errorCount >= 2 ? "passed" : "failed", // 적어도 2개 이상의 오류가 올바르게 처리되어야 함
            duration: Date.now() - startTime,
            details: {
              totalTests: errorTests.length,
              errorCount,
              results: results.map((r) => r.status),
            },
          };
        } catch (error) {
          return {
            id: "error-handling",
            name: "오류 처리 테스트",
            status: "failed",
            duration: Date.now() - startTime,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
    },
    {
      id: "cache-test",
      name: "캐시 테스트",
      description: "메모리 캐시 동작 및 성능 테스트",
      run: async (): Promise<TestResult> => {
        const startTime = Date.now();

        try {
          const uid =
            "CACHE" + Math.random().toString(36).substr(2, 8).toUpperCase();

          // 첫 번째 조회 (캐시 미스)
          const firstLookup = await taggingSystem.findUserByUID(uid);
          const firstTime = Date.now() - startTime;

          // 두 번째 조회 (캐시 히트)
          const secondStartTime = Date.now();
          const secondLookup = await taggingSystem.findUserByUID(uid);
          const secondTime = Date.now() - secondStartTime;

          const cacheWorking = secondTime < firstTime;

          return {
            id: "cache-test",
            name: "캐시 테스트",
            status: cacheWorking ? "passed" : "failed",
            duration: Date.now() - startTime,
            details: {
              firstLookupTime: firstTime,
              secondLookupTime: secondTime,
              cacheWorking,
              firstResult: firstLookup,
              secondResult: secondLookup,
            },
          };
        } catch (error) {
          return {
            id: "cache-test",
            name: "캐시 테스트",
            status: "failed",
            duration: Date.now() - startTime,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
    },
  ];

  // 테스트 실행
  const runTests = useCallback(async (testIds?: string[]) => {
    setIsRunning(true);
    const testsToRun = testIds
      ? testScenarios.filter((t) => testIds.includes(t.id))
      : testScenarios;

    const results: TestResult[] = [];

    for (const test of testsToRun) {
      // 테스트 시작 상태 설정
      setTestResults((prev) => [
        ...prev.filter((r) => r.id !== test.id),
        { id: test.id, name: test.name, status: "running" },
      ]);

      try {
        const result = await test.run();
        results.push(result);

        // 결과 업데이트
        setTestResults((prev) => [
          ...prev.filter((r) => r.id !== test.id),
          result,
        ]);
      } catch (error) {
        const errorResult: TestResult = {
          id: test.id,
          name: test.name,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        };
        results.push(errorResult);

        setTestResults((prev) => [
          ...prev.filter((r) => r.id !== test.id),
          errorResult,
        ]);
      }
    }

    // 성능 메트릭 업데이트
    const passedTests = results.filter((r) => r.status === "passed").length;
    const totalTests = results.length;
    const avgDuration =
      results.reduce((sum, r) => sum + (r.duration || 0), 0) / totalTests;

    setPerformanceMetrics({
      averageProcessingTime: avgDuration,
      successRate: totalTests > 0 ? (passedTests / totalTests) * 100 : 100,
      totalTests,
      cacheHitRate: 85, // 시뮬레이션
      queueSize: 0, // 시뮬레이션
    });

    setIsRunning(false);
  }, []);

  // 자동 실행
  useEffect(() => {
    if (!autoRun) return;

    const interval = setInterval(() => {
      runTests(selectedTests.length > 0 ? selectedTests : undefined);
    }, testInterval);

    return () => clearInterval(interval);
  }, [autoRun, testInterval, selectedTests, runTests]);

  // 성능 메트릭 포맷팅
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  // 테스트 상태 아이콘
  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-gray-400" />;
      case "running":
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case "passed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              태깅 시스템 테스트
            </h1>
            <p className="text-lg text-gray-600">
              태깅 시스템의 모든 기능을 종합적으로 테스트합니다
            </p>
          </div>

          <div className="flex items-center gap-4">
            <TestTube className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        {/* 성능 메트릭 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">평균 처리시간</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatDuration(performanceMetrics.averageProcessingTime)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">성공률</p>
                <p className="text-2xl font-bold text-gray-900">
                  {performanceMetrics.successRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">총 테스트</p>
                <p className="text-2xl font-bold text-gray-900">
                  {performanceMetrics.totalTests}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <Database className="w-6 h-6 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">캐시 히트율</p>
                <p className="text-2xl font-bold text-gray-900">
                  {performanceMetrics.cacheHitRate}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <Wifi className="w-6 h-6 text-indigo-600" />
              <div>
                <p className="text-sm text-gray-600">큐 크기</p>
                <p className="text-2xl font-bold text-gray-900">
                  {performanceMetrics.queueSize}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 컨트롤 패널 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              테스트 컨트롤
            </h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  runTests(selectedTests.length > 0 ? selectedTests : undefined)
                }
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isRunning ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {isRunning ? "테스트 중..." : "테스트 실행"}
              </button>

              <button
                onClick={() => setTestResults([])}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <RefreshCw className="w-4 h-4" />
                결과 초기화
              </button>
            </div>
          </div>

          {/* 자동 실행 설정 */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoRun}
                onChange={(e) => setAutoRun(e.target.checked)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium">자동 실행</span>
            </label>

            {autoRun && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">간격:</span>
                <select
                  value={testInterval}
                  onChange={(e) => setTestInterval(Number(e.target.value))}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value={3000}>3초</option>
                  <option value={5000}>5초</option>
                  <option value={10000}>10초</option>
                  <option value={30000}>30초</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* 테스트 시나리오 선택 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            테스트 시나리오 선택
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testScenarios.map((scenario) => (
              <label
                key={scenario.id}
                className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedTests.includes(scenario.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTests((prev) => [...prev, scenario.id]);
                    } else {
                      setSelectedTests((prev) =>
                        prev.filter((id) => id !== scenario.id),
                      );
                    }
                  }}
                  className="w-4 h-4 text-blue-600 mt-1"
                />
                <div>
                  <p className="font-medium text-gray-900">{scenario.name}</p>
                  <p className="text-sm text-gray-600">
                    {scenario.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 테스트 결과 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            테스트 결과
          </h3>

          {testResults.length === 0 ? (
            <div className="text-center py-12">
              <TestTube className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                아직 테스트가 실행되지 않았습니다.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {testResults.map((result) => (
                <div
                  key={result.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <h4 className="font-medium text-gray-900">
                        {result.name}
                      </h4>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {result.duration && (
                        <span>소요시간: {formatDuration(result.duration)}</span>
                      )}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          result.status === "passed"
                            ? "bg-green-100 text-green-800"
                            : result.status === "failed"
                              ? "bg-red-100 text-red-800"
                              : result.status === "running"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {result.status === "pending" && "대기중"}
                        {result.status === "running" && "실행중"}
                        {result.status === "passed" && "성공"}
                        {result.status === "failed" && "실패"}
                      </span>
                    </div>
                  </div>

                  {result.error && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-center gap-2 text-red-800">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-medium">오류:</span>
                      </div>
                      <p className="text-red-700 text-sm mt-1">
                        {result.error}
                      </p>
                    </div>
                  )}

                  {result.details && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                        상세 정보 보기
                      </summary>
                      <pre className="mt-2 p-3 bg-gray-50 rounded-md text-xs overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

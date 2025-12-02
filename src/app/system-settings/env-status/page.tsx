"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  RefreshCw,
  Database,
  Settings,
  Activity,
  Copy,
} from "lucide-react";

interface EnvironmentStatus {
  timestamp: string;
  environment: string;
  validation: {
    isValid: boolean;
    missingVars: string[];
    invalidVars: string[];
    warnings: string[];
  };
  config: {
    database: Record<string, string>;
    aws: Record<string, string>;
    cognito_server: Record<string, string>;
    cognito_client: Record<string, string>;
    authentication: Record<string, string>;
    security: Record<string, string>;
    environment: Record<string, string>;
  };
  summary: {
    totalVars: number;
    missingVars: number;
    invalidVars: number;
    warnings: number;
    status: string;
  };
  system_info: {
    node_version: string;
    platform: string;
    memory_usage: any;
    uptime: number;
  };
}

export default function EnvironmentStatusPage() {
  const [envStatus, setEnvStatus] = useState<EnvironmentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [copied, setCopied] = useState<string | null>(null);

  const fetchEnvironmentStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/system/env-status");

      if (response.ok) {
        const data = await response.json();
        setEnvStatus(data);
        setLastRefresh(new Date());
      } else {
        throw new Error("Failed to fetch environment status");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnvironmentStatus();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "unhealthy":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-50 border-green-200";
      case "unhealthy":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  const formatValue = (value: string | undefined) => {
    if (!value) return "undefined";
    if (value === "***") return "*** (마스킹됨)";
    if (value.length > 50) return value.substring(0, 50) + "...";
    return value;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">
              환경 변수 상태를 확인하는 중...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <XCircle className="w-6 h-6 text-red-500 mr-2" />
              <h2 className="text-lg font-semibold text-red-800">오류 발생</h2>
            </div>
            <p className="text-red-600 mt-2">{error}</p>
            <button
              onClick={fetchEnvironmentStatus}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                환경 변수 상태
              </h1>
              <p className="text-gray-600 mt-2">
                시스템 환경 변수 설정 상태를 확인하고 관리합니다
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                마지막 업데이트: {lastRefresh.toLocaleTimeString()}
              </div>
              <button
                onClick={fetchEnvironmentStatus}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                새로고침
              </button>
            </div>
          </div>
        </div>

        {envStatus && (
          <>
            {/* 요약 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div
                className={`p-6 rounded-lg border ${getStatusColor(envStatus.summary.status)}`}
              >
                <div className="flex items-center">
                  {getStatusIcon(envStatus.summary.status)}
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold">전체 상태</h3>
                    <p className="text-sm capitalize">
                      {envStatus.summary.status}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <Database className="w-5 h-5 text-blue-500" />
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold">총 변수</h3>
                    <p className="text-sm">{envStatus.summary.totalVars}개</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold">누락된 변수</h3>
                    <p className="text-sm">{envStatus.summary.missingVars}개</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold">경고</h3>
                    <p className="text-sm">{envStatus.summary.warnings}개</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 환경 변수 그룹별 상세 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(envStatus.config).map(([group, vars]) => (
                <div
                  key={group}
                  className="bg-white rounded-lg border border-gray-200 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold flex items-center">
                      <Settings className="w-5 h-5 mr-2" />
                      {group.replace("_", " ").toUpperCase()}
                    </h2>
                    <span className="text-sm text-gray-500">
                      {Object.keys(vars).length}개 변수
                    </span>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(vars).map(([key, value]) => (
                      <div key={key} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-mono text-gray-700">
                            {key}
                          </span>
                          <button
                            onClick={() => copyToClipboard(key, key)}
                            className="text-gray-400 hover:text-gray-600"
                            title="변수명 복사"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-mono text-gray-800 break-all">
                            {formatValue(value)}
                          </span>
                          {value && value !== "undefined" && (
                            <button
                              onClick={() => copyToClipboard(value, key)}
                              className="text-gray-400 hover:text-gray-600 ml-2"
                              title="값 복사"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        {copied === key && (
                          <div className="text-xs text-green-600 mt-1">
                            복사됨!
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* 검증 결과 */}
            <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                검증 결과
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 누락된 변수 */}
                <div>
                  <h3 className="font-semibold text-red-600 mb-2">
                    누락된 변수
                  </h3>
                  <div className="space-y-1">
                    {envStatus.validation.missingVars.length > 0 ? (
                      envStatus.validation.missingVars.map((varName, index) => (
                        <div
                          key={index}
                          className="text-sm font-mono text-red-600 bg-red-50 p-2 rounded"
                        >
                          {varName}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-green-600">
                        모든 필수 변수가 설정되어 있습니다.
                      </div>
                    )}
                  </div>
                </div>

                {/* 잘못된 변수 */}
                <div>
                  <h3 className="font-semibold text-yellow-600 mb-2">
                    잘못된 변수
                  </h3>
                  <div className="space-y-1">
                    {envStatus.validation.invalidVars.length > 0 ? (
                      envStatus.validation.invalidVars.map((varName, index) => (
                        <div
                          key={index}
                          className="text-sm font-mono text-yellow-600 bg-yellow-50 p-2 rounded"
                        >
                          {varName}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-green-600">
                        모든 변수가 올바르게 설정되어 있습니다.
                      </div>
                    )}
                  </div>
                </div>

                {/* 경고 */}
                <div>
                  <h3 className="font-semibold text-blue-600 mb-2">경고</h3>
                  <div className="space-y-1">
                    {envStatus.validation.warnings.length > 0 ? (
                      envStatus.validation.warnings.map((warning, index) => (
                        <div
                          key={index}
                          className="text-sm text-blue-600 bg-blue-50 p-2 rounded"
                        >
                          {warning}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-green-600">
                        경고가 없습니다.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 시스템 정보 */}
            <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Info className="w-5 h-5 mr-2" />
                시스템 정보
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">기본 정보</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Node.js 버전</span>
                      <span className="font-mono">
                        {envStatus.system_info.node_version}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">플랫폼</span>
                      <span className="font-mono">
                        {envStatus.system_info.platform}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">가동 시간</span>
                      <span className="font-mono">
                        {Math.round(envStatus.system_info.uptime)}초
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">메모리 사용량</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">RSS</span>
                      <span className="font-mono">
                        {Math.round(
                          envStatus.system_info.memory_usage.rss / 1024 / 1024,
                        )}{" "}
                        MB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Heap Total</span>
                      <span className="font-mono">
                        {Math.round(
                          envStatus.system_info.memory_usage.heapTotal /
                            1024 /
                            1024,
                        )}{" "}
                        MB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Heap Used</span>
                      <span className="font-mono">
                        {Math.round(
                          envStatus.system_info.memory_usage.heapUsed /
                            1024 /
                            1024,
                        )}{" "}
                        MB
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

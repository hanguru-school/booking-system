"use client";

import {
  Settings,
  Search,
  Plus,
  Pause,
  Play,
  Edit,
  Trash2,
  Activity,
  MessageSquare,
  BarChart3,
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
interface AutomationRule {
  id: string;
  name: string;
  description: string;
  type: "schedule" | "event" | "condition";
  status: "active" | "inactive";
  executionCount: number;
  successRate: number;
  lastExecuted?: string;
}

export default function AutomationManagementPage() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "rules" | "logs" | "queue" | "analytics"
  >("rules");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const mockRules: AutomationRule[] = [
        {
          id: "1",
          name: "출석 확인 리마인드",
          description: "수업 전 30분에 학생에게 출석 확인 메시지 전송",
          type: "schedule",
          status: "active",
          executionCount: 45,
          successRate: 96,
          lastExecuted: "2024-01-15T14:30:00Z",
        },
        {
          id: "2",
          name: "숙제 제출 알림",
          description: "숙제 마감일 하루 전 학생들에게 알림",
          type: "condition",
          status: "active",
          executionCount: 12,
          successRate: 88,
          lastExecuted: "2024-01-14T09:00:00Z",
        },
      ];

      setRules(mockRules);
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRuleStatus = async (ruleId: string) => {
    setRules(
      rules.map((rule) =>
        rule.id === ruleId
          ? {
              ...rule,
              status: rule.status === "active" ? "inactive" : "active",
            }
          : rule,
      ),
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              자동화 관리
            </h1>
            <p className="text-lg text-gray-600">
              자동화 규칙, 실행 로그, 메시지 큐를 관리하세요
            </p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Settings className="w-5 h-5" />
            메인으로
          </Link>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex border-b">
            {[
              { id: "rules", label: "자동화 규칙", icon: Settings },
              { id: "logs", label: "실행 로그", icon: Activity },
              { id: "queue", label: "메시지 큐", icon: MessageSquare },
              { id: "analytics", label: "분석", icon: BarChart3 },
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(
                      tab.id as "rules" | "logs" | "queue" | "analytics",
                    )
                  }
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.id
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 자동화 규칙 탭 */}
        {activeTab === "rules" && (
          <div className="space-y-6">
            {/* 필터 및 검색 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="규칙 검색..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="w-5 h-5" />새 규칙
                </button>
              </div>
            </div>

            {/* 규칙 목록 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="space-y-4">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="border border-gray-200 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {rule.name}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              rule.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {rule.status === "active" ? "활성" : "비활성"}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              rule.type === "schedule"
                                ? "bg-blue-100 text-blue-800"
                                : rule.type === "event"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {rule.type === "schedule"
                              ? "스케줄"
                              : rule.type === "event"
                                ? "이벤트"
                                : "조건"}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{rule.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">실행 횟수:</span>
                            <span className="ml-2 font-medium">
                              {rule.executionCount}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">성공률:</span>
                            <span className="ml-2 font-medium">
                              {rule.successRate}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">마지막 실행:</span>
                            <span className="ml-2 font-medium">
                              {rule.lastExecuted
                                ? new Date(rule.lastExecuted).toLocaleString()
                                : "없음"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleRuleStatus(rule.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            rule.status === "active"
                              ? "text-red-600 hover:bg-red-100"
                              : "text-green-600 hover:bg-green-100"
                          }`}
                          title={
                            rule.status === "active" ? "비활성화" : "활성화"
                          }
                        >
                          {rule.status === "active" ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                          title="편집"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 다른 탭들은 기본 메시지 */}
        {activeTab !== "rules" && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-gray-500">
              <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">
                {activeTab === "logs"
                  ? "실행 로그"
                  : activeTab === "queue"
                    ? "메시지 큐"
                    : "분석"}{" "}
                기능
              </p>
              <p>이 기능은 곧 구현될 예정입니다.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

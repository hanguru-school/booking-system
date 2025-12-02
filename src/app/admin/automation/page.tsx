"use client";

import React, { useState, useEffect } from "react";
import {
  automationSystem,
  messageTemplateManager,
  AutomationRule,
  MessageTemplate,
  AutomationLog,
} from "@/lib/automation-system";

export default function AutomationPage() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [activeTab, setActiveTab] = useState("rules");
  const [showCreateRule, setShowCreateRule] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [editingTemplate, setEditingTemplate] =
    useState<MessageTemplate | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setRules(automationSystem.getRules());
    setTemplates(messageTemplateManager.getTemplates());
    setLogs(automationSystem.getLogs(50));
  };

  const handleRuleToggle = (ruleId: string) => {
    const updatedRules = rules.map((rule) =>
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule,
    );
    setRules(updatedRules);

    // 실제 시스템에 반영
    automationSystem.updateRule(ruleId, {
      enabled: !rules.find((r) => r.id === ruleId)?.enabled,
    });
  };

  const handleDeleteRule = (ruleId: string) => {
    if (confirm("이 규칙을 삭제하시겠습니까?")) {
      automationSystem.deleteRule(ruleId);
      loadData();
    }
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm("이 템플릿을 삭제하시겠습니까?")) {
      messageTemplateManager.deleteTemplate(templateId);
      loadData();
    }
  };

  const handleTestRule = (ruleId: string) => {
    const rule = rules.find((r) => r.id === ruleId);
    if (rule) {
      alert(`${rule.name} 규칙을 테스트 실행합니다.`);
      // 실제 테스트 실행 로직 추가
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">자동화 관리</h1>
            <p className="text-gray-600 mt-2">
              자동화 규칙 및 메시지 템플릿 관리
            </p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <button
              onClick={() => setShowCreateRule(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              규칙 추가
            </button>
            <button
              onClick={() => setShowCreateTemplate(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              템플릿 추가
            </button>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "rules", name: "자동화 규칙" },
                { id: "templates", name: "메시지 템플릿" },
                { id: "logs", name: "실행 로그" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="space-y-8">
          {activeTab === "rules" && (
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  자동화 규칙 목록
                </h2>
                <div className="space-y-4">
                  {rules.map((rule) => (
                    <div
                      key={rule.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-medium text-gray-900">
                              {rule.name}
                            </h3>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                rule.enabled
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {rule.enabled ? "활성" : "비활성"}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                rule.type === "reminder"
                                  ? "bg-blue-100 text-blue-800"
                                  : rule.type === "notification"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {rule.type === "reminder"
                                ? "리마인드"
                                : rule.type === "notification"
                                  ? "알림"
                                  : "리포트"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            대상:{" "}
                            {rule.conditions.targetType === "student"
                              ? "학생"
                              : rule.conditions.targetType === "teacher"
                                ? "선생님"
                                : "관리자"}
                          </p>
                          <p className="text-sm text-gray-600">
                            스케줄:{" "}
                            {rule.schedule.type === "daily"
                              ? "매일"
                              : rule.schedule.type === "weekly"
                                ? "매주"
                                : rule.schedule.type === "monthly"
                                  ? "매월"
                                  : "커스텀"}
                            {rule.schedule.time && ` ${rule.schedule.time}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            채널: {rule.channels.join(", ")}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleRuleToggle(rule.id)}
                            className={`px-3 py-1 text-sm rounded ${
                              rule.enabled
                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            }`}
                          >
                            {rule.enabled ? "비활성화" : "활성화"}
                          </button>
                          <button
                            onClick={() => handleTestRule(rule.id)}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            테스트
                          </button>
                          <button
                            onClick={() => setEditingRule(rule)}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "templates" && (
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  메시지 템플릿 목록
                </h2>
                <div className="space-y-4">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-medium text-gray-900">
                              {template.name}
                            </h3>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                template.type === "reminder"
                                  ? "bg-blue-100 text-blue-800"
                                  : template.type === "notification"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {template.type === "reminder"
                                ? "리마인드"
                                : template.type === "notification"
                                  ? "알림"
                                  : "리포트"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            제목: {template.title}
                          </p>
                          <p className="text-sm text-gray-600">
                            내용: {template.content.substring(0, 100)}...
                          </p>
                          <p className="text-sm text-gray-600">
                            변수: {template.variables.join(", ")}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setEditingTemplate(template)}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "logs" && (
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  실행 로그
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          시간
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          규칙
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          상태
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          대상 수
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          발송 수
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          오류 수
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          실행 시간
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {logs.map((log) => (
                        <tr key={log.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {rules.find((r) => r.id === log.ruleId)?.name ||
                              log.ruleId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                log.status === "success"
                                  ? "bg-green-100 text-green-800"
                                  : log.status === "failed"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {log.status === "success"
                                ? "성공"
                                : log.status === "failed"
                                  ? "실패"
                                  : "건너뜀"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.targetCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.sentCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.errorCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.executionTime}ms
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 규칙 생성/수정 모달 */}
        {showCreateRule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {editingRule ? "규칙 수정" : "새 규칙 생성"}
              </h2>
              <RuleForm
                rule={editingRule}
                onSave={(rule) => {
                  if (editingRule) {
                    automationSystem.updateRule(rule.id, rule);
                  } else {
                    automationSystem.addRule(rule);
                  }
                  setShowCreateRule(false);
                  setEditingRule(null);
                  loadData();
                }}
                onCancel={() => {
                  setShowCreateRule(false);
                  setEditingRule(null);
                }}
              />
            </div>
          </div>
        )}

        {/* 템플릿 생성/수정 모달 */}
        {showCreateTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {editingTemplate ? "템플릿 수정" : "새 템플릿 생성"}
              </h2>
              <TemplateForm
                template={editingTemplate}
                onSave={(template) => {
                  if (editingTemplate) {
                    messageTemplateManager.updateTemplate(
                      template.id,
                      template,
                    );
                  } else {
                    messageTemplateManager.addTemplate(template);
                  }
                  setShowCreateTemplate(false);
                  setEditingTemplate(null);
                  loadData();
                }}
                onCancel={() => {
                  setShowCreateTemplate(false);
                  setEditingTemplate(null);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 규칙 폼 컴포넌트
function RuleForm({
  rule,
  onSave,
  onCancel,
}: {
  rule?: AutomationRule | null;
  onSave: (rule: AutomationRule) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Partial<AutomationRule>>(
    rule || {
      id: `rule_${Date.now()}`,
      name: "",
      type: "reminder",
      schedule: {
        type: "daily",
        time: "09:00",
      },
      conditions: {
        targetType: "student",
      },
      message: {
        title: "",
        content: "",
        template: "",
      },
      channels: ["line"],
      enabled: true,
    },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as AutomationRule);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          규칙 이름
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          유형
        </label>
        <select
          value={formData.type}
          onChange={(e) =>
            setFormData({
              ...formData,
              type: e.target.value as "reminder" | "notification" | "report",
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="reminder">리마인드</option>
          <option value="notification">알림</option>
          <option value="report">리포트</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          스케줄 유형
        </label>
        <select
          value={formData.schedule?.type}
          onChange={(e) =>
            setFormData({
              ...formData,
              schedule: {
                ...formData.schedule,
                type: e.target.value as
                  | "daily"
                  | "weekly"
                  | "monthly"
                  | "custom",
              },
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="daily">매일</option>
          <option value="weekly">매주</option>
          <option value="monthly">매월</option>
          <option value="custom">커스텀</option>
        </select>
      </div>

      {formData.schedule?.type !== "custom" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            시간
          </label>
          <input
            type="time"
            value={formData.schedule?.time}
            onChange={(e) =>
              setFormData({
                ...formData,
                schedule: { ...formData.schedule, time: e.target.value },
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          대상
        </label>
        <select
          value={formData.conditions?.targetType}
          onChange={(e) =>
            setFormData({
              ...formData,
              conditions: {
                ...formData.conditions,
                targetType: e.target.value as "student" | "teacher" | "admin",
              },
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="student">학생</option>
          <option value="teacher">선생님</option>
          <option value="admin">관리자</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          메시지 제목
        </label>
        <input
          type="text"
          value={formData.message?.title}
          onChange={(e) =>
            setFormData({
              ...formData,
              message: { ...formData.message, title: e.target.value },
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          메시지 내용
        </label>
        <textarea
          value={formData.message?.content}
          onChange={(e) =>
            setFormData({
              ...formData,
              message: { ...formData.message, content: e.target.value },
            })
          }
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          채널
        </label>
        <div className="space-y-2">
          {["line", "email", "sms"].map((channel) => (
            <label key={channel} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.channels?.includes(
                  channel as "line" | "email" | "sms",
                )}
                onChange={(e) => {
                  const channels = e.target.checked
                    ? [...(formData.channels || []), channel]
                    : formData.channels?.filter((c) => c !== channel);
                  setFormData({ ...formData, channels });
                }}
                className="mr-2"
              />
              {channel === "line"
                ? "LINE"
                : channel === "email"
                  ? "이메일"
                  : "SMS"}
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          취소
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          저장
        </button>
      </div>
    </form>
  );
}

// 템플릿 폼 컴포넌트
function TemplateForm({
  template,
  onSave,
  onCancel,
}: {
  template?: MessageTemplate | null;
  onSave: (template: MessageTemplate) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Partial<MessageTemplate>>(
    template || {
      id: `template_${Date.now()}`,
      name: "",
      type: "reminder",
      title: "",
      content: "",
      variables: [],
      examples: {},
    },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as MessageTemplate);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          템플릿 이름
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          유형
        </label>
        <select
          value={formData.type}
          onChange={(e) =>
            setFormData({
              ...formData,
              type: e.target.value as "reminder" | "notification" | "report",
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="reminder">리마인드</option>
          <option value="notification">알림</option>
          <option value="report">리포트</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          제목
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          내용
        </label>
        <textarea
          value={formData.content}
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="변수는 {변수명} 형태로 사용하세요. 예: {name}, {time}"
          required
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          취소
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          저장
        </button>
      </div>
    </form>
  );
}

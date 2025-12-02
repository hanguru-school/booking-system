"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Clock, Calendar, AlertCircle } from "lucide-react";

interface ReservationSettings {
  bufferTime: number;
  maxAdvanceDays: number;
  minAdvanceHours: number;
  cancellationDeadline: number;
  autoConfirm: boolean;
  requireApproval: boolean;
}

export default function ReservationSettingsPage() {
  const [settings, setSettings] = useState<ReservationSettings>({
    bufferTime: 15,
    maxAdvanceDays: 90,
    minAdvanceHours: 2,
    cancellationDeadline: 24,
    autoConfirm: false,
    requireApproval: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings/reservations', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (error) {
      console.error('설정 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/settings/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert('설정이 저장되었습니다.');
      } else {
        alert('설정 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('설정 저장 오류:', error);
      alert('설정 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">예약 설정</h1>
          <p className="text-lg text-gray-600 mt-2">
            예약 시에 필요한 사항 등을 추가하거나 변경할 수 있는 페이지입니다.
          </p>
        </div>

        <div className="space-y-6">
          {/* 버퍼 시간 설정 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">수업 간 간격 설정</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  버퍼 시간 (분)
                </label>
                <input
                  type="number"
                  value={settings.bufferTime}
                  onChange={(e) => setSettings({ ...settings, bufferTime: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max="60"
                />
                <p className="mt-1 text-sm text-gray-500">수업과 수업 사이의 준비 시간입니다.</p>
              </div>
            </div>
          </div>

          {/* 예약 기간 설정 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">예약 기간 설정</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  최대 예약 가능 일수 (일)
                </label>
                <input
                  type="number"
                  value={settings.maxAdvanceDays}
                  onChange={(e) => setSettings({ ...settings, maxAdvanceDays: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="365"
                />
                <p className="mt-1 text-sm text-gray-500">몇 일 전까지 예약이 가능한지 설정합니다.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  최소 예약 가능 시간 (시간)
                </label>
                <input
                  type="number"
                  value={settings.minAdvanceHours}
                  onChange={(e) => setSettings({ ...settings, minAdvanceHours: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max="48"
                />
                <p className="mt-1 text-sm text-gray-500">수업 시작 몇 시간 전까지 예약이 가능한지 설정합니다.</p>
              </div>
            </div>
          </div>

          {/* 취소 정책 설정 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-semibold text-gray-900">취소 정책 설정</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  취소 마감 시간 (시간)
                </label>
                <input
                  type="number"
                  value={settings.cancellationDeadline}
                  onChange={(e) => setSettings({ ...settings, cancellationDeadline: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max="168"
                />
                <p className="mt-1 text-sm text-gray-500">수업 시작 몇 시간 전까지 취소가 가능한지 설정합니다.</p>
              </div>
            </div>
          </div>

          {/* 자동 승인 설정 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">승인 설정</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    자동 승인
                  </label>
                  <p className="text-sm text-gray-500">예약 시 자동으로 승인됩니다.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoConfirm}
                    onChange={(e) => setSettings({ ...settings, autoConfirm: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    승인 필요
                  </label>
                  <p className="text-sm text-gray-500">예약 시 관리자 승인이 필요합니다.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.requireApproval}
                    onChange={(e) => setSettings({ ...settings, requireApproval: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {saving ? '저장 중...' : '설정 저장'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

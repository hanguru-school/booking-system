"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";

interface DurationSetting {
  duration: number;
  bufferMinutes: number;
}

export default function DurationSettingsPage() {
  const router = useRouter();
  const [durationSettings, setDurationSettings] = useState<DurationSetting[]>([]);
  const [newDuration, setNewDuration] = useState(60);
  const [newBuffer, setNewBuffer] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDurations();
  }, []);

  const fetchDurations = async () => {
    try {
      const response = await fetch("/api/admin/settings/durations", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          if (Array.isArray(data.durationSettings) && data.durationSettings.length > 0) {
            const normalized = data.durationSettings
              .map((d: any) => ({
                duration: Number(d.duration) || 0,
                bufferMinutes:
                  typeof d.bufferMinutes === "number"
                    ? Math.max(0, Math.round(d.bufferMinutes))
                    : 0,
              }))
              .filter((d: DurationSetting) => d.duration > 0);
            setDurationSettings(
              normalized.sort((a: DurationSetting, b: DurationSetting) => a.duration - b.duration),
            );
          } else if (Array.isArray(data.durations)) {
            // 이전 형식: 숫자 배열만 있을 때는 버퍼시간 0으로 초기화
            const normalized = data.durations
              .map((d: any) => Number(d) || 0)
              .filter((d: number) => d > 0)
              .map((d: number) => ({ duration: d, bufferMinutes: 0 }));
            setDurationSettings(
              normalized.sort((a: DurationSetting, b: DurationSetting) => a.duration - b.duration),
            );
          } else {
            setDurationSettings([]);
          }
        } else {
          setDurationSettings([]);
        }
      }
    } catch (error) {
      console.error("수강시간 목록 로드 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDuration = () => {
    const durationValue = Number(newDuration) || 0;
    const bufferValue = Math.max(0, Math.round(Number(newBuffer) || 0));

    if (durationValue <= 0) {
      alert("수강시간은 1분 이상이어야 합니다.");
      return;
    }

    if (durationSettings.some((d) => d.duration === durationValue)) {
      alert("이미 동일한 수강시간이 등록되어 있습니다.");
      return;
    }

    const updated: DurationSetting[] = [
      ...durationSettings,
      { duration: durationValue, bufferMinutes: bufferValue },
    ].sort((a, b) => a.duration - b.duration);

    setDurationSettings(updated);
    setNewDuration(60);
    setNewBuffer(0);
  };

  const handleRemoveDuration = (index: number) => {
    setDurationSettings(durationSettings.filter((_, i) => i !== index));
  };

  const handleUpdateDuration = (index: number, value: number) => {
    const durationValue = Number(value) || 0;
    setDurationSettings((prev) =>
      prev
        .map((d, i) =>
          i === index ? { ...d, duration: durationValue > 0 ? durationValue : d.duration } : d,
        )
        .sort((a, b) => a.duration - b.duration),
    );
  };

  const handleUpdateBuffer = (index: number, value: number) => {
    const bufferValue = Math.max(0, Math.round(Number(value) || 0));
    setDurationSettings((prev) =>
      prev.map((d, i) => (i === index ? { ...d, bufferMinutes: bufferValue } : d)),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings/durations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ durationSettings }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("수강시간 목록이 저장되었습니다.");
      } else {
        alert(data.message || "저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("수강시간 저장 오류:", error);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">수강시간 설정</h1>
        </div>

        {/* 폼 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* 수강시간 추가 */}
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  새 수강시간 (분)
                </label>
                <input
                  type="number"
                  value={newDuration}
                  onChange={(e) => setNewDuration(parseInt(e.target.value) || 60)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddDuration()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="5"
                  step="5"
                  placeholder="예: 30, 60, 90"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  버퍼시간 (분)
                </label>
                <input
                  type="number"
                  value={newBuffer}
                  onChange={(e) => setNewBuffer(parseInt(e.target.value) || 0)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddDuration()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="5"
                  placeholder="예: 0, 5, 10"
                />
              </div>
              <div className="flex md:justify-end">
                <button
                  onClick={handleAddDuration}
                  className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  추가
                </button>
              </div>
            </div>
          </div>

          {/* 수강시간 목록 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              수강시간 및 버퍼시간 목록
            </label>
            {durationSettings.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">
                등록된 수강시간이 없습니다.
              </p>
            ) : (
              <div className="space-y-2">
                {durationSettings.map((item, index) => (
                  <div
                    key={`${item.duration}-${index}`}
                    className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">수강시간</span>
                      <input
                        type="number"
                        value={item.duration}
                        onChange={(e) =>
                          handleUpdateDuration(index, parseInt(e.target.value) || item.duration)
                        }
                        className="w-24 px-2 py-1 border border-gray-300 rounded-lg text-right"
                        min={5}
                        step={5}
                      />
                      <span className="text-sm text-gray-700">분</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">버퍼시간</span>
                      <input
                        type="number"
                        value={item.bufferMinutes}
                        onChange={(e) =>
                          handleUpdateBuffer(index, parseInt(e.target.value) || 0)
                        }
                        className="w-24 px-2 py-1 border border-gray-300 rounded-lg text-right"
                        min={0}
                        step={5}
                      />
                      <span className="text-sm text-gray-700">분</span>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleRemoveDuration(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 버튼 */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


"use client";

import { useState, useEffect } from "react";
import { Clock, Save, Calendar, Plus, X } from "lucide-react";

interface OperatingHours {
  dayOfWeek: number; // 0 = 일요일, 1 = 월요일, ..., 6 = 토요일
  isOpen: boolean;
  startTime: string;
  endTime: string;
}

const daysOfWeek = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

export default function OperatingHoursPage() {
  const [hours, setHours] = useState<OperatingHours[]>([
    { dayOfWeek: 0, isOpen: false, startTime: '09:00', endTime: '18:00' },
    { dayOfWeek: 1, isOpen: true, startTime: '09:00', endTime: '18:00' },
    { dayOfWeek: 2, isOpen: true, startTime: '09:00', endTime: '18:00' },
    { dayOfWeek: 3, isOpen: true, startTime: '09:00', endTime: '18:00' },
    { dayOfWeek: 4, isOpen: true, startTime: '09:00', endTime: '18:00' },
    { dayOfWeek: 5, isOpen: true, startTime: '09:00', endTime: '18:00' },
    { dayOfWeek: 6, isOpen: false, startTime: '09:00', endTime: '18:00' },
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchHours();
  }, []);

  const fetchHours = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings/operating-hours', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.hours) {
          setHours(data.hours);
        }
      }
    } catch (error) {
      console.error('운영시간 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateHours = (dayOfWeek: number, field: keyof OperatingHours, value: any) => {
    setHours(hours.map(h => 
      h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h
    ));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/settings/operating-hours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ hours }),
      });

      if (response.ok) {
        alert('운영시간이 저장되었습니다.');
      } else {
        alert('운영시간 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('운영시간 저장 오류:', error);
      alert('운영시간 저장 중 오류가 발생했습니다.');
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
          <h1 className="text-3xl font-bold text-gray-900">교실 운영시간 관리</h1>
          <p className="text-lg text-gray-600 mt-2">
            교실 운영 시간을 설정하고 수정 삭제할 수 있습니다.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="space-y-4">
            {hours.map((hour) => (
              <div key={hour.dayOfWeek} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="w-24">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hour.isOpen}
                      onChange={(e) => updateHours(hour.dayOfWeek, 'isOpen', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      {daysOfWeek[hour.dayOfWeek]}
                    </span>
                  </label>
                </div>
                {hour.isOpen ? (
                  <>
                    <input
                      type="time"
                      value={hour.startTime}
                      onChange={(e) => updateHours(hour.dayOfWeek, 'startTime', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-500">~</span>
                    <input
                      type="time"
                      value={hour.endTime}
                      onChange={(e) => updateHours(hour.dayOfWeek, 'endTime', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </>
                ) : (
                  <span className="text-gray-400">휴무</span>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-6 pt-6 border-t">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {saving ? '저장 중...' : '운영시간 저장'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";

interface LessonType {
  id: string;
  name: string;
  code: string;
}

export default function LessonTypesSettingsPage() {
  const router = useRouter();
  const [lessonTypes, setLessonTypes] = useState<LessonType[]>([]);
  const [newLessonType, setNewLessonType] = useState({ name: "", code: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLessonTypes();
  }, []);

  const fetchLessonTypes = async () => {
    try {
      const response = await fetch("/api/admin/settings/lesson-types", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setLessonTypes(data.lessonTypes || []);
        }
      }
    } catch (error) {
      console.error("수업형태 목록 로드 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLessonType = () => {
    if (newLessonType.name.trim() && newLessonType.code.trim()) {
      const newId = Date.now().toString();
      if (!lessonTypes.find(lt => lt.code === newLessonType.code.trim())) {
        setLessonTypes([...lessonTypes, {
          id: newId,
          name: newLessonType.name.trim(),
          code: newLessonType.code.trim().toUpperCase(),
        }]);
        setNewLessonType({ name: "", code: "" });
      } else {
        alert("이미 존재하는 코드입니다.");
      }
    }
  };

  const handleRemoveLessonType = (id: string) => {
    setLessonTypes(lessonTypes.filter(lt => lt.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings/lesson-types", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ lessonTypes }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("수업형태 목록이 저장되었습니다.");
      } else {
        alert(data.message || "저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("수업형태 저장 오류:", error);
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
          <h1 className="text-2xl font-bold text-gray-900">수업형태 관리</h1>
        </div>

        {/* 폼 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* 수업형태 추가 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              새 수업형태 추가
            </label>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">이름</label>
                <input
                  type="text"
                  value={newLessonType.name}
                  onChange={(e) => setNewLessonType({ ...newLessonType, name: e.target.value })}
                  onKeyPress={(e) => e.key === "Enter" && handleAddLessonType()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 온라인"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">코드</label>
                <input
                  type="text"
                  value={newLessonType.code}
                  onChange={(e) => setNewLessonType({ ...newLessonType, code: e.target.value.toUpperCase() })}
                  onKeyPress={(e) => e.key === "Enter" && handleAddLessonType()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: ONLINE"
                />
              </div>
            </div>
            <button
              onClick={handleAddLessonType}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              추가
            </button>
          </div>

          {/* 수업형태 목록 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              수업형태 목록
            </label>
            {lessonTypes.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">등록된 수업형태가 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {lessonTypes.map((lessonType) => (
                  <div
                    key={lessonType.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <span className="font-medium text-gray-900">{lessonType.name}</span>
                      <span className="text-sm text-gray-500 ml-2">({lessonType.code})</span>
                    </div>
                    <button
                      onClick={() => handleRemoveLessonType(lessonType.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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




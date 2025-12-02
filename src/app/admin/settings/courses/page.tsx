"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X, Plus, Trash2, Edit2 } from "lucide-react";

interface LessonType {
  id: string;
  name: string;
  code: string;
}

interface Course {
  id: string;
  name: string;
  showToStudents: boolean;
  description: string;
  lessonTypes: string[]; // lesson type codes
}

export default function CourseSettingsPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessonTypes, setLessonTypes] = useState<LessonType[]>([]);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    showToStudents: true,
    description: "",
    lessonTypes: [] as string[],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchLessonTypes();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/admin/settings/courses", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCourses(data.courses || []);
        }
      }
    } catch (error) {
      console.error("코스 목록 로드 오류:", error);
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const handleAddCourse = () => {
    if (formData.name.trim()) {
      const newCourse: Course = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        showToStudents: formData.showToStudents,
        description: formData.description.trim(),
        lessonTypes: formData.lessonTypes,
      };
      setCourses([...courses, newCourse]);
      resetForm();
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      showToStudents: course.showToStudents,
      description: course.description,
      lessonTypes: course.lessonTypes,
    });
  };

  const handleUpdateCourse = () => {
    if (editingCourse && formData.name.trim()) {
      setCourses(
        courses.map((course) =>
          course.id === editingCourse.id
            ? {
                ...course,
                name: formData.name.trim(),
                showToStudents: formData.showToStudents,
                description: formData.description.trim(),
                lessonTypes: formData.lessonTypes,
              }
            : course
        )
      );
      resetForm();
    }
  };

  const handleRemoveCourse = (id: string) => {
    if (confirm("정말로 이 코스를 삭제하시겠습니까?")) {
      setCourses(courses.filter((course) => course.id !== id));
    }
  };

  const resetForm = () => {
    setEditingCourse(null);
    setFormData({
      name: "",
      showToStudents: true,
      description: "",
      lessonTypes: [],
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ courses }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("코스 목록이 저장되었습니다.");
        resetForm();
      } else {
        alert(data.message || "저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("코스 저장 오류:", error);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const toggleLessonType = (code: string) => {
    if (formData.lessonTypes.includes(code)) {
      setFormData({
        ...formData,
        lessonTypes: formData.lessonTypes.filter((lt) => lt !== code),
      });
    } else {
      setFormData({
        ...formData,
        lessonTypes: [...formData.lessonTypes, code],
      });
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
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">코스 설정</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 코스 추가/수정 폼 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingCourse ? "코스 수정" : "새 코스 추가"}
            </h2>

            <div className="space-y-4">
              {/* 코스 이름 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  코스 이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 초급 한국어"
                />
              </div>

              {/* 학생용 예약 페이지 표시 여부 */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="showToStudents"
                  checked={formData.showToStudents}
                  onChange={(e) =>
                    setFormData({ ...formData, showToStudents: e.target.checked })
                  }
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="showToStudents" className="text-sm font-medium text-gray-700 cursor-pointer">
                  학생용 예약 페이지에 표시
                </label>
                <span className="text-xs text-gray-500 ml-auto">
                  {formData.showToStudents ? "표시됨" : "관리자만 표시"}
                </span>
              </div>

              {/* 간단한 설명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  간단한 설명
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="코스에 대한 간단한 설명을 입력하세요"
                />
              </div>

              {/* 지원하는 수업형태 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  지원하는 수업형태
                </label>
                {lessonTypes.length === 0 ? (
                  <p className="text-sm text-gray-500 mb-2">
                    수업형태가 없습니다.{" "}
                    <a
                      href="/admin/settings/lesson-types"
                      className="text-blue-600 hover:underline"
                    >
                      수업형태 관리
                    </a>
                    에서 추가하세요.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {lessonTypes.map((lessonType) => (
                      <label
                        key={lessonType.id}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.lessonTypes.includes(lessonType.code)}
                          onChange={() => toggleLessonType(lessonType.code)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          {lessonType.name} ({lessonType.code})
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* 버튼 */}
              <div className="flex gap-2 pt-4">
                {editingCourse ? (
                  <>
                    <button
                      onClick={handleUpdateCourse}
                      disabled={!formData.name.trim() || saving}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      수정
                    </button>
                    <button
                      onClick={resetForm}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      취소
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleAddCourse}
                    disabled={!formData.name.trim()}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    추가
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 코스 목록 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">코스 목록</h2>
            {courses.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">등록된 코스가 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className={`p-4 border rounded-lg ${
                      editingCourse?.id === course.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{course.name}</h3>
                        {course.description && (
                          <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-2">
                        <button
                          onClick={() => handleEditCourse(course)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="수정"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveCourse(course.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          course.showToStudents
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {course.showToStudents ? "학생 표시" : "관리자 전용"}
                      </span>
                      {course.lessonTypes.length > 0 && (
                        <span className="text-xs text-gray-500">
                          수업형태: {course.lessonTypes.join(", ")}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 저장 버튼 */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={handleSave}
                disabled={saving || courses.length === 0}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

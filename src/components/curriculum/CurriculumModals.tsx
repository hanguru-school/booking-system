"use client";

import React, { useState } from "react";
import { User, Clock } from "lucide-react";

interface CurriculumLevel {
  id: string;
  name: string;
  description: string;
  objectives: string[];
  vocabulary: string[];
  expressions: string[];
  subLevels: any[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CurriculumSubLevel {
  id: string;
  name: string;
  description: string;
  items: any[];
  order: number;
  parentLevelId: string;
}

interface CurriculumItem {
  id: string;
  title: string;
  description: string;
  examples: string[];
  status: "not_taught" | "completed" | "continued" | "skipped";
  explanationCount: number;
  lastExplainedAt?: Date;
  notes: string;
  order: number;
  parentSubLevelId: string;
}

interface Student {
  id: string;
  name: string;
  level: string;
  currentLesson?: {
    startTime: Date;
    endTime: Date;
    teacherId: string;
  };
}

export function AddLevelModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (
    level: Omit<CurriculumLevel, "id" | "createdAt" | "updatedAt">,
  ) => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    objectives: [""],
    vocabulary: [""],
    expressions: [""],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      objectives: formData.objectives.filter((obj) => obj.trim()),
      vocabulary: formData.vocabulary.filter((voc) => voc.trim()),
      expressions: formData.expressions.filter((exp) => exp.trim()),
      subLevels: [],
      order: 1,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">새 레벨 추가</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              레벨 이름
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-lg"
              rows={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              학습 목표
            </label>
            {formData.objectives.map((objective, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={objective}
                  onChange={(e) => {
                    const newObjectives = [...formData.objectives];
                    newObjectives[index] = e.target.value;
                    setFormData({ ...formData, objectives: newObjectives });
                  }}
                  className="flex-1 p-2 border border-gray-300 rounded-lg"
                  placeholder="학습 목표를 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newObjectives = formData.objectives.filter(
                      (_, i) => i !== index,
                    );
                    setFormData({ ...formData, objectives: newObjectives });
                  }}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg"
                >
                  삭제
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  objectives: [...formData.objectives, ""],
                })
              }
              className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm"
            >
              목표 추가
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              필수 어휘
            </label>
            {formData.vocabulary.map((vocab, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={vocab}
                  onChange={(e) => {
                    const newVocabulary = [...formData.vocabulary];
                    newVocabulary[index] = e.target.value;
                    setFormData({ ...formData, vocabulary: newVocabulary });
                  }}
                  className="flex-1 p-2 border border-gray-300 rounded-lg"
                  placeholder="어휘를 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newVocabulary = formData.vocabulary.filter(
                      (_, i) => i !== index,
                    );
                    setFormData({ ...formData, vocabulary: newVocabulary });
                  }}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg"
                >
                  삭제
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  vocabulary: [...formData.vocabulary, ""],
                })
              }
              className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm"
            >
              어휘 추가
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              기본 표현
            </label>
            {formData.expressions.map((expression, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={expression}
                  onChange={(e) => {
                    const newExpressions = [...formData.expressions];
                    newExpressions[index] = e.target.value;
                    setFormData({ ...formData, expressions: newExpressions });
                  }}
                  className="flex-1 p-2 border border-gray-300 rounded-lg"
                  placeholder="표현을 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newExpressions = formData.expressions.filter(
                      (_, i) => i !== index,
                    );
                    setFormData({ ...formData, expressions: newExpressions });
                  }}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg"
                >
                  삭제
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  expressions: [...formData.expressions, ""],
                })
              }
              className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm"
            >
              표현 추가
            </button>
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              추가
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AddSubLevelModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (subLevel: Omit<CurriculumSubLevel, "id" | "parentLevelId">) => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      items: [],
      order: 1,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">새 소분류 추가</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              소분류 이름
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-lg"
              rows={3}
              required
            />
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              추가
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AddItemModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (item: Omit<CurriculumItem, "id" | "parentSubLevelId">) => void;
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    examples: [""],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      examples: formData.examples.filter((example) => example.trim()),
      status: "not_taught",
      explanationCount: 0,
      notes: "",
      order: 1,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">새 항목 추가</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              항목 제목
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              상세 설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-lg"
              rows={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              예시
            </label>
            {formData.examples.map((example, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={example}
                  onChange={(e) => {
                    const newExamples = [...formData.examples];
                    newExamples[index] = e.target.value;
                    setFormData({ ...formData, examples: newExamples });
                  }}
                  className="flex-1 p-2 border border-gray-300 rounded-lg"
                  placeholder="예시를 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newExamples = formData.examples.filter(
                      (_, i) => i !== index,
                    );
                    setFormData({ ...formData, examples: newExamples });
                  }}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg"
                >
                  삭제
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  examples: [...formData.examples, ""],
                })
              }
              className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm"
            >
              예시 추가
            </button>
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              추가
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function StudentSelectorModal({
  students,
  allStudents,
  selectedStudent,
  onSelect,
  onClose,
}: {
  students: Student[];
  allStudents: Student[];
  selectedStudent: string;
  onSelect: (studentId: string) => void;
  onClose: () => void;
}) {
  const [showAllStudents, setShowAllStudents] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = showAllStudents
    ? allStudents.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.level.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : students;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">학생 선택</h2>

        <div className="mb-4">
          <input
            type="text"
            placeholder="학생 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="mb-4">
          <button
            onClick={() => setShowAllStudents(!showAllStudents)}
            className="w-full p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            {showAllStudents ? "현재 수업 학생만 보기" : "전체 학생 보기"}
          </button>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          <button
            onClick={() => {
              onSelect("");
              onClose();
            }}
            className={`w-full p-3 text-left rounded-lg border ${
              selectedStudent === ""
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-gray-50 border-gray-200 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>학생 없음 (커리큘럼만 열람)</span>
            </div>
          </button>

          {filteredStudents.map((student) => (
            <button
              key={student.id}
              onClick={() => {
                onSelect(student.id);
                onClose();
              }}
              className={`w-full p-3 text-left rounded-lg border ${
                selectedStudent === student.id
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "bg-gray-50 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>{student.name}</span>
                  <span className="text-sm text-gray-500">
                    (레벨 {student.level})
                  </span>
                </div>
                {student.currentLesson && (
                  <Clock className="w-4 h-4 text-green-500" />
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

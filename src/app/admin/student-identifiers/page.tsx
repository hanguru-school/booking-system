"use client";

import { useState, useEffect } from "react";
import {
  QrCode,
  Copy,
  Search,
  Plus,
  CheckCircle,
  XCircle,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
// import { useAuth } from "@/hooks/useAuth"; // 필요시 주석 해제
import { StudentIdentifier } from "@/types/student";
import { generateUniqueIdentifier } from "@/utils/identifierUtils";
import StudentQRCode from "@/components/student/StudentQRCode";

interface Student {
  id: string;
  name: string;
  email: string;
  department: string;
  status: "active" | "inactive" | "graduated";
  registrationDate: Date;
  identifier?: StudentIdentifier;
}

export default function StudentIdentifiersPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive" | "graduated"
  >("all");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showReissueModal, setShowReissueModal] = useState(false);
  const [reissueReason, setReissueReason] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  // 모의 데이터 로딩
  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);

      // 모의 학생 데이터
      const mockStudents: Student[] = [
        {
          id: "student-001",
          name: "김철수",
          email: "kim@example.com",
          department: "영어학과",
          status: "active",
          registrationDate: new Date("2024-01-01"),
          identifier: {
            id: "id-001",
            studentId: "student-001",
            identifierCode: generateUniqueIdentifier(),
            identifierType: "qr",
            createdAt: new Date("2024-01-01"),
            updatedAt: new Date("2024-01-01"),
            isActive: true,
            usageCount: 15,
          },
        },
        {
          id: "student-002",
          name: "이영희",
          email: "lee@example.com",
          department: "일본어학과",
          status: "active",
          registrationDate: new Date("2024-01-05"),
          identifier: {
            id: "id-002",
            studentId: "student-002",
            identifierCode: generateUniqueIdentifier(),
            identifierType: "qr",
            createdAt: new Date("2024-01-05"),
            updatedAt: new Date("2024-01-05"),
            isActive: true,
            usageCount: 8,
          },
        },
        {
          id: "student-003",
          name: "박민수",
          email: "park@example.com",
          department: "중국어학과",
          status: "inactive",
          registrationDate: new Date("2023-12-01"),
          identifier: {
            id: "id-003",
            studentId: "student-003",
            identifierCode: generateUniqueIdentifier(),
            identifierType: "qr",
            createdAt: new Date("2023-12-01"),
            updatedAt: new Date("2023-12-01"),
            isActive: false,
            usageCount: 25,
          },
        },
      ];

      setStudents(mockStudents);
      setFilteredStudents(mockStudents);
      setLoading(false);
    };

    loadStudents();
  }, []);

  // 검색 및 필터링
  useEffect(() => {
    let filtered = students;

    // 상태 필터링
    if (filterStatus !== "all") {
      filtered = filtered.filter((student) => student.status === filterStatus);
    }

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.identifier?.identifierCode.includes(searchTerm),
      );
    }

    setFilteredStudents(filtered);
  }, [students, searchTerm, filterStatus]);

  // 식별번호 부여
  const assignIdentifier = async (studentId: string) => {
    const newIdentifier: StudentIdentifier = {
      id: `id-${Date.now()}`,
      studentId,
      identifierCode: generateUniqueIdentifier(),
      identifierType: "qr",
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      usageCount: 0,
    };

    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId
          ? { ...student, identifier: newIdentifier }
          : student,
      ),
    );
  };

  // 식별번호 재발급
  const reissueIdentifier = async (studentId: string) => {
    const newIdentifier: StudentIdentifier = {
      id: `id-${Date.now()}`,
      studentId,
      identifierCode: generateUniqueIdentifier(),
      identifierType: "qr",
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      usageCount: 0,
    };

    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId
          ? { ...student, identifier: newIdentifier }
          : student,
      ),
    );

    setShowReissueModal(false);
    setReissueReason("");
  };

  // 식별번호 비활성화
  const deactivateIdentifier = async (studentId: string) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId && student.identifier
          ? {
              ...student,
              identifier: {
                ...student.identifier,
                isActive: false,
                updatedAt: new Date(),
              },
            }
          : student,
      ),
    );
  };

  // 식별번호 복사
  const copyIdentifier = async (identifierCode: string) => {
    try {
      await navigator.clipboard.writeText(identifierCode);
      setCopied(identifierCode);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error("Failed to copy identifier:", error);
    }
  };

  // 상태별 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "inactive":
        return "text-yellow-600 bg-yellow-100";
      case "graduated":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // 상태별 텍스트
  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "활성";
      case "inactive":
        return "비활성";
      case "graduated":
        return "졸업";
      default:
        return "알 수 없음";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              학생 고유 식별번호 관리
            </h1>
            <p className="text-gray-600 mt-2">
              학생들의 QR코드 식별번호를 관리하고 발급할 수 있습니다.
            </p>
          </div>
          <Link
            href="/admin/home"
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            관리자 홈
          </Link>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="학생 이름, 이메일, 학과, 식별번호로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(
                  e.target.value as "all" | "active" | "inactive" | "graduated",
                )
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">전체 상태</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
              <option value="graduated">졸업</option>
            </select>
          </div>
        </div>
      </div>

      {/* 학생 목록 */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  학생 정보
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  식별번호
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  사용 횟수
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  발급일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {student.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {student.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {student.department}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student.identifier ? (
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-gray-900">
                          {student.identifier.identifierCode}
                        </span>
                        <button
                          onClick={() =>
                            copyIdentifier(student.identifier!.identifierCode)
                          }
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="식별번호 복사"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {copied === student.identifier.identifierCode && (
                          <span className="text-xs text-green-600">복사됨</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">미발급</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(student.status)}`}
                      >
                        {getStatusText(student.status)}
                      </span>
                      {student.identifier && (
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            student.identifier.isActive
                              ? "text-green-600 bg-green-100"
                              : "text-red-600 bg-red-100"
                          }`}
                        >
                          {student.identifier.isActive ? "활성" : "비활성"}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.identifier ? student.identifier.usageCount : 0}회
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.identifier
                      ? new Date(
                          student.identifier.createdAt,
                        ).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {!student.identifier ? (
                        <button
                          onClick={() => assignIdentifier(student.id)}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          발급
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowQRModal(true);
                            }}
                            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                            title="QR코드 보기"
                          >
                            <QrCode className="w-3 h-3" />
                            QR보기
                          </button>
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowReissueModal(true);
                            }}
                            className="flex items-center gap-1 px-3 py-1 bg-yellow-600 text-white text-xs rounded-lg hover:bg-yellow-700 transition-colors"
                            title="재발급"
                          >
                            <RotateCcw className="w-3 h-3" />
                            재발급
                          </button>
                          {student.identifier.isActive ? (
                            <button
                              onClick={() => deactivateIdentifier(student.id)}
                              className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                              title="비활성화"
                            >
                              <XCircle className="w-3 h-3" />
                              비활성화
                            </button>
                          ) : (
                            <button
                              onClick={() => assignIdentifier(student.id)}
                              className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                              title="활성화"
                            >
                              <CheckCircle className="w-3 h-3" />
                              활성화
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR코드 모달 */}
      {showQRModal && selectedStudent && selectedStudent.identifier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedStudent.name} - QR코드
              </h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="flex justify-center mb-4">
              <StudentQRCode
                studentData={{
                  studentId: selectedStudent.id,
                  identifierCode: selectedStudent.identifier.identifierCode,
                  studentName: selectedStudent.name,
                  studentEmail: selectedStudent.email,
                  department: selectedStudent.department,
                  currentLevel: "중급",
                  points: 1000,
                  totalClasses: 10,
                  completedClasses: 8,
                  studyStreak: 5,
                  averageScore: 85,
                  createdAt: selectedStudent.identifier.createdAt,
                  version: "1.0",
                }}
                size={200}
                showActions={true}
              />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">
                이 QR코드를 스캔하면 학생 정보를 확인할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 재발급 모달 */}
      {showReissueModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                식별번호 재발급
              </h3>
              <button
                onClick={() => setShowReissueModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>{selectedStudent.name}</strong> 학생의 식별번호를
                재발급합니다.
              </p>
              <p className="text-xs text-gray-500 mb-4">
                기존 식별번호는 비활성화되고 새로운 식별번호가 발급됩니다.
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                재발급 사유
              </label>
              <textarea
                value={reissueReason}
                onChange={(e) => setReissueReason(e.target.value)}
                placeholder="재발급 사유를 입력하세요..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowReissueModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => reissueIdentifier(selectedStudent.id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                재발급
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

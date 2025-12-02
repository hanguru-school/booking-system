"use client";

import { useState, useEffect } from "react";
import {
  Gift,
  Search,
  Plus,
  Minus,
  Calendar,
  User,
  TrendingUp,
  TrendingDown,
  Home,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

interface StudentPoints {
  id: string;
  name: string;
  level: number;
  points: number;
  lastTransaction?: string;
}

interface PointTransaction {
  id: string;
  studentId: string;
  type: "earn" | "use";
  amount: number;
  reason: string;
  timestamp: string;
}

export default function PointsManagementPage() {
  const [students, setStudents] = useState<StudentPoints[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentPoints | null>(
    null,
  );
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddPoints, setShowAddPoints] = useState(false);
  const [showUsePoints, setShowUsePoints] = useState(false);
  const [pointAmount, setPointAmount] = useState("");
  const [pointReason, setPointReason] = useState("");

  // 학생 목록 조회
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/students/points");
      const data = await response.json();

      if (data.success) {
        setStudents(data.students);
      }
    } catch (error) {
      console.error("학생 목록 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 거래 내역 조회
  const fetchTransactions = async (studentId: string) => {
    try {
      const response = await fetch(
        `/api/admin/points/transactions/${studentId}`,
      );
      const data = await response.json();

      if (data.success) {
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error("거래 내역 조회 실패:", error);
    }
  };

  // 포인트 적립
  const handleAddPoints = async () => {
    if (!selectedStudent || !pointAmount || !pointReason) {
      alert("모든 필드를 입력해주세요");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/points", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          amount: parseInt(pointAmount),
          reason: pointReason,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("포인트가 적립되었습니다");
        setShowAddPoints(false);
        setPointAmount("");
        setPointReason("");
        fetchStudents();
        if (selectedStudent) {
          fetchTransactions(selectedStudent.id);
        }
      } else {
        alert(data.error || "포인트 적립 실패");
      }
    } catch (error) {
      alert("포인트 적립 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  // 포인트 사용
  const handleUsePoints = async () => {
    if (!selectedStudent || !pointAmount || !pointReason) {
      alert("모든 필드를 입력해주세요");
      return;
    }

    if (parseInt(pointAmount) > selectedStudent.points) {
      alert("보유 포인트보다 많은 포인트를 사용할 수 없습니다");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/points/use", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          amount: parseInt(pointAmount),
          reason: pointReason,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("포인트가 사용되었습니다");
        setShowUsePoints(false);
        setPointAmount("");
        setPointReason("");
        fetchStudents();
        if (selectedStudent) {
          fetchTransactions(selectedStudent.id);
        }
      } else {
        alert(data.error || "포인트 사용 실패");
      }
    } catch (error) {
      alert("포인트 사용 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  // 학생 선택 시 거래 내역 로드
  const handleStudentSelect = (student: StudentPoints) => {
    setSelectedStudent(student);
    fetchTransactions(student.id);
  };

  // 필터링된 학생 목록
  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              포인트 관리
            </h1>
            <p className="text-lg text-gray-600">
              학생별 포인트 적립, 사용, 내역 관리
            </p>
          </div>
          <Link
            href="/admin/home"
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            관리자 홈
          </Link>
        </div>

        {/* 검색 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="학생 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={fetchStudents}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              새로고침
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 좌측: 학생 목록 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 학생 목록 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                학생 목록 ({filteredStudents.length})
              </h2>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">로딩 중...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>학생이 없습니다</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => handleStudentSelect(student)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedStudent?.id === student.id
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {student.name}
                          </h3>
                          <div className="text-sm text-gray-600">
                            레벨 {student.level}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-purple-600">
                            {student.points}점
                          </div>
                          {student.lastTransaction && (
                            <div className="text-xs text-gray-500">
                              {new Date(
                                student.lastTransaction,
                              ).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 포인트 작업 버튼 */}
            {selectedStudent && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  포인트 작업
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowAddPoints(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    포인트 적립
                  </button>
                  <button
                    onClick={() => setShowUsePoints(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                    포인트 사용
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 우측: 거래 내역 */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              거래 내역
              {selectedStudent && ` - ${selectedStudent.name}`}
            </h2>

            {selectedStudent ? (
              <div>
                {/* 포인트 요약 */}
                <div className="bg-purple-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-purple-600">현재 포인트</div>
                      <div className="text-2xl font-bold text-purple-900">
                        {selectedStudent.points}점
                      </div>
                    </div>
                    <Gift className="w-8 h-8 text-purple-600" />
                  </div>
                </div>

                {/* 거래 내역 목록 */}
                <div className="space-y-3">
                  {transactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>거래 내역이 없습니다</p>
                    </div>
                  ) : (
                    transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {transaction.type === "earn" ? (
                            <TrendingUp className="w-5 h-5 text-green-600" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-red-600" />
                          )}
                          <div>
                            <div className="font-medium text-gray-900">
                              {transaction.reason}
                            </div>
                            <div className="text-sm text-gray-600">
                              {new Date(transaction.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div
                          className={`font-semibold ${
                            transaction.type === "earn"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type === "earn" ? "+" : "-"}
                          {transaction.amount}점
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Gift className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>학생을 선택하면 거래 내역이 표시됩니다</p>
              </div>
            )}
          </div>
        </div>

        {/* 포인트 적립 모달 */}
        {showAddPoints && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                포인트 적립
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    적립 포인트
                  </label>
                  <input
                    type="number"
                    value={pointAmount}
                    onChange={(e) => setPointAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="포인트 입력"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    적립 사유
                  </label>
                  <input
                    type="text"
                    value={pointReason}
                    onChange={(e) => setPointReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="적립 사유 입력"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddPoints(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleAddPoints}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? "처리 중..." : "적립"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 포인트 사용 모달 */}
        {showUsePoints && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                포인트 사용
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    사용 포인트
                  </label>
                  <input
                    type="number"
                    value={pointAmount}
                    onChange={(e) => setPointAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="포인트 입력"
                    max={selectedStudent?.points}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    사용 사유
                  </label>
                  <input
                    type="text"
                    value={pointReason}
                    onChange={(e) => setPointReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="사용 사유 입력"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowUsePoints(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleUsePoints}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? "처리 중..." : "사용"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 네비게이션 */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link
            href="/admin/tagging/logs"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Calendar className="w-5 h-5" />
            태깅 이력
          </Link>
          <Link
            href="/admin/customer-management"
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <User className="w-5 h-5" />
            고객 관리
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  User,
  Users,
  Clock,
  Plus,
  Search,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
  uid: string;
  totalPurchasedTime: number; // 분 단위
  totalUsedTime: number; // 분 단위
  remainingTime: number; // 분 단위
}

interface PurchaseRecord {
  id: string;
  purchaseDate: string;
  purchaseTime: number; // 분 단위
  amount: number;
  paymentMethod: "cash" | "card" | "paypay" | "other";
  studentId: string;
  studentName: string;
  notes?: string;
}

export default function PaymentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [purchaseRecords, setPurchaseRecords] = useState<PurchaseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // 새로운 구매 입력 필드
  const [newPurchase, setNewPurchase] = useState<{
    purchaseTime: number;
    amount: number;
    paymentMethod: "cash" | "card" | "paypay" | "other";
    purchaseDate: string;
    notes: string;
  }>({
    purchaseTime: 60,
    amount: 0,
    paymentMethod: "cash",
    purchaseDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      // 실제 데이터베이스에서 학생 데이터 로드
      const response = await fetch("/api/admin/students", {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      
      if (data.success && data.students && data.students.length > 0) {
        // 실제 데이터를 Student 형식으로 변환
        const formattedStudents: Student[] = data.students.map((student: any) => ({
          id: student.id,
          name: student.name,
          email: student.email || "",
          uid: student.id, // 실제 학생 ID 사용
          totalPurchasedTime: 0, // 실제 구매 시간 데이터가 없으므로 0으로 설정
          totalUsedTime: 0, // 실제 사용 시간 데이터가 없으므로 0으로 설정
          remainingTime: 0, // 실제 잔여 시간 데이터가 없으므로 0으로 설정
        }));
        setStudents(formattedStudents);
      } else {
        // 데이터가 없으면 빈 배열
        setStudents([]);
      }
    } catch (error) {
      console.error("학생 목록 로딩 실패:", error);
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPurchaseRecords = useCallback(async (studentId: string) => {
    try {
      // 실제 데이터베이스에서 구매 기록 로드
      const response = await fetch(`/api/admin/payments/student/${studentId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      
      if (data.success && data.records && data.records.length > 0) {
        // 학생 이름 찾기
        const student = students.find(s => s.id === studentId);
        const studentName = student?.name || "";
        
        // 실제 데이터를 PurchaseRecord 형식으로 변환
        const formattedRecords: PurchaseRecord[] = data.records.map((record: any) => ({
          id: record.id,
          purchaseDate: record.purchaseDate || record.createdAt?.split('T')[0] || "",
          purchaseTime: record.purchaseTime || 0,
          amount: record.amount || 0,
          paymentMethod: record.paymentMethod || "cash",
          studentId: studentId,
          studentName: studentName,
          notes: record.notes || "",
        }));
        setPurchaseRecords(formattedRecords);
      } else {
        // 데이터가 없으면 빈 배열
        setPurchaseRecords([]);
      }
    } catch (error) {
      console.error("구매 기록 로딩 실패:", error);
      setPurchaseRecords([]);
    }
  }, [students]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    if (selectedStudent) {
      fetchPurchaseRecords(selectedStudent.id);
    }
  }, [selectedStudent, fetchPurchaseRecords]);

  const handlePurchaseSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    try {
      const response = await fetch("/api/admin/payments/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          ...newPurchase,
        }),
      });

      if (response.ok) {
        // 성공 시 학생 정보와 구매 기록 새로고침
        await fetchStudents();
        await fetchPurchaseRecords(selectedStudent.id);
        setShowPurchaseModal(false);
        setNewPurchase({
          purchaseTime: 60,
          amount: 0,
          paymentMethod: "cash",
          purchaseDate: new Date().toISOString().split("T")[0],
          notes: "",
        });
        alert("구매가 등록되었습니다.");
      } else {
        alert("구매 등록에 실패했습니다.");
      }
    } catch (error) {
      alert("구매 등록 중 오류가 발생했습니다.");
    }
  }, [selectedStudent, newPurchase, fetchStudents, fetchPurchaseRecords]);

  const getPaymentMethodText = useCallback((method: PurchaseRecord["paymentMethod"]) => {
    switch (method) {
      case "cash":
        return "현금";
      case "card":
        return "카드";
      case "paypay":
        return "PayPay";
      case "other":
        return "기타";
      default:
        return "알 수 없음";
    }
  }, []);

  const formatTime = useCallback((minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}시간 ${mins}분`;
    }
    return `${mins}분`;
  }, []);

  const formatCurrency = useCallback((amount: number) => {
    return amount.toLocaleString("ko-KR");
  }, []);

  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) {
      return students;
    }
    const searchLower = searchTerm.toLowerCase();
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower) ||
        student.uid.toLowerCase().includes(searchLower),
    );
  }, [students, searchTerm]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">결제 정보 관리</h1>
          <p className="text-sm text-gray-600">
            학생의 구매 내역과 잔여 시간을 관리합니다.
          </p>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 학생 선택 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">학생 선택</h2>

            {/* 검색 */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="학생 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 학생 목록 */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : students.length === 0 ? (
                <div className="p-8 text-center">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    등록된 학생이 없습니다
                  </h3>
                  <p className="text-gray-600 mb-6">
                    아직 등록된 학생이 없습니다. 새로운 학생을 등록해보세요.
                  </p>
                  <button
                    onClick={() => window.location.href = '/enrollment'}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Users className="h-4 w-4" />
                    학생 등록하기
                  </button>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  검색 결과가 없습니다.
                </div>
              ) : (
                filteredStudents.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={`w-full p-3 text-left rounded-lg border transition-colors ${
                      selectedStudent?.id === student.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-gray-600">{student.email}</div>
                    <div className="text-xs text-gray-500">
                      UID: {student.uid}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 선택된 학생 정보 */}
        <div className="lg:col-span-2">
          {selectedStudent ? (
            <div className="space-y-6">
              {/* 학생 요약 정보 */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">
                    {selectedStudent.name}님의 결제 정보
                  </h2>
                  <button
                    onClick={() => setShowPurchaseModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    <span>시간 구매</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-900">
                        총 구매 시간
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      {formatTime(selectedStudent.totalPurchasedTime)}
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-900">
                        총 사용 시간
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-green-900">
                      {formatTime(selectedStudent.totalUsedTime)}
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-lg ${
                      selectedStudent.remainingTime < 180
                        ? "bg-red-50"
                        : selectedStudent.remainingTime < 300
                          ? "bg-yellow-50"
                          : "bg-green-50"
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle
                        className={`w-5 h-5 ${
                          selectedStudent.remainingTime < 180
                            ? "text-red-600"
                            : selectedStudent.remainingTime < 300
                              ? "text-yellow-600"
                              : "text-green-600"
                        }`}
                      />
                      <span
                        className={`font-medium ${
                          selectedStudent.remainingTime < 180
                            ? "text-red-900"
                            : selectedStudent.remainingTime < 300
                              ? "text-yellow-900"
                              : "text-green-900"
                        }`}
                      >
                        남은 시간
                      </span>
                    </div>
                    <div
                      className={`text-2xl font-bold ${
                        selectedStudent.remainingTime < 180
                          ? "text-red-900"
                          : selectedStudent.remainingTime < 300
                            ? "text-yellow-900"
                            : "text-green-900"
                      }`}
                    >
                      {formatTime(selectedStudent.remainingTime)}
                    </div>
                    {selectedStudent.remainingTime < 180 && (
                      <div className="text-sm text-red-600 mt-1">
                        시간이 부족합니다!
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 구매 기록 */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold">구매 기록</h3>
                </div>
                <div className="overflow-x-auto">
                  {purchaseRecords.length === 0 ? (
                    <div className="p-8 text-center">
                      <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        구매 기록이 없습니다
                      </h3>
                      <p className="text-gray-600 mb-6">
                        아직 구매 기록이 없습니다. 시간을 구매하면 기록이 표시됩니다.
                      </p>
                      <button
                        onClick={() => setShowPurchaseModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                      >
                        <Plus className="h-4 w-4" />
                        시간 구매하기
                      </button>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            구매일
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            구매 시간
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            금액
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            결제 수단
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            메모
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {purchaseRecords.map((record) => (
                          <tr key={record.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(record.purchaseDate).toLocaleDateString(
                                "ko-KR",
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatTime(record.purchaseTime)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ¥{formatCurrency(record.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {getPaymentMethodText(record.paymentMethod)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {record.notes || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                학생을 선택하세요
              </h3>
              <p className="text-gray-600">
                왼쪽에서 학생을 선택하여 결제 정보를 확인하세요.
              </p>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* 구매 등록 모달 */}
      {showPurchaseModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">시간 구매 등록</h3>
            <form onSubmit={handlePurchaseSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  학생
                </label>
                <div className="p-3 bg-gray-100 rounded border">
                  {selectedStudent.name} ({selectedStudent.uid})
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  구매 시간 (분)
                </label>
                <input
                  type="number"
                  min="1"
                  value={newPurchase.purchaseTime}
                  onChange={(e) =>
                    setNewPurchase((prev) => ({
                      ...prev,
                      purchaseTime: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  금액 (¥)
                </label>
                <input
                  type="number"
                  min="0"
                  value={newPurchase.amount}
                  onChange={(e) =>
                    setNewPurchase((prev) => ({
                      ...prev,
                      amount: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  결제 수단
                </label>
                <select
                  value={newPurchase.paymentMethod}
                  onChange={(e) =>
                    setNewPurchase((prev) => ({
                      ...prev,
                      paymentMethod: e.target.value as
                        | "cash"
                        | "card"
                        | "paypay"
                        | "other",
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cash">현금</option>
                  <option value="card">카드</option>
                  <option value="paypay">PayPay</option>
                  <option value="other">기타</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  구매일
                </label>
                <input
                  type="date"
                  value={newPurchase.purchaseDate}
                  onChange={(e) =>
                    setNewPurchase((prev) => ({
                      ...prev,
                      purchaseDate: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  메모 (선택사항)
                </label>
                <textarea
                  value={newPurchase.notes}
                  onChange={(e) =>
                    setNewPurchase((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="메모를 입력하세요..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPurchaseModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  구매 등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

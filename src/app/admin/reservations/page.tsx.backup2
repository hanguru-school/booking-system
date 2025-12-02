"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
} from "lucide-react";

interface Reservation {
  id: string;
  studentName: string;
  studentId: string;
  courseName: string;
  teacherName: string;
  date: string;
  time: string;
  duration: number;
  status: "confirmed" | "completed" | "canceled" | "pending";
  price: number;
  paymentStatus: "paid" | "unpaid" | "partial";
  notes?: string;
  createdAt: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  grade: string;
  parentName: string;
  parentPhone: string;
}

const AdminReservationsPage = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [showNewReservationModal, setShowNewReservationModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [newReservationData, setNewReservationData] = useState({
    courseName: "",
    teacherName: "",
    date: "",
    time: "",
    duration: 60,
    price: 0,
    notes: "",
  });

  // Mock data
  useEffect(() => {
    const mockReservations: Reservation[] = [
      {
        id: "1",
        studentName: "김민수",
        studentId: "ST001",
        courseName: "수학 기초",
        teacherName: "이선생님",
        date: "2024-01-15",
        time: "14:00",
        duration: 60,
        status: "confirmed",
        price: 50000,
        paymentStatus: "paid",
        notes: "기초 수학 개념 정리",
        createdAt: "2024-01-10",
      },
      {
        id: "2",
        studentName: "박지영",
        studentId: "ST002",
        courseName: "영어 회화",
        teacherName: "김선생님",
        date: "2024-01-16",
        time: "16:00",
        duration: 90,
        status: "completed",
        price: 75000,
        paymentStatus: "paid",
        notes: "일상 회화 연습",
        createdAt: "2024-01-11",
      },
      {
        id: "3",
        studentName: "이준호",
        studentId: "ST003",
        courseName: "과학 실험",
        teacherName: "최선생님",
        date: "2024-01-17",
        time: "10:00",
        duration: 120,
        status: "pending",
        price: 100000,
        paymentStatus: "unpaid",
        notes: "화학 실험 준비",
        createdAt: "2024-01-12",
      },
      {
        id: "4",
        studentName: "정수진",
        studentId: "ST004",
        courseName: "국어 문학",
        teacherName: "박선생님",
        date: "2024-01-18",
        time: "13:00",
        duration: 60,
        status: "canceled",
        price: 50000,
        paymentStatus: "unpaid",
        notes: "고전 문학 읽기",
        createdAt: "2024-01-13",
      },
    ];

    const mockStudents: Student[] = [
      {
        id: "ST001",
        name: "김민수",
        email: "kim@example.com",
        phone: "010-1234-5678",
        grade: "중2",
        parentName: "김부모",
        parentPhone: "010-1234-5679",
      },
      {
        id: "ST002",
        name: "박지영",
        email: "park@example.com",
        phone: "010-2345-6789",
        grade: "고1",
        parentName: "박부모",
        parentPhone: "010-2345-6790",
      },
      {
        id: "ST003",
        name: "이준호",
        email: "lee@example.com",
        phone: "010-3456-7890",
        grade: "중3",
        parentName: "이부모",
        parentPhone: "010-3456-7891",
      },
      {
        id: "ST004",
        name: "정수진",
        email: "jung@example.com",
        phone: "010-4567-8901",
        grade: "고2",
        parentName: "정부모",
        parentPhone: "010-4567-8902",
      },
    ];

    setReservations(mockReservations);
    setStudents(mockStudents);
  }, []);

  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch =
      reservation.studentName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      reservation.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.teacherName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || reservation.status === statusFilter;
    const matchesDate = !dateFilter || reservation.date === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const reservationStats = {
    total: reservations.length,
    confirmed: reservations.filter((r) => r.status === "confirmed").length,
    completed: reservations.filter((r) => r.status === "completed").length,
    canceled: reservations.filter((r) => r.status === "canceled").length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "unpaid":
        return "bg-red-100 text-red-800";
      case "partial":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleCreateReservation = () => {
    if (
      selectedStudent &&
      newReservationData.courseName &&
      newReservationData.date &&
      newReservationData.time
    ) {
      const newReservation: Reservation = {
        id: Date.now().toString(),
        studentName: selectedStudent.name,
        studentId: selectedStudent.id,
        courseName: newReservationData.courseName,
        teacherName: newReservationData.teacherName,
        date: newReservationData.date,
        time: newReservationData.time,
        duration: newReservationData.duration,
        status: "pending",
        price: newReservationData.price,
        paymentStatus: "unpaid",
        notes: newReservationData.notes,
        createdAt: new Date().toISOString().split("T")[0],
      };

      setReservations([...reservations, newReservation]);
      setShowNewReservationModal(false);
      setSelectedStudent(null);
      setNewReservationData({
        courseName: "",
        teacherName: "",
        date: "",
        time: "",
        duration: 60,
        price: 0,
        notes: "",
      });
    }
  };

  const handleStatusChange = (
    reservationId: string,
    newStatus: Reservation["status"],
  ) => {
    setReservations(
      reservations.map((r) =>
        r.id === reservationId ? { ...r, status: newStatus } : r,
      ),
    );
  };

  const handleDeleteReservation = (reservationId: string) => {
    setReservations(reservations.filter((r) => r.id !== reservationId));
    setSelectedReservation(null);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">예약 관리</h1>
          <p className="text-gray-600">
            학생 예약을 관리하고 새로운 예약을 생성할 수 있습니다.
          </p>
        </div>

        {/* Reservation Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">전체 예약</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reservationStats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">확정된 예약</p>
                <p className="text-2xl font-bold text-blue-600">
                  {reservationStats.confirmed}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">완료된 예약</p>
                <p className="text-2xl font-bold text-green-600">
                  {reservationStats.completed}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">취소된 예약</p>
                <p className="text-2xl font-bold text-red-600">
                  {reservationStats.canceled}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="학생명, 코스명, 선생님명으로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">전체 상태</option>
                  <option value="pending">대기중</option>
                  <option value="confirmed">확정</option>
                  <option value="completed">완료</option>
                  <option value="canceled">취소</option>
                </select>

                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowHistoryModal(true)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  예약 히스토리
                </button>
                <button
                  onClick={() => setShowNewReservationModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />새 예약
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reservations Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    학생 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    코스 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    일정
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    결제
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가격
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div
                            className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                            onClick={() => setSelectedReservation(reservation)}
                          >
                            {reservation.studentName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {reservation.studentId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {reservation.courseName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {reservation.teacherName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {reservation.date}
                      </div>
                      <div className="text-sm text-gray-500">
                        {reservation.time} ({reservation.duration}분)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reservation.status)}`}
                      >
                        {reservation.status === "confirmed" && "확정"}
                        {reservation.status === "completed" && "완료"}
                        {reservation.status === "canceled" && "취소"}
                        {reservation.status === "pending" && "대기중"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(reservation.paymentStatus)}`}
                      >
                        {reservation.paymentStatus === "paid" && "결제완료"}
                        {reservation.paymentStatus === "unpaid" && "미결제"}
                        {reservation.paymentStatus === "partial" && "부분결제"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reservation.price.toLocaleString()}원
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedReservation(reservation)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <select
                          value={reservation.status}
                          onChange={(e) =>
                            handleStatusChange(
                              reservation.id,
                              e.target.value as Reservation["status"],
                            )
                          }
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="pending">대기중</option>
                          <option value="confirmed">확정</option>
                          <option value="completed">완료</option>
                          <option value="canceled">취소</option>
                        </select>
                        <button
                          onClick={() =>
                            handleDeleteReservation(reservation.id)
                          }
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Reservation Modal */}
      {showNewReservationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">새 예약 생성</h2>
              <button
                onClick={() => setShowNewReservationModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Student Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  학생 선택
                </label>
                <select
                  value={selectedStudent?.id || ""}
                  onChange={(e) => {
                    const student = students.find(
                      (s) => s.id === e.target.value,
                    );
                    setSelectedStudent(student || null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">학생을 선택하세요</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.id}) - {student.grade}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course and Teacher */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    코스명
                  </label>
                  <input
                    type="text"
                    value={newReservationData.courseName}
                    onChange={(e) =>
                      setNewReservationData({
                        ...newReservationData,
                        courseName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="코스명을 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    담당 선생님
                  </label>
                  <input
                    type="text"
                    value={newReservationData.teacherName}
                    onChange={(e) =>
                      setNewReservationData({
                        ...newReservationData,
                        teacherName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="선생님명을 입력하세요"
                  />
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    날짜
                  </label>
                  <input
                    type="date"
                    value={newReservationData.date}
                    onChange={(e) =>
                      setNewReservationData({
                        ...newReservationData,
                        date: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    시간
                  </label>
                  <input
                    type="time"
                    value={newReservationData.time}
                    onChange={(e) =>
                      setNewReservationData({
                        ...newReservationData,
                        time: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    수업 시간 (분)
                  </label>
                  <input
                    type="number"
                    value={newReservationData.duration}
                    onChange={(e) =>
                      setNewReservationData({
                        ...newReservationData,
                        duration: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="30"
                    max="180"
                    step="30"
                  />
                </div>
              </div>

              {/* Price and Notes */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    가격 (원)
                  </label>
                  <input
                    type="number"
                    value={newReservationData.price}
                    onChange={(e) =>
                      setNewReservationData({
                        ...newReservationData,
                        price: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    메모
                  </label>
                  <input
                    type="text"
                    value={newReservationData.notes}
                    onChange={(e) =>
                      setNewReservationData({
                        ...newReservationData,
                        notes: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="메모를 입력하세요"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowNewReservationModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleCreateReservation}
                  disabled={
                    !selectedStudent ||
                    !newReservationData.courseName ||
                    !newReservationData.date ||
                    !newReservationData.time
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  예약 생성
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reservation Detail Modal */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                예약 상세 정보
              </h2>
              <button
                onClick={() => setSelectedReservation(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    학생 정보
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        이름:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedReservation.studentName}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        학생 ID:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedReservation.studentId}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    수업 정보
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        코스:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedReservation.courseName}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        선생님:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedReservation.teacherName}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    일정 정보
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        날짜:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedReservation.date}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        시간:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedReservation.time} (
                        {selectedReservation.duration}분)
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    결제 정보
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        가격:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedReservation.price.toLocaleString()}원
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        결제 상태:
                      </span>
                      <span
                        className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(selectedReservation.paymentStatus)}`}
                      >
                        {selectedReservation.paymentStatus === "paid" &&
                          "결제완료"}
                        {selectedReservation.paymentStatus === "unpaid" &&
                          "미결제"}
                        {selectedReservation.paymentStatus === "partial" &&
                          "부분결제"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedReservation.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    메모
                  </h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedReservation.notes}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() =>
                    handleDeleteReservation(selectedReservation.id)
                  }
                  className="px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  예약 삭제
                </button>
                <button
                  onClick={() => setSelectedReservation(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reservation History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">예약 히스토리</h2>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {reservations
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime(),
                )
                .map((reservation) => (
                  <div
                    key={reservation.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {reservation.studentName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {reservation.courseName} - {reservation.teacherName}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {reservation.date} {reservation.time}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reservation.status)}`}
                          >
                            {reservation.status === "confirmed" && "확정"}
                            {reservation.status === "completed" && "완료"}
                            {reservation.status === "canceled" && "취소"}
                            {reservation.status === "pending" && "대기중"}
                          </span>
                          <span className="text-sm text-gray-500">
                            {reservation.price.toLocaleString()}원
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReservationsPage;

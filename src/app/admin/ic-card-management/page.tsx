"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Users,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  Download,
} from "lucide-react";

interface ICUser {
  uid: string;
  name: string;
  type: "student" | "teacher" | "staff";
  cardId?: string;
  isRegistered: boolean;
  lastActivity?: string;
  totalSessions: number;
  totalPayments: number;
  currentBalance: number;
}

interface TaggingRecord {
  id: string;
  uid: string;
  userName: string;
  userType: "student" | "teacher" | "staff";
  timestamp: string;
  action: "attendance" | "payment" | "checkin" | "checkout";
  amount?: number;
  sessionId?: string;
  status: "success" | "failed" | "pending";
  location: string;
}

interface AttendanceStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  totalTeachers: number;
  presentTeachers: number;
  totalStaff: number;
  presentStaff: number;
}

export default function ICCardManagementPage() {
  const [users, setUsers] = useState<ICUser[]>([]);
  const [taggingRecords, setTaggingRecords] = useState<TaggingRecord[]>([]);
  const [attendanceStats, setAttendanceStats] =
    useState<AttendanceStats | null>(null);
  const [selectedUser, setSelectedUser] = useState<ICUser | null>(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [newCardId, setNewCardId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "records" | "settings"
  >("overview");

  // Mock data initialization
  useEffect(() => {
    const initializeData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 실제 데이터베이스에서 사용자 데이터 로드 시도
      let mockUsers: ICUser[] = [];
      
      try {
        const usersResponse = await fetch("/api/admin/users");
        const usersData = await usersResponse.json();
        
        if (usersData.success && usersData.users && usersData.users.length > 0) {
          // 실제 데이터가 있으면 변환
          mockUsers = usersData.users.map((user: any) => ({
            uid: user.id,
            name: user.name,
            type: user.role.toLowerCase(),
            cardId: user.cardId || "",
            isRegistered: !!user.cardId,
            lastActivity: user.lastActivity || "",
            totalSessions: user.totalSessions || 0,
            totalPayments: user.totalPayments || 0,
            currentBalance: user.currentBalance || 0,
          }));
        } else {
          // 데이터가 없으면 빈 배열 (데이터 없음 상태 테스트)
          mockUsers = [];
        }
      } catch (error) {
        console.error("사용자 데이터 로드 오류:", error);
        mockUsers = [];
      }

      // 태깅 기록도 실제 데이터베이스에서 로드 시도
      let mockRecords: TaggingRecord[] = [];
      
      try {
        const recordsResponse = await fetch("/api/admin/tagging-logs");
        const recordsData = await recordsResponse.json();
        
        if (recordsData.success && recordsData.records && recordsData.records.length > 0) {
          mockRecords = recordsData.records;
        } else {
          // 데이터가 없으면 빈 배열
          mockRecords = [];
        }
      } catch (error) {
        console.error("태깅 기록 로드 오류:", error);
        mockRecords = [];
      }

      // 통계 계산 (실제 데이터 기반)
      const mockStats: AttendanceStats = {
        totalStudents: mockUsers.filter(u => u.type === 'student').length,
        presentStudents: mockUsers.filter(u => u.type === 'student' && u.isRegistered).length,
        totalTeachers: mockUsers.filter(u => u.type === 'teacher').length,
        presentTeachers: mockUsers.filter(u => u.type === 'teacher' && u.isRegistered).length,
        totalStaff: mockUsers.filter(u => u.type === 'staff').length,
        presentStaff: mockUsers.filter(u => u.type === 'staff' && u.isRegistered).length,
      };

      setUsers(mockUsers);
      setTaggingRecords(mockRecords);
      setAttendanceStats(mockStats);
      setIsLoading(false);
    };

    initializeData();
  }, []);

  const handleCardRegistration = (user: ICUser) => {
    setSelectedUser(user);
    setNewCardId("");
    setShowRegistrationModal(true);
  };

  const submitCardRegistration = () => {
    if (!selectedUser || !newCardId.trim()) return;

    setUsers((prev) =>
      prev.map((user) =>
        user.uid === selectedUser.uid
          ? { ...user, cardId: newCardId, isRegistered: true }
          : user,
      ),
    );

    setShowRegistrationModal(false);
    setSelectedUser(null);
    setNewCardId("");
  };

  const simulateTagging = () => {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const actions: ("attendance" | "payment" | "checkin" | "checkout")[] = [
      "attendance",
      "payment",
      "checkin",
      "checkout",
    ];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];

    const newRecord: TaggingRecord = {
      id: Date.now().toString(),
      uid: randomUser.uid,
      userName: randomUser.name,
      userType: randomUser.type,
      timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
      action: randomAction,
      amount:
        randomAction === "payment"
          ? Math.floor(Math.random() * 20000) + 5000
          : undefined,
      sessionId:
        randomAction === "attendance" ? `SESS${Date.now()}` : undefined,
      status: "success",
      location: "교실 A",
    };

    setTaggingRecords((prev) => [newRecord, ...prev]);
  };

  const exportData = () => {
    // Mock export functionality
    console.log("Exporting IC card data...");
    alert("IC 카드 데이터가 엑셀 파일로 다운로드되었습니다.");
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "attendance":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "payment":
        return <DollarSign className="w-4 h-4 text-blue-600" />;
      case "checkin":
        return <Clock className="w-4 h-4 text-purple-600" />;
      case "checkout":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-100";
      case "failed":
        return "text-red-600 bg-red-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">IC 카드 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!attendanceStats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">데이터를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full overflow-hidden">
      <div className="px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            IC 카드 통합 관리
          </h1>
          <p className="text-gray-600">
            NFC/FeliCa 기반 학생 및 직원 출석, 결제, 근태 관리 시스템
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="grid grid-cols-4">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex flex-col items-center py-4 px-2 transition-colors ${
                activeTab === "overview"
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Users className="w-6 h-6 mb-1" />
              <span className="text-xs">개요</span>
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`flex flex-col items-center py-4 px-2 transition-colors ${
                activeTab === "users"
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <CreditCard className="w-6 h-6 mb-1" />
              <span className="text-xs">사용자 관리</span>
            </button>
            <button
              onClick={() => setActiveTab("records")}
              className={`flex flex-col items-center py-4 px-2 transition-colors ${
                activeTab === "records"
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Clock className="w-6 h-6 mb-1" />
              <span className="text-xs">태깅 기록</span>
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex flex-col items-center py-4 px-2 transition-colors ${
                activeTab === "settings"
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Settings className="w-6 h-6 mb-1" />
              <span className="text-xs">설정</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {activeTab === "overview" && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                오늘의 출석 현황
              </h2>

              {/* Attendance Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        학생
                      </h3>
                      <p className="text-2xl font-bold text-blue-600">
                        {attendanceStats.presentToday}/
                        {attendanceStats.totalStudents}
                      </p>
                      <p className="text-sm text-gray-600">
                        출석률:{" "}
                        {Math.round(
                          (attendanceStats.presentToday /
                            attendanceStats.totalStudents) *
                            100,
                        )}
                        %
                      </p>
                    </div>
                    <Users className="w-12 h-12 text-blue-600" />
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        선생님
                      </h3>
                      <p className="text-2xl font-bold text-green-600">
                        {attendanceStats.presentTeachers}/
                        {attendanceStats.totalTeachers}
                      </p>
                      <p className="text-sm text-gray-600">
                        출근률:{" "}
                        {Math.round(
                          (attendanceStats.presentTeachers /
                            attendanceStats.totalTeachers) *
                            100,
                        )}
                        %
                      </p>
                    </div>
                    <Clock className="w-12 h-12 text-green-600" />
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        직원
                      </h3>
                      <p className="text-2xl font-bold text-purple-600">
                        {attendanceStats.presentStaff}/
                        {attendanceStats.totalStaff}
                      </p>
                      <p className="text-sm text-gray-600">
                        출근률:{" "}
                        {Math.round(
                          (attendanceStats.presentStaff /
                            attendanceStats.totalStaff) *
                            100,
                        )}
                        %
                      </p>
                    </div>
                    <CreditCard className="w-12 h-12 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    빠른 작업
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={simulateTagging}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      태깅 시뮬레이션
                    </button>
                    <button
                      onClick={exportData}
                      className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      데이터 내보내기
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    시스템 상태
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">IC 리더기</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        정상
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        데이터베이스
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        정상
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">네트워크</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        정상
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                사용자 관리
              </h2>

              {users.length === 0 ? (
                <div className="p-8 text-center">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    등록된 사용자가 없습니다
                  </h3>
                  <p className="text-gray-600 mb-6">
                    아직 등록된 사용자가 없습니다. 새로운 사용자를 등록해보세요.
                  </p>
                  <button
                    onClick={() => window.location.href = '/admin/students'}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Users className="h-4 w-4" />
                    사용자 관리로 이동
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          사용자
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          유형
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          카드 상태
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          마지막 활동
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          통계
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          작업
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                      <tr key={user.uid} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.uid}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.type === "student"
                                ? "bg-blue-100 text-blue-800"
                                : user.type === "teacher"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {user.type === "student" && "학생"}
                            {user.type === "teacher" && "선생님"}
                            {user.type === "staff" && "직원"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.isRegistered ? (
                            <div>
                              <div className="flex items-center">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                <span className="text-sm text-green-600">
                                  등록됨
                                </span>
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.cardId}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <XCircle className="w-4 h-4 text-red-500 mr-2" />
                              <span className="text-sm text-red-600">
                                미등록
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.lastActivity || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {user.type === "student" ? (
                              <>
                                <div>수업: {user.totalSessions}회</div>
                                <div>
                                  결제: {user.totalPayments.toLocaleString()}원
                                </div>
                                <div>
                                  잔액: {user.currentBalance.toLocaleString()}원
                                </div>
                              </>
                            ) : (
                              <>
                                <div>수업: {user.totalSessions}회</div>
                                <div>
                                  근무일: {Math.floor(user.totalSessions / 4)}일
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {!user.isRegistered && (
                            <button
                              onClick={() => handleCardRegistration(user)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              카드 등록
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              )}
            </div>
          )}

          {activeTab === "records" && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                태깅 기록
              </h2>

              {taggingRecords.length === 0 ? (
                <div className="p-8 text-center">
                  <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    태깅 기록이 없습니다
                  </h3>
                  <p className="text-gray-600 mb-6">
                    아직 IC 카드 태깅 기록이 없습니다. 사용자가 카드를 사용하면 기록이 표시됩니다.
                  </p>
                  <button
                    onClick={simulateTagging}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <CreditCard className="h-4 w-4" />
                    태깅 시뮬레이션
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          시간
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          사용자
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          작업
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          상태
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          위치
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          상세
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {taggingRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.timestamp}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {record.userName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {record.uid}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getActionIcon(record.action)}
                            <span className="ml-2 text-sm text-gray-900">
                              {record.action === "attendance" && "출석"}
                              {record.action === "payment" && "결제"}
                              {record.action === "checkin" && "출근"}
                              {record.action === "checkout" && "퇴근"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}
                          >
                            {record.status === "success" && "성공"}
                            {record.status === "failed" && "실패"}
                            {record.status === "pending" && "대기"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.amount &&
                            `₩${record.amount.toLocaleString()}`}
                          {record.sessionId && `세션: ${record.sessionId}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                시스템 설정
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    IC 리더기 설정
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        리더기 모드
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option>NFC</option>
                        <option>FeliCa</option>
                        <option>자동 감지</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        태깅 타임아웃
                      </label>
                      <input
                        type="number"
                        defaultValue="30"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          자동 결제 활성화
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    알림 설정
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          태깅 성공 알림
                        </span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          태깅 실패 알림
                        </span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          미등록 카드 알림
                        </span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          일일 리포트
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Registration Modal */}
      {showRegistrationModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                IC 카드 등록
              </h3>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  {selectedUser.name} ({selectedUser.uid})
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카드 ID
                </label>
                <input
                  type="text"
                  value={newCardId}
                  onChange={(e) => setNewCardId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="카드를 리더기에 태깅하세요..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowRegistrationModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  취소
                </button>
                <button
                  onClick={submitCardRegistration}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  등록
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

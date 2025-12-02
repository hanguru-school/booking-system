"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Phone,
  Mail,
  MessageSquare,
  AlertCircle,
  Plus,
} from "lucide-react";

interface Classroom {
  id: string;
  name: string;
  location: string;
  capacity: number;
  facilities: string[];
  schedule: string;
  description: string;
  status: "available" | "occupied" | "maintenance";
  contactInfo: {
    phone: string;
    email: string;
    address: string;
  };
}

interface Reservation {
  id: string;
  date: string;
  time: string;
  duration: string;
  courseName: string;
  studentCount: number;
  status: "confirmed" | "pending" | "cancelled";
}

const ClassroomDetailPage = ({ params }: { params: { id: string } }) => {
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data
    const mockClassroom: Classroom = {
      id: params.id,
      name: "교실 A",
      location: "1층 101호",
      capacity: 20,
      facilities: ["프로젝터", "화이트보드", "에어컨", "Wi-Fi", "컴퓨터"],
      schedule: "월-금 09:00-18:00, 토 09:00-17:00",
      description:
        "최신 시설을 갖춘 현대적인 교실입니다. 프로젝터와 화이트보드가 설치되어 있어 다양한 수업 방식을 지원합니다.",
      status: "available",
      contactInfo: {
        phone: "02-1234-5678",
        email: "info@edubook.com",
        address: "서울특별시 강남구 테헤란로 123",
      },
    };

    const mockReservations: Reservation[] = [
      {
        id: "1",
        date: "2024-01-20",
        time: "14:00",
        duration: "60분",
        courseName: "수학 기초",
        studentCount: 15,
        status: "confirmed",
      },
      {
        id: "2",
        date: "2024-01-22",
        time: "15:30",
        duration: "90분",
        courseName: "영어 회화",
        studentCount: 12,
        status: "pending",
      },
      {
        id: "3",
        date: "2024-01-25",
        time: "16:00",
        duration: "60분",
        courseName: "과학 실험",
        studentCount: 18,
        status: "confirmed",
      },
    ];

    setClassroom(mockClassroom);
    setReservations(mockReservations);
    setLoading(false);
  }, [params.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "occupied":
        return "bg-red-100 text-red-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "사용 가능";
      case "occupied":
        return "사용 중";
      case "maintenance":
        return "점검 중";
      default:
        return status;
    }
  };

  const getReservationStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getReservationStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "확정";
      case "pending":
        return "대기";
      case "cancelled":
        return "취소";
      default:
        return status;
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

  if (!classroom) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            교실을 찾을 수 없습니다
          </h2>
          <p className="text-gray-600 mb-4">
            요청하신 교실 정보가 존재하지 않습니다.
          </p>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                뒤로 가기
              </Link>
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              {classroom.name}
            </h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 교실 정보 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {classroom.name}
                </h2>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(classroom.status)}`}
                >
                  {getStatusText(classroom.status)}
                </span>
              </div>

              <p className="text-gray-600 mb-6">{classroom.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">위치</p>
                      <p className="text-sm text-gray-600">
                        {classroom.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        수용 인원
                      </p>
                      <p className="text-sm text-gray-600">
                        {classroom.capacity}명
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        운영 시간
                      </p>
                      <p className="text-sm text-gray-600">
                        {classroom.schedule}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    시설
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {classroom.facilities.map((facility, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 예약 현황 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  예약 현황
                </h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Plus className="w-4 h-4" />
                  예약하기
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        날짜
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        시간
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        과목
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        학생 수
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        상태
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reservations.map((reservation) => (
                      <tr key={reservation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {reservation.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {reservation.time} ({reservation.duration})
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {reservation.courseName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {reservation.studentCount}명
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getReservationStatusColor(reservation.status)}`}
                          >
                            {getReservationStatusText(reservation.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 연락처 정보 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                연락처 정보
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      전화번호
                    </p>
                    <p className="text-sm text-gray-600">
                      {classroom.contactInfo.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">이메일</p>
                    <p className="text-sm text-gray-600">
                      {classroom.contactInfo.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">주소</p>
                    <p className="text-sm text-gray-600">
                      {classroom.contactInfo.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 문의하기 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                문의하기
              </h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    제목
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="문의 제목을 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    내용
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="문의 내용을 입력하세요"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <MessageSquare className="w-4 h-4" />
                  문의하기
                </button>
              </form>
            </div>

            {/* 빠른 예약 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                빠른 예약
              </h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  오늘 예약
                </button>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  내일 예약
                </button>
                <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  이번 주 예약
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassroomDetailPage;

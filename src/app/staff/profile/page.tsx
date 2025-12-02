"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Edit,
  Save,
  X,
  Camera,
} from "lucide-react";

interface StaffProfile {
  id: string;
  // 기본 정보
  name: string;
  nameKanji: string;
  nameYomi: string;
  nameKorean: string;
  email: string;
  phone: string;
  emergencyContact: string;
  emergencyContactName: string;
  emergencyContactRelation: string;

  // 주소 정보
  address: string;
  postalCode: string;

  // 출근 정보
  commuteMethod: string;
  nearestStation: string;
  oneWayCost: number;

  // 계좌 정보
  bankAccount: string;

  // 직장 정보
  department: string;
  position: string;
  hireDate: string;
  avatar: string;

  permissions: {
    canViewReservations: boolean;
    canEditReservations: boolean;
    canViewMessages: boolean;
    canSendMessages: boolean;
    canViewReports: boolean;
    canManageStudents: boolean;
  };
}

const ProfilePage = () => {
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data
    const mockProfile: StaffProfile = {
      id: "1",
      // 기본 정보
      name: "김사무직원",
      nameKanji: "金事務職員",
      nameYomi: "キムジムショクイン",
      nameKorean: "김사무직원",
      email: "staff@edubook.com",
      phone: "010-1234-5678",
      emergencyContact: "010-9876-5432",
      emergencyContactName: "김부모님",
      emergencyContactRelation: "부모",

      // 주소 정보
      address: "東京都渋谷区渋谷1-1-1",
      postalCode: "150-0002",

      // 출근 정보
      commuteMethod: "전철",
      nearestStation: "渋谷駅",
      oneWayCost: 280,

      // 계좌 정보
      bankAccount: "1234-5678-9012-3456",

      // 직장 정보
      department: "사무팀",
      position: "사무직원",
      hireDate: "2023-01-15",
      avatar: "/avatars/staff.jpg",

      permissions: {
        canViewReservations: true,
        canEditReservations: false,
        canViewMessages: true,
        canSendMessages: true,
        canViewReports: false,
        canManageStudents: false,
      },
    };
    setProfile(mockProfile);
    setEditedProfile(mockProfile);
    setLoading(false);
  }, []);

  const handleSave = () => {
    if (editedProfile) {
      setProfile(editedProfile);
      setIsEditing(false);
      // 실제로는 API 호출로 저장
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            프로필을 찾을 수 없습니다
          </h2>
          <p className="text-gray-600">프로필 정보를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">내 정보</h1>
          <p className="text-gray-600">
            개인 정보와 권한을 확인하고 관리하세요
          </p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Edit className="w-4 h-4" />
            정보 수정
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Save className="w-4 h-4" />
              저장
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              <X className="w-4 h-4" />
              취소
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-16 h-16 text-gray-400" />
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {isEditing ? editedProfile?.name : profile.name}
              </h2>
              <p className="text-gray-600 mb-4">{profile.position}</p>
              <div className="text-sm text-gray-500">
                <p>사원번호: {profile.id}</p>
                <p>부서: {profile.department}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              개인 정보
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile?.name || ""}
                    onChange={(e) =>
                      setEditedProfile((prev) =>
                        prev ? { ...prev, name: e.target.value } : null,
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이메일
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedProfile?.email || ""}
                    onChange={(e) =>
                      setEditedProfile((prev) =>
                        prev ? { ...prev, email: e.target.value } : null,
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  전화번호
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedProfile?.phone || ""}
                    onChange={(e) =>
                      setEditedProfile((prev) =>
                        prev ? { ...prev, phone: e.target.value } : null,
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.phone}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  입사일
                </label>
                <p className="text-gray-900">{profile.hireDate}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  주소
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile?.address || ""}
                    onChange={(e) =>
                      setEditedProfile((prev) =>
                        prev ? { ...prev, address: e.target.value } : null,
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              권한 정보
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">
                    예약 관리
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {profile.permissions.canEditReservations
                      ? "편집 가능"
                      : "열람만"}
                  </span>
                  <Shield className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">
                    메시지 발송
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {profile.permissions.canSendMessages ? "가능" : "불가"}
                  </span>
                  <Shield className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-900">
                    학생 관리
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {profile.permissions.canManageStudents ? "가능" : "불가"}
                  </span>
                  <Shield className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-gray-900">
                    리포트 조회
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {profile.permissions.canViewReports ? "가능" : "불가"}
                  </span>
                  <Shield className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Work Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              근무 정보
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  부서
                </label>
                <p className="text-gray-900">{profile.department}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  직책
                </label>
                <p className="text-gray-900">{profile.position}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  입사일
                </label>
                <p className="text-gray-900">{profile.hireDate}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  근무일수
                </label>
                <p className="text-gray-900">365일</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

"use client";

import { useState, useEffect } from "react";
import {
  User,
  Calendar,
  Edit,
  ArrowLeft,
  Star,
  Award,
  TrendingUp,
  Clock,
  BookOpen,
  FileText,
  Mic,
  PenTool,
  ChevronRight,
  Settings,
  Download,
} from "lucide-react";
import Link from "next/link";

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  level: string;
  points: number;
  totalClasses: number;
  completedClasses: number;
  remainingHours: number;
  joinDate: string;
  lastLogin: string;
  avatar?: string;
  kanjiName?: string;
  yomigana?: string;
  koreanName?: string;
}

interface ClassHistory {
  id: string;
  date: string;
  teacher: string;
  subject: string;
  duration: number;
  score?: number;
  notes?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
  progress?: number;
  maxProgress?: number;
}

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [classHistory, setClassHistory] = useState<ClassHistory[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "history" | "achievements" | "settings"
  >("overview");

  useEffect(() => {
    // 실제 사용자 데이터 가져오기
    const fetchUserData = async () => {
      try {
        // 세션에서 사용자 정보 가져오기
        const sessionResponse = await fetch("/api/auth/session");
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();

          if (sessionData.user) {
            // 학생 상세 정보 가져오기
            const studentResponse = await fetch(`/api/student/profile`);
            if (studentResponse.ok) {
              const studentData = await studentResponse.json();
              setProfile({
                id: sessionData.user.id,
                name: sessionData.user.name,
                email: sessionData.user.email,
                phone: sessionData.user.phone,
                level: studentData.level || "초급 A",
                points: studentData.points || 0,
                totalClasses: studentData.totalClasses || 0,
                completedClasses: studentData.completedClasses || 0,
                remainingHours: studentData.remainingTime?.total || 0,
                joinDate:
                  sessionData.user.createdAt || new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                kanjiName: studentData.kanjiName,
                yomigana: studentData.yomigana,
                koreanName: studentData.koreanName,
              });
            } else {
              // 세션 데이터만으로 기본 정보 설정
              setProfile({
                id: sessionData.user.id,
                name: sessionData.user.name,
                email: sessionData.user.email,
                phone: sessionData.user.phone,
                level: "초급 A",
                points: 0,
                totalClasses: 0,
                completedClasses: 0,
                remainingHours: 0,
                joinDate:
                  sessionData.user.createdAt || new Date().toISOString(),
                lastLogin: new Date().toISOString(),
              });
            }
          }
        }
      } catch (error) {
        console.error("사용자 데이터 가져오기 오류:", error);
        // 오류 시 기본 데이터 설정
        setProfile({
          id: "unknown",
          name: "사용자",
          email: "unknown@example.com",
          phone: "010-0000-0000",
          level: "초급 A",
          points: 0,
          totalClasses: 0,
          completedClasses: 0,
          remainingHours: 0,
          joinDate: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          프로필을 찾을 수 없습니다
        </h3>
        <p className="text-gray-600">사용자 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/student/home"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            대시보드로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">마이페이지</h1>
        </div>
        <p className="text-lg text-gray-600">
          학습 현황과 개인 정보를 확인하세요
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 프로필 카드 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
            {/* 프로필 정보 */}
            <div className="text-center mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt="프로필 사진"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-gray-400" />
                    )}
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {profile.kanjiName && profile.koreanName
                      ? `${profile.kanjiName} / ${profile.koreanName}`
                      : profile.name}
                  </h2>
                  <p className="text-gray-600">{profile.email}</p>
                  <p className="text-sm text-gray-500">학생</p>
                </div>
              </div>
            </div>

            {/* 학생 정보 카드들 */}
            <div className="space-y-3 mb-6">
              <Link href="/student/level" className="block">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                  <div className="flex items-center">
                    <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      현재 레벨
                    </span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">
                    {profile.level}
                  </span>
                </div>
              </Link>

              <Link href="/student/points" className="block">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors cursor-pointer">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-600 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      보유 포인트
                    </span>
                  </div>
                  <span className="text-lg font-bold text-yellow-600">
                    {profile.points}P
                  </span>
                </div>
              </Link>

              <Link href="/student/time" className="block">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      남은 시간
                    </span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {profile.remainingHours}시간
                  </span>
                </div>
              </Link>
            </div>

            {/* 통계 */}
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                학습 통계
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">총 수업</span>
                  <span className="text-sm font-medium text-gray-900">
                    {profile.totalClasses}회
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">완료 수업</span>
                  <span className="text-sm font-medium text-gray-900">
                    {profile.completedClasses}회
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">완료율</span>
                  <span className="text-sm font-medium text-gray-900">
                    {profile.totalClasses > 0
                      ? Math.round(
                          (profile.completedClasses / profile.totalClasses) *
                            100,
                        )
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="space-y-2">
              <Link href="/student/settings/profile" className="block">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Edit className="w-4 h-4" />
                  프로필 확인
                </button>
              </Link>
              <Link href="/student/settings" className="block">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <Settings className="w-4 h-4" />
                  설정
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="lg:col-span-2">
          {/* 탭 네비게이션 */}
          <div className="bg-white rounded-xl shadow-lg mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: "overview", name: "개요", icon: TrendingUp },
                  { id: "history", name: "수업 이력", icon: Calendar },
                  { id: "achievements", name: "성취", icon: Award },
                  { id: "settings", name: "설정", icon: Settings },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() =>
                      setActiveTab(
                        tab.id as
                          | "overview"
                          | "history"
                          | "achievements"
                          | "settings",
                      )
                    }
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* 개요 탭 */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* 학습 진행도 */}
                  <Link href="/student/progress-settings" className="block">
                    <div className="cursor-pointer hover:bg-gray-50 p-4 rounded-lg transition-colors">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        학습 진행도
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </h3>
                      <div className="bg-gray-200 rounded-full h-3 mb-2">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                          style={{
                            width: `${profile.totalClasses > 0 ? (profile.completedClasses / profile.totalClasses) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>완료: {profile.completedClasses}회</span>
                        <span>목표: {profile.totalClasses}회</span>
                      </div>
                    </div>
                  </Link>

                  {/* 최근 활동 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      최근 활동
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            레슨노트 열람
                          </div>
                          <div className="text-xs text-gray-600">2시간 전</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <FileText className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            숙제 제출
                          </div>
                          <div className="text-xs text-gray-600">1일 전</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Mic className="w-5 h-5 text-purple-600" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            듣기 연습
                          </div>
                          <div className="text-xs text-gray-600">2일 전</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 빠른 링크 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      빠른 링크
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        href="/student/reservations"
                        className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          예약 관리
                        </span>
                      </Link>
                      <Link
                        href="/student/notes"
                        className="flex items-center gap-2 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <BookOpen className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">
                          레슨노트
                        </span>
                      </Link>
                      <Link
                        href="/student/homework"
                        className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                      >
                        <FileText className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-900">
                          숙제
                        </span>
                      </Link>
                      <Link
                        href="/student/vocabulary"
                        className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                      >
                        <PenTool className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-900">
                          단어 복습
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* 수업 이력 탭 */}
              {activeTab === "history" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      수업 이력
                    </h3>
                    <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                      <Download className="w-4 h-4" />
                      내보내기
                    </button>
                  </div>
                  <div className="text-center py-8">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      아직 수업 이력이 없습니다
                    </h3>
                    <p className="text-gray-600 mb-4">
                      첫 번째 수업을 예약해보세요!
                    </p>
                    <Link
                      href="/student/reservations/new"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                      수업 예약하기
                    </Link>
                  </div>
                </div>
              )}

              {/* 성취 탭 */}
              {activeTab === "achievements" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      성취
                    </h3>
                    <Link
                      href="/student/achievements"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      전체 보기
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="text-center py-8">
                    <Award className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      아직 성취가 없습니다
                    </h3>
                    <p className="text-gray-600">
                      수업을 통해 성취를 달성해보세요!
                    </p>
                  </div>
                </div>
              )}

              {/* 설정 탭 */}
              {activeTab === "settings" && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    설정
                  </h3>
                  <div className="space-y-3">
                    <Link href="/student/settings" className="block">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            전체 설정
                          </h4>
                          <p className="text-sm text-gray-600">
                            모든 설정을 한 곳에서 관리
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </Link>

                    <Link href="/student/settings/profile" className="block">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            프로필 관리
                          </h4>
                          <p className="text-sm text-gray-600">
                            개인 정보 및 기본 설정
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </Link>

                    <Link href="/student/settings/security" className="block">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            계정 보안
                          </h4>
                          <p className="text-sm text-gray-600">
                            비밀번호 변경 및 보안 설정
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </Link>

                    <Link
                      href="/student/settings/notifications"
                      className="block"
                    >
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            알림 설정
                          </h4>
                          <p className="text-sm text-gray-600">
                            수업 알림 및 리마인더 설정
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </Link>

                    <Link href="/student/settings/language" className="block">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            언어 설정
                          </h4>
                          <p className="text-sm text-gray-600">
                            한국어/일본어 언어 선택
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

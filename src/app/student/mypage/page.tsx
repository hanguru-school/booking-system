"use client";

import { useState, useEffect } from "react";
import {
  User,
  Calendar,
  Star,
  Edit,
  Save,
  Home,
  Phone,
  Mail,
  BookOpen,
  FileText,
  MessageSquare,
  Bell,
  BarChart3,
  Search,
  Clock,
  Award,
  Target,
  TrendingUp,
  Eye,
  AlertCircle,
  BookMarked,
  Volume2,
  Play,
  Upload,
  BookOpenCheck,
  Trophy,
  Shield,
  Link as LinkIcon,
} from "lucide-react";
import Link from "next/link";

interface StudentInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  level: string;
  points: number;
  joinDate: string;
  uid: string;
  lineConnected: boolean;
  totalAttendance: number;
  totalStudyTime: number; // 분 단위
  remainingTime: number; // 분 단위
  purchasedTime: number; // 구매한 시간 (분 단위)
  birthDate: string; // 생년월일 추가
  profileImage?: string; // 프로필 사진 추가
  lastModified?: string;
}

interface LessonNote {
  id: string;
  title: string;
  content: string;
  date: string;
  teacherName: string;
  courseName: string;
  words: string[];
}

interface Vocabulary {
  id: string;
  word: string;
  meaning: string;
  partOfSpeech: string;
  example: string;
  pronunciation: string;
  dateAdded: string;
}

interface Homework {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: "pending" | "submitted" | "completed";
  courseName: string;
  teacherName: string;
}

interface Review {
  id: string;
  date: string;
  courseName: string;
  content: string;
  rating: number;
  teacherResponse?: string;
  studentResponse?: string;
}

interface Notification {
  id: string;
  type: "reminder" | "review_request" | "encouragement" | "system";
  title: string;
  content: string;
  date: string;
  read: boolean;
  relatedUrl?: string;
}

interface LearningStats {
  totalClasses: number;
  totalStudyTime: number;
  recentStudyDays: number;
  levelDistribution: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
  averageRating: number;
  streakDays: number;
}

export default function StudentMyPage() {
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [lessonNotes, setLessonNotes] = useState<LessonNote[]>([]);
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [learningStats, setLearningStats] = useState<LearningStats | null>(
    null,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("profile");

  // 필터 상태
  const [noteFilter, setNoteFilter] = useState("all");
  const [vocabFilter, setVocabFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // 편집용 임시 데이터
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // 학생 정보 조회
  const fetchStudentInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/student/profile");
      const data = await response.json();

      if (data.success) {
        setStudentInfo(data.student);
        setEditData({
          name: data.student.name,
          email: data.student.email,
          phone: data.student.phone,
          address: data.student.address,
        });
      }
    } catch (error) {
      console.error("학생 정보 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 레슨노트 조회
  const fetchLessonNotes = async () => {
    try {
      const response = await fetch("/api/lesson-notes/student");
      const data = await response.json();

      if (data.success) {
        setLessonNotes(data.notes);
      }
    } catch (error) {
      console.error("레슨노트 조회 실패:", error);
    }
  };

  // 단어장 조회
  const fetchVocabulary = async () => {
    try {
      const response = await fetch("/api/student/vocabulary");
      const data = await response.json();

      if (data.success) {
        setVocabulary(data.vocabulary);
      }
    } catch (error) {
      console.error("단어장 조회 실패:", error);
    }
  };

  // 숙제 조회
  const fetchHomework = async () => {
    try {
      const response = await fetch("/api/student/homework");
      const data = await response.json();

      if (data.success) {
        setHomework(data.homework);
      }
    } catch (error) {
      console.error("숙제 조회 실패:", error);
    }
  };

  // 리뷰 조회
  const fetchReviews = async () => {
    try {
      const response = await fetch("/api/student/reviews");
      const data = await response.json();

      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error("리뷰 조회 실패:", error);
    }
  };

  // 알림 조회
  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/student/notifications");
      const data = await response.json();

      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("알림 조회 실패:", error);
    }
  };

  // 학습 통계 조회
  const fetchLearningStats = async () => {
    try {
      const response = await fetch("/api/student/stats");
      const data = await response.json();

      if (data.success) {
        setLearningStats(data.stats);
      }
    } catch (error) {
      console.error("학습 통계 조회 실패:", error);
    }
  };

  // 정보 수정
  const updateProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/student/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("정보가 성공적으로 수정되었습니다");
        setIsEditing(false);
        fetchStudentInfo();
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(data.error || "정보 수정 실패");
      }
    } catch (error) {
      setMessage("정보 수정 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  // 편집 모드 토글
  const toggleEdit = () => {
    if (isEditing) {
      // 편집 취소 시 원래 데이터로 복원
      if (studentInfo) {
        setEditData({
          name: studentInfo.name,
          email: studentInfo.email,
          phone: studentInfo.phone,
          address: studentInfo.address,
        });
      }
    }
    setIsEditing(!isEditing);
  };

  // 필터된 레슨노트
  const getFilteredNotes = () => {
    let filtered = lessonNotes;

    if (noteFilter === "recent") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter(
        (note) => new Date(note.date) >= thirtyDaysAgo,
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.words.some((word) =>
            word.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      );
    }

    return filtered;
  };

  // 필터된 단어장
  const getFilteredVocabulary = () => {
    let filtered = vocabulary;

    if (vocabFilter !== "all") {
      filtered = filtered.filter((vocab) => vocab.partOfSpeech === vocabFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (vocab) =>
          vocab.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vocab.meaning.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return filtered;
  };

  useEffect(() => {
    fetchStudentInfo();
    fetchLessonNotes();
    fetchVocabulary();
    fetchHomework();
    fetchReviews();
    fetchNotifications();
    fetchLearningStats();
  }, []);

  if (loading && !studentInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-6xl mx-auto text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              마이페이지
            </h1>
            <p className="text-lg text-gray-600">
              내 정보 관리 및 학습 이력 확인
            </p>
          </div>
          <Link
            href="/student/dashboard"
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            대시보드
          </Link>
        </div>

        {/* 메시지 */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.includes("성공")
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        {/* 학생 프로필 요약 정보 */}
        {studentInfo && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-6 h-6 text-blue-600" />
              프로필 요약
            </h2>

            {/* 프로필 사진 및 기본 정보 */}
            <div className="flex items-start gap-6 mb-8">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {studentInfo.profileImage ? (
                    <img
                      src={studentInfo.profileImage}
                      alt="프로필 사진"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
              </div>

              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-gray-500" />
                      <span className="text-sm text-gray-600">이름</span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {studentInfo.name}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <span className="text-sm text-gray-600">생년월일</span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {studentInfo.birthDate ? 
                        new Date(studentInfo.birthDate).toLocaleDateString('ko-KR') : 
                        "미입력"
                      }
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-gray-500" />
                      <span className="text-sm text-gray-600">이메일</span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {studentInfo.email}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Phone className="w-5 h-5 text-gray-500" />
                      <span className="text-sm text-gray-600">전화번호</span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {studentInfo.phone}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-gray-500" />
                      <span className="text-sm text-gray-600">UID</span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900 font-mono">
                      {studentInfo.uid}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="w-5 h-5 text-gray-500" />
                      <span className="text-sm text-gray-600">LINE 연동</span>
                    </div>
                    <div
                      className={`text-lg font-semibold ${studentInfo.lineConnected ? "text-green-600" : "text-red-600"}`}
                    >
                      {studentInfo.lineConnected ? "연동됨" : "미연동"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 학습 통계 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600">누적 출석</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {studentInfo.totalAttendance}회
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">누적 수업시간</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {studentInfo.totalStudyTime}분
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-orange-600" />
                  <span className="text-sm text-gray-600">예약 가능 시간</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {studentInfo.remainingTime}분
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-600">현재 레벨</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {studentInfo.level}
                </div>
              </div>
            </div>

            {/* 구매한 시간 정보 */}
            <div className="mt-6 bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm text-gray-600">구매한 시간</span>
                </div>
                <div className="text-lg font-semibold text-yellow-600">
                  {studentInfo.purchasedTime}분
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                사용률:{" "}
                {Math.round(
                  ((studentInfo.purchasedTime - studentInfo.remainingTime) /
                    studentInfo.purchasedTime) *
                    100,
                )}
                %
              </div>
            </div>
          </div>
        )}

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "profile", label: "개인정보", icon: User },
              { id: "notes", label: "레슨노트", icon: FileText },
              { id: "vocabulary", label: "단어장", icon: BookMarked },
              { id: "homework", label: "숙제", icon: BookOpenCheck },
              { id: "reviews", label: "리뷰", icon: Star },
              { id: "notifications", label: "알림", icon: Bell },
              { id: "stats", label: "학습통계", icon: BarChart3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* 개인정보 탭 */}
          {activeTab === "profile" && studentInfo && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  개인정보 수정
                </h2>
                <button
                  onClick={toggleEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isEditing ? (
                    <Save className="w-4 h-4" />
                  ) : (
                    <Edit className="w-4 h-4" />
                  )}
                  {isEditing ? "저장" : "수정"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이름
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-lg">
                      {studentInfo.name}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) =>
                        setEditData({ ...editData, email: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-lg">
                      {studentInfo.email}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    전화번호
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={(e) =>
                        setEditData({ ...editData, phone: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-lg">
                      {studentInfo.phone}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    주소
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editData.address}
                      onChange={(e) =>
                        setEditData({ ...editData, address: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-lg">
                      {studentInfo.address}
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={updateProfile}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? "저장 중..." : "정보 저장"}
                  </button>
                </div>
              )}

              {/* LINE 연동 안내 */}
              {studentInfo && !studentInfo.lineConnected && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">
                      LINE 연동 안내
                    </span>
                  </div>
                  <p className="text-yellow-700 mb-3">
                    LINE을 연동하면 예약 알림과 수업 후 응원 메시지를 받을 수
                    있습니다.
                  </p>
                  <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <LinkIcon className="w-4 h-4" />
                    LINE 연동하기
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 레슨노트 탭 */}
          {activeTab === "notes" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  레슨노트
                </h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="노트 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={noteFilter}
                    onChange={(e) => setNoteFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">전체</option>
                    <option value="recent">최근 30일</option>
                  </select>
                </div>
              </div>

              {getFilteredNotes().length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>레슨노트가 없습니다</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getFilteredNotes().map((note) => (
                    <div
                      key={note.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">
                          {note.title}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {new Date(note.date).toLocaleDateString("ko-KR")}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        <div>선생님: {note.teacherName}</div>
                        <div>코스: {note.courseName}</div>
                      </div>
                      <p className="text-gray-700 mb-3 line-clamp-2">
                        {note.content}
                      </p>
                      {note.words.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {note.words.slice(0, 5).map((word, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                            >
                              {word}
                            </span>
                          ))}
                          {note.words.length > 5 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              +{note.words.length - 5}개 더
                            </span>
                          )}
                        </div>
                      )}
                      <div className="mt-3">
                        <Link
                          href={`/student/notes/${note.id}`}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          상세보기
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 단어장 탭 */}
          {activeTab === "vocabulary" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  복습 단어장
                </h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="단어 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={vocabFilter}
                    onChange={(e) => setVocabFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">전체</option>
                    <option value="명사">명사</option>
                    <option value="동사">동사</option>
                    <option value="형용사">형용사</option>
                    <option value="부사">부사</option>
                  </select>
                </div>
              </div>

              {getFilteredVocabulary().length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <BookMarked className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>단어장이 비어있습니다</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getFilteredVocabulary().map((vocab) => (
                    <div
                      key={vocab.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {vocab.word}
                        </h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {vocab.partOfSpeech}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{vocab.meaning}</p>
                      <p className="text-sm text-gray-600 mb-3 italic">
                        "{vocab.example}"
                      </p>
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm">
                          <Volume2 className="w-4 h-4" />
                          발음
                        </button>
                        <button className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm">
                          <Play className="w-4 h-4" />
                          예문
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 숙제 탭 */}
          {activeTab === "homework" && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                숙제 확인 및 제출
              </h2>

              {homework.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <BookOpenCheck className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>숙제가 없습니다</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {homework.map((hw) => (
                    <div
                      key={hw.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">
                          {hw.title}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            hw.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : hw.status === "submitted"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {hw.status === "completed"
                            ? "완료"
                            : hw.status === "submitted"
                              ? "제출됨"
                              : "미완료"}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        <div>선생님: {hw.teacherName}</div>
                        <div>코스: {hw.courseName}</div>
                        <div>
                          마감일:{" "}
                          {new Date(hw.dueDate).toLocaleDateString("ko-KR")}
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4">{hw.description}</p>
                      {hw.status === "pending" && (
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          <Upload className="w-4 h-4" />
                          제출하기
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 리뷰 탭 */}
          {activeTab === "reviews" && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                리뷰 확인 및 응답
              </h2>

              {reviews.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Star className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>리뷰가 없습니다</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">
                          {review.courseName}
                        </h3>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? "text-yellow-500 fill-current" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        {new Date(review.date).toLocaleDateString("ko-KR")}
                      </div>
                      <p className="text-gray-700 mb-3">{review.content}</p>
                      {review.teacherResponse && (
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-3">
                          <p className="text-sm font-medium text-blue-800 mb-1">
                            선생님 답변:
                          </p>
                          <p className="text-sm text-blue-700">
                            {review.teacherResponse}
                          </p>
                        </div>
                      )}
                      {!review.studentResponse && (
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                          <MessageSquare className="w-4 h-4" />
                          답글 작성하기
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 알림 탭 */}
          {activeTab === "notifications" && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                알림 이력
              </h2>

              {notifications.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>알림이 없습니다</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`border rounded-lg p-4 ${notification.read ? "border-gray-200 bg-gray-50" : "border-blue-200 bg-blue-50"}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {new Date(notification.date).toLocaleDateString(
                            "ko-KR",
                          )}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">
                        {notification.content}
                      </p>
                      {notification.relatedUrl && (
                        <Link
                          href={notification.relatedUrl}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          관련 페이지 보기
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 학습통계 탭 */}
          {activeTab === "stats" && learningStats && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                학습 이력 통계
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-600">총 수업 횟수</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {learningStats.totalClasses}회
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-600">총 학습 시간</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {learningStats.totalStudyTime}분
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                    <span className="text-sm text-gray-600">
                      최근 30일 학습
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    {learningStats.recentStudyDays}일
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-purple-600" />
                    <span className="text-sm text-gray-600">
                      평균 리뷰 점수
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {learningStats.averageRating.toFixed(1)}점
                  </div>
                </div>
              </div>

              {/* 레벨별 학습 경향 */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  레벨별 학습 경향
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {learningStats.levelDistribution.beginner}%
                    </div>
                    <div className="text-sm text-gray-600">초급</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {learningStats.levelDistribution.intermediate}%
                    </div>
                    <div className="text-sm text-gray-600">중급</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {learningStats.levelDistribution.advanced}%
                    </div>
                    <div className="text-sm text-gray-600">고급</div>
                  </div>
                </div>
              </div>

              {/* 연속 학습 일수 */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-yellow-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      연속 학습
                    </h3>
                    <p className="text-gray-600">
                      현재 {learningStats.streakDays}일 연속으로 학습하고
                      있습니다!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 네비게이션 */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link
            href="/student/reservations"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Calendar className="w-5 h-5" />
            예약하기
          </Link>
          <Link
            href="/student/notes"
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FileText className="w-5 h-5" />
            노트 보기
          </Link>
          <Link
            href="/student/homework"
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <BookOpenCheck className="w-5 h-5" />
            숙제 하기
          </Link>
        </div>
      </div>
    </div>
  );
}

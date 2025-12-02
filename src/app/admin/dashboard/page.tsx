"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  User,
  XCircle,
  Eye,
  GraduationCap,
  BookOpen,
  Activity,
  FileText,
  Zap,
  Settings,
  BarChart3,
  Star,
  CreditCard,
  Shield,
  Building,
  X,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AdminStats {
  totalStudents: number;
  totalTeachers: number;
  totalRevenue: number;
  activeLessons: number;
  pendingReviews: number;
  systemHealth: "good" | "warning" | "error";
  monthlyGrowth: number;
  attendanceRate: number;
}

interface RecentActivity {
  id: string;
  type: "lesson" | "payment" | "review" | "system" | "student" | "teacher";
  title: string;
  description: string;
  timestamp: string;
  status: "success" | "warning" | "error" | "info";
  icon: any;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: any;
  color: string;
  bgColor: string;
}

interface RoleNavigation {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: any;
  color: string;
  bgColor: string;
}

interface Memo {
  id: string;
  date: string;
  time: string;
  content: string;
  memoType: string;
  isPublic: boolean;
  authorName: string;
  reservationId?: string;
  relatedTeacherId?: string;
  relatedStaffId?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalRevenue: 0,
    activeLessons: 0,
    pendingReviews: 0,
    systemHealth: "good",
    monthlyGrowth: 0,
    attendanceRate: 0,
  });

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    [],
  );
  const [todayMemos, setTodayMemos] = useState<Memo[]>([]);
  const [todayClasses, setTodayClasses] = useState<any[]>([]);
  const [todos, setTodos] = useState<any[]>([]);
  const [lessonNotes, setLessonNotes] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMemoModal, setShowMemoModal] = useState(false);
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);

  useEffect(() => {
    // 실제 데이터 로딩
    const loadDashboardData = async () => {
      setLoading(true);

      // 실제 데이터베이스에서 통계 데이터 로드
      try {
        const response = await fetch("/api/admin/dashboard", {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        
        if (data.success && data.stats) {
          setStats(data.stats);
        } else {
          // 데이터가 없으면 기본값으로 설정
          setStats({
            totalStudents: 0,
            totalTeachers: 0,
            totalRevenue: 0,
            activeLessons: 0,
            pendingReviews: 0,
            systemHealth: "good",
            monthlyGrowth: 0,
            attendanceRate: 0,
          });
        }
      } catch (error) {
        console.error("대시보드 데이터 로딩 실패:", error);
        // 오류 시 기본값으로 설정
        setStats({
          totalStudents: 0,
          totalTeachers: 0,
          totalRevenue: 0,
          activeLessons: 0,
          pendingReviews: 0,
          systemHealth: "good",
          monthlyGrowth: 0,
          attendanceRate: 0,
        });
      }

      // 최근 활동 데이터도 빈 배열로 설정
      setRecentActivities([]);
      
      // 오늘 날짜의 메모 가져오기
      await fetchTodayMemos();
      
      // 오늘의 수업 가져오기
      await fetchTodayClasses();
      
      // 해야할 일 가져오기
      await fetchTodos();
      
      // 레슨노트 가져오기
      await fetchLessonNotes();
      
      // 결제정보 가져오기
      await fetchPayments();
      
      setLoading(false);
    };

    loadDashboardData();
  }, []);

  const fetchTodayMemos = async () => {
    try {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      const response = await fetch(`/api/admin/memos?date=${todayStr}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.memos) {
          // 오늘 날짜의 메모만 필터링
          const todayMemosList = data.memos.filter((memo: Memo) => {
            if (!memo.date) return false;
            const memoDate = new Date(memo.date);
            const todayDate = new Date();
            return memoDate.getFullYear() === todayDate.getFullYear() &&
                   memoDate.getMonth() === todayDate.getMonth() &&
                   memoDate.getDate() === todayDate.getDate();
          });
          setTodayMemos(todayMemosList);
        } else {
          setTodayMemos([]);
        }
      } else {
        setTodayMemos([]);
      }
    } catch (error) {
      console.error('오늘의 메모 로드 오류:', error);
      setTodayMemos([]);
    }
  };

  const fetchTodayClasses = async () => {
    try {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      const response = await fetch(`/api/reservations/list?startDate=${todayStr}&endDate=${todayStr}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.reservations) {
          // 시간순으로 정렬
          const sorted = data.reservations.sort((a: any, b: any) => 
            a.startTime.localeCompare(b.startTime)
          );
          setTodayClasses(sorted);
        } else {
          setTodayClasses([]);
        }
      } else {
        setTodayClasses([]);
      }
    } catch (error) {
      console.error('오늘의 수업 로드 오류:', error);
      setTodayClasses([]);
    }
  };

  const fetchTodos = async () => {
    try {
      // 대기 중인 예약, 미완료 작업 등을 가져옴
      const response = await fetch('/api/admin/reservations', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.reservations) {
          // PENDING 상태의 예약을 해야할 일로 표시
          const pendingReservations = data.reservations
            .filter((r: any) => r.status === 'PENDING')
            .slice(0, 5);
          setTodos(pendingReservations);
        } else {
          setTodos([]);
        }
      } else {
        setTodos([]);
      }
    } catch (error) {
      console.error('해야할 일 로드 오류:', error);
      setTodos([]);
    }
  };

  const fetchLessonNotes = async () => {
    try {
      const response = await fetch('/api/admin/lesson-notes', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.notes) {
          // 최근 레슨노트 5개만 가져오기
          setLessonNotes(data.notes.slice(0, 5));
        } else {
          setLessonNotes([]);
        }
      } else {
        setLessonNotes([]);
      }
    } catch (error) {
      console.error('레슨노트 로드 오류:', error);
      setLessonNotes([]);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/admin/payments', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.payments) {
          // 최근 결제정보 5개만 가져오기
          setPayments(data.payments.slice(0, 5));
        } else {
          setPayments([]);
        }
      } else {
        setPayments([]);
      }
    } catch (error) {
      console.error('결제정보 로드 오류:', error);
      setPayments([]);
    }
  };

  const getMemoTypeColor = (type: string) => {
    switch (type) {
      case "class":
        return "bg-sky-100 text-sky-800 border-sky-300";
      case "staff":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "schedule":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "admin":
        return "bg-green-100 text-green-800 border-green-300";
      case "personal":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getMemoTypeLabel = (type: string) => {
    switch (type) {
      case "class":
        return "수업관련";
      case "staff":
        return "직원 관련";
      case "schedule":
        return "일정관련";
      case "admin":
        return "관리자 업무";
      case "personal":
        return "개인메모";
      default:
        return type;
    }
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    try {
      const time = new Date(timeStr);
      if (isNaN(time.getTime())) {
        // 문자열 형식인 경우 (HH:MM)
        return timeStr;
      }
      return time.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return timeStr;
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: "students",
      title: "학생 관리",
      description: "학생 등록, 정보 수정, 출석 관리",
      href: "/admin/students",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      id: "teachers",
      title: "강사 관리",
      description: "강사 등록, 스케줄 관리, 급여 관리",
      href: "/admin/teachers",
      icon: GraduationCap,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      id: "schedule",
      title: "수업 일정",
      description: "수업 스케줄 관리 및 예약 시스템",
      href: "/admin/schedule",
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      id: "finance",
      title: "재정 관리",
      description: "수강료 관리, 결제 내역, 수익 분석",
      href: "/admin/finance",
      icon: DollarSign,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      id: "student-notes",
      title: "학생 노트 관리",
      description: "학생 수업 노트 및 평가 관리",
      href: "/admin/student-notes",
      icon: FileText,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
    {
      id: "reports",
      title: "리포트",
      description: "학습 진도, 출석률, 성과 분석",
      href: "/admin/reports",
      icon: BarChart3,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      id: "settings",
      title: "시스템 설정",
      description: "시스템 설정, 권한 관리, 백업",
      href: "/admin/settings",
      icon: Settings,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "info":
        return <Eye className="w-4 h-4 text-blue-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-100";
      case "warning":
        return "text-yellow-600 bg-yellow-100";
      case "error":
        return "text-red-600 bg-red-100";
      case "info":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR").format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("ko-KR").format(num);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>관리자 대시보드를 로드하는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
          <p className="text-lg text-gray-600">
            학원 운영 현황을 한눈에 확인하세요
          </p>
        </div>

        {/* 1. 오늘의 수업 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              오늘의 수업
            </h2>
            <Link
              href="/admin/reservations"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
            >
              전체 보기
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {todayClasses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              오늘 예정된 수업이 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {todayClasses.map((classItem) => (
                <div
                  key={classItem.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-gray-900">
                          {classItem.startTime} - {classItem.endTime}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          classItem.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          classItem.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {classItem.status === 'COMPLETED' ? '완료' :
                           classItem.status === 'CANCELLED' ? '취소' : '예정'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700">
                        <span className="font-medium">{classItem.studentName}</span>
                        <span className="mx-2">·</span>
                        <span>{classItem.serviceName}</span>
                        {classItem.teacherName && (
                          <>
                            <span className="mx-2">·</span>
                            <span>{classItem.teacherName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. 오늘의 메모 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              오늘의 메모
            </h2>
            <Link
              href="/admin/reservations"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
            >
              전체 보기
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {todayMemos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              오늘 등록된 메모가 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {todayMemos.map((memo) => (
                <div
                  key={memo.id}
                  className={`border rounded-lg p-4 cursor-pointer hover:opacity-80 transition-colors ${getMemoTypeColor(memo.memoType)}`}
                  onClick={() => {
                    setSelectedMemo(memo);
                    setShowMemoModal(true);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm font-semibold">
                          {formatTime(memo.time)} - {getMemoTypeLabel(memo.memoType)}
                        </span>
                        <span className="text-xs opacity-75">
                          {memo.authorName}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 line-clamp-2">
                        {memo.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. 해야할 일 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              해야할 일
            </h2>
            <Link
              href="/admin/reservations"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
            >
              전체 보기
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {todos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              완료해야 할 작업이 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-blue-600 rounded"></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {todo.studentName || '알 수 없음'} - 예약 확인 필요
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {todo.date} {todo.time}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                      대기 중
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. 레슨노트 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              레슨노트
            </h2>
            <Link
              href="/admin/lesson-notes"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
            >
              전체 보기
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {lessonNotes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              최근 레슨노트가 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {lessonNotes.map((note) => (
                <div
                  key={note.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/admin/lesson-notes/${note.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <BookOpen className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-semibold text-gray-900">
                          {note.studentName || '알 수 없음'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {note.date || note.createdAt}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 line-clamp-2">
                        {note.content || note.notes || '내용 없음'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 5. 결제정보 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              결제정보
            </h2>
            <Link
              href="/admin/payments"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
            >
              전체 보기
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              최근 결제 정보가 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CreditCard className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-semibold text-gray-900">
                          {payment.studentName || payment.student?.name || '알 수 없음'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {payment.date || payment.createdAt}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700">
                        <span className="font-medium">{formatCurrency(payment.amount || payment.price || 0)}원</span>
                        <span className={`ml-2 text-xs px-2 py-1 rounded ${
                          payment.status === 'PAID' || payment.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                          payment.status === 'PENDING' || payment.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {payment.status === 'PAID' || payment.paymentStatus === 'PAID' ? '결제완료' :
                           payment.status === 'PENDING' || payment.paymentStatus === 'PENDING' ? '대기중' : '미결제'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 최근 활동 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">최근 활동</h2>
            <Link
              href="/admin/activities"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
            >
              전체 보기
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                최근 활동이 없습니다.
              </div>
            ) : (
              recentActivities.map((activity) => {
                const IconComponent = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div
                      className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {activity.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {activity.timestamp}
                      </p>
                    </div>
                    {getStatusIcon(activity.status)}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 역할별 페이지 접근 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            역할별 페이지 접근
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/student/home" className="group">
              <div className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <GraduationCap className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">학생 페이지</h3>
                </div>
                <p className="text-sm text-gray-600">학생용 대시보드 및 기능</p>
              </div>
            </Link>

            <Link href="/teacher/home" className="group">
              <div className="p-6 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <User className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">선생님 페이지</h3>
                </div>
                <p className="text-sm text-gray-600">
                  선생님용 대시보드 및 기능
                </p>
              </div>
            </Link>

            <Link href="/staff/home" className="group">
              <div className="p-6 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Building className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">직원 페이지</h3>
                </div>
                <p className="text-sm text-gray-600">직원용 대시보드 및 기능</p>
              </div>
            </Link>

            <Link href="/parent/home" className="group">
              <div className="p-6 border border-gray-200 rounded-lg hover:border-orange-300 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">학부모 페이지</h3>
                </div>
                <p className="text-sm text-gray-600">
                  학부모용 대시보드 및 기능
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* 주요 기능 (기존 빠른 액션) */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            주요 기능
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <Link
                  key={action.id}
                  href={action.href}
                  className={`${action.bgColor} p-4 rounded-lg hover:shadow-md transition-all duration-200 group`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`${action.color} p-2 rounded-lg bg-white`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 group-hover:text-gray-700">
                        {action.title}
            </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 최근 교실 현황 - 통계 카드들을 하나의 상자에 묶어서 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            최근 교실 현황
          </h2>

          {/* 주요 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Link href="/admin/students" className="block">
              <div className="bg-blue-50 rounded-lg p-6 hover:bg-blue-100 transition-all duration-200 cursor-pointer group">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">총 학생 수</p>
                    <p className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {formatNumber(stats.totalStudents)}명
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/admin/teachers" className="block">
              <div className="bg-green-50 rounded-lg p-6 hover:bg-green-100 transition-all duration-200 cursor-pointer group">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <GraduationCap className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">총 강사 수</p>
                    <p className="text-2xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                      {formatNumber(stats.totalTeachers)}명
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/admin/finance" className="block">
              <div className="bg-yellow-50 rounded-lg p-6 hover:bg-yellow-100 transition-all duration-200 cursor-pointer group">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">총 수익</p>
                    <p className="text-2xl font-bold text-gray-900 group-hover:text-yellow-600 transition-colors">
                      {formatCurrency(stats.totalRevenue)}원
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/admin/schedule" className="block">
              <div className="bg-purple-50 rounded-lg p-6 hover:bg-purple-100 transition-all duration-200 cursor-pointer group">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <BookOpen className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">진행 중 수업</p>
                    <p className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {stats.activeLessons}개
                    </p>
                  </div>
                </div>
            </div>
            </Link>
          </div>

          {/* 추가 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Link href="/admin/reports" className="block">
              <div className="bg-green-50 rounded-lg p-6 hover:bg-green-100 transition-all duration-200 cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">월 성장률</p>
                    <p className="text-2xl font-bold text-green-600 group-hover:text-green-700 transition-colors">
                      +{stats.monthlyGrowth}%
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600 group-hover:text-green-700 transition-colors" />
                </div>
              </div>
            </Link>

            <Link href="/admin/students" className="block">
              <div className="bg-blue-50 rounded-lg p-6 hover:bg-blue-100 transition-all duration-200 cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">평균 출석률</p>
                    <p className="text-2xl font-bold text-blue-600 group-hover:text-blue-700 transition-colors">
                      {stats.attendanceRate}%
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-blue-600 group-hover:text-blue-700 transition-colors" />
                </div>
              </div>
            </Link>

            <Link href="/admin/reviews" className="block">
              <div className="bg-orange-50 rounded-lg p-6 hover:bg-orange-100 transition-all duration-200 cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">대기 리뷰</p>
                    <p className="text-2xl font-bold text-orange-600 group-hover:text-orange-700 transition-colors">
                      {stats.pendingReviews}개
                    </p>
                  </div>
                  <Star className="w-8 h-8 text-orange-600 group-hover:text-orange-700 transition-colors" />
                </div>
              </div>
            </Link>

            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">시스템 상태</p>
                  <p
                    className={`text-2xl font-bold ${stats.systemHealth === "good" ? "text-green-600" : stats.systemHealth === "warning" ? "text-yellow-600" : "text-red-600"}`}
                  >
                    {stats.systemHealth === "good"
                      ? "정상"
                      : stats.systemHealth === "warning"
                        ? "주의"
                        : "오류"}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-gray-600" />
              </div>
            </div>
            </div>
          </div>

        {/* 시스템 상태 상세 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            시스템 상태
            </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <span className="text-sm text-gray-600">전체 시스템</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(stats.systemHealth)}`}
              >
                {stats.systemHealth === "good"
                  ? "정상"
                  : stats.systemHealth === "warning"
                    ? "주의"
                    : "오류"}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <span className="text-sm text-gray-600">태깅 시스템</span>
              <span className="px-2 py-1 rounded-full text-xs font-medium text-green-600 bg-green-100">
                정상
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <span className="text-sm text-gray-600">결제 시스템</span>
              <span className="px-2 py-1 rounded-full text-xs font-medium text-green-600 bg-green-100">
                정상
              </span>
          </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <span className="text-sm text-gray-600">데이터베이스</span>
              <span className="px-2 py-1 rounded-full text-xs font-medium text-green-600 bg-green-100">
                정상
              </span>
            </div>
          </div>
            </div>
          </div>

      {/* 메모 상세 모달 */}
      {showMemoModal && selectedMemo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowMemoModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className={`w-6 h-6 ${getMemoTypeColor(selectedMemo.memoType).split(' ')[1]}`} />
                  <h2 className="text-xl font-bold text-gray-900">메모 상세</h2>
                </div>
              <button
                  onClick={() => setShowMemoModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
              </button>
            </div>
          </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
                  <div className="p-2 bg-gray-50 rounded border">
                    {selectedMemo.date ? new Date(selectedMemo.date).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'long'
                    }) : '없음'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">시간</label>
                  <div className="p-2 bg-gray-50 rounded border">
                    {formatTime(selectedMemo.time)}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">메모 유형</label>
                <div className={`p-2 rounded border inline-block ${getMemoTypeColor(selectedMemo.memoType)}`}>
                  {getMemoTypeLabel(selectedMemo.memoType)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">작성자</label>
                <div className="p-2 bg-gray-50 rounded border">
                  {selectedMemo.authorName}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">공개 여부</label>
                <div className="p-2 bg-gray-50 rounded border">
                  {selectedMemo.isPublic ? "공개" : "비공개"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
                <div className="p-4 bg-gray-50 rounded border min-h-[150px] whitespace-pre-wrap">
                  {selectedMemo.content}
                </div>
              </div>
              {selectedMemo.reservationId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">관련 예약</label>
              <button
                    onClick={() => {
                      setShowMemoModal(false);
                      router.push(`/admin/reservations/${selectedMemo.reservationId}`);
                    }}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    예약 상세 보기
              </button>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowMemoModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

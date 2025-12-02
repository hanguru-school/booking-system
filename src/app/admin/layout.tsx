'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bell,
  Home,
  Users,
  Calendar,
  MessageSquare,
  Settings,
  Database,
  LogOut,
  Menu,
  X,
  CheckCircle,
  AlertTriangle,
  Clock,
  UserPlus,
  FileText,
  Mail,
  GraduationCap,
  DollarSign,
  BarChart3,
  Star,
  CreditCard,
  BookOpen,
  Tag,
  Shield,
  TrendingUp,
  Activity,
  ChevronDown,
  ChevronRight,
  Plus,
  Edit,
  Receipt,
  Wallet,
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'NEW_ENROLLMENT' | 'NEW_RESERVATION' | 'NEW_INQUIRY' | 'NEW_TRIAL_LESSON' | 'SYSTEM';
  title: string;
  message: string;
  time: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  data?: any;
}

interface NavigationItem {
  name: string;
  href?: string;
  icon: any;
  children?: NavigationItem[];
}

const navigation: NavigationItem[] = [
  {
    name: '대시보드',
    href: '/admin/dashboard',
    icon: Home,
  },
  {
    name: '예약관리',
    icon: Calendar,
    children: [
      {
        name: '예약하기',
        href: '/admin/reservations/new',
        icon: Plus,
      },
      {
        name: '예약관리',
        href: '/admin/reservations',
        icon: Calendar,
      },
      {
        name: '예약설정',
        href: '/admin/reservations/settings',
        icon: Settings,
      },
    ],
  },
  {
    name: '수업관리',
    icon: BookOpen,
    children: [
      {
        name: '수업관리',
        href: '/admin/lessons',
        icon: BookOpen,
      },
      {
        name: '수업 추가',
        href: '/admin/lessons/new',
        icon: Plus,
      },
      {
        name: '수업 시간 관리',
        href: '/admin/settings/durations',
        icon: Clock,
      },
    ],
  },
  {
    name: '학생관리',
    icon: Users,
    children: [
      {
        name: '학생 정보',
        href: '/admin/students',
        icon: Users,
      },
      {
        name: '결제 정보',
        href: '/admin/students/payments',
        icon: CreditCard,
      },
      {
        name: '수업 정보',
        href: '/admin/students/lessons',
        icon: BookOpen,
      },
      {
        name: '레벨 정보',
        href: '/admin/students/levels',
        icon: TrendingUp,
      },
    ],
  },
  {
    name: '선생님관리',
    icon: GraduationCap,
    children: [
      {
        name: '기본 정보',
        href: '/admin/teachers',
        icon: GraduationCap,
      },
      {
        name: '업무 시간',
        href: '/admin/teachers/schedule',
        icon: Clock,
      },
    ],
  },
  {
    name: '결제관리',
    icon: DollarSign,
    children: [
      {
        name: '학생결제관리',
        href: '/admin/payments',
        icon: CreditCard,
      },
      {
        name: '선생님 및 직원 급여',
        href: '/admin/payments/salary',
        icon: Receipt,
      },
      {
        name: '교실 지출입 관리',
        href: '/admin/payments/expenses',
        icon: Wallet,
      },
      {
        name: '부기 정산',
        href: '/admin/payments/bookkeeping',
        icon: FileText,
      },
      {
        name: '연말 정산',
        href: '/admin/payments/year-end',
        icon: Calendar,
      },
    ],
  },
  {
    name: '메시지관리',
    icon: MessageSquare,
    children: [
      {
        name: '메시지관리',
        href: '/admin/messages',
        icon: MessageSquare,
      },
      {
        name: '리뷰관리',
        href: '/admin/review-management',
        icon: Star,
      },
      {
        name: '푸시알림관리',
        href: '/admin/push-notification-settings',
        icon: Bell,
      },
    ],
  },
  {
    name: '데이터관리',
    icon: Database,
    children: [
      {
        name: '데이터관리',
        href: '/admin/data-management',
        icon: Database,
      },
      {
        name: '통계관리',
        href: '/admin/statistics',
        icon: BarChart3,
      },
      {
        name: '분석관리',
        href: '/admin/analytics',
        icon: TrendingUp,
      },
    ],
  },
  {
    name: '설정',
    icon: Settings,
    children: [
      {
        name: '교실운영시간관리',
        href: '/admin/settings/operating-hours',
        icon: Clock,
      },
      {
        name: '태깅관리',
        href: '/admin/tagging-management',
        icon: Tag,
      },
      {
        name: '관리자 설정',
        href: '/admin/admin-management',
        icon: Shield,
      },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const pathname = usePathname();
  const router = useRouter();
  const notificationRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const toggleMenu = (menuName: string) => {
    setExpandedMenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(menuName)) {
        newSet.delete(menuName);
      } else {
        // 다른 메뉴는 닫기
        newSet.clear();
        newSet.add(menuName);
      }
      return newSet;
    });
  };

  // 알림 가져오기 (에러 처리 강화)
  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/admin/notifications', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        // 타임아웃 설정 (10초)
        signal: AbortSignal.timeout(10000),
      }).catch((fetchError) => {
        // 네트워크 오류 처리 (조용히 처리하여 콘솔 오류 방지)
        if (fetchError.name !== 'AbortError') {
          console.warn('알림 API 호출 실패:', fetchError.message || '네트워크 오류');
        }
        return null;
      });

      if (!response) {
        // 네트워크 오류인 경우 빈 배열로 설정 (조용히 처리)
        setNotifications([]);
        setLoading(false);
        return;
      }

      if (response.ok) {
        try {
          const data = await response.json();
          if (data.success) {
            setNotifications(data.notifications || []);
          } else {
            // API가 실패 응답을 반환한 경우 (조용히 처리)
            setNotifications([]);
          }
        } catch (jsonError) {
          // JSON 파싱 오류 (조용히 처리)
          setNotifications([]);
        }
      } else {
        // HTTP 오류 응답 (조용히 처리)
        setNotifications([]);
      }
    } catch (error) {
      // 예상치 못한 오류 (조용히 처리)
      // AbortError는 타임아웃이므로 조용히 처리
      if (error instanceof Error && error.name !== 'AbortError') {
        console.warn('알림 가져오기 오류:', error.message);
      }
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // 알림 읽음 처리
  const markAsRead = async (id: string) => {
    try {
      // 즉시 UI 업데이트 (낙관적 업데이트)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );

      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ read: true }),
      });
      
      if (!response.ok) {
        // 실패 시 원래 상태로 복구
        fetchNotifications();
      }
    } catch (error) {
      console.error('알림 읽음 처리 오류:', error);
      // 오류 시 알림 목록 다시 가져오기
      fetchNotifications();
    }
  };

  // 모든 알림 읽음 처리
  const markAllAsRead = async () => {
    try {
      // 즉시 UI 업데이트 (낙관적 업데이트)
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

      const response = await fetch('/api/admin/notifications/read-all', {
        method: 'PUT',
        credentials: 'include',
      });
      
      if (!response.ok) {
        // 실패 시 원래 상태로 복구
        fetchNotifications();
      }
    } catch (error) {
      console.error('모든 알림 읽음 처리 오류:', error);
      // 오류 시 알림 목록 다시 가져오기
      fetchNotifications();
    }
  };

  // 시간 포맷팅
  const formatTime = (date: string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffMs = now.getTime() - notificationDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return notificationDate.toLocaleDateString('ko-KR');
  };

  // 알림 타입별 아이콘
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'NEW_ENROLLMENT':
        return <UserPlus className="w-4 h-4 text-blue-600" />;
      case 'NEW_RESERVATION':
        return <Calendar className="w-4 h-4 text-green-600" />;
      case 'NEW_INQUIRY':
        return <Mail className="w-4 h-4 text-yellow-600" />;
      case 'NEW_TRIAL_LESSON':
        return <FileText className="w-4 h-4 text-purple-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  // 알림 클릭 처리
  const handleNotificationClick = async (notification: Notification) => {
    // 읽음 처리
    await markAsRead(notification.id);
    
    // 알림 타입에 따라 적절한 페이지로 이동
    if (notification.data) {
      switch (notification.type) {
        case 'NEW_ENROLLMENT':
          router.push(`/admin/data-management?tab=students&studentId=${notification.data.studentId}`);
          break;
        case 'NEW_RESERVATION':
          router.push(`/admin/data-management?tab=reservations&reservationId=${notification.data.reservationId}`);
          break;
        case 'NEW_INQUIRY':
          router.push(`/admin/data-management?tab=inquiries&inquiryId=${notification.data.inquiryId}`);
          break;
        case 'NEW_TRIAL_LESSON':
          router.push(`/admin/data-management?tab=trial-lessons&trialId=${notification.data.trialId}`);
          break;
      }
    }
    setNotificationOpen(false);
  };

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setNotificationOpen(false);
      }
    };

    if (notificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationOpen]);

  // 초기 알림 로드 및 폴링 (에러 처리 강화)
  useEffect(() => {
    // 초기 로드는 약간의 딜레이 후 실행 (서버 준비 시간 확보)
    const initialTimeout = setTimeout(() => {
      fetchNotifications();
    }, 1000);
    
    // 30초마다 알림 업데이트
    pollIntervalRef.current = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => {
      clearTimeout(initialTimeout);
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // 사이드바 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [sidebarOpen]);


  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = async () => {
    try {
      document.cookie = 'user-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      localStorage.removeItem('authToken');
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('로그아웃 오류:', error);
      window.location.href = '/auth/login';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden relative">
      {/* 모바일 사이드바 오버레이 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[260px] max-w-[80vw] sm:w-[280px] lg:w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        aria-label="사이드바 메뉴"
      >
        {/* 모바일에서만 닫기 버튼 표시 */}
        <div className="lg:hidden flex items-center justify-between h-14 px-3 sm:px-4 border-b border-gray-200 flex-shrink-0 bg-white sticky top-0 z-10">
          <h2 className="text-base font-semibold text-gray-900">메뉴</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="메뉴 닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 스크롤 가능한 메뉴 영역 */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden mt-2 sm:mt-4 px-2 sm:px-3 pb-20">
          <div className="space-y-0.5 sm:space-y-1">
            {navigation.map((item, index) => {
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedMenus.has(item.name);
              const isActive = pathname === item.href || (hasChildren && item.children?.some(child => pathname === child.href));

              if (hasChildren) {
                return (
                  <div key={`${item.name}-${index}`}>
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={`w-full flex items-center justify-between px-2 sm:px-3 py-2.5 sm:py-3 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <item.icon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="ml-2 sm:ml-4 mt-1 space-y-0.5 sm:space-y-1">
                        {item.children?.map((child) => {
                          const isChildActive = pathname === child.href;
                          return (
                            <Link
                              key={child.name}
                              href={child.href || '#'}
                              onClick={() => setSidebarOpen(false)}
                              className={`flex items-center px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                                isChildActive
                                  ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                              }`}
                            >
                              <child.icon className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 flex-shrink-0" />
                              <span className="truncate">{child.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={`${item.name}-${index}`}
                  href={item.href || '#'}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-2 sm:px-3 py-2.5 sm:py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* 로그아웃 버튼 - 고정 위치 */}
        <div className="border-t border-gray-200 bg-white px-2 sm:px-3 py-3 sm:py-4 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-2 sm:px-3 py-2.5 sm:py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" />
            <span>로그아웃</span>
          </button>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="w-full lg:pl-64 relative z-10 min-h-screen bg-gray-50">
        {/* 상단 헤더 */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
          <div className="flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-4 ml-auto">
              {/* 알림 아이콘 */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className="p-2 text-gray-400 hover:text-gray-600 relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* 알림 드롭다운 */}
                {notificationOpen && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900">알림</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            모두 읽음으로 표시
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {loading ? (
                        <div className="p-4 text-center text-gray-500">로딩 중...</div>
                      ) : notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">알림이 없습니다</div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {getNotificationIcon(notification.type)}
                                  <h4 className="text-sm font-medium text-gray-900">
                                    {notification.title}
                                  </h4>
                                  {notification.priority === 'high' && (
                                    <span className="px-1.5 py-0.5 bg-red-100 text-red-800 text-xs rounded">
                                      긴급
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">{notification.message}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {formatTime(notification.time)}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full ml-2"></div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* 페이지 콘텐츠 */}
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}

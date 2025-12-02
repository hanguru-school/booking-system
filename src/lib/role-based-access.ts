/**
 * 다중 역할 기반 시스템 분기 및 권한 관리
 * 마스터, 선생님, 사무직원, 학생 역할별 권한 제어
 */

export interface UserRole {
  id: string;
  name: string;
  type: "master" | "admin" | "teacher" | "staff" | "student";
  permissions: RolePermissions;
  createdAt: Date;
  updatedAt: Date;
}

export interface RolePermissions {
  // 페이지 접근 권한
  pages: {
    [pagePath: string]: {
      read: boolean;
      write: boolean;
      delete: boolean;
      admin: boolean;
    };
  };

  // 기능 권한
  functions: {
    [functionName: string]: boolean;
  };

  // 데이터 접근 권한
  dataAccess: {
    own: boolean;
    students: boolean;
    teachers: boolean;
    staff: boolean;
    system: boolean;
    curriculum: boolean;
    analytics: boolean;
    automation: boolean;
  };

  // 특별 권한
  specialPermissions: {
    canCreateUsers: boolean;
    canDeleteUsers: boolean;
    canManageRoles: boolean;
    canViewSystemLogs: boolean;
    canManageDevices: boolean;
    canExportData: boolean;
    canManageSettings: boolean;
  };
}

export interface PageAccess {
  path: string;
  name: string;
  description: string;
  requiredPermissions: string[];
  roles: string[];
}

export interface FunctionPermission {
  name: string;
  description: string;
  category: string;
  requiredPermissions: string[];
  roles: string[];
}

class RoleBasedAccessControl {
  private roles: Map<string, UserRole> = new Map();
  private pages: PageAccess[] = [];
  private functions: FunctionPermission[] = [];

  constructor() {
    this.initializeRoles();
    this.initializePages();
    this.initializeFunctions();
  }

  /**
   * 역할 초기화
   */
  private initializeRoles() {
    // 마스터 역할
    const masterRole: UserRole = {
      id: "master",
      name: "마스터",
      type: "master",
      permissions: {
        pages: {
          "*": { read: true, write: true, delete: true, admin: true },
        },
        functions: {
          "*": true,
        },
        dataAccess: {
          own: true,
          students: true,
          teachers: true,
          staff: true,
          system: true,
          curriculum: true,
          analytics: true,
          automation: true,
        },
        specialPermissions: {
          canCreateUsers: true,
          canDeleteUsers: true,
          canManageRoles: true,
          canViewSystemLogs: true,
          canManageDevices: true,
          canExportData: true,
          canManageSettings: true,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 관리자 역할 (마스터와 동일한 권한)
    const adminRole: UserRole = {
      id: "admin",
      name: "관리자",
      type: "admin",
      permissions: {
        pages: {
          "*": { read: true, write: true, delete: true, admin: true },
        },
        functions: {
          "*": true,
        },
        dataAccess: {
          own: true,
          students: true,
          teachers: true,
          staff: true,
          system: true,
          curriculum: true,
          analytics: true,
          automation: true,
        },
        specialPermissions: {
          canCreateUsers: true,
          canDeleteUsers: true,
          canManageRoles: true,
          canViewSystemLogs: true,
          canManageDevices: true,
          canExportData: true,
          canManageSettings: true,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 선생님 역할
    const teacherRole: UserRole = {
      id: "teacher",
      name: "선생님",
      type: "teacher",
      permissions: {
        pages: {
          "/teacher/home": {
            read: true,
            write: false,
            delete: false,
            admin: false,
          },
          "/teacher/schedule": {
            read: true,
            write: true,
            delete: false,
            admin: false,
          },
          "/teacher/lesson-notes": {
            read: true,
            write: true,
            delete: true,
            admin: false,
          },
          "/teacher/curriculum": {
            read: true,
            write: true,
            delete: false,
            admin: false,
          },
          "/student/notes": {
            read: true,
            write: false,
            delete: false,
            admin: false,
          },
          "/student/homework": {
            read: true,
            write: false,
            delete: false,
            admin: false,
          },
        },
        functions: {
          view_own_schedule: true,
          view_student_notes: true,
          view_student_curriculum: true,
          update_lesson_notes: true,
          manage_curriculum_progress: true,
          view_student_homework: true,
        },
        dataAccess: {
          own: true,
          students: true,
          teachers: false,
          staff: false,
          system: false,
          curriculum: true,
          analytics: false,
          automation: false,
        },
        specialPermissions: {
          canCreateUsers: false,
          canDeleteUsers: false,
          canManageRoles: false,
          canViewSystemLogs: false,
          canManageDevices: false,
          canExportData: false,
          canManageSettings: false,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 사무직원 역할
    const staffRole: UserRole = {
      id: "staff",
      name: "사무직원",
      type: "staff",
      permissions: {
        pages: {
          "/staff/home": {
            read: true,
            write: false,
            delete: false,
            admin: false,
          },
          "/staff/work-log": {
            read: true,
            write: true,
            delete: true,
            admin: false,
          },
          "/staff/reports": {
            read: true,
            write: false,
            delete: false,
            admin: false,
          },
        },
        functions: {
          view_own_work_log: true,
          create_work_log: true,
          update_work_log: true,
          view_own_reports: true,
          export_own_reports: true,
        },
        dataAccess: {
          own: true,
          students: false,
          teachers: false,
          staff: false,
          system: false,
          curriculum: false,
          analytics: false,
          automation: false,
        },
        specialPermissions: {
          canCreateUsers: false,
          canDeleteUsers: false,
          canManageRoles: false,
          canViewSystemLogs: false,
          canManageDevices: false,
          canExportData: false,
          canManageSettings: false,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 학생 역할
    const studentRole: UserRole = {
      id: "student",
      name: "학생",
      type: "student",
      permissions: {
        pages: {
          "/student/home": {
            read: true,
            write: false,
            delete: false,
            admin: false,
          },
          "/student/reservations": {
            read: true,
            write: true,
            delete: true,
            admin: false,
          },
          "/student/notes": {
            read: true,
            write: false,
            delete: false,
            admin: false,
          },
          "/student/homework": {
            read: true,
            write: true,
            delete: false,
            admin: false,
          },
          "/student/mypage": {
            read: true,
            write: true,
            delete: false,
            admin: false,
          },
          "/student/learning-stats": {
            read: true,
            write: false,
            delete: false,
            admin: false,
          },
        },
        functions: {
          view_own_reservations: true,
          create_reservation: true,
          cancel_reservation: true,
          view_own_notes: true,
          view_own_homework: true,
          submit_homework: true,
          update_own_profile: true,
          view_own_stats: true,
        },
        dataAccess: {
          own: true,
          students: false,
          teachers: false,
          staff: false,
          system: false,
          curriculum: false,
          analytics: false,
          automation: false,
        },
        specialPermissions: {
          canCreateUsers: false,
          canDeleteUsers: false,
          canManageRoles: false,
          canViewSystemLogs: false,
          canManageDevices: false,
          canExportData: false,
          canManageSettings: false,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.roles.set("master", masterRole);
    this.roles.set("admin", adminRole);
    this.roles.set("teacher", teacherRole);
    this.roles.set("staff", staffRole);
    this.roles.set("student", studentRole);
  }

  /**
   * 페이지 접근 권한 초기화
   */
  private initializePages() {
    this.pages = [
      // 관리자 페이지
      {
        path: "/admin/home",
        name: "관리자 홈",
        description: "관리자 대시보드",
        requiredPermissions: ["admin_access"],
        roles: ["master"],
      },
      {
        path: "/admin/analytics",
        name: "분석 및 통계",
        description: "시스템 분석 및 통계",
        requiredPermissions: ["analytics_access"],
        roles: ["master"],
      },
      {
        path: "/admin/automation",
        name: "자동화 관리",
        description: "자동화 규칙 및 템플릿 관리",
        requiredPermissions: ["automation_access"],
        roles: ["master"],
      },
      {
        path: "/admin/tagging-management",
        name: "태깅 시스템 관리",
        description: "IC카드 및 스마트폰 태깅 관리",
        requiredPermissions: ["device_management"],
        roles: ["master"],
      },

      // 선생님 페이지
      {
        path: "/teacher/home",
        name: "선생님 홈",
        description: "선생님 대시보드",
        requiredPermissions: ["teacher_access"],
        roles: ["teacher"],
      },
      {
        path: "/teacher/schedule",
        name: "수업 일정",
        description: "수업 일정 관리",
        requiredPermissions: ["schedule_management"],
        roles: ["teacher"],
      },
      {
        path: "/teacher/lesson-notes",
        name: "수업 노트",
        description: "수업 노트 작성 및 관리",
        requiredPermissions: ["lesson_notes_management"],
        roles: ["teacher"],
      },
      {
        path: "/teacher/curriculum",
        name: "커리큘럼 관리",
        description: "학생별 커리큘럼 진행 관리",
        requiredPermissions: ["curriculum_management"],
        roles: ["teacher"],
      },

      // 사무직원 페이지
      {
        path: "/staff/home",
        name: "사무직원 홈",
        description: "사무직원 대시보드",
        requiredPermissions: ["staff_access"],
        roles: ["staff"],
      },
      {
        path: "/staff/work-log",
        name: "업무 기록",
        description: "업무 시작/종료 및 내용 기록",
        requiredPermissions: ["work_log_management"],
        roles: ["staff"],
      },
      {
        path: "/staff/reports",
        name: "업무 리포트",
        description: "업무 통계 및 리포트",
        requiredPermissions: ["report_access"],
        roles: ["staff"],
      },

      // 학생 페이지
      {
        path: "/student/home",
        name: "학생 홈",
        description: "학생 대시보드",
        requiredPermissions: ["student_access"],
        roles: ["student"],
      },
      {
        path: "/student/reservations",
        name: "예약 관리",
        description: "수업 예약 및 관리",
        requiredPermissions: ["reservation_management"],
        roles: ["student"],
      },
      {
        path: "/student/notes",
        name: "수업 노트",
        description: "수업 노트 열람",
        requiredPermissions: ["notes_access"],
        roles: ["student"],
      },
      {
        path: "/student/homework",
        name: "숙제 관리",
        description: "숙제 확인 및 제출",
        requiredPermissions: ["homework_management"],
        roles: ["student"],
      },
      {
        path: "/student/mypage",
        name: "마이페이지",
        description: "개인 정보 및 설정",
        requiredPermissions: ["profile_management"],
        roles: ["student"],
      },
    ];
  }

  /**
   * 기능 권한 초기화
   */
  private initializeFunctions() {
    this.functions = [
      // 관리자 기능
      {
        name: "system_management",
        description: "시스템 전체 관리",
        category: "admin",
        requiredPermissions: ["system_admin"],
        roles: ["master"],
      },
      {
        name: "user_management",
        description: "사용자 계정 관리",
        category: "admin",
        requiredPermissions: ["user_admin"],
        roles: ["master"],
      },
      {
        name: "analytics_access",
        description: "분석 데이터 접근",
        category: "admin",
        requiredPermissions: ["analytics_access"],
        roles: ["master"],
      },

      // 선생님 기능
      {
        name: "lesson_notes_management",
        description: "수업 노트 관리",
        category: "teacher",
        requiredPermissions: ["lesson_notes_management"],
        roles: ["teacher"],
      },
      {
        name: "curriculum_management",
        description: "커리큘럼 진행 관리",
        category: "teacher",
        requiredPermissions: ["curriculum_management"],
        roles: ["teacher"],
      },
      {
        name: "student_progress_view",
        description: "학생 진행 상황 조회",
        category: "teacher",
        requiredPermissions: ["student_data_access"],
        roles: ["teacher"],
      },

      // 사무직원 기능
      {
        name: "work_log_management",
        description: "업무 기록 관리",
        category: "staff",
        requiredPermissions: ["work_log_management"],
        roles: ["staff"],
      },
      {
        name: "report_generation",
        description: "업무 리포트 생성",
        category: "staff",
        requiredPermissions: ["report_access"],
        roles: ["staff"],
      },

      // 학생 기능
      {
        name: "reservation_management",
        description: "예약 관리",
        category: "student",
        requiredPermissions: ["reservation_management"],
        roles: ["student"],
      },
      {
        name: "homework_submission",
        description: "숙제 제출",
        category: "student",
        requiredPermissions: ["homework_management"],
        roles: ["student"],
      },
      {
        name: "profile_management",
        description: "프로필 관리",
        category: "student",
        requiredPermissions: ["profile_management"],
        roles: ["student"],
      },
    ];
  }

  /**
   * 페이지 접근 권한 확인
   */
  checkPageAccess(
    roleType: string,
    pagePath: string,
    action: "read" | "write" | "delete" | "admin" = "read",
  ): boolean {
    const role = this.roles.get(roleType);
    if (!role) return false;

    // 마스터와 관리자는 모든 페이지에 접근 가능
    if (roleType === "master" || roleType === "admin") return true;

    const pagePermission =
      role.permissions.pages[pagePath] || role.permissions.pages["*"];
    if (!pagePermission) return false;

    return pagePermission[action];
  }

  /**
   * 기능 권한 확인
   */
  checkFunctionPermission(roleType: string, functionName: string): boolean {
    const role = this.roles.get(roleType);
    if (!role) return false;

    // 마스터와 관리자는 모든 기능 사용 가능
    if (roleType === "master" || roleType === "admin") return true;

    return (
      role.permissions.functions[functionName] ||
      role.permissions.functions["*"] ||
      false
    );
  }

  /**
   * 데이터 접근 권한 확인
   */
  checkDataAccess(
    roleType: string,
    dataType: keyof RolePermissions["dataAccess"],
  ): boolean {
    const role = this.roles.get(roleType);
    if (!role) return false;

    return role.permissions.dataAccess[dataType];
  }

  /**
   * 특별 권한 확인
   */
  checkSpecialPermission(
    roleType: string,
    permissionName: keyof RolePermissions["specialPermissions"],
  ): boolean {
    const role = this.roles.get(roleType);
    if (!role) return false;

    return role.permissions.specialPermissions[permissionName];
  }

  /**
   * 역할별 접근 가능한 페이지 목록 조회
   */
  getAccessiblePages(roleType: string): PageAccess[] {
    return this.pages.filter(
      (page) =>
        page.roles.includes(roleType) ||
        this.checkPageAccess(roleType, page.path),
    );
  }

  /**
   * 역할별 사용 가능한 기능 목록 조회
   */
  getAccessibleFunctions(roleType: string): FunctionPermission[] {
    return this.functions.filter(
      (func) =>
        func.roles.includes(roleType) ||
        this.checkFunctionPermission(roleType, func.name),
    );
  }

  /**
   * 역할 정보 조회
   */
  getRole(roleType: string): UserRole | undefined {
    return this.roles.get(roleType);
  }

  /**
   * 모든 역할 목록 조회
   */
  getAllRoles(): UserRole[] {
    return Array.from(this.roles.values());
  }

  /**
   * 역할 생성
   */
  createRole(role: Omit<UserRole, "id" | "createdAt" | "updatedAt">): boolean {
    if (this.roles.has(role.name)) return false;

    const newRole: UserRole = {
      ...role,
      id: role.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.roles.set(role.name, newRole);
    return true;
  }

  /**
   * 역할 업데이트
   */
  updateRole(roleType: string, updates: Partial<RolePermissions>): boolean {
    const role = this.roles.get(roleType);
    if (!role) return false;

    role.permissions = { ...role.permissions, ...updates };
    role.updatedAt = new Date();
    return true;
  }

  /**
   * 역할 삭제
   */
  deleteRole(roleType: string): boolean {
    if (["master", "teacher", "staff", "student"].includes(roleType)) {
      return false; // 기본 역할은 삭제 불가
    }

    return this.roles.delete(roleType);
  }

  /**
   * 권한 검증 미들웨어 생성
   */
  createAuthMiddleware() {
    return (
      req: Record<string, unknown>,
      res: Record<string, unknown>,
      next: Record<string, unknown>,
    ) => {
      const user = req.user as { role?: string } | undefined;
      const userRole = user?.role || "student";
      const pagePath = req.path as string;

      if (!this.checkPageAccess(userRole, pagePath)) {
        const response = res as { status: (code: number) => { json: (data: unknown) => void } };
        return response.status(403).json({ error: "접근 권한이 없습니다." });
      }

      if (typeof next === 'function') {
        (next as () => void)();
      }
    };
  }

  /**
   * 권한 검증 훅 생성 (React용)
   */
  createAuthHook() {
    return (userRole: string) => {
      return {
        canAccessPage: (
          pagePath: string,
          action: "read" | "write" | "delete" | "admin" = "read",
        ) => this.checkPageAccess(userRole, pagePath, action),
        canUseFunction: (functionName: string) =>
          this.checkFunctionPermission(userRole, functionName),
        canAccessData: (dataType: keyof RolePermissions["dataAccess"]) =>
          this.checkDataAccess(userRole, dataType),
        hasSpecialPermission: (
          permissionName: keyof RolePermissions["specialPermissions"],
        ) => this.checkSpecialPermission(userRole, permissionName),
        getAccessiblePages: () => this.getAccessiblePages(userRole),
        getAccessibleFunctions: () => this.getAccessibleFunctions(userRole),
      };
    };
  }
}

// 싱글톤 인스턴스 생성
export const roleBasedAccess = new RoleBasedAccessControl();

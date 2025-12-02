/**
 * 자동화 시스템
 * 관리자 리마인드, 학생/선생님 자동 메시지, 예약 리마인드 등 자동화 기능
 */

export interface AutomationRule {
  id: string;
  name: string;
  type: "reminder" | "notification" | "report";
  schedule: {
    type: "daily" | "weekly" | "monthly" | "custom";
    time?: string; // HH:MM (custom 타입에서는 선택적)
    dayOfWeek?: number; // 0-6 (일요일-토요일)
    dayOfMonth?: number; // 1-31
    interval?: number; // 분 단위 (custom 타입용)
  };
  conditions: {
    targetType: "student" | "teacher" | "admin";
    filters?: {
      levels?: string[];
      lastClassDays?: number;
      totalHours?: number;
      attendanceRate?: number;
    };
  };
  message: {
    title: string;
    content: string;
    template: string;
  };
  channels: ("line" | "email" | "sms")[];
  enabled: boolean;
  lastExecuted?: Date;
  nextExecution?: Date;
}

export interface AutomationLog {
  id: string;
  ruleId: string;
  timestamp: Date;
  status: "success" | "failed" | "skipped";
  targetCount: number;
  sentCount: number;
  errorCount: number;
  errors?: string[];
  executionTime: number;
}

export interface MessageTemplate {
  id: string;
  name: string;
  type: "reminder" | "notification" | "report";
  title: string;
  content: string;
  variables: string[];
  examples: Record<string, string>;
}

class AutomationSystem {
  private rules: AutomationRule[] = [];
  private logs: AutomationLog[] = [];
  private messageQueue: Record<string, unknown>[] = [];
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeDefaultRules();
    // NOTIFY_ENABLED가 false이면 스케줄러 시작 안 함
    // 환경변수는 문자열이므로 "false" 문자열로 비교
    const notifyEnabled = process.env.NOTIFY_ENABLED?.toLowerCase();
    if (notifyEnabled === "false" || notifyEnabled === "0" || notifyEnabled === "no") {
      console.log("🔕 알림 시스템 비활성화됨 (NOTIFY_ENABLED=false)");
      return; // 스케줄러 시작 안 함
    }
    this.startScheduler();
  }

  /**
   * 기본 자동화 규칙 초기화
   */
  private initializeDefaultRules() {
    this.rules = [
      // 관리자 리마인드 규칙
      {
        id: "admin-monthly-5",
        name: "매월 5일 근태 기록 확인 요청",
        type: "reminder",
        schedule: {
          type: "monthly",
          time: "09:00",
          dayOfMonth: 5,
        },
        conditions: {
          targetType: "admin",
        },
        message: {
          title: "근태 기록 확인 요청",
          content:
            "이번 달 근태 기록을 확인해주세요. 미완료 항목이 {incompleteCount}개 있습니다.",
          template: "admin_attendance_reminder",
        },
        channels: ["line", "email"],
        enabled: true,
      },
      {
        id: "admin-monthly-10",
        name: "매월 10일 직원 확인 시작 알림",
        type: "notification",
        schedule: {
          type: "monthly",
          time: "09:00",
          dayOfMonth: 10,
        },
        conditions: {
          targetType: "admin",
        },
        message: {
          title: "직원 확인 시작",
          content:
            "이번 달 직원 확인이 시작되었습니다. {employeeCount}명의 직원 정보를 확인해주세요.",
          template: "admin_employee_check",
        },
        channels: ["line", "email"],
        enabled: true,
      },
      {
        id: "student-monthly-15",
        name: "매월 15일 수업 시간 부족 학생 알림",
        type: "reminder",
        schedule: {
          type: "monthly",
          time: "10:00",
          dayOfMonth: 15,
        },
        conditions: {
          targetType: "student",
          filters: {
            totalHours: 180, // 180분 미만
          },
        },
        message: {
          title: "추가 예약 안내",
          content:
            "이번 달 수업 시간이 {currentHours}분으로 목표에 미달했습니다. 추가 예약을 권장합니다.",
          template: "student_booking_reminder",
        },
        channels: ["line", "email"],
        enabled: true,
      },
      {
        id: "student-monthly-25",
        name: "매월 25일 다음 달 예약 부족 학생 알림",
        type: "reminder",
        schedule: {
          type: "monthly",
          time: "10:00",
          dayOfMonth: 25,
        },
        conditions: {
          targetType: "student",
          filters: {
            totalHours: 180,
          },
        },
        message: {
          title: "다음 달 예약 안내",
          content:
            "다음 달 예약이 {nextMonthHours}분으로 부족합니다. 미리 예약하시면 좋겠습니다.",
          template: "student_next_month_reminder",
        },
        channels: ["line", "email"],
        enabled: true,
      },
      // 학생/선생님 자동화 메시지
      {
        id: "class-reminder-day-before",
        name: "수업 전날 리마인드",
        type: "reminder",
        schedule: {
          type: "custom",
          interval: 60 * 24, // 24시간마다 체크
        },
        conditions: {
          targetType: "student",
        },
        message: {
          title: "내일 수업 안내",
          content:
            "내일 {time}에 {courseName} 수업이 있습니다. Zoom 링크: {zoomLink}",
          template: "class_reminder",
        },
        channels: ["line", "email"],
        enabled: true,
      },
      {
        id: "attendance-check-10min",
        name: "수업 10분 후 출석 체크",
        type: "notification",
        schedule: {
          type: "custom",
          interval: 10, // 10분마다 체크
        },
        conditions: {
          targetType: "student",
        },
        message: {
          title: "출석 확인 요청",
          content: "수업이 시작되었습니다. 출석 태깅을 해주세요.",
          template: "attendance_check",
        },
        channels: ["line", "email"],
        enabled: true,
      },
      {
        id: "review-reminder-5hours",
        name: "수업 5시간 후 리뷰 유도",
        type: "reminder",
        schedule: {
          type: "custom",
          interval: 60 * 5, // 5시간마다 체크
        },
        conditions: {
          targetType: "student",
        },
        message: {
          title: "수업 리뷰 작성",
          content: "오늘 수업에 대한 리뷰를 작성해주세요. 피드백이 중요합니다.",
          template: "review_reminder",
        },
        channels: ["line", "email"],
        enabled: true,
      },
      {
        id: "dormant-student-7days",
        name: "휴면 학생 7일 후 리마인드",
        type: "reminder",
        schedule: {
          type: "custom",
          interval: 60 * 24 * 7, // 7일마다 체크
        },
        conditions: {
          targetType: "student",
          filters: {
            lastClassDays: 7,
          },
        },
        message: {
          title: "수업 예약 안내",
          content:
            "마지막 수업 후 7일이 지났습니다. 새로운 수업을 예약해보세요.",
          template: "dormant_student_reminder",
        },
        channels: ["line", "email"],
        enabled: true,
      },
      {
        id: "monthly-summary",
        name: "매월 요약 리포트",
        type: "report",
        schedule: {
          type: "monthly",
          time: "09:00",
          dayOfMonth: 1,
        },
        conditions: {
          targetType: "student",
        },
        message: {
          title: "이번 달 학습 요약",
          content:
            "이번 달 총 {totalHours}시간 수업을 완료했습니다. 다음 달 목표: {nextMonthGoal}시간",
          template: "monthly_summary",
        },
        channels: ["line", "email"],
        enabled: true,
      },
    ];
  }

  /**
   * 스케줄러 시작
   */
  private startScheduler() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // 1분마다 규칙 체크
    this.intervalId = setInterval(() => {
      this.checkAndExecuteRules();
    }, 60 * 1000);

    // 초기 실행
    this.checkAndExecuteRules();
  }

  /**
   * 규칙 체크 및 실행
   */
  private async checkAndExecuteRules() {
    if (this.isRunning) return;

    this.isRunning = true;
    const now = new Date();

    try {
      for (const rule of this.rules) {
        if (!rule.enabled) continue;

        if (this.shouldExecuteRule(rule, now)) {
          await this.executeRule(rule, now);
        }
      }
    } catch (error) {
      console.error("Automation rule execution failed:", error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * 규칙 실행 여부 확인
   */
  private shouldExecuteRule(rule: AutomationRule, now: Date): boolean {
    const { schedule } = rule;

    switch (schedule.type) {
      case "daily":
        return schedule.time ? this.isTimeMatch(now, schedule.time) : false;

      case "weekly":
        return schedule.time
          ? this.isTimeMatch(now, schedule.time) &&
              now.getDay() === (schedule.dayOfWeek || 0)
          : false;

      case "monthly":
        return schedule.time
          ? this.isTimeMatch(now, schedule.time) &&
              now.getDate() === (schedule.dayOfMonth || 1)
          : false;

      case "custom":
        if (!rule.lastExecuted) return true;
        const timeDiff = now.getTime() - rule.lastExecuted.getTime();
        return timeDiff >= (schedule.interval || 0) * 60 * 1000;

      default:
        return false;
    }
  }

  /**
   * 시간 매칭 확인
   */
  private isTimeMatch(now: Date, targetTime: string): boolean {
    const [targetHour, targetMinute] = targetTime.split(":").map(Number);
    return now.getHours() === targetHour && now.getMinutes() === targetMinute;
  }

  /**
   * 규칙 실행
   */
  private async executeRule(rule: AutomationRule, executionTime: Date) {
    const startTime = Date.now();
    const log: AutomationLog = {
      id: `log_${Date.now()}_${rule.id}`,
      ruleId: rule.id,
      timestamp: executionTime,
      status: "success",
      targetCount: 0,
      sentCount: 0,
      errorCount: 0,
      errors: [],
      executionTime: 0,
    };

    try {
      // 대상자 식별
      const targets = await this.identifyTargets(rule);
      log.targetCount = targets.length;

      if (targets.length === 0) {
        log.status = "skipped";
        this.logs.push(log);
        return;
      }

      // 메시지 전송
      for (const target of targets) {
        try {
          const message = this.generateMessage(rule, target);
          await this.sendMessage(message, rule.channels, target);
          log.sentCount++;
        } catch (error) {
          log.errorCount++;
          log.errors?.push(`Target ${target.id}: ${error}`);
        }
      }

      // 규칙 상태 업데이트
      rule.lastExecuted = executionTime;
      rule.nextExecution = this.calculateNextExecution(rule, executionTime);

      if (log.errorCount > 0) {
        log.status = log.errorCount === log.targetCount ? "failed" : "success";
      }
    } catch (error) {
      log.status = "failed";
      log.errors?.push(`Rule execution failed: ${error}`);
    } finally {
      log.executionTime = Date.now() - startTime;
      this.logs.push(log);
    }
  }

  /**
   * 대상자 식별
   */
  private async identifyTargets(rule: AutomationRule): Promise<any[]> {
    // 알림 시스템이 비활성화되어 있으면 빈 배열 반환
    const notifyEnabled = process.env.NOTIFY_ENABLED?.toLowerCase();
    const notifyDryRun = process.env.NOTIFY_DRY_RUN?.toLowerCase();
    
    if (notifyEnabled === "false" || notifyEnabled === "0" || notifyEnabled === "no" || 
        notifyDryRun === "true" || notifyDryRun === "1" || notifyDryRun === "yes") {
      console.log("🔕 알림 대상자 조회 건너뜀 (NOTIFY_ENABLED=false 또는 NOTIFY_DRY_RUN=true)");
      return [];
    }

    // 실제 DB에서 대상자 조회
    try {
      const { prisma } = await import("@/lib/prisma");
      const targets: any[] = [];

      if (rule.conditions.targetType === "student") {
        // 학생 조회
        const students = await prisma.student.findMany({
          where: {
            user: {
              role: "STUDENT",
            },
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        });

        for (const student of students) {
          targets.push({
            id: student.id,
            name: student.user.name,
            email: student.user.email,
            lineId: null, // LINE ID는 별도 조회 필요
          });
        }
      } else if (rule.conditions.targetType === "teacher") {
        // 선생님 조회
        const teachers = await prisma.teacher.findMany({
          where: {
            isActive: true,
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        });

        for (const teacher of teachers) {
          targets.push({
            id: teacher.id,
            name: teacher.name,
            email: teacher.user.email,
            lineId: null, // LINE ID는 별도 조회 필요
          });
        }
      } else if (rule.conditions.targetType === "admin") {
        // 관리자 조회
        const admins = await prisma.admin.findMany({
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        });

        for (const admin of admins) {
          targets.push({
            id: admin.id,
            name: admin.user.name,
            email: admin.user.email,
            lineId: null, // LINE ID는 별도 조회 필요
          });
        }
      }

      // 조건에 따른 필터링
      return targets.filter((target) => {
        if (rule.conditions.filters) {
          // 실제 구현에서는 더 복잡한 필터링 로직
          return true;
        }
        return true;
      });
    } catch (error) {
      console.error("Failed to identify targets from database:", error);
      // DB 조회 실패 시 빈 배열 반환 (테스트 데이터 사용 안 함)
      return [];
    }
  }

  /**
   * 메시지 생성
   */
  private generateMessage(
    rule: AutomationRule,
    target: Record<string, unknown>,
  ): Record<string, unknown> {
    const { message } = rule;

    // 템플릿 변수 치환
    let content = message.content;
    
    // 타입 안전한 변수 치환
    const targetName = typeof target.name === 'string' ? target.name : '사용자';
    content = content.replace("{name}", targetName);
    content = content.replace("{currentHours}", "120");
    content = content.replace("{nextMonthHours}", "60");
    content = content.replace("{incompleteCount}", "3");
    content = content.replace("{employeeCount}", "15");
    content = content.replace("{totalHours}", "180");
    content = content.replace("{nextMonthGoal}", "200");
    content = content.replace("{time}", "18:00");
    content = content.replace("{courseName}", "중급 회화");
    content = content.replace("{zoomLink}", "https://zoom.us/j/123456789");

    return {
      title: message.title,
      content: content,
      target: target,
    };
  }

  /**
   * 메시지 전송
   */
  private async sendMessage(
    message: Record<string, unknown>,
    channels: string[],
    target: Record<string, unknown>,
  ): Promise<void> {
    for (const channel of channels) {
      try {
        switch (channel) {
          case "line":
            if (target.lineId && typeof target.lineId === 'string') {
              await this.sendLineMessage(message, target.lineId);
            }
            break;
          case "email":
            if (target.email && typeof target.email === 'string') {
              await this.sendEmailMessage(message, target.email);
            }
            break;
          case "sms":
            if (target.phone && typeof target.phone === 'string') {
              await this.sendSmsMessage(message, target.phone);
            }
            break;
        }
      } catch (error) {
        console.error(`Failed to send ${channel} message:`, error);
        throw error;
      }
    }
  }

  /**
   * LINE 메시지 전송
   */
  private async sendLineMessage(
    message: Record<string, unknown>,
    lineId: string,
  ): Promise<void> {
    // 실제 LINE API 연동 로직
    console.log(`Sending LINE message to ${lineId}:`, message);
    await new Promise((resolve) => setTimeout(resolve, 100)); // 시뮬레이션
  }

  /**
   * 이메일 전송
   */
  private async sendEmailMessage(
    message: Record<string, unknown>,
    email: string,
  ): Promise<void> {
    // 실제 이메일 전송 로직
    console.log(`Sending email to ${email}:`, message);
    await new Promise((resolve) => setTimeout(resolve, 100)); // 시뮬레이션
  }

  /**
   * SMS 전송
   */
  private async sendSmsMessage(
    message: Record<string, unknown>,
    phone: string,
  ): Promise<void> {
    // 실제 SMS 전송 로직
    console.log(`Sending SMS to ${phone}:`, message);
    await new Promise((resolve) => setTimeout(resolve, 100)); // 시뮬레이션
  }

  /**
   * 다음 실행 시간 계산
   */
  private calculateNextExecution(
    rule: AutomationRule,
    currentTime: Date,
  ): Date {
    const { schedule } = rule;
    const next = new Date(currentTime);

    switch (schedule.type) {
      case "daily":
        next.setDate(next.getDate() + 1);
        break;
      case "weekly":
        next.setDate(next.getDate() + 7);
        break;
      case "monthly":
        next.setMonth(next.getMonth() + 1);
        break;
      case "custom":
        next.setMinutes(next.getMinutes() + (schedule.interval || 0));
        break;
    }

    return next;
  }

  /**
   * 규칙 추가
   */
  addRule(rule: AutomationRule): void {
    this.rules.push(rule);
  }

  /**
   * 규칙 수정
   */
  updateRule(ruleId: string, updates: Partial<AutomationRule>): boolean {
    const index = this.rules.findIndex((rule) => rule.id === ruleId);
    if (index === -1) return false;

    this.rules[index] = { ...this.rules[index], ...updates };
    return true;
  }

  /**
   * 규칙 삭제
   */
  deleteRule(ruleId: string): boolean {
    const index = this.rules.findIndex((rule) => rule.id === ruleId);
    if (index === -1) return false;

    this.rules.splice(index, 1);
    return true;
  }

  /**
   * 규칙 목록 조회
   */
  getRules(): AutomationRule[] {
    return [...this.rules];
  }

  /**
   * 로그 조회
   */
  getLogs(limit: number = 100): AutomationLog[] {
    return this.logs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * 시스템 중지
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  /**
   * 시스템 재시작
   */
  restart(): void {
    this.stop();
    this.startScheduler();
  }
}

// 싱글톤 인스턴스
export const automationSystem = new AutomationSystem();

/**
 * 메시지 템플릿 관리
 */
export class MessageTemplateManager {
  private templates: MessageTemplate[] = [
    {
      id: "admin_attendance_reminder",
      name: "관리자 근태 확인 요청",
      type: "reminder",
      title: "근태 기록 확인 요청",
      content:
        "이번 달 근태 기록을 확인해주세요. 미완료 항목이 {incompleteCount}개 있습니다.",
      variables: ["incompleteCount"],
      examples: {
        incompleteCount: "3",
      },
    },
    {
      id: "student_booking_reminder",
      name: "학생 예약 리마인드",
      type: "reminder",
      title: "추가 예약 안내",
      content:
        "이번 달 수업 시간이 {currentHours}분으로 목표에 미달했습니다. 추가 예약을 권장합니다.",
      variables: ["currentHours"],
      examples: {
        currentHours: "120",
      },
    },
    {
      id: "class_reminder",
      name: "수업 전날 리마인드",
      type: "reminder",
      title: "내일 수업 안내",
      content:
        "내일 {time}에 {courseName} 수업이 있습니다. Zoom 링크: {zoomLink}",
      variables: ["time", "courseName", "zoomLink"],
      examples: {
        time: "18:00",
        courseName: "중급 회화",
        zoomLink: "https://zoom.us/j/123456789",
      },
    },
  ];

  getTemplates(): MessageTemplate[] {
    return [...this.templates];
  }

  getTemplate(id: string): MessageTemplate | undefined {
    return this.templates.find((template) => template.id === id);
  }

  addTemplate(template: MessageTemplate): void {
    this.templates.push(template);
  }

  updateTemplate(id: string, updates: Partial<MessageTemplate>): boolean {
    const index = this.templates.findIndex((template) => template.id === id);
    if (index === -1) return false;

    this.templates[index] = { ...this.templates[index], ...updates };
    return true;
  }

  deleteTemplate(id: string): boolean {
    const index = this.templates.findIndex((template) => template.id === id);
    if (index === -1) return false;

    this.templates.splice(index, 1);
    return true;
  }
}

export const messageTemplateManager = new MessageTemplateManager();

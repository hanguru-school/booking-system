import cache from "./cache";
import { externalIntegrationManager } from "./external-integrations";

export interface UserBehavior {
  userId: string;
  userType: "student" | "teacher" | "admin";
  lastBookingDate?: Date;
  lastAttendanceDate?: Date;
  lastNoteViewDate?: Date;
  lastHomeworkSubmission?: Date;
  totalClassHours: number;
  monthlyClassHours: number;
  bookingPattern: "regular" | "irregular" | "inactive";
  attendanceRate: number;
  noteViewFrequency: number;
  homeworkCompletionRate: number;
  lastActivityDate: Date;
}

export interface ReminderRule {
  id: string;
  name: string;
  condition: string;
  message: string;
  channels: ("line" | "email" | "push")[];
  timing: "immediate" | "daily" | "weekly" | "monthly";
  enabled: boolean;
  priority: "low" | "medium" | "high";
}

export interface ReminderMessage {
  id: string;
  userId: string;
  userType: "student" | "teacher" | "admin";
  ruleId: string;
  message: string;
  channels: string[];
  status: "pending" | "sent" | "failed";
  scheduledAt: Date;
  sentAt?: Date;
  retryCount: number;
}

export interface BehaviorTrigger {
  type:
    | "no_booking_7days"
    | "no_note_view"
    | "no_attendance"
    | "low_hours"
    | "before_class";
  condition: Record<string, unknown>;
  action: "reminder" | "recommendation" | "alert";
  message: string;
}

export class BehaviorAnalyticsManager {
  private static instance: BehaviorAnalyticsManager;
  private behaviors: Map<string, UserBehavior> = new Map();
  private reminderRules: ReminderRule[] = [];
  private reminderQueue: ReminderMessage[] = [];
  private readonly CACHE_KEY = "behavior_analytics";
  private readonly CACHE_TTL = 3600; // 1 hour

  private constructor() {
    this.initializeDefaultRules();
    this.loadData();
  }

  static getInstance(): BehaviorAnalyticsManager {
    if (!BehaviorAnalyticsManager.instance) {
      BehaviorAnalyticsManager.instance = new BehaviorAnalyticsManager();
    }
    return BehaviorAnalyticsManager.instance;
  }

  private initializeDefaultRules(): void {
    this.reminderRules = [
      {
        id: "no_booking_7days",
        name: "7일간 예약 없음",
        condition: "lastBookingDate < 7 days ago",
        message: "次回の予約がまだのようです。次の授業もお待ちしています！",
        channels: ["line", "email"],
        timing: "weekly",
        enabled: true,
        priority: "high",
      },
      {
        id: "no_note_view",
        name: "노트 미열람",
        condition: "lastNoteViewDate < lastAttendanceDate",
        message: "前回のレッスンの復習を忘れずに！",
        channels: ["line", "email"],
        timing: "daily",
        enabled: true,
        priority: "medium",
      },
      {
        id: "low_hours",
        name: "월 수업 시간 부족",
        condition: "monthlyClassHours < 180",
        message:
          "今月の学習時間が180分に満たないようです。目標達成のためにもう一度予約してみましょう！",
        channels: ["line", "email"],
        timing: "monthly",
        enabled: true,
        priority: "high",
      },
      {
        id: "before_class",
        name: "수업 전 알림",
        condition: "classStartTime - 10 minutes",
        message: "授業開始10分前です。お忘れ物はありませんか？",
        channels: ["line", "push"],
        timing: "immediate",
        enabled: true,
        priority: "high",
      },
      {
        id: "no_attendance",
        name: "출석 미확인",
        condition: "classEnded && !attendanceConfirmed",
        message: "出席確認を忘れていませんか？",
        channels: ["line", "email"],
        timing: "immediate",
        enabled: true,
        priority: "medium",
      },
    ];
  }

  private loadData(): void {
    try {
      const cached = cache.get(this.CACHE_KEY);
      if (cached && typeof cached === 'object' && cached !== null) {
        const typedCache = cached as {
          behaviors: [string, UserBehavior][];
          reminderRules: ReminderRule[];
          reminderQueue: ReminderMessage[];
        };
        
        if (Array.isArray(typedCache.behaviors)) {
          this.behaviors = new Map(typedCache.behaviors);
        }
        if (Array.isArray(typedCache.reminderRules)) {
          this.reminderRules = typedCache.reminderRules;
        }
        if (Array.isArray(typedCache.reminderQueue)) {
          this.reminderQueue = typedCache.reminderQueue;
        }
      }
    } catch (error) {
      console.error("행동 분석 데이터 로드 실패:", error);
    }
  }

  private saveData(): void {
    try {
      cache.set(
        this.CACHE_KEY,
        {
          behaviors: Array.from(this.behaviors.entries()),
          reminderRules: this.reminderRules,
          reminderQueue: this.reminderQueue,
        },
        this.CACHE_TTL,
      );
    } catch (error) {
      console.error("행동 분석 데이터 저장 실패:", error);
    }
  }

  // 사용자 행동 업데이트
  async updateUserBehavior(
    userId: string,
    userType: "student" | "teacher" | "admin",
    updates: Partial<UserBehavior>,
  ): Promise<void> {
    const currentBehavior = this.behaviors.get(userId) || {
      userId,
      userType,
      totalClassHours: 0,
      monthlyClassHours: 0,
      bookingPattern: "inactive",
      attendanceRate: 0,
      noteViewFrequency: 0,
      homeworkCompletionRate: 0,
      lastActivityDate: new Date(),
    };

    const updatedBehavior = {
      ...currentBehavior,
      ...updates,
      lastActivityDate: new Date(),
    };
    this.behaviors.set(userId, updatedBehavior);

    // 행동 패턴 분석
    await this.analyzeBehaviorPattern(userId);

    // 리마인드 조건 확인
    await this.checkReminderConditions(userId);

    this.saveData();
  }

  // 행동 패턴 분석
  private async analyzeBehaviorPattern(userId: string): Promise<void> {
    const behavior = this.behaviors.get(userId);
    if (!behavior) return;

    // 예약 패턴 분석
    if (behavior.lastBookingDate) {
      const daysSinceLastBooking = Math.floor(
        (Date.now() - behavior.lastBookingDate.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      if (daysSinceLastBooking <= 7) {
        behavior.bookingPattern = "regular";
      } else if (daysSinceLastBooking <= 30) {
        behavior.bookingPattern = "irregular";
      } else {
        behavior.bookingPattern = "inactive";
      }
    }

    // 월 수업 시간 계산 (실제로는 DB에서 계산)
    behavior.monthlyClassHours = Math.min(behavior.monthlyClassHours, 300); // 최대 300분으로 제한

    this.behaviors.set(userId, behavior);
  }

  // 리마인드 조건 확인
  private async checkReminderConditions(userId: string): Promise<void> {
    const behavior = this.behaviors.get(userId);
    if (!behavior) return;

    for (const rule of this.reminderRules) {
      if (!rule.enabled) continue;

      if (await this.evaluateCondition(rule.condition, behavior)) {
        await this.createReminder(userId, behavior.userType, rule);
      }
    }
  }

  // 조건 평가
  private async evaluateCondition(
    condition: string,
    behavior: UserBehavior,
  ): Promise<boolean> {
    switch (condition) {
      case "lastBookingDate < 7 days ago":
        if (!behavior.lastBookingDate) return true;
        const daysSinceBooking = Math.floor(
          (Date.now() - behavior.lastBookingDate.getTime()) /
            (1000 * 60 * 60 * 24),
        );
        return daysSinceBooking >= 7;

      case "lastNoteViewDate < lastAttendanceDate":
        if (!behavior.lastAttendanceDate || !behavior.lastNoteViewDate)
          return false;
        return behavior.lastNoteViewDate < behavior.lastAttendanceDate;

      case "monthlyClassHours < 180":
        return behavior.monthlyClassHours < 180;

      case "classStartTime - 10 minutes":
        // 실제 구현에서는 예약된 수업 시간과 비교
        return false;

      case "classEnded && !attendanceConfirmed":
        // 실제 구현에서는 수업 종료 상태와 출석 확인 상태 비교
        return false;

      default:
        return false;
    }
  }

  // 리마인드 생성
  private async createReminder(
    userId: string,
    userType: "student" | "teacher" | "admin",
    rule: ReminderRule,
  ): Promise<void> {
    // 중복 리마인드 방지
    const existingReminder = this.reminderQueue.find(
      (r) =>
        r.userId === userId && r.ruleId === rule.id && r.status === "pending",
    );

    if (existingReminder) return;

    const reminder: ReminderMessage = {
      id: this.generateReminderId(),
      userId,
      userType,
      ruleId: rule.id,
      message: rule.message,
      channels: rule.channels,
      status: "pending",
      scheduledAt: this.calculateScheduledTime(rule.timing),
      retryCount: 0,
    };

    this.reminderQueue.push(reminder);
    this.saveData();

    // 즉시 발송이 필요한 경우
    if (rule.timing === "immediate") {
      await this.processReminderQueue();
    }
  }

  // 예약 시간 계산
  private calculateScheduledTime(timing: string): Date {
    const now = new Date();

    switch (timing) {
      case "immediate":
        return now;
      case "daily":
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case "weekly":
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case "monthly":
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      default:
        return now;
    }
  }

  // 리마인드 큐 처리
  async processReminderQueue(): Promise<void> {
    const now = new Date();
    const pendingReminders = this.reminderQueue.filter(
      (r) => r.status === "pending" && r.scheduledAt <= now,
    );

    for (const reminder of pendingReminders) {
      try {
        reminder.status = "sent";
        reminder.sentAt = new Date();

        // 채널별 발송
        for (const channel of reminder.channels) {
          await this.sendReminder(reminder, channel);
        }

        console.log(
          `리마인드 발송 완료: ${reminder.userId} - ${reminder.ruleId}`,
        );
      } catch (error) {
        console.error(`리마인드 발송 실패: ${reminder.id}`, error);
        reminder.status = "failed";
        reminder.retryCount++;

        // 재시도 로직
        if (reminder.retryCount < 3) {
          reminder.status = "pending";
          reminder.scheduledAt = new Date(
            Date.now() + Math.pow(2, reminder.retryCount) * 60 * 1000,
          );
        }
      }
    }

    this.saveData();
  }

  // 리마인드 발송
  private async sendReminder(
    reminder: ReminderMessage,
    channel: string,
  ): Promise<void> {
    switch (channel) {
      case "line":
        await externalIntegrationManager.sendLineMessage(
          reminder.userId,
          reminder.message,
        );
        break;
      case "email":
        await this.sendEmailReminder(reminder);
        break;
      case "push":
        await this.sendPushNotification(reminder);
        break;
    }
  }

  // 이메일 리마인드 발송
  private async sendEmailReminder(reminder: ReminderMessage): Promise<void> {
    try {
      const response = await fetch("/api/notifications/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: reminder.userId,
          userType: reminder.userType,
          subject: "수업 리마인드",
          message: reminder.message,
          template: "reminder",
        }),
      });

      if (!response.ok) {
        throw new Error("이메일 발송 실패");
      }
    } catch (error) {
      console.error("이메일 리마인드 발송 실패:", error);
      throw error;
    }
  }

  // 푸시 알림 발송
  private async sendPushNotification(reminder: ReminderMessage): Promise<void> {
    try {
      const response = await fetch("/api/notifications/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: reminder.userId,
          userType: reminder.userType,
          title: "수업 알림",
          message: reminder.message,
          data: { type: "reminder", ruleId: reminder.ruleId },
        }),
      });

      if (!response.ok) {
        throw new Error("푸시 알림 발송 실패");
      }
    } catch (error) {
      console.error("푸시 알림 발송 실패:", error);
      throw error;
    }
  }

  // 사용자별 추천 생성
  async generateRecommendations(userId: string): Promise<string[]> {
    const behavior = this.behaviors.get(userId);
    if (!behavior) return [];

    const recommendations: string[] = [];

    // 예약 패턴 기반 추천
    if (behavior.bookingPattern === "inactive") {
      recommendations.push("정기적인 수업 예약을 권장합니다.");
    }

    // 수업 시간 기반 추천
    if (behavior.monthlyClassHours < 180) {
      recommendations.push("월 180분 목표 달성을 위해 추가 수업을 권장합니다.");
    }

    // 출석률 기반 추천
    if (behavior.attendanceRate < 0.8) {
      recommendations.push("출석률 향상을 위해 수업 일정을 조정해보세요.");
    }

    // 노트 열람 기반 추천
    if (behavior.noteViewFrequency < 2) {
      recommendations.push("수업 내용 복습을 위해 노트를 자주 확인해보세요.");
    }

    return recommendations;
  }

  // 행동 통계 조회
  async getBehaviorStats(userId: string): Promise<UserBehavior | null> {
    return this.behaviors.get(userId) || null;
  }

  // 전체 사용자 행동 통계
  async getAllBehaviorStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    averageAttendanceRate: number;
    averageMonthlyHours: number;
    inactiveUsers: number;
  }> {
    const behaviors = Array.from(this.behaviors.values());

    const totalUsers = behaviors.length;
    const activeUsers = behaviors.filter(
      (b) => b.bookingPattern !== "inactive",
    ).length;
    const averageAttendanceRate =
      behaviors.reduce((sum, b) => sum + b.attendanceRate, 0) / totalUsers || 0;
    const averageMonthlyHours =
      behaviors.reduce((sum, b) => sum + b.monthlyClassHours, 0) / totalUsers ||
      0;
    const inactiveUsers = behaviors.filter(
      (b) => b.bookingPattern === "inactive",
    ).length;

    return {
      totalUsers,
      activeUsers,
      averageAttendanceRate,
      averageMonthlyHours,
      inactiveUsers,
    };
  }

  // 리마인드 규칙 관리
  addReminderRule(rule: ReminderRule): void {
    this.reminderRules.push(rule);
    this.saveData();
  }

  updateReminderRule(ruleId: string, updates: Partial<ReminderRule>): void {
    const index = this.reminderRules.findIndex((r) => r.id === ruleId);
    if (index !== -1) {
      this.reminderRules[index] = { ...this.reminderRules[index], ...updates };
      this.saveData();
    }
  }

  deleteReminderRule(ruleId: string): void {
    this.reminderRules = this.reminderRules.filter((r) => r.id !== ruleId);
    this.saveData();
  }

  getReminderRules(): ReminderRule[] {
    return [...this.reminderRules];
  }

  // 리마인드 히스토리 조회
  getReminderHistory(userId: string): ReminderMessage[] {
    return this.reminderQueue.filter(
      (r) => r.userId === userId && r.status === "sent",
    );
  }

  // 리마인드 ID 생성
  private generateReminderId(): string {
    return `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 데이터 내보내기
  exportData(): string {
    return JSON.stringify(
      {
        behaviors: Array.from(this.behaviors.entries()),
        reminderRules: this.reminderRules,
        reminderQueue: this.reminderQueue,
      },
      null,
      2,
    );
  }

  // 데이터 가져오기
  importData(dataJson: string): boolean {
    try {
      const data = JSON.parse(dataJson);
      this.behaviors = new Map(data.behaviors || []);
      this.reminderRules = data.reminderRules || this.reminderRules;
      this.reminderQueue = data.reminderQueue || [];
      this.saveData();
      return true;
    } catch (error) {
      console.error("데이터 가져오기 실패:", error);
      return false;
    }
  }
}

export const behaviorAnalyticsManager = BehaviorAnalyticsManager.getInstance();

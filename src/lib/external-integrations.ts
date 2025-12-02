import cache from "./cache";

export interface ExternalSystemConfig {
  simplyBook: {
    enabled: boolean;
    apiKey: string;
    apiUrl: string;
    webhookUrl: string;
  };
  line: {
    enabled: boolean;
    channelId: string;
    channelSecret: string;
    accessToken: string;
    webhookUrl: string;
  };
  square: {
    enabled: boolean;
    applicationId: string;
    locationId: string;
    accessToken: string;
    webhookUrl: string;
  };
  googleCalendar: {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
  uidReader: {
    enabled: boolean;
    apiEndpoint: string;
    apiKey: string;
    pollingInterval: number; // seconds
  };
}

export interface IntegrationEvent {
  id: string;
  type: "booking" | "payment" | "attendance" | "notification";
  source: string;
  data: Record<string, unknown>;
  timestamp: Date;
  status: "pending" | "processing" | "completed" | "failed";
  retryCount: number;
}

export interface UIDTagEvent {
  uid: string;
  timestamp: Date;
  location: string;
  userId?: string;
  userType?: "student" | "teacher" | "admin";
  action: "checkin" | "checkout" | "attendance";
}

export class ExternalIntegrationManager {
  private static instance: ExternalIntegrationManager;
  private config: ExternalSystemConfig;
  private eventQueue: IntegrationEvent[] = [];
  private readonly CACHE_KEY = "external_integrations";
  private readonly CACHE_TTL = 1800; // 30 minutes

  private constructor() {
    this.config = this.getDefaultConfig();
    this.loadConfig();
  }

  static getInstance(): ExternalIntegrationManager {
    if (!ExternalIntegrationManager.instance) {
      ExternalIntegrationManager.instance = new ExternalIntegrationManager();
    }
    return ExternalIntegrationManager.instance;
  }

  private getDefaultConfig(): ExternalSystemConfig {
    return {
      simplyBook: {
        enabled: false,
        apiKey: "",
        apiUrl: "https://api.simplybook.me/v2",
        webhookUrl: "",
      },
      line: {
        enabled: false,
        channelId: "",
        channelSecret: "",
        accessToken: "",
        webhookUrl: "",
      },
      square: {
        enabled: false,
        applicationId: "",
        locationId: "",
        accessToken: "",
        webhookUrl: "",
      },
      googleCalendar: {
        enabled: false,
        clientId: "",
        clientSecret: "",
        redirectUri: "",
      },
      uidReader: {
        enabled: false,
        apiEndpoint: "",
        apiKey: "",
        pollingInterval: 30,
      },
    };
  }

  private loadConfig(): void {
    try {
      const cached = cache.get(this.CACHE_KEY);
      if (cached) {
        this.config = { ...this.getDefaultConfig(), ...cached };
      }
    } catch (error) {
      console.error("외부 시스템 설정 로드 실패:", error);
    }
  }

  private saveConfig(): void {
    try {
      cache.set(this.CACHE_KEY, this.config, this.CACHE_TTL);
    } catch (error) {
      console.error("외부 시스템 설정 저장 실패:", error);
    }
  }

  // SimplyBook 연동
  async syncWithSimplyBook(
    bookingData: Record<string, unknown>,
  ): Promise<boolean> {
    if (!this.config.simplyBook.enabled) return false;

    try {
      const response = await fetch(
        `${this.config.simplyBook.apiUrl}/bookings`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.config.simplyBook.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingData),
        },
      );

      return response.ok;
    } catch (error) {
      console.error("SimplyBook 연동 실패:", error);
      return false;
    }
  }

  // LINE 메시지 발송
  async sendLineMessage(userId: string, message: string): Promise<boolean> {
    if (!this.config.line.enabled) return false;

    try {
      const response = await fetch("https://api.line.me/v2/bot/message/push", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.line.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: userId,
          messages: [{ type: "text", text: message }],
        }),
      });

      return response.ok;
    } catch (error) {
      console.error("LINE 메시지 발송 실패:", error);
      return false;
    }
  }

  // Square 결제 처리
  async processSquarePayment(
    paymentData: Record<string, unknown>,
  ): Promise<any> {
    if (!this.config.square.enabled) return null;

    try {
      const response = await fetch(
        "https://connect.squareupsandbox.com/v2/payments",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.config.square.accessToken}`,
            "Content-Type": "application/json",
            "Square-Version": "2023-12-13",
          },
          body: JSON.stringify(paymentData),
        },
      );

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error("Square 결제 처리 실패:", error);
      return null;
    }
  }

  // Google Calendar 연동
  async addToGoogleCalendar(
    eventData: Record<string, unknown>,
  ): Promise<string | null> {
    if (!this.config.googleCalendar.enabled) return null;

    try {
      // Google Calendar API 연동 로직
      // 실제 구현에서는 OAuth2 인증이 필요
      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${eventData.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            summary: eventData.title,
            description: eventData.description,
            start: { dateTime: eventData.startTime },
            end: { dateTime: eventData.endTime },
          }),
        },
      );

      if (response.ok) {
        const result = await response.json();
        return result.id;
      }
      return null;
    } catch (error) {
      console.error("Google Calendar 연동 실패:", error);
      return null;
    }
  }

  // UID 태깅 이벤트 처리
  async processUIDTagEvent(
    uid: string,
    location: string,
  ): Promise<UIDTagEvent | null> {
    if (!this.config.uidReader.enabled) return null;

    try {
      // UID로 사용자 정보 조회
      const userInfo = await this.getUserByUID(uid);

      const tagEvent: UIDTagEvent = {
        uid,
        timestamp: new Date(),
        location,
        userId: userInfo?.id,
        userType: userInfo?.type,
        action: "attendance",
      };

      // 태깅 이벤트 처리
      await this.handleTagEvent(tagEvent);

      return tagEvent;
    } catch (error) {
      console.error("UID 태깅 이벤트 처리 실패:", error);
      return null;
    }
  }

  // UID로 사용자 정보 조회
  private async getUserByUID(uid: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.config.uidReader.apiEndpoint}/users/${uid}`,
        {
          headers: {
            Authorization: `Bearer ${this.config.uidReader.apiKey}`,
          },
        },
      );

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error("UID 사용자 조회 실패:", error);
      return null;
    }
  }

  // 태깅 이벤트 처리
  private async handleTagEvent(tagEvent: UIDTagEvent): Promise<void> {
    if (tagEvent.userId && tagEvent.userType) {
      // 출석 처리
      if (tagEvent.action === "attendance") {
        await this.processAttendance(tagEvent);
      }

      // 출퇴근 처리
      if (tagEvent.action === "checkin" || tagEvent.action === "checkout") {
        await this.processTimeTracking(tagEvent);
      }
    }
  }

  // 출석 처리
  private async processAttendance(tagEvent: UIDTagEvent): Promise<void> {
    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: tagEvent.userId,
          userType: tagEvent.userType,
          timestamp: tagEvent.timestamp,
          location: tagEvent.location,
          method: "uid_tag",
        }),
      });

      if (response.ok) {
        console.log(`출석 처리 완료: ${tagEvent.userId}`);
      }
    } catch (error) {
      console.error("출석 처리 실패:", error);
    }
  }

  // 출퇴근 처리
  private async processTimeTracking(tagEvent: UIDTagEvent): Promise<void> {
    try {
      const response = await fetch("/api/time-tracking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: tagEvent.userId,
          userType: tagEvent.userType,
          action: tagEvent.action,
          timestamp: tagEvent.timestamp,
          location: tagEvent.location,
        }),
      });

      if (response.ok) {
        console.log(`${tagEvent.action} 처리 완료: ${tagEvent.userId}`);
      }
    } catch (error) {
      console.error("출퇴근 처리 실패:", error);
    }
  }

  // 이벤트 큐에 추가
  addToEventQueue(
    event: Omit<IntegrationEvent, "id" | "timestamp" | "status" | "retryCount">,
  ): void {
    const integrationEvent: IntegrationEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date(),
      status: "pending",
      retryCount: 0,
    };

    this.eventQueue.push(integrationEvent);
    this.processEventQueue();
  }

  // 이벤트 큐 처리
  private async processEventQueue(): Promise<void> {
    const pendingEvents = this.eventQueue.filter(
      (event) => event.status === "pending",
    );

    for (const event of pendingEvents) {
      try {
        event.status = "processing";

        switch (event.type) {
          case "booking":
            await this.handleBookingEvent(event);
            break;
          case "payment":
            await this.handlePaymentEvent(event);
            break;
          case "attendance":
            await this.handleAttendanceEvent(event);
            break;
          case "notification":
            await this.handleNotificationEvent(event);
            break;
        }

        event.status = "completed";
      } catch (error) {
        console.error(`이벤트 처리 실패: ${event.id}`, error);
        event.status = "failed";
        event.retryCount++;

        // 재시도 로직 (최대 3회)
        if (event.retryCount < 3) {
          setTimeout(
            () => {
              event.status = "pending";
            },
            Math.pow(2, event.retryCount) * 1000,
          ); // 지수 백오프
        }
      }
    }
  }

  // 이벤트 타입별 처리
  private async handleBookingEvent(event: IntegrationEvent): Promise<void> {
    if (this.config.simplyBook.enabled) {
      await this.syncWithSimplyBook(event.data);
    }
  }

  private async handlePaymentEvent(event: IntegrationEvent): Promise<void> {
    if (this.config.square.enabled) {
      await this.processSquarePayment(event.data);
    }
  }

  private async handleAttendanceEvent(event: IntegrationEvent): Promise<void> {
    // 출석 이벤트 처리 로직
    console.log("출석 이벤트 처리:", event.data);
  }

  private async handleNotificationEvent(
    event: IntegrationEvent,
  ): Promise<void> {
    if (this.config.line.enabled && event.data.channel === "line") {
      const userId = event.data.userId;
      const message = event.data.message;
      
      if (typeof userId === 'string' && typeof message === 'string') {
        await this.sendLineMessage(userId, message);
      } else {
        console.error("Invalid userId or message type:", { userId, message });
      }
    }
  }

  // 이벤트 ID 생성
  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 설정 업데이트
  updateConfig(updates: Partial<ExternalSystemConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
  }

  // 설정 조회
  getConfig(): ExternalSystemConfig {
    return { ...this.config };
  }

  // 설정 백업
  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  // 설정 복원
  importConfig(configJson: string): boolean {
    try {
      const config = JSON.parse(configJson);
      this.config = { ...this.getDefaultConfig(), ...config };
      this.saveConfig();
      return true;
    } catch (error) {
      console.error("설정 복원 실패:", error);
      return false;
    }
  }
}

export const externalIntegrationManager =
  ExternalIntegrationManager.getInstance();

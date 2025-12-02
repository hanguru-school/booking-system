/**
 * 고도화된 IC카드 및 스마트폰 태깅 시스템
 * UID 기반 출석/예약 관리 및 다중 역할 시스템 분기
 * 성능 최적화 버전 - 지연 해결
 */

// 메모리 캐시 인터페이스
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class TaggingCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5분

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  clear(): void {
    this.cache.clear();
  }

  // 만료된 캐시 정리
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export interface TaggingDevice {
  id: string;
  name: string;
  type: "desktop" | "tablet" | "mobile";
  location: string;
  capabilities: ("felica" | "nfc" | "qr")[];
  isActive: boolean;
  lastSeen?: Date;
  connectionStatus: "connected" | "disconnected" | "error";
}

export interface TaggingLog {
  id: string;
  uid: string;
  userId: string;
  userRole: "student" | "teacher" | "staff" | "master";
  deviceId: string;
  deviceLocation: string;
  taggingMethod: "felica" | "nfc" | "qr";
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
  reservationId?: string;
  attendanceStatus: "present" | "late" | "early" | "absent";
  processingTime?: number; // 처리 시간 추가
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    coordinates?: { lat: number; lng: number };
    batteryLevel?: number;
    signalStrength?: number; // 신호 강도 추가
  };
}

export interface UIDRegistration {
  id: string;
  uid: string;
  userId: string;
  deviceType: "felica" | "nfc" | "smartphone" | "ic_card";
  deviceName: string;
  isPrimary: boolean;
  isApproved: boolean;
  registeredAt: Date;
  lastUsedAt?: Date;
  usageCount: number; // 사용 횟수 추가
  lastLocation?: string; // 마지막 사용 위치
}

export interface TaggingFlow {
  id: string;
  userRole: "student" | "teacher" | "staff" | "master";
  condition: string;
  actions: TaggingAction[];
  uiConfig?: Record<string, unknown>;
  priority: number; // 우선순위 추가
}

export interface TaggingAction {
  type: "attendance" | "notification" | "reservation" | "points" | "custom";
  params: Record<string, unknown>;
  delay?: number; // 지연 시간 추가
  retryCount?: number; // 재시도 횟수
}

export interface RolePermissions {
  role: "student" | "teacher" | "staff" | "master";
  canTag: boolean;
  canViewLogs: boolean;
  canManageDevices: boolean;
  canApproveUID: boolean;
  allowedMethods: ("felica" | "nfc" | "qr")[];
  maxDailyTags: number;
}

// 성능 최적화된 태깅 시스템
class TaggingSystem {
  private devices: TaggingDevice[] = [];
  private logs: TaggingLog[] = [];
  private uidRegistrations: UIDRegistration[] = [];
  private flows: TaggingFlow[] = [];
  private rolePermissions: RolePermissions[] = [];
  private cache: TaggingCache;
  private processingQueue: Array<() => Promise<void>> = [];
  private isProcessing = false;
  private readonly MAX_QUEUE_SIZE = 50; // 큐 크기 줄임
  private readonly BATCH_SIZE = 5; // 배치 크기 줄임
  private isInitialized = false;
  private userCache = new Map<
    string,
    { userId: string; userRole: string; timestamp: number }
  >();
  private readonly USER_CACHE_TTL = 30 * 1000; // 30초

  constructor() {
    this.cache = new TaggingCache();
    this.initializeSystem();
  }

  // 시스템 초기화
  private async initializeSystem(): Promise<void> {
    try {
      console.log("태깅 시스템 초기화 시작...");

      // 병렬로 초기화하여 속도 향상
      await Promise.all([
        this.initializeDevices(),
        this.initializeFlows(),
        this.initializeRolePermissions(),
        this.initializeUIDRegistrations(),
      ]);

      this.startPeriodicCleanup();
      this.isInitialized = true;
      console.log("태깅 시스템 초기화 완료");
    } catch (error) {
      console.error("태깅 시스템 초기화 실패:", error);
      this.isInitialized = false;
    }
  }

  // 초기화 상태 확인
  public isSystemReady(): boolean {
    return this.isInitialized;
  }

  // 주기적 캐시 정리
  private startPeriodicCleanup(): void {
    setInterval(() => {
      this.cache.cleanup();
      this.cleanupUserCache();
    }, 30000); // 30초마다 (더 자주)
  }

  // 사용자 캐시 정리
  private cleanupUserCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.userCache.entries()) {
      if (now - entry.timestamp > this.USER_CACHE_TTL) {
        this.userCache.delete(key);
      }
    }
  }

  // 배치 처리 큐 - 성능 최적화
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.processingQueue.length === 0) return;

    this.isProcessing = true;

    try {
      const batch = this.processingQueue.splice(0, this.BATCH_SIZE);
      // 병렬 처리로 속도 향상
      await Promise.allSettled(batch.map((task) => task()));
    } catch (error) {
      console.error("배치 처리 중 오류:", error);
    } finally {
      this.isProcessing = false;

      // 큐에 남은 작업이 있으면 즉시 처리
      if (this.processingQueue.length > 0) {
        setImmediate(() => this.processQueue());
      }
    }
  }

  // 큐에 작업 추가 - 우선순위 처리
  private addToQueue(task: () => Promise<void>, priority: number = 0): void {
    if (this.processingQueue.length >= this.MAX_QUEUE_SIZE) {
      // 큐가 가득 찬 경우 오래된 작업 제거
      this.processingQueue.shift();
    }

    if (priority > 0) {
      // 우선순위가 높은 작업을 앞에 추가
      this.processingQueue.unshift(task);
    } else {
      this.processingQueue.push(task);
    }

    // 즉시 처리 시작
    if (!this.isProcessing) {
      setImmediate(() => this.processQueue());
    }
  }

  private initializeDevices(): void {
    this.devices = [
      {
        id: "device_001",
        name: "Mac 태깅 리더",
        type: "desktop",
        location: "1층 로비",
        capabilities: ["felica", "nfc"],
        isActive: true,
        connectionStatus: "connected",
        lastSeen: new Date(),
      },
      {
        id: "device_002",
        name: "iPad 태깅 리더",
        type: "tablet",
        location: "2층 강의실",
        capabilities: ["felica", "nfc", "qr"],
        isActive: true,
        connectionStatus: "connected",
        lastSeen: new Date(),
      },
      {
        id: "device_003",
        name: "모바일 태깅",
        type: "mobile",
        location: "전체",
        capabilities: ["nfc", "qr"],
        isActive: true,
        connectionStatus: "connected",
        lastSeen: new Date(),
      },
    ];
  }

  private initializeUIDRegistrations(): void {
    // 기본 UID 등록 데이터
    this.uidRegistrations = [
      {
        id: "reg_001",
        uid: "STUDENT1234",
        userId: "student_001",
        deviceType: "ic_card",
        deviceName: "학생 카드",
        isPrimary: true,
        isApproved: true,
        registeredAt: new Date("2024-01-01"),
        lastUsedAt: new Date(),
        usageCount: 15,
        lastLocation: "1층 로비",
      },
      {
        id: "reg_002",
        uid: "TEACHER5678",
        userId: "teacher_001",
        deviceType: "ic_card",
        deviceName: "선생님 카드",
        isPrimary: true,
        isApproved: true,
        registeredAt: new Date("2024-01-01"),
        lastUsedAt: new Date(),
        usageCount: 8,
        lastLocation: "2층 강의실",
      },
      {
        id: "reg_003",
        uid: "STAFF9012",
        userId: "staff_001",
        deviceType: "ic_card",
        deviceName: "직원 카드",
        isPrimary: true,
        isApproved: true,
        registeredAt: new Date("2024-01-01"),
        lastUsedAt: new Date(),
        usageCount: 12,
        lastLocation: "1층 로비",
      },
    ];
  }

  private initializeFlows(): void {
    this.flows = [
      // 학생 태깅 플로우
      {
        id: "student_attendance",
        userRole: "student",
        condition: "has_reservation",
        priority: 1,
        actions: [
          {
            type: "attendance",
            params: { status: "present" },
            delay: 0,
          },
          {
            type: "points",
            params: { amount: 10, reason: "출석" },
            delay: 1000,
          },
          {
            type: "notification",
            params: {
              title: "출석 확인",
              message: "수업 출석이 확인되었습니다.",
              type: "success",
            },
            delay: 2000,
          },
        ],
        uiConfig: {
          showSuccessMessage: true,
          autoClose: 3000,
          showPoints: true,
        },
      },
      {
        id: "student_no_reservation",
        userRole: "student",
        condition: "no_reservation",
        priority: 2,
        actions: [
          {
            type: "notification",
            params: {
              title: "예약 없음",
              message: "오늘 예약된 수업이 없습니다.",
              type: "warning",
            },
            delay: 0,
          },
        ],
        uiConfig: {
          showManualAttendance: true,
          showOptions: true,
        },
      },
      // 선생님 태깅 플로우
      {
        id: "teacher_checkin",
        userRole: "teacher",
        condition: "checkin",
        priority: 1,
        actions: [
          {
            type: "attendance",
            params: { status: "present", type: "teacher" },
            delay: 0,
          },
          {
            type: "notification",
            params: {
              title: "출근 확인",
              message: "출근이 확인되었습니다.",
              type: "success",
            },
            delay: 1000,
          },
        ],
      },
      // 직원 태깅 플로우
      {
        id: "staff_checkin",
        userRole: "staff",
        condition: "checkin",
        priority: 1,
        actions: [
          {
            type: "attendance",
            params: { status: "present", type: "staff" },
            delay: 0,
          },
          {
            type: "notification",
            params: {
              title: "출근 확인",
              message: "출근이 확인되었습니다.",
              type: "success",
            },
            delay: 1000,
          },
        ],
      },
    ];
  }

  private initializeRolePermissions(): void {
    this.rolePermissions = [
      {
        role: "student",
        canTag: true,
        canViewLogs: false,
        canManageDevices: false,
        canApproveUID: false,
        allowedMethods: ["nfc", "qr"],
        maxDailyTags: 5,
      },
      {
        role: "teacher",
        canTag: true,
        canViewLogs: true,
        canManageDevices: false,
        canApproveUID: false,
        allowedMethods: ["felica", "nfc", "qr"],
        maxDailyTags: 10,
      },
      {
        role: "staff",
        canTag: true,
        canViewLogs: true,
        canManageDevices: true,
        canApproveUID: true,
        allowedMethods: ["felica", "nfc", "qr"],
        maxDailyTags: 20,
      },
      {
        role: "master",
        canTag: true,
        canViewLogs: true,
        canManageDevices: true,
        canApproveUID: true,
        allowedMethods: ["felica", "nfc", "qr"],
        maxDailyTags: 50,
      },
    ];
  }

  // UID로 사용자 찾기 (개선된 버전)
  async findUserByUID(
    uid: string,
  ): Promise<{ userId: string; userRole: string } | null> {
    // 캐시 확인
    const cached = this.userCache.get(uid);
    if (cached && Date.now() - cached.timestamp < this.USER_CACHE_TTL) {
      return cached;
    }

    // 캐시에 없으면 조회
    const registration = this.uidRegistrations.find(
      (r) => r.uid === uid && r.isApproved,
    );
    if (!registration) {
      return null;
    }

    const userRole = this.getUserRole(registration.userId);
    const result = { userId: registration.userId, userRole };

    // 캐시에 저장
    this.userCache.set(uid, { ...result, timestamp: Date.now() });

    return result;
  }

  // 사용자 역할 조회 (실제로는 데이터베이스에서 조회)
  private getUserRole(userId: string): string {
    // 임시 로직 - 실제로는 데이터베이스에서 조회
    if (userId.startsWith("student_")) return "student";
    if (userId.startsWith("teacher_")) return "teacher";
    if (userId.startsWith("staff_")) return "staff";
    if (userId.startsWith("master_")) return "master";
    return "student"; // 기본값
  }

  // 태깅 처리 (개선된 버전)
  async processTagging(
    uid: string,
    deviceId: string,
    taggingMethod: "felica" | "nfc" | "qr",
    metadata?: {
      ipAddress?: string;
      userAgent?: string;
      coordinates?: { lat: number; lng: number };
      batteryLevel?: number;
      signalStrength?: number;
    },
  ): Promise<{
    success: boolean;
    flow?: TaggingFlow;
    error?: string;
    processingTime?: number;
  }> {
    const startTime = Date.now();

    return new Promise((resolve) => {
      // 우선순위 높은 작업으로 큐에 추가
      this.addToQueue(async () => {
        try {
          console.log(
            `태깅 처리 시작: UID=${uid}, Device=${deviceId}, Method=${taggingMethod}`,
          );

          // 1. 시스템 준비 상태 확인 (캐시)
          if (!this.isSystemReady()) {
            resolve({
              success: false,
              error: "태깅 시스템이 초기화되지 않았습니다.",
              processingTime: Date.now() - startTime,
            });
            return;
          }

          // 2. 디바이스 확인 (캐시)
          const deviceCacheKey = `device_${deviceId}`;
          let device = this.cache.get<TaggingDevice>(deviceCacheKey);
          if (!device) {
            const foundDevice = this.devices.find((d) => d.id === deviceId);
            if (foundDevice) {
              device = foundDevice;
              this.cache.set(deviceCacheKey, device, 60000); // 1분 캐시
            }
          }

          if (!device || !device.isActive) {
            resolve({
              success: false,
              error: "유효하지 않은 디바이스입니다.",
              processingTime: Date.now() - startTime,
            });
            return;
          }

          // 3. 사용자 조회 (캐시 최적화)
          const user = await this.findUserByUID(uid);
          if (!user) {
            resolve({
              success: false,
              error: "등록되지 않은 UID입니다.",
              processingTime: Date.now() - startTime,
            });
            return;
          }

          // 4. 권한 확인 (캐시)
          const permissionsCacheKey = `permissions_${user.userRole}`;
          let permissions =
            this.cache.get<RolePermissions>(permissionsCacheKey);
          if (!permissions) {
            const foundPermissions = this.rolePermissions.find(
              (p) => p.role === user.userRole,
            );
            if (foundPermissions) {
              permissions = foundPermissions;
              this.cache.set(permissionsCacheKey, permissions, 300000); // 5분 캐시
            }
          }

          if (!permissions || !permissions.canTag) {
            resolve({
              success: false,
              error: "태깅 권한이 없습니다.",
              processingTime: Date.now() - startTime,
            });
            return;
          }

          // 5. 일일 태깅 한도 확인 (최적화)
          const today = new Date().setHours(0, 0, 0, 0);
          const todayTags = this.logs.filter(
            (log) =>
              log.userId === user.userId && log.timestamp.getTime() >= today,
          );

          if (todayTags.length >= permissions.maxDailyTags) {
            resolve({
              success: false,
              error: "오늘의 태깅 한도를 초과했습니다.",
              processingTime: Date.now() - startTime,
            });
            return;
          }

          // 6. 태깅 조건 판단 (캐시)
          const conditionCacheKey = `condition_${user.userId}_${user.userRole}`;
          let condition = this.cache.get<string>(conditionCacheKey);
          if (!condition) {
            condition = await this.determineTaggingCondition(
              user.userId,
              user.userRole,
            );
            this.cache.set(conditionCacheKey, condition, 60000); // 1분 캐시
          }

          // 7. 해당하는 플로우 찾기 (캐시)
          const flowCacheKey = `flow_${user.userRole}_${condition}`;
          let flow = this.cache.get<TaggingFlow>(flowCacheKey);
          if (!flow) {
            const applicableFlows = this.flows.filter(
              (f) => f.userRole === user.userRole && f.condition === condition,
            );
            flow = applicableFlows.sort((a, b) => b.priority - a.priority)[0];
            if (flow) {
              this.cache.set(flowCacheKey, flow, 300000); // 5분 캐시
            }
          }

          if (!flow) {
            resolve({
              success: false,
              error: "적절한 태깅 플로우를 찾을 수 없습니다.",
              processingTime: Date.now() - startTime,
            });
            return;
          }

          // 8. 태깅 로그 기록 (비동기)
          const log: TaggingLog = {
            id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            uid,
            userId: user.userId,
            userRole: user.userRole as
              | "student"
              | "teacher"
              | "staff"
              | "master",
            deviceId,
            deviceLocation: device.location,
            taggingMethod,
            timestamp: new Date(),
            success: true,
            attendanceStatus: await this.determineAttendanceStatus(user.userId),
            processingTime: Date.now() - startTime,
            metadata: {
              ...metadata,
              signalStrength: metadata?.signalStrength || 0,
            },
          };

          // 로그를 비동기로 추가 (성능 향상)
          setImmediate(() => {
            this.logs.push(log);
          });

          // 9. UID 사용 통계 업데이트 (비동기)
          setImmediate(() => {
            const registration = this.uidRegistrations.find(
              (r) => r.uid === uid,
            );
            if (registration) {
              registration.lastUsedAt = new Date();
              registration.usageCount = (registration.usageCount || 0) + 1;
              registration.lastLocation = device.location;
            }
          });

          // 10. 액션 실행 (비동기, 지연 없이)
          setImmediate(() => {
            this.executeActionsAsync(flow.actions, user.userId, log);
          });

          console.log(`태깅 처리 완료: ${flow.id}`);
          resolve({
            success: true,
            flow,
            processingTime: Date.now() - startTime,
          });
        } catch (error) {
          console.error("Tagging processing error:", error);
          resolve({
            success: false,
            error: "태깅 처리 중 오류가 발생했습니다.",
            processingTime: Date.now() - startTime,
          });
        }
      }, 1); // 높은 우선순위
    });
  }

  // 비동기 액션 실행 - 지연 제거
  private async executeActionsAsync(
    actions: TaggingAction[],
    userId: string,
    log: TaggingLog,
  ): Promise<void> {
    // 모든 액션을 병렬로 실행하여 지연 최소화
    const actionPromises = actions.map(async (action) => {
      try {
        // 지연이 있는 경우에만 대기
        if (action.delay && action.delay > 0) {
          await new Promise((resolve) => setTimeout(resolve, action.delay));
        }

        await this.executeAction(action, userId, log);
      } catch (error) {
        console.error(`Action execution failed: ${action.type}`, error);

        // 재시도 로직 (빠른 재시도)
        if (action.retryCount && action.retryCount > 0) {
          for (let i = 0; i < action.retryCount; i++) {
            try {
              await new Promise((resolve) =>
                setTimeout(resolve, 500 * (i + 1)),
              ); // 더 빠른 재시도
              await this.executeAction(action, userId, log);
              break;
            } catch (retryError) {
              console.error(
                `Retry ${i + 1} failed for action ${action.type}:`,
                retryError,
              );
            }
          }
        }
      }
    });

    // 모든 액션을 병렬로 실행
    await Promise.allSettled(actionPromises);
  }

  // 액션 실행
  private async executeAction(
    action: TaggingAction,
    userId: string,
    log: TaggingLog,
  ): Promise<void> {
    switch (action.type) {
      case "attendance":
        console.log(`출석 처리: ${userId}`);
        // 실제 출석 처리 로직
        break;
      case "notification":
        console.log(`알림 전송: ${action.params.title}`);
        // 실제 알림 전송 로직
        break;
      case "points":
        console.log(`포인트 적립: ${action.params.amount}`);
        // 실제 포인트 적립 로직
        break;
      case "reservation":
        console.log(`예약 처리: ${userId}`);
        // 실제 예약 처리 로직
        break;
      case "custom":
        console.log(`커스텀 액션: ${action.params}`);
        // 커스텀 액션 처리
        break;
    }
  }

  // 태깅 조건 판단
  private async determineTaggingCondition(
    userId: string,
    userRole: string,
  ): Promise<string> {
    if (userRole === "student") {
      const hasReservation = await this.checkStudentReservation(userId);
      return hasReservation ? "has_reservation" : "no_reservation";
    } else if (userRole === "teacher" || userRole === "staff") {
      return "checkin";
    }
    return "default";
  }

  // 학생 예약 확인
  private async checkStudentReservation(userId: string): Promise<boolean> {
    // 실제로는 데이터베이스에서 오늘 예약 확인
    // 임시로 랜덤 반환
    return Math.random() > 0.3; // 70% 확률로 예약 있음
  }

  // 출석 상태 판단
  private async determineAttendanceStatus(
    userId: string,
  ): Promise<"present" | "late" | "early" | "absent"> {
    const now = new Date();
    const hour = now.getHours();

    if (hour < 9) return "early";
    if (hour >= 9 && hour <= 10) return "present";
    if (hour > 10) return "late";
    return "absent";
  }

  // UID 등록
  async registerUID(
    uid: string,
    userId: string,
    deviceType: string,
    deviceName: string,
  ): Promise<boolean> {
    try {
      const registration: UIDRegistration = {
        id: `reg_${Date.now()}`,
        uid,
        userId,
        deviceType: deviceType as "felica" | "nfc" | "smartphone" | "ic_card",
        deviceName,
        isPrimary: false,
        isApproved: false,
        registeredAt: new Date(),
        usageCount: 0,
      };

      this.uidRegistrations.push(registration);
      console.log(`UID 등록 완료: ${uid}`);
      return true;
    } catch (error) {
      console.error("UID 등록 실패:", error);
      return false;
    }
  }

  // UID 승인
  async approveUID(uid: string): Promise<boolean> {
    try {
      const registration = this.uidRegistrations.find((r) => r.uid === uid);
      if (registration) {
        registration.isApproved = true;
        console.log(`UID 승인 완료: ${uid}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error("UID 승인 실패:", error);
      return false;
    }
  }

  // 로그 조회
  getLogs(filters?: {
    userId?: string;
    userRole?: string;
    startDate?: Date;
    endDate?: Date;
    deviceId?: string;
  }): TaggingLog[] {
    let logs = this.logs;

    if (filters?.userId) {
      logs = logs.filter((log) => log.userId === filters.userId);
    }
    if (filters?.userRole) {
      logs = logs.filter((log) => log.userRole === filters.userRole);
    }
    if (filters?.startDate) {
      logs = logs.filter((log) => log.timestamp >= filters.startDate!);
    }
    if (filters?.endDate) {
      logs = logs.filter((log) => log.timestamp <= filters.endDate!);
    }
    if (filters?.deviceId) {
      logs = logs.filter((log) => log.deviceId === filters.deviceId);
    }

    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // 권한 확인
  checkPermission(role: string, page: string, functionName?: string): boolean {
    const permissions = this.rolePermissions.find((p) => p.role === role);
    if (!permissions) return false;

    // 페이지별 권한 체크
    switch (page) {
      case "tagging":
        return permissions.canTag;
      case "logs":
        return permissions.canViewLogs;
      case "devices":
        return permissions.canManageDevices;
      case "uid_approval":
        return permissions.canApproveUID;
      default:
        return false;
    }
  }

  // 데이터 접근 권한 확인
  checkDataAccess(
    role: string,
    dataType: "own" | "students" | "teachers" | "staff" | "system",
  ): boolean {
    switch (role) {
      case "master":
        return true; // 모든 데이터 접근 가능
      case "staff":
        return dataType !== "system";
      case "teacher":
        return dataType === "own" || dataType === "students";
      case "student":
        return dataType === "own";
      default:
        return false;
    }
  }

  // 디바이스 목록 조회
  getDevices(): TaggingDevice[] {
    return this.devices.filter((d) => d.isActive);
  }

  /**
   * UID 등록 목록 조회
   */
  getUIDRegistrations(userId?: string): UIDRegistration[] {
    let registrations = this.uidRegistrations;

    if (userId) {
      registrations = registrations.filter((r) => r.userId === userId);
    }

    return registrations.sort(
      (a, b) => b.registeredAt.getTime() - a.registeredAt.getTime(),
    );
  }

  /**
   * 태깅 통계 조회
   */
  getTaggingStats(filters?: {
    startDate?: Date;
    endDate?: Date;
    userRole?: string;
  }): {
    totalTagging: number;
    successRate: number;
    byMethod: Record<string, number>;
    byRole: Record<string, number>;
    byDevice: Record<string, number>;
  } {
    let logs = this.logs;

    if (filters?.startDate) {
      logs = logs.filter((log) => log.timestamp >= filters.startDate!);
    }
    if (filters?.endDate) {
      logs = logs.filter((log) => log.timestamp <= filters.endDate!);
    }
    if (filters?.userRole) {
      logs = logs.filter((log) => log.userRole === filters.userRole);
    }

    const totalTagging = logs.length;
    const successCount = logs.filter((log) => log.success).length;
    const successRate =
      totalTagging > 0 ? (successCount / totalTagging) * 100 : 0;

    const byMethod: Record<string, number> = {};
    const byRole: Record<string, number> = {};
    const byDevice: Record<string, number> = {};

    logs.forEach((log) => {
      byMethod[log.taggingMethod] = (byMethod[log.taggingMethod] || 0) + 1;
      byRole[log.userRole] = (byRole[log.userRole] || 0) + 1;
      byDevice[log.deviceId] = (byDevice[log.deviceId] || 0) + 1;
    });

    return {
      totalTagging,
      successRate,
      byMethod,
      byRole,
      byDevice,
    };
  }

  /**
   * 시스템 상태 확인
   */
  getSystemStatus(): {
    isReady: boolean;
    deviceCount: number;
    activeDeviceCount: number;
    totalLogs: number;
    cacheSize: number;
    queueSize: number;
  } {
    return {
      isReady: this.isInitialized,
      deviceCount: this.devices.length,
      activeDeviceCount: this.devices.filter((d) => d.isActive).length,
      totalLogs: this.logs.length,
      cacheSize: 0, // 캐시 크기 계산 로직 필요
      queueSize: this.processingQueue.length,
    };
  }
}

// 싱글톤 인스턴스 생성
export const taggingSystem = new TaggingSystem();

// 전역에서 사용할 수 있도록 window 객체에 추가 (개발 환경에서만)
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as any).taggingSystem = taggingSystem;
}

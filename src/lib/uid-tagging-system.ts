import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface TaggingResult {
  success: boolean;
  message: string;
  action:
    | "attendance"
    | "consultation"
    | "purchase"
    | "other"
    | "checkout"
    | "already_tagged";
  data?: any;
  showPopup?: boolean;
  popupType?:
    | "attendance_confirm"
    | "no_reservation"
    | "checkout_confirm"
    | "multiple_tag"
    | "registration";
}

export interface UIDRegistration {
  id: string;
  uid: string;
  userId?: string;
  userType: "student" | "staff" | "teacher";
  isRegistered: boolean;
  createdAt: Date;
  lastUsedAt: Date;
}

export interface TaggingLog {
  id: string;
  uid: string;
  userId?: string;
  userType: "student" | "staff" | "teacher";
  action: "attendance" | "checkout" | "consultation" | "purchase" | "other";
  timestamp: Date;
  reservationId?: string;
  pointsEarned?: number;
  notes?: string;
  deviceType: "ipad" | "mac" | "smartphone";
  location: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userType: "student" | "staff" | "teacher";
  date: Date;
  checkInTime: Date;
  checkOutTime?: Date;
  totalHours?: number;
  status: "present" | "absent" | "late";
  pointsEarned?: number;
  notes?: string;
}

class UIDTaggingSystem {
  private static instance: UIDTaggingSystem;

  private constructor() {}

  public static getInstance(): UIDTaggingSystem {
    if (!UIDTaggingSystem.instance) {
      UIDTaggingSystem.instance = new UIDTaggingSystem();
    }
    return UIDTaggingSystem.instance;
  }

  /**
   * UID 태깅 처리 메인 함수
   */
  async processTagging(
    uid: string,
    deviceType: "ipad" | "mac" | "smartphone",
    location: string,
  ): Promise<TaggingResult> {
    try {
      // 1. UID 등록 확인
      const uidRegistration = await this.getUIDRegistration(uid);

      if (!uidRegistration) {
        // 신규 UID 등록
        return this.handleNewUID(uid, deviceType, location);
      }

      // 2. 사용자 정보 확인
      if (!uidRegistration.userId) {
        return this.handleUnregisteredUser(uid, deviceType, location);
      }

      // 3. 사용자 타입에 따른 처리
      const user = await prisma.user.findUnique({
        where: { id: uidRegistration.userId },
        include: {
          student: true,
          staff: true,
          teacher: true,
        },
      });

      if (!user) {
        return {
          success: false,
          message: "사용자 정보를 찾을 수 없습니다.",
          action: "other",
        };
      }

      // 4. 사용자 타입별 처리
      switch (user.role) {
        case "STUDENT":
          return this.handleStudentTagging(uid, user, deviceType, location);
        case "STAFF":
          return this.handleStaffTagging(uid, user, deviceType, location);
        case "TEACHER":
          return this.handleTeacherTagging(uid, user, deviceType, location);
        default:
          return {
            success: false,
            message: "지원하지 않는 사용자 타입입니다.",
            action: "other",
          };
      }
    } catch (error) {
      console.error("Tagging error:", error);
      return {
        success: false,
        message: "태깅 처리 중 오류가 발생했습니다.",
        action: "other",
      };
    }
  }

  /**
   * 신규 UID 등록 처리
   */
  private async handleNewUID(
    uid: string,
    deviceType: "ipad" | "mac" | "smartphone",
    location: string,
  ): Promise<TaggingResult> {
    // UID 등록 - 임시 사용자 ID 생성
    const tempUserId = `temp_${Date.now()}`;

    await prisma.uIDTag.create({
      data: {
        uid,
        userId: tempUserId,
        tagType: "REGISTRATION",
        deviceId: null,
      },
    });

    return {
      success: true,
      message: "새로운 UID가 등록되었습니다.",
      action: "other",
      showPopup: true,
      popupType: "registration",
      data: { uid },
    };
  }

  /**
   * 미등록 사용자 처리
   */
  private async handleUnregisteredUser(
    uid: string,
    deviceType: "ipad" | "mac" | "smartphone",
    location: string,
  ): Promise<TaggingResult> {
    return {
      success: true,
      message: "사용자 정보를 등록해주세요.",
      action: "other",
      showPopup: true,
      popupType: "registration",
      data: { uid },
    };
  }

  /**
   * 학생 태깅 처리
   */
  private async handleStudentTagging(
    uid: string,
    user: any,
    deviceType: "ipad" | "mac" | "smartphone",
    location: string,
  ): Promise<TaggingResult> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. 오늘 이미 태깅했는지 확인
    const todayTagging = await prisma.taggingLog.findFirst({
      where: {
        userId: user.id,
        timestamp: {
          gte: today,
        },
        type: "ATTENDANCE",
      },
    });

    if (todayTagging) {
      return {
        success: true,
        message: "すでに本日の記録があります",
        action: "already_tagged",
      };
    }

    // 2. 오늘 예약 확인
    const todayReservation = await prisma.reservation.findFirst({
      where: {
        studentId: user.student?.id,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
        status: "CONFIRMED",
      },
      include: {
        teacher: true,
        student: true,
      },
    });

    if (todayReservation) {
      // 예약이 있는 경우
      return {
        success: true,
        message: "出席を確認 / その他",
        action: "attendance",
        showPopup: true,
        popupType: "attendance_confirm",
        data: {
          reservation: todayReservation,
          user,
        },
      };
    } else {
      // 예약이 없는 경우
      return {
        success: true,
        message: "本日の予約がありません。出席を記録しますか？",
        action: "attendance",
        showPopup: true,
        popupType: "no_reservation",
        data: { user },
      };
    }
  }

  /**
   * 직원 태깅 처리
   */
  private async handleStaffTagging(
    uid: string,
    user: any,
    deviceType: "ipad" | "mac" | "smartphone",
    location: string,
  ): Promise<TaggingResult> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 오늘의 출근 기록 확인
    const todayAttendance = await prisma.staffWorkLog.findFirst({
      where: {
        staffId: user.staff?.id,
        date: today,
      },
    });

    if (!todayAttendance) {
      // 출근 처리
      const workLog = await prisma.staffWorkLog.create({
        data: {
          staffId: user.staff?.id,
          date: today,
          startTime: new Date(),
          workTitle: "출근",
          workContent: "출근 태깅",
          workType: "OTHER",
        },
      });

      return {
        success: true,
        message: "출근이 확인되었습니다.",
        action: "attendance",
        data: { workLog },
      };
    } else {
      // 퇴근 처리
      const checkInTime = new Date(todayAttendance.startTime);
      const now = new Date();
      const timeDiff = now.getTime() - checkInTime.getTime();
      const minutesDiff = timeDiff / (1000 * 60);

      if (minutesDiff <= 30) {
        // 30분 이내 - 확인 팝업
        return {
          success: true,
          message: "퇴근하시겠습니까?",
          action: "checkout",
          showPopup: true,
          popupType: "checkout_confirm",
          data: { workLog: todayAttendance },
        };
      } else {
        // 30분 초과 - 자동 퇴근
        await prisma.staffWorkLog.update({
          where: { id: todayAttendance.id },
          data: {
            endTime: now,
            workContent: "퇴근 태깅",
          },
        });

        return {
          success: true,
          message: "퇴勤処理が完了しました",
          action: "checkout",
          data: { workLog: todayAttendance },
        };
      }
    }
  }

  /**
   * 선생님 태깅 처리
   */
  private async handleTeacherTagging(
    uid: string,
    user: any,
    deviceType: "ipad" | "mac" | "smartphone",
    location: string,
  ): Promise<TaggingResult> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 오늘의 출근 기록 확인
    const todayAttendance = await prisma.teacherAttendance.findFirst({
      where: {
        teacherId: user.teacher?.id,
        date: today,
      },
    });

    if (!todayAttendance) {
      // 출근 처리
      const attendance = await prisma.teacherAttendance.create({
        data: {
          teacherId: user.teacher?.id,
          date: today,
          checkInTime: new Date(),
          status: "PRESENT",
        },
      });

      return {
        success: true,
        message: "출근이 확인되었습니다.",
        action: "attendance",
        data: { attendance },
      };
    } else {
      // 퇴근 처리
      await prisma.teacherAttendance.update({
        where: { id: todayAttendance.id },
        data: {
          checkOutTime: new Date(),
        },
      });

      return {
        success: true,
        message: "퇴근이 확인되었습니다.",
        action: "checkout",
        data: { attendance: todayAttendance },
      };
    }
  }

  /**
   * 출석 확인 처리
   */
  async confirmAttendance(
    uid: string,
    reservationId?: string,
    points: number = 10,
  ): Promise<TaggingResult> {
    try {
      const uidRegistration = await this.getUIDRegistration(uid);
      if (!uidRegistration?.userId) {
        return {
          success: false,
          message: "등록되지 않은 UID입니다.",
          action: "other",
        };
      }

      const user = await prisma.user.findUnique({
        where: { id: uidRegistration.userId },
        include: { student: true },
      });

      if (!user) {
        return {
          success: false,
          message: "사용자 정보를 찾을 수 없습니다.",
          action: "other",
        };
      }

      // 예약 상태 업데이트
      if (reservationId) {
        await prisma.reservation.update({
          where: { id: reservationId },
          data: { status: "ATTENDED" },
        });
      }

      // 포인트 적립
      if (user.student) {
        await prisma.student.update({
          where: { id: user.student.id },
          data: {
            points: {
              increment: points,
            },
          },
        });
      }

      // 태깅 로그 생성
      await prisma.taggingLog.create({
        data: {
          userId: user.id,
          type: "ATTENDANCE",
          location: location.toString(),
          timestamp: new Date(),
        },
      });

      return {
        success: true,
        message: "출석이 확인되었습니다.",
        action: "attendance",
        data: { pointsEarned: points },
      };
    } catch (error) {
      console.error("Attendance confirmation error:", error);
      return {
        success: false,
        message: "출석 확인 중 오류가 발생했습니다.",
        action: "other",
      };
    }
  }

  /**
   * UID 등록 정보 조회
   */
  private async getUIDRegistration(
    uid: string,
  ): Promise<UIDRegistration | null> {
    const uidTag = await prisma.uIDTag.findFirst({
      where: { uid },
    });

    if (!uidTag) return null;

    return {
      id: uidTag.id,
      uid: uidTag.uid,
      userId: uidTag.userId,
      userType: "student", // 기본값
      isRegistered: uidTag.userId !== `temp_${Date.now()}`,
      createdAt: uidTag.taggedAt,
      lastUsedAt: uidTag.taggedAt,
    };
  }

  /**
   * UID와 사용자 연결
   */
  async linkUIDToUser(
    uid: string,
    userId: string,
    userType: "student" | "staff" | "teacher",
  ): Promise<boolean> {
    try {
      await prisma.uIDTag.updateMany({
        where: { uid },
        data: {
          userId,
          tagType: "CHECK_IN",
        },
      });
      return true;
    } catch (error) {
      console.error("UID linking error:", error);
      return false;
    }
  }

  /**
   * 태깅 통계 조회
   */
  async getTaggingStats(
    startDate: Date,
    endDate: Date,
    userType?: "student" | "staff" | "teacher",
    action?: string,
  ) {
    const where: any = {
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (action) where.type = action;

    const logs = await prisma.taggingLog.findMany({
      where,
      include: {
        user: {
          include: {
            student: true,
            staff: true,
            teacher: true,
          },
        },
      },
      orderBy: { timestamp: "desc" },
    });

    return logs;
  }
}

export default UIDTaggingSystem;

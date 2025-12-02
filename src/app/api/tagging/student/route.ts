import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface StudentTaggingRequest {
  uid: string;
  action: "attendance" | "visit_purpose";
  purpose?: "consultation" | "material_purchase" | "other";
  memo?: string;
}

interface StudentTaggingResponse {
  success: boolean;
  message: string;
  data?: {
    studentName: string;
    hasReservation: boolean;
    reservationTime?: string;
    pointsEarned?: number;
    attendanceRecorded: boolean;
    visitPurpose?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: StudentTaggingRequest = await request.json();

    if (!body.uid) {
      return NextResponse.json(
        { success: false, message: "UID가 필요합니다." },
        { status: 400 },
      );
    }

    // 학생 정보 조회
    const studentInfo = await getStudentInfo(body.uid);
    if (!studentInfo) {
      return NextResponse.json(
        { success: false, message: "등록되지 않은 UID입니다." },
        { status: 404 },
      );
    }

    // 오늘 이미 태깅했는지 확인
    const todayTagging = await checkTodayTagging(body.uid);
    if (todayTagging && body.action === "attendance") {
      return NextResponse.json(
        { success: false, message: "오늘 이미 출석 기록이 있습니다." },
        { status: 409 },
      );
    }

    let responseData: any = {
      studentName: studentInfo.name,
      hasReservation: studentInfo.hasReservation,
      attendanceRecorded: false,
    };

    if (body.action === "attendance") {
      // 출석 처리
      const attendanceResult = await processStudentAttendance(
        body.uid,
        studentInfo,
      );
      responseData = { ...responseData, ...attendanceResult };
    } else if (body.action === "visit_purpose") {
      // 방문 목적 처리
      const visitResult = await processVisitPurpose(
        body.uid,
        body.purpose!,
        body.memo,
      );
      responseData = { ...responseData, ...visitResult };
    }

    // 태깅 기록 저장
    await saveTaggingRecord({
      uid: body.uid,
      userType: "student",
      action: body.action,
      timestamp: new Date(),
      status: "completed",
      memo: body.memo,
    });

    return NextResponse.json({
      success: true,
      message: "학생 태깅이 성공적으로 처리되었습니다.",
      data: responseData,
    });
  } catch (error) {
    console.error("학생 태깅 오류:", error);
    return NextResponse.json(
      { success: false, message: "학생 태깅 처리 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

async function getStudentInfo(uid: string): Promise<any> {
  // 실제로는 데이터베이스에서 학생 정보 조회
  const mockStudents: { [key: string]: any } = {
    student_001: {
      uid: "student_001",
      name: "田中 花子",
      hasReservation: true,
      reservationTime: "2024-01-15 14:00",
      reservationId: "res_001",
      level: "中級",
      points: 150
    },
    student_002: {
      uid: "student_002",
      name: "鈴木 太郎",
      hasReservation: false,
      level: "初級",
      points: 80
    },
    student_003: {
      uid: "student_003",
      name: "山田 次郎",
      hasReservation: true,
      reservationTime: "2024-01-15 16:00",
      reservationId: "res_002",
      level: "上級",
      points: 320
    }
  };

  return mockStudents[uid] || null;
}

async function checkTodayTagging(uid: string): Promise<boolean> {
  // 실제로는 데이터베이스에서 오늘 태깅 기록 조회
  const today = new Date().toDateString();
  const mockTodayTaggings = [
    { uid: "student_001", date: today },
    { uid: "student_003", date: today },
  ];

  return mockTodayTaggings.some((tagging) => tagging.uid === uid);
}

async function processStudentAttendance(
  uid: string,
  studentInfo: any,
): Promise<any> {
  const result: any = {
    attendanceRecorded: true,
    pointsEarned: 0,
  };

  if (studentInfo.hasReservation) {
    // 예약이 있는 경우 - 예약 상태를 '완료'로 변경
    await updateReservationStatus(studentInfo.reservationId, "completed");

    // 포인트 적립 (예약 수업 완료)
    const pointsEarned = calculateAttendancePoints(studentInfo.level);
    await addStudentPoints(uid, pointsEarned);

    result.pointsEarned = pointsEarned;
    result.reservationTime = studentInfo.reservationTime;
  } else {
    // 예약이 없는 경우 - 일반 출석 기록
    await recordGeneralAttendance(uid);

    // 기본 포인트 적립
    const basicPoints = 10;
    await addStudentPoints(uid, basicPoints);

    result.pointsEarned = basicPoints;
  }

  return result;
}

async function processVisitPurpose(
  uid: string,
  purpose: string,
  memo?: string,
): Promise<any> {
  // 방문 목적 기록
  await recordVisitPurpose(uid, purpose, memo);

  return {
    visitPurpose: purpose,
    visitMemo: memo,
  };
}

async function updateReservationStatus(
  reservationId: string,
  status: string,
): Promise<void> {
  // 예약 상태 업데이트
  console.log(`예약 상태 업데이트: ${reservationId} -> ${status}`);
}

async function addStudentPoints(uid: string, points: number): Promise<void> {
  // 학생 포인트 적립
  console.log(`학생 포인트 적립: ${uid} +${points}포인트`);
}

async function recordGeneralAttendance(uid: string): Promise<void> {
  // 일반 출석 기록
  console.log(`일반 출석 기록: ${uid}`);
}

async function recordVisitPurpose(
  uid: string,
  purpose: string,
  memo?: string,
): Promise<void> {
  // 방문 목적 기록
  console.log(`방문 목적 기록: ${uid} - ${purpose}${memo ? ` (${memo})` : ""}`);
}

function calculateAttendancePoints(level: string): number {
  // 레벨별 포인트 계산
  const pointMap: { [key: string]: number } = {
    初級: 20,
    中級: 30,
    上級: 40,
  };

  return pointMap[level] || 20;
}

async function saveTaggingRecord(record: any): Promise<void> {
  // 태깅 기록 저장
  console.log("태깅 기록 저장:", record);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");

    if (!uid) {
      return NextResponse.json(
        { success: false, message: "UID 파라미터가 필요합니다." },
        { status: 400 },
      );
    }

    const studentInfo = await getStudentInfo(uid);
    if (!studentInfo) {
      return NextResponse.json(
        { success: false, message: "학생 정보를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    const todayTagging = await checkTodayTagging(uid);

    return NextResponse.json({
      success: true,
      data: {
        ...studentInfo,
        alreadyTaggedToday: todayTagging,
      },
    });
  } catch (error) {
    console.error("학생 정보 조회 오류:", error);
    return NextResponse.json(
      { success: false, message: "학생 정보 조회 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

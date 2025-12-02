import { NextRequest, NextResponse } from "next/server";

interface EmployeeTaggingRequest {
  uid: string;
  action: "check_in" | "check_out" | "re_check_in";
  transportationFee?: boolean;
  memo?: string;
}

interface EmployeeTaggingResponse {
  success: boolean;
  message: string;
  data?: {
    employeeName: string;
    checkInTime?: Date;
    checkOutTime?: Date;
    workHours?: number;
    transportationFee?: boolean;
    action: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: EmployeeTaggingRequest = await request.json();

    if (!body.uid) {
      return NextResponse.json(
        { success: false, message: "UID가 필요합니다." },
        { status: 400 },
      );
    }

    // 직원 정보 조회
    const employeeInfo = await getEmployeeInfo(body.uid);
    if (!employeeInfo) {
      return NextResponse.json(
        { success: false, message: "등록되지 않은 UID입니다." },
        { status: 404 },
      );
    }

    let responseData: any = {
      employeeName: employeeInfo.name,
      action: body.action,
    };

    switch (body.action) {
      case "check_in":
        const checkInResult = await processEmployeeCheckIn(
          body.uid,
          employeeInfo,
        );
        responseData = { ...responseData, ...checkInResult };
        break;

      case "check_out":
        const checkOutResult = await processEmployeeCheckOut(
          body.uid,
          employeeInfo,
        );
        responseData = { ...responseData, ...checkOutResult };
        break;

      case "re_check_in":
        const reCheckInResult = await processEmployeeReCheckIn(
          body.uid,
          employeeInfo,
          body.transportationFee,
        );
        responseData = { ...responseData, ...reCheckInResult };
        break;
    }

    // 태깅 기록 저장
    await saveTaggingRecord({
      uid: body.uid,
      userType: "employee",
      action: body.action,
      timestamp: new Date(),
      status: "completed",
      memo: body.memo,
    });

    return NextResponse.json({
      success: true,
      message: "직원 태깅이 성공적으로 처리되었습니다.",
      data: responseData,
    });
  } catch (error) {
    console.error("직원 태깅 오류:", error);
    return NextResponse.json(
      { success: false, message: "직원 태깅 처리 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

async function getEmployeeInfo(uid: string): Promise<any> {
  // 실제로는 데이터베이스에서 조회
  const mockEmployees = {
    employee_001: {
      uid: "employee_001",
      name: "田中 先生",
      department: "講師部",
      position: "講師",
      hourlyRate: 3000,
      lastCheckIn: new Date(Date.now() - 1800000), // 30분 전
      lastCheckOut: null,
    },
    employee_002: {
      uid: "employee_002",
      name: "佐藤 先生",
      department: "事務部",
      position: "事務員",
      hourlyRate: 2500,
      lastCheckIn: null,
      lastCheckOut: null,
    },
    employee_003: {
      uid: "employee_003",
      name: "高橋 先生",
      department: "講師部",
      position: "講師",
      hourlyRate: 3500,
      lastCheckIn: new Date(Date.now() - 3600000), // 1시간 전
      lastCheckOut: new Date(Date.now() - 1800000), // 30분 전
    },
  };

  return mockEmployees[uid as keyof typeof mockEmployees] || null;
}

async function processEmployeeCheckIn(
  uid: string,
  employeeInfo: any,
): Promise<any> {
  const now = new Date();

  // 출근 기록 저장
  await recordEmployeeCheckIn(uid, now);

  return {
    checkInTime: now,
    message: "출근이 기록되었습니다.",
  };
}

async function processEmployeeCheckOut(
  uid: string,
  employeeInfo: any,
): Promise<any> {
  const now = new Date();
  const checkInTime = employeeInfo.lastCheckIn;

  if (!checkInTime) {
    throw new Error("출근 기록이 없습니다.");
  }

  // 근무 시간 계산
  const workHours = calculateWorkHours(checkInTime, now);

  // 퇴근 기록 저장
  await recordEmployeeCheckOut(uid, now, workHours);

  return {
    checkOutTime: now,
    workHours: workHours,
    message: "퇴근이 기록되었습니다.",
  };
}

async function processEmployeeReCheckIn(
  uid: string,
  employeeInfo: any,
  transportationFee?: boolean,
): Promise<any> {
  const now = new Date();

  // 재출근 기록 저장
  await recordEmployeeReCheckIn(uid, now, transportationFee);

  return {
    checkInTime: now,
    transportationFee: transportationFee,
    message: "재출근이 기록되었습니다.",
  };
}

async function recordEmployeeCheckIn(
  uid: string,
  checkInTime: Date,
): Promise<void> {
  // 출근 기록 저장
  console.log(`직원 출근 기록: ${uid} at ${checkInTime.toISOString()}`);
}

async function recordEmployeeCheckOut(
  uid: string,
  checkOutTime: Date,
  workHours: number,
): Promise<void> {
  // 퇴근 기록 저장
  console.log(
    `직원 퇴근 기록: ${uid} at ${checkOutTime.toISOString()}, 근무시간: ${workHours}시간`,
  );
}

async function recordEmployeeReCheckIn(
  uid: string,
  checkInTime: Date,
  transportationFee?: boolean,
): Promise<void> {
  // 재출근 기록 저장
  console.log(
    `직원 재출근 기록: ${uid} at ${checkInTime.toISOString()}, 교통비: ${transportationFee ? "청구" : "미청구"}`,
  );
}

function calculateWorkHours(checkInTime: Date, checkOutTime: Date): number {
  const diffMs = checkOutTime.getTime() - checkInTime.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return Math.round(diffHours * 100) / 100; // 소수점 2자리까지
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

    const employeeInfo = await getEmployeeInfo(uid);
    if (!employeeInfo) {
      return NextResponse.json(
        { success: false, message: "직원 정보를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 오늘 근태 상태 확인
    const today = new Date();
    const todayCheckIn =
      employeeInfo.lastCheckIn && isSameDay(employeeInfo.lastCheckIn, today);
    const todayCheckOut =
      employeeInfo.lastCheckOut && isSameDay(employeeInfo.lastCheckOut, today);

    return NextResponse.json({
      success: true,
      data: {
        ...employeeInfo,
        todayCheckIn,
        todayCheckOut,
        canCheckOut: todayCheckIn && !todayCheckOut,
        canReCheckIn: todayCheckOut,
      },
    });
  } catch (error) {
    console.error("직원 정보 조회 오류:", error);
    return NextResponse.json(
      { success: false, message: "직원 정보 조회 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

function isSameDay(date1: Date, date2: Date): boolean {
  return date1.toDateString() === date2.toDateString();
}

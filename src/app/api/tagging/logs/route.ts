import { NextRequest, NextResponse } from 'next/server';

interface TaggingLog {
  id: string;
  uid: string;
  userName: string;
  userType: 'student' | 'employee';
  action: string;
  timestamp: Date;
  status: string;
  memo?: string;
  deviceId?: string;
  location?: string;
}

interface TaggingLogsResponse {
  success: boolean;
  message: string;
  data?: {
    logs: TaggingLog[];
    total: number;
    page: number;
    limit: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const userType = searchParams.get('userType');
    const uid = searchParams.get('uid');
    const date = searchParams.get('date');
    const action = searchParams.get('action');

    // 태깅 로그 조회
    const logs = await getTaggingLogs({
      page,
      limit,
      userType: userType as 'student' | 'employee' | undefined,
      uid: uid || undefined,
      date: date || undefined,
      action: action || undefined
    });

    return NextResponse.json({
      success: true,
      data: {
        logs: logs.logs,
        total: logs.total,
        page,
        limit
      }
    });

  } catch (error) {
    console.error('태깅 로그 조회 오류:', error);
    return NextResponse.json(
      { success: false, message: '태깅 로그 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

interface GetTaggingLogsParams {
  page: number;
  limit: number;
  userType?: 'student' | 'employee';
  uid?: string;
  date?: string;
  action?: string;
}

async function getTaggingLogs(params: GetTaggingLogsParams): Promise<{ logs: TaggingLog[]; total: number }> {
  // 실제로는 데이터베이스에서 조회
  const mockLogs: TaggingLog[] = [
    {
      id: 'log_001',
      uid: 'student_001',
      userName: '田中 花子',
      userType: 'student',
      action: 'attendance',
      timestamp: new Date(Date.now() - 3600000), // 1시간 전
      status: 'completed',
      deviceId: 'device_001',
      location: 'A동 101호'
    },
    {
      id: 'log_002',
      uid: 'student_002',
      userName: '鈴木 太郎',
      userType: 'student',
      action: 'visit_purpose',
      timestamp: new Date(Date.now() - 7200000), // 2시간 전
      status: 'completed',
      memo: '相談',
      deviceId: 'device_001',
      location: 'A동 101호'
    },
    {
      id: 'log_003',
      uid: 'employee_001',
      userName: '田中 先生',
      userType: 'employee',
      action: 'check_in',
      timestamp: new Date(Date.now() - 1800000), // 30분 전
      status: 'completed',
      deviceId: 'device_001',
      location: 'A동 101호'
    },
    {
      id: 'log_004',
      uid: 'employee_002',
      userName: '佐藤 先生',
      userType: 'employee',
      action: 'check_out',
      timestamp: new Date(Date.now() - 900000), // 15분 전
      status: 'completed',
      deviceId: 'device_001',
      location: 'A동 101호'
    },
    {
      id: 'log_005',
      uid: 'student_003',
      userName: '山田 次郎',
      userType: 'student',
      action: 'attendance',
      timestamp: new Date(Date.now() - 5400000), // 1.5시간 전
      status: 'completed',
      deviceId: 'device_001',
      location: 'A동 101호'
    }
  ];

  // 필터링 적용
  let filteredLogs = mockLogs;

  if (params.userType) {
    filteredLogs = filteredLogs.filter(log => log.userType === params.userType);
  }

  if (params.uid) {
    filteredLogs = filteredLogs.filter(log => log.uid === params.uid);
  }

  if (params.date) {
    const targetDate = new Date(params.date);
    filteredLogs = filteredLogs.filter(log => 
      isSameDay(new Date(log.timestamp), targetDate)
    );
  }

  if (params.action) {
    filteredLogs = filteredLogs.filter(log => log.action === params.action);
  }

  // 정렬 (최신순)
  filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // 페이징 적용
  const startIndex = (params.page - 1) * params.limit;
  const endIndex = startIndex + params.limit;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  return {
    logs: paginatedLogs,
    total: filteredLogs.length
  };
}

function isSameDay(date1: Date, date2: Date): boolean {
  return date1.toDateString() === date2.toDateString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, userType, action, memo, deviceId, location } = body;

    if (!uid || !userType || !action) {
      return NextResponse.json(
        { success: false, message: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 태깅 로그 저장
    const logId = await saveTaggingLog({
      uid,
      userType,
      action,
      timestamp: new Date(),
      status: 'completed',
      memo,
      deviceId,
      location
    });

    return NextResponse.json({
      success: true,
      message: '태깅 로그가 저장되었습니다.',
      data: { logId }
    });

  } catch (error) {
    console.error('태깅 로그 저장 오류:', error);
    return NextResponse.json(
      { success: false, message: '태깅 로그 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

async function saveTaggingLog(logData: any): Promise<string> {
  // 실제로는 데이터베이스에 저장
  console.log('태깅 로그 저장:', logData);
  
  return `log_${Date.now()}`;
} 
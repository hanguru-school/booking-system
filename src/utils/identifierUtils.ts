import { StudentIdentifierData } from "@/types/student";

// 고유 식별자 생성
export function generateUniqueIdentifier(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomStr}`.toUpperCase();
}

// QR코드 데이터 생성
export function generateQRCodeData(studentData: StudentIdentifierData): string {
  const data = {
    type: "student_identifier",
    studentId: studentData.studentId,
    identifierCode: studentData.identifierCode,
    timestamp: new Date().toISOString(),
    version: "1.0",
  };

  return JSON.stringify(data);
}

// QR코드 데이터 검증
export function validateQRCodeData(qrData: string): {
  isValid: boolean;
  data?: StudentIdentifierData;
  error?: string;
} {
  try {
    const parsed = JSON.parse(qrData);

    if (parsed.type !== "student_identifier") {
      return { isValid: false, error: "유효하지 않은 QR코드 타입입니다." };
    }

    if (!parsed.studentId || !parsed.identifierCode) {
      return { isValid: false, error: "QR코드에 필수 정보가 누락되었습니다." };
    }

    // 실제로는 여기서 데이터베이스에서 학생 정보를 조회해야 함
    const mockStudentData: StudentIdentifierData = {
      studentId: parsed.studentId,
      studentName: "김학생",
      studentEmail: "student@example.com",
      department: "일본어학과",
      currentLevel: "중급 B",
      points: 1250,
      completedClasses: 20,
      identifierCode: parsed.identifierCode,
      createdAt: new Date(),
    };

    return { isValid: true, data: mockStudentData };
  } catch (error) {
    return { isValid: false, error: "QR코드 데이터 형식이 올바르지 않습니다." };
  }
}

// 학생 ID 검증
export function validateStudentId(studentId: string): boolean {
  // 학생 ID 형식 검증 (예: 숫자 8자리)
  const studentIdRegex = /^\d{8}$/;
  return studentIdRegex.test(studentId);
}

// 식별자 코드 검증
export function validateIdentifierCode(code: string): boolean {
  // 식별자 코드 형식 검증 (예: 영문+숫자 12자리)
  const identifierRegex = /^[A-Z0-9]{12}$/;
  return identifierRegex.test(code);
}

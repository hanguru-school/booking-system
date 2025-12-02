/**
 * localStorage 데이터를 데이터베이스로 마이그레이션하는 유틸리티
 */

import prisma from "@/lib/prisma";

interface EnrollmentData {
  nameKanji?: string;
  nameYomigana?: string;
  email?: string;
  phone?: string;
  birthYear?: string;
  birthMonth?: string;
  birthDay?: string;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
  emergencyContactEmail?: string;
}

interface AgreementData {
  signatureDate?: string;
  studentName?: string;
  [key: string]: any;
}

/**
 * localStorage의 enrollmentData를 데이터베이스로 마이그레이션
 */
export async function migrateEnrollmentData(
  enrollmentData: EnrollmentData,
  userId?: string
) {
  try {
    // 이미 등록된 학생인지 확인
    if (enrollmentData.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: enrollmentData.email },
        include: { student: true },
      });

      if (existingUser?.student) {
        // 이미 등록된 경우 업데이트
        return await prisma.student.update({
          where: { id: existingUser.student.id },
          data: {
            emergencyContactNameKanji: enrollmentData.emergencyContactName,
            emergencyContactRelation: enrollmentData.emergencyContactRelation,
            emergencyContactPhone: enrollmentData.emergencyContactPhone,
            emergencyContactEmail: enrollmentData.emergencyContactEmail,
          },
        });
      }
    }

    // 새로 등록하는 경우는 register API를 통해 처리
    return null;
  } catch (error) {
    console.error("입회 데이터 마이그레이션 오류:", error);
    throw error;
  }
}

/**
 * localStorage의 agreementData를 데이터베이스로 마이그레이션
 */
export async function migrateAgreementData(
  agreementData: AgreementData,
  studentId: string
) {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new Error("학생을 찾을 수 없습니다.");
    }

    return await prisma.student.update({
      where: { id: studentId },
      data: {
        agreementData: agreementData as any,
        rulesAgreed: true,
        rulesAgreedAt: agreementData.signatureDate
          ? new Date(agreementData.signatureDate)
          : new Date(),
      },
    });
  } catch (error) {
    console.error("동의서 데이터 마이그레이션 오류:", error);
    throw error;
  }
}

/**
 * 사용자 설정을 데이터베이스로 마이그레이션
 */
export async function migrateUserPreferences(
  userId: string,
  preferences: {
    language?: string;
    theme?: string;
    [key: string]: any;
  }
) {
  try {
    return await prisma.userPreferences.upsert({
      where: { userId },
      update: {
        language: preferences.language || undefined,
        theme: preferences.theme || undefined,
        preferences: preferences as any,
      },
      create: {
        userId,
        language: preferences.language || "ko",
        theme: preferences.theme || "light",
        preferences: preferences as any,
      },
    });
  } catch (error) {
    console.error("사용자 설정 마이그레이션 오류:", error);
    throw error;
  }
}

/**
 * 모든 localStorage 데이터를 데이터베이스로 마이그레이션
 */
export async function migrateAllLocalStorageData(userId: string) {
  try {
    if (typeof window === "undefined") {
      return { success: false, message: "브라우저 환경에서만 실행 가능합니다." };
    }

    const results: any = {};

    // 언어 설정 마이그레이션
    const language = localStorage.getItem("language");
    if (language) {
      results.preferences = await migrateUserPreferences(userId, { language });
    }

    // 약관 동의 마이그레이션
    const termsAgreed = localStorage.getItem("termsAgreed");
    if (termsAgreed) {
      // 약관 동의는 별도 모델이 없으므로 사용자 메타데이터에 저장
      // 필요시 별도 모델 생성 가능
    }

    return {
      success: true,
      message: "마이그레이션이 완료되었습니다.",
      results,
    };
  } catch (error) {
    console.error("전체 마이그레이션 오류:", error);
    return {
      success: false,
      message: "마이그레이션 중 오류가 발생했습니다.",
      error,
    };
  }
}




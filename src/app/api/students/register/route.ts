import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, EnrollmentStatus, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const prisma = new PrismaClient();

// 학생 ID 생성 함수
function generateStudentId(birthDate: string, phone: string): string {
  const date = new Date(birthDate);
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  // 전화번호 마지막 4자리
  const phoneLast4 = phone.slice(-4);
  
  return `${year}${month}${day}${phoneLast4}`;
}

// 초기 비밀번호 생성 (전화번호 마지막 4자리)
function generateInitialPassword(phone: string): string {
  return phone.slice(-4);
}

const OFFLINE_STORE_PATH = path.join(process.cwd(), 'data', 'offline-students.json');

function isConnectionError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes('P1001') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('getaddrinfo ENOTFOUND'))
  );
}

async function saveOfflineStudent(entry: any) {
  await fs.mkdir(path.dirname(OFFLINE_STORE_PATH), { recursive: true });

  try {
    const current = await fs.readFile(OFFLINE_STORE_PATH, 'utf-8');
    const parsed = JSON.parse(current);
    parsed.push(entry);
    await fs.writeFile(OFFLINE_STORE_PATH, JSON.stringify(parsed, null, 2), 'utf-8');
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(OFFLINE_STORE_PATH, JSON.stringify([entry], null, 2), 'utf-8');
    } else {
      throw error;
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      agreementData,
      signatureData,
      studentId: providedStudentId,
      email,
      nameKanji,
      nameYomigana,
      phone,
      birthDate,
      emergencyContactName,
      emergencyContactYomigana,
      emergencyContactRelation,
      emergencyContactPhone,
      emergencyContactEmail
    } = body;

    if (
      !nameKanji ||
      !nameYomigana ||
      !birthDate ||
      !phone ||
      !email ||
      !emergencyContactName ||
      !emergencyContactRelation ||
      !emergencyContactPhone ||
      !signatureData
    ) {
      return NextResponse.json(
        { error: '필수 입력값이 누락되었습니다.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    let parsedAgreementData: any = agreementData ?? null;
    if (typeof parsedAgreementData === 'string') {
      try {
        parsedAgreementData = JSON.parse(parsedAgreementData);
      } catch {
        parsedAgreementData = null;
      }
    }

    // 미성년자 여부 계산 (18세 이하)
    let isMinor = false;
    if (birthDate) {
      const birth = new Date(birthDate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      isMinor = age <= 18;
    }

    // 학생 ID 생성
    const studentId = providedStudentId?.trim()?.length
      ? providedStudentId.trim()
      : generateStudentId(birthDate, phone);
    const initialPassword = generateInitialPassword(phone);

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(initialPassword, 10);

    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '이미 등록된 이메일입니다.' },
        { status: 409 }
      );
    }

    if (studentId) {
      const existingStudentId = await prisma.student.findUnique({
        where: { studentId }
      });

      if (existingStudentId) {
        return NextResponse.json(
          { error: '이미 사용 중인 학생 ID입니다. 다시 시도해주세요.' },
          { status: 409 }
        );
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          name: nameKanji,
          phone,
          role: UserRole.STUDENT
        }
      });

      // 입회 신청 시 입력한 모든 원본 데이터를 JSON으로 저장
      const enrollmentFormData = {
        nameKanji,
        nameYomigana,
        birthDate,
        phone,
        email: normalizedEmail,
        emergencyContactName,
        emergencyContactYomigana: emergencyContactYomigana || null,
        emergencyContactRelation,
        emergencyContactPhone,
        emergencyContactEmail: emergencyContactEmail || null,
        submittedAt: new Date().toISOString(),
        isMinor
      };

      const student = await tx.student.create({
        data: {
          userId: user.id,
          name: nameKanji,
          kanjiName: nameKanji,
          yomigana: nameYomigana,
          phone,
          birthDate: birthDate ? new Date(birthDate) : null,
          email: normalizedEmail,
          studentId,
          isMinor,
          // 긴급연락처 정보 (성인용)
          emergencyContact: emergencyContactName,
          emergencyRelation: emergencyContactRelation,
          emergencyContactNameKanji: emergencyContactName,
          emergencyContactNameYomigana: emergencyContactYomigana || null,
          emergencyContactRelation,
          emergencyContactPhone,
          emergencyContactEmail: emergencyContactEmail || null,
          // 보호자 정보 (미성년자용 - 긴급연락처와 동일한 경우)
          ...(isMinor ? {
            parentNameKanji: emergencyContactName,
            parentNameYomigana: emergencyContactYomigana || null,
            parentPhone: emergencyContactPhone,
            parentRelation: emergencyContactRelation
          } : {}),
          // 입회 동의 관련
          rulesAgreed: true,
          rulesAgreedAt: parsedAgreementData?.signatureDate
            ? new Date(parsedAgreementData.signatureDate)
            : new Date(),
          signatureData: signatureData || null,
          // agreementData에 원본 입회 신청 데이터도 포함
          agreementData: {
            ...(parsedAgreementData || {}),
            enrollmentFormData
          },
          enrollmentStatus: EnrollmentStatus.COMPLETED,
          isFirstLogin: true
        }
      });

      return { user, student };
    });

    // 입회 알림 생성
    try {
      await prisma.adminNotification.create({
        data: {
          type: 'NEW_ENROLLMENT',
          title: '새로운 입회 신청',
          message: `${nameKanji}(${nameYomigana})님이 입회 신청을 완료했습니다.`,
          status: 'UNREAD',
          data: {
            priority: 'high',
            studentId: result.student.id,
            studentName: nameKanji,
            studentYomigana: nameYomigana,
            studentEmail: normalizedEmail,
          },
        },
      });
    } catch (notificationError) {
      console.error('입회 알림 생성 오류:', notificationError);
      // 알림 생성 실패해도 입회는 성공 처리
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { 
        id: result.student.id, 
        studentId: result.student.studentId, 
        role: 'STUDENT' 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // 응답 데이터 (비밀번호 제외)
    const responseData = {
      student: {
        id: result.student.id,
        studentId: result.student.studentId,
        nameKanji: result.student.kanjiName,
        nameYomigana: result.student.yomigana,
        birthDate: result.student.birthDate,
        phone: result.student.phone,
        email: result.student.email,
        emergencyContactName: result.student.emergencyContactNameKanji,
        emergencyContactYomigana: result.student.emergencyContactNameYomigana,
        emergencyContactRelation: result.student.emergencyContactRelation,
        emergencyContactPhone: result.student.emergencyContactPhone,
        emergencyContactEmail: result.student.emergencyContactEmail,
        isFirstLogin: result.student.isFirstLogin
      },
      token: token,
      initialPassword: initialPassword
    };

    return NextResponse.json(responseData, { status: 201 });

  } catch (error) {
    if (isConnectionError(error)) {
      const offlineUserId = crypto.randomUUID();
      const offlineStudentId = crypto.randomUUID();

      const normalizedStudentId = generateStudentId(birthDate, phone);

      // 미성년자 여부 계산 (오프라인 모드)
      let isMinor = false;
      if (birthDate) {
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          age--;
        }
        isMinor = age <= 18;
      }

      // 입회 신청 시 입력한 모든 원본 데이터
      const enrollmentFormData = {
        nameKanji,
        nameYomigana,
        birthDate,
        phone,
        email: normalizedEmail,
        emergencyContactName,
        emergencyContactYomigana: emergencyContactYomigana || null,
        emergencyContactRelation,
        emergencyContactPhone,
        emergencyContactEmail: emergencyContactEmail || null,
        submittedAt: new Date().toISOString(),
        isMinor
      };

      const offlineEntry = {
        savedAt: new Date().toISOString(),
        source: 'offline-local',
        student: {
          id: offlineStudentId,
          userId: offlineUserId,
          studentId: studentId || normalizedStudentId,
          nameKanji,
          nameYomigana,
          birthDate,
          phone,
          email: normalizedEmail,
          isMinor,
          emergencyContactName,
          emergencyContactNameKanji: emergencyContactName,
          emergencyContactNameYomigana: emergencyContactYomigana || null,
          emergencyContactRelation,
          emergencyContactPhone,
          emergencyContactEmail: emergencyContactEmail || null,
          // 미성년자인 경우 보호자 정보도 저장
          ...(isMinor ? {
            parentNameKanji: emergencyContactName,
            parentNameYomigana: emergencyContactYomigana || null,
            parentPhone: emergencyContactPhone,
            parentRelation: emergencyContactRelation
          } : {}),
          signatureData,
          agreementData: {
            ...(parsedAgreementData || {}),
            enrollmentFormData
          }
        },
        initialPassword
      };

      await saveOfflineStudent(offlineEntry);

      const offlineToken = jwt.sign(
        {
          id: offlineStudentId,
          studentId: offlineEntry.student.studentId,
          role: 'STUDENT'
        },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      return NextResponse.json(
        {
          student: {
            id: offlineStudentId,
            studentId: offlineEntry.student.studentId,
            nameKanji,
            nameYomigana,
            birthDate,
            phone,
            email: normalizedEmail,
            emergencyContactName,
            emergencyContactYomigana,
            emergencyContactRelation,
            emergencyContactPhone,
            emergencyContactEmail: emergencyContactEmail || null,
            isFirstLogin: true,
            offline: true
          },
          token: offlineToken,
          initialPassword,
          offline: true
        },
        { status: 201 }
      );
    }

    console.error('학생 등록 오류:', error);

    // Prisma 오류 처리
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: '이미 등록된 학생입니다. 학생 ID나 이메일이 중복됩니다.' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: '학생 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
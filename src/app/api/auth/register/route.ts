import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    console.log("입회 API 시작");
    
    const {
      email,
      password,
      kanjiName,
      yomigana,
      koreanName,
      phone,
      role = "STUDENT",
      studentEmail,
      birthDate,
      address,
      emergencyContact,
    } = await request.json();

    // 필수 필드 검증
    if (!email || !password || !kanjiName || !yomigana) {
      return NextResponse.json(
        { 
          success: false,
          message: "이메일, 비밀번호, 한자 이름, 요미가나를 모두 입력해주세요.",
          error: "MISSING_REQUIRED_FIELDS"
        },
        { status: 400 },
      );
    }

    // 비밀번호 강도 검증
    if (password.length < 6) {
      return NextResponse.json(
        { 
          success: false,
          message: "비밀번호는 최소 6자 이상이어야 합니다.",
          error: "WEAK_PASSWORD"
        },
        { status: 400 },
      );
    }

    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { 
          success: false,
          message: "이미 존재하는 이메일입니다.",
          error: "EMAIL_ALREADY_EXISTS"
        },
        { status: 409 },
      );
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 학부모인 경우 학생 확인
    if (role === "PARENT" && studentEmail) {
      const student = await prisma.user.findUnique({
        where: { email: studentEmail.toLowerCase() },
        include: { student: true },
      });

      if (!student || !student.student) {
        return NextResponse.json(
          { 
            success: false,
            message: "해당 이메일의 학생을 찾을 수 없습니다.",
            error: "STUDENT_NOT_FOUND"
          },
          { status: 404 },
        );
      }
    }

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: kanjiName,
        phone,
        role: role as any,
      },
    });

    console.log(`사용자 생성 완료: ${user.email} (${user.role})`);

    // 역할에 따른 추가 데이터 생성
    if (role === "STUDENT") {
      await prisma.student.create({
        data: {
          userId: user.id,
          name: kanjiName,
          kanjiName,
          yomigana,
          koreanName: koreanName || null,
          phone: phone || null,
          birthDate: birthDate || null,
          address: address || null,
          emergencyContact: emergencyContact || null,
          level: "초급 A",
          points: 0,
          status: "ACTIVE",
          registrationDate: new Date(),
        },
      });
      console.log("학생 프로필 생성 완료");
    } else if (role === "TEACHER") {
      await prisma.teacher.create({
        data: {
          userId: user.id,
          name: kanjiName,
          kanjiName,
          yomigana,
          koreanName: koreanName || null,
          phone: phone || null,
          birthDate: birthDate || null,
          address: address || null,
          emergencyContact: emergencyContact || null,
          subjects: ["한국어"],
          hourlyRate: 30000,
          status: "PENDING", // 관리자 승인 대기
          hireDate: new Date(),
        },
      });
      console.log("선생님 프로필 생성 완료 (승인 대기)");
    } else if (role === "STAFF") {
      await prisma.staff.create({
        data: {
          userId: user.id,
          name: kanjiName,
          kanjiName,
          yomigana,
          koreanName: koreanName || null,
          phone: phone || null,
          birthDate: birthDate || null,
          address: address || null,
          emergencyContact: emergencyContact || null,
          position: "사무직원",
          status: "PENDING", // 관리자 승인 대기
          hireDate: new Date(),
        },
      });
      console.log("직원 프로필 생성 완료 (승인 대기)");
    } else if (role === "PARENT") {
      // 학부모인 경우 학생과 연결
      const student = await prisma.user.findUnique({
        where: { email: studentEmail.toLowerCase() },
        include: { student: true },
      });

      if (student && student.student) {
        await prisma.parent.create({
          data: {
            userId: user.id,
            name: kanjiName,
            kanjiName,
            yomigana,
            koreanName: koreanName || null,
            phone: phone || null,
            birthDate: birthDate || null,
            address: address || null,
            emergencyContact: emergencyContact || null,
            studentId: student.student.id,
            status: "ACTIVE",
            registrationDate: new Date(),
          },
        });
        console.log("학부모 프로필 생성 완료");
      }
    }

    // 관리자에게 새 사용자 등록 알림 생성
    if (role !== "ADMIN") {
      await prisma.adminNotification.create({
        data: {
          type: "NEW_USER_REGISTRATION",
          title: `새로운 ${getRoleDisplayName(role)} 등록`,
          message: `${kanjiName} (${email})님이 ${getRoleDisplayName(role)}으로 등록했습니다.`,
          status: "UNREAD",
          data: {
            userId: user.id,
            userEmail: email,
            userName: kanjiName,
            userRole: role,
          },
        },
      });
      console.log("관리자 알림 생성 완료");
    }

    // 자동 로그인을 위한 세션 설정
    const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const cookieStore = await cookies();
    
    cookieStore.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7일
    });

    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    cookieStore.set("user", JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7일
    });

    console.log("입회 완료:", {
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionToken: sessionToken.substring(0, 20) + "..."
    });

    return NextResponse.json({
      success: true,
      message: "입회가 완료되었습니다.",
      user: userData,
      redirectUrl: getRedirectUrlByRole(user.role)
    });
  } catch (error) {
    console.error("입회 오류:", error);
    return NextResponse.json(
      { 
        success: false,
        message: "입회 중 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : "UNKNOWN_ERROR"
      },
      { status: 500 },
    );
  }
}

// 역할 표시 이름 반환 함수
function getRoleDisplayName(role: string): string {
  switch (role) {
    case "STUDENT": return "학생";
    case "TEACHER": return "선생님";
    case "STAFF": return "직원";
    case "PARENT": return "학부모";
    case "ADMIN": return "관리자";
    default: return "사용자";
  }
}

// 사용자 역할에 따른 리다이렉트 URL 반환 함수
function getRedirectUrlByRole(role: string): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "TEACHER":
      return "/teacher";
    case "STUDENT":
      return "/student";
    case "PARENT":
      return "/parent";
    case "STAFF":
      return "/staff";
    default:
      return "/admin";
  }
}

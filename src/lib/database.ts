import bcrypt from "bcryptjs";
import prisma from "./prisma";
import { UserRole } from "@prisma/client";

// 사용자 인증 함수
export async function authenticateUser(email: string, password: string) {
  try {
    console.log("사용자 인증 시도:", email);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log("사용자를 찾을 수 없음:", email);
      return null;
    }

    // 비밀번호 검증
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      console.log("비밀번호가 일치하지 않음:", email);
      return null;
    }

    console.log("사용자 인증 성공:", email, user.role);

    // 비밀번호 제거 후 반환
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error("사용자 인증 오류:", error);
    throw error;
  }
}

// 사용자 생성 함수
export async function createUser(userData: {
  email: string;
  name: string;
  password: string;
  role: UserRole;
}) {
  try {
    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        role: userData.role as UserRole,
      },
    });

    // 비밀번호 제거 후 반환
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error("사용자 생성 오류:", error);
    throw error;
  }
}

// 사용자 ID로 조회 함수
export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    // 비밀번호 제거 후 반환
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error("사용자 조회 오류:", error);
    throw error;
  }
}

// 데이터베이스 연결 종료 함수
export async function closeDatabase() {
  try {
    await prisma.$disconnect();
    console.log("데이터베이스 연결이 종료되었습니다.");
  } catch (error) {
    console.error("데이터베이스 연결 종료 오류:", error);
  }
}

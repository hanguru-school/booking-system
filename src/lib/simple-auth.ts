import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { databaseService } from "./aws-rds";

// JWT 시크릿 키
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// 간단한 인증 서비스 클래스
export class SimpleAuthService {
  // 사용자 로그인
  async signIn(email: string, password: string) {
    try {
      // 데이터베이스에서 사용자 조회
      let user = await databaseService.getUserByEmail(email);

      // 사용자가 없으면 자동 생성 (관리자 계정인 경우)
      if (!user && email === "hanguru.school@gmail.com") {
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await databaseService.createUser({
          email: "hanguru.school@gmail.com",
          name: "관리자",
          role: "admin",
          cognitoUserId: "simple_admin_001",
          passwordHash: hashedPassword,
        });
        console.log("관리자 사용자가 자동 생성되었습니다:", user.email);
      }

      if (!user) {
        return {
          success: false,
          message: "사용자를 찾을 수 없습니다.",
        };
      }

      // 비밀번호 검증 (bcrypt 사용)
      const isValidPassword = await bcrypt.compare(
        password,
        user.password_hash || "",
      );

      if (!isValidPassword) {
        return {
          success: false,
          message: "비밀번호가 올바르지 않습니다.",
        };
      }

      // JWT 토큰 생성
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: "24h" },
      );

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      };
    } catch (error) {
      console.error("Simple auth signin error:", error);
      return {
        success: false,
        message: "로그인 중 오류가 발생했습니다.",
      };
    }
  }

  // 사용자 등록
  async signUp(email: string, password: string, name: string, role: string) {
    try {
      // 기존 사용자 확인
      const existingUser = await databaseService.getUserByEmail(email);

      if (existingUser) {
        return {
          success: false,
          message: "이미 존재하는 이메일입니다.",
        };
      }

      // 비밀번호 해시화
      const hashedPassword = await bcrypt.hash(password, 10);

      // 사용자 생성
      const user = await databaseService.createUser({
        email,
        name,
        role,
        cognitoUserId: `simple_${Date.now()}`,
        passwordHash: hashedPassword,
      });

      // JWT 토큰 생성
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: "24h" },
      );

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      };
    } catch (error) {
      console.error("Simple auth signup error:", error);
      return {
        success: false,
        message: "회원가입 중 오류가 발생했습니다.",
      };
    }
  }

  // 토큰 검증
  async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      // 데이터베이스에서 사용자 확인
      const user = await databaseService.getUserById(decoded.userId);

      if (!user) {
        return {
          success: false,
          message: "사용자를 찾을 수 없습니다.",
        };
      }

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    } catch (error) {
      console.error("Simple auth token verification error:", error);
      return {
        success: false,
        message: "토큰이 유효하지 않습니다.",
      };
    }
  }
}

// 싱글톤 인스턴스
export const simpleAuthService = new SimpleAuthService();

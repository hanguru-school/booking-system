const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log("관리자 사용자 생성 시작...");

    // 기존 관리자 확인
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: "ADMIN",
      },
    });

    if (existingAdmin) {
      console.log("기존 관리자 사용자가 존재합니다:");
      console.log(`이메일: ${existingAdmin.email}`);
      console.log(`이름: ${existingAdmin.name}`);
      console.log(`역할: ${existingAdmin.role}`);
      return;
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // 관리자 사용자 생성
    const adminUser = await prisma.user.create({
      data: {
        email: "admin@hanguru.school",
        name: "시스템 관리자",
        password: hashedPassword,
        role: "ADMIN",
        phone: "010-0000-0000",
      },
    });

    // Admin 레코드 생성
    await prisma.admin.create({
      data: {
        userId: adminUser.id,
        name: "시스템 관리자",
        kanjiName: "システム管理者",
        yomigana: "システムかんりしゃ",
        koreanName: "시스템 관리자",
        phone: "010-0000-0000",
        permissions: {
          canManageUsers: true,
          canManageSystem: true,
          canViewAnalytics: true,
          canManageSettings: true,
        },
      },
    });

    console.log("관리자 사용자가 성공적으로 생성되었습니다!");
    console.log("로그인 정보:");
    console.log(`이메일: ${adminUser.email}`);
    console.log(`비밀번호: admin123`);
    console.log(`역할: ${adminUser.role}`);
  } catch (error) {
    console.error("관리자 사용자 생성 오류:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();

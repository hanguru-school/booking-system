const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createTestAdmin() {
  try {
    console.log("테스트 관리자 계정을 생성합니다...");

    // 기존 테스트 관리자 확인
    const existingAdmin = await prisma.user.findFirst({
      where: {
        email: "admin@test.com",
      },
    });

    if (existingAdmin) {
      console.log("테스트 관리자 계정이 이미 존재합니다.");
      return;
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash("admin1234", 12);

    // 테스트 관리자 생성 (승인 대기 상태)
    const testAdmin = await prisma.user.create({
      data: {
        email: "admin@test.com",
        name: "管理者太郎 (かんりしゃたろう) / 관리자",
        password: hashedPassword,
        role: "ADMIN",
        phone: "090-1111-2222",
        admin: {
          create: {
            name: "管理者太郎 (かんりしゃたろう) / 관리자",
            kanjiName: "管理者太郎",
            yomigana: "かんりしゃたろう",
            koreanName: "관리자",
            phone: "090-1111-2222",
            permissions: {
              userManagement: true,
              systemSettings: true,
              adminApproval: false,
            },
            isApproved: false, // 승인 대기 상태
          },
        },
      },
      include: {
        admin: true,
      },
    });

    console.log("테스트 관리자 계정이 성공적으로 생성되었습니다.");
    console.log("이메일: admin@test.com");
    console.log("비밀번호: admin1234");
    console.log("현재 승인 대기 상태입니다.");
    console.log(
      "마스터 관리자(master@malmoi.com)로 로그인하여 승인할 수 있습니다.",
    );
  } catch (error) {
    console.error("테스트 관리자 생성 중 오류가 발생했습니다:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestAdmin();

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createTestStudent() {
  try {
    console.log("테스트 학생 계정을 생성합니다...");

    // 기존 테스트 학생 확인
    const existingStudent = await prisma.user.findFirst({
      where: {
        email: "student@test.com",
      },
    });

    if (existingStudent) {
      console.log("테스트 학생 계정이 이미 존재합니다.");
      return;
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash("student1234", 12);

    // 테스트 학생 생성
    const testStudent = await prisma.user.create({
      data: {
        email: "student@test.com",
        name: "田中太郎 (たなかたろう) / 홍길동",
        password: hashedPassword,
        role: "STUDENT",
        phone: "090-1234-5678",
        student: {
          create: {
            name: "田中太郎 (たなかたろう) / 홍길동",
            kanjiName: "田中太郎",
            yomigana: "たなかたろう",
            koreanName: "홍길동",
            phone: "090-1234-5678",
            level: "초급 A",
            points: 0,
          },
        },
      },
      include: {
        student: true,
      },
    });

    console.log("테스트 학생 계정이 성공적으로 생성되었습니다.");
    console.log("이메일: student@test.com");
    console.log("비밀번호: student1234");
    console.log("이 계정으로 로그인하여 학생 페이지를 테스트할 수 있습니다.");
  } catch (error) {
    console.error("테스트 학생 생성 중 오류가 발생했습니다:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestStudent();

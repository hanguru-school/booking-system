const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createTestParent() {
  try {
    console.log("테스트 학부모 계정을 생성합니다...");

    // 기존 테스트 학부모 확인
    const existingParent = await prisma.user.findFirst({
      where: {
        email: "parent@test.com",
      },
    });

    if (existingParent) {
      console.log("테스트 학부모 계정이 이미 존재합니다.");
      return;
    }

    // 학생 계정 찾기
    const student = await prisma.user.findFirst({
      where: {
        email: "student@test.com",
      },
      include: {
        student: true,
      },
    });

    if (!student || !student.student) {
      console.log("먼저 학생 계정을 생성해주세요.");
      return;
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash("parent1234", 12);

    // 테스트 학부모 생성
    const testParent = await prisma.user.create({
      data: {
        email: "parent@test.com",
        name: "田中花子 (たなかはなこ) / 홍길순",
        password: hashedPassword,
        role: "PARENT",
        phone: "090-8765-4321",
        parent: {
          create: {
            name: "田中花子 (たなかはなこ) / 홍길순",
            kanjiName: "田中花子",
            yomigana: "たなかはなこ",
            koreanName: "홍길순",
            phone: "090-8765-4321",
            studentId: student.student.id,
          },
        },
      },
      include: {
        parent: true,
      },
    });

    console.log("테스트 학부모 계정이 성공적으로 생성되었습니다.");
    console.log("이메일: parent@test.com");
    console.log("비밀번호: parent1234");
    console.log("학생과 연동된 학부모 계정입니다.");
    console.log("이 계정으로 로그인하여 학부모 페이지를 테스트할 수 있습니다.");
  } catch (error) {
    console.error("테스트 학부모 생성 중 오류가 발생했습니다:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestParent();

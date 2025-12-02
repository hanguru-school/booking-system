const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// 학번 생성 함수 (YYMMDDXXHH 형식)
async function generateStudentId() {
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2); // YY
  const month = String(now.getMonth() + 1).padStart(2, '0'); // MM
  const day = String(now.getDate()).padStart(2, '0'); // DD
  const hour = String(now.getHours()).padStart(2, '0'); // HH
  const datePrefix = `${year}${month}${day}`; // YYMMDD

  // 해당 일의 마지막 학번 찾기
  const lastStudent = await prisma.student.findFirst({
    where: {
      studentId: {
        startsWith: datePrefix,
      },
    },
    orderBy: {
      studentId: 'desc',
    },
  });

  let sequence = 1;
  if (lastStudent && lastStudent.studentId) {
    // YYMMDDXXHH 형식에서 XX 부분 추출 (인덱스 6, 7)
    const lastSequence = parseInt(lastStudent.studentId.substring(6, 8));
    sequence = lastSequence + 1;
  }

  // YYMMDDXXHH 형식으로 생성
  return `${datePrefix}${String(sequence).padStart(2, '0')}${hour}`;
}

// 초기 비밀번호 생성 (핸드폰 번호 뒤 4자리)
function generateInitialPassword(phone) {
  // 핸드폰 번호에서 숫자만 추출
  const phoneDigits = phone.replace(/\D/g, '');
  // 뒤 4자리 반환
  return phoneDigits.slice(-4);
}

async function createTestStudentWithStudentId() {
  try {
    console.log("학번이 포함된 테스트 학생 계정을 생성합니다...");

    // 기존 테스트 학생 확인
    const existingStudent = await prisma.user.findFirst({
      where: {
        email: "test@student.com",
      },
    });

    if (existingStudent) {
      console.log("테스트 학생 계정이 이미 존재합니다.");
      console.log("이메일: test@student.com");
      if (existingStudent.student) {
        console.log(`학번: ${existingStudent.student.studentId}`);
      }
      return;
    }

    // 학번 생성
    const studentId = await generateStudentId();
    console.log(`생성된 학번: ${studentId}`);

    // 핸드폰 번호와 초기 비밀번호
    const phone = "090-1234-5678";
    const initialPassword = generateInitialPassword(phone);
    console.log(`핸드폰 번호: ${phone}`);
    console.log(`초기 비밀번호: ${initialPassword}`);

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(initialPassword, 12);

    // 테스트 학생 생성
    const testStudent = await prisma.user.create({
      data: {
        email: "test@student.com",
        name: "테스트 학생",
        password: hashedPassword,
        role: "STUDENT",
        phone: phone,
        student: {
          create: {
            studentId: studentId,
            name: "테스트 학생",
            kanjiName: "田中太郎",
            yomigana: "たなかたろう",
            koreanName: "홍길동",
            phone: phone,
            level: "초급 A",
            points: 0,
            enrollmentStatus: "COMPLETED",
          },
        },
      },
      include: {
        student: true,
      },
    });

    console.log("\n✅ 테스트 학생 계정이 성공적으로 생성되었습니다!");
    console.log("📧 이메일: test@student.com");
    console.log(`🎓 학번: ${studentId}`);
    console.log(`🔑 초기 비밀번호: ${initialPassword}`);
    console.log("\n📝 로그인 방법:");
    console.log("1. 이메일로 로그인: test@student.com + 5678");
    console.log(`2. 학번으로 로그인: ${studentId} + 5678`);
    console.log("\n🌐 로그인 페이지: http://localhost:3004/auth/login");

  } catch (error) {
    console.error("테스트 학생 생성 중 오류가 발생했습니다:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestStudentWithStudentId();

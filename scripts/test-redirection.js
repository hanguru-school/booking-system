const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function testRoleRedirection() {
  console.log("=== 역할별 리디렉션 테스트 시작 ===\n");

  try {
    // 1. 데이터베이스 연결 확인
    console.log("1. 데이터베이스 연결 확인");
    await prisma.$connect();
    console.log("✅ 데이터베이스 연결 성공\n");

    // 2. 각 역할별 테스트 사용자 생성
    console.log("2. 역할별 테스트 사용자 생성");

    const testUsers = [
      {
        email: "test-student@hanguru.school",
        name: "테스트 학생",
        role: "STUDENT",
        password: "test123",
      },
      {
        email: "test-admin@hanguru.school",
        name: "테스트 관리자",
        role: "ADMIN",
        password: "test123",
      },
      {
        email: "test-teacher@hanguru.school",
        name: "테스트 선생님",
        role: "TEACHER",
        password: "test123",
      },
      {
        email: "test-staff@hanguru.school",
        name: "테스트 직원",
        role: "STAFF",
        password: "test123",
      },
    ];

    const createdUsers = [];

    for (const userData of testUsers) {
      // 기존 사용자 확인
      let user = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (!user) {
        console.log(`${userData.role} 사용자 생성 중...`);
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        user = await prisma.user.create({
          data: {
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            role: userData.role,
            phone: "010-1234-5678",
          },
        });

        // 역할별 프로필 생성
        if (userData.role === "STUDENT") {
          await prisma.student.create({
            data: {
              userId: user.id,
              name: userData.name,
              kanjiName: "テスト学生",
              yomigana: "てすとがくせい",
              koreanName: userData.name,
              phone: "010-1234-5678",
              level: "초급 A",
              points: 0,
              joinDate: new Date(),
            },
          });
        } else if (userData.role === "TEACHER") {
          await prisma.teacher.create({
            data: {
              userId: user.id,
              name: userData.name,
              kanjiName: "テスト講師",
              yomigana: "てすとこうし",
              koreanName: userData.name,
              phone: "010-1234-5678",
              subjects: ["일본어"],
              hourlyRate: 30000,
            },
          });
        } else if (userData.role === "STAFF") {
          await prisma.staff.create({
            data: {
              userId: user.id,
              name: userData.name,
              kanjiName: "テスト職員",
              yomigana: "てすとしょくいん",
              koreanName: userData.name,
              phone: "010-1234-5678",
              position: "직원",
              permissions: {},
            },
          });
        } else if (userData.role === "ADMIN") {
          await prisma.admin.create({
            data: {
              userId: user.id,
              name: userData.name,
              kanjiName: "テスト管理者",
              yomigana: "てすとかんりしゃ",
              koreanName: userData.name,
              phone: "010-1234-5678",
              permissions: {},
              isApproved: true,
            },
          });
        }

        console.log(`✅ ${userData.role} 사용자 생성 완료:`, user.email);
      } else {
        console.log(`✅ ${userData.role} 사용자 이미 존재:`, user.email);
      }

      createdUsers.push({
        ...userData,
        id: user.id,
      });
    }

    console.log("");

    // 3. 역할별 리디렉션 경로 확인
    console.log("3. 역할별 리디렉션 경로 확인");

    const roleRedirects = {
      STUDENT: "/student/dashboard",
      ADMIN: "/admin/dashboard",
      TEACHER: "/teacher/dashboard",
      STAFF: "/staff/home",
    };

    for (const [role, expectedPath] of Object.entries(roleRedirects)) {
      console.log(`${role}: ${expectedPath}`);
    }

    console.log("");

    // 4. 테스트 계정 정보 출력
    console.log("4. 테스트 계정 정보");
    console.log("🌐 프로덕션 URL: https://app.hanguru.school");
    console.log("📝 테스트 계정들:");

    for (const user of createdUsers) {
      console.log(
        `   - ${user.role}: ${user.email} (비밀번호: ${user.password})`,
      );
    }

    console.log("");
    console.log("5. 테스트 방법");
    console.log("1. 위 계정들로 로그인 시도");
    console.log("2. 각 역할에 맞는 대시보드로 리디렉션되는지 확인");
    console.log('3. 콘솔에서 "사용자 역할:" 로그 확인');
    console.log("");

    // 5. 최종 상태 요약
    console.log("6. 최종 상태 요약");
    const userCount = await prisma.user.count();
    const studentCount = await prisma.student.count();
    const teacherCount = await prisma.teacher.count();
    const staffCount = await prisma.staff.count();
    const adminCount = await prisma.admin.count();

    console.log("📊 사용자 현황:");
    console.log(`- 총 사용자: ${userCount}명`);
    console.log(`- 학생: ${studentCount}명`);
    console.log(`- 선생님: ${teacherCount}명`);
    console.log(`- 직원: ${staffCount}명`);
    console.log(`- 관리자: ${adminCount}명`);

    console.log("");
    console.log("✅ 역할별 리디렉션 테스트 준비 완료!");
    console.log(
      "🚀 이제 각 역할별로 로그인하여 올바른 대시보드로 이동하는지 확인하세요.",
    );
  } catch (error) {
    console.error("❌ 역할별 리디렉션 테스트 오류:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  testRoleRedirection()
    .then(() => {
      console.log("\n🎉 역할별 리디렉션 테스트 완료!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 역할별 리디렉션 테스트 실패:", error);
      process.exit(1);
    });
}

module.exports = { testRoleRedirection };

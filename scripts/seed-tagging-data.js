const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function seedTaggingData() {
  try {
    console.log("태깅 시스템 테스트 데이터 생성 시작...");

    // 1. 테스트 사용자 생성
    const testUsers = [
      {
        email: "teacher1@test.com",
        name: "김선생님",
        password: "password123",
        role: "TEACHER",
        uid: "TEACHER001",
        teacher: {
          create: {
            name: "김선생님",
            kanjiName: "キムセンセイ",
            yomigana: "キムセンセイ",
            koreanName: "김선생님",
            phone: "010-1234-5678",
            subjects: ["일본어", "회화"],
            hourlyRate: 30000,
            colorCode: "#3B82F6",
            availableDays: ["월", "화", "수", "목", "금"],
            availableTimeSlots: ["09:00-10:00", "10:00-11:00", "14:00-15:00"],
            isActive: true,
          },
        },
      },
      {
        email: "staff1@test.com",
        name: "박직원",
        password: "password123",
        role: "STAFF",
        uid: "STAFF001",
        staff: {
          create: {
            name: "박직원",
            kanjiName: "パクジョクウォン",
            yomigana: "パクジョクウォン",
            koreanName: "박직원",
            phone: "010-2345-6789",
            position: "사무직원",
            permissions: {},
          },
        },
      },
      {
        email: "student1@test.com",
        name: "이학생",
        password: "password123",
        role: "STUDENT",
        uid: "STUDENT001",
        student: {
          create: {
            name: "이학생",
            kanjiName: "イガクセイ",
            yomigana: "イガクセイ",
            koreanName: "이학생",
            phone: "010-3456-7890",
            level: "초급 A",
            points: 50,
          },
        },
      },
      {
        email: "student2@test.com",
        name: "최학생",
        password: "password123",
        role: "STUDENT",
        uid: "STUDENT002",
        student: {
          create: {
            name: "최학생",
            kanjiName: "チェガクセイ",
            yomigana: "チェガクセイ",
            koreanName: "최학생",
            phone: "010-4567-8901",
            level: "중급 B",
            points: 120,
          },
        },
      },
    ];

    // 사용자 생성
    const createdUsers = [];
    for (const userData of testUsers) {
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: userData,
        include: {
          teacher: true,
          staff: true,
          student: true,
        },
      });
      createdUsers.push(user);
      console.log(`사용자 생성: ${user.name} (${user.role})`);
    }

    // 2. 테스트 예약 생성 (선생님과 학생이 있는 경우)
    const teacher = createdUsers.find((u) => u.teacher);
    const student1 = createdUsers.find(
      (u) => u.student && u.email === "student1@test.com",
    );
    const student2 = createdUsers.find(
      (u) => u.student && u.email === "student2@test.com",
    );

    if (teacher && student1) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // 오늘 예약
      await prisma.reservation.create({
        data: {
          studentId: student1.student.id,
          teacherId: teacher.teacher.id,
          date: today,
          startTime: "10:00",
          endTime: "11:00",
          status: "CONFIRMED",
          location: "ONLINE",
          notes: "테스트 예약",
        },
      });

      // 내일 예약
      await prisma.reservation.create({
        data: {
          studentId: student2.student.id,
          teacherId: teacher.teacher.id,
          date: tomorrow,
          startTime: "14:00",
          endTime: "15:00",
          status: "CONFIRMED",
          location: "ONLINE",
          notes: "테스트 예약 2",
        },
      });

      console.log("테스트 예약 생성 완료");
    }

    // 3. UID 디바이스 등록
    const uidDevices = [
      {
        userId: createdUsers.find((u) => u.teacher)?.id,
        uid: "TEACHER001",
        deviceType: "ic_card",
      },
      {
        userId: createdUsers.find((u) => u.staff)?.id,
        uid: "STAFF001",
        deviceType: "ic_card",
      },
      {
        userId: createdUsers.find(
          (u) => u.student && u.email === "student1@test.com",
        )?.id,
        uid: "STUDENT001",
        deviceType: "ic_card",
      },
      {
        userId: createdUsers.find(
          (u) => u.student && u.email === "student2@test.com",
        )?.id,
        uid: "STUDENT002",
        deviceType: "ic_card",
      },
    ];

    for (const deviceData of uidDevices) {
      if (deviceData.userId) {
        // 기존 UID가 있는지 확인
        const existingDevice = await prisma.uIDDevice.findFirst({
          where: { uid: deviceData.uid },
        });

        if (!existingDevice) {
          await prisma.uIDDevice.create({
            data: deviceData,
          });
          console.log(`UID 디바이스 등록: ${deviceData.uid}`);
        } else {
          console.log(`UID 디바이스 이미 존재: ${deviceData.uid}`);
        }
      }
    }

    // 4. 테스트 태깅 로그 생성
    const createdDevices = await prisma.uIDDevice.findMany();

    const testTags = [
      {
        userId: createdUsers.find((u) => u.teacher)?.id,
        uid: "TEACHER001",
        tagType: "attendance",
        deviceId: createdDevices.find((d) => d.uid === "TEACHER001")?.id,
      },
      {
        userId: createdUsers.find((u) => u.staff)?.id,
        uid: "STAFF001",
        tagType: "attendance",
        deviceId: createdDevices.find((d) => d.uid === "STAFF001")?.id,
      },
      {
        userId: createdUsers.find(
          (u) => u.student && u.email === "student1@test.com",
        )?.id,
        uid: "STUDENT001",
        tagType: "attendance",
        deviceId: createdDevices.find((d) => d.uid === "STUDENT001")?.id,
      },
    ];

    for (const tagData of testTags) {
      if (tagData.userId && tagData.deviceId) {
        await prisma.uIDTag.create({
          data: {
            ...tagData,
            taggedAt: new Date(),
          },
        });
        console.log(`태깅 로그 생성: ${tagData.uid}`);
      }
    }

    console.log("태깅 시스템 테스트 데이터 생성 완료!");
    console.log("\n테스트용 UID:");
    console.log("- TEACHER001 (선생님)");
    console.log("- STAFF001 (직원)");
    console.log("- STUDENT001 (학생 1)");
    console.log("- STUDENT002 (학생 2)");
  } catch (error) {
    console.error("테스트 데이터 생성 중 오류:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTaggingData();

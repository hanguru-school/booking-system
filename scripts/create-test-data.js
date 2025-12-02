const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestData() {
  try {
    console.log('테스트 데이터 생성 시작...');

    // 1. 테스트 학생 생성
    const testStudents = [
      {
        name: '김민수',
        kanjiName: '金民秀',
        yomigana: 'きみんしゅ',
        koreanName: '김민수',
        phone: '010-1234-5678',
        level: '초급 A',
        email: 'kim.test@hanguru.com',
      },
      {
        name: '박지영',
        kanjiName: '朴智英',
        yomigana: 'ぱくじよん',
        koreanName: '박지영',
        phone: '010-2345-6789',
        level: '중급 B',
        email: 'park.test@hanguru.com',
      },
      {
        name: '이준호',
        kanjiName: '李俊浩',
        yomigana: 'りじゅんほ',
        koreanName: '이준호',
        phone: '010-3456-7890',
        level: '고급 C',
        email: 'lee.test@hanguru.com',
      },
    ];

    const createdStudents = [];

    for (const studentData of testStudents) {
      // 사용자 생성
      const hashedPassword = await bcrypt.hash('password123', 12);
      const user = await prisma.user.create({
        data: {
          email: studentData.email,
          name: studentData.name,
          password: hashedPassword,
          role: 'STUDENT',
        },
      });

      // 학생 프로필 생성
      const student = await prisma.student.create({
        data: {
          userId: user.id,
          name: studentData.name,
          kanjiName: studentData.kanjiName,
          yomigana: studentData.yomigana,
          koreanName: studentData.koreanName,
          phone: studentData.phone,
          level: studentData.level,
          status: 'ACTIVE',
        },
      });

      createdStudents.push(student);
      console.log(`학생 생성 완료: ${studentData.name}`);
    }

    // 2. 테스트 선생님 생성
    const testTeachers = [
      {
        name: '이선생님',
        kanjiName: '李先生',
        yomigana: 'りせんせい',
        koreanName: '이선생님',
        phone: '010-1111-2222',
        email: 'teacher.lee.test@hanguru.com',
      },
      {
        name: '김선생님',
        kanjiName: '金先生',
        yomigana: 'きむせんせい',
        koreanName: '김선생님',
        phone: '010-3333-4444',
        email: 'teacher.kim.test@hanguru.com',
      },
    ];

    const createdTeachers = [];

    for (const teacherData of testTeachers) {
      // 사용자 생성
      const hashedPassword = await bcrypt.hash('password123', 12);
      const user = await prisma.user.create({
        data: {
          email: teacherData.email,
          name: teacherData.name,
          password: hashedPassword,
          role: 'TEACHER',
        },
      });

      // 선생님 프로필 생성
      const teacher = await prisma.teacher.create({
        data: {
          userId: user.id,
          name: teacherData.name,
          kanjiName: teacherData.kanjiName,
          yomigana: teacherData.yomigana,
          koreanName: teacherData.koreanName,
          phone: teacherData.phone,
          status: 'ACTIVE',
          isActive: true,
        },
      });

      createdTeachers.push(teacher);
      console.log(`선생님 생성 완료: ${teacherData.name}`);
    }

    // 3. 테스트 예약 생성
    const testReservations = [
      {
        studentId: createdStudents[0].id,
        teacherId: createdTeachers[0].id,
        lessonType: '수학 기초',
        date: new Date('2024-01-15'),
        startTime: new Date('2024-01-15T14:00:00'),
        endTime: new Date('2024-01-15T15:00:00'),
        duration: 60,
        status: 'ATTENDED',
        price: 50000,
        notes: '기초 수학 개념 정리',
      },
      {
        studentId: createdStudents[1].id,
        teacherId: createdTeachers[1].id,
        lessonType: '영어 회화',
        date: new Date('2024-01-16'),
        startTime: new Date('2024-01-16T16:00:00'),
        endTime: new Date('2024-01-16T17:30:00'),
        duration: 90,
        status: 'ATTENDED',
        price: 75000,
        notes: '일상 회화 연습',
      },
      {
        studentId: createdStudents[2].id,
        teacherId: createdTeachers[0].id,
        lessonType: '과학 실험',
        date: new Date('2024-01-17'),
        startTime: new Date('2024-01-17T10:00:00'),
        endTime: new Date('2024-01-17T12:00:00'),
        duration: 120,
        status: 'PENDING',
        price: 100000,
        notes: '화학 실험 준비',
      },
    ];

    for (const reservationData of testReservations) {
      const reservation = await prisma.reservation.create({
        data: reservationData,
      });
      console.log(`예약 생성 완료: ${reservationData.lessonType}`);
    }

    console.log('테스트 데이터 생성 완료!');
  } catch (error) {
    console.error('테스트 데이터 생성 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData(); 
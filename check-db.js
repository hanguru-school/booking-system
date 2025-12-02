const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    const userCount = await prisma.user.count();
    const studentCount = await prisma.student.count();
    
    console.log('✅ 데이터베이스 연결 성공!');
    console.log(`현재 사용자 수: ${userCount}`);
    console.log(`현재 학생 수: ${studentCount}`);
    
    if (studentCount > 0) {
      const lastStudent = await prisma.student.findFirst({
        orderBy: { createdAt: 'desc' },
        include: { user: true }
      });
      console.log(`\n최근 등록된 학생:`);
      console.log(`  - 이름: ${lastStudent.kanjiName}`);
      console.log(`  - 학번: ${lastStudent.studentId}`);
      console.log(`  - 등록일: ${lastStudent.createdAt}`);
    }
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkDatabase();




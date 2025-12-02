const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createNewMasterAdmin() {
  try {
    console.log('새로운 마스터 관리자 생성 시작...');
    
    // 1. 기존 관리자 계정들 확인
    const existingAdmins = await prisma.user.findMany({
      where: { 
        role: 'ADMIN'
      },
      include: {
        admin: true
      }
    });
    
    console.log(`기존 관리자 계정 ${existingAdmins.length}개 발견`);
    
    // 2. 기존 관리자 계정들 삭제
    for (const admin of existingAdmins) {
      console.log(`기존 관리자 계정 삭제: ${admin.email}`);
      
      // Admin 프로필 삭제
      if (admin.admin) {
        await prisma.admin.delete({
          where: { id: admin.admin.id }
        });
      }
      
      // User 계정 삭제
      await prisma.user.delete({
        where: { id: admin.id }
      });
    }
    
    console.log('기존 관리자 계정들 초기화 완료');
    
    // 3. 새로운 마스터 관리자 생성
    const hashedPassword = await bcrypt.hash('gtbtyj', 10);
    
    // 관리자 사용자 생성
    const user = await prisma.user.create({
      data: {
        email: 'hanguru.school@gmail.com',
        password: hashedPassword,
        name: '마스터 관리자',
        role: 'ADMIN',
      },
    });
    
    // 관리자 프로필 생성
    const admin = await prisma.admin.create({
      data: {
        userId: user.id,
        name: '마스터 관리자',
        kanjiName: 'マスター管理者',
        yomigana: 'ますたーかんりしゃ',
        koreanName: '마스터 관리자',
        phone: '010-0000-0000',
        permissions: {
          all: true,
          userManagement: true,
          reservationManagement: true,
          teacherManagement: true,
          studentManagement: true,
          paymentManagement: true,
          systemSettings: true,
          masterAccess: true,
        },
        isApproved: true,
      },
    });
    
    console.log('새로운 마스터 관리자 생성 완료!');
    console.log('이메일: hanguru.school@gmail.com');
    console.log('비밀번호: gtbtyj');
    console.log('관리자 ID:', admin.id);
    console.log('사용자 ID:', user.id);
    
    // 4. 생성된 계정 정보 출력
    console.log('\n=== 마스터 관리자 계정 정보 ===');
    console.log('이메일: hanguru.school@gmail.com');
    console.log('비밀번호: gtbtyj');
    console.log('역할: ADMIN (마스터)');
    console.log('승인 상태: 승인됨');
    console.log('모든 권한: 활성화');
    console.log('==============================');
    
  } catch (error) {
    console.error('마스터 관리자 생성 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createNewMasterAdmin(); 
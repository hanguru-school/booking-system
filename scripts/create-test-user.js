const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('테스트 사용자 생성 시작...');
    
    // 기존 사용자 확인
    const existingUser = await prisma.user.findUnique({
      where: { email: 'hanguru.school@gmail.com' }
    });
    
    if (existingUser) {
      console.log('사용자가 이미 존재합니다:', existingUser.email);
      return;
    }
    
    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash('gtbtyj', 10);
    
    // 관리자 사용자 생성
    const user = await prisma.user.create({
      data: {
        email: 'hanguru.school@gmail.com',
        password: hashedPassword,
        name: '테스트 관리자',
        role: 'ADMIN',
        admin: {
          create: {
            permissions: ['ALL'],
            isActive: true
          }
        }
      },
      include: {
        admin: true
      }
    });
    
    console.log('테스트 사용자 생성 완료:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });
    
  } catch (error) {
    console.error('사용자 생성 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();

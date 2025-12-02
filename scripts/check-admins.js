const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmins() {
  try {
    console.log('현재 데이터베이스의 관리자 목록을 확인합니다...\n');
    
    const admins = await prisma.user.findMany({
      where: {
        role: 'ADMIN'
      },
      include: {
        admin: true
      }
    });

    console.log(`총 ${admins.length}명의 관리자가 있습니다:\n`);
    
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name} (${admin.email})`);
      console.log(`   - User ID: ${admin.id}`);
      console.log(`   - Role: ${admin.role}`);
      console.log(`   - Created: ${admin.createdAt}`);
      
      if (admin.admin) {
        console.log(`   - Admin ID: ${admin.admin.id}`);
        console.log(`   - Approved: ${admin.admin.isApproved}`);
        console.log(`   - Permissions:`, admin.admin.permissions);
      } else {
        console.log(`   - Admin profile: 없음`);
      }
      console.log('');
    });

  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmins(); 
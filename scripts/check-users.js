const { Pool } = require("pg");

// 데이터베이스 연결 설정
const pool = new Pool({
  host:
    process.env.AWS_RDS_HOST ||
    "malmoi-system-db-tokyo.crooggsemeim.ap-northeast-1.rds.amazonaws.com",
  port: parseInt(process.env.AWS_RDS_PORT || "5432"),
  database: process.env.AWS_RDS_DATABASE || "malmoi_system",
  user: process.env.AWS_RDS_USERNAME || "malmoi_admin",
  password: process.env.AWS_RDS_PASSWORD || "malmoi_admin_password_2024",
  ssl: { rejectUnauthorized: false },
});

async function checkUsers() {
  try {
    console.log("=== 데이터베이스 사용자 정보 확인 ===\n");

    // 모든 사용자 조회
    const usersResult = await pool.query(
      'SELECT * FROM users ORDER BY "createdAt" DESC',
    );

    console.log(`총 ${usersResult.rows.length}명의 사용자가 있습니다:\n`);

    for (const user of usersResult.rows) {
      console.log(`ID: ${user.id}`);
      console.log(`이메일: ${user.email}`);
      console.log(`이름: ${user.name}`);
      console.log(`역할: ${user.role}`);
      console.log(`전화번호: ${user.phone}`);
      console.log(`가입일: ${user.createdAt}`);
      console.log("---");

      // 역할별 추가 정보 확인
      if (user.role === "STUDENT") {
        const studentResult = await pool.query(
          'SELECT * FROM students WHERE "userId" = $1',
          [user.id],
        );
        if (studentResult.rows.length > 0) {
          const student = studentResult.rows[0];
          console.log(`  학생 정보:`);
          console.log(`    한자이름: ${student.kanjiName}`);
          console.log(`    요미가나: ${student.yomigana}`);
          console.log(`    한글이름: ${student.koreanName}`);
          console.log(`    레벨: ${student.level}`);
          console.log(`    포인트: ${student.points}`);
        }
      } else if (user.role === "ADMIN") {
        const adminResult = await pool.query(
          'SELECT * FROM admins WHERE "userId" = $1',
          [user.id],
        );
        if (adminResult.rows.length > 0) {
          const admin = adminResult.rows[0];
          console.log(`  관리자 정보:`);
          console.log(`    한자이름: ${admin.kanjiName}`);
          console.log(`    요미가나: ${admin.yomigana}`);
          console.log(`    한글이름: ${admin.koreanName}`);
          console.log(`    승인상태: ${admin.isApproved}`);
        }
      }
      console.log("\n");
    }
  } catch (error) {
    console.error("사용자 정보 확인 오류:", error);
  } finally {
    await pool.end();
  }
}

checkUsers();

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

async function deleteUser(email) {
  try {
    console.log(`=== 사용자 삭제 시작: ${email} ===\n`);

    // 사용자 조회
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );

    if (userResult.rows.length === 0) {
      console.log(`사용자를 찾을 수 없습니다: ${email}`);
      return;
    }

    const user = userResult.rows[0];
    console.log(`삭제할 사용자 정보:`);
    console.log(`- ID: ${user.id}`);
    console.log(`- 이메일: ${user.email}`);
    console.log(`- 이름: ${user.name}`);
    console.log(`- 역할: ${user.role}`);

    // 사용자 삭제 (연관 데이터는 CASCADE로 자동 삭제)
    await pool.query("DELETE FROM users WHERE email = $1", [email]);

    console.log(`\n✅ 사용자가 성공적으로 삭제되었습니다: ${email}`);
  } catch (error) {
    console.error("사용자 삭제 오류:", error);
  } finally {
    await pool.end();
  }
}

// 명령행 인수에서 이메일 가져오기
const email = process.argv[2];

if (!email) {
  console.error("사용법: node scripts/delete-user.js <email>");
  console.error("예시: node scripts/delete-user.js hp9419@gmail.com");
  process.exit(1);
}

deleteUser(email);

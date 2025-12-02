const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

// 데이터베이스 연결 설정
const pool = new Pool({
  host:
    process.env.AWS_RDS_HOST ||
    "malmoi-system-db.cp4q8o4akkqg.ap-northeast-2.rds.amazonaws.com",
  port: parseInt(process.env.AWS_RDS_PORT || "5432"),
  database: process.env.AWS_RDS_DATABASE || "malmoi_system",
  user: process.env.AWS_RDS_USERNAME || "malmoi_admin",
  password: process.env.AWS_RDS_PASSWORD || "malmoi_admin_password_2024",
  ssl: { rejectUnauthorized: false },
});

async function createAdminUser() {
  try {
    // 기존 관리자 계정 확인
    const existingAdminResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      ["admin@hanguru.school"],
    );

    if (existingAdminResult.rows.length > 0) {
      console.log(
        "관리자 계정이 이미 존재합니다:",
        existingAdminResult.rows[0].email,
      );
      return;
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // 관리자 계정 생성
    const adminUserResult = await pool.query(
      "INSERT INTO users (email, name, password, role, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *",
      ["admin@hanguru.school", "관리자", hashedPassword, "ADMIN"],
    );

    const adminUser = adminUserResult.rows[0];
    console.log("관리자 계정이 생성되었습니다:", adminUser.email);
    console.log("이메일: admin@hanguru.school");
    console.log("비밀번호: admin123");
  } catch (error) {
    console.error("관리자 계정 생성 오류:", error);
  } finally {
    await pool.end();
  }
}

createAdminUser();

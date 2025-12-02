const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

// 간단한 ID 생성 함수
function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

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

async function createTestUsers() {
  try {
    console.log("=== 테스트 사용자 생성 시작 ===");

    // 테스트 사용자 데이터
    const testUsers = [
      {
        email: "hp9419@gmail.com",
        name: "테스트 학생",
        password: "gtbtyj",
        role: "STUDENT",
        phone: "010-1234-5678",
      },
      {
        email: "admin@hanguru.school",
        name: "관리자",
        password: "admin123",
        role: "ADMIN",
        phone: "010-0000-0000",
      },
      {
        email: "teacher@hanguru.school",
        name: "테스트 선생님",
        password: "teacher123",
        role: "TEACHER",
        phone: "010-1111-1111",
      },
      {
        email: "staff@hanguru.school",
        name: "테스트 직원",
        password: "staff123",
        role: "STAFF",
        phone: "010-2222-2222",
      },
    ];

    for (const userData of testUsers) {
      // 기존 사용자 확인
      const existingUserResult = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [userData.email],
      );

      if (existingUserResult.rows.length > 0) {
        console.log(`사용자가 이미 존재합니다: ${userData.email}`);
        continue;
      }

      // 비밀번호 해시화
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // 사용자 ID 생성
      const userId = generateId("user");

      // 사용자 생성
      const userResult = await pool.query(
        'INSERT INTO users (id, email, name, password, role, phone, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *',
        [
          userId,
          userData.email,
          userData.name,
          hashedPassword,
          userData.role,
          userData.phone,
        ],
      );

      const user = userResult.rows[0];
      console.log(`사용자가 생성되었습니다: ${user.email} (${user.role})`);

      // 역할별 추가 정보 생성
      if (userData.role === "STUDENT") {
        const studentId = generateId("student");
        await pool.query(
          'INSERT INTO students (id, "userId", name, "kanjiName", yomigana, "koreanName", phone, level, points, "joinDate", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW(), NOW())',
          [
            studentId,
            user.id,
            userData.name,
            "テスト学生",
            "テストガクセイ",
            "테스트학생",
            userData.phone,
            "초급 A",
            0,
          ],
        );
        console.log(`  - 학생 정보 생성 완료`);
      } else if (userData.role === "ADMIN") {
        const adminId = generateId("admin");
        await pool.query(
          'INSERT INTO admins (id, "userId", name, "kanjiName", yomigana, "koreanName", phone, permissions, "isApproved", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())',
          [
            adminId,
            user.id,
            userData.name,
            "管理者",
            "カンリシャ",
            "관리자",
            userData.phone,
            '{"all": true}',
            true,
          ],
        );
        console.log(`  - 관리자 정보 생성 완료`);
      } else if (userData.role === "TEACHER") {
        const teacherId = generateId("teacher");
        await pool.query(
          'INSERT INTO teachers (id, "userId", name, "kanjiName", yomigana, "koreanName", phone, subjects, "hourlyRate", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())',
          [
            teacherId,
            user.id,
            userData.name,
            "テスト先生",
            "テストセンセイ",
            "테스트선생님",
            userData.phone,
            ["한국어"],
            30000,
          ],
        );
        console.log(`  - 선생님 정보 생성 완료`);
      } else if (userData.role === "STAFF") {
        const staffId = generateId("staff");
        await pool.query(
          'INSERT INTO staff (id, "userId", name, "kanjiName", yomigana, "koreanName", phone, position, permissions, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())',
          [
            staffId,
            user.id,
            userData.name,
            "テスト職員",
            "テストショクイン",
            "테스트직원",
            userData.phone,
            "일반직원",
            '{"basic": true}',
          ],
        );
        console.log(`  - 직원 정보 생성 완료`);
      }
    }

    console.log("\n=== 테스트 사용자 생성 완료 ===");
    console.log("생성된 계정 정보:");
    console.log("- 학생: hp9419@gmail.com / gtbtyj");
    console.log("- 관리자: admin@hanguru.school / admin123");
    console.log("- 선생님: teacher@hanguru.school / teacher123");
    console.log("- 직원: staff@hanguru.school / staff123");
  } catch (error) {
    console.error("테스트 사용자 생성 오류:", error);
  } finally {
    await pool.end();
  }
}

createTestUsers();

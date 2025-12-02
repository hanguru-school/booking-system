const { Pool } = require("pg");

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

async function checkReservations() {
  try {
    console.log("=== 예약 데이터 확인 ===\n");

    // 예약 데이터 조회
    const reservationsResult = await pool.query(
      'SELECT * FROM reservations ORDER BY "createdAt" DESC LIMIT 10',
    );
    console.log(`현재 예약 데이터 수: ${reservationsResult.rows.length}`);

    if (reservationsResult.rows.length > 0) {
      console.log("\n최근 예약 데이터:");
      reservationsResult.rows.forEach((reservation, index) => {
        console.log(`${index + 1}. ID: ${reservation.id}`);
        console.log(`   날짜: ${reservation.date}`);
        console.log(
          `   시간: ${reservation.startTime} ~ ${reservation.endTime}`,
        );
        console.log(`   상태: ${reservation.status}`);
        console.log(`   학생 ID: ${reservation.studentId}`);
        console.log(`   강사 ID: ${reservation.teacherId}`);
        console.log("   ---");
      });
    } else {
      console.log("예약 데이터가 없습니다.");
    }

    // 학생 데이터 확인
    const studentsResult = await pool.query("SELECT * FROM students LIMIT 5");
    console.log(`\n학생 데이터 수: ${studentsResult.rows.length}`);

    if (studentsResult.rows.length > 0) {
      console.log("\n학생 데이터:");
      studentsResult.rows.forEach((student, index) => {
        console.log(`${index + 1}. ID: ${student.id}, 이름: ${student.name}`);
      });
    }

    // 강사 데이터 확인
    const teachersResult = await pool.query("SELECT * FROM teachers LIMIT 5");
    console.log(`\n강사 데이터 수: ${teachersResult.rows.length}`);

    if (teachersResult.rows.length > 0) {
      console.log("\n강사 데이터:");
      teachersResult.rows.forEach((teacher, index) => {
        console.log(`${index + 1}. ID: ${teacher.id}, 이름: ${teacher.name}`);
      });
    }
  } catch (error) {
    console.error("데이터 확인 오류:", error);
  } finally {
    await pool.end();
  }
}

checkReservations();

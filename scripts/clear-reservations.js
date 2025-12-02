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

async function clearReservations() {
  try {
    console.log("=== 예약 데이터 삭제 시작 ===\n");

    // 기존 예약 데이터 조회
    const reservationsResult = await pool.query("SELECT * FROM reservations");
    console.log(`현재 예약 데이터 수: ${reservationsResult.rows.length}`);

    if (reservationsResult.rows.length > 0) {
      console.log("삭제할 예약 데이터:");
      reservationsResult.rows.forEach((reservation, index) => {
        console.log(
          `${index + 1}. ID: ${reservation.id}, 날짜: ${reservation.date}, 시간: ${reservation.start_time} ~ ${reservation.end_time}`,
        );
      });

      // 예약 데이터 삭제
      const deleteResult = await pool.query("DELETE FROM reservations");
      console.log(`\n삭제된 예약 데이터 수: ${deleteResult.rowCount}`);
    } else {
      console.log("삭제할 예약 데이터가 없습니다.");
    }

    // 관련 데이터도 삭제 (리뷰, 레슨 노트 등)
    const relatedTables = ["reviews", "lesson_notes", "payments"];

    for (const table of relatedTables) {
      try {
        const deleteRelatedResult = await pool.query(
          `DELETE FROM ${table} WHERE reservation_id IS NOT NULL`,
        );
        console.log(
          `${table} 테이블에서 예약 관련 데이터 ${deleteRelatedResult.rowCount}개 삭제`,
        );
      } catch (error) {
        console.log(`${table} 테이블 삭제 중 오류:`, error.message);
      }
    }

    console.log("\n=== 예약 데이터 삭제 완료 ===");
  } catch (error) {
    console.error("예약 데이터 삭제 오류:", error);
  } finally {
    await pool.end();
  }
}

clearReservations();

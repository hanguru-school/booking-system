import { Pool, PoolClient } from "pg";

// AWS RDS 설정
const rdsConfig = {
  // AWS RDS 사용 안 함 - 로컬 PostgreSQL 사용
  host: "localhost",
  port: 5432,
  database: "malmoi_system",
  user: "malmoi_admin",
  password: process.env.DB_PASS || "",
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  max: 20, // 최대 연결 수
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// PostgreSQL 연결 풀
let pool: Pool | null = null;
let isInitialized = false;

// 데이터베이스 연결 풀 초기화
export function initializeDatabase() {
  if (!pool && !isInitialized) {
    try {
      // 환경 변수 체크
      // AWS RDS 사용 안 함 - 로컬 PostgreSQL 사용
      if (!process.env.DATABASE_URL && process.env.NODE_ENV === "production") {
        console.warn(
          "⚠️ DATABASE_URL 환경 변수가 설정되지 않았습니다. 데이터베이스 연결을 건너뜁니다.",
        );
        isInitialized = true;
        return null;
      }

      pool = new Pool(rdsConfig);

      // 연결 테스트
      pool.on("connect", (client: any) => {
        console.log("✅ PostgreSQL 데이터베이스에 연결되었습니다.");
      });

      pool.on("error", (err: any) => {
        console.error("❌ PostgreSQL 연결 오류:", err);
        // 연결 오류 시 풀 재설정
        pool = null;
        isInitialized = false;
      });

      isInitialized = true;
    } catch (error) {
      console.error("❌ 데이터베이스 초기화 오류:", error);
      isInitialized = true;
      return null;
    }
  }
  return pool;
}

// 데이터베이스 서비스 클래스
export class DatabaseService {
  private pool: Pool | null;

  constructor() {
    this.pool = initializeDatabase();
  }

  // 쿼리 실행
  async query(text: string, params?: any[]) {
    if (!this.pool) {
      throw new Error("데이터베이스 연결이 초기화되지 않았습니다.");
    }

    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  // 트랜잭션 실행
  async transaction(callback: (client: PoolClient) => Promise<any>) {
    if (!this.pool) {
      throw new Error("데이터베이스 연결이 초기화되지 않았습니다.");
    }

    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  // 사용자 생성
  async createUser(userData: {
    email: string;
    name: string;
    role: string;
    cognitoUserId: string;
    passwordHash?: string;
  }) {
    const query = `
      INSERT INTO users (email, name, role, cognito_user_id, password_hash, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `;

    const result = await this.query(query, [
      userData.email,
      userData.name,
      userData.role,
      userData.cognitoUserId,
      userData.passwordHash || null,
    ]);

    return result.rows[0];
  }

  // 사용자 조회 (이메일로)
  async getUserByEmail(email: string) {
    const query = `
      SELECT * FROM users 
      WHERE email = $1 AND deleted_at IS NULL
    `;

    const result = await this.query(query, [email]);
    return result.rows[0] || null;
  }

  // 사용자 조회 (ID로)
  async getUserById(id: string) {
    const query = `
      SELECT * FROM users 
      WHERE id = $1 AND deleted_at IS NULL
    `;

    const result = await this.query(query, [id]);
    return result.rows[0] || null;
  }

  // 사용자 정보 업데이트
  async updateUser(id: string, updates: Record<string, any>) {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ");

    const query = `
      UPDATE users 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;

    const values = [id, ...Object.values(updates)];
    const result = await this.query(query, values);
    return result.rows[0];
  }

  // 사용자 삭제 (소프트 삭제)
  async deleteUser(id: string) {
    const query = `
      UPDATE users 
      SET deleted_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.query(query, [id]);
    return result.rows[0];
  }

  // 강의실 예약 생성
  async createReservation(reservationData: {
    userId: string;
    roomId: string;
    startTime: Date;
    endTime: Date;
    title: string;
    description?: string;
  }) {
    const query = `
      INSERT INTO reservations (user_id, room_id, start_time, end_time, title, description, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, 'confirmed', NOW(), NOW())
      RETURNING *
    `;

    const result = await this.query(query, [
      reservationData.userId,
      reservationData.roomId,
      reservationData.startTime,
      reservationData.endTime,
      reservationData.title,
      reservationData.description || null,
    ]);

    return result.rows[0];
  }

  // 예약 조회 (사용자별)
  async getUserReservations(userId: string, startDate?: Date, endDate?: Date) {
    let query = `
      SELECT r.*, rm.name as room_name
      FROM reservations r
      JOIN rooms rm ON r.room_id = rm.id
      WHERE r.user_id = $1 AND r.deleted_at IS NULL
    `;

    const params: any[] = [userId];

    if (startDate && endDate) {
      query += ` AND r.start_time BETWEEN $2 AND $3`;
      params.push(startDate, endDate);
    }

    query += ` ORDER BY r.start_time ASC`;

    const result = await this.query(query, params);
    return result.rows;
  }

  // 예약 충돌 확인
  async checkReservationConflict(
    roomId: string,
    startTime: Date,
    endTime: Date,
    excludeId?: string,
  ) {
    let query = `
      SELECT COUNT(*) as conflict_count
      FROM reservations
      WHERE room_id = $1 
        AND deleted_at IS NULL
        AND status != 'cancelled'
        AND (
          (start_time <= $2 AND end_time > $2) OR
          (start_time < $3 AND end_time >= $3) OR
          (start_time >= $2 AND end_time <= $3)
        )
    `;

    const params: any[] = [roomId, startTime, endTime];

    if (excludeId) {
      query += ` AND id != $4`;
      params.push(excludeId);
    }

    const result = await this.query(query, params);
    return parseInt(result.rows[0].conflict_count) > 0;
  }

  // 강의실 목록 조회
  async getRooms() {
    const query = `
      SELECT * FROM rooms 
      WHERE is_active = true AND deleted_at IS NULL
      ORDER BY name
    `;

    const result = await this.query(query);
    return result.rows;
  }

  // 결제 기록 생성
  async createPayment(paymentData: {
    userId: string;
    reservationId?: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    description: string;
  }) {
    const query = `
      INSERT INTO payments (user_id, reservation_id, amount, currency, payment_method, description, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW())
      RETURNING *
    `;

    const result = await this.query(query, [
      paymentData.userId,
      paymentData.reservationId || null,
      paymentData.amount,
      paymentData.currency,
      paymentData.paymentMethod,
      paymentData.description,
    ]);

    return result.rows[0];
  }

  // 결제 상태 업데이트
  async updatePaymentStatus(
    paymentId: string,
    status: string,
    transactionId?: string,
  ) {
    const query = `
      UPDATE payments 
      SET status = $2, transaction_id = $3, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.query(query, [
      paymentId,
      status,
      transactionId || null,
    ]);
    return result.rows[0];
  }

  // 데이터베이스 연결 종료
  async close() {
    if (pool) {
      await pool.end();
      pool = null;
    }
  }
}

// 싱글톤 인스턴스
export const databaseService = new DatabaseService();

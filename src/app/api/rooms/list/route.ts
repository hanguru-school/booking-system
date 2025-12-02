import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

// Node.js 런타임 명시
export const runtime = "nodejs";

// 데이터베이스 연결 설정
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// 방 목록 조회 함수
async function getRooms() {
  const query = `
    SELECT id, name, capacity, description, is_active, created_at
    FROM rooms
    ORDER BY name
  `;

  const result = await pool.query(query);
  return result.rows;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") === "true";

    // Get rooms
    const rooms = await getRooms();

    // Filter active rooms if requested
    const filteredRooms = activeOnly
      ? rooms.filter((room: any) => room.is_active)
      : rooms;

    return NextResponse.json({
      success: true,
      rooms: filteredRooms.map((room: any) => ({
        id: room.id,
        name: room.name,
        capacity: room.capacity,
        description: room.description,
        isActive: room.is_active,
        createdAt: room.created_at,
      })),
    });
  } catch (error) {
    console.error("Room list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
      { status: 500 },
    );
  }
}

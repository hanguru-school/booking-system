"use client";

import { useState, useEffect } from "react";
import { createRoom, getAllRooms, getActiveRooms } from "@/lib/firestore";
import { Room } from "@/lib/firebase";

// 교실 관리 훅
export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 모든 교실 조회
  const fetchAllRooms = async () => {
    setLoading(true);
    setError(null);

    try {
      const allRooms = await getAllRooms();
      setRooms(allRooms);
    } catch (err: any) {
      setError(err.message);
      console.error("교실 조회 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  // 활성 교실만 조회
  const fetchActiveRooms = async () => {
    setLoading(true);
    setError(null);

    try {
      const activeRooms = await getActiveRooms();
      setRooms(activeRooms);
    } catch (err: any) {
      setError(err.message);
      console.error("활성 교실 조회 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  // 교실 생성
  const addRoom = async (
    roomData: Omit<Room, "id" | "createdAt" | "updatedAt">,
  ) => {
    setLoading(true);
    setError(null);

    try {
      const roomId = await createRoom(roomData);
      console.log("교실 생성 완료:", roomId);

      // 교실 목록 새로고침
      await fetchAllRooms();

      return roomId;
    } catch (err: any) {
      setError(err.message);
      console.error("교실 생성 실패:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 교실 목록 로드
  useEffect(() => {
    fetchAllRooms();
  }, []);

  return {
    rooms,
    loading,
    error,
    addRoom,
    fetchAllRooms,
    fetchActiveRooms,
  };
}

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import {
  createReservation,
  getReservationsByUser,
  getAllReservations,
  updateReservationStatus,
  deleteReservation,
} from "@/lib/firestore";
import { Reservation } from "@/lib/firebase";

// 예약 관리 훅
export function useReservations() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 사용자별 예약 조회
  const fetchUserReservations = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const userReservations = await getReservationsByUser(user.id);
      setReservations(userReservations);
    } catch (err: any) {
      setError(err.message);
      console.error("예약 조회 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  // 모든 예약 조회 (관리자용)
  const fetchAllReservations = async () => {
    setLoading(true);
    setError(null);

    try {
      const allReservations = await getAllReservations();
      setReservations(allReservations);
    } catch (err: any) {
      setError(err.message);
      console.error("예약 조회 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  // 예약 생성
  const addReservation = async (
    reservationData: Omit<Reservation, "id" | "createdAt" | "updatedAt">,
  ) => {
    setLoading(true);
    setError(null);

    try {
      const reservationId = await createReservation(reservationData);
      console.log("예약 생성 완료:", reservationId);

      // 예약 목록 새로고침
      if (user?.role === "admin") {
        await fetchAllReservations();
      } else {
        await fetchUserReservations();
      }

      return reservationId;
    } catch (err: any) {
      setError(err.message);
      console.error("예약 생성 실패:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 예약 상태 업데이트
  const updateReservation = async (
    reservationId: string,
    status: Reservation["status"],
  ) => {
    setLoading(true);
    setError(null);

    try {
      await updateReservationStatus(reservationId, status);
      console.log("예약 상태 업데이트 완료");

      // 예약 목록 새로고침
      if (user?.role === "admin") {
        await fetchAllReservations();
      } else {
        await fetchUserReservations();
      }
    } catch (err: any) {
      setError(err.message);
      console.error("예약 상태 업데이트 실패:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 예약 삭제
  const removeReservation = async (reservationId: string) => {
    setLoading(true);
    setError(null);

    try {
      await deleteReservation(reservationId);
      console.log("예약 삭제 완료");

      // 예약 목록 새로고침
      if (user?.role === "admin") {
        await fetchAllReservations();
      } else {
        await fetchUserReservations();
      }
    } catch (err: any) {
      setError(err.message);
      console.error("예약 삭제 실패:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 사용자 변경 시 예약 목록 새로고침
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        fetchAllReservations();
      } else {
        fetchUserReservations();
      }
    } else {
      setReservations([]);
    }
  }, [user]);

  return {
    reservations,
    loading,
    error,
    addReservation,
    updateReservation,
    removeReservation,
    fetchUserReservations,
    fetchAllReservations,
  };
}

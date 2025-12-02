"use client";

import { useState, useEffect } from "react";
import { createCourse, getAllCourses, getActiveCourses } from "@/lib/firestore";
import { Course } from "@/lib/firebase";

// 코스 관리 훅
export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 모든 코스 조회
  const fetchAllCourses = async () => {
    setLoading(true);
    setError(null);

    try {
      const allCourses = await getAllCourses();
      setCourses(allCourses);
    } catch (err: any) {
      setError(err.message);
      console.error("코스 조회 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  // 활성 코스만 조회
  const fetchActiveCourses = async () => {
    setLoading(true);
    setError(null);

    try {
      const activeCourses = await getActiveCourses();
      setCourses(activeCourses);
    } catch (err: any) {
      setError(err.message);
      console.error("활성 코스 조회 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  // 코스 생성
  const addCourse = async (
    courseData: Omit<Course, "id" | "createdAt" | "updatedAt">,
  ) => {
    setLoading(true);
    setError(null);

    try {
      const courseId = await createCourse(courseData);
      console.log("코스 생성 완료:", courseId);

      // 코스 목록 새로고침
      await fetchAllCourses();

      return courseId;
    } catch (err: any) {
      setError(err.message);
      console.error("코스 생성 실패:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 코스 목록 로드
  useEffect(() => {
    fetchAllCourses();
  }, []);

  return {
    courses,
    loading,
    error,
    addCourse,
    fetchAllCourses,
    fetchActiveCourses,
  };
}

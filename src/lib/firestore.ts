import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db, COLLECTIONS, User, Reservation, Room, Course } from "./firebase";

// ===== 사용자 관리 =====

// 모든 사용자 조회
export async function getAllUsers(): Promise<User[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as User[];
  } catch (error) {
    console.error("사용자 조회 실패:", error);
    throw error;
  }
}

// 사용자 ID로 조회
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const docRef = doc(db, COLLECTIONS.USERS, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as User;
    }
    return null;
  } catch (error) {
    console.error("사용자 조회 실패:", error);
    throw error;
  }
}

// ===== 예약 관리 =====

// 예약 생성
export async function createReservation(
  reservationData: Omit<Reservation, "id" | "createdAt" | "updatedAt">,
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.RESERVATIONS), {
      ...reservationData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("예약 생성 실패:", error);
    throw error;
  }
}

// 사용자별 예약 조회
export async function getReservationsByUser(
  userId: string,
): Promise<Reservation[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.RESERVATIONS),
      where("userId", "==", userId),
      orderBy("date", "desc"),
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Reservation[];
  } catch (error) {
    console.error("예약 조회 실패:", error);
    throw error;
  }
}

// 모든 예약 조회
export async function getAllReservations(): Promise<Reservation[]> {
  try {
    const querySnapshot = await getDocs(
      collection(db, COLLECTIONS.RESERVATIONS),
    );
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Reservation[];
  } catch (error) {
    console.error("예약 조회 실패:", error);
    throw error;
  }
}

// 예약 상태 업데이트
export async function updateReservationStatus(
  reservationId: string,
  status: Reservation["status"],
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.RESERVATIONS, reservationId);
    await updateDoc(docRef, {
      status,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("예약 상태 업데이트 실패:", error);
    throw error;
  }
}

// 예약 삭제
export async function deleteReservation(reservationId: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.RESERVATIONS, reservationId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("예약 삭제 실패:", error);
    throw error;
  }
}

// ===== 교실 관리 =====

// 교실 생성
export async function createRoom(
  roomData: Omit<Room, "id" | "createdAt" | "updatedAt">,
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.ROOMS), {
      ...roomData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("교실 생성 실패:", error);
    throw error;
  }
}

// 모든 교실 조회
export async function getAllRooms(): Promise<Room[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.ROOMS));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Room[];
  } catch (error) {
    console.error("교실 조회 실패:", error);
    throw error;
  }
}

// 활성 교실만 조회
export async function getActiveRooms(): Promise<Room[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.ROOMS),
      where("isActive", "==", true),
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Room[];
  } catch (error) {
    console.error("활성 교실 조회 실패:", error);
    throw error;
  }
}

// ===== 코스 관리 =====

// 코스 생성
export async function createCourse(
  courseData: Omit<Course, "id" | "createdAt" | "updatedAt">,
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.COURSES), {
      ...courseData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("코스 생성 실패:", error);
    throw error;
  }
}

// 모든 코스 조회
export async function getAllCourses(): Promise<Course[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.COURSES));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Course[];
  } catch (error) {
    console.error("코스 조회 실패:", error);
    throw error;
  }
}

// 활성 코스만 조회
export async function getActiveCourses(): Promise<Course[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.COURSES),
      where("isActive", "==", true),
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Course[];
  } catch (error) {
    console.error("활성 코스 조회 실패:", error);
    throw error;
  }
}

// ===== 배치 작업 =====

// 초기 데이터 생성 (개발용)
export async function createInitialData() {
  const batch = writeBatch(db);

  try {
    // 샘플 교실 데이터
    const rooms = [
      {
        name: "101호",
        capacity: 30,
        facilities: ["프로젝터", "화이트보드", "에어컨"],
        isActive: true,
      },
      {
        name: "102호",
        capacity: 25,
        facilities: ["프로젝터", "화이트보드"],
        isActive: true,
      },
      {
        name: "컴퓨터실",
        capacity: 20,
        facilities: ["컴퓨터", "프로젝터", "에어컨"],
        isActive: true,
      },
    ];

    // 샘플 코스 데이터
    const courses = [
      {
        name: "일본어 기초",
        description: "일본어 기초 문법과 회화",
        duration: 90,
        maxStudents: 15,
        price: 50000,
        isActive: true,
      },
      {
        name: "일본어 중급",
        description: "일본어 중급 문법과 비즈니스 회화",
        duration: 120,
        maxStudents: 12,
        price: 70000,
        isActive: true,
      },
      {
        name: "JLPT N2 준비반",
        description: "JLPT N2 시험 대비 강의",
        duration: 150,
        maxStudents: 10,
        price: 100000,
        isActive: true,
      },
    ];

    // 교실 데이터 추가
    for (const room of rooms) {
      const docRef = doc(collection(db, COLLECTIONS.ROOMS));
      batch.set(docRef, {
        ...room,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }

    // 코스 데이터 추가
    for (const course of courses) {
      const docRef = doc(collection(db, COLLECTIONS.COURSES));
      batch.set(docRef, {
        ...course,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }

    await batch.commit();
    console.log("초기 데이터 생성 완료");
  } catch (error) {
    console.error("초기 데이터 생성 실패:", error);
    throw error;
  }
}

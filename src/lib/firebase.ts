import { initializeApp } from "firebase/app";
import { getAuth, OAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase 설정 (개발용 임시 설정)
const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "booking-system-dev.firebaseapp.com",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "booking-system-dev",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "booking-system-dev.appspot.com",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
};

// Firebase 설정 유효성 검사
const isFirebaseConfigValid = () => {
  return (
    firebaseConfig.apiKey &&
    !firebaseConfig.apiKey.includes("xxxxx") &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId !== "booking-system-dev"
  );
};

// Firebase 앱 초기화 (안전한 초기화)
let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;

try {
  if (isFirebaseConfigValid()) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log("✅ Firebase가 성공적으로 초기화되었습니다.");
  } else {
    console.warn(
      "⚠️ Firebase 설정이 유효하지 않습니다. Firebase 기능이 비활성화됩니다.",
    );
  }
} catch (error) {
  console.error("❌ Firebase 초기화 오류:", error);
  console.warn("⚠️ Firebase 기능이 비활성화됩니다.");
}

// Firebase 서비스들 export (안전한 export)
export { app, auth, db, storage };

// LINE 로그인 제공업체
export const lineProvider = new OAuthProvider("oidc.line");
lineProvider.setCustomParameters({
  prompt: "consent",
});

// Firestore 컬렉션 이름들
export const COLLECTIONS = {
  USERS: "users",
  RESERVATIONS: "reservations",
  COURSES: "courses",
  ROOMS: "rooms",
  NOTIFICATIONS: "notifications",
} as const;

// 사용자 역할 타입
export type UserRole = "admin" | "teacher" | "student" | "staff" | "parent";

// 사용자 인터페이스
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  permissions: string[];
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

// 예약 인터페이스
export interface Reservation {
  id: string;
  userId: string;
  courseId: string;
  roomId: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 교실 인터페이스
export interface Room {
  id: string;
  name: string;
  capacity: number;
  facilities: string[];
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 코스 인터페이스
export interface Course {
  id: string;
  name: string;
  description: string;
  duration: number; // 분 단위
  maxStudents: number;
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentIdentifier {
  id: string;
  studentId: string;
  identifierCode: string;
  identifierType: "qr" | "barcode";
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  lastUsedAt?: Date;
  usageCount: number;
}

export interface StudentIdentifierHistory {
  id: string;
  studentId: string;
  oldIdentifierCode?: string;
  newIdentifierCode: string;
  reason: "initial" | "reissue" | "system_update";
  issuedBy: string; // admin ID
  issuedAt: Date;
  notes?: string;
}

export interface StudentIdentifierData {
  studentId: string;
  studentName: string;
  studentEmail: string;
  department: string;
  currentLevel: string;
  points: number;
  completedClasses: number;
  identifierCode: string;
  createdAt: Date;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  level: string;
  points: number;
  totalClasses: number;
  completedClasses: number;
  remainingHours: number;
  joinDate: string;
  lastLogin: string;
  avatar?: string;
}

export interface StudentStats {
  totalClasses: number;
  completedClasses: number;
  upcomingClasses: number;
  currentLevel: string;
  points: number;
  studyStreak: number;
  averageScore: number;
  remainingTime: {
    total: number;
    available: number;
  };
}

export interface RecentReservation {
  id: string;
  date: string;
  time: string;
  teacher: string;
  subject: string;
  status: "upcoming" | "completed" | "cancelled";
}

export interface RecentNote {
  id: string;
  title: string;
  date: string;
  hasAudio: boolean;
  duration: string;
}

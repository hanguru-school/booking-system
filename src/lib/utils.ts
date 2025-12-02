import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind CSS 클래스 병합 유틸리티
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 날짜 포맷팅
export function formatDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  });
}

// 시간 포맷팅
export function formatTime(time: string): string {
  return time.substring(0, 5); // HH:MM 형식으로 변환
}

// 파일 크기 포맷팅
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// 숫자 포맷팅 (천 단위 구분자)
export function formatNumber(num: number): string {
  return num.toLocaleString("ko-KR");
}

// 통화 포맷팅
export function formatCurrency(
  amount: number,
  currency: string = "KRW",
): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency,
  }).format(amount);
}

// 문자열 자르기
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

// 이메일 유효성 검사
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 전화번호 유효성 검사
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[0-9-+\s()]+$/;
  return phoneRegex.test(phone) && phone.replace(/[^0-9]/g, "").length >= 10;
}

// 비밀번호 강도 검사
export function checkPasswordStrength(password: string): {
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push("비밀번호는 최소 8자 이상이어야 합니다.");
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("소문자를 포함해야 합니다.");
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("대문자를 포함해야 합니다.");
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push("숫자를 포함해야 합니다.");
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push("특수문자를 포함해야 합니다.");
  }

  return { score, feedback };
}

// UUID 생성
export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// 디바운스 함수
export function debounce<T extends (...args: Record<string, unknown>[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 스로틀 함수
export function throttle<T extends (...args: Record<string, unknown>[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// 로컬 스토리지 유틸리티
export const storage = {
  get: (key: string): Record<string, unknown> => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : {};
    } catch {
      return {};
    }
  },

  set: (key: string, value: Record<string, unknown>): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // 스토리지 오류 무시
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      // 스토리지 오류 무시
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch {
      // 스토리지 오류 무시
    }
  },
};

// 세션 스토리지 유틸리티
export const sessionStorageUtil = {
  get: (key: string): Record<string, unknown> => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : {};
    } catch {
      return {};
    }
  },

  set: (key: string, value: Record<string, unknown>): void => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // 스토리지 오류 무시
    }
  },

  remove: (key: string): void => {
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      // 스토리지 오류 무시
    }
  },

  clear: (): void => {
    try {
      window.sessionStorage.clear();
    } catch {
      // 스토리지 오류 무시
    }
  },
};

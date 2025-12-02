interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class CacheManager {
  private cache: Map<string, CacheItem<any>>;
  private defaultTTL: number;

  constructor(defaultTTL: number = 5 * 60 * 1000) {
    // 5분 기본 TTL
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  // 캐시에 데이터 저장
  set<T>(key: string, data: T, ttl?: number): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    };
    this.cache.set(key, item);
  }

  // 캐시에서 데이터 조회
  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // TTL 확인
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  // 캐시에서 데이터 삭제
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // 특정 패턴의 키들 삭제
  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  // 캐시 전체 삭제
  clear(): void {
    this.cache.clear();
  }

  // 만료된 항목들 정리
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // 캐시 통계
  getStats(): {
    size: number;
    keys: string[];
  } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// 전역 캐시 인스턴스
export const cacheManager = new CacheManager();

// 캐시 키 생성 헬퍼 함수들
export const cacheKeys = {
  // 학생 관련
  student: (id: string) => `student:${id}`,
  studentReservations: (id: string) => `student:${id}:reservations`,
  studentProgress: (id: string) => `student:${id}:progress`,

  // 강사 관련
  teacher: (id: string) => `teacher:${id}`,
  teacherSchedule: (id: string) => `teacher:${id}:schedule`,
  teacherAnalytics: (id: string) => `teacher:${id}:analytics`,

  // 예약 관련
  reservations: (date?: string) => `reservations:${date || "all"}`,
  reservation: (id: string) => `reservation:${id}`,

  // 통계 관련
  analytics: (type: string, params: string) => `analytics:${type}:${params}`,
  stats: (type: string) => `stats:${type}`,

  // 백업 관련
  backups: () => "backups:list",
  backupStats: () => "backups:stats",

  // 알림 관련
  notifications: (userId: string) => `notifications:${userId}`,

  // 결제 관련
  payments: (userId: string) => `payments:${userId}`,
  paymentStats: () => "payments:stats",
};

// 캐시 래퍼 함수들
export const cacheUtils = {
  // 캐시된 함수 실행
  async cached<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = cacheManager.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const result = await fn();
    cacheManager.set(key, result, ttl);
    return result;
  },

  // 캐시 무효화
  invalidate(pattern: string): void {
    cacheManager.deletePattern(pattern);
  },

  // 학생 관련 캐시 무효화
  invalidateStudent(studentId: string): void {
    cacheManager.deletePattern(`student:${studentId}`);
    cacheManager.deletePattern(`reservations:.*`);
    cacheManager.deletePattern(`analytics:.*`);
  },

  // 강사 관련 캐시 무효화
  invalidateTeacher(teacherId: string): void {
    cacheManager.deletePattern(`teacher:${teacherId}`);
    cacheManager.deletePattern(`reservations:.*`);
    cacheManager.deletePattern(`analytics:.*`);
  },

  // 예약 관련 캐시 무효화
  invalidateReservations(): void {
    cacheManager.deletePattern("reservations:.*");
    cacheManager.deletePattern("analytics:.*");
  },

  // 통계 관련 캐시 무효화
  invalidateAnalytics(): void {
    cacheManager.deletePattern("analytics:.*");
    cacheManager.deletePattern("stats:.*");
  },
};

// 주기적 캐시 정리 (5분마다)
setInterval(
  () => {
    cacheManager.cleanup();
  },
  5 * 60 * 1000,
);

export default cacheManager;

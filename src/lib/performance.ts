/**
 * 성능 모니터링 및 최적화 유틸리티
 */

export interface PerformanceMetrics {
  name: string;
  duration: number;
  timestamp: number;
  memory?: number;
  cpu?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private isEnabled = process.env.NODE_ENV === "development";

  /**
   * 함수 실행 시간 측정
   */
  measure<T>(name: string, fn: () => T): T {
    if (!this.isEnabled) return fn();

    const start = performance.now();
    const startMemory = this.getMemoryUsage();

    try {
      const result = fn();
      const end = performance.now();
      const endMemory = this.getMemoryUsage();

      this.recordMetric({
        name,
        duration: end - start,
        timestamp: Date.now(),
        memory: endMemory - startMemory,
      });

      return result;
    } catch (error) {
      const end = performance.now();
      this.recordMetric({
        name: `${name} (error)`,
        duration: end - start,
        timestamp: Date.now(),
      });
      throw error;
    }
  }

  /**
   * 비동기 함수 실행 시간 측정
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    if (!this.isEnabled) return fn();

    const start = performance.now();
    const startMemory = this.getMemoryUsage();

    try {
      const result = await fn();
      const end = performance.now();
      const endMemory = this.getMemoryUsage();

      this.recordMetric({
        name,
        duration: end - start,
        timestamp: Date.now(),
        memory: endMemory - startMemory,
      });

      return result;
    } catch (error) {
      const end = performance.now();
      this.recordMetric({
        name: `${name} (error)`,
        duration: end - start,
        timestamp: Date.now(),
      });
      throw error;
    }
  }

  /**
   * 메트릭 기록
   */
  private recordMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric);

    // 성능 경고 임계값 체크
    if (metric.duration > 1000) {
      console.warn(
        `🚨 성능 경고: ${metric.name}이 ${metric.duration.toFixed(2)}ms 소요되었습니다.`,
      );
    }

    // 메모리 사용량이 너무 많으면 경고
    if (metric.memory && metric.memory > 50 * 1024 * 1024) {
      // 50MB
      console.warn(
        `🚨 메모리 경고: ${metric.name}에서 ${(metric.memory / 1024 / 1024).toFixed(2)}MB 사용`,
      );
    }

    // 메트릭 개수 제한 (최근 100개만 유지)
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  /**
   * 메모리 사용량 가져오기
   */
  private getMemoryUsage(): number {
    if (typeof process !== "undefined" && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    return 0;
  }

  /**
   * 성능 통계 가져오기
   */
  getStats() {
    if (this.metrics.length === 0) {
      return { count: 0, average: 0, slowest: null };
    }

    const durations = this.metrics.map((m) => m.duration);
    const average = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const slowest = this.metrics.reduce((max, m) =>
      m.duration > max.duration ? m : max,
    );

    return {
      count: this.metrics.length,
      average: average.toFixed(2),
      slowest: slowest
        ? { name: slowest.name, duration: slowest.duration.toFixed(2) }
        : null,
      recent: this.metrics.slice(-10).map((m) => ({
        name: m.name,
        duration: m.duration.toFixed(2),
        timestamp: new Date(m.timestamp).toLocaleTimeString(),
      })),
    };
  }

  /**
   * 메트릭 초기화
   */
  clear() {
    this.metrics = [];
  }

  /**
   * 성능 로그 출력
   */
  logStats() {
    if (!this.isEnabled) return;

    const stats = this.getStats();
    console.group("📊 성능 통계");
    console.log(`총 실행: ${stats.count}회`);
    console.log(`평균 시간: ${stats.average}ms`);
    if (stats.slowest) {
      console.log(
        `가장 느린 실행: ${stats.slowest.name} (${stats.slowest.duration}ms)`,
      );
    }
    console.groupEnd();
  }
}

// 싱글톤 인스턴스
export const performanceMonitor = new PerformanceMonitor();

/**
 * 성능 측정 데코레이터 (함수용)
 */
export function measure(name?: string) {
  return function (
    target: Record<string, unknown>,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const method = descriptor.value;
    const methodName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = function (...args: Record<string, unknown>[]) {
      return performanceMonitor.measure(methodName, () =>
        method.apply(this, args),
      );
    };

    return descriptor;
  };
}

/**
 * 성능 측정 데코레이터 (비동기 함수용)
 */
export function measureAsync(name?: string) {
  return function (
    target: Record<string, unknown>,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const method = descriptor.value;
    const methodName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = function (...args: Record<string, unknown>[]) {
      return performanceMonitor.measureAsync(methodName, () =>
        method.apply(this, args),
      );
    };

    return descriptor;
  };
}

/**
 * 간단한 성능 측정 함수
 */
export const measurePerformance = <T>(name: string, fn: () => T): T => {
  return performanceMonitor.measure(name, fn);
};

/**
 * 간단한 비동기 성능 측정 함수
 */
export const measureAsyncPerformance = <T>(
  name: string,
  fn: () => Promise<T>,
): Promise<T> => {
  return performanceMonitor.measureAsync(name, fn);
};

/**
 * 개발 환경에서 성능 통계 출력
 */
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  // 브라우저에서 성능 통계를 콘솔에 출력
  setInterval(() => {
    performanceMonitor.logStats();
  }, 30000); // 30초마다
}

/**
 * 환경 감지 유틸리티 함수
 */

// 운영 서버 도메인 목록
const PRODUCTION_DOMAINS = ["192.168.1.41", "100.80.210.105"];

// 개발/테스트 환경 도메인 패턴
const DEVELOPMENT_PATTERNS = [
  "localhost",
  "127.0.0.1",
  "vercel.app",
  "netlify.app",
  "preview",
  "staging",
  "dev",
  "test",
];

/**
 * 현재 환경이 운영 서버인지 확인
 */
export function isProductionEnvironment(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const hostname = window.location.hostname;
  return PRODUCTION_DOMAINS.includes(hostname);
}

/**
 * 현재 환경이 개발/테스트 환경인지 확인
 */
export function isDevelopmentEnvironment(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const hostname = window.location.hostname;
  return DEVELOPMENT_PATTERNS.some((pattern) => hostname.includes(pattern));
}

/**
 * 환경 경고 메시지 가져오기
 */
export function getEnvironmentWarningMessage(): string {
  return `現在の環境はテスト用のため、正式な動作を保証していません。
必ず http://192.168.1.41:3000 を使用してください。`;
}

/**
 * 운영 서버 URL 가져오기
 */
export function getProductionUrl(): string {
  return process.env.NEXTAUTH_URL || "http://192.168.1.41:3000";
}

/**
 * 환경 정보 가져오기
 */
export function getEnvironmentInfo() {
  if (typeof window === "undefined") {
    return {
      hostname: "",
      isProduction: false,
      isDevelopment: false,
    };
  }

  const hostname = window.location.hostname;
  return {
    hostname,
    isProduction: isProductionEnvironment(),
    isDevelopment: isDevelopmentEnvironment(),
  };
}

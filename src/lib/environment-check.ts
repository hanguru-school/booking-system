export const PRODUCTION_URL = process.env.NEXTAUTH_URL || "http://192.168.1.41:3000";

export function isProductionEnvironment(): boolean {
  if (typeof window === "undefined") {
    // 서버 사이드에서는 항상 true 반환 (SSR 고려)
    return true;
  }

  const currentUrl = window.location.href;
  return (
    currentUrl.includes(PRODUCTION_URL) ||
    currentUrl.includes("192.168.1.41") || currentUrl.includes("100.80.210.105")
  );
}

export function isLocalDevelopment(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const currentUrl = window.location.href;
  return (
    currentUrl.includes("localhost") ||
    currentUrl.includes("127.0.0.1") ||
    currentUrl.includes(":3000") ||
    currentUrl.includes(":3006")
  );
}

export function isTestEnvironment(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const currentUrl = window.location.href;
  return (
    currentUrl.includes("vercel.app") ||
    currentUrl.includes("netlify.app") ||
    currentUrl.includes("preview")
  );
}

export function shouldShowWarning(): boolean {
  return (
    !isProductionEnvironment() && (isLocalDevelopment() || isTestEnvironment())
  );
}

export function redirectToProduction(): void {
  if (typeof window !== "undefined") {
    window.location.href = PRODUCTION_URL;
  }
}

export const WARNING_MESSAGE = {
  ja: "現在の環境はテスト用のため、正式な動作を保証していません。必ず https://app.hanguru.school を使用してください。",
  ko: "현재 환경은 테스트용이므로 정식 동작을 보장하지 않습니다. 반드시 https://app.hanguru.school 을 사용해주세요.",
  en: "The current environment is for testing purposes and does not guarantee official operation. Please use https://app.hanguru.school",
};

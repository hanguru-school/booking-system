// Environment Variables Validator for MalMoi System

interface EnvironmentConfig {
  // Database
  DATABASE_URL: string;

  // File Storage (Object Storage - MinIO 호환)
  OBJECT_STORAGE_BUCKET: string;
  OBJECT_STORAGE_ACCESS_KEY: string;
  OBJECT_STORAGE_SECRET_KEY: string;
  OBJECT_STORAGE_ENDPOINT: string;
  OBJECT_STORAGE_FORCE_PATH_STYLE: string;

  // Authentication
  JWT_SECRET: string;
  SESSION_SECRET: string;
  AUTH_BASE_URL: string;

  // Security
  CORS_ORIGIN: string;
  CSRF_SECRET: string;

  // Environment
  NODE_ENV: string;
  NEXT_PUBLIC_NODE_ENV: string;
}

interface ValidationResult {
  isValid: boolean;
  missingVars: string[];
  invalidVars: string[];
  warnings: string[];
}

/**
 * 환경 변수 검증
 */
export function validateEnvironment(): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    missingVars: [],
    invalidVars: [],
    warnings: [],
  };

  // 배포를 위해 임시로 필수 환경 변수 목록을 최소화
  const requiredVars = [
    "DATABASE_URL",
    "NODE_ENV",
  ];

  // 누락된 환경 변수 확인
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      result.missingVars.push(varName);
      result.isValid = false;
    }
  }

  // 환경 변수 값 검증
  const validations = [
    {
      name: "DATABASE_URL",
      validator: (value: string) => value.startsWith("postgresql://"),
      message: "DATABASE_URL must start with postgresql://",
    },
    {
      name: "OBJECT_STORAGE_ENDPOINT",
      validator: (value: string) => value.startsWith("http://") || value.startsWith("https://"),
      message: "OBJECT_STORAGE_ENDPOINT must start with http:// or https://",
    },
    {
      name: "NODE_ENV",
      validator: (value: string) =>
        ["development", "production"].includes(value),
      message: "NODE_ENV must be development or production",
    },
  ];

  // 값 검증
  for (const validation of validations) {
    const value = process.env[validation.name];
    if (value && !validation.validator(value)) {
      result.invalidVars.push(`${validation.name}: ${validation.message}`);
      result.isValid = false;
    }
  }

  // 경고 확인
  if (
    process.env.NODE_ENV === "production" &&
    process.env.DATABASE_URL?.includes("localhost") &&
    !process.env.DATABASE_URL?.includes("127.0.0.1")
  ) {
    result.warnings.push(
      "DATABASE_URL uses localhost in production - consider using 127.0.0.1",
    );
  }

  return result;
}

/**
 * 환경 변수 로그 출력
 */
export function logEnvironmentStatus(): void {
  const result = validateEnvironment();

  console.log("=== Environment Variables Validation ===");
  console.log(`Valid: ${result.isValid ? "✅" : "❌"}`);

  if (result.missingVars.length > 0) {
    console.log("❌ Missing Variables:");
    result.missingVars.forEach((varName) => {
      console.log(`   - ${varName}`);
    });
  }

  if (result.invalidVars.length > 0) {
    console.log("❌ Invalid Variables:");
    result.invalidVars.forEach((error) => {
      console.log(`   - ${error}`);
    });
  }

  if (result.warnings.length > 0) {
    console.log("⚠️  Warnings:");
    result.warnings.forEach((warning) => {
      console.log(`   - ${warning}`);
    });
  }

  if (result.isValid && result.warnings.length === 0) {
    console.log("✅ All environment variables are properly configured!");
  }

  console.log("=====================================");
}

/**
 * 환경 변수 설정 가져오기
 */
export function getEnvironmentConfig(): Partial<EnvironmentConfig> {
  return {
    DATABASE_URL: process.env.DATABASE_URL || "",
    OBJECT_STORAGE_BUCKET: process.env.OBJECT_STORAGE_BUCKET || "",
    OBJECT_STORAGE_ACCESS_KEY: process.env.OBJECT_STORAGE_ACCESS_KEY || "",
    OBJECT_STORAGE_SECRET_KEY: process.env.OBJECT_STORAGE_SECRET_KEY || "",
    OBJECT_STORAGE_ENDPOINT: process.env.OBJECT_STORAGE_ENDPOINT || "",
    OBJECT_STORAGE_FORCE_PATH_STYLE: process.env.OBJECT_STORAGE_FORCE_PATH_STYLE || "",
  };
}

// 초기화 시 환경 변수 상태 로그
if (typeof window === "undefined") {
  logEnvironmentStatus();
}

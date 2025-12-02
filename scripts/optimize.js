#!/usr/bin/env node

/**
 * 성능 최적화 스크립트
 * 사용법: node scripts/optimize.js
 */

const fs = require("fs");
const path = require("path");

console.log("🚀 성능 최적화 스크립트 시작...\n");

// 1. 번들 크기 분석
function analyzeBundleSize() {
  console.log("📦 번들 크기 분석 중...");

  const bundlePath = path.join(__dirname, "../.next/static/chunks");
  if (fs.existsSync(bundlePath)) {
    const files = fs.readdirSync(bundlePath);
    let totalSize = 0;

    files.forEach((file) => {
      const filePath = path.join(bundlePath, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;

      if (stats.size > 1024 * 1024) {
        // 1MB 이상
        console.log(
          `⚠️  큰 파일 발견: ${file} (${(stats.size / 1024 / 1024).toFixed(2)}MB)`,
        );
      }
    });

    console.log(`📊 총 번들 크기: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
  } else {
    console.log(
      "ℹ️  번들 파일이 아직 생성되지 않았습니다. npm run build를 먼저 실행하세요.",
    );
  }
}

// 2. 불필요한 파일 검사
function checkUnusedFiles() {
  console.log("\n🔍 불필요한 파일 검사 중...");

  const srcPath = path.join(__dirname, "../src");
  const componentsPath = path.join(srcPath, "components");

  if (fs.existsSync(componentsPath)) {
    const files = fs.readdirSync(componentsPath);
    console.log(`📁 컴포넌트 파일 수: ${files.length}`);

    // .tsx 파일만 필터링
    const tsxFiles = files.filter((file) => file.endsWith(".tsx"));
    console.log(`📄 TypeScript 컴포넌트 수: ${tsxFiles.length}`);
  }
}

// 3. 의존성 분석
function analyzeDependencies() {
  console.log("\n📋 의존성 분석 중...");

  const packagePath = path.join(__dirname, "../package.json");
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

    const dependencies = Object.keys(packageJson.dependencies || {});
    const devDependencies = Object.keys(packageJson.devDependencies || {});

    console.log(`📦 프로덕션 의존성: ${dependencies.length}개`);
    console.log(`🔧 개발 의존성: ${devDependencies.length}개`);

    // 큰 의존성 체크
    const largeDeps = ["react", "next", "typescript", "tailwindcss"];
    largeDeps.forEach((dep) => {
      if (dependencies.includes(dep) || devDependencies.includes(dep)) {
        console.log(`✅ ${dep} 사용 중`);
      }
    });
  }
}

// 4. 성능 권장사항
function generateRecommendations() {
  console.log("\n💡 성능 최적화 권장사항:");

  const recommendations = [
    "🔸 이미지 최적화: next/image 사용",
    "🔸 코드 스플리팅: 동적 import 활용",
    "🔸 캐싱 전략: SWR 또는 React Query 사용",
    "🔸 번들 최적화: Tree shaking 확인",
    "🔸 메모리 누수 방지: useEffect cleanup 함수 사용",
    "🔸 렌더링 최적화: React.memo, useMemo, useCallback 활용",
    "🔸 서버 사이드 렌더링: getServerSideProps 최적화",
    "🔸 정적 생성: getStaticProps 활용",
  ];

  recommendations.forEach((rec) => console.log(rec));
}

// 5. 환경 설정 검사
function checkEnvironment() {
  console.log("\n⚙️  환경 설정 검사 중...");

  const envPath = path.join(__dirname, "../.env.local");
  if (fs.existsSync(envPath)) {
    console.log("✅ .env.local 파일 존재");
  } else {
    console.log("ℹ️  .env.local 파일이 없습니다. 필요시 생성하세요.");
  }

  const nextConfigPath = path.join(__dirname, "../next.config.ts");
  if (fs.existsSync(nextConfigPath)) {
    console.log("✅ next.config.ts 파일 존재");
  }
}

// 6. 빌드 최적화 체크
function checkBuildOptimization() {
  console.log("\n🏗️  빌드 최적화 체크 중...");

  const tsConfigPath = path.join(__dirname, "../tsconfig.json");
  if (fs.existsSync(tsConfigPath)) {
    const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, "utf8"));

    if (tsConfig.compilerOptions?.incremental) {
      console.log("✅ 증분 컴파일 활성화");
    } else {
      console.log("⚠️  증분 컴파일 비활성화 (성능 향상을 위해 활성화 권장)");
    }
  }
}

// 메인 실행 함수
function main() {
  try {
    analyzeBundleSize();
    checkUnusedFiles();
    analyzeDependencies();
    checkEnvironment();
    checkBuildOptimization();
    generateRecommendations();

    console.log("\n✅ 성능 최적화 분석 완료!");
    console.log("\n📈 추가 최적화를 위해 다음 명령어를 실행하세요:");
    console.log("   npm run build -- --analyze  # 번들 분석");
    console.log("   npm run lint -- --fix      # 코드 품질 개선");
    console.log("   npm run type-check         # 타입 체크");
  } catch (error) {
    console.error("❌ 오류 발생:", error.message);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = {
  analyzeBundleSize,
  checkUnusedFiles,
  analyzeDependencies,
  generateRecommendations,
  checkEnvironment,
  checkBuildOptimization,
};

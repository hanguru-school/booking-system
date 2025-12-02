// 관리자/교실 전용: 입회 동의서 PDF 생성 스크립트
// 사용법 예시:
//   PRINT_TOKEN="..." STUDENT_ID="..." BASE_URL="http://192.168.1.41:3000" node scripts/generate-enrollment-pdf.js

/* eslint-disable @typescript-eslint/no-var-requires */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

(async () => {
  const studentId = process.env.STUDENT_ID;
  const token = process.env.PRINT_TOKEN;
  const base = process.env.BASE_URL || "http://localhost:3000";

  if (!studentId || !token) {
    console.error("Missing env: STUDENT_ID or PRINT_TOKEN");
    process.exit(1);
  }

  const url = `${base}/enrollment-agreement/print/${studentId}?token=${encodeURIComponent(
    token,
  )}`;

  const outDir = path.resolve(
    process.env.OUT_DIR || path.join(process.env.HOME || ".", "pdfs"),
  );
  fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, `enrollment-${studentId}-${Date.now()}.pdf`);

  console.log("▶ URL:", url);
  console.log("▶ OUTPUT:", out);

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  const ctx = await browser.newContext({
    locale: "ja-JP",
    timezoneId: "Asia/Tokyo",
  });
  const page = await ctx.newPage();

  // 인쇄에 불필요한 외부 스크립트 차단(광고/트래킹 등)
  await page.route("**/*", (route) => {
    const u = route.request().url();
    if (
      /googletagmanager|analytics|doubleclick|facebook|hotjar|ads|beacon/i.test(
        u,
      )
    ) {
      return route.abort();
    }
    return route.continue();
  });

  await page.goto(url, { waitUntil: "networkidle", timeout: 90_000 });
  await page.emulateMedia({ media: "print", reducedMotion: "reduce" });

  await page.pdf({
    path: out,
    format: "A4",
    printBackground: true,
    margin: { top: "12mm", right: "12mm", bottom: "14mm", left: "12mm" },
  });

  console.log("🧾 PDF saved:", out);
  await browser.close();
})().catch((err) => {
  console.error("PDF 생성 중 오류:", err);
  process.exit(1);
});





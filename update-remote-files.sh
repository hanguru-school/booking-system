#!/bin/bash
# 원격 서버에 파일 직접 업데이트

cat > /tmp/update-remote.sh << 'REMOTE_SCRIPT'
#!/bin/bash
cd ~/booking-system

# 파일 업데이트
cat > src/app/layout.tsx << 'EOF'
import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });
const notoSansJP = Noto_Sans_JP({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: "MalMoi 한국어 교실",
  description: "스마트한 한국어 학습을 시작하세요",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={`${inter.className} ${notoSansJP.variable}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
EOF

# 서버 재시작
pkill -f "next dev" 2>/dev/null
sleep 2
NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 nohup npm run dev > dev.log 2>&1 &
echo $! > .dev.pid
echo "✅ 업데이트 완료"
REMOTE_SCRIPT

scp /tmp/update-remote.sh malmoi@hanguru-system-server:/tmp/ && ssh malmoi@hanguru-system-server "bash /tmp/update-remote.sh"



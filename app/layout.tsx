import type { Metadata } from "next";
import { IBM_Plex_Mono, Iansui, Noto_Sans_TC } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const body = Noto_Sans_TC({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-body", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });
// Subset of jf open 粉圓 2.1 (OFL, see app/fonts/OFL-huninn.txt), renamed because subsetting is a Modified Version
// and "huninn" is a Reserved Font Name. Chars: Big5 常用字 + ASCII + punctuation (scripts/huninn-chars.txt).
const display = localFont({ src: "./fonts/lab-rounded.woff2", variable: "--font-display", display: "swap", preload: false, weight: "400 700" });
const hand = Iansui({ subsets: ["latin"], weight: "400", variable: "--font-hand", display: "swap" });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000"),
  title: { default: "小傑實驗室", template: "%s · 小傑實驗室" },
  description: "我想做但還沒做的事。看到想一起的，按一下跟我說。",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-Hant-TW" className={`${body.variable} ${mono.variable} ${hand.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}

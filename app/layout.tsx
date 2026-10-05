import type { Metadata } from "next";
import { IBM_Plex_Mono, Iansui, Noto_Sans_TC } from "next/font/google";
import "./globals.css";

const body = Noto_Sans_TC({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-body", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });
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
    <html lang="zh-Hant-TW" className={`${body.variable} ${mono.variable} ${hand.variable}`}>
      <body>{children}</body>
    </html>
  );
}

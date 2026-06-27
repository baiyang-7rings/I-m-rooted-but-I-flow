import type { Metadata } from "next";
import { Special_Elite, AR_One_Sans, Noto_Sans_HK } from "next/font/google";
import "./globals.css";

const specialElite = Special_Elite({
  weight: "400",
  variable: "--font-special-elite",
  subsets: ["latin"],
  display: "swap",
});

const arOneSans = AR_One_Sans({
  variable: "--font-ar-one-sans",
  subsets: ["latin"],
  display: "swap",
});

const notoSansHK = Noto_Sans_HK({
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-hk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jackie's Sketchbook",
  description: "Personal portfolio and sketchbook — 意识才是唯一的现实",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${specialElite.variable} ${arOneSans.variable} ${notoSansHK.variable} antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}

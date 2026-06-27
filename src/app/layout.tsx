import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jackie's Sketchbook",
  description: "Personal portfolio and sketchbook",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

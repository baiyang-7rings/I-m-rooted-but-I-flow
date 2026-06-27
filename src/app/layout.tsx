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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=AR+One+Sans:wght@400;500&family=Special+Elite&family=Noto+Sans+HK:wght@400;500&family=Noto+Sans+SC:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}

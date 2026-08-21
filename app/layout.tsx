import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "加入 PR｜深大志联宣传部 2026 招新",
  description: "摄影、平面设计、公众号——把你的灵感，做成校园里真正发生的作品。",
  openGraph: {
    title: "加入 PR｜深大志联宣传部 2026 招新",
    description: "摄影、平面设计、公众号——把你的灵感做成真实作品。",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "深大志联宣传部 2026 招新",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "加入 PR｜深大志联宣传部 2026 招新",
    description: "摄影、平面设计、公众号——把你的灵感做成真实作品。",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
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

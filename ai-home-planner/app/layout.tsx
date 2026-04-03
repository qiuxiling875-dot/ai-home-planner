import type { Metadata, Viewport } from "next";
import "./globals.css";

// ============================================================
// 根布局 - SEO元数据 + 字体 + 全局结构
// ============================================================

export const metadata: Metadata = {
  title: "毛胚房AI规划神器 | 整套房子AI设计工具",
  description:
    "上传整套毛胚房照片（5-8张），AI帮你生成风格统一的全屋规划方案。从客厅到卫生间，一套搞定。支持北欧/简约/温馨/日式等8种风格，3分钟出图。",
  keywords: [
    "毛胚房",
    "AI设计",
    "装修规划",
    "全屋设计",
    "室内设计",
    "AI渲染",
    "装修效果图",
    "风格统一",
    "小红书装修",
  ],
  authors: [{ name: "毛胚房AI规划神器" }],
  openGraph: {
    title: "毛胚房AI规划神器 | 3分钟生成整套房子规划方案",
    description:
      "上传毛胚房照片，AI生成风格统一的全屋规划。基础版¥39起，已服务12,847套房。",
    type: "website",
    locale: "zh_CN",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FAF8F5",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* 预连接字体CDN加速加载 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-brand-cream text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}

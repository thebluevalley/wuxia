import type { Metadata } from "next";
import { Noto_Serif_SC } from "next/font/google"; // 引入宋体
import "./globals.css";

// 加载字体
const notoSerif = Noto_Serif_SC({ 
  subsets: ["latin"], 
  weight: ["400", "700"],
  variable: "--font-serif", // 定义变量
});

export const metadata: Metadata = {
  title: "云游江湖",
  description: "AI驱动的放置武侠",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className={`${notoSerif.variable} font-serif bg-[#fcf9f2] text-stone-800`}>
        {children}
      </body>
    </html>
  );
}
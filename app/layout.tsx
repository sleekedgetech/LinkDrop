import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "LinkDrop | Clean Video Downloader & Community Bot",
  description: "Download TikTok, Instagram, YouTube, and Snapchat videos without watermarks. High-speed media extraction.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${manrope.variable} font-sans antialiased bg-obsidian-950 text-gray-100 min-h-screen bg-grid selection:bg-brand-cyan/20 selection:text-brand-cyan`}>
        {children}
      </body>
    </html>
  );
}


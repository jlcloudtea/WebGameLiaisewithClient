import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Scope Creep & Paper Trails — ICT Game",
  description: "An educational ICT game about managing client requirements. Navigate verbal traps, document everything, and score points!",
  keywords: ["ICT", "game", "client requirements", "documentation", "education"],
  authors: [{ name: "Scope Creep & Paper Trails" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Scope Creep & Paper Trails",
    description: "An educational ICT game about managing client requirements",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Scope Creep & Paper Trails",
    description: "An educational ICT game about managing client requirements",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

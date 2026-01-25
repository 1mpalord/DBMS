import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TimerProvider } from "@/context/TimerContext";
import { TimerDisplay } from "@/components/shared/TimerDisplay";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VectorViz - 3D Hybrid Search Demo",
  description: "Interactive 3D visualization of semantic, lexical, and hybrid search techniques.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TimerProvider>
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            <TimerDisplay />
          </div>
          {children}
        </TimerProvider>
      </body>
    </html>
  );
}

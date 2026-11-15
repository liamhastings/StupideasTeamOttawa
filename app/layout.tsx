import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, Unbounded } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import { ToastProvider } from "@/components/ui/Toast";

const display = Unbounded({ subsets: ["latin"], variable: "--font-unbounded" });
const sans = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken" });

export const metadata: Metadata = {
  title: "Grinder: find a teammate. 0 miles away.",
  description: "Swipe on hackers. Match on skills. Merge teams.",
};
export const viewport: Viewport = { themeColor: "#12141c", viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full antialiased`}>
      <body className="min-h-full">
        <ToastProvider>
          <AppShell>{children}</AppShell>
        </ToastProvider>
      </body>
    </html>
  );
}

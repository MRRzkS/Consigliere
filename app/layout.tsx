import type { Metadata } from "next";
import { Playfair_Display, Courier_Prime } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const courier = Courier_Prime({
  variable: "--font-courier",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Consigliere",
  description: "The Don's Personal Dashboard",
};

import { PomodoroOverlay } from "@/components/global/PomodoroOverlay";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${playfair.variable} ${courier.variable} antialiased bg-background text-foreground font-sans`}
      >
        {children}
        <PomodoroOverlay />
      </body>
    </html>
  );
}

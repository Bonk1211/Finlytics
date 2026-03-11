import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/topnav";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Finlytics | AI for ASEAN MSMEs",
  description:
    "Democratizing enterprise-grade AI tools for ASEAN MSMEs — credit scoring, trade navigation, and market analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <TopNav />
        <main className="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}

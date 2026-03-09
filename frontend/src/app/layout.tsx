import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/sidebar";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MSME Growth Platform | AI for Inclusive ASEAN Trade",
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
        <Sidebar />
        <main
          style={{
            marginLeft: "var(--sidebar-width)",
            minHeight: "100vh",
            padding: "24px 32px",
          }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}

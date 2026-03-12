import type { Metadata } from "next";
import { Inter, Noto_Sans_SC, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/topnav";
import { LanguageProvider } from "@/lib/language-context";
import { AppModeProvider } from "@/lib/mode-context";
import ClientLayout from "@/components/client-layout";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const notoSC = Noto_Sans_SC({
  variable: "--font-noto-sc",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const notoThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
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
      <body className={`${inter.variable} ${notoSC.variable} ${notoThai.variable} antialiased`}>
        <LanguageProvider>
          <AppModeProvider>
            <ClientLayout>
              {children}
            </ClientLayout>
          </AppModeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

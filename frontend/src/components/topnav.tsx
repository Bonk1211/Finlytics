"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import {
  LayoutDashboard,
  Building,
  Package,
  PieChart,
  Globe,
  Search,
  Waves,
  ChevronDown,
  Bot,
} from "lucide-react";
import clsx from "clsx";
import { useLanguage, SUPPORTED_LOCALES, type Locale } from "@/lib/language-context";
import { useAppMode } from "@/lib/mode-context";

const NAV_ITEMS = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/credit-scoring", labelKey: "nav.creditScoring", icon: Building },
  { href: "/supply-chain", labelKey: "nav.supplyChain", icon: Package },
  { href: "/", labelKey: "nav.marketAnalytics", icon: PieChart },
  { href: "/trade-navigator", labelKey: "nav.tradeNavigator", icon: Globe },
  { href: "/visibility-engine", labelKey: "nav.visibility", icon: Search },
];

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const { locale, setLocale, t } = useLanguage();
  const { mode, setMode } = useAppMode();
  const isAiPage = pathname === "/ai";

  // Close lang dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const currentLocale = SUPPORTED_LOCALES.find((l) => l.code === locale)!;
  const isHome = pathname === "/" && !isAiPage;

  return (
    <>
      <nav
        className={clsx(
          "fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-8 gap-8 transition-all",
          "bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm"
        )}
      >
        {/* Simple Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
            <Waves className="w-5 h-5 text-white" />
          </div>
          <span className={clsx(
            "text-lg font-black tracking-tighter",
            "text-gray-900"
          )}>
            Finlytics
          </span>
        </Link>

        {/* Minimal Nav links — hidden on AI page */}
        {!isAiPage && (
          <div className="flex items-center gap-1">
            {NAV_ITEMS.slice(0, 4).map(({ href, labelKey, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-bold transition-all whitespace-nowrap",
                    active
                      ? "bg-gray-900 text-white"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  {t(labelKey)}
                </Link>
              );
            })}
          </div>
        )}

        <div className="flex-1" />

        {/* Language Switcher */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setLangOpen((v) => !v)}
            className={clsx(
              "flex items-center gap-2 text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-full transition-all border",
              "text-gray-500 border-gray-100 hover:border-gray-200 hover:bg-gray-50"
            )}
          >
            <span>{currentLocale.code}</span>
            <ChevronDown className="w-3 h-3 opacity-50" />
          </button>

          {langOpen && (
            <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 min-w-[200px] z-[80] animate-in fade-in slide-in-from-top-2 duration-200">
              {SUPPORTED_LOCALES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLocale(l.code);
                    setLangOpen(false);
                  }}
                  className={clsx(
                    "w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold transition-colors text-left",
                    locale === l.code
                      ? "bg-gray-50 text-emerald-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <span className="text-lg">{l.flag}</span>
                  <span>{l.nativeLabel}</span>
                  {locale === l.code && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mode Toggle: Dashboard <-> AI */}
        <button
          onClick={() => {
            if (isAiPage) {
              setMode("manual");
              router.push("/dashboard");
            } else {
              setMode("ai");
              router.push("/ai");
            }
          }}
          className={clsx(
            "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all border",
            "text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
          )}
        >
          {isAiPage ? (
            <>
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </>
          ) : (
            <>
              <Bot className="w-3.5 h-3.5" />
              AI Assistant
            </>
          )}
        </button>
      </nav>
    </>
  );
}

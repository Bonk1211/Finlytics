"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  Building,
  Package,
  PieChart,
  Globe,
  Search,
  MessageSquare,
  X,
  Waves,
  ChevronDown,
  Cpu,
} from "lucide-react";
import clsx from "clsx";
import AIChat from "./ai-chat";
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
  const [chatOpen, setChatOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const { locale, setLocale, t } = useLanguage();
  const { mode } = useAppMode();

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

  // Hide entirely in AI mode or if on AI page
  if (mode === "ai" || pathname === "/ai") return null;

  const currentLocale = SUPPORTED_LOCALES.find((l) => l.code === locale)!;
  const isHome = pathname === "/";

  return (
    <>
      <nav
        className={clsx(
          "fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-8 gap-8 transition-all",
          isHome
            ? "bg-black/10 backdrop-blur-md border-b border-white/5"
            : "bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm"
        )}
      >
        {/* Simple Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
            <Waves className="w-5 h-5 text-white" />
          </div>
          <span className={clsx(
            "text-lg font-black tracking-tighter",
            isHome ? "text-white" : "text-gray-900"
          )}>
            Finlytics
          </span>
        </Link>

        {/* Minimal Nav links */}
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
                    ? isHome
                      ? "bg-white/20 text-white"
                      : "bg-gray-900 text-white"
                    : isHome
                    ? "text-white/60 hover:text-white hover:bg-white/10"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                {t(labelKey)}
              </Link>
            );
          })}
        </div>

        <div className="flex-1" />

        {/* Language Switcher */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setLangOpen((v) => !v)}
            className={clsx(
              "flex items-center gap-2 text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-full transition-all border",
              isHome
                ? "text-white/70 border-white/10 hover:border-white/30 hover:bg-white/5"
                : "text-gray-500 border-gray-100 hover:border-gray-200 hover:bg-gray-50"
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

        <button
          onClick={() => setChatOpen(true)}
          className={clsx(
            "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all border",
            isHome
              ? "text-white border-white/25 hover:bg-white/10"
              : "text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
          )}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          AI Chat
        </button>
      </nav>

      {/* ── Finlytics AI Chat Drawer (Only in manual mode) ── */}
      {chatOpen && (
        <div
          className="fixed inset-0 z-[60] bg-white/70 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setChatOpen(false)}
        />
      )}

      <div
        className={clsx(
          "fixed top-0 right-0 h-full w-[480px] z-[70] bg-gradient-to-b from-white to-slate-50 shadow-2xl transition-transform duration-500 ease-in-out flex flex-col border-l border-slate-100",
          chatOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white/90">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-emerald-100 ring-1 ring-emerald-200/70 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-emerald-600" />
             </div>
             <div>
               <h2 className="text-lg font-black tracking-tight">Finlytics Assistant</h2>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enterprise Support</p>
             </div>
          </div>
          <button
            onClick={() => setChatOpen(false)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden p-5">
          <AIChat onNavigate={() => setChatOpen(false)} />
        </div>
      </div>
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
} from "lucide-react";
import clsx from "clsx";
import AIChat from "./ai-chat";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/credit-scoring", label: "Credit Scoring", icon: Building },
  { href: "/supply-chain", label: "Supply Chain", icon: Package },
  { href: "/", label: "Market Analytics", icon: PieChart },
  { href: "/trade-navigator", label: "Trade Navigator", icon: Globe },
  { href: "/visibility-engine", label: "Visibility", icon: Search },
];

export default function TopNav() {
  const pathname = usePathname();
  const [chatOpen, setChatOpen] = useState(false);

  const isHome = pathname === "/";

  return (
    <>
      {/* ── Top Navigation Bar ── */}
      <nav
        className={clsx(
          "fixed top-0 left-0 right-0 z-50 h-[60px] flex items-center px-4 gap-3",
          isHome
            ? "bg-black/70 backdrop-blur-md border-b border-white/10"
            : "bg-white border-b border-gray-100 shadow-sm"
        )}
      >
        {/* Brand + Chatbot CTA (biggest element) */}
        <button
          onClick={() => setChatOpen(true)}
          className={clsx(
            "flex items-center gap-2.5 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 mr-2",
            "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30",
            "hover:from-emerald-400 hover:to-teal-400 hover:scale-105 active:scale-100",
            "shrink-0"
          )}
        >
          {/* Logo mark */}
          <div className="relative">
            <Waves className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-white rounded-full animate-pulse" />
          </div>
          <span className="text-base font-black tracking-tight">Finlytics</span>
          <MessageSquare className="w-4 h-4 opacity-80 ml-0.5" />
        </button>

        {/* Divider */}
        <div className={clsx("w-px h-6 mx-1 shrink-0", isHome ? "bg-white/20" : "bg-gray-200")} />

        {/* Nav links */}
        <div className="flex items-center gap-0.5 flex-1 overflow-x-auto hide-scrollbar">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150",
                  active
                    ? isHome
                      ? "bg-white/15 text-white"
                      : "bg-emerald-50 text-emerald-600"
                    : isHome
                    ? "text-white/60 hover:text-white hover:bg-white/10"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right side tag */}
        <div className={clsx("text-[10px] font-bold uppercase tracking-widest shrink-0 px-2 py-1 rounded-md", isHome ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" : "text-emerald-600 bg-emerald-50 border border-emerald-100")}>
          ASEAN MSME AI
        </div>
      </nav>

      {/* ── Finlytics AI Chat Panel ── */}
      {/* Backdrop */}
      {chatOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm"
          onClick={() => setChatOpen(false)}
        />
      )}

      {/* Chat drawer */}
      <div
        className={clsx(
          "fixed top-0 right-0 h-full w-[520px] z-[70] bg-white shadow-[-10px_0_40px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-in-out flex flex-col",
          chatOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Chat Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-500 to-teal-500">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Waves className="w-6 h-6 text-white" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white leading-tight">Finlytics AI</h2>
              <p className="text-[11px] text-emerald-100 font-medium">ASEAN MSME Intelligence Assistant</p>
            </div>
          </div>
          <button
            onClick={() => setChatOpen(false)}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Capability pills */}
        <div className="flex gap-2 px-4 py-2.5 border-b border-gray-100 bg-gray-50 overflow-x-auto hide-scrollbar">
          {["Credit Scoring", "Supply Chain", "Trade Rules", "Market Insights", "Loan Calc"].map((cap) => (
            <span key={cap} className="shrink-0 text-[10px] font-bold bg-white border border-gray-200 text-gray-600 px-2 py-1 rounded-full">
              {cap}
            </span>
          ))}
        </div>

        {/* Chat Widget */}
        <div className="flex-1 overflow-hidden p-4 bg-gray-50">
          <AIChat />
        </div>
      </div>
    </>
  );
}

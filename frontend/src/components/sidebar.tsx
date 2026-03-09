"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  Globe,
  TrendingUp,
  Bot,
  ChevronRight,
  Boxes,
} from "lucide-react";
import clsx from "clsx";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/credit", label: "Credit Scoring", icon: CreditCard },
  { href: "/trade", label: "Trade Navigator", icon: Globe },
  { href: "/market", label: "Market Analysis", icon: TrendingUp },
  { href: "/ai", label: "AI Assistant", icon: Bot },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: "var(--color-primary)" }}
        >
          <Boxes className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
            MSME Growth
          </h1>
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            AI Platform
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        <p
          className="text-xs font-semibold uppercase tracking-wider px-4 mb-2"
          style={{ color: "var(--text-tertiary)" }}
        >
          Menu
        </p>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx("sidebar-link", isActive && "active")}
            >
              <Icon className="h-[18px] w-[18px]" />
              <span className="flex-1">{label}</span>
              {isActive && (
                <ChevronRight className="h-4 w-4" style={{ color: "var(--text-tertiary)" }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* AI Promo Card */}
      <div
        className="rounded-2xl p-4 mt-4"
        style={{
          background: "linear-gradient(135deg, var(--color-ai-purple), var(--color-primary))",
        }}
      >
        <Bot className="h-8 w-8 text-white mb-2 opacity-80" />
        <p className="text-sm font-semibold text-white">AI-Powered Insights</p>
        <p className="text-xs text-white/70 mt-1">
          Get instant analysis for your ASEAN business
        </p>
        <Link
          href="/ai"
          className="mt-3 inline-block text-xs font-semibold text-white bg-white/20 rounded-full px-3 py-1.5 hover:bg-white/30 transition"
        >
          Try Now
        </Link>
      </div>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building,
  Package,
  PieChart,
  Globe,
  Search,
  Lock,
  User
} from "lucide-react";
import clsx from "clsx";

const NAV_SECTIONS = [
  {
    title: "CORE INTELLIGENCE & TRADE",
    items: [
      { href: "/", label: "Dashboard Overview", icon: LayoutDashboard },
      { href: "/credit-scoring", label: "Alternative Credit Scoring", icon: Building },
      { href: "/supply-chain", label: "Automated Supply Chain", icon: Package },
      { href: "/worldmonitor", label: "Predictive Market Analytics", icon: PieChart },
      { href: "/trade-navigator", label: "Cross-Border Trade", icon: Globe },
      { href: "/visibility-engine", label: "Business Visibility", icon: Search },
    ]
  },
  {
    title: "ADMIN SETTINGS",
    items: [
      { href: "/security", label: "Security", icon: Lock },
      { href: "/account", label: "Account Settings", icon: User },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar overflow-y-auto custom-scrollbar">
      {/* Brand */}
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="flex text-green-500">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Finlytics
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-6 flex-1">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="text-[10px] font-semibold uppercase tracking-wider px-4 mb-2 text-gray-400">
              {section.title}
            </p>
            <div className="flex flex-col gap-1">
              {section.items.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={clsx(
                      "flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150",
                      isActive 
                        ? "bg-green-50 text-green-600" 
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                    <span className="flex-1">{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

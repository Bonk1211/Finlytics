"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  ListTodo,
  AlertOctagon,
  Activity,
  Package,
  Receipt,
  FileText,
  PieChart,
  BookOpen,
  Scale,
  Database,
  Link as LinkIcon,
  ShieldCheck,
  Bot,
  ArrowDownToLine,
  Lock,
  HeartHandshake,
  User,
  Boxes,
  Globe
} from "lucide-react";
import clsx from "clsx";

const NAV_SECTIONS = [
  {
    title: "FINANCIAL MANAGEMENT",
    items: [
      { href: "/", label: "Dashboard Overview", icon: LayoutDashboard },
      { href: "/process-manager", label: "Process Manager", icon: ListTodo },
      { href: "/exception-manager", label: "Exception Manager", icon: AlertOctagon },
    ]
  },
  {
    title: "OPERATION & REPORTING",
    items: [
      { href: "/pnl-monitoring", label: "Profit & Loss Monitoring", icon: Activity },
      { href: "/inventory", label: "Stock Inventory", icon: Package },
      { href: "/price-verification", label: "Indt. Price Verification", icon: Receipt },
      { href: "/report-manager", label: "Report Manager", icon: FileText },
      { href: "/analytics", label: "Analytics", icon: PieChart },
    ]
  },
  {
    title: "COMPLIANCE & RISK MANAGEMENT",
    items: [
      { href: "/accounting", label: "Accounting", icon: BookOpen },
      { href: "/regulatory", label: "Regulatory", icon: Scale },
    ]
  },
  {
    title: "DATA & AUTOMATION",
    items: [
      { href: "/market-data", label: "Market Data", icon: Database },
      { href: "/reference-data", label: "Reference Data", icon: LinkIcon },
      { href: "/policies", label: "Policies & Rules", icon: ShieldCheck },
      { href: "/finance-assist", label: "AI-Finance Assist", icon: Bot },
      { href: "/data-import", label: "Data Import", icon: ArrowDownToLine },
      { href: "/worldmonitor", label: "World Monitor", icon: Globe },
    ]
  },
  {
    title: "ADMIN SETTINGS",
    items: [
      { href: "/security", label: "Security", icon: Lock },
      { href: "/support", label: "Help & Support", icon: HeartHandshake },
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

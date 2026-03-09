"use client";

import {
  DollarSign,
  CreditCard,
  Globe,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  FileText,
  BarChart3,
} from "lucide-react";
import MetricCard from "@/components/metric-card";
import ChartCard from "@/components/chart-card";
import AIChat from "@/components/ai-chat";

// ── Mock data for dashboard ──
const revenueData = [
  { name: "Jul", value: 12400 },
  { name: "Aug", value: 14800 },
  { name: "Sep", value: 13200 },
  { name: "Oct", value: 16700 },
  { name: "Nov", value: 18100 },
  { name: "Dec", value: 17200 },
  { name: "Jan", value: 19500 },
  { name: "Feb", value: 21300 },
  { name: "Mar", value: 23800 },
];

const tradeVolumeData = [
  { name: "Jul", value: 45 },
  { name: "Aug", value: 52 },
  { name: "Sep", value: 48 },
  { name: "Oct", value: 61 },
  { name: "Nov", value: 55 },
  { name: "Dec", value: 67 },
  { name: "Jan", value: 72 },
  { name: "Feb", value: 78 },
  { name: "Mar", value: 85 },
];

const RECENT_ACTIVITIES = [
  {
    type: "credit",
    label: "Credit Assessment Completed",
    detail: "Score: 742 — Low Risk",
    time: "2 hours ago",
    positive: true,
  },
  {
    type: "trade",
    label: "Compliance Doc Generated",
    detail: "Certificate of Origin — MY → SG",
    time: "5 hours ago",
    positive: true,
  },
  {
    type: "market",
    label: "Supply Chain Alert",
    detail: "Palm oil price spike detected (+8.2%)",
    time: "1 day ago",
    positive: false,
  },
  {
    type: "credit",
    label: "Loan Match Found",
    detail: "Tier 1 Micro-finance — RM 50,000",
    time: "2 days ago",
    positive: true,
  },
  {
    type: "market",
    label: "Market Forecast Updated",
    detail: "Q2 demand forecast for electronics",
    time: "3 days ago",
    positive: true,
  },
];

const activityIcons: Record<string, { icon: typeof CreditCard; bg: string; color: string }> = {
  credit: { icon: ShieldCheck, bg: "var(--color-success-light)", color: "var(--color-success)" },
  trade: { icon: FileText, bg: "var(--color-primary-light)", color: "var(--color-primary)" },
  market: { icon: BarChart3, bg: "var(--color-warning-light)", color: "var(--color-warning)" },
};

export default function DashboardPage() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Overview of your MSME business performance across ASEAN markets
        </p>
      </div>

      {/* Metrics Row — Bento Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <MetricCard
          title="Monthly Revenue"
          value="$23,800"
          subtitle="March 2026"
          change={{ value: "12.3%", positive: true }}
          icon={DollarSign}
        />
        <MetricCard
          title="Smart Credit Score"
          value="742"
          subtitle="Low Risk"
          change={{ value: "18 pts", positive: true }}
          icon={CreditCard}
          iconBg="var(--color-success-light)"
        />
        <MetricCard
          title="Active Trade Routes"
          value="5"
          subtitle="MY, SG, ID, TH, VN"
          icon={Globe}
          iconBg="var(--color-ai-lavender)"
        />
        <MetricCard
          title="Market Sentiment"
          value="Bullish"
          subtitle="ASEAN Electronics"
          change={{ value: "3.2%", positive: true }}
          icon={TrendingUp}
          iconBg="var(--color-warning-light)"
        />
      </div>

      {/* Charts Row — Bento Box */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <ChartCard
          title="Revenue Trend"
          subtitle="Last 9 months"
          data={revenueData}
          color="#3B82F6"
          headerRight={
            <span className="badge badge-success">
              <ArrowUpRight className="h-3 w-3" /> 12.3%
            </span>
          }
        />
        <ChartCard
          title="Cross-Border Shipments"
          subtitle="Monthly trade volume"
          data={tradeVolumeData}
          color="#8B5CF6"
          headerRight={
            <span className="badge badge-success">
              <ArrowUpRight className="h-3 w-3" /> 8.9%
            </span>
          }
        />
      </div>

      {/* Bottom Row — Activities + AI Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Recent Activities */}
        <div className="lg:col-span-3 card">
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            Recent Activities
          </h3>
          <div className="space-y-3">
            {RECENT_ACTIVITIES.map((activity, i) => {
              const { icon: Icon, bg, color } = activityIcons[activity.type];
              return (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0"
                    style={{ background: bg }}
                  >
                    <Icon className="h-4 w-4" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {activity.label}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                      {activity.detail}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {activity.positive ? (
                      <ArrowUpRight className="h-3.5 w-3.5" style={{ color: "var(--color-success)" }} />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5" style={{ color: "var(--color-danger)" }} />
                    )}
                    <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                      {activity.time}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Chat Widget */}
        <div className="lg:col-span-2">
          <AIChat />
        </div>
      </div>
    </div>
  );
}

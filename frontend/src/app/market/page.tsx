"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Newspaper,
  DollarSign,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from "lucide-react";
import MetricCard from "@/components/metric-card";
import ChartCard from "@/components/chart-card";

// ── Mock demand forecast data ──
const demandForecastData = [
  { name: "Apr", value: 1200 },
  { name: "May", value: 1350 },
  { name: "Jun", value: 1180 },
  { name: "Jul", value: 1420 },
  { name: "Aug", value: 1580 },
  { name: "Sep", value: 1710 },
];

const priceIndexData = [
  { name: "Oct", value: 102 },
  { name: "Nov", value: 105 },
  { name: "Dec", value: 98 },
  { name: "Jan", value: 108 },
  { name: "Feb", value: 112 },
  { name: "Mar", value: 115 },
];

// ── Mock market news ──
const MARKET_NEWS = [
  {
    title: "ASEAN Electronics Exports Surge 15% in Q1 2026",
    source: "Reuters",
    sentiment: "positive" as const,
    time: "2 hours ago",
    regions: ["MY", "SG", "VN"],
  },
  {
    title: "Palm Oil Prices Hit 6-Month High on Supply Concerns",
    source: "Bloomberg",
    sentiment: "negative" as const,
    time: "5 hours ago",
    regions: ["MY", "ID"],
  },
  {
    title: "Thailand-Vietnam Rail Link to Boost Trade Corridor",
    source: "Nikkei Asia",
    sentiment: "positive" as const,
    time: "1 day ago",
    regions: ["TH", "VN"],
  },
  {
    title: "RCEP Implementation Reduces Tariff Barriers Further",
    source: "ASEAN Briefing",
    sentiment: "positive" as const,
    time: "2 days ago",
    regions: ["ASEAN-wide"],
  },
  {
    title: "Semiconductor Shortage Eases in Southeast Asia",
    source: "TechInAsia",
    sentiment: "positive" as const,
    time: "3 days ago",
    regions: ["MY", "SG", "PH"],
  },
];

// ── Mock pricing suggestions ──
const PRICING_SUGGESTIONS = [
  {
    product: "Electronic Components",
    currentPrice: "$12.50",
    suggestedPrice: "$13.80",
    change: "+10.4%",
    market: "Singapore",
    confidence: 87,
  },
  {
    product: "Palm Oil (Crude)",
    currentPrice: "$850/MT",
    suggestedPrice: "$920/MT",
    change: "+8.2%",
    market: "Indonesia",
    confidence: 92,
  },
  {
    product: "Textile Fabrics",
    currentPrice: "$4.20/m",
    suggestedPrice: "$3.95/m",
    change: "-5.9%",
    market: "Vietnam",
    confidence: 78,
  },
];

export default function MarketPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "news" | "pricing">("overview");

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Predictive Market Analysis
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Actionable business intelligence and forecasting for MSME operations
          </p>
        </div>
        <button className="btn-secondary">
          <RefreshCw className="h-4 w-4" /> Refresh Data
        </button>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2 mb-6">
        {(
          [
            { key: "overview", label: "Forecast Overview", icon: BarChart3 },
            { key: "news", label: "Market News", icon: Newspaper },
            { key: "pricing", label: "Dynamic Pricing", icon: DollarSign },
          ] as const
        ).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={activeTab === key ? "btn-primary" : "btn-secondary"}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Forecast Overview Tab ── */}
      {activeTab === "overview" && (
        <>
          {/* Top Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            <MetricCard
              title="Demand Forecast"
              value="+18.2%"
              subtitle="Next quarter projection"
              change={{ value: "18.2%", positive: true }}
              icon={TrendingUp}
              iconBg="var(--color-success-light)"
            />
            <MetricCard
              title="Price Index"
              value="115"
              subtitle="vs. baseline 100"
              change={{ value: "6.7%", positive: true }}
              icon={BarChart3}
            />
            <MetricCard
              title="Supply Risk"
              value="Medium"
              subtitle="2 active alerts"
              icon={Package}
              iconBg="var(--color-warning-light)"
            />
            <MetricCard
              title="Market Sentiment"
              value="72%"
              subtitle="Positive news ratio"
              change={{ value: "5%", positive: true }}
              icon={Newspaper}
              iconBg="var(--color-ai-lavender)"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
            <ChartCard
              title="Sales Volume Prediction"
              subtitle="Next 6 months forecast"
              data={demandForecastData}
              color="#10B981"
              headerRight={
                <span className="badge badge-success">
                  <ArrowUpRight className="h-3 w-3" /> Growing
                </span>
              }
            />
            <ChartCard
              title="Commodity Price Index"
              subtitle="Key product basket"
              data={priceIndexData}
              color="#F59E0B"
              type="line"
              headerRight={
                <span className="badge badge-warning">
                  <ArrowUpRight className="h-3 w-3" /> +6.7%
                </span>
              }
            />
          </div>

          {/* Supply Chain Alerts */}
          <div className="card">
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Supply Chain Risk Alerts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 rounded-xl p-4" style={{ background: "var(--color-warning-light)" }}>
                <Package className="h-5 w-5 mt-0.5" style={{ color: "var(--color-warning)" }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    Palm Oil Supply Disruption
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                    Indonesian export restrictions may impact Q2 supply. Consider alternative sourcing from MY.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl p-4" style={{ background: "var(--color-success-light)" }}>
                <TrendingUp className="h-5 w-5 mt-0.5" style={{ color: "var(--color-success)" }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    Electronics Demand Surge
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                    ASEAN electronics demand up 15%. Opportunity to increase inventory for SG and VN markets.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Market News Tab ── */}
      {activeTab === "news" && (
        <div className="card">
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            ASEAN Market Intelligence
          </h3>
          <div className="space-y-3">
            {MARKET_NEWS.map((news, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl p-4 transition"
                style={{ background: "var(--bg-app)" }}
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0"
                  style={{
                    background:
                      news.sentiment === "positive"
                        ? "var(--color-success-light)"
                        : "var(--color-danger-light)",
                  }}
                >
                  {news.sentiment === "positive" ? (
                    <TrendingUp className="h-4 w-4" style={{ color: "var(--color-success)" }} />
                  ) : (
                    <TrendingDown className="h-4 w-4" style={{ color: "var(--color-danger)" }} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {news.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                      {news.source}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                      {news.time}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {news.regions.map((r) => (
                    <span
                      key={r}
                      className="text-xs font-medium px-2 py-0.5 rounded-md"
                      style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Dynamic Pricing Tab ── */}
      {activeTab === "pricing" && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              AI Pricing Recommendations
            </h3>
            <span className="badge badge-ai">AI Generated</span>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Target Market</th>
                <th>Current Price</th>
                <th>Suggested Price</th>
                <th>Change</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {PRICING_SUGGESTIONS.map((item, i) => {
                const isPositive = item.change.startsWith("+");
                return (
                  <tr key={i}>
                    <td className="font-medium">{item.product}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{item.market}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{item.currentPrice}</td>
                    <td className="font-semibold">{item.suggestedPrice}</td>
                    <td>
                      <span className={`badge ${isPositive ? "badge-success" : "badge-danger"}`}>
                        {isPositive ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}
                        {item.change}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full" style={{ background: "var(--bg-app)" }}>
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${item.confidence}%`,
                              background:
                                item.confidence > 85
                                  ? "var(--color-success)"
                                  : "var(--color-warning)",
                            }}
                          />
                        </div>
                        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                          {item.confidence}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

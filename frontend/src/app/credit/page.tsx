"use client";

import { useState } from "react";
import {
  CreditCard,
  Building2,
  Banknote,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
} from "lucide-react";
import MetricCard from "@/components/metric-card";
import ChartCard from "@/components/chart-card";
import ScoreGauge from "@/components/score-gauge";

// ── Mock credit history data ──
const creditHistoryData = [
  { name: "Oct", value: 680 },
  { name: "Nov", value: 695 },
  { name: "Dec", value: 702 },
  { name: "Jan", value: 718 },
  { name: "Feb", value: 731 },
  { name: "Mar", value: 742 },
];

const LENDER_MATCHES = [
  {
    name: "ASEAN Micro-Finance Corp",
    type: "Micro-finance",
    maxAmount: "RM 80,000",
    rate: "4.5%",
    status: "Eligible",
  },
  {
    name: "GrabFinance SME",
    type: "P2P Lending",
    maxAmount: "RM 50,000",
    rate: "6.2%",
    status: "Eligible",
  },
  {
    name: "Funding Societies",
    type: "P2P Lending",
    maxAmount: "RM 120,000",
    rate: "5.8%",
    status: "Pre-qualified",
  },
  {
    name: "Bank Rakyat SME",
    type: "Traditional",
    maxAmount: "RM 200,000",
    rate: "3.8%",
    status: "Review Required",
  },
];

export default function CreditPage() {
  const [isAssessing, setIsAssessing] = useState(false);

  const handleAssess = () => {
    setIsAssessing(true);
    // TODO: call scoreCredit API
    setTimeout(() => setIsAssessing(false), 2000);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Credit Scoring Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Alternative credit assessment based on real-time business health
          </p>
        </div>
        <button className="btn-primary" onClick={handleAssess} disabled={isAssessing}>
          {isAssessing ? "Assessing..." : "Run Assessment"}
        </button>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <MetricCard
          title="Monthly Revenue"
          value="$23,800"
          change={{ value: "12.3%", positive: true }}
          icon={Banknote}
        />
        <MetricCard
          title="POS Transactions"
          value="1,247"
          subtitle="Last 30 days"
          change={{ value: "8.1%", positive: true }}
          icon={CreditCard}
        />
        <MetricCard
          title="On-Time Payments"
          value="94%"
          subtitle="Supplier payment consistency"
          icon={Clock}
          iconBg="var(--color-success-light)"
        />
        <MetricCard
          title="Years in Business"
          value="4.5"
          subtitle="Established 2021"
          icon={Building2}
          iconBg="var(--color-ai-lavender)"
        />
      </div>

      {/* Score Gauge + History Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <ScoreGauge score={742} label="Smart Credit Score" riskLevel="Low" />

        <div className="lg:col-span-2">
          <ChartCard
            title="Credit Score Trend"
            subtitle="6-month history"
            data={creditHistoryData}
            color="#10B981"
            headerRight={
              <span className="badge badge-success">
                <ArrowUpRight className="h-3 w-3" /> +62 pts
              </span>
            }
          />
        </div>
      </div>

      {/* Lender Matches Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Matched Lenders & Micro-finance
          </h3>
          <span className="badge badge-ai">AI Matched</span>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Lender</th>
              <th>Type</th>
              <th>Max Amount</th>
              <th>Interest Rate</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {LENDER_MATCHES.map((lender, i) => (
              <tr key={i}>
                <td>
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ background: "var(--color-primary-light)" }}
                    >
                      <Building2
                        className="h-4 w-4"
                        style={{ color: "var(--color-primary)" }}
                      />
                    </div>
                    <span className="font-medium">{lender.name}</span>
                  </div>
                </td>
                <td style={{ color: "var(--text-secondary)" }}>{lender.type}</td>
                <td className="font-semibold">{lender.maxAmount}</td>
                <td style={{ color: "var(--text-secondary)" }}>{lender.rate} p.a.</td>
                <td>
                  {lender.status === "Eligible" ? (
                    <span className="badge badge-success">
                      <CheckCircle className="h-3 w-3" /> {lender.status}
                    </span>
                  ) : lender.status === "Pre-qualified" ? (
                    <span className="badge badge-warning">
                      <ShieldCheck className="h-3 w-3" /> {lender.status}
                    </span>
                  ) : (
                    <span className="badge badge-danger">
                      <AlertTriangle className="h-3 w-3" /> {lender.status}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

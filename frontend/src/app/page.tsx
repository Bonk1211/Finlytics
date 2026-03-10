"use client";

import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Calendar,
  Download,
  ExternalLink,
  ChevronDown
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

// ── Mock data for "Cash Flow Insights" ──
// Mimicking a waterfall/stacked bar positive/negative spread
const cashFlowData = Array.from({ length: 31 }, (_, i) => ({
  day: i + 1,
  cashIn: Math.floor(Math.random() * 30000) + 20000,
  cashOut: -(Math.floor(Math.random() * 20000) + 10000),
}));

// ── Mock data for "Profit & Loss Monitoring" ──
const pnlData = [
  { time: "10:00 AM", income: 200, expenses: 150, profit: 50 },
  { time: "11:00 AM", income: 400, expenses: 370, profit: 30 },
  { time: "12:00 PM", income: 770, expenses: 400, profit: 370 },
  { time: "1:00 PM", income: 800, expenses: 450, profit: 350 },
  { time: "2:00 PM", income: 1000, expenses: 500, profit: 500 },
  { time: "3:00 PM", income: 1000, expenses: 500, profit: 500 },
  { time: "4:00 PM", income: 1000, expenses: 500, profit: 500 },
  { time: "5:00 PM", income: 1000, expenses: 500, profit: 500 },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* ── Top Header Bar ── */}
      <div className="flex items-center justify-between pb-2">
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          Dashboard Overview
        </h1>
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search finance data..."
              className="pl-9 pr-8 py-2 w-64 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-green-500 transition-colors"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className="text-[10px] bg-gray-100 border border-gray-200 rounded px-1 text-gray-400 font-mono">⌘</span>
              <span className="text-[10px] bg-gray-100 border border-gray-200 rounded px-1 text-gray-400 font-mono">P</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Report Currency</span>
            <button className="flex items-center gap-1 text-sm font-semibold border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">
              USD <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm font-medium border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 cursor-pointer">
            <span className="text-gray-500">Report Date</span>
            <span className="text-gray-800 font-semibold flex items-center gap-2">
              19 Jan, 2025 <Calendar className="h-4 w-4 text-gray-400" />
            </span>
          </div>

          <button className="flex items-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 font-bold text-sm px-4 py-2 rounded-lg transition-colors">
            <Download className="h-4 w-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* ── Welcome Title ── */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Good Morning, Alex!</h2>
        <p className="text-sm text-gray-500">Take a look at a glance of all your business how going</p>
      </div>

      {/* ── Main Dashboard Grid ── */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Column: 3 Metric Cards (Span 3) */}
        <div className="col-span-12 xl:col-span-3 flex flex-col gap-4">
          {/* Total Revenue */}
          <div className="bg-white rounded-[16px] p-5 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <DollarSign className="h-4 w-4" /> Total Revenue
              </div>
              <button className="text-[11px] font-semibold flex items-center gap-1 border border-gray-200 rounded px-2 py-0.5 hover:bg-gray-50">
                Analytics <ExternalLink className="h-3 w-3" />
              </button>
            </div>
            <div className="flex items-baseline gap-3 mt-4">
              <span className="text-3xl font-bold tracking-tight text-gray-900">$45,672K</span>
              <span className="flex items-center text-sm font-bold text-green-500">
                <ArrowUpRight className="h-4 w-4 mr-0.5" /> 56%
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-green-500 opacity-20" />
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-green-50 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* Expenses */}
          <div className="bg-white rounded-[16px] p-5 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <TrendingDown className="h-4 w-4" /> Expenses
              </div>
              <button className="text-[11px] font-semibold flex items-center gap-1 border border-gray-200 rounded px-2 py-0.5 hover:bg-gray-50">
                Report Manager <ExternalLink className="h-3 w-3" />
              </button>
            </div>
            <div className="flex items-baseline gap-3 mt-4">
              <span className="text-3xl font-bold tracking-tight text-gray-900">$28,903K</span>
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-50 text-red-500">
                <ArrowDownRight className="h-4 w-4" />
              </div>
            </div>
            <div className="absolute top-4 right-5 text-sm font-bold text-red-500">-0.2%</div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-500 opacity-20" />
          </div>

          {/* Net Profit */}
          <div className="bg-white rounded-[16px] p-5 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <TrendingUp className="h-4 w-4" /> Net Profit
              </div>
              <button className="text-[11px] font-semibold flex items-center gap-1 border border-gray-200 rounded px-2 py-0.5 hover:bg-gray-50">
                P&L <ExternalLink className="h-3 w-3" />
              </button>
            </div>
            <div className="flex items-baseline gap-3 mt-4">
              <span className="text-3xl font-bold tracking-tight text-gray-900">$34,215K</span>
              <span className="flex items-center text-sm font-bold text-green-500">
                <ArrowUpRight className="h-4 w-4 mr-0.5" /> 56%
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-green-500 opacity-20" />
          </div>
        </div>

        {/* Top Right Chart: Cash Flow Insights (Span 9) */}
        <div className="col-span-12 xl:col-span-9 bg-white rounded-[16px] border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900">Cash Flow Insights</h3>
            <div className="flex space-x-2 text-xs font-semibold">
              <button className="px-3 py-1 text-gray-500 hover:text-gray-900">Monthly</button>
              <button className="px-3 py-1 text-gray-500 hover:text-gray-900">Weekly</button>
              <button className="px-3 py-1 text-gray-500 hover:text-gray-900">Daily</button>
              <button className="px-3 py-1 bg-gray-100 text-gray-900 rounded-md">Daily-Columns</button>
            </div>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={0} barSize={12}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <RechartsTooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="cashIn" fill="#10B981" radius={[4, 4, 4, 4]} />
                <Bar dataKey="cashOut" fill="#FBBF24" radius={[4, 4, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 opacity-80">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-600"><div className="w-2 h-2 rounded-full bg-green-500"></div> Cash In</div>
            <div className="flex items-center gap-2 text-xs font-medium text-gray-600"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> Cash Out</div>
            <div className="flex items-center gap-2 text-xs font-medium text-gray-600"><div className="w-4 h-0.5 bg-gray-400"></div> Net Cash</div>
            <div className="flex items-center gap-2 text-xs font-medium text-gray-600"><div className="w-2 h-2 rounded-full border-2 border-gray-400 bg-white"></div> Running Balance</div>
          </div>
        </div>
      </div>

      {/* ── Second Row ── */}
      <div className="grid grid-cols-12 gap-6">
        {/* P&L Monitoring (Span 12) */}
        <div className="col-span-12 xl:col-span-12 bg-white rounded-[16px] border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900">Profit & Loss Monitoring</h3>
            <div className="flex space-x-2 text-xs font-semibold">
              <button className="px-3 py-1 text-gray-500 hover:text-gray-900">Monthly</button>
              <button className="px-3 py-1 text-gray-500 hover:text-gray-900">Weekly</button>
              <button className="px-3 py-1 text-gray-500 hover:text-gray-900">Daily</button>
              <button className="px-3 py-1 bg-gray-100 text-gray-900 rounded-md">Hourly</button>
            </div>
          </div>
          <div className="h-[200px] w-full relative">
             <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pnlData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(val) => `${val}%`} />
                <RechartsTooltip />
                <Line type="stepAfter" dataKey="income" stroke="#FBBF24" strokeWidth={2} dot={false} />
                <Line type="stepAfter" dataKey="expenses" stroke="#3B82F6" strokeWidth={2} dot={false} />
                <Line type="stepAfter" dataKey="profit" stroke="#10B981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 opacity-80">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-600"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> Total Income</div>
            <div className="flex items-center gap-2 text-xs font-medium text-gray-600"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Expenses</div>
            <div className="flex items-center gap-2 text-xs font-medium text-gray-600"><div className="w-2 h-2 rounded-full bg-green-500"></div> Net Profit</div>
          </div>
        </div>

      </div>

    </div>
  );
}

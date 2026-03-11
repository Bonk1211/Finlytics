"use client";

import { useEffect, useState } from "react";

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
  ChevronDown,
  Printer,
  Plus,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowBigDown,
  Briefcase,
  User as UserIcon,
  ShoppingBag
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

const TUTORIAL_STEPS = [
  {
    id: "nav-dashboard",
    selector: "aside a[href='/']",
    title: "Navbar: Dashboard Overview",
    description: "Your control center. It summarizes business performance, cash flow, and operational status in one place.",
  },
  {
    id: "nav-credit",
    selector: "aside a[href='/credit-scoring']",
    title: "Navbar: Alternative Credit Scoring",
    description: "Enter MSME operational data and get AI-based credit score, risk category, and financing guidance.",
  },
  {
    id: "nav-supply",
    selector: "aside a[href='/supply-chain']",
    title: "Navbar: Automated Supply Chain",
    description: "Get supplier recommendations using cost, reliability, and lead-time trade-offs.",
  },
  {
    id: "nav-world",
    selector: "aside a[href='/worldmonitor']",
    title: "Navbar: Predictive Market Analytics",
    description: "Monitor global risk signals and disruptions that can affect demand, shipping, or sourcing.",
  },
  {
    id: "nav-trade",
    selector: "aside a[href='/trade-navigator']",
    title: "Navbar: Cross-Border Trade",
    description: "Use AI chat to understand trade rules, tariffs, HS guidance, and compliance requirements.",
  },
  {
    id: "nav-visibility",
    selector: "aside a[href='/visibility-engine']",
    title: "Navbar: Business Visibility",
    description: "Onboard offline businesses into a trusted digital profile for lenders and supply-chain partners.",
  },
  {
    id: "header",
    title: "Header Controls",
    description: "Use search, report currency/date, and export controls to quickly filter and share business insights.",
  },
  {
    id: "kpi",
    title: "KPI Summary Cards",
    description: "These cards provide a fast snapshot of Total Revenue, Expenses, and Net Profit trends.",
  },
  {
    id: "cashflow",
    title: "Cash Flow Insights",
    description: "Track money in vs money out daily to detect liquidity pressure early.",
  },
  {
    id: "pnl",
    title: "Profit & Loss Monitoring",
    description: "Monitor income, expense, and profit movement over time to see operational efficiency.",
  },
  {
    id: "process",
    title: "Smart Process Manager",
    description: "This section maps operational workflows and exceptions so teams can automate decisions.",
  },
];

export default function DashboardPage() {
  const [tourOpen, setTourOpen] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);
  const [anchor, setAnchor] = useState({ top: 120, left: 120, width: 300, height: 120 });
  const [viewportWidth, setViewportWidth] = useState(1280);

  const activeStep = TUTORIAL_STEPS[tourStepIndex];
  const isLastStep = tourStepIndex === TUTORIAL_STEPS.length - 1;

  const updateAnchor = (step: { id: string; selector?: string }) => {
    const el = step.selector
      ? document.querySelector(step.selector)
      : document.querySelector(`[data-tour="${step.id}"]`);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setAnchor({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
  };

  useEffect(() => {
    if (!tourOpen) return;

    const handleUpdate = () => {
      setViewportWidth(window.innerWidth);
      updateAnchor(activeStep);
    };

    const target = activeStep.selector
      ? document.querySelector(activeStep.selector)
      : document.querySelector(`[data-tour="${activeStep.id}"]`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    }

    handleUpdate();
    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate, true);

    return () => {
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate, true);
    };
  }, [tourOpen, activeStep]);

  const cardLeft = Math.max(
    16,
    Math.min(viewportWidth - 336, anchor.left + anchor.width + 16)
  );
  const cardTop = Math.max(16, anchor.top - 12);

  const highlightClass = (id: string) =>
    tourOpen && activeStep.id === id
      ? "ring-2 ring-green-400 ring-offset-2 ring-offset-white rounded-2xl transition-all duration-200"
      : "";

  const startTour = () => {
    setTourStepIndex(0);
    setTourOpen(true);
  };

  const nextStep = () => {
    if (isLastStep) {
      setTourOpen(false);
      return;
    }
    setTourStepIndex((prev) => prev + 1);
  };

  const prevStep = () => {
    setTourStepIndex((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="flex flex-col gap-6 relative">
      <div className="flex justify-end">
        <button
          onClick={startTour}
          className="inline-flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          Tutorial
        </button>
      </div>
      {/* ── Top Header Bar ── */}
      <div data-tour="header" className={`flex items-center justify-between pb-2 ${highlightClass("header")}`}>
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
        <div data-tour="kpi" className={`col-span-12 xl:col-span-3 flex flex-col gap-4 ${highlightClass("kpi")}`}>
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
        <div data-tour="cashflow" className={`col-span-12 xl:col-span-9 bg-white rounded-[16px] border border-gray-100 shadow-sm p-6 ${highlightClass("cashflow")}`}>
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
        <div data-tour="pnl" className={`col-span-12 xl:col-span-12 bg-white rounded-[16px] border border-gray-100 shadow-sm p-6 ${highlightClass("pnl")}`}>
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

      {/* ── Third Row: Smart Process Manager ── */}
      <div data-tour="process" className={`bg-white rounded-[16px] border border-gray-100 shadow-sm overflow-hidden flex flex-col md:col-span-12 mt-2 ${highlightClass("process")}`}>
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm">Smart Process Manager</h3>
          <button className="flex items-center gap-2 text-xs font-semibold text-gray-600 border border-gray-200 rounded-md px-3 py-1.5 hover:bg-gray-50 bg-white transition-colors">
            Print <Printer className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3 Columns Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 min-h-[400px]">
           {/* Left Column */}
           <div className="border-r border-gray-100 p-5 flex flex-col gap-4 bg-white/50">
              <div className="flex justify-between items-center mb-1">
                 <h4 className="font-bold text-gray-800 text-xs">Insight Metrics Automation</h4>
                 <Plus className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-900" />
              </div>
              <div className="relative mb-2">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                 <input placeholder="Search finance data..." className="w-full text-xs pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-300" />
                 <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[9px] text-gray-400 font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">
                   ⌘ P
                 </div>
              </div>
              
              <div className="border border-gray-100 rounded-xl p-4 shadow-sm relative group hover:border-gray-300 cursor-pointer bg-white transition-all">
                 <X className="w-3.5 h-3.5 text-gray-300 absolute right-3 top-3 opacity-0 group-hover:opacity-100 hover:text-gray-500" />
                 <h5 className="text-xs font-bold text-gray-800">Automation Coverage</h5>
                 <p className="text-[10px] text-gray-500 mt-1.5">Your last week is better <span className="font-bold text-gray-700">72%</span></p>
              </div>

              <div className="border border-gray-100 rounded-xl p-4 shadow-sm relative group hover:border-gray-300 cursor-pointer bg-white transition-all">
                 <Plus className="w-3.5 h-3.5 text-gray-300 absolute right-3 top-3 opacity-0 group-hover:opacity-100 hover:text-gray-500" />
                 <h5 className="text-xs font-bold text-gray-800">Business Flow Track - A</h5>
                 <p className="text-[10px] text-gray-500 mt-1.5 mb-3">Trigger when market is going high</p>
                 <div className="flex gap-1.5">
                   <div className="h-1.5 bg-emerald-400 flex-1 rounded-full"></div>
                   <div className="h-1.5 bg-amber-400 flex-1 rounded-full"></div>
                   <div className="h-1.5 bg-purple-500 flex-1 rounded-full"></div>
                 </div>
              </div>
           </div>

           {/* Middle Grid (Diagram) */}
           <div className="col-span-2 relative bg-gray-50 p-8 flex items-center justify-center overflow-hidden border-r border-gray-100">
               {/* Decorative dotted background */}
               <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(#9ca3af 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
               
               <div className="relative z-10 w-full h-full min-h-[300px]">

                  {/* Nodes */}
                  <div className="absolute left-[5%] top-1/2 -translate-y-1/2 flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-2.5 shadow-sm whitespace-nowrap z-20">
                     <div className="p-2 bg-gray-50 text-gray-500 rounded-lg border border-gray-100">
                        <Briefcase className="w-4 h-4" />
                     </div>
                     <div>
                       <div className="text-[11px] font-bold text-gray-800">Customer Satisfaction</div>
                       <div className="text-[9px] text-gray-400 mt-0.5">Our customers' happiness is our top priority</div>
                     </div>
                  </div>

                  {/* SVG connecting paths */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
                     <path d="M 230 150 L 320 150 L 320 80 L 360 80" fill="none" stroke="#d1d5db" strokeWidth="1.5" />
                     <path d="M 320 150 L 320 220 L 400 220" fill="none" stroke="#d1d5db" strokeWidth="1.5" />
                     <path d="M 320 150 L 360 150" fill="none" stroke="#d1d5db" strokeWidth="1.5" />
                     
                     <path d="M 400 220 L 480 220 L 480 250 L 500 250" fill="none" stroke="#d1d5db" strokeWidth="1.5" />
                     {/* Connectors to simulate branching */}
                     <circle cx="320" cy="150" r="3" fill="#9ca3af" />
                     <circle cx="480" cy="220" r="3" fill="#9ca3af" />
                     <path d="M 320 150 L 320 280 L 360 280" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeDasharray="4 2" />
                  </svg>

                  {/* Colored Operational Blocks */}
                  <div className="absolute left-[38%] top-[45%] -translate-y-1/2 w-20 h-7 bg-blue-600 rounded-md z-20 shadow-sm"></div>
                  <div className="absolute left-[52%] top-[50%] -translate-y-1/2 w-[70px] h-7 bg-amber-400 rounded-md z-20 shadow-sm"></div>
                  <div className="absolute left-[50%] top-[65%] -translate-y-1/2 w-24 h-[30px] bg-emerald-400 rounded-md z-20 shadow-sm"></div>
                  <div className="absolute left-[78%] top-[70%] w-3.5 h-[34px] bg-blue-600 rounded-md z-20 shadow-sm"></div>

                  {/* Node 2 */}
                  <div className="absolute left-[40%] top-[15%] flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-2.5 shadow-sm whitespace-nowrap z-20">
                     <div className="p-2 bg-gray-50 text-gray-500 rounded-lg border border-gray-100">
                        <UserIcon className="w-4 h-4" />
                     </div>
                     <div>
                       <div className="text-[11px] font-bold text-gray-800">Automation Coverage</div>
                       <div className="text-[9px] text-gray-400 mt-0.5">Your last week is better 72%</div>
                     </div>
                  </div>

                  {/* Node 3 */}
                  <div className="absolute right-[5%] top-[52%] flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-2.5 shadow-sm whitespace-nowrap z-20">
                     <div className="p-2 bg-gray-50 text-gray-500 rounded-lg border border-gray-100">
                        <ShoppingBag className="w-4 h-4" />
                     </div>
                     <div>
                       <div className="text-[11px] font-bold text-gray-800">Performance Optimization</div>
                       <div className="text-[9px] text-gray-400 mt-0.5">Improving efficiency by 50%</div>
                     </div>
                  </div>
                  
                  {/* Node 4 */}
                  <div className="absolute left-[45%] bottom-[5%] flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-2.5 shadow-sm whitespace-nowrap z-20">
                     <div className="p-2 bg-gray-50 text-gray-500 rounded-lg border border-gray-100">
                        <UserIcon className="w-4 h-4" />
                     </div>
                     <div>
                       <div className="text-[11px] font-bold text-gray-800">Customer Satisfaction</div>
                       <div className="text-[9px] text-gray-400 mt-0.5">Our customers' happiness is our top priority</div>
                     </div>
                  </div>

               </div>
           </div>

           {/* Right Column */}
           <div className="p-5 flex flex-col gap-4 bg-white/50">
              <div className="flex justify-between items-center mb-1">
                 <h4 className="font-bold text-gray-800 text-xs">Exception Manager Automation</h4>
                 <Plus className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-900" />
              </div>
              <div className="relative mb-2">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                 <input placeholder="Search finance data..." className="w-full text-xs pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-300" />
                 <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[9px] text-gray-400 font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">
                   ⌘ P
                 </div>
              </div>
              
              <div className="border border-gray-100 rounded-xl p-4 shadow-sm relative group hover:border-gray-300 cursor-pointer bg-white transition-all">
                 <X className="w-3.5 h-3.5 text-gray-300 absolute right-3 top-3 opacity-0 group-hover:opacity-100 hover:text-gray-500" />
                 <h5 className="text-xs font-bold text-gray-800">Automation Coverage</h5>
                 <p className="text-[10px] text-gray-500 mt-1.5">Your last week is better <span className="font-bold text-gray-700">72%</span></p>
              </div>

              <div className="border border-gray-100 rounded-xl p-4 shadow-sm relative group hover:border-gray-300 cursor-pointer bg-white transition-all">
                 <Plus className="w-3.5 h-3.5 text-gray-300 absolute right-3 top-3 opacity-0 group-hover:opacity-100 hover:text-gray-500" />
                 <h5 className="text-xs font-bold text-gray-800">Business Flow Track - A</h5>
                 <p className="text-[10px] text-gray-500 mt-1.5">Trigger when market is going high</p>
              </div>
              
               <div className="border border-gray-100 rounded-xl p-4 shadow-sm relative group hover:border-gray-300 cursor-pointer bg-white transition-all opacity-70">
                 <Plus className="w-3.5 h-3.5 text-gray-300 absolute right-3 top-3 opacity-0 group-hover:opacity-100 hover:text-gray-500" />
                 <h5 className="text-xs font-bold text-gray-800">Business Flow Track - B</h5>
                 <p className="text-[10px] text-gray-500 mt-1.5">Trigger when market is going low</p>
              </div>
           </div>
        </div>
      </div>

      {tourOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setTourOpen(false)}
          />

          <div
            className="fixed z-50 border-2 border-green-400 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.25)] pointer-events-none"
            style={{
              top: anchor.top - 6,
              left: anchor.left - 6,
              width: anchor.width + 12,
              height: anchor.height + 12,
            }}
          />

          <div
            className="fixed z-50 text-green-600 animate-bounce"
            style={{
              top: Math.max(16, anchor.top - 34),
              left: anchor.left + (anchor.width / 2) - 10,
            }}
          >
            <ArrowBigDown className="h-5 w-5" />
          </div>

          <div
            className="fixed z-50 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl p-5"
            style={{ top: cardTop, left: cardLeft }}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-green-600 mb-2">
              Dashboard Tutorial
            </p>
            <h3 className="text-lg font-black text-gray-900 leading-tight">{activeStep.title}</h3>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">{activeStep.description}</p>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">
                Step {tourStepIndex + 1} of {TUTORIAL_STEPS.length}
              </span>
              <button
                onClick={() => setTourOpen(false)}
                className="text-xs font-bold text-gray-500 hover:text-gray-700"
              >
                Skip
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
              <button
                onClick={prevStep}
                disabled={tourStepIndex === 0}
                className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
              <button
                onClick={nextStep}
                className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-sm font-bold text-white"
              >
                {isLastStep ? "Finish" : "Next"}
                {!isLastStep && <ChevronRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
}

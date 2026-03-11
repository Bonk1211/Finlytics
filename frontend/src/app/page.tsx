"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
} from "react-simple-maps";
import {
  ShieldAlert,
  TrendingUp,
  PlaySquare,
  Maximize2,
  Radio,
  Zap,
  Globe,
  Package,
  ArrowUpRight,
  Newspaper,
  Activity,
  Building,
} from "lucide-react";
import clsx from "clsx";
import { geoCentroid } from "d3-geo";

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

const ASEAN_COUNTRIES = [
  "Malaysia", "Indonesia", "Thailand", "Vietnam", "Philippines",
  "Singapore", "Myanmar", "Cambodia", "Laos", "Brunei",
];

const ASEAN_MARKERS = [
  { name: "Kuala Lumpur", coordinates: [101.6869, 3.1478], color: "#10B981", offset: -14 },
  { name: "Jakarta", coordinates: [106.8456, -6.2088], color: "#10B981", offset: -14 },
  { name: "Bangkok", coordinates: [100.5018, 13.7563], color: "#10B981", offset: -14 },
  { name: "Ho Chi Minh", coordinates: [106.6297, 10.8231], color: "#34D399", offset: 16 },
  { name: "Manila", coordinates: [120.9842, 14.5995], color: "#34D399", offset: -14 },
  { name: "Singapore", coordinates: [103.8198, 1.3521], color: "#6EE7B7", offset: 16 },
  { name: "Yangon", coordinates: [96.1951, 16.8661], color: "#34D399", offset: -14 },
  { name: "Phnom Penh", coordinates: [104.9282, 11.5625], color: "#34D399", offset: 16 },
];

const NEWS_STREAMS: Record<string, string> = {
  "CNA": "https://www.youtube.com/embed/V_WDXMHegIM?autoplay=1&mute=1",
  "ALJAZEERA": "https://www.youtube.com/embed/gCNeDWCI0vo?autoplay=1&mute=1",
  "SKYNEWS": "https://www.youtube.com/embed/9Auq9mYxFEE?autoplay=1&mute=1",
  "DW NEWS": "https://www.youtube.com/embed/vOewpmHXTQE?autoplay=1&mute=1",
};

const ASEAN_WEBCAMS = [
  { name: "KUALA LUMPUR", url: "https://www.youtube.com/embed/gCNeDWCI0vo?autoplay=1&mute=1&controls=0", country: "MY" },
  { name: "SINGAPORE", url: "https://www.youtube.com/embed/5O1nZ6sY35U?autoplay=1&mute=1&controls=0", country: "SG" },
  { name: "BANGKOK", url: "https://www.youtube.com/embed/TzB4fH1zXQ4?autoplay=1&mute=1&controls=0", country: "TH" },
  { name: "JAKARTA", url: "https://www.youtube.com/embed/oij5xUeB_S4?autoplay=1&mute=1&controls=0", country: "ID" },
];

const QUICK_LINKS = [
  { href: "/credit-scoring", label: "Credit Scoring", icon: Building, color: "from-emerald-500 to-teal-500", desc: "Get MSME credit score" },
  { href: "/supply-chain", label: "Supply Chain", icon: Package, color: "from-blue-500 to-cyan-500", desc: "Optimise sourcing" },
  { href: "/trade-navigator", label: "Trade Navigator", icon: Globe, color: "from-violet-500 to-purple-500", desc: "Cross-border guidance" },
  { href: "/dashboard", label: "Dashboard", icon: Activity, color: "from-amber-500 to-orange-500", desc: "Business overview" },
];

const ASEAN_RISK = [
  { country: "Malaysia", flag: "", risk: 18, trend: "stable", color: "#10B981" },
  { country: "Indonesia", flag: "", risk: 24, trend: "rising", color: "#F59E0B" },
  { country: "Thailand", flag: "", risk: 21, trend: "stable", color: "#10B981" },
  { country: "Vietnam", flag: "", risk: 16, trend: "falling", color: "#10B981" },
  { country: "Philippines", flag: "", risk: 29, trend: "rising", color: "#EF4444" },
  { country: "Singapore", flag: "", risk: 8, trend: "stable", color: "#10B981" },
];

export default function HomePage() {
  const [activeNews, setActiveNews] = useState("CNA");
  const [liveNewsBrief, setLiveNewsBrief] = useState("Fetching latest ASEAN market intelligence...");
  const [globalRisk, setGlobalRisk] = useState(32);

  useEffect(() => {
    fetch("https://saurav.tech/NewsAPI/top-headlines/category/business/us.json")
      .then((r) => r.json())
      .then((d) => {
        if (d.articles?.[0]) {
          setLiveNewsBrief(`${d.articles[0].title}. ${d.articles[0].description ?? ""}`);
        }
      })
      .catch(() => {
        setLiveNewsBrief("ASEAN digital economy on track for $1 trillion by 2030. Cross-border trade expanding at 12% CAGR.");
      });

    const iv = setInterval(() => {
      setGlobalRisk((p) => Math.min(60, Math.max(20, p + (Math.random() > 0.5 ? 1 : -1))));
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-gray-950 flex flex-col font-sans overflow-x-hidden">
      {/* Ticker */}
      <div className="bg-emerald-700 text-white text-[11px] font-bold flex items-center overflow-hidden h-7 shrink-0 sticky top-[60px] z-30">
        <div className="shrink-0 bg-emerald-900 px-3 h-full flex items-center gap-1.5 uppercase tracking-wider">
          <Radio className="w-3 h-3 animate-pulse" /> LIVE
        </div>
        <div className="flex-1 overflow-hidden">
          <div
            className="whitespace-nowrap inline-block pl-4"
            style={{ animation: "ticker 35s linear infinite" }}
          >
            ASEAN trade flows remain robust&nbsp;&nbsp;Digital economy growth +14% YoY&nbsp;&nbsp;Fintech adoption accelerating across SEA&nbsp;&nbsp;Supply chain resilience improving&nbsp;&nbsp;RCEP pact driving cross-border growth&nbsp;&nbsp;&nbsp;&nbsp;ASEAN trade flows remain robust&nbsp;&nbsp;Digital economy growth +14% YoY&nbsp;&nbsp;Fintech adoption accelerating across SEA&nbsp;&nbsp;Supply chain resilience improving&nbsp;&nbsp;RCEP pact driving cross-border growth
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 p-3">

        {/* Left column */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-3">

          {/* Hero ASEAN Map */}
          <div className="relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl" style={{ minHeight: 420 }}>
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
              <div className="flex items-center gap-2 bg-black/70 backdrop-blur px-3 py-2 rounded-xl border border-gray-700/50">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span className="text-white font-bold text-sm">ASEAN Market Intelligence</span>
                <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded ml-1 animate-pulse">LIVE</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur px-3 py-1.5 rounded-xl border border-gray-700/50 text-[10px] font-bold text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> 10 MSME MARKETS TRACKED
              </div>
            </div>

            <ComposableMap
              projectionConfig={{ scale: 400, center: [117, 3] }}
              width={900}
              height={500}
              style={{ width: "100%", height: "100%", minHeight: 420, outline: "none" }}
            >
              <ZoomableGroup zoom={1} center={[117, 3]} maxZoom={6}>
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const name = geo.properties.name;
                      const isASEAN = ASEAN_COUNTRIES.includes(name);
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={isASEAN ? "#065F46" : "#111827"}
                          stroke={isASEAN ? "#10B981" : "#1F2937"}
                          strokeWidth={isASEAN ? 0.8 : 0.3}
                          style={{
                            default: { outline: "none" },
                            hover: { fill: isASEAN ? "#047857" : "#1F2937", outline: "none" },
                            pressed: { fill: "#065F46", outline: "none" },
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      if (!ASEAN_COUNTRIES.includes(geo.properties.name)) return null;
                      const centroid = geoCentroid(geo);
                      return (
                        <Marker key={`lbl-${geo.rsmKey}`} coordinates={centroid as [number, number]}>
                          <text textAnchor="middle" style={{ fontFamily: "Inter", fontSize: "5px", fill: "#6EE7B7", fontWeight: "bold", pointerEvents: "none", textTransform: "uppercase" }}>
                            {geo.properties.name}
                          </text>
                        </Marker>
                      );
                    })
                  }
                </Geographies>
                {ASEAN_MARKERS.map(({ name, coordinates, color, offset }) => (
                  <Marker key={name} coordinates={coordinates as [number, number]}>
                    <circle r={4} fill={color} stroke="#fff" strokeWidth={0.8} />
                    <circle r={10} fill={color} opacity={0.25} />
                    <text textAnchor="middle" y={offset} style={{ fontFamily: "Inter", fontSize: "6px", fill: "#D1FAE5", fontWeight: "bold", textShadow: "0 0 3px black" }}>
                      {name}
                    </text>
                  </Marker>
                ))}
              </ZoomableGroup>
            </ComposableMap>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-3 bg-black/80 backdrop-blur px-4 py-2 rounded-lg border border-gray-700/50 text-[9px] uppercase font-bold text-gray-400 pointer-events-none">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-600 border border-emerald-400" /> ASEAN Active</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-400" /> MSME Hub</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-700" /> Non-ASEAN</div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {QUICK_LINKS.map(({ href, label, icon: Icon, color, desc }) => (
              <Link key={href} href={href}
                className="group flex flex-col gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded-xl p-3 transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shadow-sm`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-xs">{label}</p>
                  <p className="text-gray-500 text-[10px] mt-0.5">{desc}</p>
                </div>
                <ArrowUpRight className="w-3 h-3 text-gray-600 group-hover:text-emerald-400 self-end -mt-1 transition-colors" />
              </Link>
            ))}
          </div>

          {/* Live News */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden flex flex-col" style={{ height: 280 }}>
            <div className="bg-gray-800/80 border-b border-gray-700 px-4 py-2 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <PlaySquare className="w-4 h-4 text-red-400" />
                <h3 className="font-bold text-gray-100 text-sm">LIVE NEWS</h3>
                <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded ml-1 animate-pulse">LIVE</span>
              </div>
              <div className="flex gap-1 text-[10px] font-bold">
                {Object.keys(NEWS_STREAMS).map((n) => (
                  <button key={n} onClick={() => setActiveNews(n)}
                    className={clsx("px-2 py-1 rounded transition", activeNews === n ? "bg-red-500 text-white" : "text-gray-400 hover:bg-gray-700 hover:text-white")}
                  >{n}</button>
                ))}
              </div>
              <Maximize2 className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-300" />
            </div>
            <div className="flex-1 bg-black relative">
              <iframe src={NEWS_STREAMS[activeNews]} className="w-full h-full border-0 absolute inset-0" title="Live News"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-3">

          {/* ASEAN Risk */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-bold text-xs uppercase flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" /> ASEAN Risk Snapshot
              </h3>
              <span className="text-[9px] font-bold text-emerald-400 border border-emerald-500/30 bg-emerald-400/10 px-1.5 py-0.5 rounded uppercase">Live</span>
            </div>
            <div className="space-y-2.5">
              {ASEAN_RISK.map(({ country, flag, risk, trend, color }) => (
                <div key={country}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-gray-200">{flag} {country}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-black text-gray-100">{risk}</span>
                      {trend === "rising" && <TrendingUp className="w-3 h-3 text-red-400" />}
                      {trend === "stable" && <div className="w-3 h-0.5 bg-gray-500 rounded-full" />}
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${risk}%`, backgroundColor: color }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3 bg-gray-800 rounded-xl p-3 border border-gray-700">
              <div className="relative w-14 h-14 flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path strokeWidth="3.5" stroke="#1F2937" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path strokeDasharray={`${globalRisk}, 100`} strokeWidth="3.5" stroke="#10B981" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-black text-white">{globalRisk}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">ASEAN Composite Risk</p>
                <p className="text-sm font-bold text-emerald-400 mt-0.5">LOW  STABLE</p>
              </div>
            </div>
          </div>

          {/* ASEAN Webcams */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-3 h-3" /> ASEAN Live Cams
              </h3>
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {ASEAN_WEBCAMS.map((cam, i) => (
                <div key={i} className="relative aspect-video bg-black rounded-lg overflow-hidden border border-gray-700 pointer-events-none">
                  <iframe src={cam.url} className="w-full h-full border-0 pointer-events-none scale-125" title={cam.name}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" tabIndex={-1} />
                  <div className="absolute top-1 left-1 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded border border-gray-700/50">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-[8px] font-bold text-white tracking-widest uppercase">{cam.country}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Market Brief */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-200 uppercase flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" /> AI Market Brief
              </h3>
              <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">LIVE</span>
            </div>
            <div className="bg-emerald-950/50 border border-emerald-900/50 rounded-xl p-3">
              <p className="text-[11px] text-emerald-200 font-medium leading-relaxed">{liveNewsBrief}</p>
            </div>
            <div className="grid grid-cols-3 gap-1.5 mt-1">
              {[
                { label: "Trade Activity", val: "+12%", cls: "text-emerald-400" },
                { label: "FX Volatility", val: "LOW", cls: "text-emerald-300" },
                { label: "Supply Stress", val: "MED", cls: "text-amber-400" },
              ].map(({ label, val, cls }) => (
                <div key={label} className="bg-gray-800 rounded-lg p-2 text-center border border-gray-700">
                  <p className="text-[9px] text-gray-500 uppercase font-bold">{label}</p>
                  <p className={`text-xs font-black mt-0.5 ${cls}`}>{val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ASEAN News */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <Newspaper className="w-3.5 h-3.5 text-gray-400" />
              <h3 className="text-xs font-bold text-gray-200 uppercase">ASEAN Focus</h3>
            </div>
            <div className="space-y-2">
              {[
                { title: "Vietnam manufacturing FDI surges 18% Q1", tag: "TRADE" },
                { title: "Malaysia digital economy hits MYR 289bn", tag: "TECH" },
                { title: "Indonesia SME credit access improves", tag: "CREDIT" },
                { title: "Thailand-China rail freight route opens", tag: "SUPPLY" },
              ].map(({ title, tag }) => (
                <div key={title} className="flex items-start gap-2">
                  <span className={clsx(
                    "shrink-0 text-[8px] font-black px-1.5 py-0.5 rounded mt-0.5 uppercase",
                    tag === "TRADE" ? "bg-blue-500/20 text-blue-300" :
                    tag === "TECH" ? "bg-violet-500/20 text-violet-300" :
                    tag === "CREDIT" ? "bg-emerald-500/20 text-emerald-300" :
                    "bg-amber-500/20 text-amber-300"
                  )}>{tag}</span>
                  <p className="text-[11px] text-gray-400 font-medium leading-tight">{title}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <style jsx>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

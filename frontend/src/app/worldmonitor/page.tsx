"use client";

import React, { useState, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
} from "react-simple-maps";
import { 
  Search, 
  Settings2, 
  Map as MapIcon, 
  ShieldAlert, 
  Activity, 
  Radio,
  Zap,
  Globe,
  BellRing,
  PlaySquare,
  Maximize2,
  ListFilter,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import clsx from "clsx";
import { geoCentroid } from "d3-geo";

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

// Mock Data
const MARKERS = [
  { markerOffset: -15, name: "Tehran", coordinates: [51.3890, 35.6892], color: "#EF4444" },
  { markerOffset: -15, name: "Tel Aviv", coordinates: [34.7818, 32.0853], color: "#F59E0B" },
  { markerOffset: 15, name: "Cairo", coordinates: [31.2357, 30.0444], color: "#EF4444" },
  { markerOffset: -15, name: "Kyiv", coordinates: [30.5234, 50.4501], color: "#DC2626" },
];

export default function WorldMonitorAdvancedPage() {
  const [activeLayer, setActiveLayer] = useState("all");
  const [activeLayers, setActiveLayers] = useState<string[]>([]);
  const [dynamicMarkers, setDynamicMarkers] = useState<any[]>([]);
  const [activeNews, setActiveNews] = useState<string>("ALJAZEERA");
  const [activeCamFilter, setActiveCamFilter] = useState<string>("ALL");
  // Dashboard live state
  const [liveNewsBrief, setLiveNewsBrief] = useState("Fetching latest global intelligence...");
  const [iranRisk, setIranRisk] = useState(90);
  const [israelRisk, setIsraelRisk] = useState(70);
  const [globalRisk, setGlobalRisk] = useState(55);

  const NEWS_STREAMS: Record<string, string> = {
    "SKYNEWS": "https://www.youtube.com/embed/9Auq9mYxFEE?autoplay=1&mute=1",
    "ALJAZEERA": "https://www.youtube.com/embed/gCNeDWCI0vo?autoplay=1&mute=1",
    "EURONEWS": "https://www.youtube.com/embed/sPnjsMrs0gw?autoplay=1&mute=1",
    "DW NEWS": "https://www.youtube.com/embed/vOewpmHXTQE?autoplay=1&mute=1"
  };

  const WEBCAMS = [
    { name: "TEHRAN", url: "https://www.youtube.com/embed/gCNeDWCI0vo?autoplay=1&mute=1&controls=0", region: "MIDEAST" },
    { name: "TEL AVIV", url: "https://www.youtube.com/embed/5O1nZ6sY35U?autoplay=1&mute=1&controls=0", region: "MIDEAST" },
    { name: "KYIV", url: "https://www.youtube.com/embed/TzB4fH1zXQ4?autoplay=1&mute=1&controls=0", region: "EUROPE" },
    { name: "TAIPEI", url: "https://www.youtube.com/embed/oij5xUeB_S4?autoplay=1&mute=1&controls=0", region: "ASIA" }
  ];

  // Fetch real life breaking news for AI insight and simulate live tracking
  useEffect(() => {
    fetch("https://saurav.tech/NewsAPI/top-headlines/category/general/us.json")
      .then(res => res.json())
      .then(data => {
        if(data.articles && data.articles.length > 0) {
          setLiveNewsBrief(`${data.articles[0].title}. ${data.articles[0].description || ""}`);
        }
      })
      .catch(err => {
        setLiveNewsBrief("Global disruption detected across major supply chains. Monitoring impact on regional stability.");
      });

    const intervalId = setInterval(() => {
      // Simulate live analytics changes
      setIranRisk(prev => Math.min(100, Math.max(80, prev + (Math.random() > 0.5 ? 1 : -1))));
      setIsraelRisk(prev => Math.min(100, Math.max(60, prev + (Math.random() > 0.5 ? 1 : -1))));
      setGlobalRisk(prev => Math.min(100, Math.max(30, prev + (Math.random() > 0.5 ? 1 : -1))));
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  const toggleLayer = async (name: string, dataUrl?: string) => {
    setActiveLayers(prev => 
      prev.includes(name) ? prev.filter(l => l !== name) : [...prev, name]
    );

    if (dataUrl && !activeLayers.includes(name)) {
      try {
        const res = await fetch(dataUrl);
        const data = await res.json();
        
        if (name === "Natural Events") {
          // USGS Earthquake Feed Parsing
          const features = data.features.slice(0, 15); // Top 15 recent earthquakes
          const newMarkers = features.map((f: any) => ({
            name: `Mag ${f.properties.mag} Earthquake`,
            coordinates: [f.geometry.coordinates[0], f.geometry.coordinates[1]],
            color: "#F97316", // Orange
            markerOffset: 10
          }));
          setDynamicMarkers(prev => [...prev, ...newMarkers]);
        }
      } catch (e) {
        console.error("Failed to fetch layer data:", e);
      }
    } else if (dataUrl && activeLayers.includes(name)) {
      if (name === "Natural Events") {
        setDynamicMarkers(prev => prev.filter(m => !m.name.includes("Earthquake")));
      }
    }
  };

  return (
    <div className="relative w-full min-h-[calc(100vh-80px)] bg-[#F8FAFC] rounded-[20px] overflow-hidden border border-gray-200 shadow-sm flex flex-col font-sans p-4 gap-4">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-lg">
            <Globe className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">World Monitor Command Center</h1>
            <p className="text-xs text-gray-500 font-medium">Real-time Intelligence & Geopolitical Surveillance</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-gray-50 rounded-xl border border-gray-200 flex items-center px-4 py-2 w-72">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search regions, assets..." 
              className="bg-transparent border-none outline-none text-sm w-full text-gray-800 placeholder-gray-400"
            />
          </div>
          <button className="bg-white p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 transition">
            <Settings2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[800px]">
        
        {/* Left Column: Map & Live Video */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
          
          {/* Main Map Area */}
          <div className="flex-1 min-h-[400px] bg-gray-900 rounded-2xl overflow-hidden relative border border-gray-800 shadow-lg">
            
            <div className="absolute inset-0">
              <ComposableMap
                projectionConfig={{ scale: 180, center: [30, 30] }}
                width={800}
                height={500}
                style={{ width: "100%", height: "100%", outline: "none" }}
              >
                <ZoomableGroup zoom={2.5} center={[40, 35]} maxZoom={6}>
                  <Geographies geography={geoUrl}>
                    {({ geographies }) => (
                      <>
                        {geographies.map((geo) => {
                          const name = geo.properties.name;
                          // Color hotspots based on screenshot
                          let fill = "#1F2937"; // Dark base
                          if (["Iran", "Sudan"].includes(name)) fill = "#7F1D1D"; // Dark Red
                          if (name === "Israel" || name === "Ukraine") fill = "#B91C1C"; // Red
                          return (
                            <Geography
                              key={geo.rsmKey}
                              geography={geo}
                              fill={fill}
                              stroke="#374151"
                              strokeWidth={0.5}
                              style={{
                                default: { outline: "none" },
                                hover: { fill: "#4B5563", outline: "none" },
                                pressed: { fill: "#374151", outline: "none" },
                              }}
                            />
                          );
                        })}
                        {geographies.map((geo) => {
                          const centroid = geoCentroid(geo);
                          return (
                            <Marker key={`${geo.rsmKey}-name`} coordinates={centroid as [number, number]}>
                              <text
                                textAnchor="middle"
                                y={1}
                                style={{
                                  fontFamily: "Inter",
                                  fontSize: "4px",
                                  fill: "#6B7280",
                                  fontWeight: "bold",
                                  pointerEvents: "none",
                                  textTransform: "uppercase"
                                }}
                              >
                                {geo.properties.name}
                              </text>
                            </Marker>
                          );
                        })}
                      </>
                    )}
                  </Geographies>
                  {/* Markers */}
                  {[...MARKERS, ...dynamicMarkers].map(({ name, coordinates, markerOffset, color }, idx) => (
                    <Marker key={`${name}-${idx}`} coordinates={coordinates as [number, number]}>
                      <circle r={3} fill={color} stroke="#fff" strokeWidth={0.5} />
                      <circle r={8} fill={color} opacity={0.4} className="animate-ping" />
                      <text
                        textAnchor="middle"
                        y={markerOffset}
                        style={{ fontFamily: "Inter", fontSize: "6px", fill: "#D1D5DB", fontWeight: "bold", textShadow: "0 0 2px black" }}
                      >
                        {name}
                      </text>
                    </Marker>
                  ))}
                </ZoomableGroup>
              </ComposableMap>
            </div>

            {/* Map Layers Menu (Floating Left) */}
            <div className="absolute left-4 top-4 bg-black/80 backdrop-blur border border-gray-700/50 rounded-xl p-3 w-56 shadow-xl max-h-[80%] overflow-y-auto custom-scrollbar">
              <h4 className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2 border-b border-gray-700 pb-1 sticky top-0 bg-black/80 py-1">Layers</h4>
              <div className="flex flex-col gap-1.5">
                {[
                  { name: "Armed Conflict Events", icon: "⚔", source: "(GDELT Project)" },
                  { name: "Natural Events", icon: "🌋", activeUrl: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson", source: "(USGS Live)" },
                  { name: "Wildfires", icon: "🔥", source: "(NASA FIRMS)" },
                  { name: "Global Weather Alerts", icon: "⛈", source: "(NOAA NWS)" },
                  { name: "Day/Night Terminator", icon: "🌓", source: "(Calculated)" },
                ].map((layer) => {
                  const isActive = activeLayers.includes(layer.name);
                  return (
                    <label key={layer.name} className="flex gap-2 text-[10px] font-bold text-gray-300 cursor-pointer hover:text-white transition uppercase group">
                      <div 
                        onClick={() => toggleLayer(layer.name, layer.activeUrl)}
                        className={clsx("w-3 h-3 mt-0.5 rounded flex-shrink-0 flex items-center justify-center border", isActive ? "bg-green-500 border-green-400" : "border-gray-600 bg-gray-800")}
                      >
                        {isActive && <svg className="w-2 h-2 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
                      </div>
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1.5 whitespace-nowrap"><span className="w-3 text-center">{layer.icon}</span> {layer.name}</span>
                        <span className="text-[8px] text-gray-500 group-hover:text-gray-400 font-medium tracking-wide">{layer.source}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Map Legend (Floating Bottom) */}
             <div className="absolute bottom-4 left-4 right-4 flex justify-center pointer-events-none">
                <div className="bg-black/80 backdrop-blur px-4 py-2 rounded-lg border border-gray-700/50 flex space-x-4 text-[10px] uppercase font-bold text-gray-400 shadow-xl pointer-events-auto">
                   <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-600"></div> High Alert</div>
                   <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Elevated</div>
                   <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> Monitoring</div>
                   <div className="flex items-center gap-1"><div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-blue-400"></div> Base</div>
                </div>
             </div>
          </div>

          {/* Live News Video Panel */}
          <div className="h-[280px] bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlaySquare className="w-4 h-4 text-red-500" />
                <h3 className="font-bold text-gray-900 text-sm">LIVE NEWS</h3>
                <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded ml-1 animate-pulse">LIVE</span>
              </div>
              <div className="flex gap-1 text-[10px] font-bold">
                 {Object.keys(NEWS_STREAMS).map(news => (
                   <button 
                     key={news}
                     onClick={() => setActiveNews(news)}
                     className={clsx(
                       "px-2 py-1 rounded transition",
                       activeNews === news ? "bg-red-500 text-white" : "text-gray-500 hover:bg-gray-200"
                     )}
                   >
                     {news}
                   </button>
                 ))}
              </div>
              <Maximize2 className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
            <div className="flex-1 bg-black relative flex items-center justify-center">
               <iframe 
                 src={NEWS_STREAMS[activeNews]} 
                 className="w-full h-full border-0 absolute inset-0" 
                 title="Live News Stream"
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                 allowFullScreen
               />
            </div>
          </div>

        </div>

        {/* Right Column: Widgets */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          
          {/* Live Webcams Panel */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-lg p-3">
             <div className="flex gap-2 mb-3 text-[10px] font-bold uppercase overflow-x-auto hide-scrollbar">
                {["ALL", "MIDEAST", "EUROPE", "ASIA"].map(filter => (
                  <button 
                    key={filter}
                    onClick={() => setActiveCamFilter(filter)}
                    className={clsx(
                      "px-2 py-1 rounded transition",
                      activeCamFilter === filter ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"
                    )}
                  >
                    {filter}
                  </button>
                ))}
             </div>
             <div className="grid grid-cols-2 gap-2">
                {WEBCAMS.filter(c => activeCamFilter === "ALL" || c.region === activeCamFilter).map((cam, i) => (
                  <div key={i} className="relative aspect-video bg-black rounded overflow-hidden group border border-gray-700 pointer-events-none">
                    <iframe 
                      src={cam.url} 
                      className="w-full h-full border-0 pointer-events-none scale-125" 
                      title={cam.name}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      tabIndex={-1}
                    />
                    <div className="absolute top-1 left-1 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded border border-gray-700/50">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-[8px] font-bold text-white tracking-widest uppercase">{cam.name}</span>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             {/* AI Insights */}
             <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                <div className="flex justify-between items-center mb-3">
                   <h3 className="font-bold text-gray-900 text-xs flex items-center gap-1 uppercase"><ListFilter className="w-3 h-3"/> AI INSIGHTS</h3>
                   <span className="text-[8px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded uppercase border border-green-200">Live</span>
                </div>
                <div className="bg-[#EBF4F6] rounded-xl p-3 border border-gray-100">
                   <h4 className="text-[10px] font-bold text-blue-800 uppercase mb-1">🌎 WORLD BRIEF</h4>
                   <p className="text-xs text-gray-700 font-medium leading-relaxed">
                     {liveNewsBrief}
                   </p>
                </div>
             </div>

             {/* AI Strategic Posture */}
             <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col">
                <div className="flex justify-between items-center mb-3">
                   <h3 className="font-bold text-gray-900 text-xs flex items-center gap-1 uppercase"><ShieldAlert className="w-3 h-3"/> STRATEGIC POSTURE</h3>
                   <span className="text-[8px] font-bold bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200">1 MIN</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 flex-1 flex flex-col justify-center">
                   <div className="flex justify-between items-center mb-2">
                     <span className="font-bold text-sm text-gray-900">Iran Theater</span>
                     <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1 py-0.5 rounded uppercase">CRITICAL</span>
                   </div>
                   <div className="text-xs font-semibold text-gray-500 flex items-center gap-2 mb-2">
                     AIR ✈️ 2 <span className="ml-2">SEA 🚢 1 ⚓ 1 ☁️ 9</span>
                   </div>
                   <div className="flex items-center text-[10px] font-bold text-gray-400 mt-auto">
                     <TrendingUp className="w-3 h-3 mr-1 text-green-500" /> STABLE <span className="ml-auto">— Iran</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4 flex-1">
            {/* Country Instability */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 relative overflow-hidden">
                <div className="flex justify-between items-center mb-4 relative z-10">
                   <h3 className="font-bold text-gray-900 text-xs uppercase">COUNTRY INSTABILITY</h3>
                </div>
                 <div className="space-y-4 relative z-10">
                   <div>
                     <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-1 text-sm font-bold text-gray-800"><div className="w-2 h-2 rounded-full bg-red-600"></div> Iran</div>
                        <div className="font-black text-gray-900">{iranRisk} <TrendingUp className="inline w-3 h-3 text-red-500"/></div>
                     </div>
                     <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden transition-all duration-500">
                       <div className="h-full bg-red-600 transition-all duration-500" style={{ width: `${iranRisk}%` }}></div>
                     </div>
                     <div className="text-[8px] font-bold text-gray-400 mt-1 uppercase tracking-wider">U:82 C:100 S:40 I:88</div>
                   </div>
                   <div>
                     <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-1 text-sm font-bold text-gray-800"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Israel</div>
                        <div className="font-black text-gray-900">{israelRisk} <TrendingUp className="inline w-3 h-3 text-orange-500"/></div>
                     </div>
                     <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden transition-all duration-500">
                       <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${israelRisk}%` }}></div>
                     </div>
                     <div className="text-[8px] font-bold text-gray-400 mt-1 uppercase tracking-wider">U:13 C:72 S:20 I:42</div>
                   </div>
                </div>
            </div>

            {/* Strategic Risk Overview */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-lg p-4 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                   <h3 className="font-bold text-white text-xs uppercase">RISK OVERVIEW</h3>
                   <span className="text-[8px] font-bold text-green-400 border border-green-400/30 bg-green-400/10 px-1 py-0.5 rounded uppercase">LIVE</span>
                </div>
                
                <div className="relative mt-6 relative flex items-center justify-center w-24 h-24">
                   <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                     <path className="text-gray-700 transition-all duration-1000" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                     <path className="text-orange-500 transition-all duration-1000" strokeDasharray={`${globalRisk}, 100`} strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                   </svg>
                   <div className="absolute flex flex-col items-center justify-center">
                     <span className="text-3xl font-black text-white">{globalRisk}</span>
                   </div>
                </div>
                
                <div className="mt-4 flex gap-6 items-center">
                   <div className="text-center">
                     <div className="text-[8px] text-gray-400 font-bold uppercase">TREND</div>
                     <div className="text-xs text-green-400 font-bold flex items-center justify-center"><TrendingUp className="w-3 h-3 mr-1"/> STABLE</div>
                   </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-blue-600 rounded-xl p-2 flex items-center justify-between cursor-pointer hover:bg-blue-500 transition shadow-lg shadow-blue-500/20">
                   <span className="text-xs text-white font-bold ml-2">Join the Discussion</span>
                   <button className="bg-white text-blue-600 text-[10px] font-bold px-2 py-1 rounded-lg">Open Discussion</button>
                </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

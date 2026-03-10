"use client";

import React, { memo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

// We want to color Europe, Africa, Asia dynamically
// but in geojson for world-atlas, continent isn't directly exposed easily without mapping
// We'll approximate by region or use a global fill to look like the image.
const WorldMap = () => {
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <ComposableMap
        projectionConfig={{ scale: 140, center: [0, 20] }}
        width={800}
        height={400}
        style={{ width: "100%", height: "100%", outline: "none" }}
      >
        <ZoomableGroup zoom={1}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                // Approximate coloring for visual similarity to image
                // The image shows Europe in pink, Asia in light blue, Africa in purple
                const { name } = geo.properties;
                let fill = "#EBECEF"; // default light gray
                
                // Very rough heuristic for visual flair
                if (["Russian Federation", "China", "India", "Indonesia", "Japan", "Saudi Arabia", "Iran"].includes(name)) fill = "#E0F2FE"; // Asia blue
                else if (["Germany", "France", "United Kingdom", "Italy", "Spain", "Poland", "Ukraine"].includes(name)) fill = "#FCE7F3"; // Europe pink
                else if (["South Africa", "Egypt", "Nigeria", "Kenya", "Ethiopia", "Algeria", "Morocco", "Sudan"].includes(name)) fill = "#F3E8FF"; // Africa purple

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke="#FFFFFF"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#10B981", outline: "none" },
                      pressed: { fill: "#059669", outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Overlays from the Finlytics image */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-2/3 h-2/3 border-2 border-yellow-400 rounded-lg relative bg-white/20 backdrop-blur-[1px] shadow-sm pointer-events-auto transition-transform hover:scale-105">
          <div className="absolute top-[20%] left-[30%] text-xs font-bold text-red-500 bg-white/60 px-2 py-0.5 rounded backdrop-blur-sm -translate-x-1/2">Europe</div>
          <div className="absolute bottom-[30%] left-[35%] text-xs font-bold text-purple-600 bg-white/60 px-2 py-0.5 rounded backdrop-blur-sm -translate-x-1/2">Africa</div>
          <div className="absolute top-[30%] right-[30%] text-xs font-bold text-blue-500 bg-white/60 px-2 py-0.5 rounded backdrop-blur-sm translate-x-1/2">Asia</div>
          
          {/* Yellow corners decoration */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-yellow-400 -translate-x-[2px] -translate-y-[2px]" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-yellow-400 translate-x-[2px] -translate-y-[2px]" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-yellow-400 -translate-x-[2px] translate-y-[2px]" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-yellow-400 translate-x-[2px] translate-y-[2px]" />
        </div>
      </div>
    </div>
  );
};

export default memo(WorldMap);

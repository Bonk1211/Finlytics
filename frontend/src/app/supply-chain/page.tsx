"use client";

import React, { useState } from "react";
import {
  Package,
  Search,
  MapPin,
  Clock,
  DollarSign,
  Loader2,
  AlertCircle,
  TrendingDown,
  ShieldCheck,
  ShoppingCart
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export default function SupplyChainPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    product_name: "Robusta Coffee Beans",
    required_quantity: 1000,
    target_region: "Vietnam",
    max_lead_time_days: 14,
    existing_suppliers: [
      {
        name: "Da Lat Coffee Co",
        region: "Vietnam",
        products: ["Robusta"],
        lead_time_days: 10,
        unit_cost: 8.50,
        reliability_score: 0.9,
        minimum_order: 500
      }
    ]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? (parseFloat(value) || 0) : value
    }));
  };

  const findSuppliers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/supply-chain/recommend-suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({ error: "Failed to connect to supply chain engine" });
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full w-full p-8 bg-[#F8FAFC]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Package className="w-8 h-8 text-emerald-600" /> {t("supply.title")}
        </h1>
        <p className="text-gray-500 mt-2 text-sm font-medium">{t("supply.subtitle")}</p>
      </div>

      <div className="flex gap-8">
        {/* Left Input form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex-[0.8] flex flex-col gap-5">
           <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex justify-between items-center">
             {t("supply.formTitle")}
             <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-1 rounded">{t("supply.aiProcurement")}</span>
           </h2>

           <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t("supply.productNeeded")}</label>
              <input type="text" name="product_name" value={formData.product_name} onChange={handleChange} className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm focus:outline-emerald-500" />
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1"><ShoppingCart className="w-3 h-3"/> {t("supply.requiredQty")}</label>
                <input type="number" name="required_quantity" value={formData.required_quantity} onChange={handleChange} className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm focus:outline-emerald-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1"><Clock className="w-3 h-3"/> {t("supply.maxLeadTime")}</label>
                <input type="number" name="max_lead_time_days" value={formData.max_lead_time_days} onChange={handleChange} className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm focus:outline-emerald-500" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1"><MapPin className="w-3 h-3"/> {t("supply.targetRegion")}</label>
                <input type="text" name="target_region" value={formData.target_region} onChange={handleChange} className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm focus:outline-emerald-500" />
              </div>
           </div>

           <button
             onClick={findSuppliers}
             disabled={loading}
             className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-emerald-500/25"
           >
             {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Search className="w-5 h-5 mr-2" />}
             {loading ? "" : t("supply.analyzeBtn")}
           </button>
        </div>

        {/* Right Output details */}
        <div className="flex-1 flex flex-col">
          {result ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col h-full overflow-y-auto">
               <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6 flex items-center gap-2">
                 <ShieldCheck className="w-5 h-5 text-green-500" /> {t("supply.recommended")}
               </h2>

               {result.error ? (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-red-800 text-sm">{t("supply.failedResolve")}</h4>
                      <p className="text-red-600 text-xs mt-1">{result.error}</p>
                    </div>
                  </div>
               ) : (
                 <div className="space-y-4">
                    {result.recommendations && result.recommendations.map((rec: any, idx: number) => (
                      <div key={idx} className="border border-gray-100 bg-gray-50 rounded-xl p-4 flex justify-between items-center hover:shadow-md transition">
                        <div>
                          <h3 className="font-bold text-gray-900 text-base">{rec.name || rec.supplier_name || "Regional Supplier A"}</h3>
                          <div className="flex gap-4 mt-2 text-xs font-semibold text-gray-500">
                             <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-gray-400"/> {rec.region || formData.target_region}</span>
                             <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-gray-400"/> {rec.lead_time_days || "12"} {t("supply.days")}</span>
                             <span className="flex items-center gap-1 text-green-600"><TrendingDown className="w-3 h-3"/> Cost: ${rec.unit_cost || rec.estimated_cost || "7.50"}/unit</span>
                          </div>
                        </div>
                        <button
                           onClick={() => {
                             const supplierName = rec.name || rec.supplier_name || "Regional Supplier";
                             window.open(`https://www.google.com/search?q=${encodeURIComponent(supplierName)}`, "_blank");
                           }}
                           className="bg-white border border-gray-200 text-sm font-bold text-emerald-600 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50"
                        >
                           {t("supply.connect")}
                        </button>
                      </div>
                    ))}
                    {(!result.recommendations || result.recommendations.length === 0) && (
                      <div className="text-center py-10">
                         <span className="text-gray-400 font-bold mb-2 block">{t("supply.foundRouting")}</span>
                         <pre className="text-left text-xs bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto w-full">
                           {JSON.stringify(result, null, 2)}
                         </pre>
                      </div>
                    )}
                 </div>
               )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl border border-gray-200 border-dashed flex-1 flex flex-col items-center justify-center p-8 text-center h-full">
              <Search className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-gray-500 font-bold text-lg">{t("supply.awaitingTitle")}</h3>
              <p className="text-gray-400 text-sm mt-2 max-w-sm">{t("supply.awaitingDesc")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

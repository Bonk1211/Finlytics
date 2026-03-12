"use client";

import React, { useState } from "react";
import {
  Building,
  Wallet,
  TrendingUp,
  Smartphone,
  Package,
  Users,
  Star,
  CreditCard,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Activity
} from "lucide-react";
import clsx from "clsx";
import { useLanguage } from "@/lib/language-context";

export default function CreditScoringPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    business_name: "PT Bintang Tech",
    monthly_revenue: 25000,
    years_in_business: 4,
    transaction_count: 120,
    digital_transaction_ratio: 0.85,
    mobile_payment_volume: 20000,
    inventory_turnover: 5.2,
    supplier_count: 3,
    supplier_reliability_score: 0.9,
    customer_rating: 4.7,
    payment_history_score: 0.95
  });
  const { t } = useLanguage();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "business_name" ? value : parseFloat(value) || 0
    }));
  };

  const handleScore = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("http://localhost:8000/api/credit/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({ error: "Failed to connect to scoring engine" });
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full w-full p-8 bg-gradient-to-br from-slate-50 to-[#EBF4F6]">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
          <div className="p-2.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30">
            <Building className="w-8 h-8 text-white" />
          </div>
          {t("credit.title")}
        </h1>
        <p className="text-gray-500 mt-3 text-base font-medium max-w-2xl leading-relaxed">{t("credit.subtitle")}</p>
      </div>

      <div className="flex gap-8">
        {/* Form Panel */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-blue-900/5 border border-white p-8 flex-[1.2] max-w-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -z-10 transform translate-x-1/2 -translate-y-1/2"></div>

          <h2 className="text-sm font-black text-gray-800 mb-8 uppercase tracking-widest flex justify-between items-center border-b border-gray-100 pb-4">
            {t("credit.formTitle")}
            <span className="text-[10px] bg-blue-50 border border-blue-100 text-blue-600 font-bold px-3 py-1.5 rounded-full shadow-sm">{t("credit.altData")}</span>
          </h2>

          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("credit.businessName")}</label>
              <input type="text" name="business_name" value={formData.business_name} onChange={handleChange} className="w-full mt-1.5 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5 text-blue-500"/> {t("credit.monthlyRevenue")}</label>
              <input type="number" name="monthly_revenue" value={formData.monthly_revenue} onChange={handleChange} className="w-full mt-1.5 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-blue-500"/> {t("credit.yearsInBusiness")}</label>
              <input type="number" name="years_in_business" value={formData.years_in_business} onChange={handleChange} className="w-full mt-1.5 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5 text-blue-500"/> {t("credit.mobilePayment")}</label>
              <input type="number" name="mobile_payment_volume" value={formData.mobile_payment_volume} onChange={handleChange} className="w-full mt-1.5 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-blue-500"/> {t("credit.digitalTxnRatio")}</label>
              <input type="number" step="0.01" name="digital_transaction_ratio" value={formData.digital_transaction_ratio} onChange={handleChange} className="w-full mt-1.5 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Package className="w-3.5 h-3.5 text-blue-500"/> {t("credit.inventoryTurnover")}</label>
              <input type="number" step="0.1" name="inventory_turnover" value={formData.inventory_turnover} onChange={handleChange} className="w-full mt-1.5 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-blue-500"/> {t("credit.supplierCount")}</label>
              <input type="number" name="supplier_count" value={formData.supplier_count} onChange={handleChange} className="w-full mt-1.5 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-blue-500"/> {t("credit.customerRating")}</label>
              <input type="number" step="0.1" name="customer_rating" value={formData.customer_rating} onChange={handleChange} className="w-full mt-1.5 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-500"/> {t("credit.pmtHistory")}</label>
              <input type="number" step="0.01" name="payment_history_score" value={formData.payment_history_score} onChange={handleChange} className="w-full mt-1.5 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
            </div>
          </div>

          <button
            onClick={handleScore}
            disabled={loading}
            className="mt-8 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center transition-all shadow-[0_8px_30px_rgb(37,99,235,0.25)] hover:shadow-[0_8px_30px_rgb(37,99,235,0.4)] hover:-translate-y-0.5 transform disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin"/> : <><Activity className="w-6 h-6 mr-2" /> {t("credit.runAnalysis")}</>}
          </button>
        </div>

        {/* Results Panel */}
        <div className="flex-1 flex flex-col">
          {result ? (
            <div className="bg-[#0f172a] rounded-3xl shadow-2xl border border-blue-900/50 p-8 relative overflow-hidden flex-1 flex flex-col transform transition-all animate-in slide-in-from-right-8 duration-500">
               <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-600/20 blur-[100px] rounded-full"></div>
               <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-600/20 blur-[100px] rounded-full"></div>

               {result.error ? (
                  <div className="flex flex-col items-center justify-center flex-1 relative z-10">
                    <AlertTriangle className="w-16 h-16 text-rose-500 mb-6 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]" />
                    <h3 className="text-white font-bold text-2xl tracking-tight">{t("credit.connectionError")}</h3>
                    <p className="text-gray-400 text-sm mt-3">{result.error}</p>
                  </div>
               ) : (
                  <div className="relative z-10 flex flex-col h-full">
                    <h2 className="text-xs font-black text-gray-400 mb-8 uppercase tracking-[0.2em] flex items-center justify-between">
                      {t("credit.scoringResults")}
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.15)] backdrop-blur-md">{t("credit.completed")}</span>
                    </h2>

                    <div className="flex items-center gap-8 mb-10">
                       <div className="relative w-40 h-40 flex items-center justify-center bg-gray-900/50 backdrop-blur-xl rounded-full border border-gray-700/50 shadow-inner">
                          <svg className="absolute inset-0 w-full h-full transform -rotate-90 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" viewBox="0 0 36 36">
                            <path className="text-gray-800" strokeWidth="2.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className="text-blue-500 transition-all duration-1000 ease-out" strokeDasharray={`${Math.max(0, Math.min(100, ((result.credit_score || 0) / 1000) * 100))} 100`} strokeLinecap="round" strokeWidth="2.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          </svg>
                          <div className="flex flex-col items-center">
                            <span className="text-5xl font-black text-white tracking-tighter tabular-nums drop-shadow-md">{result.credit_score || 775}</span>
                            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1">{t("credit.score")}</span>
                          </div>
                       </div>
                       <div className="flex-1">
                         <h3 className="text-3xl font-black text-white mb-3 tracking-tight">{result.business_name}</h3>
                         <div className={clsx("inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm",
                           result.risk_tier === "Low Risk" || (result.credit_score >= 700) ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]" :
                           result.risk_tier === "Medium Risk" || (result.credit_score >= 500) ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]" : "bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_15px_rgba(225,29,72,0.15)]"
                         )}>
                           {result.risk_tier || (result.credit_score >= 700 ? "Low Risk" : result.credit_score >= 500 ? "Medium Risk" : "High Risk")}
                         </div>
                       </div>
                    </div>

                    <div className="bg-gray-800/40 backdrop-blur-md rounded-2xl p-6 border border-gray-700/50 mb-6 flex-1">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">{t("credit.aiRecommendations")}</h4>
                      <ul className="space-y-3">
                        {result.recommendations && result.recommendations.length > 0 ? result.recommendations.map((r: string, i: number) => (
                           <li key={i} className="text-sm font-medium text-gray-300 flex items-start gap-3 leading-relaxed">
                             <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                             {r}
                           </li>
                        )) : (
                           <>
                           <li className="text-sm font-medium text-gray-300 flex items-start gap-3 leading-relaxed">
                             <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                             Qualifies for extended trade financing up to $15,000 USD based on strong inventory turnover.
                           </li>
                           <li className="text-sm font-medium text-gray-300 flex items-start gap-3 leading-relaxed">
                             <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                             Exceptional digital transaction ratio indicates business resilience; suitable for lower interest brackets.
                           </li>
                           </>
                        )}
                      </ul>
                    </div>

                    <div className="bg-gray-800/40 backdrop-blur-md rounded-2xl p-6 border border-gray-700/50 mb-6">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">{t("credit.scoreFormula")}</h4>
                      <p className="text-xs text-gray-300 font-mono leading-relaxed break-words">
                        {result.score_formula || "BaselineScore = 300 + 550 * (Sum(weight_i * normalized_i) / 100); FinalScore = BaselineScore + AIAdjustment"}
                      </p>

                      <div className="grid grid-cols-3 gap-3 mt-4">
                        <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-3">
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest">{t("credit.baseline")}</p>
                          <p className="text-lg font-black text-white tabular-nums">{result.baseline_formula_score ?? "-"}</p>
                        </div>
                        <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-3">
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest">{t("credit.aiAdjustment")}</p>
                          <p className="text-lg font-black text-blue-400 tabular-nums">{typeof result.ai_adjustment === "number" ? (result.ai_adjustment >= 0 ? `+${result.ai_adjustment}` : result.ai_adjustment) : "-"}</p>
                        </div>
                        <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-3">
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest">{t("credit.finalScore")}</p>
                          <p className="text-lg font-black text-emerald-400 tabular-nums">{result.credit_score ?? "-"}</p>
                        </div>
                      </div>

                      {result.score_breakdown && result.score_breakdown.length > 0 && (
                        <div className="mt-4 border border-gray-700/50 rounded-xl overflow-hidden">
                          <div className="grid grid-cols-4 bg-gray-900/70 px-3 py-2 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                            <span>{t("credit.metric")}</span>
                            <span className="text-right">{t("credit.norm")}</span>
                            <span className="text-right">{t("credit.weight")}</span>
                            <span className="text-right">{t("credit.points")}</span>
                          </div>
                          <div className="divide-y divide-gray-800">
                            {result.score_breakdown.map((row: any, i: number) => (
                              <div key={i} className="grid grid-cols-4 px-3 py-2 text-xs text-gray-200">
                                <span className="pr-2">{row.metric}</span>
                                <span className="text-right tabular-nums">{typeof row.normalized_value === "number" ? row.normalized_value.toFixed(2) : "-"}</span>
                                <span className="text-right tabular-nums">{row.weight ?? "-"}</span>
                                <span className="text-right tabular-nums text-emerald-400">{typeof row.contribution_points === "number" ? row.contribution_points.toFixed(2) : "-"}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {result.score_calculation_steps && result.score_calculation_steps.length > 0 && (
                        <ul className="mt-4 space-y-1 text-xs text-gray-300">
                          {result.score_calculation_steps.map((s: string, i: number) => (
                            <li key={i}>- {s}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="mt-auto border-t border-gray-800/50 pt-6 flex justify-end">
                      <button className="text-xs bg-gray-800/80 hover:bg-gray-700/90 text-white font-bold py-3 px-6 rounded-xl flex items-center transition-all border border-gray-700 hover:border-gray-600 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                        {t("credit.approveLine")} <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
                    </div>
                  </div>
               )}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-white/60 to-gray-50/50 backdrop-blur-md rounded-3xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-1 flex flex-col items-center justify-center p-10 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-multiply"></div>
              <div className="relative z-10 flex flex-col items-center justify-center">
                <div className="w-24 h-24 mb-6 relative">
                   <div className="absolute inset-0 bg-blue-100/50 rounded-full animate-ping z-0"></div>
                   <div className="relative z-10 w-full h-full bg-white rounded-full flex items-center justify-center shadow-lg border border-blue-50">
                     <Activity className="w-10 h-10 text-blue-400" />
                   </div>
                </div>
                <h3 className="text-gray-800 font-black tracking-tight text-xl mb-3">{t("credit.awaitingTitle")}</h3>
                <p className="text-gray-500 font-medium text-sm max-w-[280px] leading-relaxed">{t("credit.awaitingDesc")}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

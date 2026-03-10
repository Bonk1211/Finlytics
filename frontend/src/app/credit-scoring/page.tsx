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
      // In a real app we'd fetch from env variable
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
    <div className="flex flex-col h-full w-full p-8 bg-[#F8FAFC]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Building className="w-8 h-8 text-blue-600" /> Alternative Credit Scoring
        </h1>
        <p className="text-gray-500 mt-2 text-sm font-medium">AI model that assesses creditworthiness using non-traditional financial data.</p>
      </div>
      
      <div className="flex gap-8">
        {/* Form Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex-1 max-w-2xl">
          <h2 className="text-lg font-bold text-gray-900 mb-6 uppercase tracking-wider text-sm flex justify-between items-center">
            Business Profile Input
            <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded">Alternative Data</span>
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Business Name</label>
              <input type="text" name="business_name" value={formData.business_name} onChange={handleChange} className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm focus:outline-blue-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1"><Wallet className="w-3 h-3"/> Monthly Revenue ($)</label>
              <input type="number" name="monthly_revenue" value={formData.monthly_revenue} onChange={handleChange} className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm focus:outline-blue-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1"><TrendingUp className="w-3 h-3"/> Years in Bus.</label>
              <input type="number" name="years_in_business" value={formData.years_in_business} onChange={handleChange} className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm focus:outline-blue-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1"><Smartphone className="w-3 h-3"/> Mobile Payment Vol.</label>
              <input type="number" name="mobile_payment_volume" value={formData.mobile_payment_volume} onChange={handleChange} className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm focus:outline-blue-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1"><CreditCard className="w-3 h-3"/> Digital Txn Ratio</label>
              <input type="number" step="0.01" name="digital_transaction_ratio" value={formData.digital_transaction_ratio} onChange={handleChange} className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm focus:outline-blue-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1"><Package className="w-3 h-3"/> Inventory Turnover</label>
              <input type="number" step="0.1" name="inventory_turnover" value={formData.inventory_turnover} onChange={handleChange} className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm focus:outline-blue-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1"><Users className="w-3 h-3"/> Supplier Count</label>
              <input type="number" name="supplier_count" value={formData.supplier_count} onChange={handleChange} className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm focus:outline-blue-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1"><Star className="w-3 h-3"/> Customer Rating</label>
              <input type="number" step="0.1" name="customer_rating" value={formData.customer_rating} onChange={handleChange} className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm focus:outline-blue-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Pmt History Score</label>
              <input type="number" step="0.01" name="payment_history_score" value={formData.payment_history_score} onChange={handleChange} className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm focus:outline-blue-500" />
            </div>
          </div>
          
          <button 
            onClick={handleScore}
            disabled={loading}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-blue-500/25"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <><Activity className="w-5 h-5 mr-2" /> Generate Credit Profile</>}
          </button>
        </div>

        {/* Results Panel */}
        <div className="flex-1 flex flex-col">
          {result ? (
            <div className="bg-gray-900 rounded-2xl shadow-xl border border-gray-800 p-6 relative overflow-hidden flex-1 flex flex-col">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full"></div>
               {result.error ? (
                  <div className="flex flex-col items-center justify-center flex-1">
                    <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                    <h3 className="text-white font-bold text-lg">Connection Error</h3>
                    <p className="text-gray-400 text-sm mt-2">{result.error}</p>
                  </div>
               ) : (
                  <>
                    <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-wider flex items-center justify-between">
                      Scoring Results
                      <span className="text-[10px] bg-green-500/20 text-green-400 font-bold px-2 py-0.5 rounded border border-green-500/50">COMPLETED</span>
                    </h2>
                    
                    <div className="flex items-center gap-6 mb-8">
                       <div className="relative w-32 h-32 flex items-center justify-center bg-gray-800 rounded-full border-4 border-gray-700">
                          <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path className="text-blue-500" strokeDasharray={`${Math.max(0, Math.min(100, (result.credit_score || 0) / 10))} 100`} strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          </svg>
                          <div className="flex flex-col items-center">
                            <span className="text-4xl font-black text-white">{result.credit_score}</span>
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Score</span>
                          </div>
                       </div>
                       <div>
                         <h3 className="text-2xl font-bold text-white mb-1">{result.business_name}</h3>
                         <div className={clsx("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase", 
                           result.risk_tier === "Low Risk" ? "bg-green-500/20 text-green-400" :
                           result.risk_tier === "Medium Risk" ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"
                         )}>
                           {result.risk_tier}
                         </div>
                       </div>
                    </div>
                    
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 mb-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Recommendations</h4>
                      <ul className="space-y-2">
                        {(result.recommendations || []).map((r: string, i: number) => (
                           <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                             <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                             {r}
                           </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-gray-800 flex justify-end">
                      <button className="text-xs bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
                        Approve Credit Line <ArrowRight className="w-3 h-3 ml-2" />
                      </button>
                    </div>
                  </>
               )}
            </div>
          ) : (
            <div className="bg-gray-100 rounded-2xl border border-gray-200 border-dashed flex-1 flex flex-col items-center justify-center p-8 text-center">
              <Activity className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-gray-500 font-bold text-lg">Awaiting Input</h3>
              <p className="text-gray-400 text-sm mt-2 max-w-sm">Submit business metrics to generate an AI-powered alternative credit score and risk analysis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

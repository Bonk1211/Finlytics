"use client";

import React, { useState } from "react";
import { 
  Building2, 
  MapPin, 
  Camera, 
  Upload, 
  CheckCircle2, 
  QrCode,
  Store,
  ArrowRight,
  ShieldCheck,
  Globe2
} from "lucide-react";
import clsx from "clsx";

export default function BusinessVisibilityPage() {
  const [step, setStep] = useState(1);
  const [isVerifying, setIsVerifying] = useState(false);

  const completeOnboarding = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setStep(3);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full w-full p-8 bg-[#F8FAFC]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Store className="w-8 h-8 text-orange-500" /> Business Visibility Engine
        </h1>
        <p className="text-gray-500 mt-2 text-sm font-medium">Digital onboarding tool to create a verified profile and access global markets for offline businesses.</p>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl shadow-orange-500/10 border border-gray-100 max-w-4xl w-full flex overflow-hidden">
          
          {/* Progress Sidebar */}
          <div className="w-64 bg-gray-50 p-6 border-r border-gray-100 flex flex-col justify-between">
             <div>
               <div className="font-bold text-gray-900 mb-8 uppercase tracking-widest text-xs flex items-center gap-2">
                 <Globe2 className="w-4 h-4 text-orange-500"/> Digital Twin Setup
               </div>
               <div className="space-y-6">
                 <div className="flex items-center gap-3">
                    <div className={clsx("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", step >= 1 ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-500")}>1</div>
                    <span className={clsx("text-sm font-semibold", step >= 1 ? "text-gray-900" : "text-gray-400")}>Basic Info</span>
                 </div>
                 <div className="w-0.5 h-6 bg-gray-200 border-l border-dashed ml-3 -mt-4 -mb-4"></div>
                 <div className="flex items-center gap-3">
                    <div className={clsx("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", step >= 2 ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-500")}>2</div>
                    <span className={clsx("text-sm font-semibold", step >= 2 ? "text-gray-900" : "text-gray-400")}>Storefront Sync</span>
                 </div>
                 <div className="w-0.5 h-6 bg-gray-200 border-l border-dashed ml-3 -mt-4 -mb-4"></div>
                 <div className="flex items-center gap-3">
                    <div className={clsx("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", step >= 3 ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500")}>3</div>
                    <span className={clsx("text-sm font-semibold", step >= 3 ? "text-gray-900" : "text-gray-400")}>Verified Profile</span>
                 </div>
               </div>
             </div>
             
             <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest border-t border-gray-200 pt-4">
               Blockchain Verified ✓
             </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 p-10 bg-white">
             {step === 1 && (
               <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                 <h2 className="text-2xl font-bold text-gray-900 mb-2">Register your storefront</h2>
                 <p className="text-sm text-gray-500 mb-8">Let's get your offline business recognized on the global supply chain map.</p>
                 
                 <div className="space-y-4">
                   <div>
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Business Legal Name</label>
                     <div className="relative mt-1">
                       <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                       <input type="text" placeholder="e.g. Toko ABC, Borneo Woodcrafts" className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-orange-500 focus:border-orange-500 transition-colors bg-gray-50" />
                     </div>
                   </div>
                   <div>
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Operating Coordinates</label>
                     <div className="relative mt-1">
                       <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                       <input type="text" placeholder="Location pin or coordinates" className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-orange-500 focus:border-orange-500 transition-colors bg-gray-50" />
                     </div>
                   </div>
                 </div>

                 <button 
                   onClick={() => setStep(2)}
                   className="mt-8 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-orange-500/30"
                 >
                   Continue to Storefront Verification <ArrowRight className="w-5 h-5 ml-2" />
                 </button>
               </div>
             )}

             {step === 2 && (
               <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                 <h2 className="text-2xl font-bold text-gray-900 mb-2">Capture your operations</h2>
                 <p className="text-sm text-gray-500 mb-8">Upload verifiable proofs of business existence for the AI engine.</p>
                 
                 <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="border border-gray-200 border-dashed rounded-2xl flex flex-col items-center justify-center py-10 bg-gray-50 hover:bg-orange-50 hover:border-orange-200 transition-colors cursor-pointer group">
                      <Camera className="w-8 h-8 text-gray-400 group-hover:text-orange-500 mb-3" />
                      <span className="text-xs font-bold text-gray-600">Storefront Photo</span>
                      <span className="text-[10px] text-gray-400">Shows physical location</span>
                    </div>
                    <div className="border border-gray-200 border-dashed rounded-2xl flex flex-col items-center justify-center py-10 bg-gray-50 hover:bg-orange-50 hover:border-orange-200 transition-colors cursor-pointer group">
                      <Upload className="w-8 h-8 text-gray-400 group-hover:text-orange-500 mb-3" />
                      <span className="text-xs font-bold text-gray-600">Business License</span>
                      <span className="text-[10px] text-gray-400">PDF or Image</span>
                    </div>
                 </div>

                 <button 
                   onClick={completeOnboarding}
                   disabled={isVerifying}
                   className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-opacity-70 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-orange-500/30"
                 >
                   {isVerifying ? (
                     <div className="flex items-center gap-2"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> AI Analyzing Data...</div>
                   ) : (
                     <>Generate Verified Profile <ShieldCheck className="w-5 h-5 ml-2" /></>
                   )}
                 </button>
               </div>
             )}

             {step === 3 && (
               <div className="animate-in zoom-in-95 duration-500 flex flex-col items-center justify-center text-center py-6 h-full">
                 <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(74,222,128,0.3)]">
                   <CheckCircle2 className="w-10 h-10 text-green-500" />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-900 mb-2">Digital Profile Created!</h2>
                 <p className="text-sm text-gray-500 mb-8 max-w-sm">Your business is now fully visible to international supply chains and alternative credit protocols.</p>
                 
                 <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 w-full max-w-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 blur-2xl rounded-full"></div>
                    <div className="flex items-center gap-4 mb-4 relative z-10 text-left">
                       <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center border border-gray-100">
                         <QrCode className="w-6 h-6 text-gray-900" />
                       </div>
                       <div>
                         <h3 className="font-bold text-gray-900">Borneo Woodcrafts</h3>
                         <p className="text-xs font-semibold text-green-600 flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Active Level 1 Trader</p>
                       </div>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold text-gray-500 relative z-10 pt-4 border-t border-gray-200 mt-4">
                       <div>SUPPLY CHAIN ID</div>
                       <div className="font-mono text-gray-900">MSME-ID-8849</div>
                    </div>
                 </div>

                 <button 
                   onClick={() => setStep(1)}
                   className="mt-8 text-sm font-bold text-orange-600 hover:text-orange-700 underline"
                 >
                   Register another business
                 </button>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

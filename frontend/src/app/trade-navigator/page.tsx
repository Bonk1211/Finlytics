"use client";

import React, { useState } from "react";
import {
  Globe,
  Send,
  Bot,
  User,
  Loader2,
  FileText,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import clsx from "clsx";
import ReactMarkdown from "react-markdown";
import { useLanguage } from "@/lib/language-context";

const LOCALE_INSTRUCTIONS: Record<string, string> = {
  en: "",
  ms: "Please respond in Bahasa Melayu. ",
  id: "Please respond in Bahasa Indonesia. ",
  th: "Please respond in Thai (ภาษาไทย). ",
  vi: "Please respond in Vietnamese (Tiếng Việt). ",
  zh: "Please respond in Chinese (中文). ",
};

export default function TradeNavigatorPage() {
  const { locale, t } = useLanguage();
  const [messages, setMessages] = useState([
    { role: "assistant", content: t("trade.welcome") }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const prefix = LOCALE_INSTRUCTIONS[locale] || "";
      const res = await fetch("http://localhost:8000/api/trade-ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: prefix + userMsg,
          user_id: "msme_user_001"
        })
      });
      const data = await res.json();

      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.response || data.answer || t("trade.errorProcess")
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: t("trade.errorConnect")
      }]);
    }

    setLoading(false);
  };

  const SUGGESTED_QUERIES = [
    t("trade.suggestAtiga"),
    t("trade.suggestCif"),
    t("trade.suggestCoffee"),
    t("trade.suggestHs"),
  ];

  return (
    <div className="flex flex-col h-full w-full p-8 bg-[#F8FAFC]">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Globe className="w-8 h-8 text-teal-600" /> {t("trade.title")}
          </h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">{t("trade.subtitle")}</p>
        </div>
        <div className="flex gap-2">
           <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg shadow-sm hover:bg-gray-50 transition">
             <FileText className="w-3.5 h-3.5" /> {t("trade.complianceDocs")}
           </button>
           <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg shadow-sm hover:bg-gray-50 transition">
             <ShieldCheck className="w-3.5 h-3.5" /> {t("trade.tariffLookup")}
           </button>
        </div>
      </div>

      <div className="bg-white flex flex-col flex-1 rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={clsx("flex gap-4 max-w-[85%]", msg.role === "user" ? "ml-auto flex-row-reverse" : "")}>
              <div className={clsx(
                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm",
                msg.role === "user" ? "bg-indigo-100 text-indigo-600" : "bg-teal-600 text-white"
              )}>
                {msg.role === "user" ? <User className="w-5 h-5"/> : <Bot className="w-5 h-5"/>}
              </div>
              <div className={clsx(
                "p-4 rounded-2xl text-[15px] leading-relaxed",
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-tr-none shadow-md"
                  : "bg-gray-50 text-gray-800 border border-gray-100 rounded-tl-none"
              )}>
                {msg.role === "assistant" ? (
                  <ReactMarkdown
                    components={{
                      p: ({node, ...props}: any) => <p className="mb-2 last:mb-0" {...props} />,
                      strong: ({node, ...props}: any) => <strong className="font-bold text-teal-900" {...props} />,
                      ul: ({node, ...props}: any) => <ul className="list-disc pl-5 mb-2" {...props} />,
                      ol: ({node, ...props}: any) => <ol className="list-decimal pl-5 mb-2" {...props} />,
                      li: ({node, ...props}: any) => <li className="mb-1" {...props} />
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  msg.content.split('\n').map((line: string, i: number) => (
                    <span key={i} className="block mb-1">{line}</span>
                  ))
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-4 max-w-[85%]">
              <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Bot className="w-5 h-5"/>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 text-gray-800 border border-gray-100 rounded-tl-none flex items-center gap-2">
                 <Loader2 className="w-4 h-4 animate-spin text-teal-600" /> {t("trade.analyzing")}
              </div>
            </div>
          )}
        </div>

        {/* Suggested Queries */}
        <div className="px-6 pb-2 overflow-x-auto whitespace-nowrap hide-scrollbar flex gap-2">
          {SUGGESTED_QUERIES.map((q, i) => (
            <button
              key={i}
              onClick={() => setInput(q)}
              className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-100 hover:bg-teal-100 px-3 py-1.5 rounded-full transition-colors inline-flex items-center"
            >
              {q} <ChevronRight className="w-3 h-3 ml-1 opacity-50"/>
            </button>
          ))}
        </div>

        {/* Input Form */}
        <div className="p-4 bg-white border-t border-gray-100">
           <form
              onSubmit={e => { e.preventDefault(); sendMessage(); }}
              className="relative flex items-center bg-gray-50 rounded-xl px-2 py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all shadow-sm"
           >
             <input
               type="text"
               value={input}
               onChange={e => setInput(e.target.value)}
               placeholder={t("trade.placeholder")}
               className="flex-1 bg-transparent border-none outline-none px-4 text-sm text-gray-800 placeholder-gray-400"
               disabled={loading}
             />
             <button
               type="submit"
               disabled={loading || !input.trim()}
               className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white p-2.5 rounded-lg transition-colors ml-2 shadow-sm"
             >
               <Send className="w-4 h-4" />
             </button>
           </form>
           <p className="text-[10px] text-center text-gray-400 font-medium mt-3 uppercase tracking-widest">{t("trade.poweredBy")}</p>
        </div>

      </div>
    </div>
  );
}

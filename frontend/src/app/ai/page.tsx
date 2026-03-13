"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Plus,
  Command,
  Cpu,
  MessageSquare,
  Terminal,
  Settings,
  Shield,
  ChevronDown,
  X,
  CheckCircle2,
  MoreHorizontal,
  Mic,
  Play,
  Github,
  Search,
  Building,
  Globe,
  Package,
  TrendingUp,
  FileText,
  MapPin,
  Clock,
  Zap,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useAppMode } from "@/lib/mode-context";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { sendMessageToChatbot, ToolUsage } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "assistant";
  content: string;
  type?: "credit" | "trade" | "supply" | "default";
  interactive?: boolean;
  tools_used?: ToolUsage[];
}

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setMode } = useAppMode();
  const { t } = useLanguage();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [expandedTools, setExpandedTools] = useState<Record<number, boolean>>({});

  const [formState, setFormState] = useState({
    industry: "Retail",
    region: "Jakarta",
    risk: 50,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const TOOLS = [
    { 
      id: "credit", 
      title: "MSME Credit Scorer", 
      desc: "Instant alternative data credit risk assessment.", 
      icon: Building, 
      prompt: "Perform a credit analysis for a retail business in Jakarta." 
    },
    { 
      id: "trade", 
      title: "Trade Navigator", 
      desc: "Regional compliance, tax, and regulation lookup.", 
      icon: Globe, 
      prompt: "What are the export rules for electronics from Malaysia to Thailand?" 
    },
    { 
      id: "supply", 
      title: "Supply Chain", 
      desc: "Route optimization and logistics monitoring.", 
      icon: Package, 
      prompt: "Analyze our supply chain route from Vietnam ports." 
    },
    { 
      id: "stats", 
      title: "Visibility Engine", 
      desc: "Real-time market trends across 10 ASEAN nations.", 
      icon: TrendingUp, 
      prompt: "Show me market visibility trends for agricultural exports." 
    },
  ];

  const handleSend = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || isLoading) return;

    setInput("");
    const newMessages = [...messages, { role: "user", content } as Message];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const { response, tools_used } = await sendMessageToChatbot(content);

      const assistantMsg: Message = {
        role: "assistant",
        content: response,
        type: content.toLowerCase().includes("credit") ? "credit" :
              content.toLowerCase().includes("trade") ? "trade" :
              content.toLowerCase().includes("supply") ? "supply" : "default",
        interactive: content.toLowerCase().includes("credit") ||
                     content.toLowerCase().includes("trade") ||
                     content.toLowerCase().includes("supply"),
        tools_used: tools_used || [],
      };

      setMessages([...newMessages, assistantMsg]);
    } catch (error) {
      setMessages([...newMessages, { role: "assistant", content: "I'm sorry, I couldn't connect to the orchestration engine. Please check if the backend is running." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToManual = () => {
    setMode("manual");
    router.push("/");
  };

  return (
    <div className="flex h-screen pt-16 bg-[#F8FAFC] text-[#1a202c] font-openai-chat selection:bg-emerald-500/30">
      {/* Sidebar */}
      <aside className="w-[260px] bg-white border-r border-[#E2E8F0] flex flex-col shrink-0">
        <div className="p-4 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#F1F5F9] text-sm font-semibold transition-colors group text-[#64748B] hover:text-[#1a202c]">
            <Plus className="w-4 h-4 text-[#94A3B8] group-hover:text-[#1a202c]" />
            {t("ai.newThread")}
            <span className="ml-auto text-[10px] text-[#94A3B8] border border-[#E2E8F0] px-1 rounded font-bold">⌘K</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#F1F5F9] text-sm font-semibold transition-colors text-[#64748B] hover:text-[#1a202c]">
            <Command className="w-4 h-4" />
            {t("ai.automations")}
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#F1F5F9] text-sm font-semibold transition-colors text-[#64748B] hover:text-[#1a202c]">
            <Cpu className="w-4 h-4" />
            {t("ai.skills")}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pt-4">
          <div className="px-4 mb-2 flex items-center justify-between group">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">{t("ai.threads")}</span>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <Plus className="w-3.5 h-3.5 text-[#94A3B8] cursor-pointer hover:text-[#1a202c]" />
               <Search className="w-3.5 h-3.5 text-[#94A3B8] cursor-pointer hover:text-[#1a202c]" />
            </div>
          </div>
          <div className="px-2 space-y-0.5">
            {/* Removed Playground link */}
            <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-bold bg-[#F1F5F9] text-[#1a202c] border border-transparent relative group">
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              <span className="truncate pr-8">{t("ai.activeEngine")}</span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[#E2E8F0] space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#F1F5F9] text-sm font-semibold transition-colors text-[#64748B]">
            <Settings className="w-4 h-4" />
            {t("ai.settings")}
          </button>
          <button
            onClick={handleSwitchToManual}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-emerald-50 text-sm font-bold transition-colors text-emerald-600"
          >
            <Shield className="w-4 h-4" />
            {t("ai.manualDashboard")}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col relative overflow-hidden bg-white">
        <header className="h-12 border-b border-[#E2E8F0] flex items-center px-4 justify-between shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="text-[#1a202c]">{t("chat.title")}</span>
            <span className="text-[#CBD5E1]">/</span>
            <span className="text-[#64748B]">{t("ai.orchestration")}</span>
          </div>
          <div className="flex items-center gap-3">
             {/* Mode badge removed */}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar relative bg-[#F8FAFC]/50">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center pb-48 animate-in fade-in zoom-in-95 duration-1000">
               <div className="text-center mb-10">
                  <h1 className="text-5xl font-bold mb-2 tracking-tight text-[#111827]">
                    {t("ai.greeting")}
                  </h1>
                  <p className="text-2xl font-semibold text-[#64748B] tracking-tight">
                    {t("ai.greetingSub")}
                  </p>
                  <p className="text-[12px] text-[#94A3B8] mt-2 font-normal">
                    {t("ai.greetingHint")}
                  </p>
               </div>
               
               <div className="grid grid-cols-3 gap-6 w-full max-w-[900px]">
                  {[
                    {
                      id: "news",
                      titleKey: "ai.card.news.title",
                      descKey: "ai.card.news.desc",
                      icon: Globe,
                      prompt: "What are the key trade and business headlines in ASEAN from the last 24 hours?",
                      color: "from-emerald-500 to-teal-500"
                    },
                    {
                      id: "stocks",
                      titleKey: "ai.card.stocks.title",
                      descKey: "ai.card.stocks.desc",
                      icon: TrendingUp,
                      prompt: "Give me a summary of current stock market performance for key ASEAN indices.",
                      color: "from-emerald-600 to-cyan-500"
                    },
                    {
                      id: "research",
                      titleKey: "ai.card.research.title",
                      descKey: "ai.card.research.desc",
                      icon: FileText,
                      prompt: "Perform a deep economic analysis on the impact of RCEP for MSMEs in Malaysia.",
                      color: "from-teal-500 to-emerald-400"
                    }
                  ].map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => handleSend(tool.prompt)}
                      className="text-left p-6 rounded-[24px] border border-[#E2E8F0] bg-white hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all group relative overflow-hidden active:scale-[0.98] shadow-sm"
                    >
                      <span className="text-[17px] font-semibold text-[#1a202c] tracking-tight block mb-2 leading-tight">
                        {t(tool.titleKey)}
                      </span>
                      <span className="text-[12px] text-[#64748B] font-medium leading-relaxed block">
                        {t(tool.descKey)}
                      </span>
                      
                      <div className={`absolute -bottom-8 -right-8 w-20 h-20 bg-gradient-to-br ${tool.color} blur-[50px] opacity-0 group-hover:opacity-10 transition-opacity`} />
                    </button>
                  ))}
               </div>
            </div>
          ) : (
            <div className="max-w-[850px] mx-auto space-y-12 pb-48">
              {messages.map((msg, i) => (
                <div key={i} className={clsx("w-full flex", msg.role === "user" ? "justify-end" : "justify-start animate-in slide-in-from-left-4 duration-500")}>
                  {msg.role === "user" ? (
                    <div className="bg-emerald-600 px-6 py-3 rounded-2xl text-[14px] font-bold text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)] border border-emerald-500">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="w-full space-y-6">
                      <div className="flex items-center gap-3 mb-1">
                         <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100">
                            <Cpu className="w-4 h-4 text-emerald-600" />
                         </div>
                         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#94A3B8]">{t("ai.engineLabel")}</span>
                      </div>
                      <div className="text-[15px] leading-relaxed text-[#334155] pl-10 font-medium max-w-[800px] markdown-content">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
                            h1: ({node, ...props}) => <h1 className="text-xl font-black text-[#1a202c] mt-6 mb-3" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-lg font-black text-[#1a202c] mt-5 mb-2" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-md font-black text-[#1a202c] mt-4 mb-2" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />,
                            li: ({node, ...props}) => <li className="mb-1" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-black text-emerald-600" {...props} />,
                            table: ({node, ...props}) => (
                              <div className="overflow-x-auto my-6 rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
                                <table className="w-full text-sm text-left border-collapse" {...props} />
                              </div>
                            ),
                            thead: ({node, ...props}) => <thead className="bg-[#F8FAFC] text-[10px] font-black uppercase tracking-widest text-[#64748B]" {...props} />,
                            th: ({node, ...props}) => <th className="px-4 py-3 border-b border-[#E2E8F0]" {...props} />,
                            td: ({node, ...props}) => <td className="px-4 py-3 border-b border-[#E2E8F0] text-[#334155]" {...props} />,
                            code({node, inline, className, children, ...props}: any) {
                              const match = /language-(\w+)/.exec(className || '')
                              return !inline ? (
                                <pre className="p-4 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] overflow-x-auto my-4 text-xs font-mono">
                                  <code className={className} {...props}>{children}</code>
                                </pre>
                              ) : (
                                <code className="px-1.5 py-0.5 rounded bg-[#F1F5F9] text-emerald-600 font-mono text-xs" {...props}>{children}</code>
                              )
                            },
                            img: ({node, ...props}) => <img className="rounded-2xl border border-[#E2E8F0] my-6 shadow-xl max-w-full" {...props} />,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                      
                      {/* Tools Used & References Toggle */}
                      {msg.tools_used && msg.tools_used.length > 0 && (
                        <div className="ml-10 mt-4 animate-in slide-in-from-bottom-2 duration-500">
                          <button
                            onClick={() => setExpandedTools(prev => ({ ...prev, [i]: !prev[i] }))}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] hover:border-emerald-200 transition-all text-left group"
                          >
                            <Terminal className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-[11px] font-bold text-[#64748B] group-hover:text-[#1a202c] transition-colors">
                              {expandedTools[i] ? t("ai.hideTools") : t("ai.showTools")}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              {msg.tools_used.length}
                            </span>
                            <ChevronDown className={clsx(
                              "w-3.5 h-3.5 text-[#94A3B8] transition-transform duration-200",
                              expandedTools[i] && "rotate-180"
                            )} />
                          </button>

                          {expandedTools[i] && (
                            <div className="mt-2 border border-[#E2E8F0] rounded-2xl overflow-hidden bg-white shadow-sm animate-in slide-in-from-top-2 duration-300">
                              <div className="divide-y divide-[#F1F5F9]">
                                {msg.tools_used.map((tool, ti) => (
                                  <div key={ti} className="px-5 py-3 hover:bg-[#FAFBFC] transition-colors">
                                    <div className="flex items-center gap-3 mb-1.5">
                                      <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-md bg-emerald-50 flex items-center justify-center border border-emerald-100">
                                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                        </div>
                                        <code className="text-[12px] font-bold font-mono text-[#1a202c]">
                                          {tool.tool_name}
                                        </code>
                                      </div>
                                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#94A3B8] bg-[#F1F5F9] px-2 py-0.5 rounded">
                                        {tool.agent}
                                      </span>
                                    </div>
                                    {tool.input_summary && (
                                      <div className="ml-7 text-[11px] text-[#64748B] font-mono truncate">
                                        <span className="text-[#94A3B8]">input:</span> {tool.input_summary}
                                      </div>
                                    )}
                                    <div className="ml-7 mt-1 text-[11px] text-[#64748B] line-clamp-2">
                                      <span className="text-[#94A3B8]">output:</span> {tool.output_summary}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="px-5 py-2.5 bg-[#FAFBFC] border-t border-[#F1F5F9] flex items-center gap-2">
                                <Shield className="w-3 h-3 text-[#94A3B8]" />
                                <span className="text-[9px] text-[#94A3B8] font-medium">
                                  All tool outputs verified via live API calls — not generated from memory
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {msg.interactive && (
                        <div className="ml-10 mt-4 bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xl max-w-[600px] animate-in slide-in-from-bottom-4 duration-700">
                           {/* Context Header */}
                           <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
                              <div className="flex items-center gap-3">
                                {msg.type === "credit" && <Building className="w-4 h-4 text-emerald-600" />}
                                {msg.type === "trade" && <Globe className="w-4 h-4 text-emerald-600" />}
                                {msg.type === "supply" && <Package className="w-4 h-4 text-emerald-600" />}
                                <span className="text-[11px] font-black text-[#1a202c] uppercase tracking-wider">
                                  {msg.type || "Default"} Control Panel
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Search className="w-3.5 h-3.5 text-[#94A3B8] hover:text-[#1a202c] cursor-pointer" />
                                <X className="w-3.5 h-3.5 text-[#94A3B8] hover:text-[#1a202c] cursor-pointer" />
                              </div>
                           </div>

                           {/* Interactive UI Body */}
                           <div className="p-8 space-y-8">
                              {msg.type === "credit" && (
                                <>
                                  <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                      <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Industry Segment</label>
                                      <select 
                                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-sm text-[#1a202c] focus:border-emerald-500 outline-none transition-all"
                                        onChange={(e) => setFormState({...formState, industry: e.target.value})}
                                        value={formState.industry}
                                      >
                                        <option>Retail</option>
                                        <option>Tech</option>
                                        <option>Agriculture</option>
                                        <option>Logistics</option>
                                      </select>
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Target Region</label>
                                      <div className="flex items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-2.5">
                                        <MapPin className="w-3.5 h-3.5 text-emerald-500 mr-2" />
                                        <input 
                                          className="bg-transparent border-none outline-none text-sm text-[#1a202c] w-full"
                                          value={formState.region}
                                          onChange={(e) => setFormState({...formState, region: e.target.value})}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="space-y-4">
                                     <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Risk Sensitivity</label>
                                        <span className="text-[11px] font-black text-emerald-600">{formState.risk}%</span>
                                     </div>
                                     <input 
                                        type="range" 
                                        className="w-full accent-emerald-500 h-1.5 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer"
                                        value={formState.risk}
                                        onChange={(e) => setFormState({...formState, risk: parseInt(e.target.value)})}
                                     />
                                  </div>
                                </>
                              )}

                              {msg.type === "trade" && (
                                <div className="space-y-6">
                                  <div className="grid grid-cols-3 gap-3">
                                    {["Taxes", "Customs", "Logistics", "Legal", "Markets", "Pricing"].map(tag => (
                                      <button key={tag} className="px-3 py-2 rounded-lg border border-[#E2E8F0] hover:border-emerald-500 hover:bg-emerald-50 text-[11px] font-bold text-[#64748B] hover:text-emerald-700 transition-all">
                                        {tag}
                                      </button>
                                    ))}
                                  </div>
                                  <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex items-center justify-between">
                                     <div className="flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-emerald-600" />
                                        <div>
                                          <div className="text-[11px] font-bold text-[#1a202c] leading-none">Draft Compliance Doc</div>
                                          <div className="text-[9px] text-[#94A3B8] mt-1 uppercase tracking-tighter">Generated 2m ago</div>
                                        </div>
                                     </div>
                                     <button className="p-2 hover:bg-white rounded-lg text-emerald-600 border border-transparent hover:border-emerald-100 transition-all shadow-sm">
                                        <Play className="w-4 h-4 fill-current" />
                                     </button>
                                  </div>
                                </div>
                              )}

                              {msg.type === "supply" && (
                                <div className="space-y-6">
                                   <div className="flex items-center gap-4">
                                      <div className="flex-1 p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-center shadow-sm">
                                         <Clock className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
                                         <div className="text-[18px] font-black text-[#1a202c]">4.2d</div>
                                         <div className="text-[9px] font-black text-[#94A3B8] uppercase">Est. Transit</div>
                                      </div>
                                      <div className="flex-1 p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-center shadow-sm">
                                         <TrendingUp className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
                                         <div className="text-[18px] font-black text-[#1a202c]">$1.2k</div>
                                         <div className="text-[9px] font-black text-[#94A3B8] uppercase">Optimized Cost</div>
                                      </div>
                                   </div>
                                   <button className="w-full py-3 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-[0_4px_12px_rgba(16,185,129,0.3)]">
                                      Execute Optimization
                                   </button>
                                </div>
                              )}

                              <div className="pt-6 border-t border-[#E2E8F0] flex items-center justify-between">
                                 <p className="text-[10px] text-[#94A3B8] italic font-medium">Changes here will reflect in the next analysis cycle.</p>
                                 <button 
                                    onClick={() => handleSend(`Updated parameters: Industry=${formState.industry}, Region=${formState.region}, Risk=${formState.risk}%`)}
                                    className="px-5 py-2 rounded-lg bg-[#1a202c] text-white text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-lg"
                                 >
                                    Update Engine <Zap className="w-3 h-3 fill-current" />
                                 </button>
                              </div>
                           </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start items-center gap-3 pl-10">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#94A3B8]">Analyzing Context</span>
                </div>
              )}
              <div ref={messagesEndRef} className="h-20" />
            </div>
          )}
        </div>

        {/* --- Floating Bottom Input Area --- */}
        <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-center bg-gradient-to-t from-white via-white/90 to-transparent">
          <div className="w-full max-w-[800px] bg-white border border-[#E2E8F0] rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.08)] p-4 flex flex-col group focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-500/5 transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Submit manual query or use GUI controls above..."
              className="w-full bg-transparent border-none outline-none resize-none text-[15px] placeholder:text-[#94A3B8] min-h-[44px] px-2 pt-1 text-[#1a202c] font-medium"
              rows={1}
            />
            <div className="mt-3 flex items-center justify-between border-t border-[#F1F5F9] pt-3 px-1">
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2 group/btn cursor-pointer">
                  <div className="w-5 h-5 rounded bg-[#F8FAFC] flex items-center justify-center border border-[#E2E8F0] group-hover/btn:bg-white group-hover/btn:border-emerald-200 transition-colors">
                    <Plus className="w-3 h-3 text-[#64748B]" />
                  </div>
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-tighter">Attach</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] text-[9px] font-black text-[#94A3B8] uppercase">
                  Engine active
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Mic className="w-4 h-4 text-[#94A3B8] hover:text-emerald-500 cursor-pointer transition-colors" />
                <button
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  className="w-10 h-10 rounded-2xl bg-[#1a202c] text-white flex items-center justify-center hover:bg-black transition-all disabled:opacity-10 shadow-lg disabled:shadow-none"
                >
                  {isLoading ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

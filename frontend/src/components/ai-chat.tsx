"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, Sparkles, FileText, TrendingUp, Building, Package, ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLanguage } from "@/lib/language-context";
import { useRouter } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatProps {
  onNavigate?: () => void;
}

const LOCALE_INSTRUCTIONS: Record<string, string> = {
  en: "",
  ms: "Please respond in Bahasa Melayu. ",
  id: "Please respond in Bahasa Indonesia. ",
  th: "Please respond in Thai (ภาษาไทย). ",
  vi: "Please respond in Vietnamese (Tiếng Việt). ",
  zh: "Please respond in Chinese (中文). ",
};

export default function AIChat({ onNavigate }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { locale, t } = useLanguage();
  const router = useRouter();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const prefix = LOCALE_INSTRUCTIONS[locale] || "";
      const res = await fetch("http://localhost:8000/api/chatbot/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prefix + userMessage }),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response || t("aiChat.fallback"),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: t("aiChat.errorConnect") },
      ]);
    }
    setIsLoading(false);
  };

  const handleQuickAction = (label: string) => {
    setInput(label);
  };

  const handleInterfaceTrigger = (route: string, prompt: string) => {
    setInput(prompt);
    router.push(route);
    onNavigate?.();
  };

  const QUICK_ACTIONS = [
    { labelKey: "aiChat.quick.credit", icon: Sparkles, bg: "var(--color-ai-mint)" },
    { labelKey: "aiChat.quick.trade", icon: FileText, bg: "var(--color-ai-lavender)" },
    { labelKey: "aiChat.quick.market", icon: TrendingUp, bg: "var(--color-primary-light)" },
  ];

  const HERO_PROMPTS = [
    {
      id: "credit",
      title: "Open Credit Scoring",
      desc: "Run business scoring and recommendations with one click.",
      icon: Building,
      className: "from-emerald-500 to-emerald-600",
      onClick: () => handleInterfaceTrigger("/credit-scoring", t("aiChat.quick.credit")),
    },
    {
      id: "supply",
      title: "Open Supply Chain",
      desc: "Find supplier options and route insights quickly.",
      icon: Package,
      className: "from-emerald-600 to-teal-500",
      onClick: () => handleInterfaceTrigger("/supply-chain", "Help me with supplier recommendations"),
    },
    {
      id: "market",
      title: "Market Summary",
      desc: "See what is moving across ASEAN markets right now.",
      icon: TrendingUp,
      className: "from-teal-500 to-cyan-500",
      onClick: () => handleQuickAction(t("aiChat.quick.market")),
    },
  ];

  return (
    <div className="card ai-chat-shell flex flex-col" style={{ height: "100%" }}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-2xl"
          style={{ background: "var(--color-ai-lavender)" }}
        >
          <Bot className="h-5 w-5" style={{ color: "var(--color-ai-purple)" }} />
        </div>
        <div>
          <h3 className="text-sm font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            {t("aiChat.title")}
          </h3>
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            {t("aiChat.subtitle")}
          </p>
        </div>
        </div>
        <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
          AI
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => handleInterfaceTrigger("/credit-scoring", t("aiChat.quick.credit"))}
          className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-left text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
        >
          <span className="flex items-center gap-2">
            <Building className="h-3.5 w-3.5" />
            Credit Scoring
          </span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => handleInterfaceTrigger("/supply-chain", "Help me with supplier recommendations")}
          className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-left text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
        >
          <span className="flex items-center gap-2">
            <Package className="h-3.5 w-3.5" />
            Supply Chain
          </span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-[200px] rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 py-6 px-2">
            <div className="relative mb-1">
              <div className="absolute inset-0 rounded-full blur-xl bg-emerald-300/40" />
              <div className="relative h-14 w-14 rounded-full bg-gradient-to-b from-lime-300 via-emerald-400 to-cyan-100 shadow-sm" />
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-black tracking-tight text-slate-900">{greeting}</h2>
              <p className="text-sm font-semibold text-slate-400">Can I help you with anything?</p>
              <p className="text-xs text-slate-400">Choose a prompt below or start typing your request.</p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 w-full mt-2">
              {HERO_PROMPTS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={item.onClick}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-left transition hover:border-emerald-200 hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br ${item.className} text-white flex items-center justify-center shadow-sm`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900 leading-tight">{item.title}</p>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 justify-center mt-1">
              {QUICK_ACTIONS.map(({ labelKey, icon: Icon, bg }) => (
                <button
                  key={labelKey}
                  onClick={() => handleQuickAction(t(labelKey))}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border border-white shadow-sm transition hover:-translate-y-0.5 hover:shadow"
                  style={{ background: bg, color: "var(--text-primary)" }}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t(labelKey)}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 text-emerald-600">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm"
                style={{
                  background: msg.role === "user" ? "linear-gradient(135deg, #10B981 0%, #059669 100%)" : "#FFFFFF",
                  color: msg.role === "user" ? "#fff" : "var(--text-primary)",
                  border: msg.role === "assistant" ? "1px solid #E2E8F0" : "none",
                }}
              >
                {msg.role === "assistant" ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ node, ...props }: any) => <p className="mb-2 last:mb-0" {...props} />,
                      strong: ({ node, ...props }: any) => <strong className="font-bold text-gray-900" {...props} />,
                      ul: ({ node, ...props }: any) => <ul className="list-disc pl-4 mb-2" {...props} />,
                      ol: ({ node, ...props }: any) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                      li: ({ node, ...props }: any) => <li className="mb-1" {...props} />,
                      img: ({ node, ...props }: any) => <img className="rounded-lg my-2 max-w-full shadow-sm" {...props} />,
                      h3: ({ node, ...props }: any) => <h3 className="text-sm font-bold text-gray-900 mt-3 mb-1" {...props} />,
                      h2: ({ node, ...props }: any) => <h2 className="text-base font-bold text-gray-900 mt-3 mb-1" {...props} />,
                      hr: () => <hr className="my-3 border-gray-200" />,
                      table: ({ node, ...props }: any) => (
                        <div className="overflow-x-auto my-2">
                          <table className="w-full text-xs border-collapse border border-gray-200 rounded-lg" {...props} />
                        </div>
                      ),
                      thead: ({ node, ...props }: any) => <thead className="bg-gray-100" {...props} />,
                      th: ({ node, ...props }: any) => <th className="border border-gray-200 px-2 py-1.5 text-left font-semibold text-gray-700" {...props} />,
                      td: ({ node, ...props }: any) => <td className="border border-gray-200 px-2 py-1.5 text-gray-600" {...props} />,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex items-start gap-2 justify-start">
            <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 text-emerald-600">
              <Bot className="w-4 h-4" />
            </div>
            <div
              className="rounded-2xl px-4 py-2.5 text-sm border border-slate-200 bg-white shadow-sm"
              style={{ color: "var(--text-tertiary)" }}
            >
              <span className="animate-pulse flex gap-1 items-center">
                <Bot className="w-3.5 h-3.5"/> {t("aiChat.processing")}
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="ai-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={t("aiChat.placeholder")}
          disabled={isLoading}
        />
        <button className="ai-send-btn" onClick={handleSend} disabled={isLoading}>
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

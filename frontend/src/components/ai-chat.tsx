"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, Sparkles, FileText, TrendingUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLanguage } from "@/lib/language-context";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const LOCALE_INSTRUCTIONS: Record<string, string> = {
  en: "",
  ms: "Please respond in Bahasa Melayu. ",
  id: "Please respond in Bahasa Indonesia. ",
  th: "Please respond in Thai (ภาษาไทย). ",
  vi: "Please respond in Vietnamese (Tiếng Việt). ",
  zh: "Please respond in Chinese (中文). ",
};

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { locale, t } = useLanguage();

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

  const QUICK_ACTIONS = [
    { labelKey: "aiChat.quick.credit", icon: Sparkles, bg: "var(--color-ai-mint)" },
    { labelKey: "aiChat.quick.trade", icon: FileText, bg: "var(--color-ai-lavender)" },
    { labelKey: "aiChat.quick.market", icon: TrendingUp, bg: "var(--color-primary-light)" },
  ];

  return (
    <div className="card flex flex-col" style={{ height: "100%" }}>
      <div className="flex items-center gap-3 mb-4">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: "var(--color-ai-lavender)" }}
        >
          <Bot className="h-5 w-5" style={{ color: "var(--color-ai-purple)" }} />
        </div>
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {t("aiChat.title")}
          </h3>
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            {t("aiChat.subtitle")}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-[200px]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 py-8">
            <Bot
              className="h-12 w-12 opacity-20"
              style={{ color: "var(--text-tertiary)" }}
            />
            <p
              className="text-sm text-center"
              style={{ color: "var(--text-tertiary)" }}
            >
              {t("aiChat.empty")}
            </p>
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 justify-center">
              {QUICK_ACTIONS.map(({ labelKey, icon: Icon, bg }) => (
                <button
                  key={labelKey}
                  onClick={() => handleQuickAction(t(labelKey))}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition hover:opacity-80"
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
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm"
                style={{
                  background: msg.role === "user" ? "var(--color-primary)" : "var(--bg-app)",
                  color: msg.role === "user" ? "#fff" : "var(--text-primary)",
                  border: msg.role === "assistant" ? "1px solid var(--border-color)" : "none",
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
          <div className="flex justify-start">
            <div
              className="rounded-2xl px-4 py-2.5 text-sm"
              style={{ background: "var(--bg-app)", color: "var(--text-tertiary)" }}
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

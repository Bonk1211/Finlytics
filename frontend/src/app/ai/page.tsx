"use client";

import { useState } from "react";
import {
  Send,
  Bot,
  Sparkles,
  CreditCard,
  Globe,
  TrendingUp,
  FileText,
  Languages,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const AI_CAPABILITIES = [
  {
    title: "Credit Assessment",
    description: "Evaluate your business creditworthiness using alternative data",
    icon: CreditCard,
    bg: "var(--color-success-light)",
    color: "var(--color-success)",
    prompt: "Assess my business credit score based on my recent sales data",
  },
  {
    title: "Trade Compliance",
    description: "Navigate ASEAN cross-border regulations and documentation",
    icon: Globe,
    bg: "var(--color-primary-light)",
    color: "var(--color-primary)",
    prompt: "What documents do I need to export goods from Malaysia to Singapore?",
  },
  {
    title: "Market Forecast",
    description: "Get AI-powered demand predictions and pricing suggestions",
    icon: TrendingUp,
    bg: "var(--color-warning-light)",
    color: "var(--color-warning)",
    prompt: "What is the demand forecast for electronics in ASEAN Q2 2026?",
  },
  {
    title: "Document Generation",
    description: "Auto-generate compliance documents and invoices",
    icon: FileText,
    bg: "var(--color-ai-lavender)",
    color: "var(--color-ai-purple)",
    prompt: "Generate a Certificate of Origin for my shipment to Thailand",
  },
  {
    title: "Translation",
    description: "Translate business documents across ASEAN languages",
    icon: Languages,
    bg: "var(--color-ai-mint)",
    color: "var(--color-success)",
    prompt: "Translate my product description to Bahasa Indonesia",
  },
  {
    title: "Business Insights",
    description: "Get personalized recommendations for your MSME",
    icon: Sparkles,
    bg: "var(--color-danger-light)",
    color: "var(--color-danger)",
    prompt: "Give me actionable insights to grow my business in ASEAN",
  },
];

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || isLoading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content }]);
    setIsLoading(true);

    // TODO: Connect to backend AI orchestration endpoint
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm your MSME Growth AI assistant powered by Gemini. This feature will connect to the backend AI orchestration layer via FastMCP. I can help with credit scoring, trade compliance, market analysis, document generation, and translation across ASEAN markets.",
        },
      ]);
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="flex gap-5 h-[calc(100vh-48px)]">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="mb-4">
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            AI Assistant
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Your intelligent ASEAN business companion powered by Gemini
          </p>
        </div>

        {/* Messages */}
        <div className="card flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-3xl mb-4"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--color-ai-lavender), var(--color-ai-mint))",
                  }}
                >
                  <Bot className="h-10 w-10" style={{ color: "var(--color-ai-purple)" }} />
                </div>
                <h2
                  className="text-lg font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  How can I help your business today?
                </h2>
                <p
                  className="text-sm mt-1 text-center max-w-md"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Ask me about credit scoring, trade regulations, market forecasts, or
                  anything related to growing your MSME in ASEAN.
                </p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg mr-2 flex-shrink-0 mt-1"
                      style={{ background: "var(--color-ai-lavender)" }}
                    >
                      <Bot
                        className="h-4 w-4"
                        style={{ color: "var(--color-ai-purple)" }}
                      />
                    </div>
                  )}
                  <div
                    className="max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
                    style={{
                      background:
                        msg.role === "user"
                          ? "var(--color-primary)"
                          : "var(--bg-app)",
                      color: msg.role === "user" ? "#fff" : "var(--text-primary)",
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg mr-2 flex-shrink-0"
                  style={{ background: "var(--color-ai-lavender)" }}
                >
                  <Bot
                    className="h-4 w-4"
                    style={{ color: "var(--color-ai-purple)" }}
                  />
                </div>
                <div
                  className="rounded-2xl px-4 py-3 text-sm"
                  style={{
                    background: "var(--bg-app)",
                    color: "var(--text-tertiary)",
                  }}
                >
                  <span className="animate-pulse">Thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="ai-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask AI anything about your ASEAN business..."
              disabled={isLoading}
              className="flex-1"
            />
            <button
              className="ai-send-btn"
              onClick={() => handleSend()}
              disabled={isLoading}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Capabilities Sidebar */}
      <div className="w-72 flex-shrink-0 space-y-3">
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: "var(--text-tertiary)" }}
        >
          AI Capabilities
        </p>
        {AI_CAPABILITIES.map(({ title, description, icon: Icon, bg, color, prompt }) => (
          <button
            key={title}
            onClick={() => handleSend(prompt)}
            className="card w-full text-left transition hover:translate-y-[-2px]"
            style={{ padding: "16px" }}
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl mb-3"
              style={{ background: bg }}
            >
              <Icon className="h-4 w-4" style={{ color }} />
            </div>
            <p
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {title}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
              {description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

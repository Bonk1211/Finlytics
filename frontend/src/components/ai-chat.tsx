"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, Sparkles, FileText, TrendingUp } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_ACTIONS = [
  { label: "Check my credit score", icon: Sparkles, bg: "var(--color-ai-mint)" },
  { label: "Trade compliance help", icon: FileText, bg: "var(--color-ai-lavender)" },
  { label: "Market forecast", icon: TrendingUp, bg: "var(--color-primary-light)" },
];

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      const res = await fetch("http://localhost:8000/api/chatbot/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await res.json();
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response || "Sorry, I couldn't process that right now.",
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error: Unable to connect to the backend AI service." },
      ]);
    }
    setIsLoading(false);
  };

  const handleQuickAction = (label: string) => {
    setInput(label);
  };

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
            AI Assistant
          </h3>
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            Powered by Gemini
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
              Ask me anything about your ASEAN business
            </p>
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 justify-center">
              {QUICK_ACTIONS.map(({ label, icon: Icon, bg }) => (
                <button
                  key={label}
                  onClick={() => handleQuickAction(label)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition hover:opacity-80"
                  style={{ background: bg, color: "var(--text-primary)" }}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
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
                    components={{
                      p: ({ node, ...props }: any) => <p className="mb-2 last:mb-0" {...props} />,
                      strong: ({ node, ...props }: any) => <strong className="font-bold text-gray-900" {...props} />,
                      ul: ({ node, ...props }: any) => <ul className="list-disc pl-4 mb-2" {...props} />,
                      ol: ({ node, ...props }: any) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                      li: ({ node, ...props }: any) => <li className="mb-1" {...props} />,
                      img: ({ node, ...props }: any) => <img className="rounded-lg my-2 max-w-full shadow-sm" {...props} />,
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
                <Bot className="w-3.5 h-3.5"/> Processing...
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
          placeholder="Ask AI anything..."
          disabled={isLoading}
        />
        <button className="ai-send-btn" onClick={handleSend} disabled={isLoading}>
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

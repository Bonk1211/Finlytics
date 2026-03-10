"use client";

import { useState } from "react";
import { MessageSquare, X } from "lucide-react";
import AIChat from "./ai-chat";
import clsx from "clsx";

export default function RightChatSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={clsx(
          "fixed bottom-6 right-6 z-50 p-4 rounded-full bg-green-500 text-white shadow-lg shadow-green-200 transition-all hover:scale-105 hover:bg-green-600 focus:outline-none",
          isOpen && "opacity-0 pointer-events-none translate-y-4"
        )}
      >
        <MessageSquare className="h-6 w-6" />
      </button>

      {/* Right Drawer */}
      <div
        className={clsx(
          "fixed top-0 right-0 h-full w-[400px] z-50 bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.05)] transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 pb-4">
          <h2 className="text-lg font-bold text-gray-900">AI-Finance Assist</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Chat Widget Content */}
        <div className="flex-1 overflow-hidden p-4 bg-gray-50">
          <AIChat />
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[2px] transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

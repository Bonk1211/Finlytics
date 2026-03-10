"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Globe,
  Search,
  FileText,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Package,
  Scale,
  Truck,
  Download,
  Sparkles,
  X,
  Loader2,
  Zap,
} from "lucide-react";
import { suggestHSCodes, lookupTariff } from "@/lib/api";

// ── ASEAN countries ──
const ASEAN_COUNTRIES = [
  { code: "MY", name: "Malaysia" },
  { code: "SG", name: "Singapore" },
  { code: "ID", name: "Indonesia" },
  { code: "TH", name: "Thailand" },
  { code: "VN", name: "Vietnam" },
  { code: "PH", name: "Philippines" },
  { code: "MM", name: "Myanmar" },
  { code: "KH", name: "Cambodia" },
  { code: "LA", name: "Laos" },
  { code: "BN", name: "Brunei" },
];

function getCountryName(code: string) {
  return ASEAN_COUNTRIES.find((c) => c.code === code)?.name ?? code;
}

// ── Confidence color helpers ──
function confidenceColor(c: number) {
  if (c >= 0.8) return "var(--color-success)";
  if (c >= 0.5) return "var(--color-warning)";
  return "var(--color-danger)";
}

function confidenceBg(c: number) {
  if (c >= 0.8) return "var(--color-success-light)";
  if (c >= 0.5) return "var(--color-warning-light)";
  return "var(--color-danger-light)";
}

// ── Types ──
interface HSCodeSuggestion {
  hs_code: string;
  description: string;
  confidence: number;
  ai_explanation: string;
}

interface TariffResult {
  product_category: string;
  estimated_hs_code: string;
  applicable_tariffs: string[];
  preferential_rates: string;
  required_documents: string[];
  import_restrictions: string[];
  ai_summary: string;
}

// ── Mock compliance docs ──
const MOCK_DOCS = [
  { type: "Certificate of Origin", status: "generated", route: "MY → SG", date: "Mar 10, 2026" },
  { type: "Commercial Invoice", status: "generated", route: "MY → TH", date: "Mar 8, 2026" },
  { type: "Customs Declaration", status: "draft", route: "MY → ID", date: "Mar 7, 2026" },
  { type: "Packing List", status: "generated", route: "MY → VN", date: "Mar 5, 2026" },
];

// ── Curated product suggestions for instant typeahead ──
const PRODUCT_SUGGESTIONS = [
  { label: "Bamboo basket", category: "Handicrafts" },
  { label: "Bananas", category: "Agriculture" },
  { label: "Batik fabric", category: "Textiles" },
  { label: "Black pepper", category: "Spices" },
  { label: "Canned tuna", category: "Seafood" },
  { label: "Car tires", category: "Automotive" },
  { label: "Cashew nuts", category: "Agriculture" },
  { label: "Chocolate", category: "Food" },
  { label: "Coconut oil", category: "Agriculture" },
  { label: "Coffee beans", category: "Agriculture" },
  { label: "Cotton fabric", category: "Textiles" },
  { label: "Cotton t-shirt", category: "Apparel" },
  { label: "Crude palm oil", category: "Agriculture" },
  { label: "Durian", category: "Agriculture" },
  { label: "Electric motor", category: "Electronics" },
  { label: "Frozen shrimp", category: "Seafood" },
  { label: "Ginger root", category: "Spices" },
  { label: "Gold jewelry", category: "Luxury" },
  { label: "Handwoven rattan chair", category: "Furniture" },
  { label: "Instant coffee", category: "Food" },
  { label: "Laptop computer", category: "Electronics" },
  { label: "Lipstick", category: "Beauty" },
  { label: "Mangosteen", category: "Agriculture" },
  { label: "Natural rubber sheets", category: "Materials" },
  { label: "Palm oil", category: "Agriculture" },
  { label: "Power adapter", category: "Electronics" },
  { label: "Printer", category: "Electronics" },
  { label: "Rattan furniture", category: "Furniture" },
  { label: "Rice", category: "Agriculture" },
  { label: "Shampoo", category: "Beauty" },
  { label: "Silk scarf", category: "Apparel" },
  { label: "Smartphone", category: "Electronics" },
  { label: "Solar panel", category: "Electronics" },
  { label: "Stone carvings", category: "Handicrafts" },
  { label: "Sweater", category: "Apparel" },
  { label: "Tropical timber", category: "Materials" },
  { label: "Turmeric", category: "Spices" },
  { label: "Wooden crafts", category: "Handicrafts" },
];

function categoryColor(category: string): string {
  const colors: Record<string, string> = {
    Agriculture: "#16a34a", Seafood: "#0ea5e9", Food: "#d97706",
    Textiles: "#8b5cf6", Apparel: "#a855f7", Electronics: "#3b82f6",
    Furniture: "#a16207", Handicrafts: "#b45309", Automotive: "#6b7280",
    Materials: "#64748b", Spices: "#ea580c", Beauty: "#ec4899", Luxury: "#ca8a04",
  };
  return colors[category] || "#9ca3af";
}

function highlightMatch(text: string, query: string) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span style={{ fontWeight: 700, color: "var(--color-primary)" }}>
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function TradePage() {
  const [origin, setOrigin] = useState("MY");
  const [destination, setDestination] = useState("SG");
  const [activeTab, setActiveTab] = useState<"lookup" | "documents" | "query">("lookup");

  // ── Smart HS Code Matcher state ──
  const [hsQuery, setHsQuery] = useState("");
  const [hsSuggestions, setHsSuggestions] = useState<HSCodeSuggestion[]>([]);
  const [hsLoading, setHsLoading] = useState(false);
  const [selectedHS, setSelectedHS] = useState<HSCodeSuggestion | null>(null);
  const [hsError, setHsError] = useState("");

  // ── Tariff lookup state ──
  const [tariffResult, setTariffResult] = useState<TariffResult | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  // ── Trade AI Q&A state ──
  const [tradeQuestion, setTradeQuestion] = useState("");
  const [tradeAnswer, setTradeAnswer] = useState("");
  const [tradeLoading, setTradeLoading] = useState(false);

  // ── Instant typeahead state ──
  const [typeaheadDismissed, setTypeaheadDismissed] = useState(false);
  const [typeaheadIndex, setTypeaheadIndex] = useState(-1);
  const [inputFocused, setInputFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredProducts = useMemo(() => {
    if (hsQuery.length < 1) return [];
    const q = hsQuery.toLowerCase();
    return PRODUCT_SUGGESTIONS
      .filter((p) => p.label.toLowerCase().includes(q))
      .slice(0, 8);
  }, [hsQuery]);

  const showTypeahead = inputFocused && filteredProducts.length > 0 && !typeaheadDismissed && !selectedHS;

  const handleTypeaheadSelect = (label: string) => {
    setHsQuery(label);
    setTypeaheadDismissed(true);
    setTypeaheadIndex(-1);
  };

  const handleTypeaheadKeyDown = (e: React.KeyboardEvent) => {
    if (!showTypeahead) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setTypeaheadIndex((i) => Math.min(i + 1, filteredProducts.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setTypeaheadIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && typeaheadIndex >= 0) {
      e.preventDefault();
      handleTypeaheadSelect(filteredProducts[typeaheadIndex].label);
    } else if (e.key === "Escape") {
      setTypeaheadDismissed(true);
    }
  };

  // ── Debounced HS Code search ──
  useEffect(() => {
    if (hsQuery.length < 2) {
      setHsSuggestions([]);
      setHsError("");
      return;
    }

    setHsLoading(true);
    setHsError("");
    const timer = setTimeout(async () => {
      try {
        const result = await suggestHSCodes({ query: hsQuery });
        setHsSuggestions(result.suggestions);
        if (result.suggestions.length === 0 && hsQuery.length >= 3) {
          setHsError("No matching HS codes found. Try a different description.");
        }
      } catch {
        setHsError("Search failed. Please try again.");
        setHsSuggestions([]);
      } finally {
        setHsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [hsQuery]);

  const handleSelectHS = useCallback((suggestion: HSCodeSuggestion) => {
    setSelectedHS(suggestion);
    setHsSuggestions([]);
    setHsQuery("");
  }, []);

  const handleClearHS = useCallback(() => {
    setSelectedHS(null);
    setTariffResult(null);
  }, []);

  const handleLookup = useCallback(async () => {
    if (!selectedHS) return;
    setLookupLoading(true);
    try {
      const result = await lookupTariff({
        product_name: selectedHS.description,
        hs_code: selectedHS.hs_code,
        source_country: getCountryName(origin),
        destination_country: getCountryName(destination),
      });
      setTariffResult(result);
    } catch {
      setTariffResult(null);
    } finally {
      setLookupLoading(false);
    }
  }, [selectedHS, origin, destination]);

  const handleAskTrade = useCallback(async (question: string) => {
    setTradeQuestion(question);
    setTradeLoading(true);
    try {
      const { queryTradeRegulations } = await import("@/lib/api");
      const result = await queryTradeRegulations({ question });
      setTradeAnswer(result.answer);
    } catch {
      setTradeAnswer("Sorry, I couldn't process your question. Please try again.");
    } finally {
      setTradeLoading(false);
    }
  }, []);

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Cross-Border Trade Navigator
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          AI-powered compliance officer for ASEAN import/export
        </p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2 mb-6">
        {(
          [
            { key: "lookup", label: "Tariff Lookup", icon: Search },
            { key: "documents", label: "Compliance Documents", icon: FileText },
            { key: "query", label: "Ask Trade AI", icon: Globe },
          ] as const
        ).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={activeTab === key ? "btn-primary" : "btn-secondary"}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tariff Lookup Tab ── */}
      {activeTab === "lookup" && (
        <div className="space-y-5">
          {/* ── Smart HS Code Matcher (Hero) ── */}
          <div className="card" style={{ padding: "28px" }}>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-5 w-5" style={{ color: "var(--color-ai-purple)" }} />
              <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                Smart HS Code Finder
              </h2>
              <span className="badge badge-ai" style={{ fontSize: 11 }}>AI-Powered</span>
            </div>
            <p className="text-xs mb-5" style={{ color: "var(--text-tertiary)" }}>
              Describe your product in everyday language — AI finds the correct customs code
            </p>

            {/* Search Input + Instant Typeahead */}
            <div className="hs-search-wrapper mb-4" ref={wrapperRef}>
              <Search className="hs-search-icon h-5 w-5" />
              <input
                className={`hs-search-input ${hsLoading ? "hs-loading-pulse" : ""}`}
                value={hsQuery}
                onChange={(e) => {
                  setHsQuery(e.target.value);
                  setTypeaheadDismissed(false);
                  setTypeaheadIndex(-1);
                  if (selectedHS) setSelectedHS(null);
                }}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setTimeout(() => setInputFocused(false), 200)}
                onKeyDown={handleTypeaheadKeyDown}
                placeholder='e.g. "Handwoven rattan chair" or "Organic coffee beans"'
              />
              {hsLoading && (
                <div style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)" }}>
                  <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--color-primary)" }} />
                </div>
              )}

              {/* Instant Typeahead Dropdown */}
              {showTypeahead && (
                <div className="typeahead-dropdown">
                  {filteredProducts.map((item, i) => (
                    <div
                      key={item.label}
                      className={`typeahead-item ${i === typeaheadIndex ? "active" : ""}`}
                      onMouseEnter={() => setTypeaheadIndex(i)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleTypeaheadSelect(item.label);
                      }}
                    >
                      <Search className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "var(--text-tertiary)" }} />
                      <span className="flex-1 text-sm" style={{ color: "var(--text-primary)" }}>
                        {highlightMatch(item.label, hsQuery)}
                      </span>
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-md"
                        style={{
                          color: categoryColor(item.category),
                          background: `${categoryColor(item.category)}12`,
                        }}
                      >
                        {item.category}
                      </span>
                    </div>
                  ))}
                  <div className="typeahead-hint">
                    <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
                    <span><kbd>↵</kbd> select</span>
                    <span><kbd>esc</kbd> dismiss</span>
                  </div>
                </div>
              )}
            </div>

            {/* Selected HS Code Chip */}
            {selectedHS && (
              <div className="mb-4">
                <div className="hs-selected-chip">
                  <CheckCircle className="h-4 w-4" />
                  <span className="hs-code-badge" style={{ background: confidenceBg(selectedHS.confidence), color: confidenceColor(selectedHS.confidence), padding: "2px 8px", borderRadius: 6 }}>
                    HS {selectedHS.hs_code}
                  </span>
                  <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{selectedHS.description}</span>
                  <button
                    onClick={handleClearHS}
                    style={{ marginLeft: 4, padding: 2, borderRadius: "50%", background: "transparent", border: "none", cursor: "pointer", display: "flex" }}
                  >
                    <X className="h-4 w-4" style={{ color: "var(--text-tertiary)" }} />
                  </button>
                </div>
              </div>
            )}

            {/* Loading Shimmer */}
            {hsLoading && hsSuggestions.length === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="hs-shimmer" style={{ height: 120 }} />
                ))}
              </div>
            )}

            {/* Suggestion Cards */}
            {!hsLoading && hsSuggestions.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {hsSuggestions.map((s) => (
                  <div
                    key={s.hs_code}
                    className={`hs-suggestion-card ${selectedHS?.hs_code === s.hs_code ? "selected" : ""}`}
                    onClick={() => handleSelectHS(s)}
                  >
                    {/* Header: HS Code + Confidence */}
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="hs-code-badge"
                        style={{
                          background: confidenceBg(s.confidence),
                          color: confidenceColor(s.confidence),
                        }}
                      >
                        HS {s.hs_code}
                      </span>
                      <span className="text-xs font-semibold" style={{ color: confidenceColor(s.confidence) }}>
                        {Math.round(s.confidence * 100)}%
                      </span>
                    </div>

                    {/* Confidence Bar */}
                    <div className="confidence-bar mb-3">
                      <div
                        className="confidence-bar-fill"
                        style={{
                          width: `${Math.round(s.confidence * 100)}%`,
                          background: confidenceColor(s.confidence),
                        }}
                      />
                    </div>

                    {/* Description */}
                    <p className="text-sm font-medium mb-2" style={{ color: "var(--text-primary)", lineHeight: 1.4 }}>
                      {s.description}
                    </p>

                    {/* AI Explanation */}
                    <div
                      className="flex items-start gap-1.5 mt-auto"
                      style={{ paddingTop: 8, borderTop: "1px solid #F0F1F3" }}
                    >
                      <Zap className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" style={{ color: "var(--color-ai-purple)" }} />
                      <p className="text-xs" style={{ color: "var(--text-secondary)", lineHeight: 1.5, fontStyle: "italic" }}>
                        {s.ai_explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {hsError && !hsLoading && (
              <p className="text-xs mt-2" style={{ color: "var(--text-tertiary)" }}>{hsError}</p>
            )}

            {/* Empty state hint */}
            {!hsLoading && hsSuggestions.length === 0 && !selectedHS && !hsError && hsQuery.length === 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>Try:</span>
                {["Rattan chair", "Palm oil", "Cotton t-shirt", "Laptop computer", "Gold jewelry"].map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setHsQuery(ex)}
                    className="text-xs px-3 py-1.5 rounded-lg transition"
                    style={{
                      background: "var(--bg-app)",
                      color: "var(--text-secondary)",
                      border: "1px solid #E5E7EB",
                      cursor: "pointer",
                    }}
                  >
                    {ex}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Trade Route + Results Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Route Selection Card */}
            <div className="card lg:col-span-1">
              <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                Trade Route
              </h3>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1">
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>
                    Origin
                  </label>
                  <select
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm"
                    style={{ background: "var(--bg-app)", border: "none", color: "var(--text-primary)" }}
                  >
                    {ASEAN_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <ArrowRight className="h-4 w-4 mt-5 flex-shrink-0" style={{ color: "var(--text-tertiary)" }} />
                <div className="flex-1">
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>
                    Destination
                  </label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm"
                    style={{ background: "var(--bg-app)", border: "none", color: "var(--text-primary)" }}
                  >
                    {ASEAN_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selected product summary */}
              {selectedHS && (
                <div className="rounded-xl p-3 mb-4" style={{ background: "var(--bg-app)" }}>
                  <p className="text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Selected Product</p>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    HS {selectedHS.hs_code}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                    {selectedHS.description}
                  </p>
                </div>
              )}

              <button
                className="btn-primary w-full justify-center"
                onClick={handleLookup}
                disabled={!selectedHS || lookupLoading}
                style={{ opacity: !selectedHS ? 0.5 : 1 }}
              >
                {lookupLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                {lookupLoading ? "Looking up..." : "Lookup Tariff"}
              </button>

              {!selectedHS && (
                <p className="text-xs text-center mt-3" style={{ color: "var(--text-tertiary)" }}>
                  Search for an HS code above to enable lookup
                </p>
              )}
            </div>

            {/* Results Area */}
            <div className="lg:col-span-2 space-y-5">
              {tariffResult ? (
                <>
                  {/* Tariff Result Card */}
                  <div className="card">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{ background: "var(--color-success-light)" }}
                      >
                        <CheckCircle className="h-5 w-5" style={{ color: "var(--color-success)" }} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                          HS {tariffResult.estimated_hs_code} — {tariffResult.product_category}
                        </h3>
                        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                          {getCountryName(origin)} → {getCountryName(destination)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="rounded-xl p-4" style={{ background: "var(--bg-app)" }}>
                        <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Tariffs</p>
                        <p className="text-lg font-bold mt-1" style={{ color: "var(--color-primary)" }}>
                          {tariffResult.applicable_tariffs[0] || "N/A"}
                        </p>
                      </div>
                      <div className="rounded-xl p-4" style={{ background: "var(--bg-app)" }}>
                        <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Preferential Rate</p>
                        <p className="text-sm font-bold mt-1" style={{ color: "var(--color-success)" }}>
                          {tariffResult.preferential_rates || "N/A"}
                        </p>
                      </div>
                      <div className="rounded-xl p-4" style={{ background: "var(--bg-app)" }}>
                        <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Restrictions</p>
                        <p className="text-sm font-bold mt-1" style={{ color: tariffResult.import_restrictions.length ? "var(--color-danger)" : "var(--color-success)" }}>
                          {tariffResult.import_restrictions.length
                            ? `${tariffResult.import_restrictions.length} found`
                            : "None"}
                        </p>
                      </div>
                    </div>

                    {/* AI Summary */}
                    {tariffResult.ai_summary && (
                      <div
                        className="rounded-xl p-4 flex items-start gap-3"
                        style={{ background: "var(--color-ai-mint)" }}
                      >
                        <Sparkles className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: "var(--color-ai-purple)" }} />
                        <p className="text-sm" style={{ color: "var(--text-primary)", lineHeight: 1.6 }}>
                          {tariffResult.ai_summary}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Required Documents */}
                  {tariffResult.required_documents.length > 0 && (
                    <div className="card">
                      <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                        Required Documents
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {tariffResult.required_documents.map((doc, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 rounded-xl p-3"
                            style={{ background: "var(--bg-app)" }}
                          >
                            <FileText className="h-4 w-4" style={{ color: "var(--color-primary)" }} />
                            <span className="text-sm flex-1">{doc}</span>
                            <button className="btn-secondary" style={{ padding: "4px 12px", fontSize: "12px" }}>
                              Generate
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Import Restrictions */}
                  {tariffResult.import_restrictions.length > 0 && (
                    <div className="card">
                      <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                        Import Restrictions
                      </h3>
                      {tariffResult.import_restrictions.map((r, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 rounded-xl p-3 mb-2"
                          style={{ background: "var(--color-danger-light)" }}
                        >
                          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: "var(--color-danger)" }} />
                          <span className="text-sm" style={{ color: "var(--text-primary)" }}>{r}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="card flex flex-col items-center justify-center py-16">
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-2xl mb-4"
                    style={{ background: "var(--bg-app)" }}
                  >
                    <Globe className="h-8 w-8" style={{ color: "var(--text-tertiary)" }} />
                  </div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                    {selectedHS
                      ? "Select a trade route and click Lookup Tariff"
                      : "Search for your product above to get started"}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                    AI will find duty rates, required documents, and preferential trade agreements
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Compliance Documents Tab ── */}
      {activeTab === "documents" && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Generated Documents
            </h3>
            <button className="btn-primary">
              <FileText className="h-4 w-4" /> New Document
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Document</th>
                <th>Trade Route</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_DOCS.map((doc, i) => (
                <tr key={i}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg"
                        style={{ background: "var(--color-primary-light)" }}
                      >
                        <FileText className="h-4 w-4" style={{ color: "var(--color-primary)" }} />
                      </div>
                      <span className="font-medium">{doc.type}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Truck className="h-3.5 w-3.5" style={{ color: "var(--text-tertiary)" }} />
                      <span style={{ color: "var(--text-secondary)" }}>{doc.route}</span>
                    </div>
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>{doc.date}</td>
                  <td>
                    {doc.status === "generated" ? (
                      <span className="badge badge-success">
                        <CheckCircle className="h-3 w-3" /> Generated
                      </span>
                    ) : (
                      <span className="badge badge-warning">
                        <AlertTriangle className="h-3 w-3" /> Draft
                      </span>
                    )}
                  </td>
                  <td>
                    <button className="btn-secondary" style={{ padding: "4px 12px", fontSize: "12px" }}>
                      <Download className="h-3 w-3" /> Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Ask Trade AI Tab ── */}
      {activeTab === "query" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 card">
            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
              Trade Regulation Q&A
            </h3>
            <p className="text-xs mb-4" style={{ color: "var(--text-tertiary)" }}>
              Ask questions about ASEAN trade regulations, customs procedures, and compliance requirements.
            </p>

            <div className="ai-input mb-4">
              <input
                value={tradeQuestion}
                onChange={(e) => setTradeQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && tradeQuestion.trim()) handleAskTrade(tradeQuestion.trim());
                }}
                placeholder="e.g., What documents do I need to export electronics from Malaysia to Thailand?"
              />
              <button
                className="ai-send-btn"
                onClick={() => { if (tradeQuestion.trim()) handleAskTrade(tradeQuestion.trim()); }}
                disabled={tradeLoading}
              >
                {tradeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </button>
            </div>

            {/* AI Answer */}
            {tradeAnswer && (
              <div
                className="rounded-xl p-5 mb-4"
                style={{ background: "var(--color-ai-mint)", animation: "hs-fade-in 0.3s ease forwards" }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4" style={{ color: "var(--color-ai-purple)" }} />
                  <span className="text-xs font-semibold" style={{ color: "var(--color-ai-purple)" }}>AI Response</span>
                </div>
                <p className="text-sm" style={{ color: "var(--text-primary)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                  {tradeAnswer}
                </p>
              </div>
            )}

            {/* Quick Questions */}
            {!tradeAnswer && (
              <div className="space-y-2">
                <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                  Suggested questions:
                </p>
                {[
                  "What are the ATIGA preferential rates for agricultural products?",
                  "How do I get a Certificate of Origin (Form D)?",
                  "What goods are restricted for export to Vietnam?",
                  "What is the customs clearance process in Singapore?",
                ].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleAskTrade(q)}
                    className="block w-full text-left px-4 py-3 rounded-xl text-sm transition"
                    style={{ background: "var(--bg-app)", color: "var(--text-secondary)", border: "none", cursor: "pointer" }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-5">
            <div className="card text-center">
              <Package className="h-8 w-8 mx-auto mb-2" style={{ color: "var(--color-primary)" }} />
              <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>10</p>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>ASEAN Countries Covered</p>
            </div>
            <div className="card text-center">
              <Scale className="h-8 w-8 mx-auto mb-2" style={{ color: "var(--color-ai-purple)" }} />
              <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>50+</p>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Trade Agreements Indexed</p>
            </div>
            <div className="card text-center">
              <FileText className="h-8 w-8 mx-auto mb-2" style={{ color: "var(--color-success)" }} />
              <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>5</p>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Document Types</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

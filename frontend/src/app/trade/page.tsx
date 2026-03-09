"use client";

import { useState } from "react";
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
} from "lucide-react";

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

// ── Mock tariff results ──
const MOCK_TARIFF_RESULT = {
  hsCode: "8471.30",
  product: "Portable digital automatic data processing machines",
  dutyRate: "0%",
  preferentialRate: "0%",
  agreement: "ATIGA (ASEAN Trade in Goods Agreement)",
  restrictions: [],
  documents: [
    "Certificate of Origin (Form D)",
    "Commercial Invoice",
    "Packing List",
    "Bill of Lading",
  ],
};

// ── Mock compliance docs ──
const MOCK_DOCS = [
  {
    type: "Certificate of Origin",
    status: "generated",
    route: "MY → SG",
    date: "Mar 10, 2026",
  },
  {
    type: "Commercial Invoice",
    status: "generated",
    route: "MY → TH",
    date: "Mar 8, 2026",
  },
  {
    type: "Customs Declaration",
    status: "draft",
    route: "MY → ID",
    date: "Mar 7, 2026",
  },
  {
    type: "Packing List",
    status: "generated",
    route: "MY → VN",
    date: "Mar 5, 2026",
  },
];

export default function TradePage() {
  const [origin, setOrigin] = useState("MY");
  const [destination, setDestination] = useState("SG");
  const [productDesc, setProductDesc] = useState("");
  const [hsCode, setHsCode] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [activeTab, setActiveTab] = useState<"lookup" | "documents" | "query">("lookup");

  const handleLookup = () => {
    // TODO: call lookupTariff API
    setShowResult(true);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Cross-Border Trade Navigator
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Digital compliance officer for ASEAN import/export processes
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Search Form */}
          <div className="card lg:col-span-1">
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Trade Route
            </h3>

            {/* Origin → Destination */}
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

            {/* Product */}
            <div className="mb-4">
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>
                Product Description
              </label>
              <input
                value={productDesc}
                onChange={(e) => setProductDesc(e.target.value)}
                placeholder="e.g., Laptop computers"
                className="w-full px-3 py-2.5 rounded-xl text-sm"
                style={{ background: "var(--bg-app)", border: "none", color: "var(--text-primary)" }}
              />
            </div>

            {/* HS Code */}
            <div className="mb-5">
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>
                HS Code (optional)
              </label>
              <input
                value={hsCode}
                onChange={(e) => setHsCode(e.target.value)}
                placeholder="e.g., 8471.30"
                className="w-full px-3 py-2.5 rounded-xl text-sm"
                style={{ background: "var(--bg-app)", border: "none", color: "var(--text-primary)" }}
              />
            </div>

            <button className="btn-primary w-full justify-center" onClick={handleLookup}>
              <Search className="h-4 w-4" /> Lookup Tariff
            </button>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-5">
            {showResult ? (
              <>
                {/* Tariff Result Card */}
                <div className="card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "var(--color-success-light)" }}>
                      <CheckCircle className="h-5 w-5" style={{ color: "var(--color-success)" }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        HS {MOCK_TARIFF_RESULT.hsCode} — {MOCK_TARIFF_RESULT.product}
                      </h3>
                      <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                        {MOCK_TARIFF_RESULT.agreement}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-xl p-4" style={{ background: "var(--bg-app)" }}>
                      <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>MFN Duty Rate</p>
                      <p className="text-xl font-bold mt-1" style={{ color: "var(--color-success)" }}>
                        {MOCK_TARIFF_RESULT.dutyRate}
                      </p>
                    </div>
                    <div className="rounded-xl p-4" style={{ background: "var(--bg-app)" }}>
                      <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Preferential Rate</p>
                      <p className="text-xl font-bold mt-1" style={{ color: "var(--color-primary)" }}>
                        {MOCK_TARIFF_RESULT.preferentialRate}
                      </p>
                    </div>
                    <div className="rounded-xl p-4" style={{ background: "var(--bg-app)" }}>
                      <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Restrictions</p>
                      <p className="text-xl font-bold mt-1" style={{ color: "var(--color-success)" }}>
                        None
                      </p>
                    </div>
                  </div>
                </div>

                {/* Required Documents */}
                <div className="card">
                  <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                    Required Documents
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {MOCK_TARIFF_RESULT.documents.map((doc, i) => (
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
              </>
            ) : (
              <div className="card flex flex-col items-center justify-center py-16">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl mb-4" style={{ background: "var(--bg-app)" }}>
                  <Globe className="h-8 w-8" style={{ color: "var(--text-tertiary)" }} />
                </div>
                <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  Enter a product and trade route to look up tariffs
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                  AI will find HS codes, duty rates, and required documents
                </p>
              </div>
            )}
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
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "var(--color-primary-light)" }}>
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
              <input placeholder="e.g., What documents do I need to export electronics from Malaysia to Thailand?" />
              <button className="ai-send-btn">
                <Search className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Questions */}
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
                  className="block w-full text-left px-4 py-3 rounded-xl text-sm transition"
                  style={{ background: "var(--bg-app)", color: "var(--text-secondary)" }}
                >
                  {q}
                </button>
              ))}
            </div>
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

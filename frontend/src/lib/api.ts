const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`API Error ${res.status}: ${error}`);
  }
  return res.json();
}

// ── Health ──
export const checkHealth = () => request<{ status: string }>("/health");

// ── F01: Credit Scoring ──
export const scoreCredit = (data: {
  business_name: string;
  country: string;
  monthly_revenue: number;
  monthly_expenses: number;
  pos_transactions: number;
  mobile_payment_volume: number;
  on_time_payments: number;
  late_payments: number;
  years_in_business: number;
}) => request<Record<string, unknown>>("/credit/score", { method: "POST", body: JSON.stringify(data) });

// ── F02: Cross-Border Trade Navigator ──
export const queryTradeRegulations = (data: {
  query: string;
  origin_country?: string;
  destination_country?: string;
}) => request<Record<string, unknown>>("/trade-ai/query", { method: "POST", body: JSON.stringify(data) });

export const generateComplianceDoc = (data: {
  document_type: string;
  origin_country: string;
  destination_country: string;
  product_description: string;
  hs_code?: string;
}) =>
  request<Record<string, unknown>>("/trade-ai/generate-document", { method: "POST", body: JSON.stringify(data) });

export const lookupTariff = (data: {
  product_description: string;
  origin_country: string;
  destination_country: string;
  hs_code?: string;
}) => request<Record<string, unknown>>("/trade-ai/tariff-lookup", { method: "POST", body: JSON.stringify(data) });

// ── F03: Predictive Market Analysis ──
export const getMarketInsights = (params?: { region?: string; product?: string }) => {
  const qs = new URLSearchParams();
  if (params?.region) qs.set("region", params.region);
  if (params?.product) qs.set("product", params.product);
  const query = qs.toString();
  return request<Record<string, unknown>>(`/market/insights${query ? `?${query}` : ""}`);
};

export const analyzeMarket = (data: {
  business_type: string;
  current_markets: string[];
  target_markets: string[];
  products: string[];
}) => request<Record<string, unknown>>("/market/analyze", { method: "POST", body: JSON.stringify(data) });

export const getPricingRecommendation = (data: {
  product_name: string;
  current_price: number;
  target_market: string;
  cost_per_unit: number;
}) => request<Record<string, unknown>>("/market/pricing", { method: "POST", body: JSON.stringify(data) });

// ── Dashboard ──
export const getDashboardSummary = (metrics: {
  business_name: string;
  monthly_revenue: number;
  monthly_expenses: number;
  inventory_value: number;
  outstanding_receivables: number;
  top_products: string[];
  target_markets: string[];
}) =>
  request<Record<string, unknown>>("/dashboard/summary", { method: "POST", body: JSON.stringify(metrics) });

// ── Translation ──
export const translateText = (data: {
  text: string;
  source_language: string;
  target_language: string;
}) => request<Record<string, unknown>>("/translate", { method: "POST", body: JSON.stringify(data) });

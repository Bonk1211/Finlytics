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
// Matches backend CreditScoreRequest schema exactly
export interface CreditScoreInput {
  business_name: string;
  monthly_revenue: number;
  years_in_business: number;
  transaction_count: number;
  digital_transaction_ratio: number; // 0-1
  mobile_payment_volume: number;
  inventory_turnover: number;
  supplier_count: number;
  supplier_reliability_score: number; // 0-1
  customer_rating: number; // 0-5
  payment_history_score: number; // 0-1
}

export interface CreditScoreResult {
  business_name: string;
  credit_score: number;
  risk_probability: number;
  risk_category: string;
  loan_recommendation: string;
  max_loan_amount: number;
  suggested_interest_rate: string;
  factors: string[];
}

export const scoreCredit = (data: CreditScoreInput) =>
  request<CreditScoreResult>("/credit/score", {
    method: "POST",
    body: JSON.stringify(data),
  });

// ── F02: Cross-Border Trade Navigator ──
// Matches backend QueryRequest schema
export const queryTradeRegulations = (data: {
  question: string;
  context?: string;
  user_id?: string;
}) =>
  request<{ answer: string; sources: Array<{ title: string; content: string; relevance_score: number }>; confidence: number }>(
    "/trade-ai/query",
    { method: "POST", body: JSON.stringify(data) }
  );

// Matches backend ComplianceDocRequest schema
export const generateComplianceDoc = (data: {
  document_type: string;
  transaction_details: Record<string, string>;
  source_country: string;
  destination_country: string;
}) =>
  request<{ document_title: string; document_content: string; missing_information: string[]; disclaimer: string }>(
    "/trade-ai/generate-document",
    { method: "POST", body: JSON.stringify(data) }
  );

// Matches backend HSCodeSuggestRequest schema — Smart HS Code Matcher
export const suggestHSCodes = (data: { query: string }) =>
  request<{
    suggestions: Array<{
      hs_code: string;
      description: string;
      confidence: number;
      ai_explanation: string;
    }>;
    query: string;
  }>("/trade-ai/suggest-hs-codes", { method: "POST", body: JSON.stringify(data) });

// Matches backend TariffLookupRequest schema
export const lookupTariff = (data: {
  product_name: string;
  hs_code?: string;
  source_country: string;
  destination_country: string;
}) =>
  request<{
    product_category: string;
    estimated_hs_code: string;
    applicable_tariffs: string[];
    preferential_rates: string;
    required_documents: string[];
    import_restrictions: string[];
    ai_summary: string;
  }>("/trade-ai/tariff-lookup", { method: "POST", body: JSON.stringify(data) });

// ── F03: Predictive Market Analysis ──
// Matches backend MarketInsightResponse
export const getMarketInsights = (params?: { region?: string; product?: string }) => {
  const qs = new URLSearchParams();
  if (params?.region) qs.set("region", params.region);
  if (params?.product) qs.set("product", params.product);
  const query = qs.toString();
  return request<{
    insights: Array<{
      product: string;
      region: string;
      demand_score: number;
      growth_prediction: number;
      competition_level: string;
      seasonal_trend: string;
    }>;
    analysis_date: string;
  }>(`/market/insights${query ? `?${query}` : ""}`);
};

// Matches backend MarketAnalysisRequest schema
export const analyzeMarket = (data: {
  business_name: string;
  products: string[];
  current_regions?: string[];
  monthly_sales?: number;
  target_regions?: string[];
  goals?: string;
}) =>
  request<{
    business_name: string;
    opportunities: Array<{
      product: string;
      target_region: string;
      opportunity_score: number;
      estimated_demand: string;
      entry_strategy: string;
      risks: string[];
      seasonal_notes: string;
    }>;
    overall_strategy: string;
    economic_signals: string[];
  }>("/market/analyze", { method: "POST", body: JSON.stringify(data) });

// Matches backend PricingRequest schema
export const getPricingRecommendation = (data: {
  product_name: string;
  current_price: number;
  unit_cost: number;
  target_region?: string;
  competitor_prices?: number[];
  monthly_volume?: number;
}) =>
  request<{
    product_name: string;
    recommendation: {
      recommended_price: number;
      price_range_low: number;
      price_range_high: number;
      margin_percentage: number;
      strategy: string;
      reasoning: string;
      seasonal_adjustments: string[];
    };
    market_position: string;
    ai_summary: string;
  }>("/market/pricing", { method: "POST", body: JSON.stringify(data) });

// ── Dashboard ──
// Matches backend BusinessMetrics schema
export const getDashboardSummary = (metrics: {
  business_name: string;
  monthly_revenue: number;
  monthly_expenses?: number;
  transaction_count?: number;
  product_count?: number;
  customer_count?: number;
  top_products?: string[];
  operating_regions?: string[];
  years_in_business?: number;
  credit_score?: number | null;
  inventory_health?: string;
}) =>
  request<{
    business_name: string;
    revenue_summary: string;
    profit_margin: string;
    loan_eligibility: string;
    market_opportunities: string[];
    kpis: Array<{ name: string; value: string; trend: string; description: string }>;
    action_items: string[];
    ai_summary: string;
  }>("/dashboard/summary", { method: "POST", body: JSON.stringify(metrics) });

// ── Translation ──
// Matches backend TranslateRequest schema
export const translateText = (data: {
  text: string;
  source_language?: string | null;
  target_language: string;
}) =>
  request<{
    translated_text: string;
    source_language: string;
    target_language: string;
    confidence: number;
  }>("/translate", { method: "POST", body: JSON.stringify(data) });

// ── Document Analysis ──
export const analyzeDocument = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return request<{
    filename: string;
    extracted_fields: Array<{ field_name: string; value: string; confidence: number }>;
    raw_text: string;
    document_type: string;
  }>("/documents/analyze", {
    method: "POST",
    headers: {}, // Let browser set Content-Type with boundary
    body: formData,
  });
};

// ── Inventory Prediction ──
export const predictDemand = (data: {
  product_name: string;
  sales_history: Array<{ date: string; quantity: number; price?: number; category?: string; region?: string }>;
  forecast_days?: number;
}) =>
  request<{
    product_name: string;
    forecast: Array<{ date: string; predicted_quantity: number; lower_bound: number; upper_bound: number }>;
    model_used: string;
  }>("/inventory/predict", { method: "POST", body: JSON.stringify(data) });

// ── Supply Chain ──
export const checkInventory = (data: {
  business_name: string;
  inventory: Array<{
    product_name: string;
    sku?: string;
    current_quantity: number;
    unit?: string;
    reorder_point: number;
    unit_cost?: number;
    supplier_name?: string;
    category?: string;
  }>;
  average_daily_sales?: Record<string, number>;
}) =>
  request<{
    business_name: string;
    total_items: number;
    items_below_reorder: number;
    reorder_suggestions: Array<{
      product_name: string;
      current_quantity: number;
      reorder_point: number;
      suggested_order_quantity: number;
      urgency: string;
      estimated_days_until_stockout: number;
      reason: string;
    }>;
    overall_health: string;
    ai_summary: string;
  }>("/supply-chain/check-inventory", { method: "POST", body: JSON.stringify(data) });

export const recommendSuppliers = (data: {
  product_name: string;
  required_quantity: number;
  target_region?: string;
  max_lead_time_days?: number;
  existing_suppliers?: Array<{
    name: string;
    region?: string;
    products?: string[];
    lead_time_days?: number;
    unit_cost?: number;
    reliability_score?: number;
    minimum_order?: number;
  }>;
}) =>
  request<{
    product_name: string;
    recommendations: Array<{
      supplier_name: string;
      score: number;
      strengths: string[];
      weaknesses: string[];
      recommendation: string;
    }>;
    ai_summary: string;
  }>("/supply-chain/recommend-suppliers", { method: "POST", body: JSON.stringify(data) });
// ── Chatbot ──
export interface ToolUsage {
  tool_name: string;
  agent: string;
  input_summary: string;
  output_summary: string;
}

export const sendMessageToChatbot = (message: string, user_id: string = "default_user") =>
  request<{ response: string; tools_used: ToolUsage[] }>("/chatbot/message", {
    method: "POST",
    body: JSON.stringify({ message, user_id }),
  });

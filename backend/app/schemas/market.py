from pydantic import BaseModel, Field


class MarketProduct(BaseModel):
    """A product with market data."""
    product: str
    region: str
    demand_score: float = Field(ge=0, le=1)
    growth_prediction: float  # percentage
    competition_level: str  # low, medium, high
    seasonal_trend: str = ""  # e.g. "peaks in Q4", "stable year-round"


class MarketInsightResponse(BaseModel):
    """Response from market intelligence."""
    insights: list[MarketProduct]
    analysis_date: str
    methodology: str = "gemini_market_analysis"


# --- Market Analysis (deep analysis with user data) ---

class MarketAnalysisRequest(BaseModel):
    """Request for deep market analysis with user's business data."""
    business_name: str
    products: list[str] = Field(..., min_length=1)
    current_regions: list[str] = []
    monthly_sales: float = Field(ge=0, default=0)
    target_regions: list[str] = []
    goals: str = ""


class MarketOpportunity(BaseModel):
    """A market opportunity identified by AI."""
    product: str
    target_region: str
    opportunity_score: float = Field(ge=0, le=1)
    estimated_demand: str
    entry_strategy: str
    risks: list[str] = []
    seasonal_notes: str = ""


class MarketAnalysisResponse(BaseModel):
    """Response from deep market analysis."""
    business_name: str
    opportunities: list[MarketOpportunity]
    overall_strategy: str
    economic_signals: list[str] = []


# --- Pricing Recommendations ---

class PricingRequest(BaseModel):
    """Request for pricing recommendations."""
    product_name: str
    current_price: float = Field(gt=0)
    unit_cost: float = Field(ge=0)
    target_region: str = ""
    competitor_prices: list[float] = []
    monthly_volume: float = Field(ge=0, default=0)


class PricingRecommendation(BaseModel):
    """AI-generated pricing recommendation."""
    recommended_price: float
    price_range_low: float
    price_range_high: float
    margin_percentage: float
    strategy: str
    reasoning: str
    seasonal_adjustments: list[str] = []


class PricingResponse(BaseModel):
    """Response from pricing analysis."""
    product_name: str
    recommendation: PricingRecommendation
    market_position: str  # budget, mid-range, premium
    ai_summary: str

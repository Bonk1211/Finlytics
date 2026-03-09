from pydantic import BaseModel, Field


class MarketProduct(BaseModel):
    """A product with market data."""
    product: str
    region: str
    demand_score: float = Field(ge=0, le=1)
    growth_prediction: float  # percentage
    competition_level: str  # low, medium, high


class MarketInsightResponse(BaseModel):
    """Response from market intelligence."""
    insights: list[MarketProduct]
    analysis_date: str
    methodology: str = "clustering + trend analysis"

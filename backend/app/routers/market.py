from fastapi import APIRouter

from app.schemas.market import (
    MarketInsightResponse,
    MarketAnalysisRequest, MarketAnalysisResponse,
    PricingRequest, PricingResponse,
)
from app.services.market import get_market_insights, analyze_market, get_pricing_recommendation

router = APIRouter(prefix="/market", tags=["Predictive Market Analytics"])


@router.get("/insights", response_model=MarketInsightResponse)
async def insights(region: str | None = None, product: str | None = None):
    """Get market intelligence insights with seasonal trends. Optionally filter by region or product."""
    return await get_market_insights(region=region, product=product)


@router.post("/analyze", response_model=MarketAnalysisResponse)
async def analyze(request: MarketAnalysisRequest):
    """Deep market analysis: identify opportunities, entry strategies, and economic signals for your business."""
    return await analyze_market(request)


@router.post("/pricing", response_model=PricingResponse)
async def pricing(request: PricingRequest):
    """Get AI-powered pricing recommendations for a product in target markets."""
    return await get_pricing_recommendation(request)

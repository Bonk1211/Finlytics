from fastapi import APIRouter

from app.schemas.market import MarketInsightResponse
from app.services.market import get_market_insights

router = APIRouter(prefix="/market", tags=["Market Intelligence"])


@router.get("/insights", response_model=MarketInsightResponse)
async def insights(region: str | None = None, product: str | None = None):
    """Get market intelligence insights. Optionally filter by region or product."""
    return await get_market_insights(region=region, product=product)

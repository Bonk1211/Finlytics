"""Market Intelligence Service.

Currently returns mock market insights. Swap in K-Means / DBSCAN clustering + Prophet for production.
"""

from datetime import date

from app.schemas.market import MarketInsightResponse, MarketProduct

# --- Mock market data ---
MOCK_INSIGHTS = [
    MarketProduct(
        product="Palm Oil",
        region="Vietnam",
        demand_score=0.88,
        growth_prediction=15.2,
        competition_level="medium",
    ),
    MarketProduct(
        product="Rubber",
        region="Thailand",
        demand_score=0.75,
        growth_prediction=8.5,
        competition_level="high",
    ),
    MarketProduct(
        product="Textiles",
        region="Indonesia",
        demand_score=0.82,
        growth_prediction=12.1,
        competition_level="low",
    ),
    MarketProduct(
        product="Electronics Components",
        region="Malaysia",
        demand_score=0.91,
        growth_prediction=18.7,
        competition_level="high",
    ),
    MarketProduct(
        product="Spices",
        region="Philippines",
        demand_score=0.70,
        growth_prediction=6.3,
        competition_level="low",
    ),
    MarketProduct(
        product="Furniture",
        region="Singapore",
        demand_score=0.78,
        growth_prediction=9.8,
        competition_level="medium",
    ),
]


async def get_market_insights(region: str | None = None, product: str | None = None) -> MarketInsightResponse:
    """Get market intelligence insights (mock implementation)."""
    filtered = MOCK_INSIGHTS

    if region:
        filtered = [i for i in filtered if i.region.lower() == region.lower()]
    if product:
        filtered = [i for i in filtered if product.lower() in i.product.lower()]

    # Sort by demand score descending
    filtered.sort(key=lambda x: x.demand_score, reverse=True)

    return MarketInsightResponse(
        insights=filtered,
        analysis_date=date.today().isoformat(),
    )

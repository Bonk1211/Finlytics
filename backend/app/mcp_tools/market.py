"""Market intelligence tools."""

import json
from typing import Annotated

from app.mcp_tools import mcp
from app.mcp_tools._helpers import split_csv
from app.services.market import (
    get_market_insights as _get_market_insights,
    analyze_market as _analyze_market,
    get_pricing_recommendation as _get_pricing_recommendation,
)
from app.schemas.market import MarketAnalysisRequest, PricingRequest


@mcp.tool()
async def get_market_insights(
    region: Annotated[str, "ASEAN region to filter by, e.g. 'Malaysia' (optional)"] = "",
    product: Annotated[str, "Product category to filter by, e.g. 'coffee' (optional)"] = "",
) -> str:
    """Get market intelligence insights for ASEAN trade.

    Returns demand scores, growth predictions, competition levels, and seasonal trends.
    Optionally filter by region or product. Call this for market overview or trend analysis.
    """
    try:
        result = await _get_market_insights(
            region=region or None, product=product or None
        )
        return result.model_dump_json(indent=2)
    except Exception as e:
        return json.dumps({"error": str(e)})


@mcp.tool()
async def analyze_market(
    business_name: Annotated[str, "Name of the business"],
    products: Annotated[str, "Comma-separated list of products, e.g. 'coffee,pepper,palm oil'"],
    current_regions: Annotated[str, "Comma-separated current operating regions"] = "",
    monthly_sales: Annotated[float, "Monthly sales in USD"] = 0,
    target_regions: Annotated[str, "Comma-separated target expansion regions"] = "",
    goals: Annotated[str, "Business goals or expansion objectives"] = "",
) -> str:
    """Deep market analysis for a specific MSME business.

    Identifies opportunities, entry strategies, risks, and economic signals across ASEAN markets.
    Call this when the user wants to explore new markets or plan expansion.
    """
    try:
        result = await _analyze_market(
            MarketAnalysisRequest(
                business_name=business_name,
                products=split_csv(products),
                current_regions=split_csv(current_regions),
                monthly_sales=monthly_sales,
                target_regions=split_csv(target_regions),
                goals=goals,
            )
        )
        return result.model_dump_json(indent=2)
    except Exception as e:
        return json.dumps({"error": str(e)})


@mcp.tool()
async def get_pricing_recommendation(
    product_name: Annotated[str, "Name of the product"],
    current_price: Annotated[float, "Current selling price in USD"],
    unit_cost: Annotated[float, "Cost per unit in USD"],
    target_region: Annotated[str, "Target market region"] = "",
    competitor_prices: Annotated[str, "Comma-separated competitor prices in USD, e.g. '12.50,14.00,11.75'"] = "",
    monthly_volume: Annotated[float, "Monthly sales volume in units"] = 0,
) -> str:
    """Get AI-powered pricing recommendations for a product.

    Analyzes costs, competition, and market conditions to suggest optimal pricing strategy
    with seasonal adjustments. Call this when the user needs pricing advice or wants to
    optimize their product pricing.
    """
    try:
        prices = []
        if competitor_prices:
            prices = [float(p.strip()) for p in competitor_prices.split(",") if p.strip()]
        result = await _get_pricing_recommendation(
            PricingRequest(
                product_name=product_name,
                current_price=current_price,
                unit_cost=unit_cost,
                target_region=target_region,
                competitor_prices=prices,
                monthly_volume=monthly_volume,
            )
        )
        return result.model_dump_json(indent=2)
    except Exception as e:
        return json.dumps({"error": str(e)})

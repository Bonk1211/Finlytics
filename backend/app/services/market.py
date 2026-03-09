"""Predictive Market Analytics Service powered by Gemini.

Provides:
- Market trend insights with seasonal analysis
- Deep market opportunity analysis for specific businesses
- AI-powered pricing recommendations
"""

import json
from datetime import date

from app.schemas.market import (
    MarketInsightResponse, MarketProduct,
    MarketAnalysisRequest, MarketAnalysisResponse, MarketOpportunity,
    PricingRequest, PricingResponse, PricingRecommendation,
)
from app.services.gemini_client import generate

INSIGHTS_SYSTEM = """You are an ASEAN market intelligence analyst specializing in MSME cross-border trade.

Provide market insights on product demand, regional trends, competition, and seasonal patterns.

Respond in JSON format:
{
  "insights": [
    {
      "product": "Product Name",
      "region": "ASEAN Country",
      "demand_score": 0.85,
      "growth_prediction": 12.5,
      "competition_level": "medium",
      "seasonal_trend": "Peaks during Q4 holiday season"
    }
  ]
}

Rules:
- demand_score: 0.0 to 1.0
- growth_prediction: percentage (can be negative)
- competition_level: "low", "medium", "high"
- seasonal_trend: brief description of seasonal patterns
- Provide at least 5 insights
- Focus on practical MSME trade opportunities in ASEAN
"""

ANALYSIS_SYSTEM = """You are a strategic market analyst for ASEAN MSMEs.

Analyze the business profile and identify market opportunities, entry strategies, and economic signals.

Respond in JSON format:
{
  "opportunities": [
    {
      "product": "Product",
      "target_region": "Country",
      "opportunity_score": 0.8,
      "estimated_demand": "High — growing 15% annually",
      "entry_strategy": "Start with e-commerce platforms, then expand to wholesale",
      "risks": ["Currency volatility", "Local competition"],
      "seasonal_notes": "Best entry in Q1 before monsoon season"
    }
  ],
  "overall_strategy": "Strategic recommendation for the business",
  "economic_signals": ["Signal 1", "Signal 2"]
}

Rules:
- opportunity_score: 0.0 to 1.0
- Provide actionable, specific strategies — not generic advice
- Include local economic signals affecting trade
- Consider ASEAN trade agreements and tariff benefits
"""

PRICING_SYSTEM = """You are a pricing strategy expert for ASEAN MSME products.

Analyze the product, costs, competition, and market to recommend optimal pricing.

Respond in JSON format:
{
  "recommendation": {
    "recommended_price": 25.00,
    "price_range_low": 22.00,
    "price_range_high": 28.00,
    "margin_percentage": 40.0,
    "strategy": "Competitive pricing with quality differentiation",
    "reasoning": "Detailed reasoning for the price point",
    "seasonal_adjustments": ["Increase 10% during festive seasons", "Offer bundles in slow months"]
  },
  "market_position": "mid-range",
  "ai_summary": "Overall pricing assessment"
}

Rules:
- recommended_price must be >= unit_cost
- margin_percentage = (recommended_price - unit_cost) / recommended_price * 100
- market_position: "budget", "mid-range", "premium"
- Consider competitor prices if provided
- Include seasonal pricing adjustments relevant to ASEAN markets
"""


async def get_market_insights(
    region: str | None = None, product: str | None = None
) -> MarketInsightResponse:
    """Get market intelligence insights using Gemini."""
    filters = []
    if region:
        filters.append(f"Focus on the **{region}** market.")
    if product:
        filters.append(f"Focus on **{product}** products.")

    filter_text = "\n".join(filters) if filters else "Provide a broad overview of top ASEAN trade opportunities."

    prompt = f"""## Market Intelligence Request

{filter_text}

Include seasonal trend analysis for each product-region combination.
Respond in the JSON format specified."""

    raw_response = await generate(prompt, system_instruction=INSIGHTS_SYSTEM)

    try:
        cleaned = raw_response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
            cleaned = cleaned.rsplit("```", 1)[0]
        parsed = json.loads(cleaned)

        insights = [
            MarketProduct(
                product=i["product"],
                region=i["region"],
                demand_score=max(0.0, min(1.0, float(i.get("demand_score", 0.5)))),
                growth_prediction=float(i.get("growth_prediction", 0)),
                competition_level=i.get("competition_level", "medium") if i.get("competition_level") in ("low", "medium", "high") else "medium",
                seasonal_trend=i.get("seasonal_trend", ""),
            )
            for i in parsed.get("insights", [])
        ]
    except (json.JSONDecodeError, ValueError, KeyError):
        insights = []

    return MarketInsightResponse(
        insights=insights,
        analysis_date=date.today().isoformat(),
    )


async def analyze_market(request: MarketAnalysisRequest) -> MarketAnalysisResponse:
    """Deep market analysis for a specific business using Gemini."""
    prompt = f"""## Business: {request.business_name}
## Products: {', '.join(request.products)}
## Current Regions: {', '.join(request.current_regions) or 'Not specified'}
## Monthly Sales: USD {request.monthly_sales:,.2f}
## Target Regions: {', '.join(request.target_regions) or 'Open to suggestions'}
## Goals: {request.goals or 'Expand market reach'}

Identify the best market opportunities and provide actionable strategies.
Respond in the JSON format specified."""

    raw_response = await generate(prompt, system_instruction=ANALYSIS_SYSTEM)

    try:
        cleaned = raw_response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
            cleaned = cleaned.rsplit("```", 1)[0]
        parsed = json.loads(cleaned)

        opportunities = [
            MarketOpportunity(
                product=o["product"],
                target_region=o["target_region"],
                opportunity_score=max(0.0, min(1.0, float(o.get("opportunity_score", 0.5)))),
                estimated_demand=o.get("estimated_demand", ""),
                entry_strategy=o.get("entry_strategy", ""),
                risks=o.get("risks", []),
                seasonal_notes=o.get("seasonal_notes", ""),
            )
            for o in parsed.get("opportunities", [])
        ]

        return MarketAnalysisResponse(
            business_name=request.business_name,
            opportunities=opportunities,
            overall_strategy=parsed.get("overall_strategy", ""),
            economic_signals=parsed.get("economic_signals", []),
        )
    except (json.JSONDecodeError, ValueError, KeyError):
        return MarketAnalysisResponse(
            business_name=request.business_name,
            opportunities=[],
            overall_strategy=raw_response,
        )


async def get_pricing_recommendation(request: PricingRequest) -> PricingResponse:
    """Get AI-powered pricing recommendations using Gemini."""
    competitor_text = ""
    if request.competitor_prices:
        competitor_text = f"## Competitor Prices: {', '.join(f'USD {p:.2f}' for p in request.competitor_prices)}"

    prompt = f"""## Product: {request.product_name}
## Current Price: USD {request.current_price:.2f}
## Unit Cost: USD {request.unit_cost:.2f}
## Target Region: {request.target_region or 'ASEAN'}
## Monthly Volume: {request.monthly_volume} units
{competitor_text}

Recommend optimal pricing strategy.
Respond in the JSON format specified."""

    raw_response = await generate(prompt, system_instruction=PRICING_SYSTEM)

    try:
        cleaned = raw_response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
            cleaned = cleaned.rsplit("```", 1)[0]
        parsed = json.loads(cleaned)

        rec = parsed.get("recommendation", {})
        recommendation = PricingRecommendation(
            recommended_price=max(request.unit_cost, float(rec.get("recommended_price", request.current_price))),
            price_range_low=float(rec.get("price_range_low", request.current_price * 0.9)),
            price_range_high=float(rec.get("price_range_high", request.current_price * 1.1)),
            margin_percentage=float(rec.get("margin_percentage", 0)),
            strategy=rec.get("strategy", ""),
            reasoning=rec.get("reasoning", ""),
            seasonal_adjustments=rec.get("seasonal_adjustments", []),
        )

        market_position = parsed.get("market_position", "mid-range")
        if market_position not in ("budget", "mid-range", "premium"):
            market_position = "mid-range"

        return PricingResponse(
            product_name=request.product_name,
            recommendation=recommendation,
            market_position=market_position,
            ai_summary=parsed.get("ai_summary", ""),
        )
    except (json.JSONDecodeError, ValueError, KeyError):
        return PricingResponse(
            product_name=request.product_name,
            recommendation=PricingRecommendation(
                recommended_price=request.current_price,
                price_range_low=request.current_price * 0.9,
                price_range_high=request.current_price * 1.1,
                margin_percentage=0,
                strategy="",
                reasoning=raw_response,
            ),
            market_position="mid-range",
            ai_summary=raw_response,
        )

"""Market Intelligence Service powered by Gemini.

Uses Gemini to analyze market trends and provide product/region insights for ASEAN trade.
"""

import json
from datetime import date

from app.schemas.market import MarketInsightResponse, MarketProduct
from app.services.gemini_client import generate

SYSTEM_INSTRUCTION = """You are an ASEAN market intelligence analyst specializing in MSME cross-border trade.

Provide market insights based on your knowledge of ASEAN trade dynamics. Analyze product demand, regional trends, and competitive landscapes.

Respond in JSON format:
{
  "insights": [
    {
      "product": "Product Name",
      "region": "ASEAN Country",
      "demand_score": 0.85,
      "growth_prediction": 12.5,
      "competition_level": "medium"
    }
  ]
}

Rules:
- demand_score: 0.0 to 1.0 (relative demand level)
- growth_prediction: percentage growth forecast (can be negative)
- competition_level: "low", "medium", or "high"
- Provide realistic insights based on known ASEAN trade patterns
- Include at least 5 product-region combinations in your analysis
- Focus on products and regions relevant to MSMEs
"""


async def get_market_insights(
    region: str | None = None, product: str | None = None
) -> MarketInsightResponse:
    """Get market intelligence insights using Gemini analysis."""
    filters = []
    if region:
        filters.append(f"Focus specifically on the **{region}** market.")
    if product:
        filters.append(f"Focus specifically on **{product}** products.")

    filter_text = "\n".join(filters) if filters else "Provide a broad overview of top ASEAN trade opportunities for MSMEs."

    prompt = f"""## Market Intelligence Request

{filter_text}

Analyze current market conditions and provide actionable trade insights for MSMEs.
Include product opportunities, demand levels, growth forecasts, and competition analysis.

Respond in the JSON format specified."""

    raw_response = await generate(prompt, system_instruction=SYSTEM_INSTRUCTION)

    try:
        cleaned = raw_response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
            cleaned = cleaned.rsplit("```", 1)[0]
        parsed = json.loads(cleaned)

        insights = []
        for item in parsed.get("insights", []):
            competition = item.get("competition_level", "medium")
            if competition not in ("low", "medium", "high"):
                competition = "medium"

            insights.append(
                MarketProduct(
                    product=item["product"],
                    region=item["region"],
                    demand_score=max(0.0, min(1.0, float(item.get("demand_score", 0.5)))),
                    growth_prediction=float(item.get("growth_prediction", 0.0)),
                    competition_level=competition,
                )
            )

    except (json.JSONDecodeError, ValueError, KeyError):
        insights = []

    return MarketInsightResponse(
        insights=insights,
        analysis_date=date.today().isoformat(),
        methodology="gemini_market_analysis",
    )

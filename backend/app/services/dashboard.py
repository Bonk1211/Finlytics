"""MSME Business Dashboard Service powered by Gemini.

Aggregates business metrics into an easy-to-understand dashboard with KPIs,
loan eligibility assessment, market opportunities, and action items.
"""

import json
from app.schemas.dashboard import BusinessMetrics, DashboardResponse, KPI
from app.services.gemini_client import generate

SYSTEM_INSTRUCTION = """You are a business intelligence analyst creating a simple dashboard for MSME owners.

Your goal is to make complex business data EASY TO UNDERSTAND for small business owners.
Provide clear, actionable insights — not jargon.

Given business metrics, respond in JSON format:
{
  "revenue_summary": "Your monthly revenue is USD 25,000 — up from last month's trend",
  "profit_margin": "Estimated 35% margin based on revenue vs expenses",
  "loan_eligibility": "Likely eligible for loans up to USD 75,000 based on your revenue and payment history",
  "market_opportunities": [
    "Consider expanding palm oil to Vietnam — demand growing 15%",
    "Seasonal spike expected in Q4 — prepare inventory"
  ],
  "kpis": [
    {
      "name": "Monthly Revenue",
      "value": "USD 25,000",
      "trend": "up",
      "description": "Strong revenue indicating healthy business"
    },
    {
      "name": "Customer Base",
      "value": "120 customers",
      "trend": "stable",
      "description": "Stable customer retention"
    }
  ],
  "action_items": [
    "Review inventory levels — some items may need reordering",
    "Apply for trade financing to fund expansion"
  ],
  "ai_summary": "A concise 2-3 sentence overview of business health and priorities"
}

Rules:
- revenue_summary, profit_margin, loan_eligibility: plain English, easy to understand
- kpis: 4-6 key metrics with trend direction (up/down/stable)
- market_opportunities: 2-4 specific, actionable opportunities
- action_items: 3-5 prioritized next steps
- ai_summary: brief overall health assessment
- Use simple language — the audience is a small business owner, not a finance expert
"""


async def generate_dashboard(metrics: BusinessMetrics) -> DashboardResponse:
    """Generate a business dashboard summary using Gemini."""
    prompt = f"""## Business: {metrics.business_name}

## Financial Metrics
- Monthly Revenue: USD {metrics.monthly_revenue:,.2f}
- Monthly Expenses: USD {metrics.monthly_expenses:,.2f}
- Years in Business: {metrics.years_in_business}

## Operational Metrics
- Monthly Transactions: {metrics.transaction_count}
- Products: {metrics.product_count}
- Customers: {metrics.customer_count}
- Top Products: {', '.join(metrics.top_products) or 'Not specified'}
- Operating Regions: {', '.join(metrics.operating_regions) or 'Not specified'}

## Status
- Credit Score: {metrics.credit_score or 'Not assessed'}
- Inventory Health: {metrics.inventory_health or 'Not assessed'}

Generate a comprehensive but easy-to-understand business dashboard.
Respond in the JSON format specified."""

    raw_response = await generate(prompt, system_instruction=SYSTEM_INSTRUCTION)

    try:
        cleaned = raw_response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
            cleaned = cleaned.rsplit("```", 1)[0]
        parsed = json.loads(cleaned)

        kpis = [
            KPI(
                name=k["name"],
                value=str(k["value"]),
                trend=k.get("trend", "stable") if k.get("trend") in ("up", "down", "stable") else "stable",
                description=k.get("description", ""),
            )
            for k in parsed.get("kpis", [])
        ]

        return DashboardResponse(
            business_name=metrics.business_name,
            revenue_summary=parsed.get("revenue_summary", ""),
            profit_margin=parsed.get("profit_margin", ""),
            loan_eligibility=parsed.get("loan_eligibility", ""),
            market_opportunities=parsed.get("market_opportunities", []),
            kpis=kpis,
            action_items=parsed.get("action_items", []),
            ai_summary=parsed.get("ai_summary", ""),
        )
    except (json.JSONDecodeError, ValueError, KeyError):
        return DashboardResponse(
            business_name=metrics.business_name,
            revenue_summary="",
            profit_margin="",
            loan_eligibility="",
            market_opportunities=[],
            kpis=[],
            action_items=[],
            ai_summary=raw_response,
        )

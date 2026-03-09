"""Alternative Credit Scoring Service powered by Gemini.

Uses Gemini to analyze MSME business metrics and provide creditworthiness assessment.
"""

import json
from app.schemas.credit import CreditScoreRequest, CreditScoreResponse
from app.services.gemini_client import generate

SYSTEM_INSTRUCTION = """You are an expert alternative credit scoring analyst for MSMEs in ASEAN.

You evaluate MSME creditworthiness using non-traditional data points instead of conventional bank data.

Analyze the provided business metrics and respond in JSON format:
{
  "credit_score": 650,
  "risk_probability": 0.25,
  "risk_category": "medium",
  "loan_recommendation": "Detailed recommendation here",
  "factors": ["Factor 1", "Factor 2", "Factor 3"]
}

Scoring guidelines:
- credit_score: integer from 300 (worst) to 850 (best)
- risk_probability: float from 0.0 (no risk) to 1.0 (highest risk)
- risk_category: "low" (score >= 700), "medium" (500-699), "high" (< 500)
- loan_recommendation: Practical recommendation including suggested loan amount and terms
- factors: Key positive and negative factors affecting the score

Consider these factors in your analysis:
- Monthly revenue relative to industry norms
- Transaction frequency as indicator of business activity
- Inventory turnover as operational efficiency measure
- Customer ratings as quality/reliability indicator
- Payment history as financial discipline measure
- Years in business as stability indicator
"""


async def score_credit(request: CreditScoreRequest) -> CreditScoreResponse:
    """Evaluate MSME creditworthiness using Gemini analysis."""
    prompt = f"""## Business Profile: {request.business_name}

## Metrics
- Monthly Revenue: USD {request.monthly_revenue:,.2f}
- Monthly Transaction Count: {request.transaction_count}
- Inventory Turnover Rate: {request.inventory_turnover}x
- Customer Rating: {request.customer_rating}/5.0
- Payment History Score: {request.payment_history_score} (0=worst, 1=perfect)
- Years in Business: {request.years_in_business}

Analyze this MSME's creditworthiness and provide a detailed assessment.
Respond in the JSON format specified."""

    raw_response = await generate(prompt, system_instruction=SYSTEM_INSTRUCTION)

    try:
        cleaned = raw_response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
            cleaned = cleaned.rsplit("```", 1)[0]
        parsed = json.loads(cleaned)

        credit_score = max(300, min(850, int(parsed.get("credit_score", 500))))
        risk_probability = max(0.0, min(1.0, float(parsed.get("risk_probability", 0.5))))
        risk_category = parsed.get("risk_category", "medium")
        if risk_category not in ("low", "medium", "high"):
            risk_category = "medium"
        loan_recommendation = parsed.get("loan_recommendation", "Unable to generate recommendation.")
        factors = parsed.get("factors", [])

    except (json.JSONDecodeError, ValueError, KeyError):
        credit_score = 500
        risk_probability = 0.5
        risk_category = "medium"
        loan_recommendation = raw_response
        factors = []

    return CreditScoreResponse(
        business_name=request.business_name,
        credit_score=credit_score,
        risk_probability=round(risk_probability, 3),
        risk_category=risk_category,
        loan_recommendation=loan_recommendation,
        factors=factors,
    )

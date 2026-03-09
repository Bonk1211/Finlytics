"""Alternative Credit Scoring Service powered by Gemini.

Evaluates MSME creditworthiness using non-traditional data:
mobile payments, digital transactions, supplier relationships, etc.
"""

import json
from app.schemas.credit import CreditScoreRequest, CreditScoreResponse
from app.services.gemini_client import generate

SYSTEM_INSTRUCTION = """You are an expert alternative credit scoring analyst for MSMEs in ASEAN.

You evaluate MSME creditworthiness using NON-TRADITIONAL data points — mobile payments,
digital transactions, supplier networks — instead of conventional bank credit history.
This helps unbanked or offline businesses access formal loans.

Analyze ALL provided business metrics and respond in JSON format:
{
  "credit_score": 650,
  "risk_probability": 0.25,
  "risk_category": "medium",
  "loan_recommendation": "Detailed recommendation here",
  "max_loan_amount": 50000.00,
  "suggested_interest_rate": "8-10% p.a.",
  "factors": ["Positive: strong mobile payment adoption", "Negative: limited supplier network"]
}

Scoring guidelines:
- credit_score: integer 300 (worst) to 850 (best)
- risk_probability: float 0.0 (no risk) to 1.0 (highest risk)
- risk_category: "low" (score >= 700), "medium" (500-699), "high" (< 500)
- max_loan_amount: practical loan amount in USD based on revenue and risk
- suggested_interest_rate: realistic rate range based on risk
- factors: list both POSITIVE and NEGATIVE factors affecting the score

Key evaluation criteria:
1. Monthly revenue and transaction frequency — business viability
2. Mobile payment volume & digital transaction ratio — tech adoption signals financial maturity
3. Supplier count & reliability — supply chain stability
4. Inventory turnover — operational efficiency
5. Customer ratings — market reputation
6. Payment history — financial discipline
7. Years in business — stability and track record

A high digital_transaction_ratio and mobile_payment_volume indicate a business
transitioning to formal economy — this is a POSITIVE signal for creditworthiness.
"""


async def score_credit(request: CreditScoreRequest) -> CreditScoreResponse:
    """Evaluate MSME creditworthiness using Gemini analysis of alternative data."""
    prompt = f"""## Business Profile: {request.business_name}

## Traditional Metrics
- Monthly Revenue: USD {request.monthly_revenue:,.2f}
- Years in Business: {request.years_in_business}

## Transaction Data
- Monthly Transaction Count: {request.transaction_count}
- Digital Transaction Ratio: {request.digital_transaction_ratio:.0%}

## Mobile Payment Data
- Monthly Mobile Payment Volume: USD {request.mobile_payment_volume:,.2f}

## Inventory & Operations
- Inventory Turnover Rate: {request.inventory_turnover}x

## Supplier Relationships
- Number of Active Suppliers: {request.supplier_count}
- Average Supplier Reliability Score: {request.supplier_reliability_score:.0%}

## Customer & Payment History
- Customer Rating: {request.customer_rating}/5.0
- Payment History Score: {request.payment_history_score:.0%}

Provide a comprehensive credit assessment for this MSME.
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

        return CreditScoreResponse(
            business_name=request.business_name,
            credit_score=credit_score,
            risk_probability=round(risk_probability, 3),
            risk_category=risk_category,
            loan_recommendation=parsed.get("loan_recommendation", ""),
            max_loan_amount=max(0.0, float(parsed.get("max_loan_amount", 0))),
            suggested_interest_rate=str(parsed.get("suggested_interest_rate", "")),
            factors=parsed.get("factors", []),
        )
    except (json.JSONDecodeError, ValueError, KeyError):
        return CreditScoreResponse(
            business_name=request.business_name,
            credit_score=500,
            risk_probability=0.5,
            risk_category="medium",
            loan_recommendation=raw_response,
            max_loan_amount=0,
            factors=[],
        )

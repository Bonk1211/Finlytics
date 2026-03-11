"""Alternative Credit Scoring Service powered by Gemini.

Evaluates MSME creditworthiness using non-traditional data:
mobile payments, digital transactions, supplier relationships, etc.
"""

import json
import logging
from app.schemas.credit import CreditScoreRequest, CreditScoreResponse, ScoreBreakdownItem
from app.services.gemini_client import generate
from app.services.supabase_client import get_supabase

logger = logging.getLogger(__name__)


def _clamp(v: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, v))


def _build_formula_breakdown(request: CreditScoreRequest) -> tuple[int, list[ScoreBreakdownItem], str, list[str]]:
    """Deterministic weighted-score approximation for transparency/explainability."""
    # Normalization anchors are practical MSME operating bands.
    revenue_norm = _clamp(request.monthly_revenue / 50000.0, 0.0, 1.0)
    years_norm = _clamp(request.years_in_business / 10.0, 0.0, 1.0)
    tx_norm = _clamp(request.transaction_count / 500.0, 0.0, 1.0)
    digital_norm = _clamp(request.digital_transaction_ratio, 0.0, 1.0)
    mobile_norm = _clamp(request.mobile_payment_volume / 40000.0, 0.0, 1.0)
    inventory_norm = _clamp(request.inventory_turnover / 12.0, 0.0, 1.0)
    supplier_count_norm = _clamp(request.supplier_count / 10.0, 0.0, 1.0)
    supplier_network_norm = _clamp((0.4 * supplier_count_norm) + (0.6 * request.supplier_reliability_score), 0.0, 1.0)
    customer_norm = _clamp(request.customer_rating / 5.0, 0.0, 1.0)
    payment_norm = _clamp(request.payment_history_score, 0.0, 1.0)

    weights = {
        "Revenue Strength": 20.0,
        "Business Maturity": 10.0,
        "Transaction Activity": 10.0,
        "Digital Adoption": 15.0,
        "Mobile Payments": 10.0,
        "Inventory Efficiency": 10.0,
        "Supplier Network": 10.0,
        "Customer Reputation": 10.0,
        "Payment Discipline": 5.0,
    }

    normalized = {
        "Revenue Strength": revenue_norm,
        "Business Maturity": years_norm,
        "Transaction Activity": tx_norm,
        "Digital Adoption": digital_norm,
        "Mobile Payments": mobile_norm,
        "Inventory Efficiency": inventory_norm,
        "Supplier Network": supplier_network_norm,
        "Customer Reputation": customer_norm,
        "Payment Discipline": payment_norm,
    }

    weighted_points = 0.0
    breakdown: list[ScoreBreakdownItem] = []
    for metric, weight in weights.items():
        contribution = weight * normalized[metric]
        weighted_points += contribution
        breakdown.append(
            ScoreBreakdownItem(
                metric=metric,
                normalized_value=round(normalized[metric], 4),
                weight=weight,
                contribution_points=round(contribution, 2),
            )
        )

    # Convert 0..100 weighted points to credit band 300..850.
    baseline_formula_score = int(round(300 + (weighted_points / 100.0) * 550))
    baseline_formula_score = int(_clamp(baseline_formula_score, 300, 850))

    formula = (
        "BaselineScore = 300 + 550 * (Sum(weight_i * normalized_i) / 100); "
        "FinalScore = BaselineScore + AIAdjustment"
    )
    steps = [
        f"Weighted points = {weighted_points:.2f} / 100.00",
        f"Baseline formula score = {baseline_formula_score}",
        "AI adjustment is applied from qualitative analysis (risk narrative, factor interactions, context).",
    ]

    return baseline_formula_score, breakdown, formula, steps

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
    baseline_formula_score, score_breakdown, score_formula, score_steps = _build_formula_breakdown(request)

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

        result = CreditScoreResponse(
            business_name=request.business_name,
            credit_score=credit_score,
            risk_probability=round(risk_probability, 3),
            risk_category=risk_category,
            loan_recommendation=parsed.get("loan_recommendation", ""),
            max_loan_amount=max(0.0, float(parsed.get("max_loan_amount", 0))),
            suggested_interest_rate=str(parsed.get("suggested_interest_rate", "")),
            factors=parsed.get("factors", []),
            score_formula=score_formula,
            baseline_formula_score=baseline_formula_score,
            ai_adjustment=credit_score - baseline_formula_score,
            score_breakdown=score_breakdown,
            score_calculation_steps=score_steps,
        )
    except (json.JSONDecodeError, ValueError, KeyError):
        result = CreditScoreResponse(
            business_name=request.business_name,
            credit_score=500,
            risk_probability=0.5,
            risk_category="medium",
            loan_recommendation=raw_response,
            max_loan_amount=0,
            factors=[],
            score_formula=score_formula,
            baseline_formula_score=baseline_formula_score,
            ai_adjustment=500 - baseline_formula_score,
            score_breakdown=score_breakdown,
            score_calculation_steps=score_steps,
        )

    # Persist assessment to Supabase (fire-and-forget)
    _persist_credit_assessment(request, result)
    return result


def _persist_credit_assessment(
    request: CreditScoreRequest, result: CreditScoreResponse
) -> None:
    """Log credit assessment to Supabase. Non-blocking, never raises."""
    try:
        db = get_supabase()
        if db is None:
            return

        risk_map = {"low": "Low", "medium": "Medium", "high": "High"}

        db.table("credit_assessments").insert({
            "smart_credit_score": result.credit_score,
            "risk_level": risk_map.get(result.risk_category, "Medium"),
            "loan_suggestion": result.loan_recommendation,
            "matched_lenders": [],
            "assessment_data": {
                "business_name": request.business_name,
                "monthly_revenue": request.monthly_revenue,
                "risk_probability": result.risk_probability,
                "max_loan_amount": result.max_loan_amount,
                "suggested_interest_rate": result.suggested_interest_rate,
                "factors": result.factors,
            },
        }).execute()
    except Exception as e:
        logger.warning("Failed to persist credit assessment: %s", e)

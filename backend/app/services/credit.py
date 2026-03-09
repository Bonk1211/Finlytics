"""Alternative Credit Scoring Service.

Currently uses a simple weighted formula. Swap in XGBoost / LightGBM for production.
"""

from app.schemas.credit import CreditScoreRequest, CreditScoreResponse


def _calculate_score(request: CreditScoreRequest) -> tuple[int, float, str, list[str]]:
    """Calculate credit score using a weighted formula (mock ML model)."""
    factors: list[str] = []

    # Revenue score (0-200 points)
    if request.monthly_revenue >= 50000:
        rev_score = 200
        factors.append("Strong monthly revenue")
    elif request.monthly_revenue >= 20000:
        rev_score = 150
        factors.append("Moderate monthly revenue")
    elif request.monthly_revenue >= 5000:
        rev_score = 100
        factors.append("Growing revenue base")
    else:
        rev_score = 50
        factors.append("Low revenue — higher risk")

    # Transaction frequency (0-150 points)
    if request.transaction_count >= 100:
        txn_score = 150
        factors.append("High transaction volume")
    elif request.transaction_count >= 30:
        txn_score = 100
    else:
        txn_score = 50
        factors.append("Low transaction volume")

    # Payment history (0-200 points)
    pay_score = int(request.payment_history_score * 200)
    if request.payment_history_score >= 0.9:
        factors.append("Excellent payment history")
    elif request.payment_history_score < 0.5:
        factors.append("Poor payment history — major risk factor")

    # Customer rating (0-100 points)
    rating_score = int((request.customer_rating / 5) * 100)
    if request.customer_rating >= 4.0:
        factors.append("High customer satisfaction")

    # Years in business (0-100 points)
    years_score = min(int(request.years_in_business * 20), 100)
    if request.years_in_business >= 3:
        factors.append("Established business track record")
    elif request.years_in_business < 1:
        factors.append("New business — limited history")

    # Inventory turnover (0-100 points)
    inv_score = min(int(request.inventory_turnover * 20), 100)

    # Total: 300-850 range
    raw_total = rev_score + txn_score + pay_score + rating_score + years_score + inv_score
    credit_score = max(300, min(850, raw_total))

    # Risk assessment
    risk_prob = max(0.0, min(1.0, 1 - (credit_score - 300) / 550))

    if credit_score >= 700:
        risk_cat = "low"
    elif credit_score >= 500:
        risk_cat = "medium"
    else:
        risk_cat = "high"

    return credit_score, round(risk_prob, 3), risk_cat, factors


async def score_credit(request: CreditScoreRequest) -> CreditScoreResponse:
    """Evaluate MSME creditworthiness (mock ML model)."""
    credit_score, risk_prob, risk_cat, factors = _calculate_score(request)

    # Generate loan recommendation
    if risk_cat == "low":
        recommendation = (
            f"Recommended for loan approval up to USD {int(request.monthly_revenue * 6):,}. "
            f"Suggested interest rate: 5-7% p.a."
        )
    elif risk_cat == "medium":
        recommendation = (
            f"Conditional approval up to USD {int(request.monthly_revenue * 3):,}. "
            f"Additional collateral or guarantor may be required. Suggested rate: 8-12% p.a."
        )
    else:
        recommendation = (
            "High risk profile. Consider microfinance or trade credit programs. "
            "Recommend building 6+ months of payment history before reapplying."
        )

    return CreditScoreResponse(
        business_name=request.business_name,
        credit_score=credit_score,
        risk_probability=risk_prob,
        risk_category=risk_cat,
        loan_recommendation=recommendation,
        factors=factors,
    )

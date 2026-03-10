"""Credit scoring tool."""

import json
from typing import Annotated

from app.mcp_tools import mcp
from app.services.credit import score_credit as _score_credit
from app.schemas.credit import CreditScoreRequest


@mcp.tool()
async def score_credit(
    business_name: Annotated[str, "Name of the MSME business"],
    monthly_revenue: Annotated[float, "Monthly revenue in USD"],
    years_in_business: Annotated[float, "Years the business has been operating"],
    transaction_count: Annotated[int, "Monthly transaction count"],
    inventory_turnover: Annotated[float, "Inventory turnover ratio"],
    customer_rating: Annotated[float, "Customer rating (0-5)"],
    payment_history_score: Annotated[float, "Payment history score (0=worst, 1=perfect)"],
    digital_transaction_ratio: Annotated[float, "Ratio of digital vs cash transactions (0-1)"] = 0.0,
    mobile_payment_volume: Annotated[float, "Monthly mobile payment volume in USD"] = 0.0,
    supplier_count: Annotated[int, "Number of active suppliers"] = 0,
    supplier_reliability_score: Annotated[float, "Average supplier reliability (0-1)"] = 0.5,
) -> str:
    """Evaluate an MSME's creditworthiness using alternative data.

    Uses non-traditional metrics like mobile payments, digital transactions, and supplier
    relationships to generate a credit score (300-850), risk assessment, and loan recommendation.
    Call this when the user wants a credit check, loan eligibility, or financial health review.
    """
    try:
        result = await _score_credit(
            CreditScoreRequest(
                business_name=business_name,
                monthly_revenue=monthly_revenue,
                years_in_business=years_in_business,
                transaction_count=transaction_count,
                digital_transaction_ratio=digital_transaction_ratio,
                mobile_payment_volume=mobile_payment_volume,
                inventory_turnover=inventory_turnover,
                supplier_count=supplier_count,
                supplier_reliability_score=supplier_reliability_score,
                customer_rating=customer_rating,
                payment_history_score=payment_history_score,
            )
        )
        return result.model_dump_json(indent=2)
    except Exception as e:
        return json.dumps({"error": str(e)})

"""Business dashboard tool."""

import json
from typing import Annotated

from app.mcp_tools import mcp
from app.mcp_tools._helpers import split_csv
from app.services.dashboard import generate_dashboard as _generate_dashboard
from app.schemas.dashboard import BusinessMetrics


@mcp.tool()
async def generate_dashboard(
    business_name: Annotated[str, "Name of the MSME business"],
    monthly_revenue: Annotated[float, "Monthly revenue in USD"],
    monthly_expenses: Annotated[float, "Monthly expenses in USD"] = 0,
    transaction_count: Annotated[int, "Monthly transaction count"] = 0,
    product_count: Annotated[int, "Number of products offered"] = 0,
    customer_count: Annotated[int, "Number of active customers"] = 0,
    top_products: Annotated[str, "Comma-separated top products"] = "",
    operating_regions: Annotated[str, "Comma-separated operating regions"] = "",
    years_in_business: Annotated[float, "Years in operation"] = 0,
    credit_score: Annotated[int, "Existing credit score (300-850), 0 if unknown"] = 0,
    inventory_health: Annotated[str, "Inventory status: 'healthy', 'attention_needed', or 'critical'"] = "",
) -> str:
    """Generate a comprehensive business dashboard with KPIs and action items.

    Aggregates business metrics into a dashboard with revenue summary, profit margin,
    loan eligibility, market opportunities, and prioritized action items.
    Call this when the user wants a business overview or performance summary.
    """
    try:
        result = await _generate_dashboard(
            BusinessMetrics(
                business_name=business_name,
                monthly_revenue=monthly_revenue,
                monthly_expenses=monthly_expenses,
                transaction_count=transaction_count,
                product_count=product_count,
                customer_count=customer_count,
                top_products=split_csv(top_products),
                operating_regions=split_csv(operating_regions),
                years_in_business=years_in_business,
                credit_score=credit_score or None,
                inventory_health=inventory_health,
            )
        )
        return result.model_dump_json(indent=2)
    except Exception as e:
        return json.dumps({"error": str(e)})

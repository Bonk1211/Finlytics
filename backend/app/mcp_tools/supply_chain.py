"""Supply chain tools."""

import json
from typing import Annotated

from app.mcp_tools import mcp
from app.services.supply_chain import (
    check_inventory as _check_inventory,
    recommend_suppliers as _recommend_suppliers,
)
from app.schemas.supply_chain import (
    InventoryCheckRequest,
    InventoryItem,
    SupplierRecommendRequest,
    Supplier,
)


@mcp.tool()
async def check_inventory(
    business_name: Annotated[str, "Name of the business"],
    inventory_json: Annotated[str, "JSON array of inventory items. Each item: {\"product_name\": \"Rice\", \"current_quantity\": 100, \"reorder_point\": 50, \"unit\": \"kg\", \"unit_cost\": 2.5, \"sku\": \"\", \"supplier_name\": \"\", \"category\": \"\"}"],
    average_daily_sales_json: Annotated[str, "JSON object mapping product name to average daily units sold, e.g. {\"Rice\": 10, \"Coffee\": 5}"] = "{}",
) -> str:
    """Analyze inventory levels and get reorder suggestions.

    Evaluates current stock against reorder points, calculates days until stockout,
    and suggests reorder quantities with urgency levels. Call this when the user wants
    to check stock levels or needs reorder recommendations.
    """
    try:
        items = [InventoryItem(**item) for item in json.loads(inventory_json)]
        daily_sales = json.loads(average_daily_sales_json)
        result = await _check_inventory(
            InventoryCheckRequest(
                business_name=business_name,
                inventory=items,
                average_daily_sales=daily_sales,
            )
        )
        return result.model_dump_json(indent=2)
    except json.JSONDecodeError as e:
        return json.dumps({"error": f"Invalid JSON: {e}"})
    except Exception as e:
        return json.dumps({"error": str(e)})


@mcp.tool()
async def recommend_suppliers(
    product_name: Annotated[str, "Product to source"],
    required_quantity: Annotated[float, "Quantity needed"],
    target_region: Annotated[str, "Preferred supplier region"] = "",
    max_lead_time_days: Annotated[float, "Maximum acceptable lead time in days"] = 30,
    existing_suppliers_json: Annotated[str, "JSON array of current suppliers. Each: {\"name\": \"...\", \"region\": \"...\", \"products\": [...], \"lead_time_days\": 7, \"unit_cost\": 0, \"reliability_score\": 0.5, \"minimum_order\": 0}"] = "[]",
) -> str:
    """Get AI-powered supplier recommendations and evaluate existing suppliers.

    Scores suppliers on reliability, cost, lead time, and regional advantages.
    Call this when the user needs to find new suppliers or evaluate current ones.
    """
    try:
        suppliers = [Supplier(**s) for s in json.loads(existing_suppliers_json)]
        result = await _recommend_suppliers(
            SupplierRecommendRequest(
                product_name=product_name,
                required_quantity=required_quantity,
                target_region=target_region,
                max_lead_time_days=max_lead_time_days,
                existing_suppliers=suppliers,
            )
        )
        return result.model_dump_json(indent=2)
    except json.JSONDecodeError as e:
        return json.dumps({"error": f"Invalid JSON: {e}"})
    except Exception as e:
        return json.dumps({"error": str(e)})

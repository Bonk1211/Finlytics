"""Demand prediction tool."""

import json
from typing import Annotated

from app.mcp_tools import mcp
from app.services.inventory import predict_demand as _predict_demand
from app.schemas.inventory import PredictRequest, SalesDataPoint


@mcp.tool()
async def predict_demand(
    product_name: Annotated[str, "Name of the product"],
    sales_history_json: Annotated[str, "JSON array of sales records (min 7). Each: {\"date\": \"2025-01-15\", \"quantity\": 100, \"price\": 5.0, \"category\": \"\", \"region\": \"\"}"],
    forecast_days: Annotated[int, "Number of days to forecast (1-365)"] = 30,
) -> str:
    """Predict future demand for a product based on historical sales data.

    Requires at least 7 historical data points. Returns daily forecasts with confidence
    intervals. Call this when the user wants demand forecasting or sales predictions.
    """
    try:
        history = [SalesDataPoint(**dp) for dp in json.loads(sales_history_json)]
        result = await _predict_demand(
            PredictRequest(
                product_name=product_name,
                sales_history=history,
                forecast_days=forecast_days,
            )
        )
        return result.model_dump_json(indent=2)
    except json.JSONDecodeError as e:
        return json.dumps({"error": f"Invalid JSON: {e}"})
    except Exception as e:
        return json.dumps({"error": str(e)})

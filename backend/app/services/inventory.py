"""Inventory Demand Prediction Service powered by Gemini.

Uses Gemini to analyze sales patterns and generate demand forecasts.
"""

import json
from app.schemas.inventory import PredictRequest, PredictResponse, ForecastPoint
from app.services.gemini_client import generate

SYSTEM_INSTRUCTION = """You are an expert inventory demand forecasting analyst for MSME businesses in ASEAN.

You will be given historical sales data and asked to predict future demand.

Analyze the data for:
- Trends (upward, downward, stable)
- Seasonal patterns
- Volatility

Respond in JSON format:
{
  "forecast": [
    {
      "date": "YYYY-MM-DD",
      "predicted_quantity": 105.0,
      "lower_bound": 90.0,
      "upper_bound": 120.0
    }
  ],
  "model_used": "gemini_analysis"
}

Rules:
- Generate exactly the requested number of forecast days.
- Continue dates sequentially from the last data point.
- Lower bound should be ~80% of predicted, upper bound ~120%.
- Base predictions on actual patterns in the data. Consider trends, averages, and variability.
- Use realistic values — don't just repeat the average.
"""


async def predict_demand(request: PredictRequest) -> PredictResponse:
    """Predict future demand based on sales history using Gemini analysis."""
    # Format sales data for Gemini
    sales_data_str = "\n".join(
        f"  {dp.date}: quantity={dp.quantity}"
        + (f", price={dp.price}" if dp.price else "")
        + (f", category={dp.category}" if dp.category else "")
        + (f", region={dp.region}" if dp.region else "")
        for dp in request.sales_history
    )

    prompt = f"""## Product: {request.product_name}

## Historical Sales Data
{sales_data_str}

## Request
Predict demand for the next {request.forecast_days} day(s) starting from the day after the last data point.

Respond in the JSON format specified."""

    raw_response = await generate(prompt, system_instruction=SYSTEM_INSTRUCTION)

    try:
        cleaned = raw_response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
            cleaned = cleaned.rsplit("```", 1)[0]
        parsed = json.loads(cleaned)

        forecast = [
            ForecastPoint(
                date=fp["date"],
                predicted_quantity=float(fp["predicted_quantity"]),
                lower_bound=float(fp["lower_bound"]),
                upper_bound=float(fp["upper_bound"]),
            )
            for fp in parsed.get("forecast", [])
        ]

        model_used = parsed.get("model_used", "gemini_analysis")

    except (json.JSONDecodeError, ValueError, KeyError):
        forecast = []
        model_used = "gemini_analysis"

    return PredictResponse(
        product_name=request.product_name,
        forecast=forecast,
        model_used=model_used,
    )

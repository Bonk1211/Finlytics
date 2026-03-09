"""Inventory Demand Prediction Service.

Currently returns mock forecasts. Swap in Prophet / XGBoost for production.
"""

import random
from datetime import datetime, timedelta

from app.schemas.inventory import PredictRequest, PredictResponse, ForecastPoint


async def predict_demand(request: PredictRequest) -> PredictResponse:
    """Predict future demand based on sales history (mock implementation)."""
    # Calculate baseline from historical data
    avg_quantity = sum(dp.quantity for dp in request.sales_history) / len(request.sales_history)

    # Generate mock forecast with slight trend and noise
    forecast: list[ForecastPoint] = []
    last_date = datetime.strptime(request.sales_history[-1].date, "%Y-%m-%d")

    for i in range(1, request.forecast_days + 1):
        forecast_date = last_date + timedelta(days=i)
        trend = 1 + (i * 0.002)  # slight upward trend
        noise = random.uniform(0.85, 1.15)
        predicted = round(avg_quantity * trend * noise, 1)

        forecast.append(
            ForecastPoint(
                date=forecast_date.strftime("%Y-%m-%d"),
                predicted_quantity=predicted,
                lower_bound=round(predicted * 0.8, 1),
                upper_bound=round(predicted * 1.2, 1),
            )
        )

    return PredictResponse(
        product_name=request.product_name,
        forecast=forecast,
        model_used="mock_prophet",
    )

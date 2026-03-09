from pydantic import BaseModel, Field


class SalesDataPoint(BaseModel):
    """A single sales data entry."""
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    quantity: float
    price: float | None = None
    category: str | None = None
    region: str | None = None


class PredictRequest(BaseModel):
    """Request to predict inventory demand."""
    product_name: str
    sales_history: list[SalesDataPoint] = Field(..., min_length=7, description="At least 7 data points")
    forecast_days: int = Field(30, ge=1, le=365)


class ForecastPoint(BaseModel):
    """A single forecast data point."""
    date: str
    predicted_quantity: float
    lower_bound: float
    upper_bound: float


class PredictResponse(BaseModel):
    """Response from inventory prediction."""
    product_name: str
    forecast: list[ForecastPoint]
    model_used: str = "prophet"

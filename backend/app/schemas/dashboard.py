from pydantic import BaseModel, Field


class BusinessMetrics(BaseModel):
    """Business performance data for dashboard generation."""
    business_name: str
    monthly_revenue: float = Field(ge=0)
    monthly_expenses: float = Field(ge=0, default=0)
    transaction_count: int = Field(ge=0, default=0)
    product_count: int = Field(ge=0, default=0)
    customer_count: int = Field(ge=0, default=0)
    top_products: list[str] = []
    operating_regions: list[str] = []
    years_in_business: float = Field(ge=0, default=0)
    credit_score: int | None = None
    inventory_health: str = ""  # healthy, attention_needed, critical


class KPI(BaseModel):
    """A key performance indicator."""
    name: str
    value: str
    trend: str  # up, down, stable
    description: str


class DashboardResponse(BaseModel):
    """Aggregated business dashboard overview."""
    business_name: str
    revenue_summary: str
    profit_margin: str
    loan_eligibility: str
    market_opportunities: list[str]
    kpis: list[KPI]
    action_items: list[str]
    ai_summary: str

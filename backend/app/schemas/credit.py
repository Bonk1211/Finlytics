from pydantic import BaseModel, Field


class CreditScoreRequest(BaseModel):
    """Request to evaluate MSME creditworthiness."""
    business_name: str
    monthly_revenue: float = Field(gt=0)
    transaction_count: int = Field(ge=0)
    inventory_turnover: float = Field(ge=0)
    customer_rating: float = Field(ge=0, le=5)
    payment_history_score: float = Field(ge=0, le=1, description="0 = worst, 1 = perfect")
    years_in_business: float = Field(ge=0)


class CreditScoreResponse(BaseModel):
    """Response from credit scoring."""
    business_name: str
    credit_score: int = Field(ge=300, le=850)
    risk_probability: float = Field(ge=0, le=1)
    risk_category: str  # low, medium, high
    loan_recommendation: str
    factors: list[str] = []

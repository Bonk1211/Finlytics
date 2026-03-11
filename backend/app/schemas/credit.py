from pydantic import BaseModel, Field


class ScoreBreakdownItem(BaseModel):
    """One weighted component used in transparent credit score calculation."""
    metric: str
    normalized_value: float = Field(ge=0, le=1)
    weight: float = Field(ge=0)
    contribution_points: float = Field(ge=0)


class CreditScoreRequest(BaseModel):
    """Request to evaluate MSME creditworthiness using alternative data."""
    business_name: str

    # Traditional metrics
    monthly_revenue: float = Field(gt=0)
    years_in_business: float = Field(ge=0)

    # Transaction data
    transaction_count: int = Field(ge=0, description="Monthly transaction count")
    digital_transaction_ratio: float = Field(
        ge=0, le=1, default=0.0,
        description="Ratio of digital vs cash transactions (0-1)",
    )

    # Mobile payment data
    mobile_payment_volume: float = Field(
        ge=0, default=0.0,
        description="Monthly mobile payment volume in USD",
    )

    # Inventory & operations
    inventory_turnover: float = Field(ge=0)

    # Supplier relationships
    supplier_count: int = Field(ge=0, default=0, description="Number of active suppliers")
    supplier_reliability_score: float = Field(
        ge=0, le=1, default=0.5,
        description="Average supplier reliability (0-1)",
    )

    # Customer & payment
    customer_rating: float = Field(ge=0, le=5)
    payment_history_score: float = Field(
        ge=0, le=1,
        description="0 = worst, 1 = perfect payment history",
    )


class CreditScoreResponse(BaseModel):
    """Response from credit scoring."""
    business_name: str
    credit_score: int = Field(ge=300, le=850)
    risk_probability: float = Field(ge=0, le=1)
    risk_category: str  # low, medium, high
    loan_recommendation: str
    max_loan_amount: float = Field(ge=0, description="Recommended max loan in USD")
    suggested_interest_rate: str = ""
    factors: list[str] = []
    # Explainability fields for judges/users.
    score_formula: str = ""
    baseline_formula_score: int = Field(ge=300, le=850, default=500)
    ai_adjustment: int = 0
    score_breakdown: list[ScoreBreakdownItem] = []
    score_calculation_steps: list[str] = []

from pydantic import BaseModel, Field


# --- Inventory Models ---

class InventoryItem(BaseModel):
    """A single inventory item."""
    product_name: str
    sku: str = ""
    current_quantity: float = Field(ge=0)
    unit: str = "units"
    reorder_point: float = Field(ge=0, description="Minimum stock before reorder needed")
    unit_cost: float = Field(ge=0, default=0)
    supplier_name: str = ""
    category: str = ""


class InventoryCheckRequest(BaseModel):
    """Request to analyze inventory levels and get reorder suggestions."""
    business_name: str
    inventory: list[InventoryItem] = Field(..., min_length=1)
    average_daily_sales: dict[str, float] = Field(
        default={},
        description="Map of product_name → average daily units sold",
    )


class ReorderSuggestion(BaseModel):
    """An AI-generated reorder suggestion."""
    product_name: str
    current_quantity: float
    reorder_point: float
    suggested_order_quantity: float
    urgency: str  # critical, high, medium, low
    estimated_days_until_stockout: float
    reason: str


class InventoryCheckResponse(BaseModel):
    """Response from inventory check analysis."""
    business_name: str
    total_items: int
    items_below_reorder: int
    reorder_suggestions: list[ReorderSuggestion]
    overall_health: str  # healthy, attention_needed, critical
    ai_summary: str


# --- Supplier Models ---

class Supplier(BaseModel):
    """A supplier profile."""
    name: str
    region: str = ""
    products: list[str] = []
    lead_time_days: float = Field(ge=0, default=7)
    unit_cost: float = Field(ge=0, default=0)
    reliability_score: float = Field(ge=0, le=1, default=0.5)
    minimum_order: float = Field(ge=0, default=0)


class SupplierRecommendRequest(BaseModel):
    """Request for supplier recommendations."""
    product_name: str
    required_quantity: float = Field(gt=0)
    target_region: str = ""
    max_lead_time_days: float = Field(ge=0, default=30)
    existing_suppliers: list[Supplier] = []


class SupplierRecommendation(BaseModel):
    """An AI-generated supplier recommendation."""
    supplier_name: str
    score: float = Field(ge=0, le=1)
    strengths: list[str]
    weaknesses: list[str]
    recommendation: str


class SupplierRecommendResponse(BaseModel):
    """Response from supplier recommendation."""
    product_name: str
    recommendations: list[SupplierRecommendation]
    ai_summary: str

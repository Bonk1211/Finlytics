from fastapi import APIRouter

from app.schemas.supply_chain import (
    InventoryCheckRequest, InventoryCheckResponse,
    SupplierRecommendRequest, SupplierRecommendResponse,
)
from app.services.supply_chain import check_inventory, recommend_suppliers

router = APIRouter(prefix="/supply-chain", tags=["Supply Chain & Inventory"])


@router.post("/check-inventory", response_model=InventoryCheckResponse)
async def check(request: InventoryCheckRequest):
    """Analyze inventory levels and get smart auto-reorder suggestions."""
    return await check_inventory(request)


@router.post("/recommend-suppliers", response_model=SupplierRecommendResponse)
async def recommend(request: SupplierRecommendRequest):
    """Get AI-powered supplier evaluations and recommendations."""
    return await recommend_suppliers(request)

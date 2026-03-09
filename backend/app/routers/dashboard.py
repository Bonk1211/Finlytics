from fastapi import APIRouter

from app.schemas.dashboard import BusinessMetrics, DashboardResponse
from app.services.dashboard import generate_dashboard

router = APIRouter(prefix="/dashboard", tags=["MSME Dashboard"])


@router.post("/summary", response_model=DashboardResponse)
async def summary(metrics: BusinessMetrics):
    """Generate an easy-to-understand business dashboard with KPIs, loan eligibility, and action items."""
    return await generate_dashboard(metrics)
